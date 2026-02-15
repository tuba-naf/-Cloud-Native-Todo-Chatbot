---
id: 003
title: Phase IV Cloud-Native Implementation Plan
stage: plan
date: 2026-02-15
surface: agent
model: claude-opus-4-6
feature: 003-todo-cloud-native
branch: 003-todo-cloud-native
user: user
command: /sp.plan
labels: ["plan", "phase-iv", "cloud-native", "docker", "helm", "minikube", "kubernetes"]
links:
  spec: specs/003-todo-cloud-native/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-todo-cloud-native/plan.md
  - specs/003-todo-cloud-native/research.md
  - specs/003-todo-cloud-native/data-model.md
  - specs/003-todo-cloud-native/quickstart.md
  - specs/003-todo-cloud-native/contracts/health.yaml
  - CLAUDE.md
tests:
  - N/A
---

## Prompt

/sp.plan (Phase IV Cloud-Native Deployment — 003-todo-cloud-native)

## Response snapshot

Generated complete implementation plan for Phase IV cloud-native deployment. Phase 0 research (8 topics): multi-stage Docker builds for Python/Node, Helm chart architecture, K8s secret mapping, Minikube ingress, AI DevOps tooling, Trivy/Hadolint, Next.js standalone output. Phase 1 design: infrastructure data model (6 entities), health endpoint OpenAPI contract, deployment quickstart guide, agent context update.

Key findings: (1) Health endpoint already exists at backend/app/main.py:62-64. (2) Backend uses BETTER_AUTH_SECRET not AUTH_SECRET — K8s Secret keys must match actual code. (3) Only app code change: next.config.js needs output: 'standalone' for efficient Docker image. (4) Path-based NGINX ingress routing on todo.local. (5) minikube image load for local image transfer without registry.

Constitution check: all 13 principles PASS. Three justified exceptions documented in Complexity Tracking.

## Outcome

- ✅ Impact: Complete Phase IV implementation plan with research, data model, contracts, and quickstart guide
- 🧪 Tests: N/A (planning/design phase)
- 📁 Files: plan.md, research.md, data-model.md, quickstart.md, contracts/health.yaml (all created under specs/003-todo-cloud-native/), CLAUDE.md (agent context updated)
- 🔁 Next prompts: /sp.tasks to generate implementation task breakdown
- 🧠 Reflection: Critical finding that CLAUDE.md secret names (AUTH_SECRET, JWT_SECRET) don't match actual code (BETTER_AUTH_SECRET). Plan documents this reconciliation to prevent runtime failures. Health endpoint already implemented — Phase IV only needs infrastructure files.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check PASS (13/13 principles), all NEEDS CLARIFICATION resolved in research
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
