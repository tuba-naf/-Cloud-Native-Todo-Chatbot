# Research: Todo Full-Stack Web Application with JWT Authentication

**Feature**: 001-todo-fullstack-jwt
**Date**: 2026-02-06
**Status**: Complete

## Overview

This document captures research findings and technical decisions for implementing the Todo Full-Stack Web Application with JWT Authentication.

## Technology Decisions

### 1. Backend Framework: FastAPI

**Decision**: Use FastAPI 0.109+ with Python 3.12

**Rationale**:
- Native async support for high concurrency
- Automatic OpenAPI documentation generation
- Built-in request/response validation via Pydantic
- Excellent performance characteristics
- Strong typing support

**Alternatives Considered**:
- Django REST Framework: More batteries-included but heavier, less async-native
- Flask: Simpler but lacks built-in validation and async support

### 2. ORM: SQLModel

**Decision**: Use SQLModel 0.0.14+ for database models

**Rationale**:
- Combines SQLAlchemy and Pydantic in single model definition
- Native FastAPI integration
- Reduces code duplication between database models and schemas
- Type-safe queries

**Alternatives Considered**:
- Pure SQLAlchemy: More mature but requires separate Pydantic schemas
- Tortoise ORM: Async-native but less mature ecosystem

### 3. Database: Neon Serverless PostgreSQL

**Decision**: Use Neon Serverless PostgreSQL

**Rationale**:
- Serverless scaling (cost-effective for variable load)
- PostgreSQL compatibility (full SQL support)
- Connection pooling built-in
- Easy provisioning and management

**Configuration**:
- Connection string via `DATABASE_URL` environment variable
- SSL mode required for production
- Connection pooling enabled by default

### 4. Authentication: Better Auth with JWT

**Decision**: Use Better Auth for frontend + custom JWT handling in FastAPI

**Rationale**:
- Better Auth provides Next.js-native authentication UI components
- JWT tokens allow stateless backend authentication
- 7-day token expiry balances security and UX
- Shared secret (`BETTER_AUTH_SECRET`) for token verification

**Implementation Pattern**:
1. Frontend uses Better Auth client for login/register UI
2. Backend issues JWT tokens upon successful authentication
3. Frontend stores token and includes in Authorization header
4. Backend validates JWT on every protected request

### 5. Password Security

**Decision**: Use bcrypt for password hashing

**Rationale**:
- Industry standard for password hashing
- Configurable work factor for future-proofing
- Built-in salt generation
- Resistant to rainbow table attacks

**Configuration**:
- Work factor: 12 (default, ~250ms hash time)
- Library: `passlib[bcrypt]`

### 6. Frontend Framework: Next.js 16+ App Router

**Decision**: Use Next.js App Router with Server Components

**Rationale**:
- Modern React patterns (Server Components, Streaming)
- Built-in routing and layouts
- Excellent TypeScript support
- Easy deployment to Vercel or other platforms

**Key Patterns**:
- Route groups for auth vs protected pages
- Server Components for static content
- Client Components for interactive forms
- Middleware for authentication checks

### 7. API Design: RESTful

**Decision**: RESTful API design with JSON payloads

**Rationale**:
- Widely understood and documented pattern
- Easy to test and debug
- Compatible with any frontend technology
- Clear resource-oriented endpoints

**Conventions**:
- Plural nouns for collections (`/tasks`)
- HTTP methods for operations (GET, POST, PATCH, DELETE)
- Consistent error response format
- Proper HTTP status codes

## Security Considerations

### JWT Token Structure

```json
{
  "sub": "user_id_uuid",
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### Token Handling

1. **Generation**: Backend creates JWT on successful login
2. **Storage**: Frontend stores in httpOnly cookie or localStorage
3. **Transmission**: `Authorization: Bearer <token>` header
4. **Validation**: Backend verifies signature, expiry, and claims
5. **Refresh**: Token refresh before expiry (optional for MVP)

### CORS Configuration

```python
origins = [
    "http://localhost:3000",      # Frontend dev
    "https://your-domain.com",    # Production
]
```

### Ownership Validation Pattern

```python
async def get_task_or_404(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> Task:
    task = session.get(Task, task_id)
    if not task or task.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
```

## Performance Considerations

### Database Indexes

Required indexes for optimal query performance:
- `users.email` (unique index for login lookup)
- `tasks.owner_id` (foreign key index for user's task listing)
- `tasks.created_at` (for sorting/pagination)

### Connection Pooling

Neon provides connection pooling. Configuration:
- Pool size: 10 connections (default)
- Connection timeout: 30 seconds
- Idle timeout: 600 seconds

### Caching Strategy

For MVP, no caching required. Future considerations:
- Redis for session management
- CDN for static assets
- Browser caching for API responses

## Testing Strategy

### Backend Tests (pytest)

1. **Unit Tests**: Password hashing, JWT utilities
2. **Integration Tests**: API endpoints with test database
3. **Contract Tests**: Request/response validation

### Frontend Tests (Vitest/Jest)

1. **Component Tests**: Form validation, rendering
2. **Integration Tests**: Auth flow, task operations
3. **E2E Tests**: Full user journeys (optional for MVP)

## Deployment Considerations

### Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRE_DAYS=7

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
```

### Production Checklist

- [ ] Set strong BETTER_AUTH_SECRET (32+ random characters)
- [ ] Configure HTTPS only
- [ ] Set appropriate CORS origins
- [ ] Enable database SSL
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Token storage method? | httpOnly cookies for better security |
| Password reset flow? | Out of scope for MVP |
| Email verification? | Out of scope for MVP |
| Rate limiting? | Optional, implement if time permits |

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Better Auth Documentation](https://www.better-auth.com/)
- [Neon Documentation](https://neon.tech/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
