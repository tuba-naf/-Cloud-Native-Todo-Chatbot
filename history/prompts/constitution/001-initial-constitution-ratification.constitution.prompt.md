---
agent: agent
model: claude-opus-4-5-20251101
name: "Initial Constitution Ratification"
description: "Project constitution v1.0.0 establishing 5 core principles and governance for Todo Full-Stack Web Application."
tools: []
argument-hint: "Create or update constitution with principles, standards, constraints, and governance rules."
---

## Prompt

```text
# Spec-Kit Plus Constitution

## Project:
**Todo Full-Stack Web Application (AI-Driven Development)**

---

## Core Principles

- **Security First**
  All user data and API access must be protected through JWT authentication and strict authorization.

- **Spec-Driven Development**
  Every feature must originate from a written specification before implementation.

- **Automation Over Manual Coding**
  All development must follow the Agentic Dev Stack workflow using Claude Code and Spec-Kit Plus.

- **Reliability & Consistency**
  Backend, frontend, and database systems must behave consistently under load and failure conditions.

- **Scalability by Design**
  Architecture must support multiple concurrent users and future feature expansion.

---

## Key Standards

### Architecture

- Frontend: Next.js 16+ (App Router)
- Backend: FastAPI (Python)
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth with JWT

---

### Security

- All endpoints require valid JWT tokens
- Shared secret via `BETTER_AUTH_SECRET`
- Token expiry enabled (maximum 7 days)
- User ID must be validated against token claims
- No unauthenticated access allowed

---

### API Design

- RESTful standards must be followed
- Proper HTTP status codes
- Clear and consistent error messages
- Ownership enforcement on all operations

---

### Code Quality

- Modular project structure
- Type safety enforced
- Consistent naming conventions
- Linting and formatting required
- Code must be documented

---

### Development Workflow

Mandatory process:

1. Write Specification
2. Generate Implementation Plan
3. Break into Tasks
4. Implement via Claude Code
5. Review, Test, and Iterate

> No direct manual coding is permitted outside the agentic workflow.

---

## Constraints

### Technology

- Authentication: Better Auth + JWT
- Database: Neon PostgreSQL
- ORM: SQLModel
- Backend: FastAPI
- Frontend: Next.js (App Router)

---

### Security & Configuration

- All secrets stored in environment variables
- No hardcoded credentials
- Production secrets isolated from development

---

### Performance

- Average API response time < 300 ms
- Frontend initial load time < 2 seconds
- Database queries optimized

---

### Compatibility

- Latest stable versions only
- Cross-browser support:
  - Chrome
  - Firefox
  - Edge
  - Safari

---

## Success Criteria

### Functional

- All 5 basic-level features implemented
- All API endpoints operational
- Multi-user support verified
- Task ownership enforced

---

### Security

- 100% authenticated endpoints
- No cross-user data leakage
- JWT validation verified
- Security testing passed

---

### Workflow

- Complete spec → plan → task → implementation chain
- All iterations documented
- No manual code violations

---

### Quality

- All automated tests passing
- Zero critical bugs
- Clean deployment pipeline
- Production-ready build

---

### Review & Acceptance

- Meets Spec-Kit Plus requirements
- Passes technical evaluation
- Approved by project reviewers
- Ready for production deployment
```

## Response snapshot

Created project constitution v1.0.0 for Todo Full-Stack Web Application with:

**5 Core Principles:**
1. Security First - JWT authentication, strict authorization
2. Spec-Driven Development - No code without specification
3. Automation Over Manual Coding - Agentic Dev Stack workflow mandatory
4. Reliability & Consistency - Consistent behavior under load/failure
5. Scalability by Design - Multi-user and expansion support

**Key Standards:** Architecture (Next.js/FastAPI/SQLModel/Neon/Better Auth), Security, API Design, Code Quality, Development Workflow

**Constraints:** Technology stack, Security & Configuration, Performance budgets, Browser compatibility

**Success Criteria:** Functional, Security, Workflow, Quality, Review & Acceptance requirements

**Governance:** Amendment process with semantic versioning, compliance requirements

All templates validated for compatibility. No follow-up TODOs.

## Outcome

- Impact: Initial constitution ratified, establishes governance for entire project
- Tests: N/A - governance document
- Files: 1 file created (.specify/memory/constitution.md)
- Next prompts: /sp.specify to create first feature specification
- Reflection: Constitution provides clear, testable principles with MUST language for enforceability

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): Standard /sp.constitution with full user input
- Next experiment: N/A - standard constitution creation
