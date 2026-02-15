# Research: Todo AI Chatbot

**Feature**: 002-todo-ai-chatbot
**Date**: 2026-02-09
**Status**: Complete

## Phase 0 Research Findings

### R-001: OpenAI Agents SDK Integration Pattern

**Decision**: Use OpenAI Agents SDK with function-calling to dispatch MCP tools from within the FastAPI backend.

**Rationale**: The Agents SDK provides built-in tool orchestration and conversation management. Function-calling allows the agent to select and invoke MCP tools based on parsed user intent, eliminating custom intent classification logic.

**Alternatives considered**:
- LangChain agent framework: Heavier dependency, more abstraction layers. Rejected for over-engineering.
- Custom prompt + regex intent parser: Fragile, poor generalization. Rejected for reliability.
- OpenAI Assistants API (hosted threads): Requires external state management, conflicts with stateless Principle VII. Rejected.

### R-002: MCP SDK In-Process Integration

**Decision**: Run MCP SDK in-process within FastAPI as a library, not as a separate server.

**Rationale**: Principle IX mandates tool-centric orchestration via Backend Agent with no separate MCP process. In-process invocation avoids network overhead and simplifies Hugging Face deployment.

**Alternatives considered**:
- Separate MCP server with stdio transport: Adds process management complexity, conflicts with Principle IX. Rejected.
- HTTP-based MCP server: Unnecessary network hop. Rejected.

### R-003: OpenAI ChatKit Frontend Integration

**Decision**: Integrate ChatKit into existing Next.js frontend as a client component on `/chat` page.

**Rationale**: ChatKit provides pre-built chat UI components (message list, input, streaming) that eliminate custom UI development. Connects to backend via configurable API endpoint.

**Alternatives considered**:
- Custom React chat UI: Significant effort for message rendering, scroll management. Rejected.
- Third-party chat widget: Vendor lock-in, limited task-specific customization. Rejected.

### R-004: Conversation Context Reconstruction

**Decision**: Load most recent 50 messages per conversation from database on each request and pass as history to OpenAI Agents SDK.

**Rationale**: 50 messages provides sufficient multi-turn context while staying within token limits (~4K tokens for history). Aligns with stateless Principle VII — full reconstruction from database, no in-memory state.

**Alternatives considered**:
- Load all messages (unbounded): Token limit risk, slow queries. Rejected.
- Summarize old messages: Extra complexity, potential context loss. Deferred.
- Fixed token budget: Requires token counting logic. Rejected for MVP.

### R-005: Task Resolution from Natural Language

**Decision**: Agent resolves task references (e.g., "the groceries task") by calling `list_tasks` to retrieve user's tasks, then matching by title similarity. Multiple matches trigger disambiguation prompt.

**Rationale**: Leverages existing MCP tool and agent's NL capabilities. No fuzzy search infrastructure needed.

**Alternatives considered**:
- Full-text search index (tsvector/pg_trgm): Over-engineered for MVP. Rejected.
- Exact title matching only: Too brittle. Rejected.

### R-006: Stateless Chat Endpoint Design

**Decision**: Single endpoint `POST /api/{user_id}/chat` with `{ message, conversation_id? }` request and `{ response, conversation_id }` response.

**Rationale**: Aligns with Principle VII. Optional `conversation_id` enables continuity while keeping endpoint stateless. Backend loads history, processes, persists, and returns — all in one request cycle.

**Alternatives considered**:
- WebSocket streaming: Complex deployment on Hugging Face, connection management. Deferred.
- Separate endpoints for new/existing conversations: Unnecessary split. Rejected.

### R-007: Environment Variable Strategy

**Decision**: Phase III adds `OPENAI_API_KEY` and `NEXT_PUBLIC_OPENAI_DOMAIN_KEY`. Shares existing `DATABASE_URL` and `AUTH_SECRET` with Phase II.

**Rationale**: Database and auth infrastructure are shared (same Neon instance, same Better Auth). Only OpenAI-specific variables are new. Avoids duplication while maintaining isolation.

**Alternatives considered**:
- Separate database for Phase III: Unnecessary cost/complexity. Rejected.
- Separate auth system: Conflicts with single user identity. Rejected.
