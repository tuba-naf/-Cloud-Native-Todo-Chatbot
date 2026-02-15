# Quickstart Guide: Todo Full-Stack Web Application

**Feature**: 001-todo-fullstack-jwt
**Date**: 2026-02-06

## Prerequisites

Before starting, ensure you have:

- **Python 3.12+** installed
- **Node.js 18+** installed
- **Git** installed
- **Neon PostgreSQL account** (free tier available at neon.tech)
- A code editor (VS Code recommended)

## Quick Setup

### 1. Clone and Navigate

```bash
cd Hackathon-Phase2
git checkout 001-todo-fullstack-jwt
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your values:
# DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
# BETTER_AUTH_SECRET=your-secret-key-min-32-characters
```

### 3. Database Setup

```bash
# Run migrations
alembic upgrade head

# Verify connection
python -c "from app.database import engine; print('Connected!')"
```

### 4. Start Backend Server

```bash
# Development server with auto-reload
uvicorn app.main:app --reload --port 8000

# Server runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 5. Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your values:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# BETTER_AUTH_SECRET=your-secret-key-min-32-characters
```

### 6. Start Frontend Server

```bash
# Development server
npm run dev

# App runs at http://localhost:3000
```

## Environment Variables

### Backend (.env)

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require

# Authentication
BETTER_AUTH_SECRET=your-very-secure-secret-key-minimum-32-characters
JWT_ALGORITHM=HS256
JWT_EXPIRE_DAYS=7

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```bash
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication (must match backend)
BETTER_AUTH_SECRET=your-very-secure-secret-key-minimum-32-characters
```

## Verify Installation

### 1. Check Backend Health

```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

### 2. Check API Documentation

Open http://localhost:8000/docs in browser to see Swagger UI.

### 3. Test Registration

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
# Expected: {"id": "uuid", "email": "test@example.com", ...}
```

### 4. Test Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
# Expected: {"access_token": "eyJ...", "token_type": "bearer"}
```

### 5. Access Frontend

Open http://localhost:3000 in browser. You should see the login page.

## Common Issues

### Database Connection Failed

1. Verify DATABASE_URL format includes `?sslmode=require`
2. Check Neon dashboard for correct connection string
3. Ensure your IP is allowed in Neon's security settings

### JWT Validation Error

1. Ensure BETTER_AUTH_SECRET matches in both backend and frontend
2. Secret must be at least 32 characters
3. Check token hasn't expired (7-day default)

### CORS Error

1. Add frontend URL to CORS_ORIGINS in backend .env
2. Restart backend server after changing .env
3. Check browser console for specific CORS message

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process or use different port
uvicorn app.main:app --reload --port 8001
```

## Development Workflow

1. **Start backend**: `cd backend && uvicorn app.main:app --reload`
2. **Start frontend**: `cd frontend && npm run dev`
3. **Make changes**: Files auto-reload on save
4. **Test API**: Use http://localhost:8000/docs
5. **Run tests**: `pytest` (backend) or `npm test` (frontend)

## Next Steps

After setup is complete:

1. Create a user account via the registration page
2. Log in and access the dashboard
3. Create, view, update, and delete tasks
4. Test logout and protected route redirection

For implementation details, see:
- [spec.md](./spec.md) - Feature specification
- [plan.md](./plan.md) - Implementation plan
- [data-model.md](./data-model.md) - Database schema
- [contracts/openapi.yaml](./contracts/openapi.yaml) - API specification
