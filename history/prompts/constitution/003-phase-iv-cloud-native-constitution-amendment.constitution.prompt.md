---
id: 003
title: Phase IV Cloud-Native Constitution Amendment
stage: constitution
date: 2026-02-15
surface: agent
model: claude-opus-4-6
feature: 003-todo-cloud-native
branch: main
user: user
command: /sp.constitution
labels: ["constitution", "phase-iv", "cloud-native", "docker", "kubernetes", "helm", "minikube"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - CLAUDE.md
tests:
  - N/A
---

## Prompt

You are an expert AI architect specializing in Spec-Driven Development (SDD).

Create and formalize the Project Constitution for:

Phase IV – Todo Cloud-Native Deployment

Base this constitution strictly on the existing Phase II, Phase III, and Phase IV documentation and rules provided in CLAUDE.md.

The constitution must govern how all future Phase IV work is conducted.

Include and formalize the following sections:

1. Project Purpose & Scope
   - Containerize and deploy existing Phase II and Phase III systems on Minikube
   - Ensure backward compatibility
   - Prohibit refactoring of business logic

2. Development Philosophy
   - Mandatory Spec → Plan → Tasks → Implement workflow
   - No manual coding outside SDD
   - Smallest viable changes only
   - External verification via MCP/CLI

3. Authority & Governance
   - Constitution is the highest authority
   - Specs override plans; plans override tasks
   - CLAUDE.md alignment is mandatory

4. Execution Rules
   - All implementation via Claude Code
   - Mandatory PHR creation
   - ADR detection and consent workflow
   - Strict prompt recording

5. Technical Invariants
   - Phase II/III endpoints remain unchanged
   - Only new endpoint allowed: /health
   - No schema modification to existing tables
   - Stateless backend preserved
   - Secrets only via Kubernetes Secrets

6. Containerization Standards
   - Multi-stage Docker builds
   - Pinned base images
   - Non-root runtime
   - Trivy + Hadolint compliance
   - .dockerignore required

7. Kubernetes & Helm Standards
   - Helm-first deployment
   - Resource limits required
   - Liveness/readiness probes
   - Config via values.yaml
   - No secrets in manifests

8. Security & Compliance
   - No hardcoded secrets
   - JWT/Auth secrets via K8s
   - Audit secret usage
   - Image vulnerability scanning

9. Agent Responsibilities
   - Auth Agent: secret management
   - Frontend Agent: containerization
   - Backend Agent: runtime + AI tools
   - DB Agent: DB connectivity + probes

10. Memory & Knowledge Governance
    - Mandatory updates to MEMORY.md
    - Capture deployment patterns
    - Document failures and fixes

11. Quality Gates & Acceptance Criteria
    - Images build without errors
    - Helm deploys cleanly on Minikube
    - All endpoints functional
    - Health checks passing
    - Zero exposed secrets

12. Prohibited Practices
    - No production/cloud deployment
    - No logic refactors
    - No secret commits
    - No bypassing SDD

13. Enforcement & Review
    - Violation handling
    - Re-alignment procedures
    - Continuous validation

Formatting Requirements:
- Use clear headings
- Use enforceable language ("MUST", "MUST NOT", "REQUIRED")
- Be concise but complete
- Follow existing constitution style

Output:
A complete Phase IV Project Constitution suitable for
.specify/memory/constitution.md

## Response snapshot

Updated constitution from v1.1.0 to v1.2.0 (MINOR bump). Added 4 new Phase IV principles:
- **X. Containerization Integrity**: Multi-stage builds, pinned base images, non-root runtime, Hadolint/Trivy compliance, .dockerignore required
- **XI. Orchestration-First Deployment**: Helm-first deployment, resource limits, probes, values.yaml parameterization, _helpers.tpl, Minikube ingress
- **XII. Zero-Trust Secret Management**: K8s Secrets only, no secrets in code/images/Helm values, secretKeyRef references, audit trail
- **XIII. Local-Only Deployment Scope**: Minikube only, no cloud/prod, no Phase II/III refactoring, Gordon optional fallback

Added Phase IV Key Standards (Architecture, Containerization, K8s/Helm, Security), Agent Responsibilities table, Phase IV Constraints (Technology, Endpoint Isolation, Prohibited Practices), and Phase IV Success Criteria (Functional, Security, Quality, Enforcement). Updated Governance section with Phase IV compliance requirements and Memory & Knowledge Governance rules. All Phase II and Phase III content preserved unchanged. Three dependent templates verified compatible.

## Outcome

- ✅ Impact: Constitution amended with Phase IV principles (X–XIII), standards, constraints, agent responsibilities, success criteria, prohibited practices, and enforcement rules
- 🧪 Tests: N/A (documentation/governance change)
- 📁 Files: .specify/memory/constitution.md (updated v1.1.0 → v1.2.0)
- 🔁 Next prompts: /sp.specify for Phase IV feature spec, /sp.plan for Phase IV architecture plan
- 🧠 Reflection: Clean additive amendment following Phase III pattern; 13 user-requested sections consolidated into 4 core principles (X–XIII) plus supporting standards, constraints, and success criteria sections; all Phase II/III content untouched; enforceable language (MUST/MUST NOT) used throughout

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual validation PASS — no unresolved placeholders, version matches report (1.2.0), dates ISO format (2026-02-15), principles declarative and testable, all 13 requested sections covered
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
