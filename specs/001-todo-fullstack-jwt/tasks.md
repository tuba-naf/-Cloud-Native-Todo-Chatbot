# Tasks: Todo Full-Stack Web Application with JWT Authentication

**Input**: Design documents from `/specs/001-todo-fullstack-jwt/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Not explicitly requested in specification - tests omitted per template guidelines.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/`, `frontend/` at repository root
- Backend: `backend/app/` for source, `backend/tests/` for tests
- Frontend: `frontend/app/` for pages, `frontend/components/` for components

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for both backend and frontend

- [x] T001 Create backend directory structure per plan.md in backend/
- [x] T002 Create frontend directory structure per plan.md in frontend/
- [x] T003 [P] Initialize Python project with requirements.txt in backend/requirements.txt
- [x] T004 [P] Initialize Next.js project with package.json in frontend/package.json
- [x] T005 [P] Create backend environment template in backend/.env.example
- [x] T006 [P] Create frontend environment template in frontend/.env.local.example
- [x] T007 [P] Configure Python linting with pyproject.toml in backend/pyproject.toml
- [x] T008 [P] Configure TypeScript and ESLint in frontend/tsconfig.json and frontend/.eslintrc.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [x] T009 Create environment configuration module in backend/app/config.py
- [x] T010 Create Neon PostgreSQL database connection in backend/app/database.py
- [x] T011 Create User SQLModel in backend/app/models/user.py
- [x] T012 Create Task SQLModel in backend/app/models/task.py
- [x] T013 [P] Create models __init__.py exporting all models in backend/app/models/__init__.py
- [x] T014 Initialize Alembic migrations framework in backend/alembic/
- [x] T015 Create initial migration for users and tasks tables in backend/alembic/versions/001_initial_schema.py
- [x] T016 Create password hashing utilities in backend/app/auth/password.py
- [x] T017 Create JWT token utilities in backend/app/auth/jwt.py
- [x] T018 [P] Create auth __init__.py exporting utilities in backend/app/auth/__init__.py
- [x] T019 Create Pydantic schemas for User in backend/app/schemas/user.py
- [x] T020 Create Pydantic schemas for Task in backend/app/schemas/task.py
- [x] T021 [P] Create schemas __init__.py exporting all schemas in backend/app/schemas/__init__.py
- [x] T022 Create dependency injection for current user in backend/app/api/deps.py
- [x] T023 Create FastAPI main application with CORS in backend/app/main.py

### Frontend Foundation

- [x] T024 Create TypeScript type definitions in frontend/types/index.ts
- [x] T025 Create API client with token injection in frontend/lib/api.ts
- [x] T026 Create Better Auth client configuration in frontend/lib/auth.ts
- [x] T027 Create utility functions in frontend/lib/utils.ts
- [x] T028 Create root layout with providers in frontend/app/layout.tsx
- [x] T029 Create landing page with redirect logic in frontend/app/page.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - User Registration (Priority: P1) 🎯 MVP

**Goal**: Allow new users to create accounts with email and password

**Independent Test**: Complete registration flow, verify new user exists in database, can proceed to login

### Backend Implementation for US1

- [x] T030 [US1] Implement POST /api/auth/register endpoint in backend/app/api/auth.py
- [x] T031 [US1] Add email validation and duplicate check in backend/app/api/auth.py
- [x] T032 [US1] Add password validation (min 8 chars) in backend/app/api/auth.py

### Frontend Implementation for US1

- [x] T033 [US1] Create RegisterForm component in frontend/components/auth/RegisterForm.tsx
- [x] T034 [US1] Create registration page in frontend/app/(auth)/register/page.tsx
- [x] T035 [US1] Add form validation (email format, password length) in frontend/components/auth/RegisterForm.tsx
- [x] T036 [US1] Add error display for duplicate email and validation errors in frontend/components/auth/RegisterForm.tsx
- [x] T037 [US1] Add success redirect to login page in frontend/components/auth/RegisterForm.tsx

**Checkpoint**: User Story 1 complete - new users can register accounts

---

## Phase 4: User Story 2 - User Login and Authentication (Priority: P1)

**Goal**: Allow registered users to log in and maintain authenticated sessions

**Independent Test**: Login with valid credentials, receive JWT, access protected routes, logout works

### Backend Implementation for US2

- [x] T038 [US2] Implement POST /api/auth/login endpoint in backend/app/api/auth.py
- [x] T039 [US2] Add credential validation and JWT generation in backend/app/api/auth.py
- [x] T040 [US2] Implement POST /api/auth/logout endpoint in backend/app/api/auth.py
- [x] T041 [US2] Register auth router in main application in backend/app/main.py

### Frontend Implementation for US2

- [x] T042 [US2] Create LoginForm component in frontend/components/auth/LoginForm.tsx
- [x] T043 [US2] Create login page in frontend/app/(auth)/login/page.tsx
- [x] T044 [US2] Add error display for invalid credentials in frontend/components/auth/LoginForm.tsx
- [x] T045 [US2] Create protected layout with auth check in frontend/app/(protected)/layout.tsx
- [x] T046 [US2] Add logout functionality to protected layout in frontend/app/(protected)/layout.tsx
- [x] T047 [US2] Implement token storage and injection in frontend/lib/auth.ts

**Checkpoint**: User Stories 1 & 2 complete - full authentication flow working

---

## Phase 5: User Story 3 - Create Tasks (Priority: P2)

**Goal**: Allow authenticated users to create new tasks

**Independent Test**: Create task via API, verify appears in database with correct owner_id

### Backend Implementation for US3

- [x] T048 [US3] Implement POST /api/tasks endpoint in backend/app/api/tasks.py
- [x] T049 [US3] Add title validation (non-empty, max 500 chars) in backend/app/api/tasks.py
- [x] T050 [US3] Auto-associate task with current user in backend/app/api/tasks.py

### Frontend Implementation for US3

- [x] T051 [US3] Create TaskForm component in frontend/components/tasks/TaskForm.tsx
- [x] T052 [US3] Add form validation for title in frontend/components/tasks/TaskForm.tsx
- [x] T053 [US3] Add task creation to dashboard page in frontend/app/(protected)/dashboard/page.tsx

**Checkpoint**: User Story 3 complete - users can create tasks

---

## Phase 6: User Story 4 - View and List Tasks (Priority: P2)

**Goal**: Allow authenticated users to view all their tasks

**Independent Test**: Fetch tasks via API, verify only current user's tasks returned, proper display

### Backend Implementation for US4

- [x] T054 [US4] Implement GET /api/tasks endpoint with owner filter in backend/app/api/tasks.py
- [x] T055 [US4] Implement GET /api/tasks/{id} endpoint with ownership check in backend/app/api/tasks.py
- [x] T056 [US4] Register tasks router in main application in backend/app/main.py

### Frontend Implementation for US4

- [x] T057 [US4] Create TaskItem component in frontend/components/tasks/TaskItem.tsx
- [x] T058 [US4] Create TaskList component in frontend/components/tasks/TaskList.tsx
- [x] T059 [US4] Create EmptyState component in frontend/components/tasks/EmptyState.tsx
- [x] T060 [US4] Implement task fetching in dashboard page in frontend/app/(protected)/dashboard/page.tsx
- [x] T061 [US4] Add visual distinction for complete vs incomplete tasks in frontend/components/tasks/TaskItem.tsx

**Checkpoint**: User Stories 3 & 4 complete - full task creation and viewing

---

## Phase 7: User Story 5 - Update and Complete Tasks (Priority: P3)

**Goal**: Allow users to update task titles and toggle completion status

**Independent Test**: Update task title via API, toggle completion, verify changes persist

### Backend Implementation for US5

- [x] T062 [US5] Implement PATCH /api/tasks/{id} endpoint in backend/app/api/tasks.py
- [x] T063 [US5] Add ownership validation for update in backend/app/api/tasks.py
- [x] T064 [US5] Handle partial updates (title and/or is_completed) in backend/app/api/tasks.py

### Frontend Implementation for US5

- [x] T065 [US5] Add inline edit capability to TaskItem in frontend/components/tasks/TaskItem.tsx
- [x] T066 [US5] Add completion toggle checkbox to TaskItem in frontend/components/tasks/TaskItem.tsx
- [x] T067 [US5] Implement optimistic updates for completion toggle in frontend/components/tasks/TaskList.tsx

**Checkpoint**: User Story 5 complete - tasks can be updated and completed

---

## Phase 8: User Story 6 - Delete Tasks (Priority: P3)

**Goal**: Allow users to delete tasks they no longer need

**Independent Test**: Delete task via API, verify removed from database, no longer appears in list

### Backend Implementation for US6

- [x] T068 [US6] Implement DELETE /api/tasks/{id} endpoint in backend/app/api/tasks.py
- [x] T069 [US6] Add ownership validation for delete in backend/app/api/tasks.py

### Frontend Implementation for US6

- [x] T070 [US6] Add delete button to TaskItem in frontend/components/tasks/TaskItem.tsx
- [x] T071 [US6] Implement delete confirmation in frontend/components/tasks/TaskItem.tsx
- [x] T072 [US6] Update task list after deletion in frontend/components/tasks/TaskList.tsx

**Checkpoint**: All 6 user stories complete - full CRUD functionality

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and production readiness

- [x] T073 [P] Add loading states to all async operations in frontend/components/
- [x] T074 [P] Add error boundaries and error display in frontend/app/
- [x] T075 [P] Implement proper HTTP status codes for all error cases in backend/app/api/
- [x] T076 [P] Add request logging middleware in backend/app/main.py
- [x] T077 Verify CORS configuration for production in backend/app/main.py
- [x] T078 Run database migration on Neon production instance
- [x] T079 Validate all acceptance scenarios from spec.md manually
- [x] T080 Run quickstart.md validation end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ──────────> Phase 2 (Foundational) ──────────┬──> Phase 3 (US1: Registration)
                                                              │
                                                              ├──> Phase 4 (US2: Login)
                                                              │         ↓
                                                              │    [requires US1 for testing]
                                                              │
                                                              ├──> Phase 5 (US3: Create Tasks)
                                                              │         ↓
                                                              │    [requires US2 for auth]
                                                              │
                                                              ├──> Phase 6 (US4: View Tasks)
                                                              │         ↓
                                                              │    [requires US3 for data]
                                                              │
                                                              ├──> Phase 7 (US5: Update Tasks)
                                                              │         ↓
                                                              │    [requires US4 for viewing]
                                                              │
                                                              └──> Phase 8 (US6: Delete Tasks)
                                                                        ↓
                                                                   [requires US4 for viewing]
                                                                        ↓
                                                              Phase 9 (Polish)
```

### User Story Dependencies

| Story | Priority | Depends On | Can Test Independently |
|-------|----------|------------|------------------------|
| US1 (Registration) | P1 | Foundational | ✅ Yes - register and verify in DB |
| US2 (Login) | P1 | Foundational, US1 | ✅ Yes - with registered user |
| US3 (Create Tasks) | P2 | Foundational, US2 | ✅ Yes - create and verify in DB |
| US4 (View Tasks) | P2 | Foundational, US2, US3 | ✅ Yes - view created tasks |
| US5 (Update Tasks) | P3 | Foundational, US2, US3 | ✅ Yes - update existing task |
| US6 (Delete Tasks) | P3 | Foundational, US2, US3 | ✅ Yes - delete existing task |

### Parallel Opportunities

**Phase 1 (Setup)**:
```bash
# Can run in parallel:
T003, T004  # Initialize backend and frontend projects
T005, T006  # Create environment templates
T007, T008  # Configure linting for both
```

**Phase 2 (Foundational)**:
```bash
# Can run in parallel after T009-T010:
T011, T012  # Create User and Task models
T016, T017  # Password and JWT utilities
T019, T020  # User and Task schemas
```

**Phase 3-8 (User Stories)**:
```bash
# Backend and frontend for same story can often run in parallel
# e.g., US3 backend (T048-T050) and US3 frontend (T051-T053)
# after API contract is defined
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Registration)
4. Complete Phase 4: User Story 2 (Login/Logout)
5. **STOP and VALIDATE**: Full auth flow working
6. Demo: Users can register, login, logout

### Incremental Delivery

1. **Foundation**: Setup + Foundational → Backend connects to Neon, models ready
2. **Auth MVP**: US1 + US2 → Full authentication working
3. **Task Creation**: US3 + US4 → Users can create and view tasks
4. **Full CRUD**: US5 + US6 → Complete task management
5. **Production**: Polish → Deployment ready

### Suggested MVP Scope

**Minimal Deliverable**: Phases 1-4 (Setup, Foundation, US1, US2)
- Users can register and login
- JWT authentication working
- Foundation for task features in place

**Full MVP**: Phases 1-6 (Add US3, US4)
- Users can create and view tasks
- Core functionality complete

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend and frontend for same story can often be parallelized
- Total: 80 tasks across 9 phases
