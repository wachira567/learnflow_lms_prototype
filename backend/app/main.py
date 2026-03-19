from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import func

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
    ProgressUpdate,
)
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    require_admin,
    log_audit_event,
)
from app.mongo_service import (
    create_lesson,
    get_course_lessons,
    get_user_progress,
    update_lesson_progress,
    get_user_all_progress,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LearnFlow API",
    description="Learning Management System API with dual database architecture",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


@app.get("/")
def read_root():
    return {"message": "Welcome to LearnFlow API", "version": "1.0.0", "docs": "/docs"}


@app.post("/api/auth/register", response_model=Token)
def register(user_data: UserCreate, request: Request, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

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

    log_audit_event(
        db=db,
        action="user_registered",
        user_id=new_user.id,
        resource_type="user",
        resource_id=new_user.id,
        request=request,
    )

    access_token = create_access_token(
        data={
            "user_id": new_user.id,
            "email": new_user.email,
            "role": new_user.role.value,
        }
    )

    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/auth/login", response_model=Token)
def login(credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
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

    user.last_login = datetime.utcnow()
    db.commit()

    log_audit_event(db=db, action="user_login", user_id=user.id, request=request)

    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role.value}
    )

    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user


@app.put("/api/auth/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if profile_data.first_name:
        current_user.first_name = profile_data.first_name
    if profile_data.last_name:
        current_user.last_name = profile_data.last_name
    if profile_data.avatar_url:
        current_user.avatar_url = profile_data.avatar_url

    db.commit()
    db.refresh(current_user)

    return current_user


@app.get("/api/users", response_model=List[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 20,
    role: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    limit = max(1, min(50, limit))
    skip = max(0, min(1000, skip))
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
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.get("/api/courses", response_model=List[CourseListResponse])
def get_courses(
    category: Optional[str] = None,
    level: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    allowed_categories = [
        "Programming",
        "Design",
        "Marketing",
        "Business",
        "Data Science",
    ]
    allowed_levels = ["Beginner", "Intermediate", "Advanced"]

    limit = max(1, min(50, limit))
    skip = max(0, min(1000, skip))
    if search:
        search = search.strip()[:100]
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
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@app.post("/api/courses", response_model=CourseResponse)
def create_course(
    course_data: CourseCreate,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
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
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    update_data = course_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)

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
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    from app.mongo_service import delete_course_lessons

    delete_course_lessons(course_id)

    db.delete(course)
    db.commit()

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
    categories = db.query(Course.category).distinct().all()
    return [cat[0] for cat in categories]


@app.post("/api/courses/{course_id}/lessons")
def add_lesson(
    course_id: int,
    lesson_data: LessonCreate,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    lesson_id = create_lesson(course_id, lesson_data.dict())

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
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    lessons = get_course_lessons(course_id)
    return lessons


@app.get("/api/courses/{course_id}/progress")
def get_course_progress(course_id: int, current_user: User = Depends(get_current_user)):
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
    progress = update_lesson_progress(
        current_user.id, course_id, progress_data.lesson_id, progress_data.completed
    )

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
    progress_list = get_user_all_progress(current_user.id)
    return progress_list


@app.post("/api/courses/{course_id}/enroll")
def enroll_in_course(
    course_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Enrollment)
        .filter(
            Enrollment.user_id == current_user.id, Enrollment.course_id == course_id
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment = Enrollment(user_id=current_user.id, course_id=course_id)

    db.add(enrollment)
    db.commit()

    log_audit_event(
        db=db,
        action="course_enrolled",
        user_id=current_user.id,
        resource_type="course",
        resource_id=course_id,
        request=request,
    )

    return {"message": "Enrolled successfully"}


@app.get("/api/audit-logs")
def get_audit_logs(
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    limit = max(1, min(100, limit))
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


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "databases": {"postgresql": "connected", "mongodb": "connected"},
    }


@app.get("/api/analytics/stats")
def get_analytics_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    total_courses = db.query(Course).count()
    total_enrollments = db.query(Enrollment).count()
    active_users = db.query(Enrollment.user_id).distinct().count()
    published_courses = db.query(Course).filter(Course.is_published == True).count()

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
    categories = (
        db.query(Course.category, func.count(Course.id).label("count"))
        .group_by(Course.category)
        .all()
    )

    total = sum(cat.count for cat in categories) if categories else 1

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


@app.get("/api/learner/stats")
def get_learner_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    enrollments = (
        db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()
    )

    courses_in_progress = len([e for e in enrollments if not e.completed_at])
    courses_completed = len([e for e in enrollments if e.completed_at])

    progress_list = get_user_all_progress(current_user.id)

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
    enrollments = (
        db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()
    )

    result = []
    for enrollment in enrollments:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if course:
            progress = get_user_progress(current_user.id, enrollment.course_id)

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


from sqlalchemy import func
