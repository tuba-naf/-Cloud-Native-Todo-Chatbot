# Feature Specification: Todo Cloud-Native Deployment

**Feature Branch**: `003-todo-cloud-native`
**Created**: 2026-02-15
**Status**: Draft
**Input**: User description: "Containerize the Todo application frontend and backend and deploy locally on Minikube using Docker, Helm, kubectl-ai, and Kagent, with optional Gordon. Ensure full backward compatibility with Phase II and Phase III endpoints."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Backend Containerization (Priority: P1)

As a developer, I want the FastAPI backend packaged as a Docker image so that the backend runs identically in any environment with all Phase II and Phase III endpoints fully functional inside the container.

**Why this priority**: The backend is the most complex component, serving Phase II task CRUD, Phase II authentication, and Phase III AI chat endpoints. Containerizing it first proves that the application logic, dependencies, and runtime configuration work correctly inside Docker. Everything else depends on a working backend image.

**Independent Test**: Can be fully tested by building the Docker image, running it locally with environment variables, and verifying that `GET /health` returns 200, `POST /api/auth/signup` and `POST /api/auth/signin` work, `GET /api/tasks` returns tasks for an authenticated user, and `POST /api/{user_id}/chat` processes a message.

**Acceptance Scenarios**:

1. **Given** the backend Dockerfile exists, **When** I run `docker build`, **Then** the image builds successfully without errors.
2. **Given** a built backend image, **When** I run it with required environment variables (`DATABASE_URL`, `AUTH_SECRET`, `JWT_SECRET`, `OPENAI_API_KEY`), **Then** the container starts and listens on port 8000.
3. **Given** the container is running, **When** I request `GET /health`, **Then** I receive a 200 OK response.
4. **Given** the container is running, **When** I exercise Phase II endpoints (`/api/tasks`, `/api/auth/*`), **Then** they behave identically to the non-containerized version.
5. **Given** the container is running, **When** I exercise the Phase III endpoint (`POST /api/{user_id}/chat`), **Then** it behaves identically to the non-containerized version.
6. **Given** the Dockerfile, **When** I inspect the final image layer, **Then** the process runs as a non-root user.
7. **Given** the Dockerfile, **When** I run Hadolint against it, **Then** it passes with zero errors.
8. **Given** the built image, **When** I run Trivy vulnerability scan, **Then** there are zero critical or high severity findings.

---

### User Story 2 - Frontend Containerization (Priority: P1)

As a developer, I want the Next.js frontend packaged as a Docker image so that the frontend runs identically in any environment with all Phase II dashboard pages and Phase III chat interface functional inside the container.

**Why this priority**: The frontend must be containerized alongside the backend to achieve a fully containerized deployment. It is equally essential for the Minikube deployment target.

**Independent Test**: Can be fully tested by building the Docker image, running it locally, and verifying that the application loads in a browser on port 3000 with the login page, dashboard, and chat interface accessible.

**Acceptance Scenarios**:

1. **Given** the frontend Dockerfile exists, **When** I run `docker build`, **Then** the image builds successfully without errors.
2. **Given** a built frontend image, **When** I run it, **Then** the container starts and serves the application on port 3000.
3. **Given** the container is running, **When** I access the application in a browser, **Then** I see the login page and can navigate to the dashboard and chat interface after authentication.
4. **Given** the Dockerfile, **When** I inspect the final image layer, **Then** the process runs as a non-root user.
5. **Given** the Dockerfile uses build-time arguments for `NEXT_PUBLIC_*` variables, **When** I build with different values, **Then** the frontend configuration reflects the provided values.
6. **Given** the Dockerfile, **When** I run Hadolint against it, **Then** it passes with zero errors.
7. **Given** the built image, **When** I run Trivy vulnerability scan, **Then** there are zero critical or high severity findings.

---

### User Story 3 - Helm-Based Minikube Deployment (Priority: P1)

As a developer, I want to deploy both the frontend and backend on Minikube using Helm charts so that the entire application runs in a local Kubernetes cluster with proper service discovery, ingress, and configuration management.

**Why this priority**: Helm deployment is the core deliverable of Phase IV. Without it, containerization alone does not achieve the cloud-native deployment objective. This story ties together the container images, Kubernetes configuration, and networking into a functioning local deployment.

**Independent Test**: Can be fully tested by running `helm install` for both charts on a running Minikube cluster and verifying all endpoints are accessible through the ingress, including `GET /health`, Phase II endpoints, and Phase III chat endpoint.

**Acceptance Scenarios**:

1. **Given** Minikube is running and Docker images are built, **When** I run `helm install` for the backend chart, **Then** the backend pod starts, passes health checks, and the service is reachable within the cluster.
2. **Given** Minikube is running and Docker images are built, **When** I run `helm install` for the frontend chart, **Then** the frontend pod starts and the service is reachable within the cluster.
3. **Given** both charts are installed, **When** I access the ingress URL, **Then** I can reach the frontend and backend through configured routes.
4. **Given** both charts are installed, **When** I inspect pod specifications, **Then** resource requests and limits are set for CPU and memory on both deployments.
5. **Given** the backend chart is installed, **When** I check pod probes, **Then** liveness and readiness probes are configured and passing.
6. **Given** the Helm values reference Kubernetes Secrets, **When** I inspect the deployed manifests, **Then** no secret values appear in plain text; all are sourced via `secretKeyRef`.

---

### User Story 4 - Kubernetes Secret Management (Priority: P2)

As a developer, I want all sensitive configuration (database credentials, API keys, auth secrets) injected into pods exclusively through Kubernetes Secrets so that no secrets are hardcoded in images, Helm values committed to source, or environment variable defaults.

**Why this priority**: Secure secret management is a non-negotiable requirement for any deployment. Without it, credentials could leak through Docker layers, source code, or Helm values. This story ensures the deployment is production-safe from a secrets perspective even in a local Minikube environment.

**Independent Test**: Can be fully tested by creating Kubernetes Secrets via `kubectl create secret generic`, deploying the Helm charts, and verifying the pods start correctly with environment variables sourced from secrets. Additionally, verify that no secret values appear in Dockerfiles, `.dockerignore` excludes `.env`, and Helm `values.yaml` files committed to source contain no secret values.

**Acceptance Scenarios**:

1. **Given** I create a Kubernetes Secret with `DATABASE_URL`, `OPENAI_API_KEY`, `AUTH_SECRET`, and `JWT_SECRET`, **When** I deploy the backend chart, **Then** the pod receives these values as environment variables sourced from the secret.
2. **Given** the Helm chart `values.yaml` committed to source, **When** I inspect it, **Then** it contains no secret values — only references to Kubernetes Secret names and keys.
3. **Given** the Docker images, **When** I inspect all layers, **Then** no secrets, tokens, or credentials are present in any layer.
4. **Given** the `.dockerignore` file, **When** I inspect it, **Then** `.env` files are excluded from the build context.
5. **Given** the source repository, **When** I search for secret values, **Then** no hardcoded credentials are found in any committed file.

---

### User Story 5 - Health Monitoring and Probes (Priority: P2)

As a developer, I want the backend to expose a `/health` endpoint and both deployments to have Kubernetes liveness and readiness probes so that Kubernetes can automatically detect and recover from unhealthy pods.

**Why this priority**: Health probes are essential for Kubernetes to manage pod lifecycle correctly. Without them, Kubernetes cannot detect crashes, hangs, or startup failures, leading to silent downtime. This story ensures operational reliability of the deployment.

**Independent Test**: Can be fully tested by deploying the Helm charts, then simulating an unhealthy state (e.g., stopping the backend process) and verifying Kubernetes restarts the pod. Also verify that during normal operation, probes pass consistently.

**Acceptance Scenarios**:

1. **Given** the backend is running in Kubernetes, **When** the readiness probe checks `GET /health`, **Then** it receives a 200 OK and the pod is marked Ready.
2. **Given** the backend is running in Kubernetes, **When** the liveness probe checks `GET /health`, **Then** it receives a 200 OK and the pod is not restarted.
3. **Given** the backend process becomes unresponsive, **When** the liveness probe fails, **Then** Kubernetes restarts the pod automatically.
4. **Given** the frontend is running in Kubernetes, **When** the readiness probe checks TCP port 3000, **Then** the port is open and the pod is marked Ready.
5. **Given** the `/health` endpoint, **When** I verify it does not require authentication, **Then** it returns 200 OK without a JWT token (health checks must be unauthenticated).

---

### User Story 6 - Image Security Scanning (Priority: P3)

As a developer, I want all Docker images scanned for vulnerabilities and all Dockerfiles linted so that the deployment meets security compliance standards before any image is deployed to the cluster.

**Why this priority**: Security scanning is a quality gate rather than a core functional requirement. It prevents deploying images with known vulnerabilities. While important, it does not block basic containerization or deployment functionality.

**Independent Test**: Can be fully tested by running Hadolint on each Dockerfile and Trivy on each built image, and verifying the reports show zero critical/high findings and zero lint errors respectively.

**Acceptance Scenarios**:

1. **Given** the backend Dockerfile, **When** I run Hadolint, **Then** it reports zero errors.
2. **Given** the frontend Dockerfile, **When** I run Hadolint, **Then** it reports zero errors.
3. **Given** the built backend image, **When** I run Trivy, **Then** it reports zero critical and zero high severity vulnerabilities.
4. **Given** the built frontend image, **When** I run Trivy, **Then** it reports zero critical and zero high severity vulnerabilities.
5. **Given** a failing scan result, **When** I review it, **Then** I can identify the specific package or layer causing the issue and remediate it.

---

### User Story 7 - AI DevOps Tooling (Priority: P3)

As a developer, I want kubectl-ai and Kagent functional for cluster management so that I can use AI-assisted commands to inspect, debug, and manage the Minikube deployment.

**Why this priority**: AI DevOps tools enhance the developer experience but are not required for the deployment itself. They provide convenience for cluster operations and debugging. Gordon is optional and used only if available.

**Independent Test**: Can be fully tested by installing kubectl-ai and Kagent, connecting them to the Minikube cluster, and running sample commands (e.g., "list all pods", "describe the backend deployment") and verifying correct output.

**Acceptance Scenarios**:

1. **Given** Minikube is running with deployed services, **When** I use kubectl-ai to query cluster state (e.g., "show me all pods"), **Then** it returns accurate information about the deployed pods.
2. **Given** Minikube is running, **When** I use Kagent to inspect a deployment, **Then** it provides useful diagnostic information.
3. **Given** Gordon is available, **When** I use it for Docker build optimization, **Then** it produces optimized images. **Given** Gordon is not available, **When** I build images, **Then** standard multi-stage build optimizations are applied as fallback.

---

### Edge Cases

- What happens when Minikube runs out of resources (CPU/memory)? Pods enter Pending state with resource-related events. Resource limits prevent individual pods from consuming all cluster resources.
- What happens when the Neon PostgreSQL database is unreachable from inside Minikube? The backend health check fails, readiness probe marks the pod as not ready, and Kubernetes stops routing traffic to it. The pod logs contain connection error details.
- What happens when a Docker build fails due to network issues? The build fails with a clear error message. Cached layers from previous successful builds are reused on retry.
- What happens when a Kubernetes Secret is missing? The pod fails to start with an event indicating the missing secret reference. Helm chart documentation lists all required secrets.
- What happens when the ingress controller is not enabled in Minikube? `helm install` succeeds but ingress resources have no effect. Documentation includes the `minikube addons enable ingress` prerequisite.
- What happens when Docker images are rebuilt but Helm releases are not upgraded? The running pods continue using the previous image version. Documentation describes the `helm upgrade` workflow for deploying new images.
- What happens when multiple developers deploy to the same Minikube cluster? Resource contention may occur. This is out of scope — Phase IV targets single-developer local deployment.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a multi-stage Dockerfile for the backend that produces a minimal image based on `python:3.12-slim` with Gunicorn and Uvicorn workers, running as a non-root user, exposing port 8000.
- **FR-002**: System MUST provide a multi-stage Dockerfile for the frontend that produces a minimal image based on `node:20-alpine` with build-time arguments for `NEXT_PUBLIC_*` variables, running as a non-root user, exposing port 3000.
- **FR-003**: System MUST provide `.dockerignore` files for both frontend and backend build contexts, excluding at minimum: `.env`, `.git`, `node_modules`, `__pycache__`, `.venv`, and `*.pyc`.
- **FR-004**: System MUST provide a Helm chart for the backend (`charts/todo-backend/`) with deployment, service, ingress, secret reference, and helper templates.
- **FR-005**: System MUST provide a Helm chart for the frontend (`charts/todo-frontend/`) with deployment, service, ingress, configmap, and helper templates.
- **FR-006**: System MUST provide a Minikube-specific values override file (`charts/values/minikube.yaml`) for environment-specific configuration.
- **FR-007**: Backend deployment MUST define resource requests (CPU 250m, Memory 256Mi) and limits (CPU 500m, Memory 512Mi).
- **FR-008**: Frontend deployment MUST define resource requests (CPU 150m, Memory 128Mi) and limits (CPU 300m, Memory 256Mi).
- **FR-009**: Backend deployment MUST include a liveness probe targeting `GET /health` (period 30s, timeout 5s) and a readiness probe targeting `GET /health` (period 10s, timeout 5s).
- **FR-010**: Frontend deployment MUST include a liveness probe on TCP port 3000 (period 30s) and a readiness probe on TCP port 3000 (period 10s).
- **FR-011**: The backend MUST expose a `GET /health` endpoint that returns 200 OK without requiring authentication. This endpoint MUST NOT modify any existing Phase II or Phase III endpoints.
- **FR-012**: All sensitive configuration (`DATABASE_URL`, `OPENAI_API_KEY`, `AUTH_SECRET`, `JWT_SECRET`) MUST be injected into backend pods exclusively via Kubernetes Secrets using `secretKeyRef`.
- **FR-013**: Helm `values.yaml` files committed to source MUST NOT contain any secret values.
- **FR-014**: All Dockerfiles MUST pass Hadolint linting with zero errors.
- **FR-015**: All built images MUST pass Trivy vulnerability scanning with zero critical or high severity findings.
- **FR-016**: Phase II endpoints (`/api/tasks`, `/api/auth/*`) MUST remain fully functional and unchanged after containerized deployment.
- **FR-017**: Phase III endpoint (`POST /api/{user_id}/chat`) MUST remain fully functional and unchanged after containerized deployment.
- **FR-018**: Existing database tables (User, Task, Conversation, Message) MUST NOT be modified in schema as part of Phase IV.
- **FR-019**: kubectl-ai and Kagent MUST be installed and functional for Minikube cluster management.
- **FR-020**: Gordon MUST be used for Docker build optimization if available; if unavailable, standard multi-stage build optimizations (layer caching, pinned base images) MUST be applied.
- **FR-021**: Both Helm charts MUST deploy successfully on Minikube with `helm install` without errors.
- **FR-022**: Ingress resources MUST be configured for local Minikube access to both frontend and backend services.
- **FR-023**: Replica count MUST be 1 for all deployments on Minikube.

### Key Entities

- **Docker Image (Backend)**: A container image packaging the FastAPI backend with all Python dependencies, Gunicorn/Uvicorn runtime, and application code. Exposes port 8000. Runs as non-root. Based on `python:3.12-slim`.
- **Docker Image (Frontend)**: A container image packaging the Next.js frontend with production build output. Exposes port 3000. Runs as non-root. Based on `node:20-alpine`. Accepts build-time `NEXT_PUBLIC_*` configuration.
- **Helm Chart (Backend)**: A Kubernetes deployment package for the backend service. Contains deployment, service, ingress, secret reference, and helper templates. Parameterized via `values.yaml`.
- **Helm Chart (Frontend)**: A Kubernetes deployment package for the frontend service. Contains deployment, service, ingress, configmap, and helper templates. Parameterized via `values.yaml`.
- **Kubernetes Secret**: A cluster object storing sensitive configuration (`DATABASE_URL`, `OPENAI_API_KEY`, `AUTH_SECRET`, `JWT_SECRET`). Created imperatively via `kubectl create secret generic`. Never committed to source.
- **Health Endpoint**: A new `GET /health` route on the backend returning 200 OK. Used by Kubernetes probes. Does not require authentication. Does not affect existing endpoints.

### Assumptions

- Minikube is installed and running on the developer's machine with sufficient resources (at minimum 2 CPU, 4GB memory allocated).
- Docker is installed and the Docker daemon is accessible for building images.
- The Minikube ingress addon is enabled (`minikube addons enable ingress`).
- The Neon PostgreSQL database is accessible from within the Minikube cluster (no VPN or firewall blocks outbound connections).
- Helm 3.x is installed on the developer's machine.
- kubectl-ai and Kagent are installable via their respective installation methods and compatible with the Minikube Kubernetes version.
- Gordon availability is not guaranteed and all functionality must work without it.
- The developer has the required secret values (`DATABASE_URL`, `OPENAI_API_KEY`, `AUTH_SECRET`, `JWT_SECRET`) available locally.
- Phase IV deployment targets a single developer working on one Minikube cluster; multi-developer or shared cluster scenarios are out of scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Both Docker images (frontend and backend) build successfully in under 5 minutes on a standard development machine.
- **SC-002**: Deployed application on Minikube handles all Phase II task operations (create, read, update, delete, complete) identically to the pre-containerized version.
- **SC-003**: Deployed application on Minikube handles Phase III AI chat interactions identically to the pre-containerized version.
- **SC-004**: Both pods pass liveness and readiness probes consistently for 10 minutes after deployment with zero restarts.
- **SC-005**: Zero secrets are exposed in Docker images, Helm values committed to source, or any file in the repository.
- **SC-006**: All Dockerfiles pass Hadolint linting with zero errors; all images pass Trivy scanning with zero critical/high findings.
- **SC-007**: Full deployment (both Helm charts) completes in under 3 minutes on a running Minikube cluster with pre-built images.
- **SC-008**: kubectl-ai and Kagent respond to basic cluster queries accurately when connected to the Minikube cluster.
- **SC-009**: A developer following the deployment documentation can go from zero (no images, no Helm releases) to a fully functional deployment in under 15 minutes.
