# LearnFlow - Learning Management System

[![Docker Compose](https://img.shields.io/badge/Docker-Compose-blue)](https://docs.docker.com/compose/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react)](https://react.dev/)

A modern, full-stack Learning Management System (LMS) prototype built with React, FastAPI, PostgreSQL, and MongoDB. This project demonstrates full-stack development skills including frontend, backend, dual-database architecture, and modern DevOps practices.

## Quick Start (Docker Compose)

```bash
# Clone the repository
git clone <your-repo-url>
cd learnflow_app

# Create .env file with environment variables (see below)
# Start all services with one command (using Docker Compose V2 plugin)
docker compose up --build

# OR if you have the older docker-compose standalone command:
docker-compose up --build
```

> **Note**: If you get "docker-compose: not found", make sure Docker is installed and try using `docker compose` (with a space) instead of `docker-compose` (with a hyphen). The `docker compose` command is the newer plugin-based version included with Docker Desktop and recent Docker installations.

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Documentation**: [LearnFlow Docs](https://learnflow-lms-prototype.vercel.app/)

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Docker Setup Guide](#docker-setup-guide)
- [Managing User Roles](#managing-user-roles)
- [API Documentation](#api-documentation)
- [Database Design](#database-design)
- [Security Features](#security-features)
- [Microservices Architecture](#microservices-architecture)
- [Design Decisions \& Trade-offs](#design-decisions--trade-offs)
- [Project Structure](#project-structure)
- [Documentation](https://learnflow-lms-prototype.vercel.app/)

---

## Project Overview

LearnFlow is a Learning Management System that enables administrators to create and manage courses while allowing learners to browse, enroll, and track their progress through lessons. The system implements role-based access control with two primary roles: **Admin** and **Learner**.

### Key Objectives Met

- Full-stack implementation with React frontend and FastAPI backend
- Dual-database architecture (PostgreSQL + MongoDB)
- JWT-based authentication with role-based access
- RESTful API design with comprehensive documentation
- Docker Compose for easy deployment
- Audit logging for security and compliance
- Clean, modular code structure

---

## Tech Stack

### Frontend

| Technology    | Purpose                         |
| ------------- | ------------------------------- |
| React 19      | UI Component Library            |
| Vite          | Build Tool & Development Server |
| React Router  | Client-side Routing             |
| Tailwind CSS  | Utility-first CSS Framework     |
| Framer Motion | Animations & Transitions        |
| Lucide React  | Icon Library                    |

### Backend

| Technology | Purpose                              |
| ---------- | ------------------------------------ |
| FastAPI    | Modern Python Web Framework          |
| SQLAlchemy | SQL ORM Toolkit                      |
| PostgreSQL | Relational Database (Users, Courses) |
| MongoDB    | NoSQL Database (Content, Progress)   |
| JWT        | Token-based Authentication           |
| bcrypt     | Password Hashing                     |
| slowapi    | Rate Limiting                        |

### DevOps

| Technology     | Purpose                       |
| -------------- | ----------------------------- |
| Docker         | Containerization              |
| Docker Compose | Multi-container Orchestration |

---

## Features

### For Learners

- 📚 Browse and search courses by category and level
- 🎯 Track learning progress with visual indicators
- 📖 Interactive lesson viewer (video and text content)
- 🏆 Course leaderboards
- 💬 Course discussions and Q&A
- 💬 Direct messaging with instructors
- 🌙 Dark/Light theme support
- 📱 Fully responsive design

### For Administrators

- 📊 Comprehensive analytics dashboard
- 📝 Course creation and management
- 📖 Lesson management with multiple content types
- 👥 User management with role-based access
- 📋 Audit logs for security and compliance
- 📈 Platform insights and reporting
- 📅 Activity reports and trends

---

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Python 3.8+ (for local development)
- Node.js 18+ (for local development)
- Git

### Running with Docker Compose

The easiest way to run the entire stack:

```bash
# Clone the repository and navigate to the project
cd learnflow_app

# Create .env file (see Environment Variables section)
# Then start all services
docker-compose up
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Running Locally (Development)

#### 1. Start Databases with Docker

```bash
docker run -d --name learnflow-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=learnflow \
  -p 5432:5432 postgres

docker run -d --name learnflow-mongodb \
  -p 27017:27017 \
  mongo
```

#### 2. Start the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables (see .env file)
cp .env.example .env

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

> **Important**: All required API keys and secrets are provided in our [Environment Setup Guide](https://docs.google.com/document/d/1GE1Qd-3u9wpCa-oIdrsz1zBZTsw_UvRBqd-i-cN339A/edit?usp=sharing). This document contains all the values you need to run the application.

### Creating the .env File

Create a `.env` file in the project root (`learnflow_app/.env`) with the values from the Environment Setup Guide above.

```env
# Database Configuration (for Docker, these are handled by docker-compose)
# PostgreSQL: postgresql://postgres:postgres@postgres:5432/learnflow
# MongoDB: mongodb://admin:admin@mongodb:27017/

# JWT Authentication
SECRET_KEY=your-secret-key-here-generate-with-openssl-rand-base64-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Rate Limiting Configuration
RATE_LIMIT_PER_MINUTE=60

# Google OAuth Configuration (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Cloudinary Configuration (get from Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application Configuration
DEBUG=true
```

### Backend (`.env`) - For Local Development

Create `backend/.env`:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learnflow
MONGO_URL=mongodb://localhost:27017/

# JWT Authentication
SECRET_KEY=your-secret-key-here-generate-with-openssl-rand-base64-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Application
DEBUG=true

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Cloudinary (get from Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (`.env`) - For Local Development

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Docker Setup Guide

### Installing Docker

#### On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

#### On macOS:

Download and install Docker Desktop from https://www.docker.com/products/docker-desktop

#### On Windows:

Download and install Docker Desktop from https://www.docker.com/products/docker-desktop

### Running the Application

1. **Navigate to the project directory:**

   ```bash
   cd learnflow_app
   ```

2. **Create the `.env` file** (see Environment Variables section above)

3. **Start all services:**

   ```bash
   docker-compose up --build
   ```

4. **Verify services are running:**

   ```bash
   docker-compose ps
   ```

   You should see:
   - learnflow-postgres (port 5432)
   - learnflow-mongodb (port 27017)
   - learnflow-backend (port 8000)
   - learnflow-frontend (port 3000)

5. **Test the health endpoint:**

   ```bash
   curl http://localhost:8000/api/health
   ```

   Expected response:

   ```json
   {
     "status": "healthy",
     "databases": { "postgresql": "connected", "mongodb": "connected" }
   }
   ```

### Common Docker Commands

Here are the key commands used during development and troubleshooting:

```bash
# Start all services in detached mode (runs in background)
cd learnflow_app
docker-compose up -d

# Rebuild a specific service after code changes
docker-compose build frontend
docker-compose build backend

# Rebuild all services
docker-compose build

# Check user roles in the database
docker exec -i learnflow-postgres psql -U postgres -d learnflow -c "SELECT id, email, role FROM users WHERE email = 'admin@gmail.com';"

# View backend logs
docker-compose logs backend

# View all container logs
docker-compose logs

# Check container status
docker-compose ps

# Restart a specific container
docker-compose restart backend

# Stop all containers
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

---

### Troubleshooting Common Docker Issues

#### Issue: "connection to server at localhost port 5432 failed"

This happens when the backend tries to connect to PostgreSQL using `localhost` instead of the Docker service name.

**Solution:**

- Ensure the `.env` file uses the correct Docker service names
- In docker-compose.yml, the backend uses `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/learnflow`
- The service name `postgres` refers to the PostgreSQL container, not localhost

#### Issue: Container name conflicts

If you see errors about duplicate container names:

**Solution:**

```bash
docker-compose down -v
docker-compose up -d
```

#### Issue: Port already in use

If ports 3000, 8000, 5432, or 27017 are already in use:

**Solution:**
Stop local services using those ports or modify docker-compose.yml to use different ports.

#### Issue: Missing email-validator

If you see an import error for email-validator:

**Solution:**
Ensure `email-validator==2.1.0` is in `backend/requirements.txt`

#### Issue: ContainerConfig Error when rebuilding

If you see an error like `KeyError: 'ContainerConfig'` when rebuilding a container after code changes:

**Solution:**

```bash
# Remove the existing container first, then recreate
docker-compose rm -f backend  # or frontend
docker-compose up -d backend   # or frontend
```

Or for a full rebuild:

```bash
docker-compose down
docker-compose up --build
```

#### Issue: Old containers interfering

If containers behave unexpectedly:

**Solution:**

```bash
docker-compose down -v --remove-orphans
docker-compose up --build
```

---

## Managing User Roles

### Understanding the Role System

LearnFlow has two user roles:

- **LEARNER**: Default role for registered users - can browse and enroll in courses
- **ADMIN**: Can manage courses, lessons, users, and view analytics

### How Roles Work

1. **New users who register through the app** are automatically assigned the **LEARNER** role
2. **Only ADMIN users** can access the admin dashboard and manage other users
3. **Role upgrades must be done manually** in the database to prevent unauthorized admin access

### Upgrading a Learner to Admin

After a user registers, you can upgrade their role to ADMIN using the database:

```bash
# Connect to the PostgreSQL container
docker exec -it learnflow-postgres psql -U postgres -d learnflow

# Find the user (replace user@example.com with the user's email)
SELECT id, email, role FROM users WHERE email = 'user@example.com';

# Update the role to ADMIN
UPDATE users SET role = 'ADMIN' WHERE email = 'user@example.com';

# Verify the change
SELECT id, email, role FROM users WHERE email = 'user@example.com';
```

Or run it in one command:

```bash
docker exec -i learnflow-postgres psql -U postgres -d learnflow -c "UPDATE users SET role = 'ADMIN' WHERE email = 'user@example.com';"
```

### Security Note

The registration endpoint does NOT allow creating admin users directly. This is intentional to prevent users from falsely registering as admins. All role changes must be performed by:

1. Direct database access (as shown above)
2. An existing admin user using the admin API (when available)

---

## API Documentation

### Base URL

```
http://localhost:8000/api
```

### Authentication Endpoints

| Method | Endpoint                    | Description                  | Auth Required |
| ------ | --------------------------- | ---------------------------- | ------------- |
| POST   | `/api/auth/register`        | Register new user            | No            |
| POST   | `/api/auth/login`           | Login and get JWT token      | No            |
| GET    | `/api/auth/me`              | Get current user info        | Yes           |
| PUT    | `/api/auth/profile`         | Update user profile          | Yes           |
| GET    | `/api/auth/google/url`      | Get Google OAuth URL         | No            |
| POST   | `/api/auth/google/callback` | Handle Google OAuth callback | No            |

### User Management Endpoints

| Method | Endpoint                     | Description       | Auth Required | Role  |
| ------ | ---------------------------- | ----------------- | ------------- | ----- |
| GET    | `/api/users`                 | Get all users     | Yes           | Admin |
| GET    | `/api/users/{user_id}`       | Get specific user | Yes           | Admin |
| PUT    | `/api/users/{user_id}/role`  | Update user role  | Yes           | Admin |
| POST   | `/api/users/{user_id}/block` | Toggle user block | Yes           | Admin |

### Course Endpoints

| Method | Endpoint                        | Description                        | Auth Required | Role  |
| ------ | ------------------------------- | ---------------------------------- | ------------- | ----- |
| GET    | `/api/courses`                  | List all courses                   | Yes           | Any   |
| GET    | `/api/courses/{course_id}`      | Get course details                 | Yes           | Any   |
| POST   | `/api/courses`                  | Create new course                  | Yes           | Admin |
| PUT    | `/api/courses/{course_id}`      | Update course                      | Yes           | Admin |
| DELETE | `/api/courses/{course_id}`      | Delete course                      | Yes           | Admin |
| GET    | `/api/courses/with-enrollments` | Get courses with enrollment counts | Yes           | Admin |
| GET    | `/api/categories`               | Get all categories                 | No            | -     |

### Lesson Endpoints

| Method | Endpoint                                       | Description          | Auth Required | Role  |
| ------ | ---------------------------------------------- | -------------------- | ------------- | ----- |
| GET    | `/api/courses/{course_id}/lessons`             | Get course lessons   | Yes           | Any   |
| POST   | `/api/courses/{course_id}/lessons`             | Add lesson to course | Yes           | Admin |
| PUT    | `/api/courses/{course_id}/lessons/{lesson_id}` | Update lesson        | Yes           | Admin |
| DELETE | `/api/courses/{course_id}/lessons/{lesson_id}` | Delete lesson        | Yes           | Admin |

### Enrollment & Progress Endpoints

| Method | Endpoint                            | Description             | Auth Required |
| ------ | ----------------------------------- | ----------------------- | ------------- |
| POST   | `/api/courses/{course_id}/enroll`   | Enroll in course        | Yes           |
| DELETE | `/api/courses/{course_id}/unenroll` | Unenroll from course    | Yes           |
| GET    | `/api/courses/{course_id}/progress` | Get course progress     | Yes           |
| POST   | `/api/courses/{course_id}/progress` | Update lesson progress  | Yes           |
| GET    | `/api/my-progress`                  | Get all user progress   | Yes           |
| GET    | `/api/learner/enrollments`          | Get learner enrollments | Yes           |

### Analytics & Reporting Endpoints

| Method | Endpoint                           | Description           | Auth Required | Role  |
| ------ | ---------------------------------- | --------------------- | ------------- | ----- |
| GET    | `/api/analytics/stats`             | Get platform stats    | Yes           | Admin |
| GET    | `/api/analytics/categories`        | Category distribution | Yes           | Admin |
| GET    | `/api/analytics/enrollment-trends` | Enrollment trends     | Yes           | Admin |
| GET    | `/api/analytics/user-growth`       | User growth data      | Yes           | Admin |
| GET    | `/api/analytics/insights`          | Platform insights     | Yes           | Admin |
| GET    | `/api/reports/courses`             | Course report         | Yes           | Admin |
| GET    | `/api/reports/students`            | Student report        | Yes           | Admin |
| GET    | `/api/reports/users`               | User report           | Yes           | Admin |
| GET    | `/api/reports/activity`            | Activity report       | Yes           | Admin |
| GET    | `/api/audit-logs`                  | Audit logs            | Yes           | Admin |

### Discussion & Messaging Endpoints

| Method | Endpoint                               | Description            | Auth Required |
| ------ | -------------------------------------- | ---------------------- | ------------- |
| GET    | `/api/courses/{course_id}/discussions` | Get course discussions | Yes           |
| POST   | `/api/courses/{course_id}/discussions` | Create discussion      | Yes           |
| PUT    | `/api/discussions/{comment_id}`        | Update discussion      | Yes           |
| DELETE | `/api/discussions/{comment_id}`        | Delete discussion      | Yes           |
| POST   | `/api/discussions/{comment_id}/vote`   | Vote on discussion     | Yes           |
| POST   | `/api/discussions/{comment_id}/reply`  | Reply to message       | Yes           |
| GET    | `/api/admin/messages`                  | Get admin messages     | Yes (Admin)   |
| GET    | `/api/my-messages`                     | Get learner messages   | Yes           |

### Chat & Direct Messaging Endpoints

| Method | Endpoint                       | Description               | Auth Required |
| ------ | ------------------------------ | ------------------------- | ------------- |
| GET    | `/api/chat-partners`           | Get chat partners         | Yes           |
| GET    | `/api/chats`                   | Get conversations         | Yes           |
| GET    | `/api/chats/{partner_id}`      | Get messages with partner | Yes           |
| POST   | `/api/chats/{partner_id}`      | Send direct message       | Yes           |
| PUT    | `/api/chats/{partner_id}/read` | Mark messages read        | Yes           |

### Learner Stats Endpoints

| Method | Endpoint                               | Description            | Auth Required |
| ------ | -------------------------------------- | ---------------------- | ------------- |
| GET    | `/api/learner/stats`                   | Get learner statistics | Yes           |
| GET    | `/api/courses/{course_id}/leaderboard` | Get course leaderboard | Yes           |
| POST   | `/api/courses/{course_id}/telemetry`   | Track time spent       | Yes           |

### Utility Endpoints

| Method | Endpoint      | Description         | Auth Required |
| ------ | ------------- | ------------------- | ------------- |
| GET    | `/`           | API health check    | No            |
| GET    | `/api/health` | Health check        | No            |
| POST   | `/api/upload` | Upload course media | Yes (Admin)   |

### Request/Response Schemas

#### User Registration

```json
POST /api/auth/register
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "Password123",
  "role": "learner"  // or "admin" - NOTE: Only for initial setup, normally defaults to learner
}
```

#### User Login

```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### Course Creation

```json
POST /api/courses
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

#### Lesson Creation

```json
POST /api/courses/{course_id}/lessons
{
  "title": "Variables and Data Types",
  "type": "video",  // or "text"
  "duration": "15 minutes",
  "content": "https://video-url.com/...",
  "notes": "Additional notes..."
}
```

#### Progress Update

```json
POST /api/courses/{course_id}/progress
{
  "lesson_id": "lesson-mongo-id",
  "completed": true
}
```

---

## Database Design

### Why Dual Database Architecture?

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

**Tables:**

- `users` - User accounts with roles
- `courses` - Course metadata
- `enrollments` - User-course relationships
- `comments` - Discussion posts
- `votes` - Discussion votes
- `audit_logs` - Security tracking
- `conversations` - Direct messages
- `telemetry` - Time tracking data

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

**Collections:**

- `lessons` - Course content with video/text
- `progress` - User progress per course
- `course_telemetry` - Detailed time tracking

---

## Security Features

| Feature             | Implementation             |
| ------------------- | -------------------------- |
| Password Hashing    | bcrypt with salt           |
| Authentication      | JWT tokens with expiration |
| Role-Based Access   | Admin/Learner permissions  |
| Input Validation    | Pydantic schemas           |
| XSS Protection      | HTML sanitization          |
| Rate Limiting       | slowapi (5-10 req/min)     |
| CORS Protection     | Configured for frontend    |
| Audit Logging       | All actions tracked        |
| IP Tracking         | Captured in audit logs     |
| User Agent Tracking | Stored for investigation   |

---

## Microservices Architecture

### Current Monolithic Structure

The backend is currently a monolith but structured with clear module separation:

```
backend/app/
├── main.py          # FastAPI application (entry point)
├── auth.py          # Authentication module
├── models.py        # SQLAlchemy models
├── schemas.py       # Pydantic schemas
├── database.py      # PostgreSQL configuration
└── mongo_service.py # MongoDB operations
```

### Proposed Microservices Decomposition

To scale the application, we would decompose into:

#### 1. **Auth Service** (`auth-service`)

- **Responsibility**: User registration, login, JWT token management
- **Database**: PostgreSQL (users table)
- **API**:
  - POST /register
  - POST /login
  - POST /refresh
  - GET /me

#### 2. **Course Service** (`course-service`)

- **Responsibility**: Course CRUD, lesson management
- **Database**: PostgreSQL (courses) + MongoDB (lessons)
- **API**:
  - CRUD /courses
  - CRUD /courses/{id}/lessons
  - GET /categories

#### 3. **Enrollment Service** (`enrollment-service`)

- **Responsibility**: User enrollments, progress tracking
- **Database**: PostgreSQL (enrollments) + MongoDB (progress)
- **API**:
  - POST /enroll
  - DELETE /unenroll
  - GET /progress
  - PUT /progress

#### 4. **Analytics Service** (`analytics-service`)

- **Responsibility**: Reporting, insights, leaderboards
- **Database**: PostgreSQL + MongoDB
- **API**:
  - GET /stats
  - GET /reports/\*
  - GET /leaderboards

#### 5. **Communication Service** (`communication-service`)

- **Responsibility**: Discussions, messaging, notifications
- **Database**: PostgreSQL
- **API**:
  - CRUD /discussions
  - CRUD /messages
  - WebSocket /ws

### Inter-Service Communication

- **Synchronous**: REST APIs for direct queries
- **Asynchronous**: RabbitMQ/Kafka for events (enrollment, progress updates)
- **API Gateway**: Single entry point for all services

### Benefits of Microservices

1. **Independent Scaling**: Scale auth independently from courses
2. **Technology Flexibility**: Use different databases per service
3. **Team Autonomy**: Separate teams for each domain
4. **Fault Isolation**: Failure in one service doesn't cascade
5. **Deployment Flexibility**: Deploy services independently

---

## Design Decisions & Trade-offs

### 1. FastAPI over Flask/Django

**Decision**: Use FastAPI for the backend.

**Rationale**:

- Automatic OpenAPI documentation
- Native async support for better performance
- Type validation with Pydantic
- Modern Python features

**Trade-off**: Smaller ecosystem compared to Django, but sufficient for this prototype.

### 2. React with Vite

**Decision**: Use React 19 with Vite build tool.

**Rationale**:

- Fast development server
- Optimized production builds
- Large ecosystem
- Modern hooks API

**Trade-off**: Client-side rendering SEO challenges (acceptable for LMS dashboard).

### 3. JWT over Sessions

**Decision**: Stateless JWT authentication.

**Rationale**:

- Scalable across multiple servers
- No session storage needed
- Mobile-friendly tokens

**Trade-off**: Token invalidation requires additional mechanisms (blocklist).

### 4. Dual Database

**Decision**: PostgreSQL + MongoDB.

**Rationale**:

- PostgreSQL for ACID-critical data (users, payments)
- MongoDB for flexible content (lessons, progress)

**Trade-off**: Additional complexity in data synchronization.

### 5. Tailwind CSS

**Decision**: Use Tailwind for styling.

**Rationale**:

- Rapid UI development
- Consistent design system
- Small bundle size (purged CSS)
- Easy theming (dark mode)

**Trade-off**: Learning curve for team, HTML can become verbose.

### 6. Rate Limiting Implementation

**Decision**: Use slowapi for rate limiting.

**Trade-off**:

- Adds latency for legitimate users if too aggressive
- Need to tune limits based on usage patterns

### 7. Cloudinary for Media

**Decision**: Use Cloudinary for image/video uploads.

**Rationale**:

- Handles large files
- Automatic optimization
- CDN delivery
- Transformation capabilities

**Trade-off**: External dependency, costs at scale.

---

## Project Structure

```
learnflow_app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application
│   │   ├── models.py            # SQLAlchemy ORM models
│   │   ├── schemas.py          # Pydantic request/response schemas
│   │   ├── auth.py              # JWT authentication logic
│   │   ├── database.py         # PostgreSQL configuration
│   │   └── mongo_service.py     # MongoDB operations
│   ├── .env                     # Environment variables
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile              # Backend container
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── common/         # Common components
│   │   │   └── layouts/        # Layout components
│   │   ├── pages/              # Page components
│   │   │   ├── admin/          # Admin pages
│   │   │   ├── auth/           # Auth pages
│   │   │   ├── learner/        # Learner pages
│   │   │   └── public/         # Public pages
│   │   ├── contexts/           # React contexts
│   │   ├── services/           # API service functions
│   │   ├── App.jsx             # Main app component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── .env                    # Frontend config
│   ├── package.json            # Node dependencies
│   ├── tailwind.config.js      # Tailwind configuration
│   └── vite.config.js          # Vite configuration
├── design/
│   └── WIREFRAMES.md           # UI wireframes and design
├── docker-compose.yml           # Docker orchestration
├── .env                         # Docker environment variables
├── lms.json                    # API documentation (exported from Swagger)
├── .gitignore
└── README.md
```

---

## License

This project is for demonstration purposes as part of a technical assessment.

---

## Author

LearnFlow LMS - Technical Assessment Project
