---
sidebar_position: 4
---

# Features

LearnFlow provides a comprehensive set of features for both learners and administrators. This document details all available features.

## Learner Features

### Course Browsing & Discovery

- **Browse Courses**: View all available courses with filtering options
- **Search**: Search courses by title and description
- **Filter by Category**: Filter courses by category (Programming, Design, Marketing, Business, Data Science)
- **Filter by Level**: Filter courses by difficulty level (Beginner, Intermediate, Advanced)
- **Course Details**: View detailed course information including lessons, instructor, and duration

### Enrollment & Progress Tracking

- **Course Enrollment**: Enroll in courses with one click
- **Progress Tracking**: Visual progress indicators showing completion percentage
- **Lesson Completion**: Mark lessons as complete
- **Unenrollment**: Unenroll from courses (clears progress)
- **My Learning Dashboard**: View all enrolled courses with progress

### Interactive Lesson Viewer

- **Video Content**: Watch video lessons
- **Text Content**: Read text-based lessons
- **Lesson Notes**: Access additional notes for each lesson
- **Progress Tracking**: Automatic progress tracking as you complete lessons
- **Time Tracking**: Track time spent on each lesson

### Social Features

- **Course Discussions**: Participate in course discussions
- **Q&A**: Ask questions and get answers
- **Voting System**: Upvote/downvote discussion posts
- **Private Messages**: Send private messages to instructors
- **Direct Messaging**: Chat directly with admins/instructors

### Leaderboards

- **Course Leaderboards**: See top performers in each course
- **Progress Ranking**: Ranked by completion percentage and time spent
- **Public/Private**: Leaderboards can be public or private (admin controlled)

### User Experience

- **Dark/Light Theme**: Toggle between dark and light themes
- **Responsive Design**: Fully responsive for mobile, tablet, and desktop
- **Smooth Animations**: Framer Motion animations for transitions
- **Intuitive Navigation**: Easy-to-use sidebar and top navigation

## Admin Features

### Dashboard & Analytics

- **Platform Statistics**: View total users, courses, enrollments
- **Active Users**: Track users with active enrollments
- **Published Courses**: Monitor published course count
- **Category Distribution**: See course distribution by category
- **Enrollment Trends**: Track enrollment trends over time
- **User Growth**: Monitor user growth over months
- **Platform Insights**: Average lesson views, completion rates

### Course Management

- **Create Courses**: Create new courses with metadata
- **Edit Courses**: Update course information
- **Delete Courses**: Remove courses (with cascade delete of lessons)
- **Publish/Unpublish**: Control course visibility
- **Course Categories**: Organize courses by category
- **Course Levels**: Set difficulty levels
- **Thumbnail & Banner**: Upload course images via Cloudinary

### Lesson Management

- **Add Lessons**: Add lessons to courses
- **Edit Lessons**: Update lesson content
- **Delete Lessons**: Remove lessons
- **Lesson Types**: Support for video and text lessons
- **Lesson Duration**: Set estimated duration for each lesson
- **Lesson Notes**: Add additional notes for learners

### User Management

- **View Users**: List all users with filtering
- **User Details**: View detailed user information
- **Role Management**: Update user roles (admin/learner)
- **Block/Unblock**: Block or unblock user accounts
- **User Statistics**: View user enrollment and completion stats

### Reporting

- **Course Reports**: Generate reports on course performance
- **Student Reports**: Generate reports on student progress
- **User Reports**: Generate reports on user activity
- **Activity Reports**: Track recent platform activity
- **Filterable Reports**: Filter by date range, category, level, status

### Communication

- **Admin Messages**: View all private messages across the platform
- **Reply to Messages**: Respond to learner inquiries
- **Direct Messaging**: Chat with learners
- **Message Threads**: Organized conversation threads

### Audit & Security

- **Audit Logs**: Track all user actions
- **Action Filtering**: Filter logs by user, action type
- **Search**: Search logs by user email or name
- **IP Tracking**: Track IP addresses for security
- **User Agent Tracking**: Store user agent information

## Technical Features

### Authentication & Authorization

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin and Learner roles
- **Protected Routes**: Frontend route protection
- **Token Expiration**: Configurable token expiration
- **Google OAuth**: Sign in with Google

### API Features

- **RESTful API**: Standard REST conventions
- **OpenAPI Documentation**: Auto-generated API docs at `/docs`
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Pydantic schema validation
- **Error Handling**: Consistent error responses

### Database Features

- **Dual Database**: PostgreSQL + MongoDB
- **ACID Compliance**: PostgreSQL for critical data
- **Flexible Schema**: MongoDB for content
- **Data Relationships**: Proper foreign key relationships
- **Audit Logging**: Track all database changes

### DevOps Features

- **Docker Support**: Containerized application
- **Docker Compose**: Multi-container orchestration
- **Easy Deployment**: One-command deployment
- **Health Checks**: API health monitoring
- **Environment Configuration**: Flexible environment variables

### Performance Features

- **Rate Limiting**: Prevent abuse
- **Pagination**: Limit result sets
- **Caching**: Efficient data retrieval
- **Async Support**: FastAPI async capabilities
- **Optimized Builds**: Vite production builds

### Security Features

- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: Secure authentication
- **Input Validation**: Prevent injection attacks
- **XSS Protection**: HTML sanitization
- **CORS Protection**: Configured CORS headers
- **Rate Limiting**: Prevent brute force attacks
- **Audit Logging**: Track all actions
- **IP Tracking**: Monitor suspicious activity

## Feature Comparison

| Feature           | Learner | Admin |
| ----------------- | ------- | ----- |
| Browse Courses    | ✅      | ✅    |
| Enroll in Courses | ✅      | ❌    |
| Track Progress    | ✅      | ❌    |
| View Lessons      | ✅      | ✅    |
| Create Courses    | ❌      | ✅    |
| Edit Courses      | ❌      | ✅    |
| Delete Courses    | ❌      | ✅    |
| Manage Users      | ❌      | ✅    |
| View Analytics    | ❌      | ✅    |
| View Audit Logs   | ❌      | ✅    |
| Send Messages     | ✅      | ✅    |
| View All Messages | ❌      | ✅    |
| Manage Lessons    | ❌      | ✅    |
| Generate Reports  | ❌      | ✅    |

## Next Steps

- **[Getting Started](./getting-started)** - Set up LearnFlow locally
- **[Architecture](./architecture)** - Understand the system design
- **[API Reference](./api-reference)** - Explore the API endpoints
- **[User Guides](./user-guides/admin-guide)** - Learn how to use the application
