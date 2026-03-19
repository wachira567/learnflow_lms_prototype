"""
Pydantic Schemas for request/response validation
These define the shape of data coming in and out of our API
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ============== USER SCHEMAS ==============

class UserRole(str, Enum):
    ADMIN = "admin"
    LEARNER = "learner"


class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    """Schema for creating a new user (registration)"""
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = UserRole.LEARNER


class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user response (returned by API)"""
    id: int
    role: UserRole
    is_active: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


# ============== AUTH SCHEMAS ==============

class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for decoded token data"""
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None


# ============== COURSE SCHEMAS ==============

class CourseBase(BaseModel):
    """Base course schema"""
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=100)
    level: str = Field(..., pattern="^(Beginner|Intermediate|Advanced)$")
    duration: str = Field(..., min_length=1, max_length=50)
    price: float = Field(..., ge=0)


class CourseCreate(CourseBase):
    """Schema for creating a new course"""
    thumbnail_url: Optional[str] = None


class CourseUpdate(BaseModel):
    """Schema for updating a course"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = None


class CourseResponse(CourseBase):
    """Schema for course response"""
    id: int
    thumbnail_url: Optional[str] = None
    instructor_id: int
    is_published: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    """Schema for list of courses"""
    id: int
    title: str
    category: str
    level: str
    duration: str
    price: float
    thumbnail_url: Optional[str] = None
    instructor_id: int


# ============== LESSON SCHEMAS ==============

class LessonType(str, Enum):
    VIDEO = "video"
    TEXT = "text"


class LessonBase(BaseModel):
    """Base lesson schema"""
    title: str = Field(..., min_length=1, max_length=255)
    type: LessonType = LessonType.VIDEO
    duration: str = Field(..., min_length=1, max_length=50)
    content: Optional[str] = None  # URL for video, text content for text lessons


class LessonCreate(LessonBase):
    """Schema for creating a lesson"""
    pass


class LessonUpdate(BaseModel):
    """Schema for updating a lesson"""
    title: Optional[str] = None
    type: Optional[LessonType] = None
    duration: Optional[str] = None
    content: Optional[str] = None


class LessonResponse(LessonBase):
    """Schema for lesson response"""
    id: str  # MongoDB uses string IDs
    course_id: int
    order: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============== PROGRESS SCHEMAS ==============

class ProgressUpdate(BaseModel):
    """Schema for updating lesson progress"""
    lesson_id: str
    completed: bool


class ProgressResponse(BaseModel):
    """Schema for progress response"""
    course_id: int
    user_id: int
    completed_lessons: List[str]
    total_lessons: int
    progress_percentage: float
    last_accessed: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============== AUDIT LOG SCHEMAS ==============

class AuditLogCreate(BaseModel):
    """Schema for creating audit log entry"""
    user_id: Optional[int] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[int] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditLogResponse(BaseModel):
    """Schema for audit log response"""
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


# ============== FILTER SCHEMAS ==============

class CourseFilter(BaseModel):
    """Schema for filtering courses"""
    category: Optional[str] = None
    level: Optional[str] = None
    search: Optional[str] = None
    instructor_id: Optional[int] = None
