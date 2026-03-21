"""
Main FastAPI Application for LearnFlow
This is the entry point for the backend API
"""

from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Request, Body, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
from sqlalchemy import func
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from app.database import get_db, engine, Base
from app.models import User, Course, Enrollment, AuditLog
from app.schemas import (
    UserCreate,
    UserResponse,
    UserLogin,
    UserUpdate,
    Token,
    CourseCreate,
    CourseResponse,
    CourseUpdate,
    CourseListResponse,
    LessonCreate,
    LessonUpdate,
    ProgressUpdate,
    GoogleCallbackRequest,
)
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    require_admin,
    log_audit_event,
    get_google_oauth_url,
    authenticate_google_user,
)
from app.cloudinary_service import upload_media
from app.mongo_service import (
    create_lesson,
    get_course_lessons,
    update_lesson,
    delete_lesson,
    get_user_progress,
    update_lesson_progress,
    get_user_all_progress,
)

# Create database tables (in production, use Alembic migrations)
Base.metadata.create_all(bind=engine)

# ============== FASTAPI APP SETUP ==============

# Initialize FastAPI app
app = FastAPI(
    title="LearnFlow API",
    description="Learning Management System API with dual database architecture",
    version="1.0.0",
)

from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    err_trace = traceback.format_exc()
    return JSONResponse(status_code=500, content={"message": "Internal Server Error", "trace": err_trace, "error": str(exc)})

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter


# Rate limit exceeded handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Rate limit exceeded. Please try again later.",
            "retry_after": exc.detail,
        },
        headers={"Retry-After": str(exc.detail)},
    )


# Security scheme
security = HTTPBearer()


# ============== ROOT ENDPOINT ==============


@app.get("/")
def read_root():
    """Root endpoint - API health check"""
    return {"message": "Welcome to LearnFlow API", "version": "1.0.0", "docs": "/docs"}


# ============== AUTHENTICATION ENDPOINTS ==============


@app.post("/api/auth/register", response_model=Token)
@limiter.limit("5/minute")
def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user (learner or admin)
    Rate limited to 5 requests per minute
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        role=user_data.role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log the registration
    log_audit_event(
        db=db,
        action="user_registered",
        user_id=new_user.id,
        resource_type="user",
        resource_id=new_user.id,
        request=request,
    )

    # Create access token
    access_token = create_access_token(
        data={
            "user_id": new_user.id,
            "email": new_user.email,
            "role": new_user.role.value,
        }
    )

    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/auth/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login user and return JWT token
    Rate limited to 10 requests per minute to prevent brute force
    """
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated"
        )

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    # Log the login
    log_audit_event(db=db, action="user_login", user_id=user.id, request=request)

    # Create access token
    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role.value}
    )

    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user's information
    """
    return current_user


@app.put("/api/auth/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update current user's profile
    """
    if profile_data.first_name:
        current_user.first_name = profile_data.first_name
    if profile_data.last_name:
        current_user.last_name = profile_data.last_name
    if profile_data.avatar_url:
        current_user.avatar_url = profile_data.avatar_url

    db.commit()
    db.refresh(current_user)

    return current_user


# ============== GOOGLE OAUTH ENDPOINTS ==============

@app.get("/api/auth/google/url")
def get_google_auth_url():
    """
    Get Google OAuth authorization URL
    """
    google_url = get_google_oauth_url()
    return {"url": google_url}

@app.post("/api/auth/google/callback", response_model=Token)
@limiter.limit("10/minute")
async def google_oauth_callback(
    request: Request,
    google_request: GoogleCallbackRequest,
    db: Session = Depends(get_db),
):
    """
    Handle Google OAuth callback and authenticate/create user
    Rate limited to 10 requests per minute
    """
    try:
        user, access_token = await authenticate_google_user(db, google_request.code)

        # Log the OAuth login
        log_audit_event(
            db=db,
            action="google_oauth_login",
            user_id=user.id,
            resource_type="user",
            resource_id=user.id,
            request=request,
            details=f"Logged in via Google OAuth as {user.email}",
        )

        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google OAuth failed: {str(e)}",
        )


# ============== USER ENDPOINTS (Admin only) ==============


@app.get("/api/users", response_model=List[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 20,  # Default limit to prevent over-fetching
    role: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get all users (Admin only)
    """
    # Sanitize limit (max 50, min 1)
    limit = max(1, min(50, limit))
    # Sanitize skip (max 1000, min 0)
    skip = max(0, min(1000, skip))
    # Validate role filter
    allowed_roles = ["learner", "admin"]
    if role and role not in allowed_roles:
        role = None

    query = db.query(User)
    if role:
        query = query.filter(User.role == role)

    users = query.offset(skip).limit(limit).all()
    return users


@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get a specific user by ID (Admin only)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ============== COURSE ENDPOINTS ==============


@app.get("/api/courses", response_model=List[CourseListResponse])
def get_courses(
    category: Optional[str] = None,
    level: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,  # Default limit to prevent over-fetching
    db: Session = Depends(get_db),
):
    """
    Get all courses with optional filtering
    """
    # Validate and sanitize filter parameters
    allowed_categories = [
        "Programming",
        "Design",
        "Marketing",
        "Business",
        "Data Science",
    ]
    allowed_levels = ["Beginner", "Intermediate", "Advanced"]

    # Sanitize limit (max 50, min 1)
    limit = max(1, min(50, limit))
    # Sanitize skip (max 1000, min 0)
    skip = max(0, min(1000, skip))
    # Sanitize search (max 100 chars)
    if search:
        search = search.strip()[:100]
    # Validate category and level
    if category and category not in allowed_categories:
        category = None
    if level and level not in allowed_levels:
        level = None

    query = db.query(Course)

    if category:
        query = query.filter(Course.category == category)
    if level:
        query = query.filter(Course.level == level)
    if search:
        query = query.filter(
            Course.title.ilike(f"%{search}%") | Course.description.ilike(f"%{search}%")
        )

    courses = query.offset(skip).limit(limit).all()
    return courses


@app.get("/api/courses/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """
    Get a specific course by ID
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    course_data = course.to_dict()
    
    # Enrich course response with MongoDB lessons and instructor details
    lessons = get_course_lessons(course_id)
    course_data["lessons"] = lessons
    course_data["lessonsCount"] = len(lessons)
    
    instructor = db.query(User).filter(User.id == course.instructor_id).first()
    if instructor:
        course_data["instructor"] = f"{instructor.first_name} {instructor.last_name}"
        course_data["instructorAvatar"] = instructor.avatar_url
    
    # Mock remaining UI aggregate values
    course_data["rating"] = 4.5
    course_data["enrolledStudents"] = 0
    
    return course_data


@app.post("/api/courses", response_model=CourseResponse)
def create_course(
    course_data: CourseCreate,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Create a new course (Admin only)
    """
    new_course = Course(
        title=course_data.title,
        description=course_data.description,
        category=course_data.category,
        level=course_data.level,
        duration=course_data.duration,
        price=course_data.price,
        thumbnail_url=course_data.thumbnail_url,
        instructor_id=current_user.id,
        is_published=False,
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    # Log the action
    log_audit_event(
        db=db,
        action="course_created",
        user_id=current_user.id,
        resource_type="course",
        resource_id=new_course.id,
        request=request,
    )

    return new_course


@app.put("/api/courses/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    course_data: CourseUpdate,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Update a course (Admin only)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    update_data = course_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)

    # Log the action
    log_audit_event(
        db=db,
        action="course_updated",
        user_id=current_user.id,
        resource_type="course",
        resource_id=course.id,
        request=request,
    )

    return course


@app.delete("/api/courses/{course_id}")
def delete_course(
    course_id: int,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Delete a course (Admin only)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Delete associated lessons from MongoDB
    from app.mongo_service import delete_course_lessons

    delete_course_lessons(course_id)

    db.delete(course)
    db.commit()

    # Log the action
    log_audit_event(
        db=db,
        action="course_deleted",
        user_id=current_user.id,
        resource_type="course",
        resource_id=course_id,
        request=request,
    )

    return {"message": "Course deleted successfully"}


@app.get("/api/categories")
def get_categories(db: Session = Depends(get_db)):
    """
    Get all unique course categories
    """
    categories = db.query(Course.category).distinct().all()
    return [cat[0] for cat in categories]


# ============== LESSON ENDPOINTS (MongoDB) ==============


@app.post("/api/courses/{course_id}/lessons")
def add_lesson(
    course_id: int,
    lesson_data: LessonCreate,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Add a lesson to a course (Admin only)
    Lessons are stored in MongoDB
    """
    # Verify course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Create lesson in MongoDB
    lesson_id = create_lesson(course_id, lesson_data.dict())

    # Log the action
    log_audit_event(
        db=db,
        action="lesson_created",
        user_id=current_user.id,
        resource_type="lesson",
        request=request,
    )

    return {"message": "Lesson created successfully", "lesson_id": lesson_id}


@app.get("/api/courses/{course_id}/lessons")
def get_lessons(course_id: int, db: Session = Depends(get_db)):
    """
    Get all lessons for a course
    Lessons are retrieved from MongoDB
    """
    # Verify course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    lessons = get_course_lessons(course_id)
    return lessons


@app.put("/api/courses/{course_id}/lessons/{lesson_id}")
def edit_lesson(
    course_id: int,
    lesson_id: str,
    lesson_data: LessonUpdate,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Update a lesson (Admin only)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    success = update_lesson(lesson_id, lesson_data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Lesson not found")

    log_audit_event(
        db=db,
        action="lesson_updated",
        user_id=current_user.id,
        resource_type="lesson",
        resource_id=lesson_id,
        request=request,
    )

    return {"message": "Lesson updated successfully"}


@app.delete("/api/courses/{course_id}/lessons/{lesson_id}")
def remove_lesson(
    course_id: int,
    lesson_id: str,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Delete a lesson (Admin only)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    success = delete_lesson(lesson_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lesson not found")

    log_audit_event(
        db=db,
        action="lesson_deleted",
        user_id=current_user.id,
        resource_type="lesson",
        resource_id=lesson_id,
        request=request,
    )

    return {"message": "Lesson deleted successfully"}


# ============== PROGRESS ENDPOINTS (MongoDB) ==============


@app.get("/api/courses/{course_id}/progress")
def get_course_progress(course_id: int, current_user: User = Depends(get_current_user)):
    """
    Get current user's progress for a course
    Progress is stored in MongoDB
    """
    progress = get_user_progress(current_user.id, course_id)
    return progress


@app.post("/api/courses/{course_id}/progress")
def update_progress(
    course_id: int,
    progress_data: ProgressUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update lesson progress for current user
    Progress is stored in MongoDB
    """
    progress = update_lesson_progress(
        current_user.id, course_id, progress_data.lesson_id, progress_data.completed
    )

    # Log the action
    log_audit_event(
        db=db,
        action="lesson_completed" if progress_data.completed else "lesson_incomplete",
        user_id=current_user.id,
        resource_type="lesson",
        request=request,
    )

    return progress


@app.get("/api/my-progress")
def get_my_progress(current_user: User = Depends(get_current_user)):
    """
    Get all progress records for current user
    """
    progress_list = get_user_all_progress(current_user.id)
    return progress_list


# ============== ENROLLMENT ENDPOINTS ==============


@app.post("/api/courses/{course_id}/enroll")
def enroll_in_course(
    course_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Enroll current user in a course
    """
    # Check if already enrolled
    existing = (
        db.query(Enrollment)
        .filter(
            Enrollment.user_id == current_user.id, Enrollment.course_id == course_id
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    # Verify course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Create enrollment
    enrollment = Enrollment(user_id=current_user.id, course_id=course_id)

    db.add(enrollment)
    db.commit()

    # Log the action
    log_audit_event(
        db=db,
        action="course_enrolled",
        user_id=current_user.id,
        resource_type="course",
        resource_id=course_id,
        request=request,
    )

    return {"message": "Enrolled successfully"}


# ============== AUDIT LOG ENDPOINTS (Admin only) ==============


@app.get("/api/audit-logs")
def get_audit_logs(
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    limit: int = 50,  # Default limit to prevent over-fetching
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get audit logs (Admin only)
    """
    # Sanitize limit (max 100, min 1)
    limit = max(1, min(100, limit))
    # Validate action filter (only allow specific actions)
    allowed_actions = [
        "user_registered",
        "user_login",
        "course_created",
        "course_updated",
        "course_deleted",
        "lesson_created",
        "lesson_completed",
        "lesson_incomplete",
        "course_enrolled",
    ]
    if action and action not in allowed_actions:
        action = None

    query = db.query(AuditLog)

    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if action:
        query = query.filter(AuditLog.action == action)

    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()

    return logs


# ============== HEALTH CHECK ==============


@app.get("/api/health")
def health_check():
    """
    Health check endpoint for monitoring
    """
    return {
        "status": "healthy",
        "databases": {"postgresql": "connected", "mongodb": "connected"},
    }


# ============== ANALYTICS ENDPOINTS (Admin only) ==============


@app.get("/api/analytics/stats")
def get_analytics_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get analytics statistics for admin dashboard
    """
    # Total users
    total_users = db.query(User).count()

    # Total courses
    total_courses = db.query(Course).count()

    # Total enrollments
    total_enrollments = db.query(Enrollment).count()

    # Active users (users with enrollments)
    active_users = db.query(Enrollment.user_id).distinct().count()

    # Published courses
    published_courses = db.query(Course).filter(Course.is_published).count()

    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "active_users": active_users,
        "published_courses": published_courses,
    }


@app.get("/api/analytics/categories")
def get_category_distribution(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get course distribution by category
    """
    # Get count per category
    categories = (
        db.query(Course.category, func.count(Course.id).label("count"))
        .group_by(Course.category)
        .all()
    )

    total = sum(cat.count for cat in categories) if categories else 1

    # Calculate percentages
    result = []
    for cat in categories:
        percentage = round((cat.count / total) * 100) if total > 0 else 0
        result.append(
            {
                "name": cat.category or "Uncategorized",
                "count": cat.count,
                "percentage": percentage,
            }
        )

    return result


# ============== MEDIA UPLOAD ENDPOINTS ==============

@app.post("/api/upload")
async def upload_course_media(
    file: UploadFile = File(...),
    current_user: User = Depends(require_admin)
):
    """
    Upload media to Cloudinary (Admins only)
    """
    try:
        # Pass the file to Cloudinary service
        result = upload_media(file)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process upload: {str(e)}"
        )


# ============== LEARNER DASHBOARD ENDPOINTS ==============


@app.get("/api/learner/stats")
def get_learner_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get learner dashboard statistics
    """
    # Get enrollments for this user
    enrollments = (
        db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()
    )

    # Courses in progress (enrolled but not completed)
    courses_in_progress = len([e for e in enrollments if not e.completed_at])

    # Courses completed
    courses_completed = len([e for e in enrollments if e.completed_at])

    # Get progress from MongoDB
    progress_list = get_user_all_progress(current_user.id)

    # Calculate total lessons completed
    lessons_completed = sum(len(p.get("completed_lessons", [])) for p in progress_list)

    return {
        "courses_in_progress": courses_in_progress,
        "courses_completed": courses_completed,
        "lessons_completed": lessons_completed,
        "total_enrolled": len(enrollments),
    }


@app.get("/api/learner/enrollments")
def get_learner_enrollments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all courses the learner is enrolled in with progress
    """
    enrollments = (
        db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()
    )

    result = []
    for enrollment in enrollments:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if course:
            # Get progress from MongoDB
            progress = get_user_progress(current_user.id, enrollment.course_id)

            # Get lessons for this course
            lessons = get_course_lessons(enrollment.course_id)
            total_lessons = len(lessons) if lessons else 0
            completed_lessons = (
                len(progress.get("completed_lessons", [])) if progress else 0
            )

            progress_percentage = (
                int((completed_lessons / total_lessons * 100))
                if total_lessons > 0
                else 0
            )

            result.append(
                {
                    "id": course.id,
                    "title": course.title,
                    "description": course.description,
                    "category": course.category,
                    "level": course.level,
                    "duration": course.duration,
                    "thumbnail_url": course.thumbnail_url,
                    "enrolled_at": enrollment.enrolled_at.isoformat()
                    if enrollment.enrolled_at
                    else None,
                    "completed_at": enrollment.completed_at.isoformat()
                    if enrollment.completed_at
                    else None,
                    "total_lessons": total_lessons,
                    "completed_lessons": completed_lessons,
                    "progress_percentage": progress_percentage,
                    "is_completed": enrollment.completed_at is not None,
                }
            )

    return result
