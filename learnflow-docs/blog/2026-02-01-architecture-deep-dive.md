---
slug: architecture-deep-dive
title: LearnFlow Architecture Deep Dive
authors: [learnflow]
tags: [architecture, technical, databases]
---

LearnFlow uses a modern, dual-database architecture that leverages the strengths of both SQL and NoSQL databases. In this post, we'll explore the technical decisions behind our architecture.

<!-- truncate -->

## Why Dual Database Architecture?

LearnFlow uses both PostgreSQL and MongoDB to optimize for different data access patterns:

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

## Frontend Architecture

Our frontend is built with:

- **React 19**: Modern UI component library with hooks
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animations and transitions

### Key Frontend Patterns

1. **Context API**: Used for global state management (Auth, Theme)
2. **Protected Routes**: Role-based route protection
3. **Service Layer**: Centralized API calls
4. **Component Composition**: Reusable, composable components

## Backend Architecture

Our backend is built with:

- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: SQL ORM toolkit
- **JWT**: Token-based authentication
- **bcrypt**: Password hashing
- **slowapi**: Rate limiting

### Key Backend Patterns

1. **Dependency Injection**: FastAPI's Depends for database sessions
2. **Pydantic Schemas**: Request/response validation
3. **Middleware**: CORS, rate limiting, error handling
4. **Service Layer**: Separated business logic

## Authentication Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  Client  │      │  Backend │      │ Database │
└──────────┘      └──────────┘      └──────────┘
     │                  │                  │
     │ POST /login      │                  │
     │─────────────────>│                  │
     │                  │ Verify password  │
     │                  │─────────────────>│
     │                  │                  │
     │                  │<─────────────────│
     │                  │                  │
     │                  │ Create JWT token │
     │                  │─────────────────>│
     │                  │                  │
     │<─────────────────│                  │
     │ JWT token        │                  │
```

## Design Decisions

### 1. FastAPI over Flask/Django

**Decision**: Use FastAPI for the backend.

**Rationale**:

- Automatic OpenAPI documentation
- Native async support for better performance
- Type validation with Pydantic
- Modern Python features

### 2. React with Vite

**Decision**: Use React 19 with Vite build tool.

**Rationale**:

- Fast development server
- Optimized production builds
- Large ecosystem
- Modern hooks API

### 3. JWT over Sessions

**Decision**: Stateless JWT authentication.

**Rationale**:

- Scalable across multiple servers
- No session storage needed
- Mobile-friendly tokens

### 4. Dual Database

**Decision**: PostgreSQL + MongoDB.

**Rationale**:

- PostgreSQL for ACID-critical data (users, payments)
- MongoDB for flexible content (lessons, progress)

## What's Next?

We're planning to evolve our architecture with:

- Microservices decomposition
- Event-driven architecture
- Advanced caching strategies
- Real-time features with WebSockets

## Learn More

Check out our [architecture documentation](/docs/architecture) for more details.
