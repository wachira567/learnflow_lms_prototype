---
sidebar_position: 5
---

# API Reference

Complete API documentation for LearnFlow. The API follows REST conventions and uses JSON for request/response bodies.

## Base URL

```
http://localhost:8000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Registration**: 5 requests/minute
- **Login**: 10 requests/minute
- **Other endpoints**: 60 requests/minute

## Authentication Endpoints

### Register User

Register a new user (learner or admin).

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "Password123",
  "role": "learner"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Rate Limit:** 5 requests/minute

### Login User

Login and get JWT token.

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Rate Limit:** 10 requests/minute

### Get Current User

Get current authenticated user's information.

```http
GET /api/auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "learner",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00"
}
```

### Update Profile

Update current user's profile.

```http
PUT /api/auth/profile
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response:** Updated user object

### Get Google OAuth URL

Get Google OAuth authorization URL.

```http
GET /api/auth/google/url
```

**Response:**

```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### Google OAuth Callback

Handle Google OAuth callback and authenticate/create user.

```http
POST /api/auth/google/callback
```

**Request Body:**

```json
{
  "code": "4/0AX4XfWh..."
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Rate Limit:** 10 requests/minute

## User Management Endpoints (Admin Only)

### Get All Users

Get all users with optional filtering.

```http
GET /api/users
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**

- `skip` (int): Number of records to skip (default: 0)
- `limit` (int): Number of records to return (default: 20, max: 50)
- `role` (string): Filter by role (learner, admin)

**Response:**

```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "learner",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### Get User by ID

Get a specific user by ID.

```http
GET /api/users/{user_id}
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:** User object

### Update User Role

Update user role (Admin only).

```http
PUT /api/users/{user_id}/role
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**

```json
{
  "role": "admin"
}
```

**Response:**

```json
{
  "message": "User role updated to admin",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### Block/Unblock User

Toggle user block status.

```http
POST /api/users/{user_id}/block
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:**

```json
{
  "message": "User successfully blocked",
  "is_blocked": true
}
```

## Course Endpoints

### Get All Courses

Get all courses with optional filtering.

```http
GET /api/courses
```

**Headers:** `Authorization: Bearer <token>` (optional)

**Query Parameters:**

- `category` (string): Filter by category
- `level` (string): Filter by level
- `search` (string): Search by title/description
- `skip` (int): Number of records to skip
- `limit` (int): Number of records to return

**Response:**

```json
[
  {
    "id": 1,
    "title": "Introduction to Python",
    "description": "Learn Python from scratch",
    "category": "Programming",
    "level": "Beginner",
    "duration": "4 hours",
    "thumbnail_url": "https://...",
    "is_published": true,
    "is_enrolled": false,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### Get Course by ID

Get a specific course by ID.

```http
GET /api/courses/{course_id}
```

**Headers:** `Authorization: Bearer <token>` (optional)

**Response:**

```json
{
  "id": 1,
  "title": "Introduction to Python",
  "description": "Learn Python from scratch",
  "category": "Programming",
  "level": "Beginner",
  "duration": "4 hours",
  "thumbnail_url": "https://...",
  "banner_url": "https://...",
  "is_published": true,
  "is_enrolled": true,
  "instructor": "John Doe",
  "instructorAvatar": "https://...",
  "rating": 4.5,
  "lessonsCount": 10,
  "lessons": [...],
  "created_at": "2024-01-01T00:00:00"
}
```

### Create Course

Create a new course (Admin only).

```http
POST /api/courses
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**

```json
{
  "title": "Introduction to Python",
  "description": "Learn Python from scratch",
  "category": "Programming",
  "level": "Beginner",
  "duration": "4 hours",
  "thumbnail_url": "https://...",
  "banner_url": "https://..."
}
```

**Response:** Created course object

### Update Course

Update a course (Admin only).

```http
PUT /api/courses/{course_id}
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**

```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response:** Updated course object

### Delete Course

Delete a course (Admin only).

```http
DELETE /api/courses/{course_id}
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:**

```json
{
  "message": "Course deleted successfully"
}
```

### Get Courses with Enrollments

Get all courses with enrollment counts (Admin only).

```http
GET /api/courses/with-enrollments
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:**

```json
[
  {
    "id": 1,
    "title": "Introduction to Python",
    "category": "Programming",
    "level": "Beginner",
    "is_published": true,
    "enrollments": 25,
    "thumbnail_url": "https://...",
    "duration": "4 hours",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### Get Categories

Get all unique course categories.

```http
GET /api/categories
```

**Response:**

```json
["Programming", "Design", "Marketing", "Business", "Data Science"]
```

## Lesson Endpoints

### Get Course Lessons

Get all lessons for a course.

```http
GET /api/courses/{course_id}/lessons
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "id": "lesson-mongo-id",
    "course_id": 1,
    "title": "Variables and Data Types",
    "type": "video",
    "duration": "15 minutes",
    "content": "https://video-url.com/...",
    "notes": "Additional notes...",
    "order": 1,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### Add Lesson

Add a lesson to a course (Admin only).

```http
POST /api/courses/{course_id}/lessons
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**

```json
{
  "title": "Variables and Data Types",
  "type": "video",
  "duration": "15 minutes",
  "content": "https://video-url.com/...",
  "notes": "Additional notes..."
}
```

**Response:**

```json
{
  "message": "Lesson created successfully",
  "lesson_id": "lesson-mongo-id"
}
```

### Update Lesson

Update a lesson (Admin only).

```http
PUT /api/courses/{course_id}/lessons/{lesson_id}
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**

```json
{
  "title": "Updated Title",
  "notes": "Updated notes"
}
```

**Response:**

```json
{
  "message": "Lesson updated successfully"
}
```

### Delete Lesson

Delete a lesson (Admin only).

```http
DELETE /api/courses/{course_id}/lessons/{lesson_id}
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:**

```json
{
  "message": "Lesson deleted successfully"
}
```

## Enrollment & Progress Endpoints

### Enroll in Course

Enroll current user in a course.

```http
POST /api/courses/{course_id}/enroll
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "message": "Enrolled successfully"
}
```

### Unenroll from Course

Unenroll current user from a course and clear progress.

```http
DELETE /api/courses/{course_id}/unenroll
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "message": "Unenrolled successfully"
}
```

### Get Course Progress

Get current user's progress for a course.

```http
GET /api/courses/{course_id}/progress
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "user_id": 1,
  "course_id": 1,
  "completed_lessons": ["lesson-id-1", "lesson-id-2"],
  "total_seconds_spent": 3600,
  "lesson_times": {
    "lesson-id-1": 1800,
    "lesson-id-2": 1800
  }
}
```

### Update Lesson Progress

Update lesson progress for current user.

```http
POST /api/courses/{course_id}/progress
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "lesson_id": "lesson-mongo-id",
  "completed": true
}
```

**Response:** Updated progress object

### Get All User Progress

Get all progress records for current user.

```http
GET /api/my-progress
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "user_id": 1,
    "course_id": 1,
    "completed_lessons": ["lesson-id-1"],
    "total_seconds_spent": 1800
  }
]
```

### Get Learner Enrollments

Get all courses the learner is enrolled in with progress.

```http
GET /api/learner/enrollments
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "id": 1,
    "title": "Introduction to Python",
    "description": "Learn Python from scratch",
    "category": "Programming",
    "level": "Beginner",
    "duration": "4 hours",
    "thumbnail_url": "https://...",
    "enrolled_at": "2024-01-01T00:00:00",
    "completed_at": null,
    "total_lessons": 10,
    "completed_lessons": 5,
    "progress_percentage": 50,
    "is_completed": false
  }
]
```

## Analytics & Reporting Endpoints (Admin Only)

### Get Analytics Stats

Get analytics statistics for admin dashboard.

```http
GET /api/analytics/stats
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:**

```json
{
  "total_users": 100,
  "total_courses": 20,
  "total_enrollments": 500,
  "active_users": 75,
  "published_courses": 15
}
```

### Get Category Distribution

Get course distribution by category.

```http
GET /api/analytics/categories
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:**

```json
[
  {
    "name": "Programming",
    "count": 10,
    "percentage": 50
  },
  {
    "name": "Design",
    "count": 5,
    "percentage": 25
  }
]
```

### Get Enrollment Trends

Get enrollment trends over time.

```http
GET /api/analytics/enrollment-trends
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**

- `days` (int): Number of days to look back (default: 30)

**Response:**

```json
[
  {
    "date": "2024-01-01",
    "enrollments": 5,
    "completions": 2
  }
]
```

### Get User Growth

Get user growth over time.

```http
GET /api/analytics/user-growth
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**

- `months` (int): Number of months to look back (default: 6)

**Response:**

```json
[
  {
    "month": "2024-01",
    "new_users": 10,
    "total_users": 100
  }
]
```

### Get Platform Insights

Get platform insights - average lesson views, completion rates, etc.

```http
GET /api/analytics/insights
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:**

```json
{
  "avg_lesson_views": 15.5,
  "completion_rate": 75.0,
  "total_lessons_viewed": 1500,
  "total_enrollments": 500,
  "completed_enrollments": 375
}
```

## Report Endpoints (Admin Only)

### Get Course Report

Generate course report with filters.

```http
GET /api/reports/courses
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**

- `category` (string): Filter by category
- `level` (string): Filter by level
- `date_from` (string): Start date (YYYY-MM-DD)
- `date_to` (string): End date (YYYY-MM-DD)
- `limit` (int): Number of results (5, 10, 20, 30, 50)

**Response:**

```json
{
  "total_courses": 10,
  "courses": [
    {
      "id": 1,
      "title": "Introduction to Python",
      "category": "Programming",
      "level": "Beginner",
      "is_published": true,
      "created_at": "2024-01-01T00:00:00",
      "total_enrollments": 25,
      "completed_enrollments": 20,
      "completion_rate": 80.0
    }
  ]
}
```

### Get Student Report

Generate student report with filters.

```http
GET /api/reports/students
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**

- `course_id` (int): Filter by course
- `date_from` (string): Start date (YYYY-MM-DD)
- `date_to` (string): End date (YYYY-MM-DD)
- `status` (string): Filter by status (enrolled, completed, in_progress)
- `limit` (int): Number of results

**Response:**

```json
{
  "total_students": 50,
  "total_enrollments": 100,
  "students": [
    {
      "id": 1,
      "student_id": 1,
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "course_id": 1,
      "course_title": "Introduction to Python",
      "enrolled_at": "2024-01-01T00:00:00",
      "completed_at": null,
      "progress": 50,
      "status": "in_progress"
    }
  ]
}
```

### Get User Report

Generate user report with filters.

```http
GET /api/reports/users
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**

- `role` (string): Filter by role
- `date_from` (string): Start date (YYYY-MM-DD)
- `date_to` (string): End date (YYYY-MM-DD)
- `limit` (int): Number of results

**Response:**

```json
{
  "total_users": 100,
  "users": [
    {
      "id": 1,
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "learner",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00",
      "total_courses_enrolled": 5,
      "courses_completed": 3
    }
  ]
}
```

### Get Activity Report

Generate activity report - shows recent user activities.

```http
GET /api/reports/activity
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**

- `date_from` (string): Start date (YYYY-MM-DD)
- `date_to` (string): End date (YYYY-MM-DD)

**Response:**

```json
{
  "period": {
    "from": "2024-01-01T00:00:00",
    "to": "2024-01-31T00:00:00"
  },
  "new_users": 10,
  "new_enrollments": 50,
  "course_completions": 25,
  "new_courses": 5,
  "recent_users": [...],
  "recent_enrollments": [...]
}
```

## Discussion Endpoints

### Get Course Discussions

Get all discussions for a course.

```http
GET /api/courses/{course_id}/discussions
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "id": 1,
    "course_id": 1,
    "user_id": 1,
    "author_name": "John Doe",
    "author_avatar": "https://...",
    "content": "Great course!",
    "is_private": false,
    "created_at": "2024-01-01T00:00:00",
    "upvotes": 5,
    "downvotes": 1,
    "user_vote": 1
  }
]
```

### Create Discussion

Create a new discussion post.

```http
POST /api/courses/{course_id}/discussions
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "content": "Great course!",
  "is_private": false,
  "lesson_id": "lesson-mongo-id",
  "parent_id": null
}
```

**Response:** Created discussion object

### Update Discussion

Update a discussion post.

```http
PUT /api/discussions/{comment_id}
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "content": "Updated content",
  "is_private": false
}
```

**Response:** Updated discussion object

### Delete Discussion

Delete a discussion post (Admin only).

```http
DELETE /api/discussions/{comment_id}
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:**

```json
{
  "message": "Comment deleted successfully"
}
```

### Vote on Discussion

Vote on a discussion post.

```http
POST /api/discussions/{comment_id}/vote
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "vote_type": 1
}
```

**Response:**

```json
{
  "message": "Vote registered"
}
```

### Reply to Message

Admin reply to a private message.

```http
POST /api/discussions/{comment_id}/reply
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**

```json
{
  "content": "Thank you for your question!"
}
```

**Response:**

```json
{
  "message": "Reply sent successfully"
}
```

## Chat & Direct Messaging Endpoints

### Get Chat Partners

Get available chat partners.

```http
GET /api/chat-partners
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "avatar": "https://...",
    "role": "learner"
  }
]
```

### Get Conversations

Get all conversation summaries for the current user.

```http
GET /api/chats
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "partner_id": 1,
    "partner_name": "John Doe",
    "partner_avatar": "https://...",
    "partner_role": "learner",
    "last_message": "Hello!",
    "last_message_at": "2024-01-01T00:00:00",
    "unread_count": 2
  }
]
```

### Get Messages with Partner

Get the full message history between the current user and a partner.

```http
GET /api/chats/{partner_id}
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "id": 1,
    "sender_id": 1,
    "receiver_id": 2,
    "sender_name": "John Doe",
    "sender_avatar": "https://...",
    "content": "Hello!",
    "is_read": true,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### Send Direct Message

Send a direct message to a user.

```http
POST /api/chats/{partner_id}
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "content": "Hello!"
}
```

**Response:** Created message object

### Mark Messages Read

Mark all messages from a partner as read.

```http
PUT /api/chats/{partner_id}/read
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "message": "Messages marked as read"
}
```

## Learner Dashboard Endpoints

### Get Learner Stats

Get learner dashboard statistics.

```http
GET /api/learner/stats
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "courses_in_progress": 3,
  "courses_completed": 2,
  "lessons_completed": 15,
  "total_enrolled": 5
}
```

### Get Course Leaderboard

Get course leaderboard.

```http
GET /api/courses/{course_id}/leaderboard
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "rank": 1,
    "user_id": 1,
    "name": "John Doe",
    "avatar": "https://...",
    "completed_lessons": 10,
    "total_lessons": 10,
    "progress_percentage": 100,
    "total_seconds_spent": 3600
  }
]
```

### Track Course Time

Heartbeat endpoint to track time spent in a course/lesson.

```http
POST /api/courses/{course_id}/telemetry
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "lesson_id": "lesson-mongo-id",
  "seconds_spent": 300
}
```

**Response:**

```json
{
  "status": "success"
}
```

## Audit Log Endpoints (Admin Only)

### Get Audit Logs

Get audit logs with filtering.

```http
GET /api/audit-logs
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**

- `user_id` (int): Filter by user ID
- `action` (string): Filter by action type
- `search` (string): Search by user email/name
- `limit` (int): Number of results (max: 100)

**Response:**

```json
[
  {
    "id": 1,
    "user_id": 1,
    "user_email": "john@example.com",
    "user_name": "John Doe",
    "action": "user_login",
    "resource_type": "user",
    "resource_id": 1,
    "details": null,
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

## Utility Endpoints

### Health Check

Health check endpoint for monitoring.

```http
GET /api/health
```

**Response:**

```json
{
  "status": "healthy",
  "databases": {
    "postgresql": "connected",
    "mongodb": "connected"
  }
}
```

### Upload Media

Upload media to Cloudinary (Admin only).

```http
POST /api/upload
```

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:** `multipart/form-data` with `file` field

**Response:**

```json
{
  "url": "https://res.cloudinary.com/...",
  "public_id": "..."
}
```

## Next Steps

- **[Getting Started](./getting-started)** - Set up LearnFlow locally
- **[Architecture](./architecture)** - Understand the system design
- **[Database Design](./database-design)** - Understand the database schema
- **[User Guides](./user-guides/admin-guide)** - Learn how to use the application
