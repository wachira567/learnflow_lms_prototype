---
sidebar_position: 1
slug: /
---

# LearnFlow Documentation

Welcome to **LearnFlow**, a modern, full-stack Learning Management System (LMS) built with React, FastAPI, PostgreSQL, and MongoDB.

## What is LearnFlow?

LearnFlow is a comprehensive Learning Management System that enables administrators to create and manage courses while allowing learners to browse, enroll, and track their progress through lessons. The system implements role-based access control with two primary roles: **Admin** and **Learner**.

## Key Features

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

## Quick Start

Get started with LearnFlow in minutes:

```bash
# Clone the repository
git clone <your-repo-url>
cd learnflow_app

# Create .env file with environment variables
# Start all services with Docker Compose
docker compose up --build
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Documentation Structure

This documentation is organized into the following sections:

- **[Getting Started](./getting-started)** - Installation and setup guide
- **[Architecture](./architecture)** - System architecture and design decisions
- **[Features](./features)** - Detailed feature documentation
- **[API Reference](./api-reference)** - Complete API documentation
- **[Database Design](./database-design)** - Database schema and design
- **[Security](./security)** - Security features and best practices
- **[Deployment](./deployment)** - Deployment guide and Docker setup
- **[User Guides](./user-guides/admin-guide)** - Guides for Admin and Learner users

## Project Overview

LearnFlow demonstrates full-stack development skills including:

- ✅ Full-stack implementation with React frontend and FastAPI backend
- ✅ Dual-database architecture (PostgreSQL + MongoDB)
- ✅ JWT-based authentication with role-based access
- ✅ RESTful API design with comprehensive documentation
- ✅ Docker Compose for easy deployment
- ✅ Audit logging for security and compliance
- ✅ Clean, modular code structure

## Getting Help

If you need help or have questions:

1. Check the [Getting Started](./getting-started) guide
2. Review the [API Reference](./api-reference) for endpoint details
3. Explore the [Architecture](./architecture) documentation
4. Check the [FAQ](./faq) section

## License

This project is for demonstration purposes as part of a technical assessment.
