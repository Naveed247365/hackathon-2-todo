# Feature Specification: Web-Based Todo Application

**Feature Branch**: `002-web-based-todo-app`
**Created**: 2025-12-30
**Status**: ✅ COMPLETE
**Completed**: 2025-12-30
**Input**: User description: "Create Phase 2 specification for Hackathon 2: Web-based Todo Application. Scope: Backend: FastAPI, Frontend: Next.js, Database: SQLite (local) or Neon PostgreSQL, Multi-user support, User authentication (basic signup/login), CRUD operations for todos, Each user can only access their own todos. Constraints: Follow the project constitution strictly, Clear separation of frontend and backend, RESTful API design, Stateless backend services, No AI features. Non-Goals: No chatbot, No Kubernetes, No Kafka or Dapr, No advanced UI styling, No role-based access control. Exit Criteria: Users can sign up and log in, Logged-in users can create, update, delete, complete todos, Todos persist in database, Frontend communicates with backend via API, App runs locally without errors."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration and Login (Priority: P1) 🎯 MVP

As a new user, I want to create an account and log in so that I can access the todo application with my personal account.

**Why this priority**: Without authentication, there's no way to have multi-user support or isolate user data. This is the foundational capability that enables all other features.

**Independent Test**: Can be fully tested by visiting signup page, creating account with email/password, logging in, and verifying JWT token received. Delivers core value: secure account access.

**Acceptance Scenarios**:

1. **Given** a user visits the signup page, **When** they enter valid email and password (min 8 chars), **Then** account is created and they are logged in automatically with JWT token
2. **Given** a user has an existing account, **When** they enter correct email and password on login page, **Then** they receive a JWT token and are redirected to todo list page
3. **Given** a user tries to sign up with an existing email, **When** they submit the form, **Then** error message "Email already registered" is displayed
4. **Given** a user enters incorrect password on login, **When** they submit the form, **Then** error message "Invalid credentials" is displayed
5. **Given** a user tries to sign up with password < 8 chars, **When** they submit the form, **Then** error message "Password must be at least 8 characters" is displayed

---

### User Story 2 - Create and List Personal Todos (Priority: P2)

As a logged-in user, I want to create todos and see a list of my own todos so that I can track my personal tasks.

**Why this priority**: After authentication, creating and viewing todos is the core value proposition of the application. This enables basic task tracking for each user.

**Independent Test**: Can be tested by logging in, creating 3 todos with different titles, listing them, and verifying only the logged-in user's todos appear (not other users' todos). Delivers personal task tracking.

**Acceptance Scenarios**:

1. **Given** a logged-in user has no todos, **When** they create a todo with title "Buy groceries", **Then** the todo is saved to database with user_id association and appears in their list
2. **Given** a logged-in user has 5 todos, **When** they view the todo list page, **Then** all 5 of their todos are displayed with ID, title, and status
3. **Given** User A and User B both have todos, **When** User A views their todo list, **Then** only User A's todos are displayed (data isolation verified)
4. **Given** a logged-in user has no todos, **When** they view the todo list page, **Then** message "No todos yet. Create your first todo!" is displayed
5. **Given** a user is not logged in (no JWT token), **When** they try to access the todo list API endpoint, **Then** 401 Unauthorized response is returned

---

### User Story 3 - Mark Personal Todos as Completed (Priority: P3)

As a logged-in user, I want to mark my todos as completed so that I can track my progress and distinguish between pending and finished tasks.

**Why this priority**: Status tracking is the next most valuable feature after basic CRUD. It enables users to see task progress.

**Independent Test**: Can be tested by logging in, creating 3 todos, marking 2 as completed, refreshing the list, and verifying status persists. Delivers progress tracking.

**Acceptance Scenarios**:

1. **Given** a logged-in user has a pending todo with ID 1, **When** they mark todo 1 as completed via API, **Then** todo status changes to "completed" in database and UI reflects the change
2. **Given** a logged-in user tries to mark another user's todo as completed, **When** they send API request with that todo ID, **Then** 403 Forbidden response is returned (ownership check)
3. **Given** a logged-in user has a completed todo, **When** they mark it as completed again, **Then** status remains "completed" and no error occurs (idempotent)
4. **Given** a logged-in user tries to mark a non-existent todo as completed, **When** they send API request, **Then** 404 Not Found response is returned

---

### User Story 4 - Update Personal Todo Title (Priority: P4)

As a logged-in user, I want to update the title of my todos so that I can correct mistakes or refine task descriptions.

**Why this priority**: Editing is a convenience feature. Users can work around lack of editing by deleting and recreating todos, making this lower priority.

**Independent Test**: Can be tested by logging in, creating a todo "Buy milk", updating it to "Buy almond milk", and verifying the change persists after page refresh. Delivers task refinement capability.

**Acceptance Scenarios**:

1. **Given** a logged-in user has a todo with ID 2 and title "Old title", **When** they update todo 2 with new title "New title", **Then** the title changes in database and UI reflects the change
2. **Given** a logged-in user tries to update another user's todo, **When** they send API request with that todo ID, **Then** 403 Forbidden response is returned (ownership check)
3. **Given** a logged-in user tries to update a todo with empty title, **When** they submit the update, **Then** 400 Bad Request response with error "Title cannot be empty" is returned
4. **Given** a logged-in user tries to update a non-existent todo, **When** they send API request, **Then** 404 Not Found response is returned

---

### User Story 5 - Delete Personal Todos (Priority: P5)

As a logged-in user, I want to delete my todos so that I can remove tasks that are no longer relevant.

**Why this priority**: Deletion is a cleanup feature. While useful for a complete CRUD experience, users can tolerate incomplete todos since they have status tracking.

**Independent Test**: Can be tested by logging in, creating 4 todos, deleting 2 by ID, refreshing the list, and verifying only 2 remain. Delivers cleanup capability.

**Acceptance Scenarios**:

1. **Given** a logged-in user has a todo with ID 3, **When** they delete todo 3 via API, **Then** the todo is removed from database and no longer appears in their list
2. **Given** a logged-in user tries to delete another user's todo, **When** they send API request with that todo ID, **Then** 403 Forbidden response is returned (ownership check)
3. **Given** a logged-in user tries to delete a non-existent todo, **When** they send API request, **Then** 404 Not Found response is returned
4. **Given** a logged-in user deletes a todo, **When** they try to delete it again, **Then** 404 Not Found response is returned (todo already deleted)

---

### Edge Cases

- What happens when JWT token expires? **Frontend receives 401 response and redirects user to login page**
- What happens when user tries to access API without JWT token? **401 Unauthorized response with message "Authentication required"**
- What happens when user tries to signup with invalid email format? **400 Bad Request with error "Invalid email format"**
- What happens when database connection fails? **500 Internal Server Error with generic message "Service temporarily unavailable"**
- What happens when user creates a todo with a very long title (1000+ characters)? **400 Bad Request with error "Title must be less than 500 characters"**
- What happens when user enters special characters or Unicode in title? **System accepts and stores title as-is, displays correctly**
- What happens when two users create accounts with same email simultaneously? **Database unique constraint prevents duplicate; one succeeds, one gets error**
- What happens when user refreshes the page? **JWT token retrieved from browser storage, user remains logged in**
- What happens when user logs out? **JWT token removed from browser storage, user redirected to login page**

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Authorization
- **FR-001**: System MUST provide an API endpoint `/api/auth/signup` to create new user accounts
- **FR-002**: System MUST validate email format and password length (min 8 chars) during signup
- **FR-003**: System MUST hash passwords before storing in database (using bcrypt or similar)
- **FR-004**: System MUST prevent duplicate email registrations (unique constraint)
- **FR-005**: System MUST provide an API endpoint `/api/auth/login` for user authentication
- **FR-006**: System MUST return JWT token upon successful login (expires in 24 hours)
- **FR-007**: System MUST validate JWT token on all protected API endpoints
- **FR-008**: System MUST extract user_id from JWT token for data isolation
- **FR-009**: Frontend MUST store JWT token in localStorage or cookie
- **FR-010**: Frontend MUST include JWT token in Authorization header for all API requests

#### Todo CRUD Operations
- **FR-011**: System MUST provide API endpoint `POST /api/todos` to create new todo (requires auth)
- **FR-012**: System MUST associate each todo with the authenticated user's user_id
- **FR-013**: System MUST provide API endpoint `GET /api/todos` to list user's todos (requires auth)
- **FR-014**: System MUST only return todos where user_id matches authenticated user (data isolation)
- **FR-015**: System MUST provide API endpoint `PATCH /api/todos/{id}/complete` to mark todo as completed (requires auth)
- **FR-016**: System MUST provide API endpoint `PATCH /api/todos/{id}` to update todo title (requires auth)
- **FR-017**: System MUST provide API endpoint `DELETE /api/todos/{id}` to delete todo (requires auth)
- **FR-018**: System MUST verify todo ownership before allowing update/complete/delete operations (return 403 if not owner)
- **FR-019**: System MUST validate todo title is non-empty and < 500 characters
- **FR-020**: System MUST persist all todos in database (SQLite or PostgreSQL)

#### Database & Persistence
- **FR-021**: System MUST use SQLite for local development or Neon PostgreSQL for cloud
- **FR-022**: System MUST define User table with fields: id, email (unique), password_hash, created_at
- **FR-023**: System MUST define Todo table with fields: id, user_id (foreign key), title, status, created_at
- **FR-024**: System MUST use database migrations to manage schema changes
- **FR-025**: System MUST enforce foreign key constraint between Todo.user_id and User.id

#### API & Frontend
- **FR-026**: Backend MUST expose RESTful API following standard conventions
- **FR-027**: Backend MUST run on port 8000 (configurable via environment variable)
- **FR-028**: Frontend MUST run on port 3000 (configurable via environment variable)
- **FR-029**: Backend MUST enable CORS for frontend origin (http://localhost:3000)
- **FR-030**: Frontend MUST provide pages: /signup, /login, /todos
- **FR-031**: Frontend MUST redirect unauthenticated users from /todos to /login
- **FR-032**: Frontend MUST display user-friendly error messages for API errors

### Key Entities

#### User Entity
- **id** (integer/UUID): Primary key, auto-generated
- **email** (string): Unique identifier for login, validated format, max 255 chars
- **password_hash** (string): Bcrypt-hashed password (never store plain text)
- **created_at** (datetime): Timestamp of account creation

#### Todo Entity (extends Phase 1 definition)
- **id** (integer/UUID): Primary key, auto-generated
- **user_id** (integer/UUID): Foreign key to User.id, required, indexed
- **title** (string): Task description, required, non-empty, max 500 chars
- **status** (string): Task state, enum: "pending" or "completed", default "pending"
- **created_at** (datetime): Timestamp of todo creation
- **updated_at** (datetime): Timestamp of last modification (optional)

### Domain Rules (Constitution Principle IV)

**User Domain Rules**:
- Email MUST be unique across all users
- Email MUST be valid format (contains @ and domain)
- Password MUST be at least 8 characters
- Password MUST be hashed (never stored in plain text)
- User accounts cannot be deleted in Phase 2 (deferred to future phase)

**Todo Domain Rules** (consistent with Phase 1):
- New todo starts in "pending" status (Phase 1 rule maintained)
- Todo can transition from "pending" to "completed" (Phase 1 rule maintained)
- Todo cannot transition from "completed" back to "pending" in Phase 2 (Phase 1 rule maintained)
- Todo status can only be "pending" or "completed" (Phase 1 rule maintained)
- Todo title MUST be non-empty after stripping whitespace (Phase 1 rule maintained)
- Todo title MUST be string, max 500 characters (extended from Phase 1)

**Data Isolation Rules** (NEW for Phase 2):
- Each todo MUST be associated with exactly one user (user_id required)
- User A CANNOT view, update, complete, or delete User B's todos (ownership check enforced)
- API endpoints MUST verify JWT token and extract user_id before any todo operation
- Database queries MUST always filter by user_id from JWT token (never trust client-provided user_id)

**Authentication Rules** (NEW for Phase 2):
- JWT token MUST contain user_id claim
- JWT token MUST expire after 24 hours
- JWT token MUST be validated on all protected endpoints
- Invalid or expired JWT token MUST return 401 Unauthorized
- Signup with existing email MUST return 400 Bad Request
- Login with incorrect credentials MUST return 401 Unauthorized

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User can successfully sign up with valid email and password from browser
- **SC-002**: User can successfully log in and receive JWT token that persists in browser
- **SC-003**: Logged-in user can create a todo and see it persist after page refresh
- **SC-004**: User A's todos are NOT visible to User B (data isolation verified)
- **SC-005**: Logged-in user can complete, update, and delete their own todos
- **SC-006**: User cannot complete, update, or delete another user's todos (ownership check verified)
- **SC-007**: API responds with appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- **SC-008**: Frontend displays user-friendly error messages for API failures
- **SC-009**: JWT token expires after 24 hours and user is prompted to log in again
- **SC-010**: Application starts locally with `npm run dev` (frontend) and `uvicorn main:app` (backend) without errors

## Constraints

### Technical Constraints
- **MUST** use FastAPI for backend (Python 3.8+)
- **MUST** use Next.js for frontend (React-based)
- **MUST** use SQLite (local dev) or Neon PostgreSQL (cloud)
- **MUST** implement RESTful API design (standard HTTP verbs and status codes)
- **MUST** use JWT for authentication (no session-based auth)
- **MUST** separate frontend and backend into distinct directories
- **MUST** run backend on port 8000, frontend on port 3000
- **MUST NOT** include AI features, chatbots, or LLM integration

### Constitution Compliance
- **Principle I (Spec-First)**: This spec MUST be complete and approved before planning begins
- **Principle II (Phase Discipline)**: Specification → Planning → Tasks → Implementation → Validation
- **Principle III (Exit Criteria)**: All acceptance scenarios MUST be testable
- **Principle IV (Domain Consistency)**: Todo entity rules from Phase 1 MUST be maintained; new User and data isolation rules added consistently
- **Principle V (Stateless Services)**: Backend MUST be stateless; JWT contains all necessary auth context; no server-side sessions
- **Principle VI (MCP Tools)**: Database operations SHOULD use MCP tools where applicable (SQLite MCP, Neon MCP)
- **Principle VII (Cloud-Native)**: Phase 2 focuses on local development; Kubernetes deferred to future phases
- **Principle VIII (Process Over Features)**: Comprehensive spec, clear API contracts, documented domain rules prioritized over advanced features
- **Principle IX (Folder Organization)**: All Phase 2 files MUST reside in `phase-2/` directory

### Architecture Constraints
- **Backend-Frontend Separation**: Clear API boundary; frontend only communicates via HTTP
- **Stateless Backend**: No server-side sessions; JWT contains auth state
- **Data Isolation**: User data MUST be isolated at database query level
- **RESTful Design**: API endpoints follow REST conventions (resource-based URLs, HTTP verbs)
- **Single Database**: One database instance shared across all users (multi-tenancy via user_id filtering)

## Out of Scope (Non-Goals)

### Explicitly Excluded from Phase 2
- **No AI/Chatbot**: No LLM integration, no natural language processing
- **No Kubernetes**: No containerization or orchestration (Phase 2 is local development)
- **No Kafka/Dapr**: No event streaming or pub/sub (not needed for Phase 2 scope)
- **No Advanced UI**: No custom styling frameworks (basic CSS acceptable); focus on functionality
- **No Role-Based Access Control (RBAC)**: No roles, permissions, or admin users; all users have equal access to their own data
- **No Password Reset**: No "forgot password" flow (deferred to future phase)
- **No Email Verification**: No email confirmation required for signup (deferred to future phase)
- **No Social Auth**: No OAuth, no "Sign in with Google/GitHub" (deferred to future phase)
- **No Real-Time Updates**: No WebSockets, no live sync between users (HTTP-only)
- **No File Uploads**: No todo attachments or images
- **No Todo Sharing**: Users cannot share todos with other users
- **No Todo Categories/Tags**: No organizational features beyond status
- **No Due Dates**: No scheduling or calendar features
- **No Search/Filter**: No advanced query capabilities (simple list only)
- **No Pagination**: All todos loaded at once (acceptable for Phase 2 scope)
- **No Rate Limiting**: No API throttling (acceptable for local dev)
- **No Audit Logs**: No tracking of who changed what and when

### Future Phases (Not Phase 2)
- **Phase 3 (potential)**: Kubernetes deployment, Docker containers, cloud hosting
- **Phase 4 (potential)**: Real-time collaboration, WebSocket updates
- **Phase 5 (potential)**: Advanced features (due dates, categories, sharing, RBAC)

## API Contract Specification

### Authentication Endpoints

#### POST /api/auth/signup
**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
**Response 201 Created**:
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Errors**: 400 (invalid email/password), 409 (email exists)

#### POST /api/auth/login
**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
**Response 200 OK**:
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Errors**: 401 (invalid credentials)

### Todo Endpoints (All require `Authorization: Bearer <token>` header)

#### POST /api/todos
**Request**:
```json
{
  "title": "Buy groceries"
}
```
**Response 201 Created**:
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Buy groceries",
  "status": "pending",
  "created_at": "2025-12-30T10:00:00Z"
}
```
**Errors**: 400 (empty title), 401 (unauthorized)

#### GET /api/todos
**Response 200 OK**:
```json
{
  "todos": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Buy groceries",
      "status": "pending",
      "created_at": "2025-12-30T10:00:00Z"
    }
  ]
}
```
**Errors**: 401 (unauthorized)

#### PATCH /api/todos/{id}/complete
**Response 200 OK**:
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Buy groceries",
  "status": "completed",
  "created_at": "2025-12-30T10:00:00Z"
}
```
**Errors**: 401 (unauthorized), 403 (not owner), 404 (not found)

#### PATCH /api/todos/{id}
**Request**:
```json
{
  "title": "Buy organic groceries"
}
```
**Response 200 OK**:
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Buy organic groceries",
  "status": "pending",
  "created_at": "2025-12-30T10:00:00Z"
}
```
**Errors**: 400 (empty title), 401 (unauthorized), 403 (not owner), 404 (not found)

#### DELETE /api/todos/{id}
**Response 204 No Content**
**Errors**: 401 (unauthorized), 403 (not owner), 404 (not found)

## Specification Completeness Checklist

- ✅ All user stories have priority assignments (P1-P5)
- ✅ All user stories are independently testable
- ✅ All user stories have acceptance scenarios in Given/When/Then format
- ✅ All edge cases identified and documented
- ✅ All functional requirements numbered and testable (FR-001 to FR-032)
- ✅ All key entities defined with attributes (User, Todo)
- ✅ All domain rules explicitly stated (User, Todo, Data Isolation, Authentication)
- ✅ Domain consistency maintained from Phase 1 (Todo entity rules preserved)
- ✅ All success criteria measurable and technology-agnostic (SC-001 to SC-010)
- ✅ All constraints documented (technical, constitutional, architectural)
- ✅ All non-goals explicitly listed
- ✅ API contracts specified with request/response examples
- ✅ No "NEEDS CLARIFICATION" markers present
- ✅ Constitution principles reviewed and applied

**Status**: Ready for Planning Phase (Phase 2 per constitution workflow)
