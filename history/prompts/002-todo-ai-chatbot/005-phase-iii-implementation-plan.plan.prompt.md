---
id: 005
title: Phase III Implementation Plan
stage: plan
date: 2026-02-09
surface: agent
model: claude-opus-4-6
feature: 002-todo-ai-chatbot
branch: 002-todo-ai-chatbot
user: user
command: /sp.plan
labels: ["plan", "phase-iii", "ai-chatbot", "architecture", "mcp", "openai-agents"]
links:
  spec: specs/002-todo-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-todo-ai-chatbot/plan.md
  - specs/002-todo-ai-chatbot/research.md
  - specs/002-todo-ai-chatbot/data-model.md
  - specs/002-todo-ai-chatbot/quickstart.md
  - specs/002-todo-ai-chatbot/contracts/openapi.yaml
tests:
  - N/A
---

## Prompt

/sp.plan (no additional arguments)

Generate implementation plan for Phase III Todo AI Chatbot feature. User specified existing system context: Phase II Next.js frontend on Vercel, Phase II FastAPI backend on Hugging Face, Neon PostgreSQL with User/Task tables. Extension strategy: add ChatKit to frontend, add /api/{user_id}/chat to backend, no Phase II refactoring.

## Response snapshot

Generated 5 planning artifacts:

1. **plan.md** — Implementation plan with technical context (existing system + extension strategy), constitution check (9/9 principles PASS), project structure (additive files only), and complexity tracking (no violations).

2. **research.md** — 7 research decisions (R-001 through R-007): OpenAI Agents SDK integration pattern, MCP SDK in-process, ChatKit frontend, conversation context reconstruction (50-message window), task resolution via list+match, stateless endpoint design, environment variable strategy.

3. **data-model.md** — 2 new entities (Conversation, Message) with SQLModel definitions, Pydantic schemas (ChatRequest, ChatResponse, 5 MCP tool input models), migration DDL (002_add_conversations.sql), query patterns, and ER diagram showing Phase II/III boundaries.

4. **contracts/openapi.yaml** — OpenAPI 3.0.3 spec for POST /api/{user_id}/chat with request/response schemas, 5 HTTP status codes (200, 400, 401, 403, 404, 503), examples for task creation, listing, and clarification.

5. **quickstart.md** — Setup guide covering env vars, migration, backend/frontend setup, verification checklist, and troubleshooting table.

Agent context updated via update-agent-context.sh.

## Outcome

- ✅ Impact: Complete architecture plan with all Phase 0 and Phase 1 artifacts generated
- 🧪 Tests: N/A (planning artifacts)
- 📁 Files: plan.md, research.md, data-model.md, quickstart.md, contracts/openapi.yaml
- 🔁 Next prompts: /sp.tasks to generate implementation tasks
- 🧠 Reflection: User's explicit "Existing System" and "Extension Strategy" context provided clear architectural boundaries. Constitution check passed all 9 principles cleanly — no complexity tracking needed. Research phase resolved all unknowns without external clarification.

## Evaluation notes (flywheel)

- Failure modes observed: Initial research.md write rejected by user; re-submitted successfully after user provided additional plan.md context
- Graders run and results (PASS/FAIL): Constitution gate PASS (9/9), all NEEDS CLARIFICATION resolved
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
