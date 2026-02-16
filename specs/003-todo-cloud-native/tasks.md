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

- [x] T001 Create directory structure: `docker/backend/`, `docker/frontend/`, `charts/todo-backend/templates/`, `charts/todo-frontend/templates/`, `charts/values/`
- [x] T002 [P] Verify prerequisite tools installed: Docker 24+, Minikube 1.32+, Helm 3.x, kubectl 1.28+, Hadolint 2.12+, Trivy 0.50+

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create build context exclusions and the only application code change required by Phase IV

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Create `backend/.dockerignore` excluding `.env`, `.git`, `__pycache__`, `.venv`, `*.pyc`, `alembic/versions`, `.pytest_cache`, `*.md`
- [x] T004 [P] Create `frontend/.dockerignore` excluding `.env`, `.git`, `node_modules`, `.next`, `out`, `*.md`, `.pytest_cache`
- [x] T005 Add `output: 'standalone'` to `frontend/next.config.js` (only app code change in Phase IV per plan.md D4 and research.md R8)

**Checkpoint**: Foundation ready - `.dockerignore` files prevent secrets and unnecessary files from entering images; Next.js standalone output enables minimal Docker image

---

## Phase 3: User Story 1 - Backend Containerization (Priority: P1) MVP

**Goal**: Package the FastAPI backend as a multi-stage Docker image based on `python:3.12-slim` with Gunicorn/Uvicorn workers, non-root user, exposing port 8000

**Independent Test**: Build the image with `docker build -f docker/backend/Dockerfile -t todo-backend:latest ./backend`, then run it with required env vars and verify `GET /health` returns 200 on port 8000

### Implementation for User Story 1

- [x] T006 [US1] Create multi-stage backend Dockerfile in `docker/backend/Dockerfile` — Stage 1 (builder): `python:3.12-slim` base, copy `requirements.txt`, install deps with `pip --no-cache-dir` into venv. Stage 2 (runtime): `python:3.12-slim` base, copy venv and `app/` directory, create non-root user `appuser` (UID 1001), expose port 8000, CMD `gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 120`
- [x] T007 [US1] Build backend Docker image with `docker build -f docker/backend/Dockerfile -t todo-backend:latest ./backend` and verify container starts on port 8000 with `docker run --env-file .env -p 8000:8000 todo-backend:latest`

**Checkpoint**: Backend image builds and runs successfully. `GET /health` returns `{"status":"healthy"}` on port 8000.

---

## Phase 4: User Story 2 - Frontend Containerization (Priority: P1)

**Goal**: Package the Next.js frontend as a multi-stage Docker image based on `node:20-alpine` with standalone output, non-root user, exposing port 3000

**Independent Test**: Build the image with `docker build -f docker/frontend/Dockerfile -t todo-frontend:latest ./frontend`, then run it and verify the application serves on port 3000

### Implementation for User Story 2

- [x] T008 [US2] Create multi-stage frontend Dockerfile in `docker/frontend/Dockerfile` — Stage 1 (deps): `node:20-alpine` base, copy `package.json` and `package-lock.json`, run `npm ci`. Stage 2 (build): copy source, `ARG NEXT_PUBLIC_API_URL=http://todo.local`, run `next build`. Stage 3 (runtime): `node:20-alpine` base, create non-root user `nextjs` (UID 1001), copy `.next/standalone` and `.next/static`, expose port 3000, `ENV PORT 3000`, CMD `node server.js`
- [x] T009 [US2] Build frontend Docker image with `docker build -f docker/frontend/Dockerfile -t todo-frontend:latest ./frontend` and verify container starts on port 3000

**Checkpoint**: Frontend image builds and runs successfully. Application serves on port 3000.

---

## Phase 5: User Story 3 - Helm-Based Minikube Deployment (Priority: P1)

**Goal**: Deploy both containerized services on Minikube via Helm charts with proper service discovery, NGINX ingress routing on `todo.local`, resource limits, and health probes

**Independent Test**: Start Minikube, load images, run `helm install` for both charts, verify `kubectl get pods` shows Running status, and `curl http://todo.local/health` returns `{"status":"healthy"}`

### Backend Helm Chart

- [x] T010 [P] [US3] Create `charts/todo-backend/Chart.yaml` (name: `todo-backend`, version: `0.1.0`, appVersion: `1.0.0`) and `charts/todo-backend/values.yaml` (replicaCount: 1, image repo `todo-backend`/tag `latest`/pullPolicy `Never`, service type ClusterIP port 8000, resources requests CPU 250m Memory 256Mi / limits CPU 500m Memory 512Mi, liveness probe httpGet `/health` period 30s timeout 5s, readiness probe httpGet `/health` period 10s timeout 5s, secretName: `todo-secrets`, config: JWT_ALGORITHM `HS256`, JWT_EXPIRE_DAYS `7`, CORS_ORIGINS `http://todo.local`)
- [x] T011 [US3] Create `charts/todo-backend/templates/_helpers.tpl` with common labels (app, chart, release, heritage), fullname helper, chart label, and selector labels
- [x] T012 [US3] Create `charts/todo-backend/templates/deployment.yaml` with pod spec referencing `_helpers.tpl` labels, container port 8000, liveness probe (httpGet `/health`, period 30s, timeout 5s), readiness probe (httpGet `/health`, period 10s, timeout 5s), resource requests/limits from values, env vars from `secretKeyRef` referencing K8s Secret `todo-secrets` (keys: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `OPENAI_API_KEY`), env vars from `values.yaml` defaults (`JWT_ALGORITHM`, `JWT_EXPIRE_DAYS`, `CORS_ORIGINS`)
- [x] T013 [P] [US3] Create `charts/todo-backend/templates/service.yaml` as ClusterIP service exposing port 8000 targeting container port 8000
- [x] T014 [US3] Create `charts/todo-backend/templates/ingress.yaml` with NGINX ingress class, host `todo.local`, path rules for `/api/(.*)` and `/health` routing to backend service port 8000 using `nginx.ingress.kubernetes.io/rewrite-target` annotation
- [x] T015 [US3] Create `charts/todo-backend/templates/secret.yaml` — optional Helm-managed Secret template (disabled by default via `secret.create: false` in values.yaml) that can create `todo-secrets` K8s Secret from values passed at install time via `--set`; default workflow uses externally-created secret via `kubectl create secret generic`

### Frontend Helm Chart

- [x] T016 [P] [US3] Create `charts/todo-frontend/Chart.yaml` (name: `todo-frontend`, version: `0.1.0`, appVersion: `1.0.0`) and `charts/todo-frontend/values.yaml` (replicaCount: 1, image repo `todo-frontend`/tag `latest`/pullPolicy `Never`, service type ClusterIP port 3000, resources requests CPU 150m Memory 128Mi / limits CPU 300m Memory 256Mi, liveness probe tcpSocket 3000 period 30s, readiness probe tcpSocket 3000 period 10s)
- [x] T017 [US3] Create `charts/todo-frontend/templates/_helpers.tpl` with common labels (app, chart, release, heritage), fullname helper, chart label, and selector labels
- [x] T018 [US3] Create `charts/todo-frontend/templates/deployment.yaml` with pod spec referencing `_helpers.tpl` labels, container port 3000, liveness probe (tcpSocket 3000, period 30s), readiness probe (tcpSocket 3000, period 10s), resource requests/limits from values, env from configmap ref
- [x] T019 [P] [US3] Create `charts/todo-frontend/templates/service.yaml` as ClusterIP service exposing port 3000 targeting container port 3000
- [x] T020 [US3] Create `charts/todo-frontend/templates/ingress.yaml` with NGINX ingress class, host `todo.local`, path rule for `/(.*)` routing to frontend service port 3000 (lower priority than backend ingress paths)
- [x] T021 [P] [US3] Create `charts/todo-frontend/templates/configmap.yaml` with non-sensitive config (`NEXT_PUBLIC_API_URL: http://todo.local`)

### Deployment

- [x] T022 [US3] Create `charts/values/minikube.yaml` with Minikube-specific overrides for both charts (imagePullPolicy: `Never`, ingress host: `todo.local`, ingress enabled: `true`, resource budgets matching FR-007/FR-008)
- [ ] T023 [US3] Configure local DNS by adding `$(minikube ip) todo.local` to `/etc/hosts` (BLOCKED: requires running Minikube + kubectl)
- [ ] T024 [US3] Start Minikube (`--cpus=2 --memory=4096`), enable ingress addon (`minikube addons enable ingress`), load images with `minikube image load todo-backend:latest` and `minikube image load todo-frontend:latest`, create K8s Secret `todo-secrets` (keys: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `OPENAI_API_KEY`), deploy both charts with `helm install todo-backend charts/todo-backend -f charts/values/minikube.yaml` and `helm install todo-frontend charts/todo-frontend -f charts/values/minikube.yaml`, verify pods Running with `kubectl get pods`

**Checkpoint**: Both pods Running, services accessible, ingress routes `/api/*` and `/health` to backend and `/` to frontend. `curl http://todo.local/health` returns `{"status":"healthy"}`.

---

## Phase 6: User Story 4 - Kubernetes Secret Management (Priority: P2)

**Goal**: Ensure all sensitive configuration is injected via Kubernetes Secrets exclusively, with zero secret leakage in images, Helm values, or source

**Independent Test**: Verify pods receive correct env vars via `kubectl exec <pod> -- env | grep DATABASE_URL`, and confirm no secrets in source/images/Helm values

### Implementation for User Story 4

- [ ] T025 [US4] Verify secret injection by running `kubectl exec <backend-pod> -- env` and confirming `DATABASE_URL`, `BETTER_AUTH_SECRET`, `OPENAI_API_KEY` are set with correct values (matching actual backend env var names per plan.md D5 and research.md R4, NOT the CLAUDE.md names `AUTH_SECRET`/`JWT_SECRET`)
- [ ] T026 [US4] Audit for secret leaks: inspect Docker image layers with `docker history --no-trunc todo-backend:latest` and `docker history --no-trunc todo-frontend:latest`, verify `.dockerignore` excludes `.env` files, verify Helm `values.yaml` contains no secret values, verify no hardcoded credentials in source with `grep -r "DATABASE_URL\|BETTER_AUTH_SECRET\|OPENAI_API_KEY" charts/ --include="*.yaml" | grep -v secretKeyRef | grep -v configMapKeyRef`

**Checkpoint**: All secrets injected via K8s Secrets. Zero secrets in images, Helm values, or source.

---

## Phase 7: User Story 5 - Health Monitoring and Probes (Priority: P2)

**Goal**: Verify the existing `/health` endpoint works with Kubernetes probes and pods remain stable under probe checks

**Independent Test**: Verify `kubectl describe pod -l app=todo-backend | grep -A 5 "Conditions"` shows Ready, and `kubectl get pods --watch` shows zero restarts over 10 minutes

**Note**: The `/health` endpoint already exists at `backend/app/main.py:62-64`. No code changes required. Probes are configured in deployment.yaml (T012, T018).

### Implementation for User Story 5

- [ ] T027 [US5] Verify backend `/health` endpoint returns 200 OK without JWT authentication via `curl http://todo.local/health` and confirm response is `{"status":"healthy"}`; verify frontend TCP probe by confirming `kubectl describe pod -l app=todo-frontend` shows Ready condition
- [ ] T028 [US5] Monitor pods for 10 minutes with `kubectl get pods --watch`, confirm zero restarts for both backend and frontend pods, verify liveness and readiness probes are passing via `kubectl describe pod -l app=todo-backend` and `kubectl describe pod -l app=todo-frontend`

**Checkpoint**: Both pods stable with zero restarts. Probes consistently passing. Health endpoint accessible without auth.

---

## Phase 8: User Story 6 - Image Security Scanning (Priority: P3)

**Goal**: All Dockerfiles pass Hadolint linting with zero errors and all images pass Trivy scanning with zero critical/high findings

**Independent Test**: Run `hadolint docker/backend/Dockerfile && hadolint docker/frontend/Dockerfile` (zero errors) and `trivy image --severity CRITICAL,HIGH todo-backend:latest && trivy image --severity CRITICAL,HIGH todo-frontend:latest` (zero critical/high findings)

### Implementation for User Story 6

- [x] T029 [P] [US6] Run Hadolint on `docker/backend/Dockerfile` and `docker/frontend/Dockerfile`, fix any lint errors until both pass with zero errors
- [x] T030 [US6] Run Trivy vulnerability scan on `todo-backend:latest` and `todo-frontend:latest` with `trivy image --severity CRITICAL,HIGH --exit-code 1`, remediate any findings until both pass clean

**Checkpoint**: Both Dockerfiles lint-clean. Both images vulnerability-free at critical/high severity.

---

## Phase 9: User Story 7 - AI DevOps Tooling (Priority: P3)

**Goal**: kubectl-ai and Kagent installed and functional for AI-assisted Minikube cluster management

**Independent Test**: Run `kubectl ai "show me all pods"` and verify accurate output. Run Kagent cluster inspection and verify diagnostic information.

### Implementation for User Story 7

- [ ] T031 [US7] Install kubectl-ai (via `go install github.com/sozercan/kubectl-ai@latest` or binary download) and verify it responds to cluster queries (e.g., `kubectl ai "show me all pods and their status"`, `kubectl ai "describe the todo-backend deployment"`)
- [ ] T032 [P] [US7] Install Kagent via Helm into Minikube cluster and verify cluster inspection commands return useful diagnostic information; check Gordon availability via `docker gordon --help` — if available use for build optimization, if unavailable document manual optimizations applied

**Checkpoint**: AI DevOps tools functional for cluster management. Gordon noted as optional (use if available).

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final end-to-end validation across all phases

- [ ] T033 Run full quickstart.md end-to-end validation: verify all Phase II endpoints (`/api/tasks` CRUD, `/api/auth/signup`, `/api/auth/signin`), Phase III endpoint (`POST /api/{user_id}/chat`), and health endpoint (`GET /health`) through ingress on `todo.local`; confirm all acceptance scenarios from spec.md pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US1 Backend Container (Phase 3)**: Depends on Foundational (Phase 2)
- **US2 Frontend Container (Phase 4)**: Depends on Foundational (Phase 2) - can run in parallel with US1
- **US3 Helm Deployment (Phase 5)**: Depends on US1 and US2 (needs built images)
- **US4 Secret Management (Phase 6)**: Depends on US3 (needs deployed charts to verify injection)
- **US5 Health Monitoring (Phase 7)**: Depends on US3 (needs deployed pods to verify probes)
- **US6 Security Scanning (Phase 8)**: Depends on US1 and US2 (needs built images and Dockerfiles) - can run in parallel with US3
- **US7 AI DevOps (Phase 9)**: Depends on US3 (needs running Minikube cluster with deployments)
- **Polish (Phase 10)**: Depends on US3 at minimum (needs running deployment for validation)

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
- `_helpers.tpl` before deployment.yaml, service.yaml, ingress.yaml
- deployment.yaml before service.yaml (logical dependency)
- All templates before helm install
- Build image before deploy image

### Parallel Opportunities

- T003 + T004 (both `.dockerignore` files) can run in parallel
- US1 (T006-T007) + US2 (T008-T009) can run in parallel after Foundational
- T010 + T016 (both Chart.yaml/values.yaml) can run in parallel
- T011 + T017 (both `_helpers.tpl`) can run in parallel
- T013 + T019 (both service.yaml) can run in parallel
- T021 (configmap) can run in parallel with other frontend templates
- US6 (T029-T030) can run in parallel with US3 (once images are built)
- US4 (T025-T026) + US5 (T027-T028) can run in parallel after US3
- T031 + T032 (kubectl-ai + Kagent) can run in parallel

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

# Launch services in parallel:
Task: "Create charts/todo-backend/templates/service.yaml" (T013)
Task: "Create charts/todo-frontend/templates/service.yaml" (T019)
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1: Setup (directory structure)
2. Complete Phase 2: Foundational (`.dockerignore`, `next.config.js`)
3. Complete Phase 3: US1 Backend Containerization (build backend image)
4. Complete Phase 4: US2 Frontend Containerization (build frontend image)
5. Complete Phase 5: US3 Helm Deployment (deploy on Minikube)
6. **STOP and VALIDATE**: Verify all endpoints via ingress on `todo.local`
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
- Health endpoint already exists (`backend/app/main.py:62-64`) - no code change needed
- Only app code change: `frontend/next.config.js` `output: 'standalone'` (T005)
- K8s Secret keys MUST use `BETTER_AUTH_SECRET` (not `AUTH_SECRET`) per plan.md D5 and research.md R4
- K8s Secret does NOT need `JWT_SECRET` (not used in actual code per research.md R4)
- Non-sensitive backend config (`JWT_ALGORITHM`, `JWT_EXPIRE_DAYS`, `CORS_ORIGINS`) set via `values.yaml` defaults in deployment env, not via a separate ConfigMap
- Use `minikube image load` with `imagePullPolicy: Never` (no registry needed)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
