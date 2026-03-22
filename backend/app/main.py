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
from sqlalchemy import func, or_, and_
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from app.database import get_db, engine, Base
from app.models import User, Course, Enrollment, AuditLog, Comment, CommentVote, DirectMessage
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
    CommentCreate,
    CommentResponse,
    VoteAction,
    ProgressTelemetry,
    DirectMessageCreate,
)
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    get_optional_user,
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
    response = JSONResponse(status_code=500, content={"message": "Internal Server Error", "trace": err_trace, "error": str(exc)})
    # Add CORS headers to error responses
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

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


# ============== COURSE ENDPOINTS WITH ENROLLMENT COUNTS ==============


@app.get("/api/courses/with-enrollments")
def get_courses_with_enrollments(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get all courses with enrollment counts (for admin dashboard)
    """
    courses = db.query(Course).all()
    
    result = []
    for course in courses:
        enrollments = db.query(Enrollment).filter(Enrollment.course_id == course.id).all()
        result.append({
            "id": course.id,
            "title": course.title,
            "category": course.category,
            "level": course.level,
            "is_published": course.is_published,
            "created_at": course.created_at.isoformat() if course.created_at else None,
            "enrollments": len(enrollments),
            "thumbnail_url": course.thumbnail_url,
            "duration": course.duration,
        })
    
    return result


# ============== COURSE ENDPOINTS ==============


@app.get("/api/courses", response_model=List[CourseListResponse])
def get_courses(
    category: Optional[str] = None,
    level: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,  # Default limit to prevent over-fetching
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
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
    
    # Check enrollment
    enrolled_course_ids = []
    if current_user:
        enrolled = db.query(Enrollment.course_id).filter(Enrollment.user_id == current_user.id).all()
        enrolled_course_ids = [e[0] for e in enrolled]

    for course in courses:
        course.is_enrolled = course.id in enrolled_course_ids

    return courses


@app.get("/api/courses/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
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
    # Check enrollment
    is_enrolled = False
    if current_user:
        enrollment = db.query(Enrollment).filter(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id == course_id
        ).first()
        is_enrolled = enrollment is not None
    
    course_data["is_enrolled"] = is_enrolled
    
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
        thumbnail_url=course_data.thumbnail_url,
        banner_url=course_data.banner_url,
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
    from datetime import datetime
    for key, value in update_data.items():
        if value is not None:
            setattr(course, key, value)
            
    # Set updated_at since SQLAlchemy doesn't auto-update it if columns are dynamically set
    course.updated_at = datetime.utcnow()

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


@app.delete("/api/courses/{course_id}/unenroll")
def unenroll_from_course(
    course_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Unenroll current user from a course and clear progress
    """
    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.user_id == current_user.id, Enrollment.course_id == course_id
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    # Clear progress in MongoDB
    from app.mongo_service import user_progress_collection
    user_progress_collection.delete_one({"user_id": current_user.id, "course_id": course_id})

    db.delete(enrollment)
    db.commit()

    # Log the action
    log_audit_event(
        db=db,
        action="course_unenrolled",
        user_id=current_user.id,
        resource_type="course",
        resource_id=course_id,
        request=request,
    )

    return {"message": "Unenrolled successfully"}


# ============== REPORT GENERATION ENDPOINTS ==============


@app.get("/api/reports/courses")
def get_course_report(
    category: str = None,
    level: str = None,
    date_from: str = None,
    date_to: str = None,
    limit: int = 10,  # Options: 5, 10, 20, 30, 50
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Generate course report with filters
    """
    from datetime import datetime
    
    # Validate limit parameter
    allowed_limits = [5, 10, 20, 30, 50]
    if limit not in allowed_limits:
        limit = 10
    
    query = db.query(Course)
    
    # Apply filters
    if category:
        query = query.filter(Course.category == category)
    if level:
        query = query.filter(Course.level == level)
    if date_from:
        try:
            from_date = datetime.strptime(date_from, "%Y-%m-%d")
            query = query.filter(Course.created_at >= from_date)
        except ValueError:
            pass
    if date_to:
        try:
            to_date = datetime.strptime(date_to, "%Y-%m-%d")
            query = query.filter(Course.created_at <= to_date)
        except ValueError:
            pass
    
    courses = query.all()
    
    # Get enrollment counts for each course
    course_data = []
    for course in courses:
        enrollments = db.query(Enrollment).filter(Enrollment.course_id == course.id).all()
        completed_count = len([e for e in enrollments if e.completed_at])
        
        course_data.append({
            "id": course.id,
            "title": course.title,
            "category": course.category,
            "level": course.level,
            "is_published": course.is_published,
            "created_at": course.created_at.isoformat() if course.created_at else None,
            "total_enrollments": len(enrollments),
            "completed_enrollments": completed_count,
            "completion_rate": round((completed_count / len(enrollments) * 100), 1) if enrollments else 0,
        })
    
    return {
        "total_courses": len(course_data),
        "courses": course_data,
    }


@app.get("/api/reports/students")
def get_student_report(
    course_id: int = None,
    date_from: str = None,
    date_to: str = None,
    status: str = None,  # enrolled, completed, in_progress
    limit: int = 10,  # Options: 5, 10, 20, 30, 50
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Generate student report with filters
    """
    from datetime import datetime
    
    # Validate limit parameter
    allowed_limits = [5, 10, 20, 30, 50]
    if limit not in allowed_limits:
        limit = 10
    
    query = db.query(Enrollment)
    
    # Join with user and course
    query = query.join(User, Enrollment.user_id == User.id)
    query = query.join(Course, Enrollment.course_id == Course.id)
    
    # Apply filters
    if course_id:
        query = query.filter(Enrollment.course_id == course_id)
    if date_from:
        try:
            from_date = datetime.strptime(date_from, "%Y-%m-%d")
            query = query.filter(Enrollment.enrolled_at >= from_date)
        except ValueError:
            pass
    if date_to:
        try:
            to_date = datetime.strptime(date_to, "%Y-%m-%d")
            query = query.filter(Enrollment.enrolled_at <= to_date)
        except ValueError:
            pass
    if status == "completed":
        query = query.filter(Enrollment.completed_at.isnot(None))
    elif status == "in_progress":
        query = query.filter(
            Enrollment.completed_at.is_(None),
            Enrollment.progress > 0
        )
    elif status == "enrolled":
        query = query.filter(Enrollment.progress == 0)
    
    enrollments = query.limit(limit).all()
    
    # Build student data
    student_data = []
    for enroll in enrollments:
        user = db.query(User).filter(User.id == enroll.user_id).first()
        course = db.query(Course).filter(Course.id == enroll.course_id).first()
        
        if user and course:
            student_data.append({
                "id": enroll.id,
                "student_id": user.id,
                "student_name": user.full_name or user.email,
                "student_email": user.email,
                "course_id": course.id,
                "course_title": course.title,
                "enrolled_at": enroll.enrolled_at.isoformat() if enroll.enrolled_at else None,
                "completed_at": enroll.completed_at.isoformat() if enroll.completed_at else None,
                "progress": enroll.progress,
                "status": "completed" if enroll.completed_at else ("in_progress" if enroll.progress > 0 else "enrolled"),
            })
    
    return {
        "total_students": len(set([s["student_id"] for s in student_data])),
        "total_enrollments": len(student_data),
        "students": student_data,
    }


@app.get("/api/reports/users")
def get_user_report(
    role: str = None,
    date_from: str = None,
    date_to: str = None,
    limit: int = 10,  # Options: 5, 10, 20, 30, 50
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Generate user report with filters
    """
    from datetime import datetime
    
    # Validate limit parameter
    allowed_limits = [5, 10, 20, 30, 50]
    if limit not in allowed_limits:
        limit = 10
    
    query = db.query(User)
    
    # Apply filters
    if role:
        query = query.filter(User.role == role)
    if date_from:
        try:
            from_date = datetime.strptime(date_from, "%Y-%m-%d")
            query = query.filter(User.created_at >= from_date)
        except ValueError:
            pass
    if date_to:
        try:
            to_date = datetime.strptime(date_to, "%Y-%m-%d")
            query = query.filter(User.created_at <= to_date)
        except ValueError:
            pass
    
    users = query.all()
    
    # Get enrollment count for each user
    user_data = []
    for user in users:
        enrollments = db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
        completed = len([e for e in enrollments if e.completed_at])
        
        user_data.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "total_courses_enrolled": len(enrollments),
            "courses_completed": completed,
        })
    
    return {
        "total_users": len(user_data),
        "users": user_data,
    }


@app.get("/api/reports/activity")
def get_activity_report(
    date_from: str = None,
    date_to: str = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Generate activity report - shows recent user activities
    """
    from datetime import datetime, timedelta
    
    # Default to last 30 days
    if not date_to:
        end_date = datetime.utcnow()
    else:
        try:
            end_date = datetime.strptime(date_to, "%Y-%m-%d")
        except ValueError:
            end_date = datetime.utcnow()
    
    if not date_from:
        start_date = end_date - timedelta(days=30)
    else:
        try:
            start_date = datetime.strptime(date_from, "%Y-%m-%d")
        except ValueError:
            start_date = end_date - timedelta(days=30)
    
    # Get new users in period
    new_users = db.query(User).filter(
        User.created_at >= start_date,
        User.created_at <= end_date
    ).all()
    
    # Get new enrollments in period
    new_enrollments = db.query(Enrollment).filter(
        Enrollment.enrolled_at >= start_date,
        Enrollment.enrolled_at <= end_date
    ).all()
    
    # Get completions in period
    completions = db.query(Enrollment).filter(
        Enrollment.completed_at >= start_date,
        Enrollment.completed_at <= end_date
    ).all()
    
    # Get new courses in period
    new_courses = db.query(Course).filter(
        Course.created_at >= start_date,
        Course.created_at <= end_date
    ).all()
    
    return {
        "period": {
            "from": start_date.isoformat(),
            "to": end_date.isoformat(),
        },
        "new_users": len(new_users),
        "new_enrollments": len(new_enrollments),
        "course_completions": len(completions),
        "new_courses": len(new_courses),
        "recent_users": [
            {
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in sorted(new_users, key=lambda x: x.created_at, reverse=True)[:10]
        ],
        "recent_enrollments": [
            {
                "id": e.id,
                "user_id": e.user_id,
                "course_id": e.course_id,
                "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None,
            }
            for e in sorted(new_enrollments, key=lambda x: x.enrolled_at, reverse=True)[:10]
        ],
    }


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


# ============== ANALYTICS TRENDS ENDPOINTS ==============


@app.get("/api/analytics/enrollment-trends")
def get_enrollment_trends(
    days: int = 30,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get enrollment trends over time
    """
    from datetime import datetime, timedelta
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get enrollments grouped by date
    enrollments = (
        db.query(
            func.date(Enrollment.enrolled_at).label("date"),
            func.count(Enrollment.id).label("count")
        )
        .filter(Enrollment.enrolled_at >= start_date)
        .group_by(func.date(Enrollment.enrolled_at))
        .all()
    )
    
    # Get completions grouped by date
    completions = (
        db.query(
            func.date(Enrollment.completed_at).label("date"),
            func.count(Enrollment.id).label("count")
        )
        .filter(Enrollment.completed_at >= start_date)
        .group_by(func.date(Enrollment.completed_at))
        .all()
    )
    
    # Convert to dict for easy lookup
    enrollment_dict = {str(e.date): e.count for e in enrollments}
    completion_dict = {str(c.date): c.count for c in completions}
    
    # Generate all dates in range
    result = []
    current = start_date
    while current <= end_date:
        date_str = current.strftime("%Y-%m-%d")
        result.append({
            "date": date_str,
            "enrollments": enrollment_dict.get(date_str, 0),
            "completions": completion_dict.get(date_str, 0),
        })
        current += timedelta(days=1)
    
    return result


@app.get("/api/analytics/user-growth")
def get_user_growth(
    months: int = 6,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get user growth over time
    """
    from datetime import datetime, timedelta
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=months * 30)
    
    # Get users grouped by month
    users = (
        db.query(
            func.strftime("%Y-%m", User.created_at).label("month"),
            func.count(User.id).label("count")
        )
        .filter(User.created_at >= start_date)
        .group_by(func.strftime("%Y-%m", User.created_at))
        .all()
    )
    
    # Convert to list
    result = []
    running_total = 0
    for u in users:
        running_total += u.count
        result.append({
            "month": u.month,
            "new_users": u.count,
            "total_users": running_total,
        })
    
    return result


@app.get("/api/analytics/insights")
def get_platform_insights(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get platform insights - average lesson views, completion rates, etc.
    """
    from app.mongo_service import get_db as get_mongo_db
    
    # Get total enrollments
    total_enrollments = db.query(Enrollment).count()
    
    # Get completed enrollments
    completed_enrollments = db.query(Enrollment).filter(
        Enrollment.completed_at.isnot(None)
    ).count()
    
    # Calculate completion rate
    completion_rate = round((completed_enrollments / total_enrollments * 100), 1) if total_enrollments > 0 else 0
    
    # Get lesson progress from MongoDB
    mongo_db = get_mongo_db()
    total_lessons_viewed = 0
    if "lesson_progress" in mongo_db.list_collection_names():
        total_lessons_viewed = mongo_db.lesson_progress.count_documents({})
    
    # Average lesson views per course
    total_courses = db.query(Course).count()
    avg_lesson_views = round(total_lessons_viewed / total_courses, 1) if total_courses > 0 else 0
    
    return {
        "avg_lesson_views": avg_lesson_views,
        "completion_rate": completion_rate,
        "total_lessons_viewed": total_lessons_viewed,
        "total_enrollments": total_enrollments,
        "completed_enrollments": completed_enrollments,
    }


# ============== DISCUSSION ENDPOINTS ==============


@app.get("/api/courses/{course_id}/discussions", response_model=List[CommentResponse])
def get_course_discussions(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all discussions for a course. Admin/Course Creators see private posts. Learners see public + their own.
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    is_admin = current_user.role == "admin"
    is_creator = course.instructor_id == current_user.id
    
    query = db.query(Comment).filter(Comment.course_id == course_id)
    
    if not (is_admin or is_creator):
        query = query.filter((Comment.is_private == False) | (Comment.user_id == current_user.id))
        
    comments = query.order_by(Comment.created_at.desc()).all()
    
    results = []
    for c in comments:
        # Calculate votes
        upvotes = sum(1 for v in c.votes if v.vote_type == 1)
        downvotes = sum(1 for v in c.votes if v.vote_type == -1)
        
        # User vote
        user_vote = next((v.vote_type for v in c.votes if v.user_id == current_user.id), 0)
        
        # Build response
        response_dict = {
            "id": c.id,
            "course_id": c.course_id,
            "user_id": c.user_id,
            "author_name": c.author.full_name,
            "author_avatar": c.author.avatar_url,
            "content": c.content,
            "is_private": c.is_private,
            "created_at": c.created_at,
            "upvotes": upvotes,
            "downvotes": downvotes if (is_admin or is_creator) else None,
            "user_vote": user_vote
        }
        results.append(response_dict)
        
    return results


@app.post("/api/courses/{course_id}/discussions", response_model=CommentResponse)
def create_discussion(
    course_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.is_blocked:
        raise HTTPException(status_code=403, detail="Your account is blocked from posting comments.")
        
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    new_comment = Comment(
        course_id=course_id,
        user_id=current_user.id,
        content=comment_data.content,
        is_private=comment_data.is_private,
        lesson_id=comment_data.lesson_id,
        parent_id=comment_data.parent_id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return {
        "id": new_comment.id,
        "course_id": new_comment.course_id,
        "user_id": new_comment.user_id,
        "author_name": current_user.full_name,
        "author_avatar": current_user.avatar_url,
        "content": new_comment.content,
        "is_private": new_comment.is_private,
        "created_at": new_comment.created_at,
        "upvotes": 0,
        "downvotes": None if current_user.role != "admin" else 0,
        "user_vote": 0
    }


@app.post("/api/discussions/{comment_id}/vote")
def vote_on_discussion(
    comment_id: int,
    vote_data: VoteAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.is_blocked:
        raise HTTPException(status_code=403, detail="Your account is blocked.")
        
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    existing_vote = db.query(CommentVote).filter(
        CommentVote.comment_id == comment_id, 
        CommentVote.user_id == current_user.id
    ).first()
    
    if existing_vote:
        if existing_vote.vote_type == vote_data.vote_type:
            # Clicking same vote removes it
            db.delete(existing_vote)
            message = "Vote removed"
        else:
            # Toggle vote
            existing_vote.vote_type = vote_data.vote_type
            message = "Vote updated"
    else:
        new_vote = CommentVote(
            comment_id=comment_id,
            user_id=current_user.id,
            vote_type=vote_data.vote_type
        )
        db.add(new_vote)
        message = "Vote registered"
        
    db.commit()
    return {"message": message}


@app.delete("/api/discussions/{comment_id}")
def delete_discussion(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted successfully"}


@app.put("/api/discussions/{comment_id}", response_model=CommentResponse)
def update_discussion(
    comment_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to edit this comment")
        
    comment.content = comment_data.content
    comment.is_private = comment_data.is_private
    db.commit()
    db.refresh(comment)
    
    return comment


@app.get("/api/admin/messages", response_model=List[CommentResponse])
def get_admin_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Get all private messages across the platform (Admin only)
    """
    messages = db.query(Comment).filter(Comment.is_private == True).order_by(Comment.created_at.desc()).all()
    
    from app.mongo_service import course_content_collection
    from bson import ObjectId

    results = []
    for m in messages:
        # Get lesson title from MongoDB if lesson_id exists
        lesson_title = "General Course Query"
        if m.lesson_id:
            lesson = course_content_collection.find_one({"_id": ObjectId(m.lesson_id)})
            if lesson:
                lesson_title = lesson.get("title", lesson_title)
        
        results.append({
            "id": m.id,
            "course_id": m.course_id,
            "course_title": m.course.title,
            "user_id": m.user_id,
            "author_name": m.author.full_name,
            "author_avatar": m.author.avatar_url,
            "content": m.content,
            "is_private": m.is_private,
            "lesson_id": m.lesson_id,
            "lesson_title": lesson_title,
            "parent_id": m.parent_id,
            "created_at": m.created_at,
            "upvotes": 0,
            "downvotes": 0,
            "user_vote": 0
        })
    return results


@app.get("/api/my-messages", response_model=List[CommentResponse])
def get_learner_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all private messages for the current learner (Inquiries + Replies)
    """
    # Fetch messages sent by user OR replies to user's messages
    # This is a simple implementation: fetch user's private messages and their threads
    my_dms = db.query(Comment).filter(
        (Comment.user_id == current_user.id) & (Comment.is_private == True)
    ).all()
    
    my_dm_ids = [m.id for m in my_dms]
    replies = db.query(Comment).filter(Comment.parent_id.in_(my_dm_ids)).all() if my_dm_ids else []
    
    all_messages = sorted(my_dms + replies, key=lambda x: x.created_at, reverse=True)
    
    from app.mongo_service import course_content_collection
    from bson import ObjectId

    results = []
    for m in all_messages:
        lesson_title = "General"
        if m.lesson_id:
            lesson = course_content_collection.find_one({"_id": ObjectId(m.lesson_id)})
            if lesson:
                lesson_title = lesson.get("title", "General")

        results.append({
            "id": m.id,
            "course_id": m.course_id,
            "course_title": m.course.title,
            "user_id": m.user_id,
            "author_name": m.author.full_name,
            "author_avatar": m.author.avatar_url,
            "content": m.content,
            "is_private": m.is_private,
            "lesson_id": m.lesson_id,
            "lesson_title": lesson_title,
            "parent_id": m.parent_id,
            "created_at": m.created_at,
            "upvotes": 0,
            "downvotes": 0,
            "user_vote": 0
        })
    return results


@app.post("/api/discussions/{comment_id}/reply")
def reply_to_message(
    comment_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Admin reply to a private message
    """
    parent = db.query(Comment).filter(Comment.id == comment_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Message thread not found")
        
    new_reply = Comment(
        course_id=parent.course_id,
        user_id=current_user.id,
        content=comment_data.content,
        is_private=True,
        lesson_id=parent.lesson_id,
        parent_id=comment_id
    )
    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)
    return {"message": "Reply sent successfully"}


@app.get("/api/admin/students/{user_id}/stats")
def get_student_detailed_stats(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Get detailed student interaction statistics for Admins
    """
    student = db.query(User).filter(User.id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    from app.mongo_service import user_progress_collection, get_course_lessons
    
    progress_docs = list(user_progress_collection.find({"user_id": user_id}))
    
    course_stats = []
    total_hours = 0
    
    for p in progress_docs:
        course_id = p.get("course_id")
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            continue
            
        lessons = get_course_lessons(course_id)
        total_lessons = len(lessons)
        completed_lessons = p.get("completed_lessons", [])
        lesson_times = p.get("lesson_times", {})
        total_seconds = p.get("total_seconds_spent", 0)
        
        total_hours += total_seconds / 3600
        
        module_breakdown = []
        for l in lessons:
            module_breakdown.append({
                "lesson_id": l["id"],
                "title": l["title"],
                "completed": l["id"] in completed_lessons,
                "seconds_spent": lesson_times.get(l["id"], 0)
            })
            
        course_stats.append({
            "course_id": course.id,
            "course_title": course.title,
            "progress_percentage": (len(completed_lessons) / total_lessons * 100) if total_lessons > 0 else 0,
            "total_seconds_spent": total_seconds,
            "modules": module_breakdown
        })
        
    return {
        "student": {
            "id": student.id,
            "name": student.full_name,
            "email": student.email,
            "avatar": student.avatar_url
        },
        "total_hours_spent": round(total_hours, 2),
        "courses": course_stats
    }


@app.post("/api/users/{user_id}/block")
def toggle_block_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_blocked = not user.is_blocked
    db.commit()
    
    status = "blocked" if user.is_blocked else "unblocked"
    return {"message": f"User successfully {status}", "is_blocked": user.is_blocked}


@app.put("/api/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Update user role (Admin only)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_role = role_data.get("role")
    if new_role not in ["admin", "learner"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'admin' or 'learner'")
    
    # Prevent demoting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot change your own role")
    
    from app.models import UserRole
    user.role = UserRole(new_role)
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"User role updated to {new_role}",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role.value
        }
    }


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


# ============== CHAT ENDPOINTS ==============


@app.get("/api/chat-partners")
def get_chat_partners(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get available chat partners:
    - Admin sees all active learners
    - Learner sees all active admins
    """
    from app.models import UserRole as ModelUserRole

    if current_user.role == ModelUserRole.ADMIN:
        partners = db.query(User).filter(
            User.role == ModelUserRole.LEARNER, User.is_active == True
        ).all()
    else:
        partners = db.query(User).filter(
            User.role == ModelUserRole.ADMIN, User.is_active == True
        ).all()

    return [
        {
            "id": p.id,
            "name": p.full_name,
            "avatar": p.avatar_url,
            "role": p.role.value,
        }
        for p in partners
    ]


@app.get("/api/chats")
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all conversation summaries for the current user.
    Returns a list of unique partners with the last message and unread count.
    """
    messages = (
        db.query(DirectMessage)
        .filter(
            or_(
                DirectMessage.sender_id == current_user.id,
                DirectMessage.receiver_id == current_user.id,
            )
        )
        .order_by(DirectMessage.created_at.desc())
        .all()
    )

    seen_partners: dict = {}
    for msg in messages:
        partner_id = (
            msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
        )
        if partner_id not in seen_partners:
            partner = db.query(User).filter(User.id == partner_id).first()
            if not partner:
                continue
            unread = (
                db.query(DirectMessage)
                .filter(
                    DirectMessage.sender_id == partner_id,
                    DirectMessage.receiver_id == current_user.id,
                    DirectMessage.is_read == False,
                )
                .count()
            )
            seen_partners[partner_id] = {
                "partner_id": partner_id,
                "partner_name": partner.full_name,
                "partner_avatar": partner.avatar_url,
                "partner_role": partner.role.value,
                "last_message": msg.content,
                "last_message_at": msg.created_at,
                "unread_count": unread,
            }

    return list(seen_partners.values())


@app.get("/api/chats/{partner_id}")
def get_messages_with_partner(
    partner_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the full message history between the current user and a partner.
    """
    partner = db.query(User).filter(User.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="User not found")

    messages = (
        db.query(DirectMessage)
        .filter(
            or_(
                and_(
                    DirectMessage.sender_id == current_user.id,
                    DirectMessage.receiver_id == partner_id,
                ),
                and_(
                    DirectMessage.sender_id == partner_id,
                    DirectMessage.receiver_id == current_user.id,
                ),
            )
        )
        .order_by(DirectMessage.created_at.asc())
        .all()
    )

    return [
        {
            "id": msg.id,
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "sender_name": msg.sender.full_name,
            "sender_avatar": msg.sender.avatar_url,
            "content": msg.content,
            "is_read": msg.is_read,
            "created_at": msg.created_at,
        }
        for msg in messages
    ]


@app.post("/api/chats/{partner_id}")
def send_direct_message(
    partner_id: int,
    message_data: DirectMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Send a direct message to a user.
    Only admin↔learner pairs are allowed.
    """
    partner = db.query(User).filter(User.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="User not found")

    if current_user.role == partner.role:
        raise HTTPException(
            status_code=400,
            detail="You can only chat with users of a different role",
        )

    if current_user.is_blocked:
        raise HTTPException(
            status_code=403,
            detail="Your account is blocked from sending messages.",
        )

    new_message = DirectMessage(
        sender_id=current_user.id,
        receiver_id=partner_id,
        content=message_data.content.strip(),
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return {
        "id": new_message.id,
        "sender_id": new_message.sender_id,
        "receiver_id": new_message.receiver_id,
        "sender_name": current_user.full_name,
        "sender_avatar": current_user.avatar_url,
        "content": new_message.content,
        "is_read": new_message.is_read,
        "created_at": new_message.created_at,
    }


@app.put("/api/chats/{partner_id}/read")
def mark_messages_read(
    partner_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark all messages from a partner as read.
    """
    db.query(DirectMessage).filter(
        DirectMessage.sender_id == partner_id,
        DirectMessage.receiver_id == current_user.id,
        DirectMessage.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"message": "Messages marked as read"}


# ============== LEARNER DASHBOARD ENDPOINTS ==============


@app.post("/api/courses/{course_id}/telemetry")
def track_course_time(
    course_id: int,
    telemetry_data: ProgressTelemetry,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Heartbeat endpoint to track time spent in a course/lesson
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    try:
        from app.mongo_service import log_time_spent
        log_time_spent(current_user.id, course_id, telemetry_data.lesson_id, telemetry_data.seconds_spent)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/courses/{course_id}/leaderboard")
def get_course_leaderboard(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get course leaderboard mapped by completion percentage and lowest time spent per percentage bracket
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    if not course.is_leaderboard_public and current_user.role != "admin" and course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Leaderboard is private")
        
    from app.mongo_service import user_progress_collection, get_course_lessons
    total_lessons = len(get_course_lessons(course_id))
    
    progress_docs = list(user_progress_collection.find({"course_id": course_id}))
    
    leaderboard = []
    for p in progress_docs:
        user_id = p.get("user_id")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            continue
            
        completed_count = len(p.get("completed_lessons", []))
        total_seconds = p.get("total_seconds_spent", 0)
        
        leaderboard.append({
            "user_id": user.id,
            "name": user.full_name,
            "avatar": user.avatar_url,
            "completed_lessons": completed_count,
            "total_lessons": total_lessons,
            "progress_percentage": (completed_count / total_lessons * 100) if total_lessons > 0 else 0,
            "total_seconds_spent": total_seconds
        })
        
    # Sort: Highest progress descends, then lowest time spent ascends
    leaderboard.sort(key=lambda x: (-x["progress_percentage"], x["total_seconds_spent"]))
    
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1
        
    return leaderboard


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
