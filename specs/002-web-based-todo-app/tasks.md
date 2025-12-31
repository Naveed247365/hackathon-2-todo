---
description: "Task list for Web-Based Todo Application (Phase 2)"
---

# Tasks: Web-Based Todo Application

**Input**: Design documents from `/specs/002-web-based-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Manual acceptance testing only (no automated test framework per user requirements)

**Organization**: Tasks separated into Backend and Frontend sections, then grouped by user story.

## Format: `[ID] [P?] [BE/FE] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[BE]**: Backend task (phase-2/backend/)
- **[FE]**: Frontend task (phase-2/frontend/)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `phase-2/backend/` directory
- **Frontend**: `phase-2/frontend/` directory
- Backend and frontend tasks can be developed in parallel after foundational setup

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create Phase 2 directory structure and initialize backend/frontend projects

- [ ] T001 Create `phase-2/` directory at repository root
  - **Success**: Directory exists
  - **Verification**: `ls phase-2` shows directory
  - **Requirement**: Constitution Principle IX (folder organization)

- [ ] T002 Create `phase-2/backend/` directory
  - **Success**: Backend directory exists
  - **Verification**: `ls phase-2/backend` shows directory
  - **Requirement**: Plan structure decision

- [ ] T003 Create `phase-2/frontend/` directory
  - **Success**: Frontend directory exists
  - **Verification**: `ls phase-2/frontend` shows directory
  - **Requirement**: Plan structure decision

- [ ] T004 [BE] Create `phase-2/backend/requirements.txt` with dependencies
  - **Success**: File contains fastapi, uvicorn, sqlalchemy, passlib, python-jose, python-multipart, python-dotenv
  - **Verification**: `cat phase-2/backend/requirements.txt` shows all 7 dependencies
  - **Requirement**: Plan dependencies section

- [ ] T005 [BE] Create `phase-2/backend/.env.example` template
  - **Success**: File contains DATABASE_URL, JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_HOURS, CORS_ORIGINS
  - **Verification**: `cat phase-2/backend/.env.example` shows all 5 variables
  - **Requirement**: Plan environment variables section

- [ ] T006 [FE] Initialize Next.js project in `phase-2/frontend/`
  - **Success**: Run `npx create-next-app@latest frontend --typescript --no-tailwind --app-dir=false --import-alias="@/*"`
  - **Verification**: `ls phase-2/frontend/package.json` exists; `npm run dev` starts without errors
  - **Requirement**: Plan frontend framework decision

- [ ] T007 [FE] Create `phase-2/frontend/.env.local.example` template
  - **Success**: File contains NEXT_PUBLIC_API_URL=http://localhost:8000
  - **Verification**: `cat phase-2/frontend/.env.local.example` shows API URL
  - **Requirement**: Plan environment variables

**Checkpoint**: Phase 2 folder structure created; backend and frontend projects initialized

---

## Phase 2: Backend Foundational (Database & Auth Infrastructure)

**Purpose**: Core backend infrastructure that MUST be complete before any user story can be implemented

**⚠️ CRITICAL**: No user story work (backend or frontend) can begin until this phase is complete

- [ ] T008 [BE] Create `phase-2/backend/database.py` with database connection setup
  - **Success**: File contains engine, SessionLocal, Base, get_db dependency
  - **Verification**: Import in Python REPL, verify no errors
  - **Domain Rule**: Database as source of truth (Principle V)
  - **Requirement**: FR-021 (SQLite or PostgreSQL)

- [ ] T009 [BE] Create `phase-2/backend/models.py` with User model
  - **Success**: SQLAlchemy User model with id, email (unique), password_hash, created_at
  - **Verification**: Check model definition, verify email has unique=True constraint
  - **Domain Rule**: Email unique, password hashed (spec User Domain Rules)
  - **Requirement**: FR-022 (User table definition)

- [ ] T010 [BE] Create `phase-2/backend/models.py` with Todo model
  - **Success**: SQLAlchemy Todo model with id, user_id (ForeignKey), title, status (default="pending"), created_at
  - **Verification**: Check model definition, verify user_id has ForeignKey to User, status has default
  - **Domain Rule**: user_id required, status defaults to "pending" (Phase 1 rule maintained)
  - **Requirement**: FR-023 (Todo table definition), FR-025 (foreign key)

- [ ] T011 [BE] Add database table creation in `database.py`
  - **Success**: `Base.metadata.create_all(bind=engine)` creates users and todos tables
  - **Verification**: Run Python script to create tables, check SQLite file or query database for tables
  - **Requirement**: FR-024 (schema management)

- [ ] T012 [BE] Create `phase-2/backend/schemas.py` with Pydantic schemas for User
  - **Success**: UserCreate (email, password), UserResponse (id, email, created_at) schemas defined
  - **Verification**: Import in Python, instantiate with test data, verify validation works
  - **Requirement**: Request/response validation

- [ ] T013 [BE] Create `phase-2/backend/schemas.py` with Pydantic schemas for Todo
  - **Success**: TodoCreate (title), TodoUpdate (title), TodoResponse (id, user_id, title, status, created_at) schemas
  - **Verification**: Import and instantiate, verify validation
  - **Requirement**: Request/response validation

- [ ] T014 [BE] Create `phase-2/backend/auth.py` with password hashing functions
  - **Success**: `hash_password(password)` and `verify_password(plain, hashed)` using passlib bcrypt
  - **Verification**: Test: hash="password123", verify password_hash starts with $2b$, verify_password returns True
  - **Domain Rule**: Password hashed (never plain text)
  - **Requirement**: FR-003 (hash passwords)

- [ ] T015 [BE] Add JWT token creation function to `auth.py`
  - **Success**: `create_access_token(user_id, email)` returns JWT with sub, email, exp claims
  - **Verification**: Decode token, verify payload contains user_id and expiration
  - **Domain Rule**: JWT contains user_id, expires in 24 hours
  - **Requirement**: FR-006 (JWT token generation)

- [ ] T016 [BE] Add JWT token validation function to `auth.py`
  - **Success**: `verify_token(token)` decodes JWT, checks expiration, returns user_id or raises exception
  - **Verification**: Test with valid token (returns user_id), expired token (raises exception)
  - **Domain Rule**: JWT validation on protected endpoints
  - **Requirement**: FR-007 (validate JWT)

- [ ] T017 [BE] Create `get_current_user` dependency in `auth.py`
  - **Success**: FastAPI dependency that extracts JWT from Authorization header, validates, returns user_id
  - **Verification**: Test dependency with mock request, verify user_id extracted
  - **Domain Rule**: Extract user_id from JWT for data isolation
  - **Requirement**: FR-008 (extract user_id from JWT)

- [ ] T018 [BE] Create `phase-2/backend/main.py` with FastAPI app initialization
  - **Success**: FastAPI app instance, CORS middleware configured for http://localhost:3000
  - **Verification**: Run `uvicorn main:app --reload`, visit http://localhost:8000/docs, verify Swagger UI loads
  - **Requirement**: FR-027 (port 8000), FR-029 (CORS)

- [ ] T019 [BE] Create `phase-2/backend/routers/` directory
  - **Success**: Directory exists
  - **Verification**: `ls phase-2/backend/routers` shows directory
  - **Requirement**: Plan structure (separate route modules)

**Checkpoint**: Backend foundation ready - database models, auth utilities, FastAPI app running, CORS enabled

---

## Phase 3: User Story 1 (Backend) - Authentication Endpoints (Priority: P1)

**Goal**: Implement signup and login API endpoints

**Independent Test**: Use curl to signup and login, verify JWT tokens returned

### Backend Implementation for User Story 1

- [ ] T020 [BE] [US1] Create `phase-2/backend/routers/auth.py` with router initialization
  - **Success**: APIRouter with prefix="/api/auth" created
  - **Verification**: File exists, router defined
  - **Requirement**: API structure

- [ ] T021 [BE] [US1] Implement POST /api/auth/signup endpoint in `routers/auth.py`
  - **Success**: Accepts UserCreate schema, validates email/password, checks if email exists, hashes password, creates user, returns JWT
  - **Verification**: `curl -X POST http://localhost:8000/api/auth/signup -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password123"}'`, verify 201 response with token
  - **Domain Rules**: Email unique (return 409 if exists), password min 8 chars (return 400 if short), password hashed before storage
  - **Requirements**: FR-001 (signup endpoint), FR-002 (validation), FR-003 (hash password), FR-004 (prevent duplicates), FR-006 (return JWT)
  - **Acceptance**: Spec User Story 1, Scenarios 1, 3, 5

- [ ] T022 [BE] [US1] Implement POST /api/auth/login endpoint in `routers/auth.py`
  - **Success**: Accepts email/password, finds user by email, verifies password, returns JWT if valid
  - **Verification**: `curl -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password123"}'`, verify 200 response with token
  - **Domain Rules**: Return 401 if email not found or password invalid
  - **Requirements**: FR-005 (login endpoint), FR-006 (return JWT)
  - **Acceptance**: Spec User Story 1, Scenarios 2, 4

- [ ] T023 [BE] [US1] Include auth router in `main.py`
  - **Success**: `app.include_router(auth_router)` added to main.py
  - **Verification**: Visit http://localhost:8000/docs, verify /api/auth/signup and /api/auth/login appear
  - **Requirement**: API routing

**Checkpoint**: Backend US1 complete - signup and login endpoints working, JWT tokens generated

---

## Phase 4: User Story 1 (Frontend) - Signup and Login Pages (Priority: P1)

**Goal**: Implement signup and login UI pages

**Independent Test**: Visit signup page, create account, verify redirected to todos page with JWT in localStorage

### Frontend Implementation for User Story 1

- [ ] T024 [P] [FE] [US1] Create `phase-2/frontend/lib/api.ts` with API client utilities
  - **Success**: Functions for API calls with JWT header handling (getToken, setToken, removeToken, apiCall)
  - **Verification**: Import in test file, verify setToken stores to localStorage, getToken retrieves
  - **Requirements**: FR-009 (store JWT), FR-010 (include in header)

- [ ] T025 [P] [FE] [US1] Create `phase-2/frontend/pages/signup.tsx` with signup form
  - **Success**: Form with email and password inputs, submit button, calls POST /api/auth/signup, stores JWT, redirects to /todos
  - **Verification**: Visit http://localhost:3000/signup, fill form, submit, verify network request and redirect
  - **Requirements**: FR-030 (signup page)
  - **Acceptance**: Spec User Story 1, Scenario 1

- [ ] T026 [FE] [US1] Add email validation to signup form in `pages/signup.tsx`
  - **Success**: Frontend validates email format before submitting
  - **Verification**: Enter invalid email, verify error displayed before API call
  - **Domain Rule**: Email format validation
  - **Requirement**: FR-002 (validate email)

- [ ] T027 [FE] [US1] Add password length validation to signup form in `pages/signup.tsx`
  - **Success**: Frontend validates password min 8 chars before submitting
  - **Verification**: Enter password "123", verify error "Password must be at least 8 characters"
  - **Domain Rule**: Password min 8 chars
  - **Requirement**: FR-002 (validate password)
  - **Acceptance**: Spec User Story 1, Scenario 5

- [ ] T028 [FE] [US1] Add error handling to signup form in `pages/signup.tsx`
  - **Success**: Display API error messages (409 for duplicate email, 400 for validation errors)
  - **Verification**: Signup with existing email, verify "Email already registered" displayed
  - **Requirement**: FR-032 (user-friendly errors)
  - **Acceptance**: Spec User Story 1, Scenario 3

- [ ] T029 [P] [FE] [US1] Create `phase-2/frontend/pages/login.tsx` with login form
  - **Success**: Form with email and password inputs, calls POST /api/auth/login, stores JWT, redirects to /todos
  - **Verification**: Visit http://localhost:3000/login, enter credentials, verify JWT in localStorage and redirect
  - **Requirements**: FR-030 (login page)
  - **Acceptance**: Spec User Story 1, Scenario 2

- [ ] T030 [FE] [US1] Add error handling to login form in `pages/login.tsx`
  - **Success**: Display "Invalid credentials" for 401 response
  - **Verification**: Login with wrong password, verify error message
  - **Requirement**: FR-032 (user-friendly errors)
  - **Acceptance**: Spec User Story 1, Scenario 4

- [ ] T031 [P] [FE] [US1] Create `phase-2/frontend/pages/index.tsx` with auth redirect logic
  - **Success**: Check for JWT token, redirect to /todos if authenticated, else /login
  - **Verification**: Visit http://localhost:3000/, verify redirect based on auth state
  - **Requirement**: Landing page logic

**Checkpoint**: User Story 1 complete - Users can signup and login via web UI, JWT tokens stored, authentication working end-to-end

**Manual Acceptance Test for US1**:
1. Start backend: `cd phase-2/backend && uvicorn main:app --reload`
2. Start frontend: `cd phase-2/frontend && npm run dev`
3. Visit http://localhost:3000/signup
4. Enter email "user1@test.com", password "password123" → Verify redirected to /todos with JWT in localStorage
5. Open new incognito window, visit http://localhost:3000/login
6. Enter email "user1@test.com", password "password123" → Verify redirected to /todos
7. Enter wrong password → Verify "Invalid credentials" error
8. Signup with "user1@test.com" again → Verify "Email already registered" error

---

## Phase 5: User Story 2 (Backend) - Todo CRUD Endpoints (Priority: P2)

**Goal**: Implement backend API endpoints for todo CRUD operations with data isolation

**Independent Test**: Use curl with JWT to create, list todos; verify user_id filtering

### Backend Implementation for User Story 2

- [ ] T032 [BE] [US2] Create `phase-2/backend/routers/todos.py` with router initialization
  - **Success**: APIRouter with prefix="/api/todos", dependencies for auth
  - **Verification**: File exists, router defined
  - **Requirement**: API structure

- [ ] T033 [BE] [US2] Implement POST /api/todos endpoint in `routers/todos.py`
  - **Success**: Accepts TodoCreate, extracts user_id from JWT, validates title, creates todo with user_id, returns TodoResponse
  - **Verification**: `curl -X POST http://localhost:8000/api/todos -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" -d '{"title":"Test todo"}'`, verify 201 with user_id association
  - **Domain Rules**: Title non-empty, max 500 chars; status defaults to "pending"; user_id from JWT (never client)
  - **Requirements**: FR-011 (create endpoint), FR-012 (associate user_id), FR-019 (validate title)
  - **Acceptance**: Spec User Story 2, Scenario 1

- [ ] T034 [BE] [US2] Implement GET /api/todos endpoint in `routers/todos.py`
  - **Success**: Extracts user_id from JWT, queries todos filtered by `user_id == current_user`, returns list
  - **Verification**: `curl -X GET http://localhost:8000/api/todos -H "Authorization: Bearer <JWT>"`, verify only current user's todos returned
  - **Domain Rule**: Data isolation - only return todos for authenticated user
  - **Requirements**: FR-013 (list endpoint), FR-014 (data isolation)
  - **Acceptance**: Spec User Story 2, Scenarios 2, 3

- [ ] T035 [BE] [US2] Add 401 handling for missing JWT in todos endpoints
  - **Success**: Return 401 if Authorization header missing or token invalid
  - **Verification**: `curl -X GET http://localhost:8000/api/todos` (no header), verify 401 response
  - **Domain Rule**: Protected endpoints require authentication
  - **Requirement**: FR-007 (validate JWT on protected endpoints)
  - **Acceptance**: Spec User Story 2, Scenario 5

- [ ] T036 [BE] [US2] Include todos router in `main.py`
  - **Success**: `app.include_router(todos_router)` added
  - **Verification**: Visit http://localhost:8000/docs, verify /api/todos endpoints appear
  - **Requirement**: API routing

**Checkpoint**: Backend US2 complete - Create and list todos endpoints working with JWT auth and data isolation

---

## Phase 6: User Story 2 (Frontend) - Todo List and Creation (Priority: P2)

**Goal**: Implement frontend pages for creating and listing todos

**Independent Test**: Login, create 3 todos, verify they appear in list and persist after refresh

### Frontend Implementation for User Story 2

- [ ] T037 [P] [FE] [US2] Create `phase-2/frontend/components/TodoList.tsx` component
  - **Success**: React component that accepts todos array prop, displays each todo with id, title, status
  - **Verification**: Create test data, render component, verify todos displayed in list format
  - **Requirement**: Todo display UI

- [ ] T038 [P] [FE] [US2] Create `phase-2/frontend/components/TodoForm.tsx` component
  - **Success**: Form with title input and submit button, onSubmit callback prop
  - **Verification**: Render component, type title, click submit, verify callback called
  - **Requirement**: Todo creation UI

- [ ] T039 [FE] [US2] Create `phase-2/frontend/pages/todos.tsx` with todo list page
  - **Success**: Protected page that fetches GET /api/todos on mount, displays TodoList and TodoForm components
  - **Verification**: Visit http://localhost:3000/todos, verify page loads and calls API
  - **Requirements**: FR-030 (todos page)

- [ ] T040 [FE] [US2] Add auth check to `pages/todos.tsx`
  - **Success**: Check for JWT token, redirect to /login if not authenticated
  - **Verification**: Visit /todos without logging in, verify redirected to /login
  - **Requirement**: FR-031 (redirect unauthenticated users)

- [ ] T041 [FE] [US2] Implement create todo in `pages/todos.tsx`
  - **Success**: TodoForm submission calls POST /api/todos with JWT, adds new todo to state, re-renders list
  - **Verification**: Login, create todo, verify appears in list immediately
  - **Requirement**: FR-011 (create todo)
  - **Acceptance**: Spec User Story 2, Scenario 1

- [ ] T042 [FE] [US2] Add empty state message to `pages/todos.tsx`
  - **Success**: Display "No todos yet. Create your first todo!" if todos array empty
  - **Verification**: Login with new user (no todos), verify message displayed
  - **Acceptance**: Spec User Story 2, Scenario 4

- [ ] T043 [FE] [US2] Add error handling to `pages/todos.tsx`
  - **Success**: Display error messages for API failures, redirect to /login on 401
  - **Verification**: Stop backend, try to create todo, verify error displayed; send expired JWT, verify redirect to /login
  - **Requirements**: FR-032 (user-friendly errors)

**Checkpoint**: User Story 2 complete - Users can create and list their personal todos via web UI

**Manual Acceptance Test for US2**:
1. Ensure backend and frontend running
2. Signup as user1@test.com
3. Create todo "Buy groceries" → Verify appears in list
4. Create todos "Write code", "Review PR" → Verify all 3 displayed
5. Refresh page → Verify todos persist (from database)
6. Open incognito, signup as user2@test.com
7. Create todo "Different task" → Verify only 1 todo shown (not user1's todos)
8. Switch back to user1 window → Verify still see 3 todos (data isolation)

---

## Phase 7: User Story 3 (Backend) - Complete Todo Endpoint (Priority: P3)

**Goal**: Implement backend endpoint to mark todos as completed

**Independent Test**: Use curl with JWT to mark todo as completed, verify status changes in database

### Backend Implementation for User Story 3

- [ ] T044 [BE] [US3] Implement PATCH /api/todos/{id}/complete endpoint in `routers/todos.py`
  - **Success**: Finds todo by id, verifies ownership (user_id == current_user), updates status to "completed", returns TodoResponse
  - **Verification**: `curl -X PATCH http://localhost:8000/api/todos/1/complete -H "Authorization: Bearer <JWT>"`, verify status "completed"
  - **Domain Rules**: Status transition pending → completed; ownership check (403 if not owner)
  - **Requirements**: FR-015 (complete endpoint), FR-018 (verify ownership)
  - **Acceptance**: Spec User Story 3, Scenarios 1, 2

- [ ] T045 [BE] [US3] Add 404 handling for non-existent todo in complete endpoint
  - **Success**: Return 404 if todo with given id doesn't exist
  - **Verification**: `curl -X PATCH http://localhost:8000/api/todos/9999/complete -H "Authorization: Bearer <JWT>"`, verify 404 response
  - **Acceptance**: Spec User Story 3, Scenario 4

- [ ] T046 [BE] [US3] Add idempotency check to complete endpoint
  - **Success**: If todo already "completed", update succeeds (no error)
  - **Verification**: Complete same todo twice, verify 200 response both times
  - **Acceptance**: Spec User Story 3, Scenario 3

**Checkpoint**: Backend US3 complete - Complete todo endpoint working with ownership checks

---

## Phase 8: User Story 3 (Frontend) - Mark Todo as Completed (Priority: P3)

**Goal**: Add UI for marking todos as completed

**Independent Test**: Click complete button on todo, verify status changes and persists

### Frontend Implementation for User Story 3

- [ ] T047 [FE] [US3] Add complete button to TodoList component in `components/TodoList.tsx`
  - **Success**: Each todo has "Complete" button (hidden if already completed), onClick calls callback prop
  - **Verification**: Render component, verify button appears for pending todos only
  - **Requirement**: UI for complete action

- [ ] T048 [FE] [US3] Implement complete todo handler in `pages/todos.tsx`
  - **Success**: Handler calls PATCH /api/todos/{id}/complete with JWT, updates todo status in state
  - **Verification**: Click "Complete" button, verify API call and status changes to "completed"
  - **Requirement**: FR-015 (complete todo)
  - **Acceptance**: Spec User Story 3, Scenario 1

- [ ] T049 [FE] [US3] Add error handling for complete action
  - **Success**: Display error if 403 (not owner) or 404 (not found)
  - **Verification**: Manually trigger errors, verify messages displayed
  - **Requirement**: FR-032 (user-friendly errors)

**Checkpoint**: User Story 3 complete - Users can mark todos as completed via web UI

**Manual Acceptance Test for US3**:
1. Login as user1@test.com
2. Create 3 todos
3. Click "Complete" button on todo 1 → Verify status changes to "completed"
4. Click "Complete" on todo 2 → Verify status changes
5. Refresh page → Verify todos 1 and 2 still show "completed" (persisted)

---

## Phase 9: User Story 4 (Backend) - Update Todo Endpoint (Priority: P4)

**Goal**: Implement backend endpoint to update todo title

**Independent Test**: Use curl with JWT to update title, verify changes in database

### Backend Implementation for User Story 4

- [ ] T050 [BE] [US4] Implement PATCH /api/todos/{id} endpoint in `routers/todos.py`
  - **Success**: Finds todo by id, verifies ownership, validates new title, updates title, returns TodoResponse
  - **Verification**: `curl -X PATCH http://localhost:8000/api/todos/1 -H "Authorization: Bearer <JWT>" -d '{"title":"New title"}'`, verify title updated
  - **Domain Rules**: Title non-empty, max 500 chars; ownership check (403 if not owner)
  - **Requirements**: FR-016 (update endpoint), FR-018 (verify ownership), FR-019 (validate title)
  - **Acceptance**: Spec User Story 4, Scenarios 1, 2, 3

- [ ] T051 [BE] [US4] Add 404 handling for non-existent todo in update endpoint
  - **Success**: Return 404 if todo doesn't exist
  - **Verification**: `curl -X PATCH http://localhost:8000/api/todos/9999 -d '{"title":"Test"}'`, verify 404
  - **Acceptance**: Spec User Story 4, Scenario 4

**Checkpoint**: Backend US4 complete - Update todo endpoint working with ownership and validation

---

## Phase 10: User Story 4 (Frontend) - Update Todo Title (Priority: P4)

**Goal**: Add UI for updating todo titles

**Independent Test**: Click edit button, change title, verify persists after refresh

### Frontend Implementation for User Story 4

- [ ] T052 [FE] [US4] Add edit mode to TodoList component in `components/TodoList.tsx`
  - **Success**: Each todo has "Edit" button that toggles edit mode (shows input + save/cancel buttons)
  - **Verification**: Click "Edit", verify input field appears with current title
  - **Requirement**: UI for update action

- [ ] T053 [FE] [US4] Implement update todo handler in `pages/todos.tsx`
  - **Success**: Handler calls PATCH /api/todos/{id} with new title and JWT, updates todo in state
  - **Verification**: Edit todo title, click save, verify API call and title changes in list
  - **Requirement**: FR-016 (update todo)
  - **Acceptance**: Spec User Story 4, Scenario 1

- [ ] T054 [FE] [US4] Add validation to edit mode
  - **Success**: Prevent saving empty title, display error message
  - **Verification**: Clear title in edit mode, click save, verify error "Title cannot be empty"
  - **Domain Rule**: Title non-empty
  - **Acceptance**: Spec User Story 4, Scenario 3

- [ ] T055 [FE] [US4] Add error handling for update action
  - **Success**: Display error if 403 (not owner) or 404 (not found)
  - **Verification**: Manually trigger errors, verify messages displayed
  - **Requirement**: FR-032 (user-friendly errors)

**Checkpoint**: User Story 4 complete - Users can update todo titles via web UI

**Manual Acceptance Test for US4**:
1. Login as user1@test.com
2. Create todo "Buy milk"
3. Click "Edit" button, change to "Buy almond milk", click save
4. Verify title updated in list
5. Refresh page → Verify new title persists

---

## Phase 11: User Story 5 (Backend) - Delete Todo Endpoint (Priority: P5)

**Goal**: Implement backend endpoint to delete todos

**Independent Test**: Use curl with JWT to delete todo, verify removed from database

### Backend Implementation for User Story 5

- [ ] T056 [BE] [US5] Implement DELETE /api/todos/{id} endpoint in `routers/todos.py`
  - **Success**: Finds todo by id, verifies ownership, deletes from database, returns 204 No Content
  - **Verification**: `curl -X DELETE http://localhost:8000/api/todos/1 -H "Authorization: Bearer <JWT>"`, verify 204 response and todo removed
  - **Domain Rules**: Ownership check (403 if not owner); IDs not reused after deletion
  - **Requirements**: FR-017 (delete endpoint), FR-018 (verify ownership)
  - **Acceptance**: Spec User Story 5, Scenarios 1, 2

- [ ] T057 [BE] [US5] Add 404 handling for non-existent todo in delete endpoint
  - **Success**: Return 404 if todo doesn't exist
  - **Verification**: `curl -X DELETE http://localhost:8000/api/todos/9999`, verify 404
  - **Acceptance**: Spec User Story 5, Scenarios 3, 4

**Checkpoint**: Backend US5 complete - Delete todo endpoint working with ownership checks

---

## Phase 12: User Story 5 (Frontend) - Delete Todos (Priority: P5)

**Goal**: Add UI for deleting todos

**Independent Test**: Click delete button, verify todo removed from list and database

### Frontend Implementation for User Story 5

- [ ] T058 [FE] [US5] Add delete button to TodoList component in `components/TodoList.tsx`
  - **Success**: Each todo has "Delete" button, onClick calls callback prop with todo id
  - **Verification**: Render component, verify delete button appears for each todo
  - **Requirement**: UI for delete action

- [ ] T059 [FE] [US5] Implement delete todo handler in `pages/todos.tsx`
  - **Success**: Handler calls DELETE /api/todos/{id} with JWT, removes todo from state
  - **Verification**: Click "Delete" button, verify API call and todo removed from list
  - **Requirement**: FR-017 (delete todo)
  - **Acceptance**: Spec User Story 5, Scenario 1

- [ ] T060 [FE] [US5] Add confirmation dialog to delete action
  - **Success**: Show browser confirm() dialog before deleting ("Are you sure?")
  - **Verification**: Click delete, verify confirmation dialog appears, cancel keeps todo
  - **Requirement**: User experience (prevent accidental deletion)

- [ ] T061 [FE] [US5] Add error handling for delete action
  - **Success**: Display error if 403 (not owner) or 404 (not found)
  - **Verification**: Manually trigger errors, verify messages displayed
  - **Requirement**: FR-032 (user-friendly errors)

**Checkpoint**: User Story 5 complete - Users can delete todos via web UI

**Manual Acceptance Test for US5**:
1. Login as user1@test.com
2. Create 4 todos
3. Click "Delete" on todo 2 → Confirm → Verify removed from list
4. Click "Delete" on todo 4 → Confirm → Verify removed
5. Refresh page → Verify only 2 todos remain (todos 1 and 3)

---

## Phase 13: Cross-Cutting & Polish

**Purpose**: Finalize application with documentation, logout, and final testing

- [ ] T062 [P] [FE] Add logout functionality to `pages/todos.tsx`
  - **Success**: "Logout" button that removes JWT from localStorage and redirects to /login
  - **Verification**: Click logout, verify JWT removed and redirected
  - **Requirement**: Edge case (logout handling)

- [ ] T063 [P] [BE] Add health check endpoint GET /health in `main.py`
  - **Success**: Returns {"status": "healthy"} for monitoring
  - **Verification**: `curl http://localhost:8000/health`, verify 200 response
  - **Requirement**: Basic observability

- [ ] T064 [P] Create `phase-2/README.md` with setup and run instructions
  - **Success**: File contains: project description, tech stack, setup steps, run commands, API endpoints, environment variables
  - **Verification**: Follow README instructions, verify app runs
  - **Requirement**: Documentation

- [ ] T065 [P] Create `phase-2/.env.example` with all environment variables
  - **Success**: File contains backend and frontend environment variables with placeholder values
  - **Verification**: Copy to .env, verify app reads variables
  - **Requirement**: Configuration template

- [ ] T066 Test data isolation with 2 users
  - **Success**: Create User A and User B, add todos for each, verify each user only sees their own
  - **Verification**: Login as User A, create 3 todos; login as User B, create 2 todos; User A sees 3, User B sees 2
  - **Critical**: SC-004 (data isolation), SC-006 (ownership check)

- [ ] T067 Test all CRUD operations end-to-end
  - **Success**: Complete full workflow for each user story (signup → login → create → list → complete → update → delete)
  - **Verification**: Follow acceptance test steps for all 5 user stories
  - **Requirement**: All acceptance scenarios validated

- [ ] T068 Test edge cases (JWT expiration, invalid token, CORS)
  - **Success**: Manually expire JWT, verify 401 and redirect; test CORS by checking network requests from browser
  - **Verification**: All edge cases from spec handled correctly
  - **Requirement**: Edge case validation

- [ ] T069 Verify Phase 1 domain rules maintained
  - **Success**: Status transitions (pending → completed only), title validation (non-empty), IDs auto-increment
  - **Verification**: Create todo (status=pending), complete it (status=completed), verify cannot uncomplete; try empty title (rejected)
  - **Domain Consistency**: Constitution Principle IV

**Checkpoint**: All cross-cutting concerns complete, Phase 2 fully functional

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start here
- **Backend Foundational (Phase 2)**: Depends on Setup - BLOCKS all backend user story tasks
- **US1 Backend (Phase 3)**: Depends on Backend Foundational
- **US1 Frontend (Phase 4)**: Depends on US1 Backend (needs API endpoints)
- **US2 Backend (Phase 5)**: Depends on Backend Foundational
- **US2 Frontend (Phase 6)**: Depends on US2 Backend (needs API endpoints)
- **US3 Backend (Phase 7)**: Depends on Backend Foundational
- **US3 Frontend (Phase 8)**: Depends on US3 Backend
- **US4 Backend (Phase 9)**: Depends on Backend Foundational
- **US4 Frontend (Phase 10)**: Depends on US4 Backend
- **US5 Backend (Phase 11)**: Depends on Backend Foundational
- **US5 Frontend (Phase 12)**: Depends on US5 Backend
- **Cross-Cutting (Phase 13)**: Depends on all user stories complete

### Sequential Execution (Recommended for Single Developer)

**Backend First (Build API)**:
1. Phase 1: Setup (T001-T007)
2. Phase 2: Backend Foundational (T008-T019)
3. Phase 3: US1 Backend (T020-T023)
4. Phase 5: US2 Backend (T032-T036)
5. Phase 7: US3 Backend (T044-T046)
6. Phase 9: US4 Backend (T050-T051)
7. Phase 11: US5 Backend (T056-T057)

**Then Frontend (Build UI)**:
8. Phase 4: US1 Frontend (T024-T031)
9. Phase 6: US2 Frontend (T037-T043)
10. Phase 8: US3 Frontend (T047-T049)
11. Phase 10: US4 Frontend (T052-T055)
12. Phase 12: US5 Frontend (T058-T061)

**Finally Polish**:
13. Phase 13: Cross-Cutting (T062-T069)

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T004 (backend requirements), T005 (backend .env), T006 (Next.js init), T007 (frontend .env) can run in parallel

**Backend vs Frontend**:
- After Backend Foundational complete (T008-T019), backend user story tasks (T020-T057) and frontend tasks (T024-T061) can proceed in parallel if two developers
- Example: One developer builds backend APIs while another builds frontend pages simultaneously

**Within Frontend**:
- T024 (api.ts), T025 (signup.tsx), T029 (login.tsx), T031 (index.tsx) can run in parallel (different files)
- T037 (TodoList.tsx) and T038 (TodoForm.tsx) can run in parallel (different components)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

For fastest value delivery:
1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Backend Foundational (T008-T019)
3. Complete Phase 3: US1 Backend (T020-T023)
4. Complete Phase 4: US1 Frontend (T024-T031)
5. **STOP and VALIDATE**: Test signup and login end-to-end

This delivers working authentication in ~31 tasks.

### Full CRUD (All User Stories)

1. Setup + Backend Foundational → API ready
2. Add US1 (Backend + Frontend) → Authentication working
3. Add US2 (Backend + Frontend) → Create and list todos
4. Add US3 (Backend + Frontend) → Complete todos
5. Add US4 (Backend + Frontend) → Update todos
6. Add US5 (Backend + Frontend) → Delete todos
7. Polish → Production-ready

---

## Notes

- **BE vs FE**: Backend tasks create API endpoints; frontend tasks consume them
- **Dependencies**: Frontend user story tasks depend on corresponding backend tasks (API must exist)
- **Verification**: Each task has curl (backend) or browser (frontend) verification step
- **No AI**: Zero tasks related to LLM, chatbot, or natural language processing
- **No Deployment**: Zero Docker, Kubernetes, or cloud deployment tasks
- **Phase Boundaries**: All tasks create files in phase-2/ directory only
- **Commit Strategy**: Commit after each phase completion (13 commits total)

---

## Task Summary

- **Total Tasks**: 69
- **Setup**: 7 tasks (phase-2 structure, dependencies, configs)
- **Backend Foundational**: 12 tasks (database, models, auth, FastAPI app)
- **US1 Backend**: 4 tasks (signup, login endpoints)
- **US1 Frontend**: 8 tasks (signup, login pages)
- **US2 Backend**: 5 tasks (create, list endpoints)
- **US2 Frontend**: 7 tasks (todo list page, components)
- **US3 Backend**: 3 tasks (complete endpoint)
- **US3 Frontend**: 3 tasks (complete button)
- **US4 Backend**: 2 tasks (update endpoint)
- **US4 Frontend**: 4 tasks (edit mode)
- **US5 Backend**: 2 tasks (delete endpoint)
- **US5 Frontend**: 4 tasks (delete button)
- **Cross-Cutting**: 8 tasks (logout, health check, README, testing)

**Estimated Completion**:
- MVP (Phases 1-4): 31 tasks → Working authentication
- With Todo CRUD (Phases 1-6): 50 tasks → Create and list todos
- Full Features (Phases 1-12): 61 tasks → All user stories
- Production-Ready (All phases): 69 tasks → Polished and documented

**Constitution Compliance**:
- ✅ Each task independently checkable (Success + Verification for all 69)
- ✅ Backend and frontend tasks clearly separated ([BE] vs [FE] tags)
- ✅ Stay strictly within Phase 2 scope (no AI, no deployment)
- ✅ No AI or deployment tasks (constitution adherence)
- ✅ Domain rules enforced in implementation tasks (references Phase 1 consistency)
