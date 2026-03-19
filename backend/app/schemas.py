from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[int] = None
    price: Optional[float] = 0.0
    thumbnail_url: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[int] = None
    price: Optional[float] = None
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = None


class CourseResponse(CourseBase):
    id: int
    instructor_id: int
    is_published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category: Optional[str]
    level: Optional[str]
    duration: Optional[int]
    price: float
    thumbnail_url: Optional[str]
    instructor_id: int
    is_published: bool
    created_at: datetime

    class Config:
        from_attributes = True


class EnrollmentCreate(BaseModel):
    course_id: int


class EnrollmentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    enrolled_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LessonCreate(BaseModel):
    title: str
    content_type: str
    content_url: Optional[str] = None
    content_body: Optional[str] = None
    order: int


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content_type: Optional[str] = None
    content_url: Optional[str] = None
    content_body: Optional[str] = None
    order: Optional[int] = None


class LessonResponse(BaseModel):
    id: str
    course_id: int
    title: str
    content_type: str
    content_url: Optional[str]
    content_body: Optional[str]
    order: int

    class Config:
        from_attributes = True


class ProgressUpdate(BaseModel):
    lesson_id: str
    completed: bool


class ProgressResponse(BaseModel):
    lesson_id: str
    completed: bool
    completed_at: Optional[datetime] = None


class CourseWithLessons(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category: Optional[str]
    level: Optional[str]
    duration: Optional[int]
    price: float
    instructor_id: int
    is_published: bool
    lessons: List[LessonResponse] = []

    class Config:
        from_attributes = True
