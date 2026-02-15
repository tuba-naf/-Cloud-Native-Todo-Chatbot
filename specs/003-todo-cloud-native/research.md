# Research: Todo Cloud-Native Deployment

**Feature**: `003-todo-cloud-native`
**Date**: 2026-02-15
**Status**: Complete

## R1: Backend Dockerfile — Multi-Stage Python/FastAPI

**Decision**: Multi-stage build with `python:3.12-slim` base, Gunicorn + Uvicorn workers.

**Rationale**: The backend uses FastAPI 0.115.0 with Python 3.12. A multi-stage
build separates dependency installation from the runtime image, reducing the
final image size. Gunicorn manages worker processes while Uvicorn handles async
ASGI requests. `python:3.12-slim` provides a minimal Debian base (~150MB)
without unnecessary tooling.

**Alternatives considered**:
- `python:3.12-alpine`: Smaller (~50MB) but musl libc causes issues with
  `psycopg[binary]` and some compiled dependencies. Would require building from
  source, increasing complexity and build time.
- Single-stage build: Larger image (~1GB) due to build tools remaining in the
  final layer. Rejected per constitution Principle X (minimized images).
- Poetry/PDM for dependency management: Backend uses `requirements.txt`, so
  pip is sufficient. No need to introduce a new tool.

**Key implementation details**:
- Stage 1 (builder): Install dependencies into a virtual environment
- Stage 2 (runtime): Copy venv and application code only
- Use `--no-cache-dir` with pip to reduce layer size
- Create non-root user `appuser` with UID 1001
- Gunicorn config: 2 workers (Minikube resource-constrained), 120s timeout
- CMD: `gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker`

---

## R2: Frontend Dockerfile — Multi-Stage Next.js

**Decision**: Three-stage build with `node:20-alpine` base, standalone output
mode.

**Rationale**: Next.js 15.1.0 supports `output: 'standalone'` in
`next.config.js`, which produces a minimal server bundle. Three stages
(deps → build → runtime) maximize layer caching and minimize the final image.
`node:20-alpine` is pinned and produces ~180MB images.

**Alternatives considered**:
- `node:20-slim` (Debian): Larger (~250MB) but more compatible. Alpine is
  sufficient since Next.js has no native binary dependencies requiring glibc.
- Static export with Nginx: Not viable because the frontend uses Server
  Components and dynamic routes that require the Node.js runtime.
- Two-stage build: Combining deps and build stages reduces cache efficiency
  when only source code changes (not dependencies).

**Key implementation details**:
- Stage 1 (deps): Install node_modules
- Stage 2 (build): Copy source, run `next build` with `NEXT_PUBLIC_*` build
  args
- Stage 3 (runtime): Copy `.next/standalone` and `.next/static` only
- Enable `output: 'standalone'` in `next.config.js` (single change needed)
- Create non-root user `nextjs` with UID 1001
- CMD: `node server.js` (standalone output includes its own server)

---

## R3: Helm Chart Architecture

**Decision**: Two separate Helm charts (`todo-backend`, `todo-frontend`) with
a shared Minikube values override.

**Rationale**: Separate charts allow independent deployment, upgrade, and
rollback of frontend and backend. Shared values are overridden per environment
via `charts/values/minikube.yaml`. This aligns with constitution Principle XI
(Orchestration-First Deployment).

**Alternatives considered**:
- Umbrella chart: A parent chart wrapping both sub-charts. Adds complexity
  without benefit for a 2-service application. Rejected for simplicity.
- Kustomize: Not Helm-based; rejected per constitution Principle XI requiring
  Helm as the sole deployment mechanism.
- Raw manifests: Rejected per constitution (no ad-hoc `kubectl apply`).

**Key implementation details**:
- Each chart: Chart.yaml, values.yaml, templates/ (deployment, service,
  ingress, _helpers.tpl)
- Backend additionally has secret.yaml template referencing K8s Secrets
- Frontend additionally has configmap.yaml for non-sensitive config
- `_helpers.tpl` provides labels, fullname, selector helpers
- `charts/values/minikube.yaml` overrides image repository/tag, ingress host

---

## R4: Kubernetes Secret Mapping

**Decision**: Map actual backend environment variable names to Kubernetes Secret
keys. The secret object is named `todo-secrets`.

**Rationale**: The backend code (`app/config.py`) reads specific environment
variable names. The Kubernetes Secret keys MUST match what the code expects.

**Critical finding**: The CLAUDE.md references `AUTH_SECRET` and `JWT_SECRET`,
but the actual backend code uses:
- `DATABASE_URL` — matches
- `BETTER_AUTH_SECRET` — the actual env var name (not `AUTH_SECRET`)
- `OPENAI_API_KEY` — matches
- `JWT_ALGORITHM` — non-sensitive (default `HS256`), can be in ConfigMap
- `JWT_EXPIRE_DAYS` — non-sensitive (default `7`), can be in ConfigMap
- `CORS_ORIGINS` — non-sensitive, must include Minikube frontend URL

There is **no separate `JWT_SECRET`** environment variable. JWT signing uses
`BETTER_AUTH_SECRET` as the signing key.

**Secret mapping**:

| K8s Secret Key | Backend Env Var | Sensitive |
|---------------|-----------------|-----------|
| `DATABASE_URL` | `DATABASE_URL` | Yes |
| `BETTER_AUTH_SECRET` | `BETTER_AUTH_SECRET` | Yes |
| `OPENAI_API_KEY` | `OPENAI_API_KEY` | Yes |

**ConfigMap mapping** (non-sensitive):

| ConfigMap Key | Backend Env Var | Default |
|--------------|-----------------|---------|
| `JWT_ALGORITHM` | `JWT_ALGORITHM` | `HS256` |
| `JWT_EXPIRE_DAYS` | `JWT_EXPIRE_DAYS` | `7` |
| `CORS_ORIGINS` | `CORS_ORIGINS` | (Minikube URL) |

---

## R5: Minikube Ingress Configuration

**Decision**: Use NGINX Ingress Controller (Minikube addon) with path-based
routing.

**Rationale**: Minikube includes a built-in NGINX Ingress Controller addon.
Path-based routing on a single host directs `/api/*` and `/health` to the
backend, and all other paths to the frontend. This avoids DNS configuration
complexity for local development.

**Alternatives considered**:
- Host-based routing (separate subdomains): Requires DNS or /etc/hosts
  configuration. More complex for local development.
- NodePort without ingress: Exposes services on random high ports. Less
  user-friendly.
- LoadBalancer: Not available in Minikube without `minikube tunnel`.

**Key implementation details**:
- Prerequisite: `minikube addons enable ingress`
- Single Ingress resource with path rules:
  - `/api/` → backend service (port 8000)
  - `/health` → backend service (port 8000)
  - `/` → frontend service (port 3000)
- Host: `todo.local` (added to /etc/hosts pointing to `minikube ip`)
- Ingress class: `nginx`

---

## R6: kubectl-ai and Kagent Setup

**Decision**: Install kubectl-ai via Go/binary release, Kagent via Helm chart
on Minikube.

**Rationale**: kubectl-ai extends kubectl with natural language queries.
Kagent deploys as an in-cluster agent for Kubernetes management. Both
enhance the developer experience for cluster operations.

**Alternatives considered**:
- k9s: Terminal UI for Kubernetes. Useful but not AI-driven; doesn't satisfy
  the spec requirement for AI DevOps tooling.
- Lens/OpenLens: GUI tool. Not CLI-based and not specified in requirements.

**Key implementation details**:
- kubectl-ai: `go install github.com/sozercan/kubectl-ai@latest` or binary
  download. Requires `OPENAI_API_KEY` (already available as a secret).
- Kagent: Install via Helm chart into the Minikube cluster. Requires its own
  API key configuration.
- Gordon: Docker Desktop plugin. Check availability via `docker gordon --help`.
  If unavailable, skip and apply manual optimizations.

---

## R7: Trivy and Hadolint Compliance

**Decision**: Run Hadolint as a standalone binary; run Trivy as a container
or binary.

**Rationale**: Both tools can be installed as standalone binaries or run via
Docker. They are used as pre-deployment quality gates per constitution
Principle X.

**Key implementation details**:
- Hadolint: `hadolint docker/backend/Dockerfile` and
  `hadolint docker/frontend/Dockerfile`
- Trivy: `trivy image todo-backend:latest` and
  `trivy image todo-frontend:latest`
- Scan results with zero critical/high findings = pass
- Can be automated in a Makefile or shell script

---

## R8: Next.js Standalone Output Configuration

**Decision**: Enable `output: 'standalone'` in `next.config.js`.

**Rationale**: This is the **only application code change** required for
Phase IV. The standalone output mode bundles the Next.js server into a
self-contained directory that can run with just `node server.js`, without
needing the full `node_modules`. This dramatically reduces the Docker image
size (from ~1GB to ~200MB).

**Impact assessment**: This change affects only the build output format, not
the runtime behavior. All Phase II pages and Phase III chat interface continue
to work identically. The change is additive (enables a feature flag) and does
not modify any existing code.

**Implementation**:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

module.exports = nextConfig;
```
