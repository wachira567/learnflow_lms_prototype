---
sidebar_position: 8
---

# Deployment

This guide covers deploying LearnFlow using Docker Compose and other deployment options.

## Docker Compose Deployment (Recommended)

The easiest way to deploy LearnFlow is using Docker Compose.

### Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)
- Git

### Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd learnflow_app

# Create .env file with environment variables
# Start all services
docker compose up --build
```

### Docker Compose Configuration

The `docker-compose.yml` file defines all services:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15
    container_name: learnflow-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: learnflow
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  mongodb:
    image: mongo:7
    container_name: learnflow-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: learnflow-backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/learnflow
      MONGO_URL: mongodb://admin:admin@mongodb:27017/
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 60
      RATE_LIMIT_PER_MINUTE: 60
      DEBUG: false
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      GOOGLE_REDIRECT_URI: ${GOOGLE_REDIRECT_URI}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      mongodb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: learnflow-frontend
    environment:
      VITE_API_URL: http://localhost:8000/api
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  mongodb_data:
```

### Environment Variables

Create a `.env` file in the project root:

```env
# JWT Authentication
SECRET_KEY=your-secret-key-here-generate-with-openssl-rand-base64-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Rate Limiting Configuration
RATE_LIMIT_PER_MINUTE=60

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application Configuration
DEBUG=false
```

### Starting Services

```bash
# Start all services in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Check service status
docker compose ps
```

### Verifying Deployment

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Expected response:
# {
#   "status": "healthy",
#   "databases": {
#     "postgresql": "connected",
#     "mongodb": "connected"
#   }
# }
```

### Stopping Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v
```

## Docker Configuration Files

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# frontend/nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## Production Deployment

### Environment Configuration

For production, update the following:

```env
# Use strong secret key
SECRET_KEY=your-very-strong-secret-key-here

# Use production URLs
GOOGLE_REDIRECT_URI=https://learnflow.example.com/auth/google/callback

# Disable debug mode
DEBUG=false
```

### Docker Compose Production

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15
    container_name: learnflow-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: learnflow
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  mongodb:
    image: mongo:7
    container_name: learnflow-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: learnflow-backend
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/learnflow
      MONGO_URL: mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017/
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 60
      RATE_LIMIT_PER_MINUTE: 60
      DEBUG: false
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - mongodb
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: learnflow-frontend
    environment:
      VITE_API_URL: https://api.learnflow.example.com/api
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: always

  nginx:
    image: nginx:alpine
    container_name: learnflow-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: always

volumes:
  postgres_data:
  mongodb_data:
```

### Nginx Reverse Proxy

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:80;
    }

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name learnflow.example.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name learnflow.example.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend docs
        location /docs {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

## Cloud Deployment

### AWS Deployment

**Using EC2:**

1. Launch an EC2 instance (Ubuntu 22.04)
2. Install Docker and Docker Compose
3. Clone the repository
4. Configure environment variables
5. Run `docker compose up -d`

**Using ECS:**

1. Create an ECS cluster
2. Define task definitions for each service
3. Create services for frontend, backend, databases
4. Configure load balancer
5. Set up auto-scaling

### Google Cloud Platform

**Using Cloud Run:**

```bash
# Build and push images
docker build -t gcr.io/PROJECT_ID/learnflow-backend ./backend
docker push gcr.io/PROJECT_ID/learnflow-backend

docker build -t gcr.io/PROJECT_ID/learnflow-frontend ./frontend
docker push gcr.io/PROJECT_ID/learnflow-frontend

# Deploy to Cloud Run
gcloud run deploy learnflow-backend \
  --image gcr.io/PROJECT_ID/learnflow-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy learnflow-frontend \
  --image gcr.io/PROJECT_ID/learnflow-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Deployment

**Using Azure Container Instances:**

```bash
# Create resource group
az group create --name learnflow-rg --location eastus

# Create container instances
az container create \
  --resource-group learnflow-rg \
  --name learnflow-backend \
  --image your-registry.azurecr.io/learnflow-backend \
  --dns-name-label learnflow-backend \
  --ports 8000

az container create \
  --resource-group learnflow-rg \
  --name learnflow-frontend \
  --image your-registry.azurecr.io/learnflow-frontend \
  --dns-name-label learnflow-frontend \
  --ports 80
```

## Database Backup & Recovery

### PostgreSQL Backup

```bash
# Backup database
docker exec learnflow-postgres pg_dump -U postgres learnflow > backup.sql

# Backup with timestamp
docker exec learnflow-postgres pg_dump -U postgres learnflow > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
docker exec learnflow-postgres pg_dump -U postgres learnflow | gzip > backup.sql.gz
```

### PostgreSQL Restore

```bash
# Restore database
docker exec -i learnflow-postgres psql -U postgres learnflow < backup.sql

# Restore from compressed backup
gunzip -c backup.sql.gz | docker exec -i learnflow-postgres psql -U postgres learnflow
```

### MongoDB Backup

```bash
# Backup database
docker exec learnflow-mongodb mongodump --db learnflow --out /backup

# Backup with timestamp
docker exec learnflow-mongodb mongodump --db learnflow --out /backup_$(date +%Y%m%d_%H%M%S)

# Compressed backup
docker exec learnflow-mongodb mongodump --db learnflow --archive=/backup.archive --gzip
```

### MongoDB Restore

```bash
# Restore database
docker exec learnflow-mongodb mongorestore --db learnflow /backup/learnflow

# Restore from archive
docker exec learnflow-mongodb mongorestore --archive=/backup.archive --gzip
```

### Automated Backups

Create a backup script:

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL backup
docker exec learnflow-postgres pg_dump -U postgres learnflow | gzip > $BACKUP_DIR/postgres_$DATE.sql.gz

# MongoDB backup
docker exec learnflow-mongodb mongodump --db learnflow --archive=/tmp/mongo_$DATE.archive --gzip
docker cp learnflow-mongodb:/tmp/mongo_$DATE.archive $BACKUP_DIR/

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete
```

Add to crontab:

```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

## Monitoring & Logging

### Health Checks

```bash
# Check all services
docker compose ps

# Check backend health
curl http://localhost:8000/api/health

# Check database connections
docker exec learnflow-postgres pg_isready -U postgres
docker exec learnflow-mongodb mongosh --eval "db.runCommand('ping')"
```

### Log Management

```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs backend
docker compose logs frontend

# Follow logs in real-time
docker compose logs -f backend

# View last 100 lines
docker compose logs --tail=100 backend
```

### Log Rotation

Configure Docker log rotation:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    deploy:
      replicas: 3
    ports:
      - "8000-8002:8000"

  frontend:
    build: ./frontend
    deploy:
      replicas: 2
    ports:
      - "3000-3001:80"
```

### Load Balancing

```nginx
# nginx.conf
upstream backend {
    server backend_1:8000;
    server backend_2:8000;
    server backend_3:8000;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

## Troubleshooting

### Common Issues

**Container won't start:**

```bash
# Check logs
docker compose logs backend

# Check container status
docker compose ps

# Restart container
docker compose restart backend
```

**Database connection failed:**

```bash
# Check database is running
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Test connection
docker exec learnflow-postgres psql -U postgres -d learnflow -c "SELECT 1;"
```

**Port already in use:**

```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

**Out of disk space:**

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune
```

## Security Considerations

### Production Security Checklist

- [ ] Use strong passwords for databases
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Configure CORS for production domain
- [ ] Set up automated backups
- [ ] Enable monitoring and alerting
- [ ] Regular security updates
- [ ] Use Docker secrets for sensitive data

### SSL/TLS Configuration

```bash
# Generate self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem -out fullchain.pem

# Use Let's Encrypt for production
certbot certonly --standalone -d learnflow.example.com
```

## Next Steps

- **[Getting Started](./getting-started)** - Set up LearnFlow locally
- **[Architecture](./architecture)** - Understand the system design
- **[Security](./security)** - Learn about security features
