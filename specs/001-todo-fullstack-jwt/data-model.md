# Data Model: Todo Full-Stack Web Application

**Feature**: 001-todo-fullstack-jwt
**Date**: 2026-02-06
**Status**: Complete

## Entity Relationship Diagram

```
┌─────────────────────────────┐       ┌─────────────────────────────┐
│           User              │       │           Task              │
├─────────────────────────────┤       ├─────────────────────────────┤
│ id: UUID (PK)               │       │ id: UUID (PK)               │
│ email: VARCHAR(255) UNIQUE  │───┐   │ title: VARCHAR(500)         │
│ password_hash: VARCHAR(255) │   │   │ is_completed: BOOLEAN       │
│ created_at: TIMESTAMP       │   │   │ owner_id: UUID (FK)         │
│ updated_at: TIMESTAMP       │   └──>│ created_at: TIMESTAMP       │
└─────────────────────────────┘       │ updated_at: TIMESTAMP       │
                                      └─────────────────────────────┘
```

## Entities

### User

Represents a registered user of the system.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt-hashed password |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes**:
- `idx_users_email` UNIQUE on `email` (login lookup)

**Validation Rules**:
- Email must be valid format (RFC 5322)
- Email must be unique across all users
- Password must be at least 8 characters before hashing

### Task

Represents a to-do item created by a user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| title | VARCHAR(500) | NOT NULL | Task description |
| is_completed | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| owner_id | UUID | FOREIGN KEY (users.id), NOT NULL | Task owner |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes**:
- `idx_tasks_owner_id` on `owner_id` (user's task listing)
- `idx_tasks_owner_created` on `(owner_id, created_at DESC)` (sorted listing)

**Validation Rules**:
- Title must not be empty
- Title must not exceed 500 characters
- owner_id must reference existing user

**Foreign Key Constraints**:
- `owner_id` REFERENCES `users(id)` ON DELETE CASCADE

## Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Task | One-to-Many | A user can own many tasks |
| Task → User | Many-to-One | Each task belongs to exactly one user |

## SQLModel Definitions

### User Model

```python
from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(max_length=255, unique=True, index=True)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="owner")
```

### Task Model

```python
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=500)
    is_completed: bool = Field(default=False)
    owner_id: UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    owner: Optional[User] = Relationship(back_populates="tasks")
```

## Pydantic Schemas (Request/Response)

### User Schemas

```python
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str  # Min 8 characters

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

### Task Schemas

```python
class TaskCreate(BaseModel):
    title: str  # Max 500 characters

class TaskUpdate(BaseModel):
    title: Optional[str] = None  # Max 500 characters
    is_completed: Optional[bool] = None

class TaskResponse(BaseModel):
    id: UUID
    title: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    count: int
```

## Database Migrations

### Initial Migration (001_initial_schema.py)

```sql
-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_owner_id ON tasks(owner_id);
CREATE INDEX idx_tasks_owner_created ON tasks(owner_id, created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to tasks
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## State Transitions

### Task Completion State

```
                    mark_complete()
    ┌─────────────┐ ──────────────> ┌─────────────┐
    │ Incomplete  │                 │  Complete   │
    │ is_completed│ <────────────── │ is_completed│
    │   = false   │  mark_incomplete│   = true    │
    └─────────────┘                 └─────────────┘
```

## Data Integrity Rules

1. **User Deletion**: Cascades to delete all owned tasks
2. **Email Uniqueness**: Enforced at database level
3. **Task Ownership**: Immutable after creation (owner_id cannot change)
4. **Timestamps**: Automatically managed by database triggers

## Query Patterns

### List User's Tasks

```python
async def get_user_tasks(user_id: UUID, session: Session) -> List[Task]:
    statement = select(Task).where(Task.owner_id == user_id).order_by(Task.created_at.desc())
    return session.exec(statement).all()
```

### Get Task with Ownership Check

```python
async def get_task_for_user(task_id: UUID, user_id: UUID, session: Session) -> Optional[Task]:
    statement = select(Task).where(Task.id == task_id, Task.owner_id == user_id)
    return session.exec(statement).first()
```

### Count User's Tasks

```python
async def count_user_tasks(user_id: UUID, session: Session) -> int:
    statement = select(func.count(Task.id)).where(Task.owner_id == user_id)
    return session.exec(statement).one()
```
