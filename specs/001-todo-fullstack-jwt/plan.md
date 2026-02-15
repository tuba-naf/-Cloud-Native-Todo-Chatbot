# Implementation Plan: Todo Full-Stack Web Application with JWT Authentication

**Branch**: `001-todo-fullstack-jwt` | **Date**: 2026-02-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-fullstack-jwt/spec.md`

## Summary

Transform a console-based todo application into a secure, multi-user web platform with:
- **Frontend**: Next.js 16+ App Router with Better Auth for JWT-based authentication
- **Backend**: FastAPI (Python) with SQLModel ORM providing RESTful API endpoints
- **Database**: Neon Serverless PostgreSQL for persistent storage
- **Security**: JWT tokens with 7-day expiry, user ownership validation on all task operations

The system enables users to register, login, and manage personal tasks (create, view, update, delete) with complete isolation between users.

## Technical Context

**Language/Version**: Python 3.12 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI 0.109+, SQLModel 0.0.14+, Next.js 16+, Better Auth
**Storage**: Neon Serverless PostgreSQL
**Testing**: pytest (backend), Jest/Vitest (frontend)
**Target Platform**: Web (modern browsers: Chrome, Firefox, Edge, Safari)
**Project Type**: Web application (frontend + backend separation)
**Performance Goals**: API response < 300ms, page load < 2 seconds, 50 concurrent users
**Constraints**: JWT tokens max 7-day validity, task title max 500 chars
**Scale/Scope**: Multi-user web app, 2 entities (User, Task), 6 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status |
|-----------|-------------|--------|
| I. Security First | JWT auth on all endpoints, token validation, BETTER_AUTH_SECRET env var | ✅ PASS |
| II. Spec-Driven Development | Spec completed and approved before this plan | ✅ PASS |
| III. Automation Over Manual Coding | Following /sp.specify → /sp.plan → /sp.tasks workflow | ✅ PASS |
| IV. Reliability & Consistency | Proper HTTP status codes, ownership validation, error handling planned | ✅ PASS |
| V. Scalability by Design | Modular structure, RESTful API, optimized queries planned | ✅ PASS |

**Architecture Standards**:
- Frontend: Next.js 16+ (App Router) ✅
- Backend: FastAPI (Python) ✅
- ORM: SQLModel ✅
- Database: Neon Serverless PostgreSQL ✅
- Authentication: Better Auth with JWT ✅

**Gate Status**: PASSED - Proceeding to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-fullstack-jwt/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   └── openapi.yaml     # OpenAPI 3.0 specification
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Environment configuration
│   ├── database.py          # Neon PostgreSQL connection
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User SQLModel
│   │   └── task.py          # Task SQLModel
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py          # Pydantic request/response schemas
│   │   └── task.py          # Pydantic request/response schemas
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py          # Dependency injection (current user)
│   │   ├── auth.py          # Auth endpoints (register, login, logout)
│   │   └── tasks.py         # Task CRUD endpoints
│   └── auth/
│       ├── __init__.py
│       ├── jwt.py           # JWT token utilities
│       └── password.py      # Password hashing
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # pytest fixtures
│   ├── test_auth.py         # Auth endpoint tests
│   └── test_tasks.py        # Task endpoint tests
├── alembic/
│   ├── versions/            # Migration scripts
│   └── env.py
├── alembic.ini
├── requirements.txt
└── .env.example

frontend/
├── app/
│   ├── layout.tsx           # Root layout with auth provider
│   ├── page.tsx             # Landing/redirect page
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx     # Login page
│   │   └── register/
│   │       └── page.tsx     # Registration page
│   └── (protected)/
│       ├── layout.tsx       # Protected layout with auth check
│       └── dashboard/
│           └── page.tsx     # Task dashboard
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── tasks/
│       ├── TaskList.tsx
│       ├── TaskItem.tsx
│       ├── TaskForm.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── auth.ts              # Better Auth client config
│   ├── api.ts               # API client with token injection
│   └── utils.ts             # Utility functions
├── types/
│   └── index.ts             # TypeScript type definitions
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.local.example
```

**Structure Decision**: Web application structure selected (Option 2) - separate frontend and backend directories for clear separation of concerns between Next.js App Router frontend and FastAPI backend.

## Complexity Tracking

> No constitution violations identified. All requirements align with principles.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │ Better Auth │     │   Backend   │     │  Database   │
│  (Next.js)  │     │    (JWT)    │     │  (FastAPI)  │     │   (Neon)    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │  1. Register/Login Request            │                   │
       │───────────────────────────────────────>                   │
       │                   │                   │                   │
       │                   │                   │  2. Validate/Create User
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │                   │                   │  3. User Data     │
       │                   │                   │<──────────────────│
       │                   │                   │                   │
       │  4. JWT Token (access + refresh)      │                   │
       │<──────────────────────────────────────│                   │
       │                   │                   │                   │
       │  5. API Request + Authorization: Bearer <token>           │
       │───────────────────────────────────────>                   │
       │                   │                   │                   │
       │                   │  6. Verify JWT    │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │                   │  7. User Claims   │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │  8. Query (user_id filter)
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │                   │                   │  9. User's Data   │
       │                   │                   │<──────────────────│
       │                   │                   │                   │
       │  10. Response (user's tasks only)     │                   │
       │<──────────────────────────────────────│                   │
```

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Create new user account | No |
| POST | /api/auth/login | Authenticate and get JWT | No |
| POST | /api/auth/logout | Invalidate session | Yes |
| GET | /api/tasks | List user's tasks | Yes |
| POST | /api/tasks | Create new task | Yes |
| GET | /api/tasks/{id} | Get specific task | Yes |
| PATCH | /api/tasks/{id} | Update task | Yes |
| DELETE | /api/tasks/{id} | Delete task | Yes |

## Milestones

### Milestone 1: Project Initialization
- Initialize monorepo structure (backend/, frontend/)
- Configure environment variables (.env files)
- Set up version control (branch already created)
- Configure linting and formatting

### Milestone 2: Database & Models
- Configure Neon PostgreSQL connection
- Implement User and Task SQLModel schemas
- Set up Alembic migrations
- Create initial migration

### Milestone 3: Authentication Backend
- Implement password hashing utilities
- Implement JWT token generation/validation
- Create auth endpoints (register, login, logout)
- Configure CORS for frontend

### Milestone 4: Task API Backend
- Implement task CRUD endpoints
- Add ownership validation middleware
- Implement input validation
- Add proper error handling

### Milestone 5: Frontend Authentication
- Initialize Next.js App Router project
- Configure Better Auth client
- Implement registration page
- Implement login page
- Configure protected routes

### Milestone 6: Frontend Task Management
- Implement task dashboard
- Build task list component
- Build task creation form
- Implement task update/delete actions
- Add loading and error states

### Milestone 7: Integration & Testing
- Test end-to-end authentication flow
- Test task CRUD operations
- Test ownership isolation
- Test error scenarios
- Cross-browser testing

### Milestone 8: Documentation & Deployment
- Document API endpoints
- Create quickstart guide
- Configure production environment
- Deploy to production
- Final validation

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JWT secret exposure | Low | High | Store in env vars, never commit |
| Cross-user data leak | Medium | Critical | Ownership validation on every query |
| Database connection issues | Low | Medium | Connection pooling, retry logic |
| Token expiration mid-session | Medium | Low | Frontend token refresh handling |
| Performance degradation | Low | Medium | Query optimization, indexing |

## Dependencies

```
Milestone 1 ─────┬───> Milestone 2 ───> Milestone 3 ───> Milestone 4
                 │
                 └───> Milestone 5 ───> Milestone 6
                              │                │
                              └────────┬───────┘
                                       │
                                       v
                              Milestone 7 ───> Milestone 8
```

## Verification Checkpoints

- [ ] **Checkpoint 1**: Backend starts without errors, connects to Neon
- [ ] **Checkpoint 2**: User can register and login via API
- [ ] **Checkpoint 3**: Task CRUD works with ownership validation
- [ ] **Checkpoint 4**: Frontend authentication flow complete
- [ ] **Checkpoint 5**: Full integration working end-to-end
- [ ] **Checkpoint 6**: All tests passing, ready for deployment
