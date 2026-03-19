"""
SQLAlchemy Models for PostgreSQL
These models define the structure of our relational database
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    """User roles in the system"""
    ADMIN = "admin"
    LEARNER = "learner"


class User(Base):
    """
    User model - stores user account information
    This is in PostgreSQL because user data is relational and structured
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.LEARNER, nullable=False)
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationship with courses created by this user (if admin)
    created_courses = relationship("Course", back_populates="instructor")
    
    def __repr__(self):
        return f"<User {self.email}>"
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "role": self.role.value,
            "is_active": self.is_active,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Course(Base):
    """
    Course model - stores course metadata
    This is in PostgreSQL because course metadata is structured and relational
    """
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    level = Column(String(50), nullable=False)  # Beginner, Intermediate, Advanced
    duration = Column(String(50), nullable=False)  # e.g., "12 hours"
    price = Column(Float, default=0.0)
    thumbnail_url = Column(String(500), nullable=True)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    instructor = relationship("User", back_populates="created_courses")
    
    def __repr__(self):
        return f"<Course {self.title}>"
    
    def to_dict(self):
        """Convert course object to dictionary"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "level": self.level,
            "duration": self.duration,
            "price": self.price,
            "thumbnail_url": self.thumbnail_url,
            "instructor_id": self.instructor_id,
            "is_published": self.is_published,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Enrollment(Base):
    """
    Enrollment model - tracks which users are enrolled in which courses
    This is a junction table for the many-to-many relationship
    """
    __tablename__ = "enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<Enrollment user={self.user_id} course={self.course_id}>"


class AuditLog(Base):
    """
    Audit Log model - tracks all user actions for security and compliance
    This is also stored in PostgreSQL for structured querying
    """
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # e.g., "login", "course_created", "lesson_completed"
    resource_type = Column(String(50), nullable=True)  # e.g., "user", "course", "lesson"
    resource_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)  # JSON string with additional details
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<AuditLog {self.action} by user={self.user_id}>"
    
    def to_dict(self):
        """Convert audit log to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "details": self.details,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
