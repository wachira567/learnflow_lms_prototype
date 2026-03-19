from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    LEARNER = "learner"


class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = UserRole.LEARNER


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None


class CourseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=100)
    level: str = Field(..., pattern="^(Beginner|Intermediate|Advanced)$")
    duration: str = Field(..., min_length=1, max_length=50)
    price: float = Field(..., ge=0)


class CourseCreate(CourseBase):
    thumbnail_url: Optional[str] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = None


class CourseResponse(CourseBase):
    id: int
    thumbnail_url: Optional[str] = None
    instructor_id: int
    is_published: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    id: int
    title: str
    category: str
    level: str
    duration: str
    price: float
    thumbnail_url: Optional[str] = None
    instructor_id: int


class LessonType(str, Enum):
    VIDEO = "video"
    TEXT = "text"


class LessonBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    type: LessonType = LessonType.VIDEO
    duration: str = Field(..., min_length=1, max_length=50)
    content: Optional[str] = None


class LessonCreate(LessonBase):
    pass


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[LessonType] = None
    duration: Optional[str] = None
    content: Optional[str] = None


class LessonResponse(LessonBase):
    id: str
    course_id: int
    order: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProgressUpdate(BaseModel):
    lesson_id: str
    completed: bool


class ProgressResponse(BaseModel):
    course_id: int
    user_id: int
    completed_lessons: List[str]
    total_lessons: int
    progress_percentage: float
    last_accessed: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class AuditLogCreate(BaseModel):
    user_id: Optional[int] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[int] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    resource_type: Optional[str]
    resource_id: Optional[int]
    details: Optional[str]
    ip_address: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class CourseFilter(BaseModel):
    category: Optional[str] = None
    level: Optional[str] = None
    search: Optional[str] = None
    instructor_id: Optional[int] = None
