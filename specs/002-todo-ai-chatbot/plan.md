# Implementation Plan: Todo AI Chatbot

**Branch**: `002-todo-ai-chatbot` | **Date**: 2026-02-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-todo-ai-chatbot/spec.md`

## Summary

Add an AI-powered chatbot interface to the existing Phase II Todo application, enabling users to manage tasks via natural language. The system uses OpenAI Agents SDK for intent parsing, MCP tools for task operations, and persists conversation history in the database. A single stateless endpoint (`POST /api/{user_id}/chat`) handles all chat interactions.

## Technical Context

**Existing System**:
- Frontend: Phase II Next.js app deployed on Vercel
- Backend: Phase II FastAPI service deployed on Hugging Face
- Database: Existing Neon PostgreSQL with User/Task tables

**Extension Strategy**:
- Add ChatKit to existing frontend
- Add `/api/{user_id}/chat` to existing backend
- No refactor of Phase II modules

**Language/Version**: Python 3.12 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, MCP SDK, OpenAI ChatKit, SQLModel
**Storage**: Neon Serverless PostgreSQL (existing instance, new tables: Conversation, Message)
**Testing**: pytest (backend), manual verification (frontend ChatKit)
**Target Platform**: Vercel (frontend), Hugging Face (backend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: < 5s end-to-end chat response (SC-001), 50 concurrent users (SC-003)
**Constraints**: Stateless architecture (Principle VII), no Phase II modifications (Principle VI), < 300ms backend processing excluding AI latency
**Scale/Scope**: 50 concurrent chat users, 5 MCP tools, 2 new database tables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Security First | PASS | JWT validation on `/api/{user_id}/chat` (FR-001), user_id validated against token claims, ownership enforced on all MCP tools (FR-009) |
| II. Spec-Driven Development | PASS | Spec created via `/sp.specify`, clarified via `/sp.clarify`, plan generated via `/sp.plan` |
| III. Automation Over Manual Coding | PASS | Full agentic workflow: specify → plan → tasks → implement |
| IV. Reliability & Consistency | PASS | Proper HTTP status codes, natural language error messages (FR-008), graceful degradation (FR-014) |
| V. Scalability by Design | PASS | Stateless endpoint, database-backed context, horizontal scaling without session affinity |
| VI. Backward Compatibility | PASS | Phase II endpoints/tables unchanged (FR-013), new isolated endpoint and tables only |
| VII. Stateless Architecture | PASS | Context reconstructed from DB on every request (FR-007), no in-memory session state |
| VIII. AI-First Design | PASS | All task flows via OpenAI Agents SDK (FR-002), MCP tools only (FR-003), natural language responses (FR-008) |
| IX. Tool-Centric Orchestration | PASS | MCP SDK in-process (no separate agent), Pydantic validation, JSON-serializable results, tool audit logging (FR-006) |

**Gate result**: PASS — all 9 principles satisfied. No violations to track.

## Project Structure

### Documentation (this feature)

```text
specs/002-todo-ai-chatbot/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── openapi.yaml     # Chat endpoint contract
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/
│   │   ├── tasks.py              # Phase II (unchanged)
│   │   ├── auth.py               # Phase II (unchanged)
│   │   └── chat.py               # Phase III: chat endpoint
│   ├── models/
│   │   ├── task.py               # Phase II (unchanged)
│   │   ├── user.py               # Phase II (unchanged)
│   │   ├── conversation.py       # Phase III: Conversation model
│   │   └── message.py            # Phase III: Message model
│   ├── agents/
│   │   └── chat_agent.py         # Phase III: OpenAI Agents SDK setup
│   ├── mcp/
│   │   ├── server.py             # Phase III: MCP server config
│   │   └── tools.py              # Phase III: MCP tool definitions
│   └── auth/                     # Phase II (unchanged)
└── tests/
    └── test_chat.py              # Phase III: chat endpoint tests

frontend/
├── app/
│   ├── chat/
│   │   └── page.tsx              # Phase III: ChatKit page
│   └── ...                       # Phase II (unchanged)
├── components/
│   ├── chat/
│   │   └── ChatWidget.tsx        # Phase III: ChatKit wrapper
│   └── ...                       # Phase II (unchanged)
└── lib/
    └── chatkit.ts                # Phase III: ChatKit config

db/
└── migrations/
    └── 002_add_conversations.sql # Phase III: DDL
```

**Structure Decision**: Web application structure extending the existing Phase II layout. Phase III files are additive — placed in new subdirectories (`agents/`, `mcp/`, `chat/`) to avoid any modification of Phase II source files.

## Complexity Tracking

> No constitution violations detected. Table left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _(none)_  | —          | —                                   |
