# Data Model: Todo AI Chatbot

**Feature**: 002-todo-ai-chatbot
**Date**: 2026-02-09
**Status**: Complete

## Entity Relationship Diagram

```
┌─────────────────────────────┐
│           User              │
│       (Phase II — unchanged)│
├─────────────────────────────┤
│ id: UUID (PK)               │
│ email: VARCHAR(255) UNIQUE  │
│ password_hash: VARCHAR(255) │
│ created_at: TIMESTAMP       │
│ updated_at: TIMESTAMP       │
└──────────┬──────────────────┘
           │
     ┌─────┴─────┐
     │1          1│
     │            │
     ▼*           ▼*
┌──────────────┐  ┌─────────────────────────────┐
│    Task      │  │       Conversation           │
│ (Phase II)   │  │       (Phase III — new)       │
├──────────────┤  ├─────────────────────────────┤
│ id: UUID (PK)│  │ id: UUID (PK)               │
│ title        │  │ user_id: UUID (FK → users)  │
│ is_completed │  │ title: VARCHAR(255)         │
│ owner_id (FK)│  │ created_at: TIMESTAMP       │
│ created_at   │  │ updated_at: TIMESTAMP       │
│ updated_at   │  └──────────┬──────────────────┘
└──────────────┘             │
                             │1
                             │
                             ▼*
                   ┌─────────────────────────────┐
                   │          Message             │
                   │       (Phase III — new)       │
                   ├─────────────────────────────┤
                   │ id: UUID (PK)               │
                   │ conversation_id: UUID (FK)  │
                   │ role: VARCHAR(20)           │
                   │ content: TEXT               │
                   │ tool_name: VARCHAR(50)      │
                   │ tool_args: TEXT             │
                   │ tool_result: TEXT           │
                   │ created_at: TIMESTAMP       │
                   └─────────────────────────────┘
```

## Phase III Entities (new)

### Conversation

Represents a chat session between a user and the AI assistant.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FOREIGN KEY (users.id), NOT NULL, INDEX | Conversation owner |
| title | VARCHAR(255) | NULL | Auto-generated from first message (truncated to 50 chars) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Session start time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last activity time |

**Indexes**:
- `idx_conversations_user_id` on `user_id` (user's conversation listing)
- `idx_conversations_user_updated` on `(user_id, updated_at DESC)` (most recent conversation lookup)

**Validation Rules**:
- user_id must reference existing user
- title max length 255 characters (auto-truncated to 50 from first message)

**Foreign Key Constraints**:
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

### Message

Represents a single exchange within a conversation.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| conversation_id | UUID | FOREIGN KEY (conversations.id), NOT NULL, INDEX | Parent conversation |
| role | VARCHAR(20) | NOT NULL, CHECK (role IN ('user', 'assistant', 'tool')) | Message sender role |
| content | TEXT | NOT NULL | Message content |
| tool_name | VARCHAR(50) | NULL | MCP tool name (if role='tool') |
| tool_args | TEXT | NULL | JSON-serialized tool arguments |
| tool_result | TEXT | NULL | JSON-serialized tool result |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Message timestamp |

**Indexes**:
- `idx_messages_conversation_id` on `conversation_id` (conversation message listing)
- `idx_messages_conversation_created` on `(conversation_id, created_at ASC)` (ordered message retrieval)

**Validation Rules**:
- role must be one of: 'user', 'assistant', 'tool'
- content must not be empty
- tool_name, tool_args, tool_result should only be populated when role='tool'
- conversation_id must reference existing conversation

**Foreign Key Constraints**:
- `conversation_id` REFERENCES `conversations(id)` ON DELETE CASCADE

## Phase II Entities (unchanged)

### User (read-only reference)

Phase III references the existing User table for conversation ownership. No schema modifications.

### Task (read/write via MCP tools)

Phase III MCP tools read and write Task records. No schema modifications. Key fields used by MCP tools:
- `id`: Task identifier for complete/delete/update operations
- `title`: Displayed in list responses, matched for natural language resolution
- `is_completed`: Read for status filtering, written by `complete_task` tool
- `owner_id`: Validated against authenticated user_id for ownership enforcement

## Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Conversation | One-to-Many | A user can have many conversations |
| Conversation → Message | One-to-Many | A conversation contains many messages |
| User → Task | One-to-Many | Existing Phase II relationship (unchanged) |

## SQLModel Definitions

### Conversation Model

```python
from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List


class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    title: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")
```

### Message Model

```python
class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", index=True)
    role: str = Field(max_length=20)  # 'user', 'assistant', 'tool'
    content: str = Field()
    tool_name: Optional[str] = Field(default=None, max_length=50)
    tool_args: Optional[str] = Field(default=None)
    tool_result: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: Optional[Conversation] = Relationship(
        back_populates="messages"
    )
```

## Pydantic Schemas (Request/Response)

### Chat Schemas

```python
from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class ChatRequest(BaseModel):
    message: str  # User's natural language message
    conversation_id: Optional[UUID] = None  # Omit to start new conversation


class ChatResponse(BaseModel):
    response: str  # Assistant's natural language response
    conversation_id: UUID  # Conversation ID (new or existing)
```

### MCP Tool Schemas

```python
class AddTaskInput(BaseModel):
    title: str
    # Note: Phase II Task model has no description field


class ListTasksInput(BaseModel):
    status: Optional[str] = None  # 'pending', 'completed', or None for all
    # Translated internally: 'pending' -> is_completed=False, 'completed' -> is_completed=True


class CompleteTaskInput(BaseModel):
    task_id: UUID


class DeleteTaskInput(BaseModel):
    task_id: UUID


class UpdateTaskInput(BaseModel):
    task_id: UUID
    title: Optional[str] = None
    # Note: Phase II Task model has no description field
```

## Database Migration

### Migration 002: Add Conversation Tables

```sql
-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_user_updated
    ON conversations(user_id, updated_at DESC);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
    content TEXT NOT NULL,
    tool_name VARCHAR(50),
    tool_args TEXT,
    tool_result TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_conversation_created
    ON messages(conversation_id, created_at ASC);

-- Apply updated_at trigger to conversations
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Query Patterns

### Get User's Most Recent Conversation

```python
async def get_recent_conversation(
    user_id: UUID, session: Session
) -> Optional[Conversation]:
    statement = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .limit(1)
    )
    return session.exec(statement).first()
```

### Load Conversation Messages (last 50)

```python
async def get_conversation_messages(
    conversation_id: UUID, session: Session, limit: int = 50
) -> List[Message]:
    statement = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    results = session.exec(statement).all()
    return list(reversed(results))  # Chronological order
```

### Persist Message Pair (user + assistant)

```python
async def persist_exchange(
    conversation_id: UUID,
    user_content: str,
    assistant_content: str,
    tool_invocations: List[dict],
    session: Session,
) -> None:
    # User message
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=user_content,
    )
    session.add(user_msg)

    # Tool messages (if any)
    for tool in tool_invocations:
        tool_msg = Message(
            conversation_id=conversation_id,
            role="tool",
            content=tool.get("result_summary", ""),
            tool_name=tool["name"],
            tool_args=json.dumps(tool["args"]),
            tool_result=json.dumps(tool["result"]),
        )
        session.add(tool_msg)

    # Assistant message
    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=assistant_content,
    )
    session.add(assistant_msg)

    session.commit()
```
