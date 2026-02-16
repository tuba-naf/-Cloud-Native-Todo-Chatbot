---
id: 0003
title: Execute Blocked Deployment Tasks
stage: green
date: 2026-02-16
surface: agent
model: claude-opus-4-6
feature: 003-todo-cloud-native
branch: main
user: tuba
command: /sp.tasks continue with blocked tasks
labels: ["deployment", "minikube", "helm", "kubectl", "e2e", "kagent", "kubectl-ai"]
links:
  spec: specs/003-todo-cloud-native/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - charts/todo-backend/templates/ingress.yaml
  - backend/requirements.txt
  - backend/app/database.py
  - specs/003-todo-cloud-native/tasks.md
tests:
  - "GET /health returns 200 (verified via port-forward)"
  - "POST /api/auth/register creates user (201)"
  - "POST /api/auth/login returns JWT token (200)"
  - "CRUD /api/tasks all operations pass (201, 200, 200, 204)"
  - "POST /api/{user_id}/chat returns AI response (200)"
  - "Frontend serves HTML (200)"
  - "10-minute pod stability: zero additional restarts"
  - "Secret injection verified via kubectl exec"
  - "Secret leak audit: clean"
---

## Prompt

continue with blocked tasks

## Response snapshot

Executed all 11 previously blocked tasks (T023-T033) for Phase IV cloud-native deployment:

1. **T023-T024**: Started Minikube (3072MB, docker driver), loaded Docker images, created K8s Secret `todo-secrets`, deployed both Helm charts via `helm upgrade`. Fixed ingress rewrite-target bug (`/api/(.*)` → `/(api/.*)`).

2. **T025-T026**: Verified all 6 env vars injected into backend pod (3 from Secret, 3 from values). Audited Docker layers, .dockerignore, values.yaml — zero secret leaks.

3. **T027-T028**: Health endpoint returns 200 without JWT. Both pods show Ready: True. 10-minute monitoring: zero additional restarts.

4. **T031-T032**: Installed kubectl-ai v0.0.13 (binary) and Kagent v0.7.14 (CLI + Helm minimal profile). Gordon not available — documented.

5. **T033**: Full E2E validation — all Phase II endpoints (register, login, CRUD tasks, logout), Phase III chat endpoint, and health endpoint pass via port-forward.

**Bug fixes during deployment:**
- Ingress path regex: `/(api/.*)` instead of `/api/(.*)` to preserve `/api/` prefix
- Pinned `bcrypt>=3.2.0,<4.1.0` for passlib compatibility
- Added `pool_pre_ping=True` to SQLAlchemy engine for Neon connection stability

## Outcome

- ✅ Impact: All 33 tasks complete. Full Minikube deployment operational with Phase II + III endpoints verified.
- 🧪 Tests: All E2E tests pass (health, auth, tasks CRUD, chat, frontend)
- 📁 Files: 4 files modified (ingress.yaml, requirements.txt, database.py, tasks.md)
- 🔁 Next prompts: Add `192.168.49.2 todo.local` to /etc/hosts for ingress access; consider updating backend Helm chart default tag to `v2`
- 🧠 Reflection: Minikube image caching with `latest` tag is unreliable — always use versioned tags for redeployments

## Evaluation notes (flywheel)

- Failure modes observed: Minikube image caching ignored new `latest` tag; Docker credential helper incompatible in WSL2; passlib/bcrypt version mismatch
- Graders run and results (PASS/FAIL): E2E validation PASS, secret audit PASS, probe stability PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Pin backend image tag in Helm values to avoid `latest` ambiguity
