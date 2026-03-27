---
sidebar_position: 2
---

# Getting Started

This guide will help you set up and run LearnFlow on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** and **Docker Compose** (recommended for easiest setup)
- **Python 3.8+** (for local backend development)
- **Node.js 18+** (for local frontend development)
- **Git**

## Quick Start with Docker Compose

The easiest way to run LearnFlow is using Docker Compose:

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd learnflow_app
```

### 2. Create Environment Variables

Create a `.env` file in the project root with the following variables:

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

### 3. Start All Services

```bash
docker compose up --build
```

> **Note**: If you get "docker-compose: not found", make sure Docker is installed and try using `docker compose` (with a space) instead of `docker-compose` (with a hyphen).

### 4. Verify Services

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

Test the health endpoint:

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

## Local Development Setup

If you prefer to run services locally for development:

### 1. Start Databases with Docker

```bash
# Start PostgreSQL
docker run -d --name learnflow-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=learnflow \
  -p 5432:5432 postgres

# Start MongoDB
docker run -d --name learnflow-mongodb \
  -p 27017:27017 \
  mongo
```

### 2. Start the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create backend .env file
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learnflow
MONGO_URL=mongodb://localhost:27017/
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
RATE_LIMIT_PER_MINUTE=60
DEBUG=true
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EOF

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create frontend .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start development server
npm run dev
```

## Managing User Roles

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

## Common Docker Commands

Here are the key commands used during development and troubleshooting:

```bash
# Start all services in detached mode (runs in background)
docker compose up -d

# Rebuild a specific service after code changes
docker compose build frontend
docker compose build backend

# Rebuild all services
docker compose build

# Check user roles in the database
docker exec -i learnflow-postgres psql -U postgres -d learnflow -c "SELECT id, email, role FROM users WHERE email = 'admin@gmail.com';"

# View backend logs
docker compose logs backend

# View all container logs
docker compose logs

# Check container status
docker compose ps

# Restart a specific container
docker compose restart backend

# Stop all containers
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v
```

## Troubleshooting

### Issue: "connection to server at localhost port 5432 failed"

This happens when the backend tries to connect to PostgreSQL using `localhost` instead of the Docker service name.

**Solution:**

- Ensure the `.env` file uses the correct Docker service names
- In docker-compose.yml, the backend uses `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/learnflow`
- The service name `postgres` refers to the PostgreSQL container, not localhost

### Issue: Container name conflicts

If you see errors about duplicate container names:

**Solution:**

```bash
docker compose down -v
docker compose up -d
```

### Issue: Port already in use

If ports 3000, 8000, 5432, or 27017 are already in use:

**Solution:** Stop local services using those ports or modify docker-compose.yml to use different ports.

### Issue: Missing email-validator

If you see an import error for email-validator:

**Solution:** Ensure `email-validator==2.1.0` is in `backend/requirements.txt`

### Issue: ContainerConfig Error when rebuilding

If you see an error like `KeyError: 'ContainerConfig'` when rebuilding a container after code changes:

**Solution:**

```bash
# Remove the existing container first, then recreate
docker compose rm -f backend  # or frontend
docker compose up -d backend   # or frontend
```

Or for a full rebuild:

```bash
docker compose down
docker compose up --build
```

### Issue: Old containers interfering

If containers behave unexpectedly:

**Solution:**

```bash
docker compose down -v --remove-orphans
docker compose up --build
```

## Next Steps

Now that you have LearnFlow running, explore:

- **[Features](./features)** - Learn about all available features
- **[Architecture](./architecture)** - Understand the system design
- **[API Reference](./api-reference)** - Explore the API endpoints
- **[User Guides](./user-guides/admin-guide)** - Learn how to use the application
