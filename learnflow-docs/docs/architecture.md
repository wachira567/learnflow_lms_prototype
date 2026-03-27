---
sidebar_position: 3
---

# Architecture

This document describes the system architecture and design decisions of LearnFlow.

## System Overview

LearnFlow is a full-stack Learning Management System built with a modern architecture that separates concerns between frontend and backend, utilizing both SQL and NoSQL databases for optimal data storage.

## High-Level Architecture

The system consists of three main layers:

- **Frontend**: React 19 + Vite + Tailwind CSS + React Router
- **Backend**: FastAPI + SQLAlchemy + JWT Authentication
- **Databases**: PostgreSQL (Relational Data) + MongoDB (Flexible Content)

## Frontend Architecture

### Technology Stack

- **React 19**: Modern UI component library with hooks
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animations and transitions
- **Lucide React**: Icon library

### Project Structure

The frontend is organized into the following directories:

- **components**: Reusable UI components including auth, common, discussions, layouts, and leaderboard components
- **contexts**: React contexts for Auth and Theme management
- **pages**: Page components organized by admin, auth, learner, and public sections
- **services**: API service functions for analytics, API calls, authentication, chat, courses, and learner operations
- **App.jsx**: Main app component
- **main.jsx**: Entry point
- **index.css**: Global styles

### Key Frontend Patterns

1. **Context API**: Used for global state management (Auth, Theme)
2. **Protected Routes**: Role-based route protection
3. **Service Layer**: Centralized API calls
4. **Component Composition**: Reusable, composable components

## Backend Architecture

### Technology Stack

- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: SQL ORM toolkit
- **PostgreSQL**: Relational database
- **MongoDB**: NoSQL database
- **JWT**: Token-based authentication
- **bcrypt**: Password hashing
- **slowapi**: Rate limiting

### Project Structure

The backend is organized into the following modules:

- **main.py**: FastAPI application entry point
- **auth.py**: Authentication module
- **models.py**: SQLAlchemy ORM models
- **schemas.py**: Pydantic request/response schemas
- **database.py**: PostgreSQL configuration
- **mongo_service.py**: MongoDB operations
- **cloudinary_service.py**: Media upload service

### Key Backend Patterns

1. **Dependency Injection**: FastAPI's Depends for database sessions
2. **Pydantic Schemas**: Request/response validation
3. **Middleware**: CORS, rate limiting, error handling
4. **Service Layer**: Separated business logic

## Dual Database Architecture

### Why Two Databases?

LearnFlow uses both PostgreSQL and MongoDB to leverage the strengths of each:

### PostgreSQL (Relational) - Structured Data

**Use Cases:**

- User accounts and authentication
- Course metadata
- Enrollments
- Audit logs
- Discussion comments

**Rationale:**

- **ACID Compliance**: Critical for financial and user data
- **Structured Relationships**: Users to Courses to Enrollments
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

## Authentication Flow

The authentication flow works as follows:

1. Client sends POST request to `/login` endpoint
2. Backend verifies password against database
3. Backend creates JWT token and returns it to client
4. Client stores JWT token for subsequent requests
5. Client sends GET request to `/api/me` with JWT token
6. Backend verifies JWT and returns user data

## API Design

### RESTful Endpoints

LearnFlow follows REST conventions:

- **GET**: Retrieve resources
- **POST**: Create resources
- **PUT**: Update resources
- **DELETE**: Remove resources

### Base URL

The API is accessible at `http://localhost:8000/api`

### Authentication

All protected endpoints require a JWT token in the Authorization header using the Bearer scheme.

### Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Registration**: 5 requests/minute
- **Login**: 10 requests/minute
- **Other endpoints**: 60 requests/minute

## Design Decisions and Trade-offs

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

## Microservices Architecture (Future)

The backend is currently a monolith but structured with clear module separation. To scale the application, we would decompose into:

### 1. Auth Service

- **Responsibility**: User registration, login, JWT token management
- **Database**: PostgreSQL (users table)
- **API**:
  - POST /register
  - POST /login
  - POST /refresh
  - GET /me

### 2. Course Service

- **Responsibility**: Course CRUD, lesson management
- **Database**: PostgreSQL (courses) + MongoDB (lessons)
- **API**:
  - CRUD /courses
  - CRUD /courses/{id}/lessons
  - GET /categories

### 3. Enrollment Service

- **Responsibility**: User enrollments, progress tracking
- **Database**: PostgreSQL (enrollments) + MongoDB (progress)
- **API**:
  - POST /enroll
  - DELETE /unenroll
  - GET /progress
  - PUT /progress

### 4. Analytics Service

- **Responsibility**: Reporting, insights, leaderboards
- **Database**: PostgreSQL + MongoDB
- **API**:
  - GET /stats
  - GET /reports/\*
  - GET /leaderboards

### 5. Communication Service

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
4. **Fault Isolation**: Failure in one service does not cascade
5. **Deployment Flexibility**: Deploy services independently

## Next Steps

- **[Features](./features)** - Learn about all available features
- **[Database Design](./database-design)** - Understand the database schema
- **[API Reference](./api-reference)** - Explore the API endpoints
