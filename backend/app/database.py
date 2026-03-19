from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pymongo import MongoClient
import os

# Database connection string
POSTGRES_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/learnflow"
)

# Create SQLAlchemy engine
engine = create_engine(POSTGRES_URL, echo=True)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# Get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://admin:admin@localhost:27017/")
mongo_client = MongoClient(MONGO_URL)

# Database instance
mongo_db = mongo_client["learnflow"]


def get_mongo_db():
    return mongo_db


# MongoDB collections
course_content_collection = mongo_db["course_content"]
user_progress_collection = mongo_db["user_progress"]
audit_logs_collection = mongo_db["audit_logs"]
