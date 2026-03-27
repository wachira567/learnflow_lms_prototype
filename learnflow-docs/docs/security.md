---
sidebar_position: 7
---

# Security

LearnFlow implements comprehensive security measures to protect user data and prevent unauthorized access.

## Security Features Overview

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

## Authentication

### JWT Token-Based Authentication

LearnFlow uses JSON Web Tokens (JWT) for stateless authentication:

**Token Structure:**

```json
{
  "user_id": 1,
  "email": "user@example.com",
  "role": "learner",
  "exp": 1704067200
}
```

**Token Configuration:**

- **Algorithm**: HS256
- **Expiration**: 60 minutes (configurable)
- **Secret**: Environment variable `SECRET_KEY`

**Token Flow:**

1. User logs in with email/password
2. Server validates credentials
3. Server creates JWT token with user data
4. Client stores token in localStorage
5. Client sends token in Authorization header
6. Server validates token on each request

### Password Security

**Hashing Algorithm:** bcrypt with salt

**Implementation:**

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)
```

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Google OAuth

LearnFlow supports Google OAuth for secure authentication:

**Flow:**

1. User clicks "Sign in with Google"
2. Frontend redirects to Google OAuth URL
3. User authenticates with Google
4. Google redirects back with authorization code
5. Backend exchanges code for user info
6. Backend creates or finds user
7. Backend returns JWT token

**Configuration:**

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

## Authorization

### Role-Based Access Control (RBAC)

LearnFlow implements two user roles:

**LEARNER:**

- Browse and search courses
- Enroll in courses
- Track progress
- Participate in discussions
- Send messages to admins

**ADMIN:**

- All learner permissions
- Create/edit/delete courses
- Manage lessons
- Manage users
- View analytics
- View audit logs
- Generate reports

### Route Protection

**Frontend Protection:**

```jsx
// Protected route for learners only
<Route element={<ProtectedRoute allowedRoles={["learner"]} />}>
  <Route path="/dashboard" element={<LearnerDashboard />} />
</Route>

// Protected route for admins only
<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
  <Route path="/admin" element={<AdminDashboard />} />
</Route>
```

**Backend Protection:**

```python
# Require admin role
@app.get("/api/users")
def get_users(current_user: User = Depends(require_admin)):
    # Only admins can access
    pass

# Require any authenticated user
@app.get("/api/courses")
def get_courses(current_user: User = Depends(get_current_user)):
    # Any authenticated user can access
    pass
```

## Rate Limiting

LearnFlow implements rate limiting to prevent abuse:

### Rate Limit Configuration

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Registration: 5 requests per minute
@app.post("/api/auth/register")
@limiter.limit("5/minute")
def register(request: Request, user_data: UserCreate):
    pass

# Login: 10 requests per minute
@app.post("/api/auth/login")
@limiter.limit("10/minute")
def login(request: Request, credentials: UserLogin):
    pass

# Other endpoints: 60 requests per minute
@app.get("/api/courses")
@limiter.limit("60/minute")
def get_courses(request: Request):
    pass
```

### Rate Limit Response

When rate limit is exceeded:

```json
{
  "detail": "Rate limit exceeded. Please try again later.",
  "retry_after": 60
}
```

**Headers:**

```
Retry-After: 60
```

## Input Validation

### Pydantic Schemas

All API inputs are validated using Pydantic schemas:

```python
from pydantic import BaseModel, EmailStr, validator

class UserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    role: str = "learner"

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain number')
        return v

    @validator('role')
    def validate_role(cls, v):
        if v not in ['learner', 'admin']:
            raise ValueError('Role must be learner or admin')
        return v
```

### Input Sanitization

**Search Query Sanitization:**

```python
# Sanitize search input
if search:
    search = search.strip()[:100]  # Limit length
    # Use parameterized queries to prevent SQL injection
    query = query.filter(
        Course.title.ilike(f"%{search}%") |
        Course.description.ilike(f"%{search}%")
    )
```

**Limit Sanitization:**

```python
# Sanitize limit parameter
limit = max(1, min(50, limit))  # Between 1 and 50
skip = max(0, min(1000, skip))  # Between 0 and 1000
```

## XSS Protection

### HTML Sanitization

User-generated content is sanitized to prevent XSS attacks:

```python
import bleach

def sanitize_html(html_content):
    # Allow only safe tags
    allowed_tags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li']
    allowed_attributes = {}

    return bleach.clean(
        html_content,
        tags=allowed_tags,
        attributes=allowed_attributes,
        strip=True
    )
```

### Content Security Policy

Implement CSP headers to prevent XSS:

```python
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response
```

## CORS Protection

### CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Production Configuration:**

```python
# In production, specify exact origins
allow_origins=[
    "https://learnflow.example.com",
    "https://www.learnflow.example.com"
]
```

## Audit Logging

### Audit Log Implementation

All user actions are logged for security and compliance:

```python
def log_audit_event(
    db: Session,
    action: str,
    user_id: int = None,
    resource_type: str = None,
    resource_id: int = None,
    request: Request = None,
    details: str = None
):
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None
    )
    db.add(audit_log)
    db.commit()
```

### Logged Actions

- `user_registered`: New user registration
- `user_login`: User login
- `google_oauth_login`: Google OAuth login
- `course_created`: Course creation
- `course_updated`: Course update
- `course_deleted`: Course deletion
- `lesson_created`: Lesson creation
- `lesson_updated`: Lesson update
- `lesson_deleted`: Lesson deletion
- `lesson_completed`: Lesson completion
- `lesson_incomplete`: Lesson marked incomplete
- `course_enrolled`: Course enrollment
- `course_unenrolled`: Course unenrollment
- `course_completed`: Course completion

### Audit Log Query

```python
@app.get("/api/audit-logs")
def get_audit_logs(
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(require_admin)
):
    # Only admins can view audit logs
    query = db.query(AuditLog)

    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if action:
        query = query.filter(AuditLog.action == action)
    if search:
        # Search by user email or name
        query = query.outerjoin(User, AuditLog.user_id == User.id)
        query = query.filter(
            or_(
                User.email.ilike(f"%{search}%"),
                User.first_name.ilike(f"%{search}%"),
                User.last_name.ilike(f"%{search}%")
            )
        )

    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return logs
```

## Database Security

### PostgreSQL Security

**Connection Security:**

```python
# Use environment variables for credentials
DATABASE_URL = os.getenv("DATABASE_URL")

# Use parameterized queries to prevent SQL injection
user = db.query(User).filter(User.email == email).first()
```

**User Permissions:**

```sql
-- Create limited user for application
CREATE USER learnflow_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE learnflow TO learnflow_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO learnflow_app;
```

### MongoDB Security

**Connection Security:**

```python
# Use authentication
MONGO_URL = "mongodb://admin:password@localhost:27017/"

# Use parameterized queries
user_progress = user_progress_collection.find_one({
    "user_id": user_id,
    "course_id": course_id
})
```

**Network Security:**

```yaml
# docker-compose.yml
mongodb:
  image: mongo
  ports:
    - "27017:27017"
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: password
```

## Environment Variable Security

### Secure Configuration

**Never commit secrets to version control:**

```bash
# .gitignore
.env
*.env.local
```

**Use strong secrets:**

```bash
# Generate strong secret key
openssl rand -base64 32
```

**Environment Variables:**

```env
# JWT Configuration
SECRET_KEY=your-strong-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/learnflow
MONGO_URL=mongodb://admin:password@localhost:27017/

# OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Security Best Practices

### For Developers

1. **Never log sensitive data**: Don't log passwords, tokens, or personal information
2. **Use parameterized queries**: Prevent SQL injection
3. **Validate all inputs**: Use Pydantic schemas
4. **Sanitize user content**: Prevent XSS attacks
5. **Use HTTPS in production**: Encrypt data in transit
6. **Keep dependencies updated**: Regular security updates
7. **Follow principle of least privilege**: Minimal permissions

### For Administrators

1. **Use strong passwords**: Minimum 12 characters with complexity
2. **Enable 2FA**: When available
3. **Regular backups**: Daily database backups
4. **Monitor audit logs**: Review for suspicious activity
5. **Keep systems updated**: Regular security patches
6. **Use firewall**: Restrict database access
7. **Regular security audits**: Periodic security reviews

### For Users

1. **Use strong passwords**: Don't reuse passwords
2. **Don't share credentials**: Keep login information private
3. **Log out when done**: Especially on shared computers
4. **Report suspicious activity**: Contact administrators
5. **Keep software updated**: Update browser and OS

## Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables
- [ ] Strong SECRET_KEY generated
- [ ] Database credentials secured
- [ ] CORS configured for production
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Audit logging enabled
- [ ] HTTPS configured
- [ ] Security headers added
- [ ] Dependencies updated

### Post-Deployment

- [ ] Monitor audit logs regularly
- [ ] Review rate limit effectiveness
- [ ] Check for failed login attempts
- [ ] Verify backup procedures
- [ ] Test security controls
- [ ] Update security documentation

## Incident Response

### Security Incident Procedure

1. **Identify**: Detect the security incident
2. **Contain**: Limit the damage
3. **Investigate**: Determine the cause
4. **Remediate**: Fix the vulnerability
5. **Recover**: Restore normal operations
6. **Review**: Post-incident analysis

### Contact

For security issues, contact:

- Email: security@learnflow.example.com
- Create a private issue on GitHub

## Next Steps

- **[Architecture](./architecture)** - Understand the system design
- **[Database Design](./database-design)** - Understand the database schema
- **[Deployment](./deployment)** - Learn about deployment security
