---
id: 0001
title: Create Web-Based Todo App Spec
stage: spec
date: 2025-12-30
surface: agent
model: claude-sonnet-4-5-20250929
feature: 002-web-based-todo-app
branch: 002-web-based-todo-app
user: naveed247365
command: /sp.specify
labels: ["spec", "phase-2", "web-app", "fastapi", "nextjs", "multi-user", "jwt-auth"]
links:
  spec: specs/002-web-based-todo-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/002-web-based-todo-app/spec.md
tests:
 - N/A (specification document, no code tests)
---

## Prompt

/sp.specify

Create Phase 2 specification for Hackathon 2: Web-based Todo Application.

Scope:
- Backend: FastAPI
- Frontend: Next.js
- Database: SQLite (local) or Neon PostgreSQL
- Multi-user support
- User authentication (basic signup/login)
- CRUD operations for todos
- Each user can only access their own todos

Constraints:
- Follow the project constitution strictly
- Clear separation of frontend and backend
- RESTful API design
- Stateless backend services
- No AI features

Non-Goals:
- No chatbot
- No Kubernetes
- No Kafka or Dapr
- No advanced UI styling
- No role-based access control

Exit Criteria:
- Users can sign up and log in
- Logged-in users can create, update, delete, complete todos
- Todos persist in database
- Frontend communicates with backend via API
- App runs locally without errors

## Response snapshot

Created comprehensive Phase 2 specification for web-based Todo application with:

**5 Prioritized User Stories**:
- P1 (MVP): User Registration and Login - Multi-user foundation with JWT auth
- P2: Create and List Personal Todos - Core task tracking with data isolation
- P3: Mark Personal Todos as Completed - Progress tracking
- P4: Update Personal Todo Title - Task refinement
- P5: Delete Personal Todos - Cleanup operations

**32 Functional Requirements** (FR-001 to FR-032):
- Authentication & Authorization (FR-001 to FR-010): Signup, login, JWT validation, token storage
- Todo CRUD Operations (FR-011 to FR-020): Create, read, update, complete, delete with ownership checks
- Database & Persistence (FR-021 to FR-025): SQLite/PostgreSQL, User/Todo tables, migrations, foreign keys
- API & Frontend (FR-026 to FR-032): RESTful design, CORS, port config, pages, routing, error handling

**Domain Rules** (Constitution Principle IV - Consistency with Phase 1):
- **User Rules** (NEW): Email unique, valid format; password min 8 chars, hashed; no account deletion
- **Todo Rules** (FROM PHASE 1): Status transitions (pending → completed), title validation (non-empty, max 500 chars)
- **Data Isolation Rules** (NEW): Each todo associated with user_id; ownership checks on all mutations; JWT-based filtering
- **Authentication Rules** (NEW): JWT expires 24hrs; user_id claim required; validation on protected endpoints

**API Contract Specification**:
- POST /api/auth/signup - Create account, return JWT
- POST /api/auth/login - Authenticate, return JWT
- POST /api/todos - Create todo (auth required)
- GET /api/todos - List user's todos (auth required, filtered by user_id)
- PATCH /api/todos/{id}/complete - Mark completed (auth + ownership check)
- PATCH /api/todos/{id} - Update title (auth + ownership check)
- DELETE /api/todos/{id} - Delete todo (auth + ownership check)

**10 Success Criteria** (SC-001 to SC-010):
- Signup, login, JWT persistence
- Create/persist todos
- Data isolation (User A ≠ User B)
- CRUD operations with ownership checks
- HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- User-friendly error messages
- JWT expiration handling
- Local startup without errors

**Constitution Compliance**: All 9 principles validated; Phase 1 domain rules maintained; stateless services enforced; MCP tools planned; phase-2/ folder organization acknowledged.

## Outcome

- ✅ Impact: Phase 2 specification complete; ready for planning phase; multi-user + auth + web architecture defined; Phase 1 domain consistency maintained
- 🧪 Tests: Acceptance testing defined via Given/When/Then scenarios; data isolation testing critical for security validation
- 📁 Files: Created specs/002-web-based-todo-app/spec.md (403 lines)
- 🔁 Next prompts: /sp.plan to generate implementation plan; /sp.clarify if database choice (SQLite vs Neon) needs discussion
- 🧠 Reflection: Phase 2 extends Phase 1 domain rules consistently (todo status transitions preserved); adds multi-user layer with JWT auth; maintains stateless backend principle (Principle V); API contracts explicitly defined for clear backend-frontend boundary; ownership checks prevent security vulnerabilities

## Evaluation notes (flywheel)

- Failure modes observed: None; spec follows template and maintains Phase 1 domain consistency
- Graders run and results (PASS/FAIL): Domain consistency PASS (Phase 1 todo rules preserved); Constitution validation PASS (all 9 principles checked); API contracts COMPLETE (all endpoints specified)
- Prompt variant (if applicable): N/A (standard /sp.specify workflow for Phase 2)
- Next experiment (smallest change to try): Monitor planning phase to validate FastAPI + Next.js architecture decisions align with stateless service requirement
