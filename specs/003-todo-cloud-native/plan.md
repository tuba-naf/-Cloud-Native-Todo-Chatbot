# Implementation Plan: Todo Cloud-Native Deployment

**Branch**: `003-todo-cloud-native` | **Date**: 2026-02-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-todo-cloud-native/spec.md`

## Summary

Containerize the existing Phase II (FastAPI backend + Next.js frontend) and
Phase III (AI chat) application using multi-stage Docker builds and deploy
on Minikube via Helm charts. The backend image uses `python:3.12-slim` with
Gunicorn/Uvicorn workers; the frontend image uses `node:20-alpine` with
Next.js standalone output. Secrets are injected exclusively via Kubernetes
Secrets. NGINX Ingress routes `/api/*` and `/health` to the backend and all
other paths to the frontend. All Phase II/III endpoints remain unchanged.
The only application code change is enabling `output: 'standalone'` in
`next.config.js`.

## Technical Context

**Language/Version**: Python 3.12 (backend), TypeScript 5.7 / Node 20 (frontend)
**Primary Dependencies**: Docker, Helm 3.x, Minikube, kubectl, Trivy, Hadolint, kubectl-ai, Kagent
**Storage**: Neon Serverless PostgreSQL (external, unchanged)
**Testing**: Manual endpoint verification, Hadolint lint, Trivy scan, probe validation
**Target Platform**: Local Minikube (Kubernetes) on Linux/macOS/WSL2
**Project Type**: Web application (existing frontend + backend, adding infrastructure)
**Performance Goals**: Images build < 5 min, Helm deploy < 3 min, probes stable 10 min
**Constraints**: Minikube only (no cloud), 1 replica per service, resource limits enforced
**Scale/Scope**: Single-developer local deployment, 2 Docker images, 2 Helm charts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate | Status |
|---|-----------|------|--------|
| I | Security First | All endpoints require JWT; `/health` is exempt per FR-011 | PASS |
| II | Spec-Driven Development | Spec written and approved (spec.md) | PASS |
| III | Automation Over Manual Coding | All work via SDD workflow | PASS |
| IV | Reliability & Consistency | Probes ensure pod health; resource limits prevent resource starvation | PASS |
| V | Scalability by Design | Helm parameterization supports future scaling; replica count configurable | PASS |
| VI | Backward Compatibility | Phase II endpoints unchanged; no code modifications except `next.config.js` `output` setting | PASS |
| VII | Stateless Architecture | Backend remains stateless; no in-memory session state introduced | PASS |
| VIII | AI-First Design | Phase III AI flows unchanged; MCP tools operate identically in container | PASS |
| IX | Tool-Centric Orchestration | MCP SDK runs in-process within containerized backend | PASS |
| X | Containerization Integrity | Multi-stage builds, pinned base images, non-root, Hadolint, Trivy, .dockerignore | PASS |
| XI | Orchestration-First Deployment | Helm-only deployment; no raw `kubectl apply` | PASS |
| XII | Zero-Trust Secret Management | All secrets via K8s Secrets; no secrets in images/values/source | PASS |
| XIII | Local-Only Deployment Scope | Minikube only; no cloud services; no Phase II/III refactoring | PASS |

**Exception**: `/health` endpoint (FR-011) is exempt from JWT authentication
per Principle I. This is required for Kubernetes probes which cannot attach
JWT tokens. The health endpoint exposes no user data and only returns
`{"status": "healthy"}`. The existing implementation at `backend/app/main.py:62-64`
already satisfies this requirement.

**Secret name reconciliation**: CLAUDE.md references `AUTH_SECRET` and
`JWT_SECRET`, but the actual backend code (`backend/app/config.py`) uses
`BETTER_AUTH_SECRET` and has no `JWT_SECRET` env var. The Kubernetes Secret
keys MUST match the actual code. See research.md R4 for full mapping.

## Project Structure

### Documentation (this feature)

```text
specs/003-todo-cloud-native/
├── plan.md              # This file
├── research.md          # Phase 0: technology research
├── data-model.md        # Phase 1: infrastructure entity model
├── quickstart.md        # Phase 1: deployment guide
├── contracts/           # Phase 1: health endpoint contract
│   └── health.yaml      # OpenAPI for /health
└── tasks.md             # Phase 2: implementation tasks (/sp.tasks)
```

### Source Code (repository root)

```text
# Existing application code (Phase II/III — unchanged except next.config.js)
backend/
├── app/
│   ├── main.py              # FastAPI app (health endpoint at line 62-64)
│   ├── config.py            # Settings from env vars
│   ├── database.py          # SQLModel engine
│   ├── api/                 # auth.py, tasks.py, chat.py, deps.py
│   ├── models/              # user.py, task.py, conversation.py, message.py
│   ├── schemas/             # Pydantic models
│   ├── auth/                # jwt.py, password.py
│   ├── mcp/                 # server.py, tools.py
│   └── agents/              # chat_agent.py
├── alembic/                 # Database migrations
├── requirements.txt         # Python deps (14 packages)
└── pyproject.toml           # Python project config

frontend/
├── app/                     # Next.js App Router pages
│   ├── (auth)/              # Login, register pages
│   ├── (protected)/         # Dashboard, chat pages
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── lib/                     # API client, auth, chatkit, utils
├── types/                   # TypeScript types
├── next.config.js           # MODIFIED: add output: 'standalone'
└── package.json             # Node deps (Next.js 15.1.0)

# Phase IV additions (new files only)
docker/
├── backend/
│   └── Dockerfile           # Multi-stage FastAPI build
└── frontend/
    └── Dockerfile           # Multi-stage Next.js build

backend/.dockerignore        # Backend build context exclusions
frontend/.dockerignore       # Frontend build context exclusions

charts/
├── todo-backend/
│   ├── Chart.yaml           # Chart metadata (v0.1.0)
│   ├── values.yaml          # Default values (no secrets)
│   └── templates/
│       ├── _helpers.tpl     # Labels, fullname, selectors
│       ├── deployment.yaml  # Pod spec, probes, resources, secrets
│       ├── service.yaml     # ClusterIP service on port 8000
│       ├── ingress.yaml     # Path-based routing for /api/*, /health
│       └── secret.yaml      # secretKeyRef template (references K8s Secret)
├── todo-frontend/
│   ├── Chart.yaml           # Chart metadata (v0.1.0)
│   ├── values.yaml          # Default values (no secrets)
│   └── templates/
│       ├── _helpers.tpl     # Labels, fullname, selectors
│       ├── deployment.yaml  # Pod spec, probes, resources
│       ├── service.yaml     # ClusterIP service on port 3000
│       ├── ingress.yaml     # Path-based routing for /
│       └── configmap.yaml   # Non-sensitive frontend config
└── values/
    └── minikube.yaml        # Minikube-specific overrides
```

**Structure Decision**: Phase IV adds infrastructure files alongside the
existing web application structure. No existing source directories are
modified. Dockerfiles are placed under `docker/` per CLAUDE.md project
structure. `.dockerignore` files are placed in the respective `backend/`
and `frontend/` directories (the Docker build contexts). Helm charts are
under `charts/` per CLAUDE.md.

## Design Decisions

### D1: Build Context Placement

Docker build contexts are the existing `backend/` and `frontend/` directories
(not `docker/`). Dockerfiles are referenced via `-f docker/backend/Dockerfile`
flag. This avoids copying application code into a separate directory and keeps
the Dockerfile separate from application code.

Build commands:
```bash
docker build -f docker/backend/Dockerfile -t todo-backend:latest ./backend
docker build -f docker/frontend/Dockerfile -t todo-frontend:latest ./frontend
```

### D2: Ingress Routing Strategy

Single NGINX Ingress resource with path-based routing:
- `/api/(.*)` → backend-service:8000
- `/health` → backend-service:8000
- `/(.*)` → frontend-service:3000

Host: `todo.local` mapped to `$(minikube ip)` in `/etc/hosts`.

### D3: Image Loading into Minikube

Use `minikube image load` to transfer locally-built images into Minikube's
container runtime without a registry:
```bash
minikube image load todo-backend:latest
minikube image load todo-frontend:latest
```

Helm values set `imagePullPolicy: Never` to use the loaded images.

### D4: Frontend standalone Configuration

The only application code change: add `output: 'standalone'` to
`next.config.js`. This enables Next.js to produce a self-contained server
bundle that can run with `node server.js` without the full `node_modules`.
All existing functionality is preserved.

### D5: Secret-to-EnvVar Mapping

The Kubernetes Secret `todo-secrets` maps to actual backend env var names:

| K8s Secret Key | Pod Env Var | Source |
|---------------|-------------|--------|
| `DATABASE_URL` | `DATABASE_URL` | `config.py:8` |
| `BETTER_AUTH_SECRET` | `BETTER_AUTH_SECRET` | `config.py:9` |
| `OPENAI_API_KEY` | `OPENAI_API_KEY` | `config.py:16` |

Non-sensitive config via ConfigMap:

| ConfigMap Key | Pod Env Var | Value |
|--------------|-------------|-------|
| `JWT_ALGORITHM` | `JWT_ALGORITHM` | `HS256` |
| `JWT_EXPIRE_DAYS` | `JWT_EXPIRE_DAYS` | `7` |
| `CORS_ORIGINS` | `CORS_ORIGINS` | `http://todo.local` |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `/health` exempt from JWT (Principle I) | Kubernetes probes cannot attach JWT tokens | No alternative; all K8s health checks must be unauthenticated. Endpoint exposes no user data. |
| `next.config.js` modification (Principle XIII) | Standalone output required for minimal Docker image | Without `output: 'standalone'`, the image would be ~1GB instead of ~200MB and require full `node_modules`. This is a build configuration change, not a business logic modification. |
| Secret names differ from CLAUDE.md | Backend code uses `BETTER_AUTH_SECRET`, not `AUTH_SECRET`/`JWT_SECRET` | K8s Secret keys MUST match actual code env vars. Using CLAUDE.md names would cause runtime failures. |
