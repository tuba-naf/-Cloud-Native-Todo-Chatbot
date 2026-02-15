# Data Model: Todo Cloud-Native Deployment

**Feature**: `003-todo-cloud-native`
**Date**: 2026-02-15

## Overview

Phase IV introduces no new database tables. The data model describes
infrastructure entities (Docker images, Helm charts, Kubernetes objects) and
their relationships. Existing Phase II/III database tables remain unchanged.

## Infrastructure Entities

### Docker Image: Backend

| Property | Value |
|----------|-------|
| Name | `todo-backend` |
| Base Image | `python:3.12-slim` (pinned) |
| Build Strategy | Multi-stage (builder → runtime) |
| Exposed Port | 8000 |
| Runtime User | `appuser` (UID 1001) |
| Server | Gunicorn + 2 Uvicorn workers |
| Entry Point | `gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 120` |
| Build Context | `./backend` |
| Dockerfile | `docker/backend/Dockerfile` |

**Environment variables consumed** (from K8s Secret + ConfigMap):
- `DATABASE_URL` (secret)
- `BETTER_AUTH_SECRET` (secret)
- `OPENAI_API_KEY` (secret)
- `JWT_ALGORITHM` (configmap, default: `HS256`)
- `JWT_EXPIRE_DAYS` (configmap, default: `7`)
- `CORS_ORIGINS` (configmap, default: `http://todo.local`)

### Docker Image: Frontend

| Property | Value |
|----------|-------|
| Name | `todo-frontend` |
| Base Image | `node:20-alpine` (pinned) |
| Build Strategy | Multi-stage (deps → build → runtime) |
| Exposed Port | 3000 |
| Runtime User | `nextjs` (UID 1001) |
| Server | `node server.js` (Next.js standalone) |
| Build Context | `./frontend` |
| Dockerfile | `docker/frontend/Dockerfile` |

**Build-time arguments**:
- `NEXT_PUBLIC_API_URL` (default: `http://todo.local`)

### Helm Chart: todo-backend

| Property | Value |
|----------|-------|
| Chart Name | `todo-backend` |
| Chart Version | `0.1.0` |
| App Version | `1.0.0` |
| Location | `charts/todo-backend/` |

**Templates**:

| Template | Purpose |
|----------|---------|
| `_helpers.tpl` | Common labels, fullname, selectors |
| `deployment.yaml` | Pod spec with probes, resources, env from secrets/configmap |
| `service.yaml` | ClusterIP service exposing port 8000 |
| `ingress.yaml` | NGINX path rules for `/api/*`, `/health` |
| `secret.yaml` | Template referencing external K8s Secret via `secretKeyRef` |

**Default values** (`values.yaml`):

```yaml
replicaCount: 1
image:
  repository: todo-backend
  tag: latest
  pullPolicy: Never
service:
  type: ClusterIP
  port: 8000
resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  periodSeconds: 30
  timeoutSeconds: 5
readinessProbe:
  httpGet:
    path: /health
    port: 8000
  periodSeconds: 10
  timeoutSeconds: 5
secretName: todo-secrets
```

### Helm Chart: todo-frontend

| Property | Value |
|----------|-------|
| Chart Name | `todo-frontend` |
| Chart Version | `0.1.0` |
| App Version | `1.0.0` |
| Location | `charts/todo-frontend/` |

**Templates**:

| Template | Purpose |
|----------|---------|
| `_helpers.tpl` | Common labels, fullname, selectors |
| `deployment.yaml` | Pod spec with probes, resources |
| `service.yaml` | ClusterIP service exposing port 3000 |
| `ingress.yaml` | NGINX path rules for `/` (default) |
| `configmap.yaml` | Non-sensitive frontend configuration |

**Default values** (`values.yaml`):

```yaml
replicaCount: 1
image:
  repository: todo-frontend
  tag: latest
  pullPolicy: Never
service:
  type: ClusterIP
  port: 3000
resources:
  requests:
    cpu: 150m
    memory: 128Mi
  limits:
    cpu: 300m
    memory: 256Mi
livenessProbe:
  tcpSocket:
    port: 3000
  periodSeconds: 30
readinessProbe:
  tcpSocket:
    port: 3000
  periodSeconds: 10
```

### Kubernetes Secret: todo-secrets

| Property | Value |
|----------|-------|
| Name | `todo-secrets` |
| Type | `Opaque` |
| Namespace | `default` |
| Created by | Developer via `kubectl create secret generic` |

**Keys**:

| Key | Maps to Env Var | Description |
|-----|-----------------|-------------|
| `DATABASE_URL` | `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | `BETTER_AUTH_SECRET` | Better Auth secret for JWT signing |
| `OPENAI_API_KEY` | `OPENAI_API_KEY` | OpenAI API key for Phase III AI chat |

### Kubernetes Ingress

| Property | Value |
|----------|-------|
| Name | Managed per-chart |
| Ingress Class | `nginx` |
| Host | `todo.local` |

**Routing rules**:

| Path | Service | Port |
|------|---------|------|
| `/api/(.*)` | todo-backend | 8000 |
| `/health` | todo-backend | 8000 |
| `/(.*)` | todo-frontend | 3000 |

## Entity Relationships

```
┌──────────────────┐     builds     ┌──────────────────┐
│ docker/backend/  │───────────────>│  todo-backend    │
│   Dockerfile     │                │  Docker Image    │
└──────────────────┘                └────────┬─────────┘
                                             │ deployed by
┌──────────────────┐     builds     ┌────────▼─────────┐
│ docker/frontend/ │───────────────>│  todo-frontend   │
│   Dockerfile     │                │  Docker Image    │
└──────────────────┘                └────────┬─────────┘
                                             │ deployed by
┌──────────────────┐                ┌────────▼─────────┐
│ charts/          │───────────────>│  Minikube K8s    │
│ todo-backend/    │   helm install │  Cluster         │
│ todo-frontend/   │                │                  │
└──────────────────┘                │  ┌─────────────┐ │
                                    │  │ todo-secrets │ │
┌──────────────────┐                │  │ (K8s Secret) │ │
│ Developer        │──kubectl──────>│  └──────┬──────┘ │
│ (secret values)  │  create secret │         │ refs   │
└──────────────────┘                │  ┌──────▼──────┐ │
                                    │  │ Backend Pod │ │
                                    │  │ Frontend Pod│ │
                                    │  └──────┬──────┘ │
                                    │         │        │
                                    └─────────┼────────┘
                                              │ connects to
                                    ┌─────────▼────────┐
                                    │  Neon PostgreSQL  │
                                    │  (external)       │
                                    └──────────────────┘
```

## Existing Database Tables (unchanged)

Phase IV does NOT modify any database tables. For reference:

- **users**: id (UUID PK), email, password_hash, created_at, updated_at
- **tasks**: id (UUID PK), title, is_completed, owner_id (FK→users),
  created_at, updated_at
- **conversations**: id (UUID PK), user_id (FK→users), title, created_at,
  updated_at
- **messages**: id (UUID PK), conversation_id (FK→conversations), role,
  content, tool_name, tool_args, tool_result, created_at
