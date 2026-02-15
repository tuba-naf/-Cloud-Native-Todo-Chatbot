# Claude Code Rules

This file is generated during init for the selected agent.

You are an expert AI assistant specializing in Spec-Driven Development (SDD). Your primary goal is to work with the architext to build products.

---

## Project Overview

**Project:** Phase II - Todo Full-Stack Web Application (Basic Level Functionality)

**Objective:** Transform the console app into a modern multi-user web application with persistent storage using Claude Code + Spec-Kit Plus.

**Development Approach:** Spec-driven development flow:
1. Write spec (`/sp.specify`)
2. Generate plan (`/sp.plan`)
3. Break into tasks (`/sp.tasks`)
4. Implement via Claude Code (`/sp.implement`)

> **IMPORTANT:** No manual coding allowed. All implementation must go through the spec-driven workflow.

### Requirements

- Implement all 5 Basic Level features as a web application
- Create RESTful API endpoints
- Build responsive frontend interface
- Store data in Neon Serverless PostgreSQL database
- Implement user authentication using Better Auth with JWT tokens

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+ (App Router) |
| **Backend** | FastAPI (Python) |
| **ORM** | SQLModel |
| **Database** | Neon Serverless PostgreSQL |
| **Authentication** | Better Auth + JWT Tokens |

---

## Agents & Skills Reference

### Agent-to-Task Mapping

| Task Domain | Agent | Skill | Responsibilities |
|-------------|-------|-------|------------------|
| Authentication | **Auth Agent** | `auth-security` | Signup, signin, password hashing, JWT tokens, Better Auth integration |
| Frontend | **Frontend Agent** | `frontend-nextjs` | Next.js App Router, UI components, responsive layouts, API integration |
| Database | **DB Agent** | `neon-db-manager` | Schema design, tables, migrations, queries, Neon PostgreSQL operations |
| Backend | **Backend Agent** | `fastapi-backend` | FastAPI endpoints, request/response handling, database integration |

---

## Auth Agent (auth-security)

**Purpose:** Handle all authentication-related functionality including user registration, login, password security, and JWT token management.

### Responsibilities
- User signup with email/password validation
- User signin with credential verification
- Password hashing using bcrypt or argon2
- JWT token generation and validation
- Better Auth integration and configuration
- Session management
- Protected route middleware

### Usage Examples

```
# Implement user registration
"Use the auth-security agent to implement secure user signup with password hashing"

# Add JWT authentication
"Use the auth-security agent to add JWT token generation and validation"

# Protect API routes
"Use the auth-security agent to create authentication middleware for protected endpoints"
```

### When to Invoke
- Creating user registration/login endpoints
- Implementing password hashing logic
- Setting up JWT token flows
- Configuring Better Auth
- Adding authentication middleware
- Reviewing auth code for security vulnerabilities

### Memory Guidelines
After completing auth-related tasks, update `.claude/projects/*/memory/MEMORY.md` with:
- Authentication patterns used (e.g., JWT structure, token expiry)
- Better Auth configuration decisions
- Security considerations and constraints
- Password hashing algorithm choice and rationale

---

## Frontend Agent (frontend-nextjs)

**Purpose:** Build and maintain the Next.js frontend application using App Router patterns.

### Responsibilities
- Next.js App Router page and layout creation
- React Server Components and Client Components
- Responsive UI component development
- Form handling and validation
- API integration with backend
- Authentication state management on client
- Error handling and loading states

### Usage Examples

```
# Create a new page
"Use the frontend-nextjs agent to create a dashboard page with task list"

# Build a form component
"Use the frontend-nextjs agent to implement a task creation form with validation"

# Integrate with backend API
"Use the frontend-nextjs agent to connect the task list to the FastAPI backend"
```

### When to Invoke
- Creating new pages or layouts
- Building UI components
- Implementing client-side state management
- Integrating frontend with backend APIs
- Adding responsive design
- Handling authentication UI (login/signup forms)

### Memory Guidelines
After completing frontend tasks, update `.claude/projects/*/memory/MEMORY.md` with:
- Component patterns established
- State management approach
- API integration patterns
- UI/UX decisions made

---

## DB Agent (neon-db-manager)

**Purpose:** Design, create, and manage the Neon Serverless PostgreSQL database schema and operations.

### Responsibilities
- Database schema design
- Table creation and relationships
- Migration scripts
- Query optimization
- Index management
- Data integrity constraints
- Connection pooling configuration

### Usage Examples

```
# Design the schema
"Use the neon-db-manager agent to design the users and tasks tables schema"

# Create migrations
"Use the neon-db-manager agent to create a migration for adding a due_date column"

# Optimize queries
"Use the neon-db-manager agent to analyze and optimize the task listing query"
```

### When to Invoke
- Designing database schema
- Creating or modifying tables
- Writing or running migrations
- Optimizing slow queries
- Setting up indexes
- Troubleshooting database issues

### Memory Guidelines
After completing database tasks, update `.claude/projects/*/memory/MEMORY.md` with:
- Schema decisions and relationships
- Migration history notes
- Query patterns that work well
- Performance optimization findings

---

## Backend Agent (fastapi-backend)

**Purpose:** Develop and maintain the FastAPI backend application with RESTful endpoints.

### Responsibilities
- RESTful API endpoint design and implementation
- Request/response model validation (Pydantic)
- SQLModel integration for database operations
- Authentication middleware integration
- Error handling and HTTP status codes
- API documentation (OpenAPI/Swagger)
- CORS configuration

### Usage Examples

```
# Create CRUD endpoints
"Use the fastapi-backend agent to implement CRUD endpoints for tasks"

# Add authentication to routes
"Use the fastapi-backend agent to protect the task endpoints with JWT authentication"

# Handle database operations
"Use the fastapi-backend agent to implement task filtering by user ID"
```

### When to Invoke
- Creating new API endpoints
- Implementing request/response validation
- Integrating with SQLModel/database
- Adding authentication to routes
- Handling API errors
- Configuring CORS or middleware

### Memory Guidelines
After completing backend tasks, update `.claude/projects/*/memory/MEMORY.md` with:
- API endpoint patterns
- Pydantic model structures
- SQLModel query patterns
- Error handling conventions

---

## Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │ Better Auth │     │   Backend   │     │  Database   │
│  (Next.js)  │     │    (JWT)    │     │  (FastAPI)  │     │   (Neon)    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │  1. Login Request │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │  2. JWT Token     │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │  3. API Request + Authorization: Bearer <token>           │
       │───────────────────────────────────────>                   │
       │                   │                   │                   │
       │                   │  4. Verify Token  │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │                   │  5. User Identity │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │  6. Query (user_id)
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │                   │                   │  7. User's Tasks  │
       │                   │                   │<──────────────────│
       │                   │                   │                   │
       │  8. Filtered Response (user's tasks only)                 │
       │<──────────────────────────────────────│                   │
       │                   │                   │                   │
```

### Flow Steps

1. **User Login:** User submits credentials on Frontend
2. **Token Issued:** Better Auth validates credentials and issues JWT
3. **Authenticated Request:** Frontend includes JWT in `Authorization: Bearer <token>` header
4. **Token Verification:** Backend extracts and verifies JWT
5. **User Identification:** Backend identifies user from token claims
6. **Filtered Query:** Backend queries database with user_id filter
7. **Data Retrieved:** Database returns only that user's data
8. **Response Sent:** Backend returns filtered data to Frontend

> **IMPORTANT:** All authentication logic MUST invoke the Auth Agent via the `auth-security` skill.

---

## Task context

**Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via a defined set of tools.

**Your Success is Measured By:**
- All outputs strictly follow the user intent.
- Prompt History Records (PHRs) are created automatically and accurately for every user prompt.
- Architectural Decision Record (ADR) suggestions are made intelligently for significant decisions.
- All changes are small, testable, and reference code precisely.

## Core Guarantees (Product Promise)

- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/`
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

## Development Guidelines

### 1. Authoritative Source Mandate:
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow:
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge capture (PHR) for Every User Input.
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

**PHR Creation Process:**

1) Detect stage
   - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate title
   - 3–7 words; create a slug for the filename.

2a) Resolve route (all under history/prompts/)
  - `constitution` → `history/prompts/constitution/`
  - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (requires feature context)
  - `general` → `history/prompts/general/`

3) Prefer agent‑native flow (no shell)
   - Read the PHR template from one of:
     - `.specify/templates/phr-template.prompt.md`
     - `templates/phr-template.prompt.md`
   - Allocate an ID (increment; on collision, increment again).
   - Compute output path based on stage:
     - Constitution → `history/prompts/constitution/<ID>-<slug>.constitution.prompt.md`
     - Feature → `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`
     - General → `history/prompts/general/<ID>-<slug>.general.prompt.md`
   - Fill ALL placeholders in YAML and body:
     - ID, TITLE, STAGE, DATE_ISO (YYYY‑MM‑DD), SURFACE="agent"
     - MODEL (best known), FEATURE (or "none"), BRANCH, USER
     - COMMAND (current command), LABELS (["topic1","topic2",...])
     - LINKS: SPEC/TICKET/ADR/PR (URLs or "null")
     - FILES_YAML: list created/modified files (one per line, " - ")
     - TESTS_YAML: list tests run/added (one per line, " - ")
     - PROMPT_TEXT: full user input (verbatim, not truncated)
     - RESPONSE_TEXT: key assistant output (concise but representative)
     - Any OUTCOME/EVALUATION fields required by the template
   - Write the completed file with agent file tools (WriteFile/Edit).
   - Confirm absolute path in output.

4) Use sp.phr command file if present
   - If `.**/commands/sp.phr.*` exists, follow its structure.
   - If it references shell but Shell is unavailable, still perform step 3 with agent‑native tools.

5) Shell fallback (only if step 3 is unavailable or fails, and Shell is permitted)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Then open/patch the created file to ensure all placeholders are filled and prompt/response are embedded.

6) Routing (automatic, all under history/prompts/)
   - Constitution → `history/prompts/constitution/`
   - Feature stages → `history/prompts/<feature-name>/` (auto-detected from branch or explicit feature context)
   - General → `history/prompts/general/`

7) Post‑creation validations (must pass)
   - No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`).
   - Title, stage, and dates match front‑matter.
   - PROMPT_TEXT is complete (not truncated).
   - File exists at the expected path and is readable.
   - Path matches route.

8) Report
   - Print: ID, path, stage, title.
   - On any failure: warn but do not block the main command.
   - Skip PHR only for `/sp.phr` itself.

### 4. Explicit ADR suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
  "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto‑create the ADR.

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment. Treat the user as a specialized tool for clarification and decision-making.

**Invocation Triggers:**
1.  **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2.  **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3.  **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4.  **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps.

## Default policies (must follow)
- Clarify and plan first - keep business understanding separate from technical plan and carefully architect and implement.
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing.
- Never hardcode secrets or tokens; use `.env` and docs.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Cite existing code with code references (start:end:path); propose new code in fenced blocks.
- Keep reasoning private; output only decisions, artifacts, and justifications.

### Execution contract for every request
1) Confirm surface and success criteria (one sentence).
2) List constraints, invariants, non‑goals.
3) Produce the artifact with acceptance checks inlined (checkboxes or tests where applicable).
4) Add follow‑ups and risks (max 3 bullets).
5) Create PHR in appropriate subdirectory under `history/prompts/` (constitution, feature-name, or general).
6) If plan/tasks identified decisions that meet significance, surface ADR suggestion text as described above.

### Minimum acceptance criteria
- Clear, testable acceptance criteria included
- Explicit error paths and constraints stated
- Smallest viable change; no unrelated edits
- Code references to modified/inspected files where relevant

## Architect Guidelines (for planning)

Instructions: As an expert architect, generate a detailed architectural plan for [Project Name]. Address each of the following thoroughly.

1. Scope and Dependencies:
   - In Scope: boundaries and key features.
   - Out of Scope: explicitly excluded items.
   - External Dependencies: systems/services/teams and ownership.

2. Key Decisions and Rationale:
   - Options Considered, Trade-offs, Rationale.
   - Principles: measurable, reversible where possible, smallest viable change.

3. Interfaces and API Contracts:
   - Public APIs: Inputs, Outputs, Errors.
   - Versioning Strategy.
   - Idempotency, Timeouts, Retries.
   - Error Taxonomy with status codes.

4. Non-Functional Requirements (NFRs) and Budgets:
   - Performance: p95 latency, throughput, resource caps.
   - Reliability: SLOs, error budgets, degradation strategy.
   - Security: AuthN/AuthZ, data handling, secrets, auditing.
   - Cost: unit economics.

5. Data Management and Migration:
   - Source of Truth, Schema Evolution, Migration and Rollback, Data Retention.

6. Operational Readiness:
   - Observability: logs, metrics, traces.
   - Alerting: thresholds and on-call owners.
   - Runbooks for common tasks.
   - Deployment and Rollback strategies.
   - Feature Flags and compatibility.

7. Risk Analysis and Mitigation:
   - Top 3 Risks, blast radius, kill switches/guardrails.

8. Evaluation and Validation:
   - Definition of Done (tests, scans).
   - Output Validation for format/requirements/safety.

9. Architectural Decision Record (ADR):
   - For each significant decision, create an ADR and link it.

### Architecture Decision Records (ADR) - Intelligent Suggestion

After design/architecture work, test for ADR significance:

- Impact: long-term consequences? (e.g., framework, data model, API, security, platform)
- Alternatives: multiple viable options considered?
- Scope: cross‑cutting and influences system design?

If ALL true, suggest:
📋 Architectural decision detected: [brief-description]
   Document reasoning and tradeoffs? Run `/sp.adr [decision-title]`

Wait for consent; never auto-create ADRs. Group related decisions (stacks, authentication, deployment) into one ADR when appropriate.

---

## Persistent Agent Memory

### Memory Location
Each agent should maintain knowledge in: `.claude/projects/*/memory/MEMORY.md`

### What to Record
- **Patterns:** Successful code patterns and conventions established
- **Decisions:** Key technical decisions and their rationale
- **Constraints:** Project-specific limitations discovered
- **Lessons:** Mistakes made and how to avoid them
- **Dependencies:** External service configurations and quirks

### Memory Update Triggers
Update memory after:
- Completing a significant feature
- Discovering a non-obvious solution
- Making an architectural decision
- Encountering and resolving an error
- Establishing a new pattern

### Memory Format
```markdown
## [Category]

### [Topic]
- **Context:** Why this matters
- **Decision/Pattern:** What was decided or established
- **Rationale:** Why this approach was chosen
```

---

## Basic Project Structure

```
project-root/
├── .specify/
│   ├── memory/
│   │   └── constitution.md          # Project principles
│   ├── templates/                    # Spec-Kit Plus templates
│   └── scripts/                      # Automation scripts
├── specs/
│   └── <feature>/
│       ├── spec.md                   # Feature requirements
│       ├── plan.md                   # Architecture decisions
│       └── tasks.md                  # Testable tasks
├── history/
│   ├── prompts/                      # Prompt History Records
│   │   ├── constitution/
│   │   ├── <feature-name>/
│   │   └── general/
│   └── adr/                          # Architecture Decision Records
├── frontend/                         # Next.js application
│   ├── app/                          # App Router pages
│   ├── components/                   # React components
│   └── lib/                          # Utilities
├── backend/                          # FastAPI application
│   ├── app/
│   │   ├── api/                      # API endpoints
│   │   ├── models/                   # SQLModel models
│   │   └── auth/                     # Authentication
│   └── migrations/                   # Database migrations
└── CLAUDE.md                         # This file
```

---

## Code Standards

See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.

### Project-Specific Standards

**Frontend (Next.js):**
- Use App Router patterns exclusively
- Prefer Server Components; use Client Components only when needed
- Implement proper loading and error states
- Use TypeScript with strict mode

**Backend (FastAPI):**
- Use Pydantic models for all request/response validation
- Use SQLModel for database models
- Implement proper HTTP status codes
- Document all endpoints with OpenAPI

**Database:**
- All tables must have `created_at` and `updated_at` timestamps
- Use UUIDs for primary keys
- Foreign keys must have proper constraints
- Write migrations for all schema changes

**Authentication:**
- Never store plain-text passwords
- Use short-lived access tokens
- Implement proper token refresh
- Log authentication events

## Active Technologies
- Python 3.12 (backend), TypeScript 5.x (frontend) + FastAPI 0.109+, SQLModel 0.0.14+, Next.js 16+, Better Auth (001-todo-fullstack-jwt)
- OpenAI Agents SDK, OpenAI ChatKit, MCP SDK (002-todo-ai-chatbot)
- Python 3.12 (backend), TypeScript 5.x (frontend) + FastAPI, OpenAI Agents SDK, MCP SDK, OpenAI ChatKit, SQLModel (002-todo-ai-chatbot)
- Neon Serverless PostgreSQL (existing instance, new tables: Conversation, Message) (002-todo-ai-chatbot)
- Docker, Helm, Minikube, kubectl-ai, Kagent, Gordon (optional) (003-todo-cloud-native)
- Python 3.12 (backend), TypeScript 5.7 / Node 20 (frontend) + Docker, Helm 3.x, Minikube, kubectl, Trivy, Hadolint, kubectl-ai, Kagent (003-todo-cloud-native)
- Neon Serverless PostgreSQL (external, unchanged) (003-todo-cloud-native)

## Recent Changes
- 001-todo-fullstack-jwt: Added Python 3.12 (backend), TypeScript 5.x (frontend) + FastAPI 0.109+, SQLModel 0.0.14+, Next.js 16+, Better Auth
- 002-todo-ai-chatbot: Added OpenAI Agents SDK, OpenAI ChatKit, MCP SDK for Phase III AI Chatbot
- 003-todo-cloud-native: Added Docker, Helm, Minikube, kubectl-ai, Kagent for Phase IV Cloud-Native Deployment

---

# Phase III - Todo AI Chatbot

## Project Overview

**Project:** Phase III - Todo AI Chatbot (AI-Driven Development)

**Objective:** Extend the Phase II Todo Full-Stack Web Application with an AI-powered chatbot interface that allows users to manage tasks via natural language. Phase III integrates with the already deployed frontend (Vercel) and backend (Hugging Face). All Phase III endpoints are distinct from Phase II to ensure no disruption of existing services.

**Development Approach:** Same spec-driven development flow as Phase II:
1. Write spec (`/sp.specify`)
2. Generate plan (`/sp.plan`)
3. Break into tasks (`/sp.tasks`)
4. Implement via Claude Code (`/sp.implement`)

> **IMPORTANT:** No manual coding allowed. All implementation must go through the spec-driven workflow. Phase II endpoints and functionality must remain untouched.

### Requirements

- Add AI chatbot interface for natural language task management
- Implement stateless `/api/{user_id}/chat` endpoint (distinct from Phase II `/api/tasks`)
- Integrate OpenAI Agents SDK with MCP tools for task operations
- Persist conversation history in database (Conversation, Message tables)
- Do not modify existing Phase II Task tables or endpoints
- Deploy ChatKit frontend on Vercel; backend on Hugging Face

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | OpenAI ChatKit |
| **Backend** | FastAPI (Python) |
| **AI Framework** | OpenAI Agents SDK |
| **MCP Server** | Official MCP SDK (tools invoked via Backend Agent) |
| **ORM** | SQLModel |
| **Database** | Neon Serverless PostgreSQL |
| **Authentication** | Better Auth + JWT Tokens |

---

## Phase III Agents & Skills Reference

### Agent-to-Task Mapping

| Task Domain | Agent | Skill | Responsibilities |
|-------------|-------|-------|------------------|
| AI Chat Backend | **Backend Agent** | `fastapi-backend` | `/api/{user_id}/chat` endpoint, OpenAI Agents SDK integration, MCP tool dispatch |
| MCP Tools | **Backend Agent** | `fastapi-backend` | MCP server setup, tool definitions (add_task, list_tasks, complete_task, delete_task, update_task) |
| ChatKit Frontend | **Frontend Agent** | `frontend-nextjs` | OpenAI ChatKit integration, chat UI, conversation display |
| Database (Phase III) | **DB Agent** | `neon-db-manager` | Conversation and Message tables, migrations, conversation queries |
| Authentication | **Auth Agent** | `auth-security` | JWT validation on `/api/{user_id}/chat`, user identity from token claims |

> **NOTE:** The Backend Agent handles all MCP tool invocations directly. No separate MCP Agent is required. The MCP SDK runs in-process within the FastAPI backend.

---

## MCP Tools Specification

All MCP tools operate on the authenticated user's tasks only. Each tool is invoked by the Backend Agent via the MCP SDK when the OpenAI Agents SDK determines the user's intent.

### Tool Definitions

| Tool Name | Description | Parameters | Returns |
|-----------|-------------|------------|---------|
| `add_task` | Create a new task for the user | `title: str`, `description: str (optional)` | Created task object |
| `list_tasks` | List all tasks for the user | `status: str (optional, e.g. "pending", "completed")` | Array of task objects |
| `complete_task` | Mark a task as completed | `task_id: uuid` | Updated task object |
| `delete_task` | Delete a task | `task_id: uuid` | Confirmation message |
| `update_task` | Update task fields | `task_id: uuid`, `title: str (optional)`, `description: str (optional)` | Updated task object |

### Natural Language Command Examples

| User Message | Mapped MCP Tool | Tool Parameters |
|-------------|-----------------|-----------------|
| "Add a task to buy groceries" | `add_task` | `title="Buy groceries"` |
| "What are my tasks?" | `list_tasks` | _(none)_ |
| "Show me my pending tasks" | `list_tasks` | `status="pending"` |
| "Mark the groceries task as done" | `complete_task` | `task_id=<resolved_uuid>` |
| "Delete the groceries task" | `delete_task` | `task_id=<resolved_uuid>` |
| "Rename my first task to Buy organic groceries" | `update_task` | `task_id=<resolved_uuid>`, `title="Buy organic groceries"` |
| "I need to finish the report by Friday" | `add_task` | `title="Finish the report by Friday"` |
| "What have I completed so far?" | `list_tasks` | `status="completed"` |

---

## Conversation Flow & Stateless Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   ChatKit   │     │   FastAPI   │     │ OpenAI Agent │     │  Database   │
│  (Frontend) │     │  (Backend)  │     │  + MCP Tools │     │   (Neon)    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │  1. POST /api/{user_id}/chat          │                   │
       │   { message, conversation_id? }       │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │  2. Load conversation history         │
       │                   │──────────────────────────────────────>│
       │                   │                   │                   │
       │                   │  3. History rows  │                   │
       │                   │<──────────────────────────────────────│
       │                   │                   │                   │
       │                   │  4. Send history + new message        │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │  5. (If tool needed)
       │                   │                   │     Invoke MCP tool
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │                   │                   │  6. Tool result   │
       │                   │                   │<──────────────────│
       │                   │                   │                   │
       │                   │  7. AI response   │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │                   │  8. Persist message + response        │
       │                   │──────────────────────────────────────>│
       │                   │                   │                   │
       │  9. { response, conversation_id }     │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
```

### Flow Steps

1. **User Sends Message:** ChatKit frontend sends POST to `/api/{user_id}/chat` with the user message and optional `conversation_id`.
2. **Load History:** Backend loads conversation history from database (if `conversation_id` provided).
3. **History Retrieved:** Database returns previous messages for context.
4. **Agent Invocation:** Backend sends history + new message to OpenAI Agents SDK.
5. **Tool Dispatch:** If the agent determines a task operation is needed, it invokes the appropriate MCP tool.
6. **Tool Result:** MCP tool executes against the database and returns the result.
7. **AI Response:** Agent formulates a natural language response incorporating tool results.
8. **Persist State:** Backend saves the user message and AI response to the database.
9. **Response Returned:** Backend returns the AI response and `conversation_id` to ChatKit.

### Stateless Design Principles

- **No in-memory session state:** Each request to `/api/{user_id}/chat` is independent. The backend reconstructs context by loading conversation history from the database.
- **Database as single source of truth:** All conversation state (messages, tool invocations, responses) is persisted in the Conversation and Message tables.
- **Scalability:** Stateless design allows horizontal scaling of backend instances without session affinity.
- **Safe concurrent requests:** No shared mutable state between requests; database transactions ensure consistency.

---

## Phase III Database Models

> **IMPORTANT:** Do not modify existing Phase II Task tables. Phase III adds new tables (Conversation, Message) and reads/writes to existing Task records via MCP tools.

### Conversation Model

```python
import uuid
from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional


class Conversation(SQLModel, table=True):
    """Tracks a chat conversation session for a user."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True, nullable=False)
    title: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

### Message Model

```python
import uuid
from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional


class Message(SQLModel, table=True):
    """Stores individual messages within a conversation."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(
        foreign_key="conversation.id", index=True, nullable=False
    )
    role: str = Field(
        nullable=False, max_length=20
    )  # "user", "assistant", or "tool"
    content: str = Field(nullable=False)
    tool_name: Optional[str] = Field(default=None, max_length=50)
    tool_args: Optional[str] = Field(default=None)  # JSON-serialized tool arguments
    tool_result: Optional[str] = Field(default=None)  # JSON-serialized tool result
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

### Entity Relationship

```
┌──────────┐       ┌────────────────┐       ┌───────────┐
│   User   │1─────*│  Conversation  │1─────*│  Message   │
│ (Phase II)│       │  (Phase III)   │       │ (Phase III)│
└──────────┘       └────────────────┘       └───────────┘
     │
     │1─────* (existing Phase II relationship)
     │
┌──────────┐
│   Task   │
│ (Phase II)│
└──────────┘
```

- **User → Conversation:** One user has many conversations (1:N).
- **Conversation → Message:** One conversation has many messages (1:N).
- **User → Task:** Existing Phase II relationship (1:N). Phase III MCP tools read/write Task records but do not alter the Task schema.

---

## Backend Endpoint Isolation

| Phase | Endpoint | Method | Purpose |
|-------|----------|--------|---------|
| **Phase II** | `/api/tasks` | GET, POST, PUT, DELETE | CRUD operations on tasks (existing, unchanged) |
| **Phase II** | `/api/auth/*` | POST | Authentication endpoints (existing, unchanged) |
| **Phase III** | `/api/{user_id}/chat` | POST | Stateless AI chat endpoint for natural language task management |

> **IMPORTANT:** Phase II endpoints (`/api/tasks`, `/api/auth/*`) must remain unchanged. Phase III introduces only `/api/{user_id}/chat`. The `{user_id}` path parameter is validated against the JWT token claims to prevent unauthorized access.

### Chat Endpoint Contract

**Request:**
```json
{
  "message": "Add a task to buy groceries",
  "conversation_id": "optional-uuid-for-existing-conversation"
}
```

**Response:**
```json
{
  "response": "I've added 'Buy groceries' to your tasks!",
  "conversation_id": "uuid-of-conversation"
}
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Deployment & Environment Variables

### Phase III Environment Variables

| Variable | Purpose | Used By |
|----------|---------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Backend (Hugging Face) |
| `OPENAI_API_KEY` | OpenAI API key for Agents SDK | Backend (Hugging Face) |
| `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` | ChatKit domain key | Frontend (Vercel) |
| `AUTH_SECRET` | Better Auth secret for JWT validation | Backend (Hugging Face) |

### Deployment Targets

| Component | Platform | Notes |
|-----------|----------|-------|
| **ChatKit Frontend** | Vercel | Integrated into existing Phase II Next.js deployment |
| **Chat Backend** | Hugging Face | Extended Phase II FastAPI with `/api/{user_id}/chat` endpoint |

> **IMPORTANT:** Phase III environment variables must not conflict with Phase II. Use separate `.env` entries and never hardcode secrets.

---

## Phase III Project Structure Additions

```
project-root/
├── frontend/                         # Existing Phase II + Phase III ChatKit
│   ├── app/
│   │   ├── chat/                     # Phase III: ChatKit page
│   │   │   └── page.tsx              # ChatKit integration
│   │   ├── dashboard/                # Phase II: existing pages
│   │   └── ...
│   ├── components/
│   │   ├── chat/                     # Phase III: chat UI components
│   │   │   └── ChatWidget.tsx        # ChatKit wrapper component
│   │   └── ...                       # Phase II: existing components
│   └── lib/
│       └── chatkit.ts                # Phase III: ChatKit config
├── backend/                          # Existing Phase II + Phase III chat endpoint
│   ├── app/
│   │   ├── api/
│   │   │   ├── tasks.py              # Phase II: existing task CRUD (unchanged)
│   │   │   ├── auth.py               # Phase II: existing auth (unchanged)
│   │   │   └── chat.py               # Phase III: /api/{user_id}/chat endpoint
│   │   ├── models/
│   │   │   ├── task.py               # Phase II: existing Task model (unchanged)
│   │   │   ├── conversation.py       # Phase III: Conversation model
│   │   │   └── message.py            # Phase III: Message model
│   │   ├── agents/
│   │   │   └── chat_agent.py         # Phase III: OpenAI Agents SDK setup
│   │   ├── mcp/
│   │   │   ├── server.py             # Phase III: MCP server configuration
│   │   │   └── tools.py              # Phase III: MCP tool definitions
│   │   └── auth/                     # Phase II: existing auth (unchanged)
│   └── migrations/
│       ├── ...                       # Phase II: existing migrations (unchanged)
│       └── add_conversation_tables.py # Phase III: Conversation + Message tables
├── specs/
│   ├── 001-todo-fullstack-jwt/       # Phase II specs (unchanged)
│   └── 002-todo-ai-chatbot/          # Phase III specs
│       ├── spec.md                   # Phase III feature spec
│       ├── plan.md                   # Phase III architecture plan
│       └── tasks.md                  # Phase III implementation tasks
├── db/
│   └── migrations/                   # Phase III migration scripts
│       └── 002_add_conversations.sql # Conversation + Message DDL
└── CLAUDE.md                         # This file (updated for Phase III)
```

---

## Phase III Memory & PHR Guidelines

### Memory Updates for Phase III

After completing Phase III tasks, update `.claude/projects/*/memory/MEMORY.md` with:

- **AI Agent Patterns:** OpenAI Agents SDK configuration, prompt templates, tool binding patterns
- **MCP Integration:** MCP server setup, tool registration, tool invocation patterns
- **ChatKit Configuration:** Frontend integration approach, domain key setup, component patterns
- **Conversation Management:** History loading strategy, message persistence patterns, conversation lifecycle
- **Stateless Design:** Patterns for reconstructing context from database, concurrency handling

### PHR Routing for Phase III

All Phase III PHRs are routed to: `history/prompts/002-todo-ai-chatbot/`

PHR stages applicable to Phase III:
- `spec` — Feature specification work
- `plan` — Architecture and planning
- `tasks` — Task breakdown
- `green` — Implementation (new features)
- `refactor` — Improvements to Phase III code
- `misc` — Other Phase III work

---

## Phase III Code Standards

**OpenAI Agents SDK:**
- Define tools with clear descriptions for accurate intent classification
- Handle agent errors gracefully; return user-friendly messages
- Do not expose internal tool errors to the user

**MCP Server:**
- All tools must validate `user_id` ownership before operating on tasks
- Tool parameters must be validated via Pydantic models
- Tool results must be JSON-serializable

**ChatKit Frontend:**
- Use the official ChatKit components; do not build custom chat UI
- Handle loading and error states for chat messages
- Display conversation history on page load

**Conversation Persistence:**
- Always persist both user messages and assistant responses
- Store tool invocations (name, args, result) in the Message table for auditability
- Use database transactions when persisting message pairs

---

# Phase IV - Todo Cloud-Native Deployment

## Project Overview

**Project:** Phase IV - Todo Cloud-Native Deployment

**Objective:** Containerize the frontend and backend of the Todo application and deploy locally on **Minikube** using **Docker, Helm, kubectl-ai, Kagent**, with optional **Gordon**. Ensure full backward compatibility with Phase II and Phase III endpoints.

**Development Approach:** Same spec-driven development flow:
1. Write spec (`/sp.specify`)
2. Generate plan (`/sp.plan`)
3. Break into tasks (`/sp.tasks`)
4. Implement via Claude Code (`/sp.implement`)

> **IMPORTANT:** No manual coding allowed outside the SDD workflow. Phase II/III application logic is not refactored.

### Requirements

- Docker images for frontend and backend build, lint, scan, and run cleanly
- Helm charts deploy applications on Minikube without errors
- Phase II endpoints (`/api/tasks`, `/api/auth/*`) fully functional post-deployment
- Phase III AI chat endpoint (`/api/{user_id}/chat`) fully operational post-deployment
- Secrets handled securely using Kubernetes Secrets; none in code/images
- AI DevOps tools (kubectl-ai, Kagent) functional; fallback if Gordon unavailable

### Constraints / Non-Goals

- No production or cloud hosting — local Minikube deployment only
- Phase II/III application logic is not refactored
- Gordon is optional; only used if available

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Container Runtime** | Docker |
| **Orchestration** | Kubernetes (Minikube) |
| **Package Management** | Helm |
| **AI DevOps** | kubectl-ai, Kagent |
| **Build Optimization** | Gordon (optional) |
| **Image Scanning** | Trivy, Hadolint |

---

## Phase IV Agents & Skills Reference

### Agent-to-Task Mapping

| Task Domain | Agent | Skill | Responsibilities |
|-------------|-------|-------|------------------|
| Authentication & Secrets | **Auth Agent** | `auth-security` | Manage JWT/Auth secrets in Kubernetes; securely inject secrets into backend and frontend deployments; validate env variables like `AUTH_SECRET`; audit secret usage |
| Frontend Containerization | **Frontend Agent** | `frontend-nextjs` | Build and optimize Docker image for frontend (multi-stage, env injection, port 3000); integrate with Helm charts; validate UI functionality post-deployment; ensure backward compatibility with Phase II/III |
| Backend Containerization | **Backend Agent** | `fastapi-backend` | Build and optimize Docker image for backend (slim Python + Gunicorn/Uvicorn, non-root, port 8000); integrate with Helm charts; manage AI DevOps tooling (kubectl-ai, Kagent); validate Phase II/III endpoints; fallback to Gordon optimizations if unavailable |
| Database & Config Management | **DB Agent** | `neon-db-manager` | Manage Kubernetes Secrets for `DATABASE_URL`; validate DB connectivity in Minikube; prepare migrations for Phase IV; configure resource limits and probes |

---

## Gordon Fallback Strategy

- If Gordon is unavailable:
  - Use standard Docker optimizations (multi-stage builds, layer caching, pinned base images)
  - Run lint/security scans (Trivy for image scanning, Hadolint for Dockerfile linting)
  - Document manual optimizations in agent memory

---

## Docker Image Specifications

### Frontend Dockerfile (Next.js)

| Property | Value |
|----------|-------|
| **Base Image** | `node:20-alpine` (pinned) |
| **Build Strategy** | Multi-stage (deps → build → runtime) |
| **Exposed Port** | 3000 |
| **User** | Non-root |
| **Env Injection** | Build-time args for `NEXT_PUBLIC_*` variables |

### Backend Dockerfile (FastAPI)

| Property | Value |
|----------|-------|
| **Base Image** | `python:3.12-slim` (pinned) |
| **Build Strategy** | Multi-stage (deps → runtime) |
| **Server** | Gunicorn + Uvicorn workers |
| **Exposed Port** | 8000 |
| **User** | Non-root |
| **Health Check** | `/health` endpoint |

---

## Helm Chart Structure

```
charts/
├── todo-frontend/
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       ├── configmap.yaml
│       └── _helpers.tpl
├── todo-backend/
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       ├── secret.yaml
│       └── _helpers.tpl
└── values/
    └── minikube.yaml                 # Environment-specific overrides
```

### Helm Values (Key Configuration)

**Backend (`todo-backend/values.yaml`):**
- `replicaCount`: 1 (Minikube)
- `image.repository`: `todo-backend`
- `image.tag`: `latest`
- `service.port`: 8000
- `resources.limits`: CPU 500m, Memory 512Mi
- `resources.requests`: CPU 250m, Memory 256Mi
- `livenessProbe`: `/health`
- `readinessProbe`: `/health`
- `env`: Sourced from Kubernetes Secrets

**Frontend (`todo-frontend/values.yaml`):**
- `replicaCount`: 1 (Minikube)
- `image.repository`: `todo-frontend`
- `image.tag`: `latest`
- `service.port`: 3000
- `resources.limits`: CPU 300m, Memory 256Mi
- `resources.requests`: CPU 150m, Memory 128Mi

---

## Kubernetes Secrets Management

All secrets are managed via Kubernetes Secrets objects. Never hardcode in Dockerfiles, Helm values checked into source, or application code.

### Required Secrets

| Secret Key | Purpose | Consumed By |
|------------|---------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Backend |
| `OPENAI_API_KEY` | Phase III AI integration | Backend |
| `AUTH_SECRET` | Better Auth secret for JWT validation | Backend |
| `JWT_SECRET` | JWT token signing | Backend |

### Secret Creation (Minikube)

```bash
kubectl create secret generic todo-secrets \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=OPENAI_API_KEY="$OPENAI_API_KEY" \
  --from-literal=AUTH_SECRET="$AUTH_SECRET" \
  --from-literal=JWT_SECRET="$JWT_SECRET"
```

> **IMPORTANT:** Secrets must never be committed to version control. Use `.env` files locally and Kubernetes Secrets in the cluster. Ensure no conflicts with Phase II/III environment variables.

---

## Backend Endpoint Isolation (All Phases)

| Phase | Endpoint | Method | Purpose |
|-------|----------|--------|---------|
| **Phase II** | `/api/tasks` | GET, POST, PUT, DELETE | CRUD operations on tasks (unchanged) |
| **Phase II** | `/api/auth/*` | POST | Authentication endpoints (unchanged) |
| **Phase III** | `/api/{user_id}/chat` | POST | AI chat endpoint (unchanged) |
| **Phase IV** | `/health` | GET | Kubernetes health/readiness probe |

> **IMPORTANT:** Phase IV adds only the `/health` endpoint for Kubernetes probes. All Phase II and Phase III endpoints remain unchanged and fully operational.

---

## Deployment & Environment Variables

### Phase IV Environment Variables

| Variable | Purpose | Used By |
|----------|---------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Backend (Minikube) |
| `OPENAI_API_KEY` | Phase III AI integration | Backend (Minikube) |
| `AUTH_SECRET` | Better Auth secret for JWT validation | Backend (Minikube) |
| `JWT_SECRET` | JWT token signing | Backend (Minikube) |

### Deployment Target

| Component | Platform | Notes |
|-----------|----------|-------|
| **Frontend** | Minikube | Docker image deployed via Helm chart |
| **Backend** | Minikube | Docker image deployed via Helm chart |
| **Database** | Neon (external) | Existing Neon PostgreSQL instance; accessed via `DATABASE_URL` |

---

## Phase IV Project Structure Additions

```
project-root/
├── docker/                           # Phase IV: Dockerfiles
│   ├── frontend/
│   │   └── Dockerfile                # Multi-stage Next.js build
│   └── backend/
│       └── Dockerfile                # Multi-stage FastAPI build
├── charts/                           # Phase IV: Helm charts
│   ├── todo-frontend/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   ├── todo-backend/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   └── values/
│       └── minikube.yaml             # Environment-specific overrides
├── specs/
│   ├── 001-todo-fullstack-jwt/       # Phase II specs (unchanged)
│   ├── 002-todo-ai-chatbot/          # Phase III specs (unchanged)
│   └── 003-todo-cloud-native/        # Phase IV specs
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── frontend/                         # Existing Phase II/III frontend (unchanged)
├── backend/                          # Existing Phase II/III backend (unchanged)
├── db/                               # Existing Phase II/III database (unchanged)
└── CLAUDE.md                         # This file (updated for Phase IV)
```

---

## Phase IV Memory & PHR Guidelines

### Memory Updates for Phase IV

After completing Phase IV tasks, update `.claude/projects/*/memory/MEMORY.md` with:

- **Docker Patterns:** Multi-stage build strategies, base image selections, layer caching approaches
- **Helm Configuration:** Chart structure decisions, values organization, template patterns
- **Kubernetes Secrets:** Secret management approach, injection patterns, rotation strategy
- **Minikube Setup:** Local development workflow, common issues and resolutions
- **AI DevOps Tooling:** kubectl-ai and Kagent usage patterns, Gordon availability and fallback
- **Resource Limits:** CPU/memory budgets for frontend and backend pods

### PHR Routing for Phase IV

All Phase IV PHRs are routed to: `history/prompts/003-todo-cloud-native/`

PHR stages applicable to Phase IV:
- `spec` — Feature specification work
- `plan` — Architecture and planning
- `tasks` — Task breakdown
- `green` — Implementation (new features)
- `refactor` — Improvements to Phase IV configuration
- `misc` — Other Phase IV work

---

## Phase IV ADR Guidelines

Trigger ADR suggestions for:
- AI DevOps tool selection (kubectl-ai vs Kagent vs Gordon)
- Helm chart structure and namespace decisions
- Resource limits and probe configuration
- Secrets management strategy (Kubernetes Secrets vs alternatives)
- Docker base image and build strategy choices

> Follow Claude Code Rules: surface ADRs, require user consent, do not auto-create.

---

## Phase IV Code Standards

**Dockerfiles:**
- Use multi-stage builds to minimize image size
- Pin base image versions (no `latest` tags for base images)
- Run as non-root user in final stage
- Include `.dockerignore` to exclude unnecessary files
- Pass lint checks (Hadolint) and security scans (Trivy)

**Helm Charts:**
- Use `_helpers.tpl` for reusable template definitions
- Parameterize all environment-specific values
- Include resource requests and limits for all containers
- Configure liveness and readiness probes
- Use Kubernetes Secrets for all sensitive configuration

**Kubernetes:**
- All deployments must include health checks
- Resource limits must be set for all containers
- Secrets must never appear in plain text in manifests checked into source
- Use labels and annotations consistently across resources

---

## Alignment & Backward Compatibility

- Phase II endpoints (`/api/tasks`, `/api/auth/*`) remain unchanged and fully functional
- Phase III AI chat endpoint (`/api/{user_id}/chat`) remains operational
- Existing database tables (User, Task, Conversation, Message) are not modified
- Memory patterns and deployments from previous phases remain intact
- Phase IV adds containerization and orchestration without altering application logic
