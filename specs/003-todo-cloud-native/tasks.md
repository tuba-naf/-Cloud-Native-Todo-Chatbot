# Tasks: Todo Cloud-Native Deployment

**Input**: Design documents from `/specs/003-todo-cloud-native/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/health.yaml, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Tasks include manual verification steps per quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create Phase IV directory structure and verify prerequisite tools

- [ ] T001 Create directory structure: docker/backend/, docker/frontend/, charts/todo-backend/templates/, charts/todo-frontend/templates/, charts/values/
- [ ] T002 [P] Verify prerequisite tools installed: Docker 24+, Minikube 1.32+, Helm 3.x, kubectl 1.28+, Hadolint 2.12+, Trivy 0.50+

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create build context exclusions and the only application code change required by Phase IV

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Create backend/.dockerignore excluding .env, .git, __pycache__, .venv, *.pyc, alembic/versions, .pytest_cache, *.md
- [ ] T004 [P] Create frontend/.dockerignore excluding .env, .git, node_modules, .next, out, *.md, .pytest_cache
- [ ] T005 Add output: 'standalone' to frontend/next.config.js (only app code change in Phase IV per plan.md D4)

**Checkpoint**: Foundation ready - .dockerignore files prevent secrets and unnecessary files from entering images; Next.js standalone output enables minimal Docker image

---

## Phase 3: User Story 1 - Backend Containerization (Priority: P1) MVP

**Goal**: Package the FastAPI backend as a multi-stage Docker image based on python:3.12-slim with Gunicorn/Uvicorn workers, non-root user, exposing port 8000

**Independent Test**: Build the image with `docker build -f docker/backend/Dockerfile -t todo-backend:latest ./backend`, then run it with required env vars and verify `GET /health` returns 200 on port 8000

### Implementation for User Story 1

- [ ] T006 [US1] Create multi-stage backend Dockerfile in docker/backend/Dockerfile (python:3.12-slim base, builder stage installs requirements.txt, runtime stage copies app code, non-root appuser UID 1001, Gunicorn entrypoint with 2 Uvicorn workers on 0.0.0.0:8000, timeout 120)
- [ ] T007 [US1] Build backend Docker image with `docker build -f docker/backend/Dockerfile -t todo-backend:latest ./backend` and verify container starts on port 8000

**Checkpoint**: Backend image builds and runs successfully. All Phase II/III endpoints functional inside the container.

---

## Phase 4: User Story 2 - Frontend Containerization (Priority: P1)

**Goal**: Package the Next.js frontend as a multi-stage Docker image based on node:20-alpine with standalone output, non-root user, exposing port 3000

**Independent Test**: Build the image with `docker build -f docker/frontend/Dockerfile -t todo-frontend:latest ./frontend`, then run it and verify the application serves on port 3000

### Implementation for User Story 2

- [ ] T008 [US2] Create multi-stage frontend Dockerfile in docker/frontend/Dockerfile (node:20-alpine base, deps stage installs node_modules, build stage runs next build, runtime stage copies standalone output, non-root nextjs user UID 1001, NEXT_PUBLIC_API_URL build arg defaulting to http://todo.local, node server.js entrypoint on port 3000)
- [ ] T009 [US2] Build frontend Docker image with `docker build -f docker/frontend/Dockerfile -t todo-frontend:latest ./frontend` and verify container starts on port 3000

**Checkpoint**: Frontend image builds and runs successfully. Login page, dashboard, and chat interface accessible in browser.

---

## Phase 5: User Story 3 - Helm-Based Minikube Deployment (Priority: P1)

**Goal**: Deploy both containerized services on Minikube via Helm charts with proper service discovery, NGINX ingress routing on todo.local, resource limits, and health probes

**Independent Test**: Start Minikube, load images, run `helm install` for both charts, verify `kubectl get pods` shows Running status, and `curl http://todo.local/health` returns `{"status":"healthy"}`

### Implementation for User Story 3

#### Backend Helm Chart

- [ ] T010 [P] [US3] Create charts/todo-backend/Chart.yaml (name: todo-backend, version: 0.1.0, appVersion: 1.0.0) and charts/todo-backend/values.yaml (replicaCount: 1, image repo/tag/pullPolicy:Never, service port 8000, resources requests/limits per data-model.md, liveness/readiness probe config for /health, secretName: todo-secrets)
- [ ] T011 [US3] Create charts/todo-backend/templates/_helpers.tpl with common labels, fullname helper, chart label, and selector labels
- [ ] T012 [US3] Create charts/todo-backend/templates/deployment.yaml with pod spec referencing _helpers.tpl labels, container port 8000, liveness probe (httpGet /health, period 30s, timeout 5s), readiness probe (httpGet /health, period 10s, timeout 5s), resource requests/limits from values, env vars from secretKeyRef (DATABASE_URL, BETTER_AUTH_SECRET, OPENAI_API_KEY) and configmap (JWT_ALGORITHM, JWT_EXPIRE_DAYS, CORS_ORIGINS)
- [ ] T013 [P] [US3] Create charts/todo-backend/templates/service.yaml as ClusterIP service exposing port 8000 targeting container port 8000
- [ ] T014 [US3] Create charts/todo-backend/templates/ingress.yaml with NGINX ingress class, host todo.local, path rules for /api/(.*) and /health routing to backend service port 8000
- [ ] T015 [US3] Create charts/todo-backend/templates/secret.yaml referencing external K8s Secret todo-secrets via secretKeyRef for DATABASE_URL, BETTER_AUTH_SECRET, OPENAI_API_KEY

#### Frontend Helm Chart

- [ ] T016 [P] [US3] Create charts/todo-frontend/Chart.yaml (name: todo-frontend, version: 0.1.0, appVersion: 1.0.0) and charts/todo-frontend/values.yaml (replicaCount: 1, image repo/tag/pullPolicy:Never, service port 3000, resources requests/limits per data-model.md, liveness/readiness probe config for TCP 3000)
- [ ] T017 [US3] Create charts/todo-frontend/templates/_helpers.tpl with common labels, fullname helper, chart label, and selector labels
- [ ] T018 [US3] Create charts/todo-frontend/templates/deployment.yaml with pod spec referencing _helpers.tpl labels, container port 3000, liveness probe (tcpSocket 3000, period 30s), readiness probe (tcpSocket 3000, period 10s), resource requests/limits from values
- [ ] T019 [P] [US3] Create charts/todo-frontend/templates/service.yaml as ClusterIP service exposing port 3000 targeting container port 3000
- [ ] T020 [US3] Create charts/todo-frontend/templates/ingress.yaml with NGINX ingress class, host todo.local, path rule for /(.*) routing to frontend service port 3000
- [ ] T021 [P] [US3] Create charts/todo-frontend/templates/configmap.yaml with non-sensitive config (NEXT_PUBLIC_API_URL: http://todo.local)

#### Deployment

- [ ] T022 [US3] Create charts/values/minikube.yaml with Minikube-specific overrides for both charts (imagePullPolicy: Never, ingress host: todo.local, resource budgets)
- [ ] T023 [US3] Start Minikube (--cpus=2 --memory=4096), enable ingress addon, load images with `minikube image load`, and deploy both charts with `helm install -f charts/values/minikube.yaml`

**Checkpoint**: Both pods Running, services accessible, ingress routes /api/* to backend and / to frontend. `curl http://todo.local/health` returns `{"status":"healthy"}`.

---

## Phase 6: User Story 4 - Kubernetes Secret Management (Priority: P2)

**Goal**: Ensure all sensitive configuration is injected via Kubernetes Secrets exclusively, with zero secret leakage in images, Helm values, or source

**Independent Test**: Create K8s Secret with `kubectl create secret generic todo-secrets`, deploy charts, verify pods receive correct env vars via `kubectl exec <pod> -- env | grep DATABASE_URL`, and confirm no secrets in source/images

### Implementation for User Story 4

- [ ] T024 [US4] Create Kubernetes Secret todo-secrets via kubectl with keys DATABASE_URL, BETTER_AUTH_SECRET, OPENAI_API_KEY (matching actual backend env var names per plan.md D5, NOT the CLAUDE.md names AUTH_SECRET/JWT_SECRET) and verify pod env injection with `kubectl exec`
- [ ] T025 [US4] Audit for secret leaks: inspect Docker image layers with `docker history`, verify .dockerignore excludes .env files, verify Helm values.yaml contains no secret values, verify no hardcoded credentials in source

**Checkpoint**: All secrets injected via K8s Secrets. Zero secrets in images, Helm values, or source.

---

## Phase 7: User Story 5 - Health Monitoring and Probes (Priority: P2)

**Goal**: Verify the existing /health endpoint works with Kubernetes probes and pods remain stable under probe checks

**Independent Test**: Deploy charts, verify `kubectl describe pod -l app=todo-backend | grep -A 5 "Conditions"` shows Ready, and `kubectl get pods --watch` shows zero restarts over 10 minutes

**Note**: The /health endpoint already exists at backend/app/main.py:62-64. No code changes required. Probes are configured in deployment.yaml (T012, T018).

### Implementation for User Story 5

- [ ] T026 [US5] Verify backend /health endpoint returns 200 OK without JWT authentication via `curl http://todo.local/health` and confirm response is `{"status":"healthy"}`
- [ ] T027 [US5] Monitor pods for 10 minutes with `kubectl get pods --watch`, confirm zero restarts, verify liveness and readiness probes are passing via `kubectl describe pod -l app=todo-backend` and `kubectl describe pod -l app=todo-frontend`

**Checkpoint**: Both pods stable with zero restarts. Probes consistently passing. Health endpoint accessible without auth.

---

## Phase 8: User Story 6 - Image Security Scanning (Priority: P3)

**Goal**: All Dockerfiles pass Hadolint linting with zero errors and all images pass Trivy scanning with zero critical/high findings

**Independent Test**: Run `hadolint docker/backend/Dockerfile && hadolint docker/frontend/Dockerfile` (zero errors) and `trivy image --severity CRITICAL,HIGH todo-backend:latest && trivy image --severity CRITICAL,HIGH todo-frontend:latest` (zero critical/high findings)

### Implementation for User Story 6

- [ ] T028 [P] [US6] Run Hadolint on docker/backend/Dockerfile and docker/frontend/Dockerfile, fix any lint errors until both pass with zero errors
- [ ] T029 [US6] Run Trivy vulnerability scan on todo-backend:latest and todo-frontend:latest with `--severity CRITICAL,HIGH`, remediate any findings until both pass clean

**Checkpoint**: Both Dockerfiles lint-clean. Both images vulnerability-free at critical/high severity.

---

## Phase 9: User Story 7 - AI DevOps Tooling (Priority: P3)

**Goal**: kubectl-ai and Kagent installed and functional for AI-assisted Minikube cluster management

**Independent Test**: Run `kubectl ai "show me all pods"` and verify accurate output. Run Kagent cluster inspection and verify diagnostic information.

### Implementation for User Story 7

- [ ] T030 [US7] Install kubectl-ai and verify it responds to cluster queries (e.g., `kubectl ai "show me all pods and their status"`, `kubectl ai "describe the todo-backend deployment"`)
- [ ] T031 [P] [US7] Install Kagent via Helm and verify cluster inspection commands return useful diagnostic information

**Checkpoint**: AI DevOps tools functional for cluster management. Gordon noted as optional (use if available).

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and local DNS setup

- [ ] T032 Configure local DNS by adding `$(minikube ip) todo.local` to /etc/hosts
- [ ] T033 Run full quickstart.md end-to-end validation: verify all Phase II endpoints (/api/tasks, /api/auth/*), Phase III endpoint (/api/{user_id}/chat), and health endpoint through ingress on todo.local

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US1 Backend Container (Phase 3)**: Depends on Foundational (Phase 2)
- **US2 Frontend Container (Phase 4)**: Depends on Foundational (Phase 2) - can run in parallel with US1
- **US3 Helm Deployment (Phase 5)**: Depends on US1 and US2 (needs built images)
- **US4 Secret Management (Phase 6)**: Depends on US3 (needs deployed charts)
- **US5 Health Monitoring (Phase 7)**: Depends on US3 (needs deployed pods)
- **US6 Security Scanning (Phase 8)**: Depends on US1 and US2 (needs built images and Dockerfiles) - can run in parallel with US3
- **US7 AI DevOps (Phase 9)**: Depends on US3 (needs running Minikube cluster with deployments)
- **Polish (Phase 10)**: Depends on US3 (needs running deployment for validation)

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **US2 (P1)**: Can start after Foundational (Phase 2) - Can run in parallel with US1
- **US3 (P1)**: Depends on US1 AND US2 (needs both Docker images built)
- **US4 (P2)**: Depends on US3 (needs Helm deployment to verify secret injection)
- **US5 (P2)**: Depends on US3 (needs running pods to verify probes) - can run in parallel with US4
- **US6 (P3)**: Depends on US1 AND US2 (needs Dockerfiles and images) - can run in parallel with US3
- **US7 (P3)**: Depends on US3 (needs running Minikube cluster)

### Within Each User Story

- Chart metadata (Chart.yaml, values.yaml) before templates
- _helpers.tpl before deployment.yaml, service.yaml, ingress.yaml
- deployment.yaml before service.yaml (logical dependency)
- All templates before helm install
- Build image before deploy image

### Parallel Opportunities

- T003 + T004 (both .dockerignore files) can run in parallel
- US1 (T006-T007) + US2 (T008-T009) can run in parallel after Foundational
- T010 + T016 (both Chart.yaml/values.yaml) can run in parallel
- T013 + T019 (both service.yaml) can run in parallel
- T011 + T017 (both _helpers.tpl) can run in parallel
- T021 (configmap) can run in parallel with other frontend templates
- US6 (T028-T029) can run in parallel with US3 (once images are built)
- US4 (T024-T025) + US5 (T026-T027) can run in parallel after US3
- T030 + T031 (kubectl-ai + Kagent) can run in parallel

---

## Parallel Example: US1 + US2 (Backend + Frontend Containerization)

```bash
# Launch both Dockerfiles in parallel (different directories, no dependencies):
Task: "Create multi-stage backend Dockerfile in docker/backend/Dockerfile" (T006)
Task: "Create multi-stage frontend Dockerfile in docker/frontend/Dockerfile" (T008)

# Then build both images in parallel:
Task: "Build backend Docker image" (T007)
Task: "Build frontend Docker image" (T009)
```

## Parallel Example: Backend + Frontend Helm Charts

```bash
# Launch chart metadata in parallel (different directories):
Task: "Create charts/todo-backend/Chart.yaml and values.yaml" (T010)
Task: "Create charts/todo-frontend/Chart.yaml and values.yaml" (T016)

# Launch helpers in parallel:
Task: "Create charts/todo-backend/templates/_helpers.tpl" (T011)
Task: "Create charts/todo-frontend/templates/_helpers.tpl" (T017)
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1: Setup (directory structure)
2. Complete Phase 2: Foundational (.dockerignore, next.config.js)
3. Complete Phase 3: US1 Backend Containerization (build backend image)
4. Complete Phase 4: US2 Frontend Containerization (build frontend image)
5. Complete Phase 5: US3 Helm Deployment (deploy on Minikube)
6. **STOP and VALIDATE**: Verify all endpoints via ingress on todo.local
7. This delivers a fully functional local Kubernetes deployment

### Incremental Delivery

1. Setup + Foundational -> Build context ready
2. US1 + US2 (parallel) -> Both images built and verified
3. US3 -> Full Minikube deployment (MVP!)
4. US4 + US5 (parallel) -> Secrets audited + probes validated
5. US6 -> Security quality gate passed
6. US7 -> AI DevOps tools functional
7. Polish -> End-to-end validation complete

### Critical Path

```
Setup -> Foundational -> US1 + US2 (parallel) -> US3 -> US4/US5/US7 (parallel)
                                                    \-> US6 (parallel with US3)
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Health endpoint already exists (backend/app/main.py:62-64) - no code change needed
- Only app code change: frontend/next.config.js `output: 'standalone'` (T005)
- K8s Secret keys MUST use BETTER_AUTH_SECRET (not AUTH_SECRET) per plan.md D5
- K8s Secret does NOT need JWT_SECRET (not used in actual code per research.md R4)
- Use `minikube image load` with `imagePullPolicy: Never` (no registry needed)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
