---
sidebar_position: 6
---

# Database Design

LearnFlow uses a dual-database architecture, leveraging both PostgreSQL and MongoDB to optimize for different data access patterns.

## Why Dual Database Architecture?

This project demonstrates the appropriate use of both SQL and NoSQL databases:

### PostgreSQL (Relational) - Structured Data

**Use Cases:**

- User accounts and authentication
- Course metadata
- Enrollments
- Audit logs
- Discussion comments

**Rationale:**

- **ACID Compliance**: Critical for financial and user data
- **Structured Relationships**: Users → Courses → Enrollments
- **Query Flexibility**: Complex joins for analytics
- **Maturity**: Battle-tested for production systems

### MongoDB (NoSQL) - Flexible Content

**Use Cases:**

- Course lessons (varying structures)
- User progress (variable per user)
- Rich content with different schemas

**Rationale:**

- **Flexible Schema**: Lessons can have different content types
- **Scalability**: Handle growing content libraries
- **Document Model**: Natural fit for lesson-progress relationships
- **Rapid Development**: Easy schema evolution

## PostgreSQL Schema

### Users Table

Stores user account information and authentication data.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'learner',
    is_active BOOLEAN DEFAULT true,
    is_blocked BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Fields:**

- `id`: Unique identifier
- `email`: User's email address (unique)
- `hashed_password`: bcrypt hashed password
- `first_name`: User's first name
- `last_name`: User's last name
- `avatar_url`: URL to user's avatar image
- `role`: User role (learner, admin)
- `is_active`: Whether the account is active
- `is_blocked`: Whether the account is blocked
- `last_login`: Last login timestamp
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Courses Table

Stores course metadata and information.

```sql
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    level VARCHAR(50),
    duration VARCHAR(50),
    thumbnail_url TEXT,
    banner_url TEXT,
    instructor_id INTEGER REFERENCES users(id),
    is_published BOOLEAN DEFAULT false,
    is_leaderboard_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_published ON courses(is_published);
```

**Fields:**

- `id`: Unique identifier
- `title`: Course title
- `description`: Course description
- `category`: Course category (Programming, Design, etc.)
- `level`: Difficulty level (Beginner, Intermediate, Advanced)
- `duration`: Estimated duration
- `thumbnail_url`: URL to course thumbnail
- `banner_url`: URL to course banner
- `instructor_id`: Reference to the instructor (user)
- `is_published`: Whether the course is published
- `is_leaderboard_public`: Whether the leaderboard is public
- `created_at`: Course creation timestamp
- `updated_at`: Last update timestamp

### Enrollments Table

Stores user-course enrollment relationships.

```sql
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    progress INTEGER DEFAULT 0,
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_completed ON enrollments(completed_at);
```

**Fields:**

- `id`: Unique identifier
- `user_id`: Reference to the user
- `course_id`: Reference to the course
- `enrolled_at`: Enrollment timestamp
- `completed_at`: Completion timestamp (null if not completed)
- `progress`: Progress percentage (0-100)

### Comments Table

Stores discussion posts and messages.

```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    lesson_id VARCHAR(255),
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_course ON comments(course_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_private ON comments(is_private);
```

**Fields:**

- `id`: Unique identifier
- `course_id`: Reference to the course
- `user_id`: Reference to the user (author)
- `content`: Comment content
- `is_private`: Whether the comment is private (DM)
- `lesson_id`: Reference to MongoDB lesson (optional)
- `parent_id`: Reference to parent comment (for replies)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Comment Votes Table

Stores votes on discussion posts.

```sql
CREATE TABLE comment_votes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    vote_type INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_votes_comment ON comment_votes(comment_id);
CREATE INDEX idx_comment_votes_user ON comment_votes(user_id);
```

**Fields:**

- `id`: Unique identifier
- `comment_id`: Reference to the comment
- `user_id`: Reference to the user
- `vote_type`: Vote type (1 for upvote, -1 for downvote)
- `created_at`: Vote timestamp

### Direct Messages Table

Stores direct messages between users.

```sql
CREATE TABLE direct_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX idx_direct_messages_receiver ON direct_messages(receiver_id);
CREATE INDEX idx_direct_messages_read ON direct_messages(is_read);
```

**Fields:**

- `id`: Unique identifier
- `sender_id`: Reference to the sender
- `receiver_id`: Reference to the receiver
- `content`: Message content
- `is_read`: Whether the message has been read
- `created_at`: Message timestamp

### Audit Logs Table

Stores audit trail for security and compliance.

```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

**Fields:**

- `id`: Unique identifier
- `user_id`: Reference to the user (nullable)
- `action`: Action performed (user_login, course_created, etc.)
- `resource_type`: Type of resource affected
- `resource_id`: ID of the resource affected
- `details`: Additional details
- `ip_address`: User's IP address
- `user_agent`: User's browser/client information
- `created_at`: Action timestamp

### Telemetry Table

Stores time tracking data.

```sql
CREATE TABLE telemetry (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id VARCHAR(255),
    seconds_spent INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_telemetry_user ON telemetry(user_id);
CREATE INDEX idx_telemetry_course ON telemetry(course_id);
```

**Fields:**

- `id`: Unique identifier
- `user_id`: Reference to the user
- `course_id`: Reference to the course
- `lesson_id`: Reference to MongoDB lesson
- `seconds_spent`: Time spent in seconds
- `created_at`: Timestamp

## MongoDB Collections

### Lessons Collection

Stores course lesson content with flexible schema.

```javascript
{
  "_id": ObjectId("..."),
  "course_id": 1,
  "title": "Variables and Data Types",
  "type": "video",  // or "text"
  "duration": "15 minutes",
  "content": "https://video-url.com/...",
  "notes": "Additional notes for the lesson...",
  "order": 1,
  "created_at": ISODate("2024-01-01T00:00:00Z"),
  "updated_at": ISODate("2024-01-01T00:00:00Z")
}
```

**Fields:**

- `_id`: MongoDB ObjectId
- `course_id`: Reference to PostgreSQL course
- `title`: Lesson title
- `type`: Lesson type (video, text)
- `duration`: Estimated duration
- `content`: Lesson content (video URL or text)
- `notes`: Additional notes
- `order`: Lesson order in the course
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Progress Collection

Stores user progress per course.

```javascript
{
  "_id": ObjectId("..."),
  "user_id": 1,
  "course_id": 1,
  "completed_lessons": ["lesson-id-1", "lesson-id-2"],
  "total_seconds_spent": 3600,
  "lesson_times": {
    "lesson-id-1": 1800,
    "lesson-id-2": 1800
  },
  "updated_at": ISODate("2024-01-01T00:00:00Z")
}
```

**Fields:**

- `_id`: MongoDB ObjectId
- `user_id`: Reference to PostgreSQL user
- `course_id`: Reference to PostgreSQL course
- `completed_lessons`: Array of completed lesson IDs
- `total_seconds_spent`: Total time spent on the course
- `lesson_times`: Object mapping lesson IDs to time spent
- `updated_at`: Last update timestamp

### Course Telemetry Collection

Stores detailed time tracking data.

```javascript
{
  "_id": ObjectId("..."),
  "user_id": 1,
  "course_id": 1,
  "lesson_id": "lesson-id-1",
  "seconds_spent": 300,
  "created_at": ISODate("2024-01-01T00:00:00Z")
}
```

**Fields:**

- `_id`: MongoDB ObjectId
- `user_id`: Reference to PostgreSQL user
- `course_id`: Reference to PostgreSQL course
- `lesson_id`: Reference to lesson
- `seconds_spent`: Time spent in seconds
- `created_at`: Timestamp

## Data Relationships

### PostgreSQL Relationships

```
users (1) ──────────< (many) enrollments
users (1) ──────────< (many) courses (instructor)
users (1) ──────────< (many) comments
users (1) ──────────< (many) comment_votes
users (1) ──────────< (many) direct_messages (sender)
users (1) ──────────< (many) direct_messages (receiver)
users (1) ──────────< (many) audit_logs
users (1) ──────────< (many) telemetry

courses (1) ──────────< (many) enrollments
courses (1) ──────────< (many) comments
courses (1) ──────────< (many) telemetry

comments (1) ──────────< (many) comments (replies)
comments (1) ──────────< (many) comment_votes
```

### Cross-Database Relationships

```
PostgreSQL courses.id ──────────< MongoDB lessons.course_id
PostgreSQL users.id ──────────< MongoDB progress.user_id
PostgreSQL courses.id ──────────< MongoDB progress.course_id
PostgreSQL users.id ──────────< MongoDB telemetry.user_id
PostgreSQL courses.id ──────────< MongoDB telemetry.course_id
```

## Database Configuration

### PostgreSQL Configuration

```python
# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/learnflow")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### MongoDB Configuration

```python
# backend/app/mongo_service.py
from pymongo import MongoClient
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URL)
db = client.learnflow

# Collections
course_content_collection = db.lessons
user_progress_collection = db.progress
telemetry_collection = db.course_telemetry
```

## Data Migration

### PostgreSQL Migrations

For production, use Alembic for database migrations:

```bash
# Initialize Alembic
alembic init alembic

# Create a migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### MongoDB Schema Evolution

MongoDB's flexible schema allows for easy evolution:

```javascript
// Add new field to existing documents
db.lessons.updateMany({}, { $set: { new_field: "default_value" } });

// Add index for better performance
db.progress.createIndex({ user_id: 1, course_id: 1 }, { unique: true });
```

## Performance Considerations

### PostgreSQL Indexes

Key indexes for performance:

- `users.email`: Fast user lookup
- `courses.category`: Filter courses by category
- `enrollments.user_id`: Fast enrollment lookup
- `enrollments.course_id`: Fast enrollment lookup
- `audit_logs.created_at`: Fast audit log queries

### MongoDB Indexes

Key indexes for performance:

- `lessons.course_id`: Fast lesson lookup
- `progress.user_id + progress.course_id`: Fast progress lookup
- `telemetry.user_id + telemetry.course_id`: Fast telemetry lookup

## Backup & Recovery

### PostgreSQL Backup

```bash
# Backup database
docker exec learnflow-postgres pg_dump -U postgres learnflow > backup.sql

# Restore database
docker exec -i learnflow-postgres psql -U postgres learnflow < backup.sql
```

### MongoDB Backup

```bash
# Backup database
docker exec learnflow-mongodb mongodump --db learnflow --out /backup

# Restore database
docker exec learnflow-mongodb mongorestore --db learnflow /backup/learnflow
```

## Next Steps

- **[Architecture](./architecture)** - Understand the system design
- **[API Reference](./api-reference)** - Explore the API endpoints
- **[Security](./security)** - Learn about security features
