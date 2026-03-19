from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db, engine, Base
from app.models import User, Course, Enrollment
from app.schemas import (
    UserCreate, UserResponse, UserUpdate, UserLogin, Token,
    CourseCreate, CourseUpdate, CourseResponse, CourseListResponse,
    EnrollmentCreate, EnrollmentResponse,
    LessonCreate, LessonUpdate, LessonResponse,
    ProgressUpdate, ProgressResponse,
    CourseWithLessons
)
from app.auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, get_current_active_user, require_admin
)
from app import mongo_service

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LearnFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to LearnFlow API"}


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        role="learner"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    mongo_service.log_audit_event(
        db_user.id,
        "user_registered",
        {"email": db_user.email, "role": db_user.role}
    )

    return {"message": "User created successfully", "user_id": db_user.id}


@app.post("/api/auth/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user.last_login = datetime.utcnow()
    db.commit()

    mongo_service.log_audit_event(
        user.id,
        "user_login",
        {"email": user.email, "role": user.role}
    )

    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@app.put("/api/auth/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url

    db.commit()
    db.refresh(current_user)

    mongo_service.log_audit_event(
        current_user.id,
        "user_updated",
        {"email": current_user.email}
    )

    return current_user


@app.get("/api/users", response_model=List[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 20,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(User)
    if role and role in ["learner", "admin"]:
        query = query.filter(User.role == role)
    users = query.offset(skip).limit(limit).all()
    return users


@app.get("/api/courses", response_model=List[CourseListResponse])
def get_courses(
    category: Optional[str] = None,
    level: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(Course)

    allowed_categories = ["Programming", "Design", "Marketing", "Business", "Data Science"]
    allowed_levels = ["Beginner", "Intermediate", "Advanced"]

    limit = max(1, min(50, limit))
    skip = max(0, min(1000, skip))
    if search:
        search = search.strip()[:100]
    if category and category in allowed_categories:
        query = query.filter(Course.category == category)
    if level and level in allowed_levels:
        query = query.filter(Course.level == level)
    if search:
        query = query.filter(Course.title.ilike(f"%{search}%"))

    courses = query.offset(skip).limit(limit).all()
    return courses


@app.get("/api/courses/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@app.post("/api/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    db_course = Course(
        title=course.title,
        description=course.description,
        category=course.category,
        level=course.level,
        duration=course.duration,
        price=course.price,
        thumbnail_url=course.thumbnail_url,
        instructor_id=current_user.id
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)

    mongo_service.log_audit_event(
        current_user.id,
        "course_created",
        {"course_id": db_course.id, "title": db_course.title}
    )

    return db_course


@app.put("/api/courses/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    course_update: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course_update.title is not None:
        course.title = course_update.title
    if course_update.description is not None:
        course.description = course_update.description
    if course_update.category is not None:
        course.category = course_update.category
    if course_update.level is not None:
        course.level = course_update.level
    if course_update.duration is not None:
        course.duration = course_update.duration
    if course_update.price is not None:
        course.price = course_update.price
    if course_update.thumbnail_url is not None:
        course.thumbnail_url = course_update.thumbnail_url
    if course_update.is_published is not None:
        course.is_published = course_update.is_published

    db.commit()
    db.refresh(course)

    mongo_service.log_audit_event(
        current_user.id,
        "course_updated",
        {"course_id": course.id, "title": course.title}
    )

    return course


@app.delete("/api/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(course)
    db.commit()

    mongo_service.log_audit_event(
        current_user.id,
        "course_deleted",
        {"course_id": course_id}
    )

    return None


@app.post("/api/courses/{course_id}/enroll", response_model=EnrollmentResponse)
def enroll_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()

    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    enrollment = Enrollment(user_id=current_user.id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    mongo_service.log_audit_event(
        current_user.id,
        "course_enrolled",
        {"course_id": course_id, "user_id": current_user.id}
    )

    return enrollment


@app.get("/api/learner/courses", response_model=List[CourseListResponse])
def get_enrolled_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id
    ).all()
    course_ids = [e.course_id for e in enrollments]
    courses = db.query(Course).filter(Course.id.in_(course_ids)).all()
    return courses


@app.get("/api/learner/courses/{course_id}/lessons", response_model=CourseWithLessons)
def get_course_with_lessons(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()

    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")

    lessons = mongo_service.get_lessons_by_course(course_id)

    course_dict = {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "category": course.category,
        "level": course.level,
        "duration": course.duration,
        "price": course.price,
        "instructor_id": course.instructor_id,
        "is_published": course.is_published,
        "lessons": lessons
    }
    return course_dict


@app.post("/api/learner/courses/{course_id}/lessons")
def create_lesson(
    course_id: int,
    lesson: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    lesson_id = mongo_service.create_lesson(course_id, lesson.dict())

    mongo_service.log_audit_event(
        current_user.id,
        "lesson_created",
        {"course_id": course_id, "lesson_id": lesson_id}
    )

    return {"message": "Lesson created", "lesson_id": lesson_id}


@app.put("/api/learner/courses/{course_id}/lessons/{lesson_id}")
def update_lesson(
    course_id: int,
    lesson_id: str,
    lesson_update: LessonUpdate,
    current_user: User = Depends(require_admin)
):
    update_data = lesson_update.dict(exclude_unset=True)
    success = mongo_service.update_lesson(lesson_id, update_data)

    if not success:
        raise HTTPException(status_code=404, detail="Lesson not found")

    mongo_service.log_audit_event(
        current_user.id,
        "lesson_updated",
        {"course_id": course_id, "lesson_id": lesson_id}
    )

    return {"message": "Lesson updated"}


@app.delete("/api/learner/courses/{course_id}/lessons/{lesson_id}")
def delete_lesson(
    course_id: int,
    lesson_id: str,
    current_user: User = Depends(require_admin)
):
    success = mongo_service.delete_lesson(lesson_id)

    if not success:
        raise HTTPException(status_code=404, detail="Lesson not found")

    mongo_service.log_audit_event(
        current_user.id,
        "lesson_deleted",
        {"course_id": course_id, "lesson_id": lesson_id}
    )

    return {"message": "Lesson deleted"}


@app.post("/api/learner/courses/{course_id}/progress")
def update_progress(
    course_id: int,
    progress_update: ProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()

    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")

    success = mongo_service.update_user_progress(
        current_user.id,
        course_id,
        progress_update.lesson_id,
        progress_update.completed
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to update progress")

    mongo_service.log_audit_event(
        current_user.id,
        "progress_updated",
        {"course_id": course_id, "lesson_id": progress_update.lesson_id, "completed": progress_update.completed}
    )

    return {"message": "Progress updated"}


@app.get("/api/learner/courses/{course_id}/progress", response_model=List[ProgressResponse])
def get_progress(
    course_id: int,
    current_user: User = Depends(get_current_active_user)
):
    progress = mongo_service.get_user_progress(current_user.id, course_id)
    return progress


@app.get("/api/learner/stats")
def get_learner_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id
    ).all()

    total_enrolled = len(enrollments)
    courses_completed = sum(1 for e in enrollments if e.completed_at is not None)

    lessons_completed = 0
    for enrollment in enrollments:
        progress = mongo_service.get_user_progress(current_user.id, enrollment.course_id)
        lessons_completed += sum(1 for p in progress if p.get("completed", False))

    return {
        "total_enrolled": total_enrolled,
        "courses_completed": courses_completed,
        "lessons_completed": lessons_completed
    }


@app.get("/api/analytics/stats")
def get_analytics_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_courses = db.query(Course).count()
    total_enrollments = db.query(Enrollment).count()
    unique_learners = db.query(Enrollment.user_id).distinct().count()
    published_courses = db.query(Course).filter(Course.is_published == True).count()

    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "unique_learners": unique_learners,
        "published_courses": published_courses
    }


@app.get("/api/audit-logs")
def get_audit_logs(
    limit: int = Query(default=100, le=100),
    action: Optional[str] = None,
    current_user: User = Depends(require_admin)
):
    allowed_actions = ["user_registered", "user_login", "user_updated", "course_created",
                       "course_updated", "course_deleted", "course_enrolled", "lesson_created",
                       "lesson_updated", "lesson_deleted", "progress_updated"]

    if action and action not in allowed_actions:
        action = None

    logs = mongo_service.get_audit_logs(limit=limit, action=action)
    return logs
