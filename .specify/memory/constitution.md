<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.0 → 1.2.0

Modified principles: None (all Phase II and Phase III principles unchanged)

Added sections:
  - Phase IV: Todo Cloud-Native Deployment (Project scope extension)
  - Principle X: Containerization Integrity (Phase IV-specific)
  - Principle XI: Orchestration-First Deployment (Phase IV-specific)
  - Principle XII: Zero-Trust Secret Management (Phase IV-specific)
  - Principle XIII: Local-Only Deployment Scope (Phase IV-specific)
  - Phase IV Key Standards (Containerization, Kubernetes & Helm, Security)
  - Phase IV Agent Responsibilities
  - Phase IV Constraints (Technology, Endpoint Isolation, Prohibited Practices)
  - Phase IV Success Criteria (Functional, Security, Quality, Enforcement)

Removed sections: None

Templates requiring updates:
  ✅ .specify/templates/plan-template.md - "Constitution Check" section present,
     compatible; Phase IV plans MUST check Principles I–XIII. Containerization
     and Helm phases fit within existing Phase structure.
  ✅ .specify/templates/spec-template.md - Requirements/Success Criteria aligned;
     Phase IV specs MUST reference backward compatibility, container standards,
     and secret management constraints.
  ✅ .specify/templates/tasks-template.md - Phase structure compatible; Phase IV
     tasks MUST include Dockerfile, Helm chart, secret injection, scanning, and
     deployment validation phases.

Follow-up TODOs: None
-->

# Todo Full-Stack Web Application Constitution

## Project

**Todo Full-Stack Web Application (AI-Driven Development)**

## Core Principles

### I. Security First

All user data and API access MUST be protected through JWT authentication and strict authorization.

- All endpoints MUST require valid JWT tokens
- User ID MUST be validated against token claims for every request
- No unauthenticated access is permitted
- Shared secret MUST be stored via `BETTER_AUTH_SECRET` environment variable
- Token expiry MUST be enabled with maximum 7-day validity

### II. Spec-Driven Development

Every feature MUST originate from a written specification before implementation.

- No code may be written without a corresponding spec document
- Specifications MUST be reviewed and approved before implementation begins
- Changes to implemented features MUST be reflected in updated specifications
- All iterations MUST be documented in the spec workflow chain

### III. Automation Over Manual Coding

All development MUST follow the Agentic Dev Stack workflow using Claude Code and Spec-Kit Plus.

- Mandatory process:
  1. Write Specification (`/sp.specify`)
  2. Generate Implementation Plan (`/sp.plan`)
  3. Break into Tasks (`/sp.tasks`)
  4. Implement via Claude Code (`/sp.implement`)
  5. Review, Test, and Iterate
- No direct manual coding is permitted outside the agentic workflow
- All changes MUST be traceable to a task in `tasks.md`

### IV. Reliability & Consistency

Backend, frontend, and database systems MUST behave consistently under load and failure conditions.

- API responses MUST use proper HTTP status codes
- Error messages MUST be clear and consistent
- All operations MUST enforce ownership validation
- Systems MUST gracefully handle edge cases and failure scenarios

### V. Scalability by Design

Architecture MUST support multiple concurrent users and future feature expansion.

- Database queries MUST be optimized for concurrent access
- API design MUST follow RESTful standards
- Components MUST be modular to allow independent scaling
- Performance budgets MUST be defined and monitored

---

## Phase III: Todo AI Chatbot

> The following principles (VI–IX) apply to Phase III functionality.
> They extend—and MUST NOT contradict—Principles I–V above.

### VI. Backward Compatibility

All Phase II functionality MUST be preserved without modification when
implementing Phase III features.

- Phase II endpoints (`/api/tasks`, `/api/auth/*`) MUST remain unchanged
- Phase II database tables (User, Task) MUST NOT be altered in schema
- Phase III MUST introduce only new, isolated endpoints and tables
- Existing Phase II tests MUST continue to pass after Phase III deployment
- Shared infrastructure (database connection, auth middleware) MAY be
  reused but MUST NOT change behavior for Phase II consumers

### VII. Stateless Architecture

Every Phase III request MUST be independent; no in-memory session state
is permitted.

- The `/api/{user_id}/chat` endpoint MUST reconstruct conversation
  context from the database on every request
- No request-scoped data MAY persist in server memory between calls
- Conversation history MUST be stored in the Conversation and Message
  database tables
- Backend instances MUST be horizontally scalable without session
  affinity
- Database transactions MUST ensure consistency for concurrent requests

### VIII. AI-First Design

All Phase III task management flows MUST be driven through the OpenAI
Agents SDK; no direct CRUD bypasses are permitted from the chat
interface.

- User intent MUST be interpreted by the OpenAI Agents SDK before any
  task operation occurs
- MCP tools MUST be the sole mechanism for task mutations from the chat
  endpoint
- AI responses MUST be natural language; raw database results MUST NOT
  be exposed to users
- Agent errors MUST be caught and translated to user-friendly messages
- Tool descriptions MUST be clear and unambiguous to enable accurate
  intent classification

### IX. Tool-Centric Orchestration

All MCP tools MUST be invoked exclusively via the Backend Agent; no
separate MCP Agent process is required.

- The MCP SDK MUST run in-process within the FastAPI backend
- Every MCP tool MUST validate `user_id` ownership before operating on
  task records
- Tool parameters MUST be validated via Pydantic models
- Tool results MUST be JSON-serializable
- Tool invocations (name, arguments, result) MUST be persisted in the
  Message table for auditability

---

## Phase IV: Todo Cloud-Native Deployment

> The following principles (X–XIII) apply to Phase IV functionality.
> They extend—and MUST NOT contradict—Principles I–IX above.
> Phase IV containerizes and deploys the existing application on
> Minikube without modifying Phase II or Phase III business logic.

### X. Containerization Integrity

All application components MUST be containerized using secure,
reproducible, and optimized Docker images.

- Docker images MUST use multi-stage builds to minimize final image
  size
- Base images MUST be pinned to specific versions; the `latest` tag
  MUST NOT be used for base images
- Final image stages MUST run as a non-root user
- Every Dockerfile MUST pass Hadolint linting without errors
- Every built image MUST pass Trivy vulnerability scanning with zero
  critical or high severity findings
- A `.dockerignore` file MUST be present in every build context to
  exclude unnecessary files (node_modules, .env, .git, __pycache__)
- Frontend image MUST expose port 3000; backend image MUST expose
  port 8000
- Build-time arguments MUST be used for `NEXT_PUBLIC_*` environment
  variables in the frontend image
- The backend image MUST use Gunicorn with Uvicorn workers as the
  application server

### XI. Orchestration-First Deployment

All deployments MUST be managed through Helm charts on Kubernetes
(Minikube); no ad-hoc `kubectl apply` of raw manifests is permitted
for application workloads.

- Helm charts MUST be the sole deployment mechanism for frontend and
  backend services
- Every deployment MUST define resource requests and limits for CPU
  and memory
- Every deployment MUST include liveness and readiness probes
- Backend liveness and readiness probes MUST target the `/health`
  endpoint
- All environment-specific configuration MUST be parameterized in
  `values.yaml` files
- Minikube-specific overrides MUST be isolated in
  `charts/values/minikube.yaml`
- Helm templates MUST use `_helpers.tpl` for reusable template
  definitions
- Labels and annotations MUST be applied consistently across all
  Kubernetes resources
- Ingress resources MUST be configured for local access via Minikube

### XII. Zero-Trust Secret Management

All sensitive configuration MUST be managed exclusively through
Kubernetes Secrets; no secrets are permitted in code, images,
Helm values committed to source, or environment variable defaults.

- All secrets (`DATABASE_URL`, `OPENAI_API_KEY`, `AUTH_SECRET`,
  `JWT_SECRET`) MUST be injected via Kubernetes Secrets
- Secret manifests MUST NOT be committed to version control
- Dockerfiles MUST NOT contain any hardcoded secrets, tokens, or
  credentials
- Helm `values.yaml` files committed to source MUST NOT contain
  secret values
- Secret references in Helm templates MUST use `secretKeyRef` to
  source values from Kubernetes Secret objects
- Secret usage MUST be auditable; all secret references MUST be
  documented in deployment documentation
- `.env` files MUST be listed in `.gitignore` and `.dockerignore`
- Phase IV secrets MUST NOT conflict with Phase II or Phase III
  environment variable names

### XIII. Local-Only Deployment Scope

Phase IV deployment MUST target local Minikube exclusively; no
production or cloud hosting is permitted.

- All deployment targets MUST be limited to local Minikube clusters
- No cloud provider services (AWS, GCP, Azure, etc.) MUST be
  configured or referenced in deployment artifacts
- The database remains the existing external Neon PostgreSQL instance
  accessed via `DATABASE_URL`
- Phase II/III application logic MUST NOT be refactored, modified,
  or optimized as part of Phase IV work
- AI DevOps tools (kubectl-ai, Kagent) MUST be used where functional;
  Gordon is OPTIONAL and MUST only be used if available
- If Gordon is unavailable, standard Docker optimizations (multi-stage
  builds, layer caching, pinned base images) MUST be applied as
  fallback

---

## Key Standards

### Architecture

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16+ (App Router) |
| Backend | FastAPI (Python) |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Authentication | Better Auth with JWT |

### Security

- All endpoints MUST require valid JWT tokens
- Shared secret MUST be stored via `BETTER_AUTH_SECRET`
- Token expiry MUST be enabled (maximum 7 days)
- User ID MUST be validated against token claims
- No unauthenticated access is permitted

### API Design

- RESTful standards MUST be followed
- Proper HTTP status codes MUST be used
- Error messages MUST be clear and consistent
- Ownership enforcement MUST be applied on all operations

### Code Quality

- Project structure MUST be modular
- Type safety MUST be enforced
- Naming conventions MUST be consistent
- Linting and formatting MUST be applied
- Code MUST be documented

### Development Workflow

1. Write Specification
2. Generate Implementation Plan
3. Break into Tasks
4. Implement via Claude Code
5. Review, Test, and Iterate

> No direct manual coding is permitted outside the agentic workflow.

---

### Phase III Key Standards

#### Architecture (Phase III)

| Layer | Technology |
|-------|------------|
| Frontend | OpenAI ChatKit |
| Backend | FastAPI (Python) — extended |
| AI Framework | OpenAI Agents SDK |
| MCP Server | Official MCP SDK (in-process) |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Authentication | Better Auth with JWT |

#### API Design (Phase III)

- Phase II endpoints MUST remain unchanged
- Phase III endpoint: `POST /api/{user_id}/chat` (stateless)
- `{user_id}` path parameter MUST be validated against JWT token claims
- Request body MUST include `message` (string) and optional
  `conversation_id` (UUID)
- Response body MUST include `response` (string) and
  `conversation_id` (UUID)

#### Database (Phase III)

- New tables: `Conversation`, `Message`
- Phase II tables (`User`, `Task`) MUST NOT be modified
- All tables MUST use UUIDs for primary keys
- All tables MUST include `created_at` and `updated_at` timestamps
- Foreign key constraints MUST be enforced
  (`Conversation.user_id → User.id`,
   `Message.conversation_id → Conversation.id`)
- MCP tools MAY read/write existing `Task` records but MUST NOT alter
  the Task schema

#### Security (Phase III)

- JWT validation MUST occur on every `/api/{user_id}/chat` request
- MCP tools MUST validate `user_id` ownership before every operation
- No hardcoded secrets; all credentials MUST use `.env` files
- Phase III environment variables (`OPENAI_API_KEY`,
  `NEXT_PUBLIC_OPENAI_DOMAIN_KEY`, `AUTH_SECRET`, `DATABASE_URL`)
  MUST NOT conflict with Phase II variables
- Internal agent/tool errors MUST NOT be exposed to users

#### Code Quality (Phase III)

- Pydantic validation MUST be applied on all request/response models
- Tool results MUST be JSON-serializable
- Conversation persistence MUST use database transactions
- Both user messages and assistant responses MUST be persisted
- Tool invocations MUST be logged in the Message table

---

### Phase IV Key Standards

#### Architecture (Phase IV)

| Layer | Technology |
|-------|------------|
| Container Runtime | Docker |
| Orchestration | Kubernetes (Minikube) |
| Package Management | Helm |
| AI DevOps | kubectl-ai, Kagent |
| Build Optimization | Gordon (optional) |
| Image Scanning | Trivy, Hadolint |

#### Containerization Standards (Phase IV)

**Frontend Dockerfile (Next.js):**

| Property | Requirement |
|----------|-------------|
| Base Image | `node:20-alpine` (pinned) |
| Build Strategy | Multi-stage (deps → build → runtime) |
| Exposed Port | 3000 |
| User | Non-root |
| Env Injection | Build-time args for `NEXT_PUBLIC_*` variables |

**Backend Dockerfile (FastAPI):**

| Property | Requirement |
|----------|-------------|
| Base Image | `python:3.12-slim` (pinned) |
| Build Strategy | Multi-stage (deps → runtime) |
| Server | Gunicorn + Uvicorn workers |
| Exposed Port | 8000 |
| User | Non-root |
| Health Check | `/health` endpoint |

**Mandatory Compliance:**

- All Dockerfiles MUST pass Hadolint with zero errors
- All images MUST pass Trivy scan with zero critical/high findings
- `.dockerignore` MUST be present in every build context
- No `latest` tags permitted for base images
- No secrets in any build layer

#### Kubernetes & Helm Standards (Phase IV)

**Helm Chart Structure:**

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
    └── minikube.yaml
```

**Resource Budgets:**

| Component | CPU Request | CPU Limit | Memory Request | Memory Limit |
|-----------|-------------|-----------|----------------|--------------|
| Backend | 250m | 500m | 256Mi | 512Mi |
| Frontend | 150m | 300m | 128Mi | 256Mi |

**Probe Configuration:**

- Backend liveness: `GET /health` (period 30s, timeout 5s)
- Backend readiness: `GET /health` (period 10s, timeout 5s)
- Frontend liveness: TCP port 3000 (period 30s)
- Frontend readiness: TCP port 3000 (period 10s)

**Deployment Rules:**

- Replica count MUST be 1 for Minikube
- All sensitive values MUST reference Kubernetes Secrets via
  `secretKeyRef`
- ConfigMaps MUST be used for non-sensitive configuration
- Ingress MUST be configured for local Minikube access

#### Security Standards (Phase IV)

**Required Kubernetes Secrets:**

| Secret Key | Purpose | Consumer |
|------------|---------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection | Backend |
| `OPENAI_API_KEY` | Phase III AI integration | Backend |
| `AUTH_SECRET` | Better Auth JWT validation | Backend |
| `JWT_SECRET` | JWT token signing | Backend |

**Enforcement:**

- Secrets MUST be created via `kubectl create secret generic`
- Secret manifests MUST NOT be committed to version control
- `.env` files MUST be in `.gitignore` and `.dockerignore`
- Image scanning MUST occur before any deployment
- No secret values in Helm `values.yaml` committed to source

---

### Phase IV Agent Responsibilities

| Agent | Skill | Responsibilities |
|-------|-------|------------------|
| **Auth Agent** | `auth-security` | Manage JWT/Auth secrets in Kubernetes; inject secrets into deployments; validate `AUTH_SECRET` and `JWT_SECRET`; audit secret usage |
| **Frontend Agent** | `frontend-nextjs` | Build and optimize frontend Docker image (multi-stage, env injection, port 3000); integrate with Helm chart; validate UI post-deployment; ensure Phase II/III backward compatibility |
| **Backend Agent** | `fastapi-backend` | Build and optimize backend Docker image (slim Python, Gunicorn/Uvicorn, non-root, port 8000); integrate with Helm chart; manage AI DevOps tooling (kubectl-ai, Kagent); validate Phase II/III endpoints; apply Gordon optimizations if available |
| **DB Agent** | `neon-db-manager` | Manage Kubernetes Secrets for `DATABASE_URL`; validate DB connectivity in Minikube; configure resource limits and probes; prepare Phase IV migrations if needed |

---

## Constraints

### Technology

- Authentication: Better Auth + JWT
- Database: Neon PostgreSQL
- ORM: SQLModel
- Backend: FastAPI
- Frontend: Next.js (App Router)

### Security & Configuration

- All secrets MUST be stored in environment variables
- No hardcoded credentials are permitted
- Production secrets MUST be isolated from development

### Performance

- Average API response time MUST be < 300 ms
- Frontend initial load time MUST be < 2 seconds
- Database queries MUST be optimized

### Compatibility

- Latest stable versions only
- Cross-browser support required:
  - Chrome
  - Firefox
  - Edge
  - Safari

### Phase III Constraints

#### Technology (Phase III)

- AI Framework: OpenAI Agents SDK
- MCP Server: Official MCP SDK (in-process, no separate agent)
- Chat Frontend: OpenAI ChatKit
- All Phase II technology constraints continue to apply

#### Endpoint Isolation

- Phase II endpoints (`/api/tasks`, `/api/auth/*`) MUST NOT be modified
- Phase III adds only `POST /api/{user_id}/chat`
- No shared in-memory state between Phase II and Phase III endpoints

#### Environment Isolation

- Phase III MUST use dedicated environment variables where applicable
- Phase III variables MUST NOT override or shadow Phase II variables
- ChatKit frontend deployed on Vercel; backend on Hugging Face

### Phase IV Constraints

#### Technology (Phase IV)

- Container Runtime: Docker
- Orchestration: Kubernetes (Minikube only)
- Package Management: Helm
- AI DevOps: kubectl-ai, Kagent (REQUIRED); Gordon (OPTIONAL)
- Image Scanning: Trivy (images), Hadolint (Dockerfiles)
- All Phase II and Phase III technology constraints continue to apply

#### Endpoint Isolation (Phase IV)

- Phase II endpoints (`/api/tasks`, `/api/auth/*`) MUST NOT be modified
- Phase III endpoint (`POST /api/{user_id}/chat`) MUST NOT be modified
- Phase IV adds only `GET /health` for Kubernetes probes
- All Phase II and Phase III endpoints MUST remain fully functional
  after containerized deployment
- Existing database tables (User, Task, Conversation, Message) MUST
  NOT be modified in schema

#### Prohibited Practices (Phase IV)

- Production or cloud deployment MUST NOT be attempted; Minikube only
- Phase II/III application logic MUST NOT be refactored or modified
- Secret values MUST NOT be committed to version control under any
  circumstance
- The SDD workflow (Spec → Plan → Tasks → Implement) MUST NOT be
  bypassed
- Raw `kubectl apply` of application manifests MUST NOT be used;
  Helm MUST be the deployment mechanism
- Manual Docker image optimization MUST NOT be performed if Gordon is
  available and functional
- PHR creation MUST NOT be skipped for any Phase IV work

---

## Success Criteria

### Functional

- All 5 basic-level features implemented
- All API endpoints operational
- Multi-user support verified
- Task ownership enforced

### Security

- 100% authenticated endpoints
- No cross-user data leakage
- JWT validation verified
- Security testing passed

### Workflow

- Complete spec → plan → task → implementation chain
- All iterations documented
- No manual code violations

### Quality

- All automated tests passing
- Zero critical bugs
- Clean deployment pipeline
- Production-ready build

### Review & Acceptance

- Meets Spec-Kit Plus requirements
- Passes technical evaluation
- Approved by project reviewers
- Ready for production deployment

### Phase III Success Criteria

#### Functional (Phase III)

- Users can manage tasks via natural language through ChatKit
- All 5 MCP tools operational (add_task, list_tasks, complete_task,
  delete_task, update_task)
- Conversation history persisted and retrievable across sessions
- Phase II functionality fully preserved and operational

#### Architecture (Phase III)

- Stateless chat endpoint handles concurrent users without session
  affinity
- MCP tools run in-process via Backend Agent (no separate MCP process)
- Conversation context reconstructed from database on every request

#### Security (Phase III)

- JWT validation on every chat request
- `user_id` ownership enforced on all MCP tool operations
- No internal agent/tool errors exposed to users
- Environment variables isolated from Phase II

#### Quality (Phase III)

- All Phase II tests continue to pass
- Phase III endpoints respond within performance budgets
- Conversation persistence verified with concurrent requests
- ChatKit frontend renders correctly across supported browsers

### Phase IV Success Criteria

#### Functional (Phase IV)

- Frontend Docker image builds without errors and runs on port 3000
- Backend Docker image builds without errors and runs on port 8000
- Helm charts deploy cleanly on Minikube without errors
- Phase II endpoints (`/api/tasks`, `/api/auth/*`) fully functional
  after containerized deployment
- Phase III endpoint (`POST /api/{user_id}/chat`) fully operational
  after containerized deployment
- `GET /health` returns 200 OK from within the Kubernetes cluster

#### Security (Phase IV)

- Zero secrets exposed in Docker images, Helm values, or source code
- All images pass Trivy vulnerability scan with zero critical/high
  findings
- All Dockerfiles pass Hadolint linting with zero errors
- All sensitive configuration injected exclusively via Kubernetes
  Secrets
- `.env` files excluded from Docker build context and version control

#### Quality (Phase IV)

- All Phase II and Phase III tests continue to pass
- Liveness and readiness probes passing for both frontend and backend
- Resource limits enforced on all pods
- Pods run as non-root users
- Frontend and backend services accessible via Minikube ingress
- kubectl-ai and Kagent functional for cluster management

#### Enforcement (Phase IV)

- Any violation of Principles X–XIII MUST be documented and justified
  in the Complexity Tracking section of plan.md
- Re-alignment with the constitution MUST occur before proceeding
  past a violation
- Continuous validation MUST be performed at each deployment
  checkpoint: image build, lint/scan, Helm install, endpoint
  verification, and secret audit

---

## Governance

This constitution supersedes all other development practices for this project.

**Amendment Process:**
1. Proposed changes MUST be documented with rationale
2. Changes MUST be reviewed for impact on existing artifacts
3. Version number MUST be incremented according to semantic versioning:
   - MAJOR: Backward-incompatible principle changes or removals
   - MINOR: New principles or sections added
   - PATCH: Clarifications or wording refinements
4. All dependent templates MUST be updated for consistency

**Compliance:**
- All PRs and code reviews MUST verify constitution compliance
- Violations MUST be documented and justified in the Complexity
  Tracking section of plan.md
- Runtime guidance is maintained in CLAUDE.md
- Phase III changes MUST additionally verify backward compatibility
  with Phase II (Principle VI)
- Phase IV changes MUST additionally verify:
  - Backward compatibility with Phase II and Phase III
    (Principles VI, XIII)
  - Containerization integrity (Principle X)
  - Orchestration-first deployment (Principle XI)
  - Zero-trust secret management (Principle XII)
  - Local-only deployment scope (Principle XIII)

**Memory & Knowledge Governance:**
- MEMORY.md MUST be updated after completing significant Phase IV
  tasks
- Docker patterns, Helm configuration, and Kubernetes secrets
  management MUST be captured
- Minikube setup issues and resolutions MUST be documented
- AI DevOps tooling patterns (kubectl-ai, Kagent, Gordon) MUST be
  recorded
- Deployment failures and their fixes MUST be persisted for future
  reference

**Version**: 1.2.0 | **Ratified**: 2026-02-06 | **Last Amended**: 2026-02-15
