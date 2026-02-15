# Tasks: Todo AI Chatbot

**Input**: Design documents from `/specs/002-todo-ai-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/openapi.yaml

**Tests**: Not explicitly requested in spec. Tests are excluded from task generation. Manual verification via quickstart.md checklist is the testing strategy.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/` (FastAPI, Python)
- **Frontend**: `frontend/app/`, `frontend/components/`, `frontend/lib/` (Next.js, TypeScript)
- **Database migrations**: `db/migrations/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install Phase III dependencies and create the project directory structure without modifying Phase II code.

- [x] T001 Install Phase III backend dependencies (openai-agents, mcp-sdk) in backend/requirements.txt
- [x] T002 [P] Install Phase III frontend dependency (@openai/chatkit) in frontend/package.json
- [x] T003 [P] Create Phase III backend directory structure: backend/app/agents/, backend/app/mcp/, backend/app/models/ (new files only), backend/app/schemas/ (new files only)
- [x] T004 [P] Create Phase III frontend directory structure: frontend/app/chat/, frontend/components/chat/, frontend/lib/chatkit.ts
- [x] T005 [P] Add Phase III environment variable (OPENAI_API_KEY) to backend/app/config.py without modifying existing settings; verify existing Phase II variables (DATABASE_URL, AUTH_SECRET) are present in config and compatible for Phase III reuse (same Neon DB, same Better Auth secret)
- [x] T006 [P] Add Phase III frontend environment variable (NEXT_PUBLIC_OPENAI_DOMAIN_KEY) to frontend/.env.local.example

**Checkpoint**: Directory structure created, dependencies installed, env vars configured. No Phase II code modified.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database tables, SQLModel models, Pydantic schemas, and MCP tool definitions that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Create database migration script for Conversation and Message tables in db/migrations/002_add_conversations.sql (DDL from data-model.md)
- [ ] T008 Run migration 002_add_conversations.sql against Neon PostgreSQL to create conversations and messages tables with indexes and triggers
- [x] T009 [P] Create Conversation SQLModel in backend/app/models/conversation.py (fields: id, user_id, title, created_at, updated_at; FK to users.id; relationship to messages)
- [x] T010 [P] Create Message SQLModel in backend/app/models/message.py (fields: id, conversation_id, role, content, tool_name, tool_args, tool_result, created_at; FK to conversations.id; relationship to conversation)
- [x] T011 Export new models from backend/app/models/__init__.py (import Conversation, Message alongside existing exports)
- [x] T012 [P] Create chat Pydantic schemas in backend/app/schemas/chat.py (ChatRequest: message + optional conversation_id; ChatResponse: response + conversation_id; ErrorResponse: detail)
- [x] T013 [P] Create MCP tool input schemas in backend/app/schemas/mcp.py (AddTaskInput, ListTasksInput, CompleteTaskInput, DeleteTaskInput, UpdateTaskInput per data-model.md)
- [x] T014 Implement MCP tool definitions in backend/app/mcp/tools.py (add_task, list_tasks, complete_task, delete_task, update_task functions operating on existing Task model with owner_id ownership enforcement; note: Task has no description field — add_task/update_task operate on title only; list_tasks translates status param to is_completed boolean: "pending"->False, "completed"->True)
- [x] T015 Create MCP server configuration in backend/app/mcp/server.py (register all 5 tools from tools.py, configure in-process MCP SDK)
- [x] T016 [P] Create backend/app/mcp/__init__.py to export MCP server and tools
- [x] T017 Configure OpenAI Agents SDK chat agent in backend/app/agents/chat_agent.py (agent with system prompt for task management, bind MCP tools, conversation history support, 50-message context window)
- [x] T018 [P] Create backend/app/agents/__init__.py to export chat agent

**Checkpoint**: Foundation ready — database tables exist, models defined, MCP tools implemented, agent configured. User story implementation can now begin.

---

## Phase 3: User Story 1 — Natural Language Task Creation (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks by typing natural language messages in a chat interface. The AI agent interprets intent, invokes `add_task` MCP tool, and returns a confirmation.

**Independent Test**: Send `POST /api/{user_id}/chat` with `{"message": "Add a task to buy groceries"}` and verify a task titled "Buy groceries" is created and a natural language confirmation is returned.

### Implementation for User Story 1

- [x] T019 [US1] Implement chat endpoint `POST /api/{user_id}/chat` in backend/app/api/chat.py (validate JWT, verify user_id matches token claims, handle ChatRequest/ChatResponse, create new conversation if conversation_id is omitted with auto-generated title from first message truncated to 50 chars)
- [x] T020 [US1] Add conversation persistence logic in backend/app/api/chat.py (load conversation history from DB up to 50 messages, persist user message and assistant response, persist tool invocations with name/args/result in Message table)
- [x] T021 [US1] Wire chat agent invocation in backend/app/api/chat.py (send conversation history + new message to OpenAI Agents SDK agent, receive response, handle add_task tool dispatch)
- [x] T022 [US1] Register chat router in backend/app/main.py (import and include chat router without modifying existing auth_router or tasks_router registrations)
- [x] T023 [US1] Implement ChatKit configuration in frontend/lib/chatkit.ts (configure ChatKit with backend chat endpoint URL and domain key)
- [x] T024 [US1] Create chat page in frontend/app/chat/page.tsx (ChatKit integration, send messages to backend, display responses, pass conversation_id for continuity)
- [x] T025 [US1] Create ChatWidget component in frontend/components/chat/ChatWidget.tsx (ChatKit wrapper with auth token injection in Authorization header, loading state, error display)

**Checkpoint**: User Story 1 fully functional — users can create tasks via natural language chat. The chat endpoint, agent, and frontend are all working end-to-end.

---

## Phase 4: User Story 2 — List and Query Tasks via Chat (Priority: P1)

**Goal**: Users can ask the chatbot about their tasks and receive a readable list filtered by status.

**Independent Test**: Send `{"message": "What are my tasks?"}` and verify the response contains the user's current task list. Send `{"message": "Show me my pending tasks"}` and verify only pending tasks are returned.

### Implementation for User Story 2

- [x] T026 [US2] Verify list_tasks MCP tool handles status filtering (pending/completed/all) correctly in backend/app/mcp/tools.py and returns readable task data
- [x] T027 [US2] Verify agent system prompt in backend/app/agents/chat_agent.py handles list/query intent and formats task lists in natural language (e.g., numbered lists, empty-state messaging)
- [x] T028 [US2] End-to-end verification: send list queries via chat endpoint and confirm correct responses for pending, completed, all, and empty task scenarios

**Checkpoint**: User Story 2 functional — users can query tasks via chat with status filtering. Combined with US1, this is the minimum viable chatbot.

---

## Phase 5: User Story 3 — Complete and Delete Tasks via Chat (Priority: P2)

**Goal**: Users can mark tasks as completed or delete them through natural language chat commands.

**Independent Test**: Send `{"message": "Mark buy groceries as done"}` and verify task status changes to completed. Send `{"message": "Delete the groceries task"}` and verify task is removed.

### Implementation for User Story 3

- [x] T029 [US3] Verify complete_task MCP tool marks task as completed (sets is_completed=true) with ownership validation in backend/app/mcp/tools.py
- [x] T030 [US3] Verify delete_task MCP tool removes task with ownership validation in backend/app/mcp/tools.py
- [x] T031 [US3] Ensure agent handles task reference resolution in backend/app/agents/chat_agent.py (when user says "the groceries task", agent calls list_tasks to find matching task by title, handles multiple matches with disambiguation prompt)
- [x] T032 [US3] Ensure agent handles not-found scenarios gracefully (task doesn't exist or belongs to another user) with user-friendly messages

**Checkpoint**: User Story 3 functional — users can complete and delete tasks via chat. Core task lifecycle management is complete.

---

## Phase 6: User Story 4 — Update Tasks via Chat (Priority: P2)

**Goal**: Users can update task titles and descriptions through natural language chat.

**Independent Test**: Send `{"message": "Rename my groceries task to Buy organic groceries"}` and verify the task title is updated.

### Implementation for User Story 4

- [x] T033 [US4] Verify update_task MCP tool updates title with ownership validation in backend/app/mcp/tools.py (Task model has no description field)
- [x] T034 [US4] Ensure agent handles update intent correctly in backend/app/agents/chat_agent.py (distinguishes rename from description update, resolves task reference)
- [x] T035 [US4] Ensure agent handles not-found and no-change scenarios with appropriate messages

**Checkpoint**: User Story 4 functional — full CRUD via chat is complete (create, read, update, delete, complete).

---

## Phase 7: User Story 5 — Conversation Continuity (Priority: P3)

**Goal**: Chat history persists across browser sessions. Users return to their most recent conversation and can start new ones.

**Independent Test**: Start a conversation, close the browser, return to `/chat`, and verify previous messages are visible.

### Implementation for User Story 5

- [x] T036 [US5] Implement conversation resume logic in frontend/app/chat/page.tsx (on page load, fetch most recent conversation_id and history for authenticated user from backend)
- [x] T037 [US5] Implement `GET /api/{user_id}/conversations/recent` endpoint in backend/app/api/chat.py (validate JWT, verify user_id matches token claims, return most recent conversation with up to 50 messages in chronological order, return 204 if no conversations exist)
- [x] T038 [US5] Implement "new conversation" action in frontend/components/chat/ChatWidget.tsx (button or command to start fresh conversation, clears conversation_id)
- [x] T039 [US5] Verify multi-turn context works: follow-up messages (e.g., "Also add milk") use conversation history to understand context via the agent

**Checkpoint**: User Story 5 functional — conversation persistence and continuity works across sessions.

---

## Phase 8: User Story 6 — Error Handling and Graceful Responses (Priority: P3)

**Goal**: The chatbot handles errors gracefully — internal errors produce friendly messages, off-topic queries are politely redirected, and failures are logged internally.

**Independent Test**: Send malformed messages, off-topic queries, and simulate service failures to verify user-friendly responses.

### Implementation for User Story 6

- [x] T040 [US6] Add error handling wrapper in backend/app/api/chat.py (catch OpenAI API errors and return 503 with "Service temporarily unavailable, please try again"; catch tool invocation failures and return friendly message; log all errors internally)
- [x] T041 [US6] Configure agent system prompt in backend/app/agents/chat_agent.py to redirect non-task queries politely (e.g., "I can only help with task management")
- [x] T042 [US6] Handle edge cases in backend/app/api/chat.py (empty message → 400, invalid conversation_id → 404, expired JWT → 401, user_id mismatch → 403)
- [x] T043 [US6] Ensure frontend displays error states in frontend/components/chat/ChatWidget.tsx (network errors, 401 redirect to login, 503 retry message)

**Checkpoint**: User Story 6 functional — all error scenarios produce user-friendly responses. No stack traces or technical details leak to users.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, security hardening, and documentation updates.

- [x] T044 Verify Phase II endpoints still function correctly (GET/POST/PUT/DELETE /api/tasks, /api/auth/* — no regressions)
- [x] T045 [P] Verify all MCP tool invocations are persisted in Message table with tool_name, tool_args, tool_result (FR-006 audit compliance)
- [x] T046 [P] Verify conversation updated_at timestamp is refreshed on each new message
- [ ] T047 Run quickstart.md verification checklist end-to-end (all items from quickstart.md § 5)
- [x] T048 [P] Verify CORS configuration allows ChatKit frontend origin to call chat endpoint
- [x] T049 [P] Verify environment variable documentation is complete (.env.example files for both backend and frontend)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 — first user story, establishes chat endpoint
- **User Story 2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1 since it uses the same endpoint/tools
- **User Story 3 (Phase 5)**: Depends on Phase 2 — can run after US1 endpoint exists (for end-to-end testing)
- **User Story 4 (Phase 6)**: Depends on Phase 2 — can run after US1 endpoint exists
- **User Story 5 (Phase 7)**: Depends on Phase 3 (US1) — needs chat endpoint and conversation persistence
- **User Story 6 (Phase 8)**: Depends on Phase 3 (US1) — needs chat endpoint to add error handling
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 only — establishes core chat endpoint, agent, and frontend
- **US2 (P1)**: Depends on Phase 2 — list_tasks tool already implemented in Phase 2; verification task
- **US3 (P2)**: Depends on Phase 2 — complete/delete tools already implemented in Phase 2; verification + disambiguation logic
- **US4 (P2)**: Depends on Phase 2 — update tool already implemented in Phase 2; verification task
- **US5 (P3)**: Depends on US1 — needs conversation persistence established by US1
- **US6 (P3)**: Depends on US1 — needs chat endpoint to add error handling

### Within Each User Story

- Models/schemas before services/tools
- Tools/agent before endpoint
- Backend before frontend
- Core implementation before edge cases

### Parallel Opportunities

- T002, T003, T004, T005, T006 can all run in parallel (Phase 1)
- T009, T010 can run in parallel (Phase 2 — different model files)
- T012, T013 can run in parallel (Phase 2 — different schema files)
- US2, US3, US4 are primarily verification tasks and can proceed quickly once US1 endpoint is live
- T044, T045, T046, T048, T049 can all run in parallel (Phase 9)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch model creation in parallel:
Task T009: "Create Conversation SQLModel in backend/app/models/conversation.py"
Task T010: "Create Message SQLModel in backend/app/models/message.py"

# Launch schema creation in parallel:
Task T012: "Create chat Pydantic schemas in backend/app/schemas/chat.py"
Task T013: "Create MCP tool input schemas in backend/app/schemas/mcp.py"
```

## Parallel Example: Phase 1 (Setup)

```bash
# Launch all setup tasks in parallel:
Task T002: "Install frontend dependency (@openai/chatkit)"
Task T003: "Create backend directory structure"
Task T004: "Create frontend directory structure"
Task T005: "Add backend env vars to config.py"
Task T006: "Add frontend env var example"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Natural Language Task Creation)
4. **STOP and VALIDATE**: Test US1 independently via quickstart.md
5. Complete Phase 4: User Story 2 (List and Query Tasks)
6. **STOP and VALIDATE**: Test US2 independently
7. Deploy/demo MVP — users can create and list tasks via chat

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test → Deploy (MVP: create tasks via chat)
3. Add US2 → Test → Deploy (query tasks via chat)
4. Add US3 → Test → Deploy (complete/delete tasks)
5. Add US4 → Test → Deploy (update tasks — full CRUD)
6. Add US5 → Test → Deploy (conversation persistence)
7. Add US6 → Test → Deploy (error handling polish)
8. Polish → Final validation → Production release

### Suggested MVP Scope

**US1 + US2** form the minimal viable chatbot: users can create tasks and query their task list via natural language. This demonstrates the core AI-driven value proposition of Phase III.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Phase II code is NEVER modified (Principle VI) — all changes are additive
- MCP tools are implemented once in Phase 2 and reused across all user stories
- The chat endpoint (T019–T022) is the central integration point — most user stories verify behavior through it
- All 5 MCP tools are built in Phase 2; user story phases focus on wiring, agent prompting, and edge case handling
- Total tasks: 49
