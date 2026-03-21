# LearnFlow - Modern Learning Management System

A full-stack Learning Management System (LMS) built with React, FastAPI, PostgreSQL, and MongoDB. This is the production-ready version with security enhancements.

## Features

### For Learners
- Browse and search courses by category and level
- Track learning progress with visual indicators
- Interactive lesson viewer with video and text content
- Dark/Light theme support
- Responsive design for all devices

### For Admins
- Comprehensive dashboard with analytics
- Course creation and management
- Lesson management
- User management with role-based access
- Audit logs for security and compliance

## Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### Backend
- **FastAPI** - Modern, fast Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Relational database
- **MongoDB** - NoSQL database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **slowapi** - Rate limiting

## Quick Start

### Prerequisites
- Docker and Docker Compose installed (for databases)
- Python 3.8+
- Node.js 18+
- Git

### Running the Application

#### Option 1: With Docker (Databases only)

1. Start PostgreSQL and MongoDB:
```bash
docker start learnflow-postgres learnflow-mongodb
```

2. Start the Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

3. Start the Frontend (in a new terminal):
```bash
cd frontend
npm install
npm run dev
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

#### Option 2: Docker Compose (Full Stack)

```bash
docker-compose up
```

## Environment Variables

### Backend (.env)
```env
# Database Configuration
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/learnflow
MONGO_URL=mongodb://localhost:27017/

# JWT Authentication Configuration
SECRET_KEY=your-super-secret-key-change-in-production-use-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Rate Limiting Configuration
RATE_LIMIT_PER_MINUTE=60

# Application Configuration
DEBUG=true
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

## Demo Credentials

Register a new account or use the credentials provided by the admin.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/profile` - Update profile

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/{id}` - Get course details
- `POST /api/courses` - Create course (Admin)
- `PUT /api/courses/{id}` - Update course (Admin)
- `DELETE /api/courses/{id}` - Delete course (Admin)

### Lessons
- `GET /api/courses/{id}/lessons` - Get course lessons
- `POST /api/courses/{id}/lessons` - Add lesson (Admin)

### Progress
- `GET /api/courses/{id}/progress` - Get user progress
- `POST /api/courses/{id}/progress` - Update lesson progress

### Admin
- `GET /api/users` - List all users (Admin)
- `GET /api/audit-logs` - View audit logs (Admin)
- `GET /api/analytics/stats` - Get analytics (Admin)

## Database Architecture

### PostgreSQL (Relational)
Stores structured, relational data:
- **Users** - Account information, roles
- **Courses** - Course metadata, pricing
- **Enrollments** - User-course relationships
- **Audit Logs** - Security and compliance tracking

### MongoDB (NoSQL)
Stores flexible, hierarchical data:
- **Course Content** - Lessons with varying structures
- **User Progress** - Completion tracking per lesson

## Security Features

- **Password Hashing** - bcrypt with salt
- **JWT Tokens** - Stateless authentication with configurable expiration
- **Role-Based Access** - Admin/Learner permissions
- **Audit Logging** - All actions tracked with IP and user agent
- **Input Validation** - Pydantic schemas with XSS sanitization
- **Password Complexity** - Requires uppercase, lowercase, and digit
- **Rate Limiting** - 5 req/min (register), 10 req/min (login)
- **CORS Protection** - Configured for production
- **Secure Configuration** - JWT secret loaded from environment variables

## Microservices Decomposition

The current monolith can be split into:

1. **Auth Service** - User authentication and authorization
2. **Course Service** - Course and lesson management
3. **Progress Service** - User progress tracking
4. **Analytics Service** - Reporting and analytics

Each service would have its own database and communicate via REST or message queue.

## Project Structure

```
learnflow_app/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── auth.py          # Authentication & JWT
│   │   ├── database.py      # PostgreSQL config
│   │   └── mongo_service.py # MongoDB operations
│   ├── .env                 # Environment variables
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/        # API services
│   │   └── App.jsx          # Main app component
│   ├── .env                # API URL config
│   ├── package.json
│   └── Dockerfile
├── .vscode/                # VSCode settings
├── .gitignore
└── README.md
```

## VSCode Setup

For Python import resolution:
1. Press `Ctrl+Shift+P`
2. Select "Python: Select Interpreter"
3. Choose `backend/venv/bin/python`

Or reload the window: `Ctrl+Shift+P` → "Developer: Reload Window"

. /home/wachira/Documents/Kbc\ project/Kbc_Assessment/learnflow_app/backend/venv/bin/activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

