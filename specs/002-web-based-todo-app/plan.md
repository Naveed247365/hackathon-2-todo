# Implementation Plan: Web-Based Todo Application

**Branch**: `002-web-based-todo-app` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-web-based-todo-app/spec.md`

## Summary

Build a multi-user web-based todo application with FastAPI backend and Next.js frontend. The backend provides RESTful API with JWT authentication for user signup/login, and CRUD operations for todos with strict data isolation (users can only access their own todos). The frontend provides simple pages for signup, login, and todo management. Database persistence using SQLite for local development or Neon PostgreSQL for cloud deployment. All Phase 1 domain rules maintained while adding multi-user capabilities.

**Technical Approach**: Clear separation of backend (FastAPI) and frontend (Next.js) with HTTP-only communication. Stateless backend using JWT for authentication. Database schema with User and Todo tables linked by foreign key. Simple, functional UI without advanced styling.

## Technical Context

**Language/Version**: Python 3.8+ (backend), Node.js 18+ (frontend)
**Primary Dependencies**:
- Backend: FastAPI, SQLAlchemy, passlib (bcrypt), python-jose (JWT), uvicorn
- Frontend: Next.js (React 18+), TypeScript (optional but recommended), fetch/axios for API calls
**Storage**: SQLite (local development) or Neon PostgreSQL (cloud)
**Testing**: Manual acceptance testing (no automated test framework per user requirements)
**Target Platform**: Local development (localhost:3000 frontend, localhost:8000 backend)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: API response < 500ms; page load < 2 seconds; support 10 concurrent users
**Constraints**: No AI; no Kubernetes; no event streaming; stateless backend; RESTful API only
**Scale/Scope**: Multi-user (10-100 users); local development; production deployment deferred to Phase 3

## Constitution Check

*GATE: Must pass before implementation begins.*

### Principle I: Spec-First Development ✅
- Spec complete and approved in `specs/002-web-based-todo-app/spec.md`
- All user stories, functional requirements, domain rules, and API contracts documented
- No code written before spec approval

### Principle II: Phase Discipline ✅
- Phase 1: CLOSED (console app complete)
- Phase 2 Specification Phase: COMPLETE
- Phase 2 Planning Phase: IN PROGRESS (this document)
- Phase 2 Task Definition Phase: BLOCKED (awaits plan approval)
- Phase 2 Implementation Phase: BLOCKED (awaits tasks definition)
- Phase 2 Validation Phase: BLOCKED (awaits implementation)
- **No Phase Overlap**: Phase 1 and Phase 2 code isolated in separate folders

### Principle III: Clear Exit Criteria ✅
- **Plan Exit Criteria**: All placeholders resolved; technical stack specified; constitution check passed; database choice made; user approval obtained
- **Implementation Exit Criteria**: All acceptance scenarios validated; frontend + backend communicate successfully; data isolation verified; app runs locally without errors

### Principle IV: Domain Consistency ✅
- **Todo Entity** (Phase 1 rules maintained):
  - Status transitions: pending → completed (no reverse)
  - Title validation: non-empty, max 500 chars
  - Auto-generated IDs
- **Todo Entity** (Phase 2 extensions):
  - Added user_id foreign key (required, indexed)
  - Added created_at timestamp
  - Database-persisted (extends Phase 1 in-memory)
- **User Entity** (NEW for Phase 2):
  - email (unique), password_hash, id, created_at
  - Email validation, password min 8 chars, bcrypt hashing
- **Data Isolation**: user_id filtering on all queries
- **Terminology**: "todo", "pending", "completed", "user_id" used consistently across backend, frontend, database

### Principle V: Stateless Services ✅
- **Backend Stateless**: No server-side sessions; JWT contains all auth context
- **Database as Source of Truth**: All user and todo data in database
- **Horizontal Scalability**: Multiple backend instances can run (load balancer can distribute)
- **No In-Memory State**: JWT validation on every request (no session cache)

### Principle VI: MCP Tool Constraint ✅
- **Database Operations**: Use SQLite MCP or Neon MCP tools for schema setup and migrations
- **File Operations**: Use Filesystem MCP for creating backend/frontend directories
- **Git Operations**: Use Git MCP for commits and branch management
- Implementation code uses SQLAlchemy ORM (not MCP) for application queries (acceptable)

### Principle VII: Cloud-Native Readiness ⚠️
- **Phase 2 Scope**: Local development focus (localhost)
- **Deferred to Phase 3**: Docker, Kubernetes, cloud deployment
- **Preparation**: Environment variables for configuration (DATABASE_URL, JWT_SECRET, PORT)
- **Justification**: Phase 2 establishes working application; containerization adds complexity better suited for Phase 3

### Principle VIII: Process Over Features ✅
- Comprehensive spec with 5 user stories, 32 functional requirements, complete API contracts
- This plan focuses on minimal viable implementation (no advanced UI, no RBAC, no real-time)
- Manual acceptance testing documented
- Clear separation of concerns (backend/frontend)

### Principle IX: Phase-Based Folder Organization ✅
- All Phase 2 files MUST reside in `phase-2/` directory
- Backend code in `phase-2/backend/`
- Frontend code in `phase-2/frontend/`
- Shared config in `phase-2/` root

**Constitution Check Result**: ✅ PASS (with justified Phase 3 deferral for Principle VII)

## Project Structure

### Documentation (this feature)

```text
specs/002-web-based-todo-app/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (IN PROGRESS)
└── tasks.md             # Task breakdown (PENDING - created by /sp.tasks)
```

### Source Code (repository root)

```text
phase-2/                 # All Phase 2 implementation files
├── backend/             # FastAPI backend
│   ├── main.py          # FastAPI app entry point
│   ├── models.py        # SQLAlchemy models (User, Todo)
│   ├── schemas.py       # Pydantic schemas for request/response
│   ├── auth.py          # JWT utilities and authentication logic
│   ├── database.py      # Database connection and session management
│   ├── routers/         # API route modules
│   │   ├── auth.py      # /api/auth/* endpoints
│   │   └── todos.py     # /api/todos/* endpoints
│   ├── requirements.txt # Python dependencies
│   └── .env.example     # Environment variable template
├── frontend/            # Next.js frontend
│   ├── package.json     # Node dependencies
│   ├── next.config.js   # Next.js configuration
│   ├── pages/           # Next.js pages
│   │   ├── index.tsx    # Landing/redirect page
│   │   ├── signup.tsx   # Signup form
│   │   ├── login.tsx    # Login form
│   │   └── todos.tsx    # Todo list (protected)
│   ├── components/      # React components
│   │   ├── TodoList.tsx # Todo display component
│   │   └── TodoForm.tsx # Todo creation component
│   ├── lib/             # Utility functions
│   │   └── api.ts       # API client with JWT handling
│   └── public/          # Static assets
├── README.md            # Phase 2 documentation
└── .env.example         # Shared environment template
```

**Structure Decision**: Web application structure chosen for Phase 2 because:
1. **Clear Separation**: Backend and frontend in distinct directories (constitution requirement)
2. **Standard Conventions**: FastAPI backend structure, Next.js pages directory
3. **Scalability**: Each part can be developed, tested, deployed independently
4. **Phase Isolation**: All Phase 2 files in phase-2/ directory (Principle IX)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | N/A        | N/A                                 |

## Design Decisions

### 1. Database Choice: SQLite (Local) with Neon PostgreSQL Option

**Decision**: Use SQLite for local development by default; provide option for Neon PostgreSQL.

**Rationale**:
- **Simplicity**: SQLite requires no separate database server (single file)
- **Development Speed**: Immediate start, no database setup required
- **MCP Compatible**: SQLite MCP tools available for schema management
- **Cloud Path**: Neon PostgreSQL option for production deployment
- **Constitution Aligned**: Database as source of truth (Principle V)

**Implementation**:
```python
# database.py
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todos.db")
engine = create_engine(DATABASE_URL)
```

**Alternatives Considered**:
- PostgreSQL only: Rejected (requires Docker/install for local dev, adds friction)
- In-memory database: Rejected (not persistent per spec requirement)
- MySQL: Rejected (not in spec; SQLite simpler for local dev)

### 2. Authentication: JWT with passlib (bcrypt)

**Decision**: Use JWT tokens for stateless authentication; passlib for password hashing.

**Rationale**:
- **Stateless**: JWT contains user_id claim; no server-side sessions (Principle V)
- **Standard**: python-jose library for JWT; industry-standard approach
- **Secure**: bcrypt hashing via passlib (slow hash prevents brute force)
- **Simple**: No OAuth complexity; email/password sufficient for Phase 2
- **Frontend-Friendly**: JWT easily stored in localStorage and sent in headers

**JWT Payload**:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "exp": 1735560000
}
```

**Security**:
- JWT_SECRET from environment variable (never hardcoded)
- Password hashing before storage (never store plain text)
- Token expiration: 24 hours

**Alternatives Considered**:
- Session-based auth: Rejected (violates Principle V: stateless services)
- OAuth/Social login: Rejected (out of scope per spec non-goals)
- API keys: Rejected (less secure than JWT for user auth)

### 3. API Design: RESTful with Standard HTTP Verbs

**Decision**: Follow REST conventions with resource-based URLs and standard HTTP methods.

**API Structure**:
- `POST /api/auth/signup` - Create user (201 Created)
- `POST /api/auth/login` - Authenticate (200 OK, returns token)
- `GET /api/todos` - List user's todos (200 OK)
- `POST /api/todos` - Create todo (201 Created)
- `PATCH /api/todos/{id}` - Update title (200 OK)
- `PATCH /api/todos/{id}/complete` - Mark completed (200 OK)
- `DELETE /api/todos/{id}` - Delete todo (204 No Content)

**Rationale**:
- **RESTful**: Resource-based URLs (todos, auth), HTTP verbs map to operations
- **Standard Status Codes**: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error)
- **Predictable**: Developers and tools understand REST conventions
- **Spec Requirement**: FR-026 mandates RESTful API

**Error Response Format**:
```json
{
  "detail": "Error message here"
}
```

**Alternatives Considered**:
- GraphQL: Rejected (adds complexity; REST sufficient for Phase 2)
- RPC-style endpoints: Rejected (not RESTful; spec requires REST)

### 4. Frontend Framework: Next.js with Simple Pages

**Decision**: Use Next.js pages directory with functional React components and basic styling.

**Page Structure**:
- `/signup` - Signup form (email, password inputs + submit button)
- `/login` - Login form (email, password inputs + submit button)
- `/todos` - Todo list + create form (protected route, requires JWT)
- `/` - Landing page (redirects to /todos if authenticated, else /login)

**Rationale**:
- **Next.js Benefits**: Built-in routing, server-side rendering optional, TypeScript support
- **Simplicity**: Pages directory (not app directory) for straightforward routing
- **No Styling Framework**: Basic CSS only (per spec non-goal: no advanced UI)
- **Fast Development**: Create React App-like experience with better features

**State Management**:
- useState for local component state
- fetch/axios for API calls
- localStorage for JWT token persistence
- No Redux/Zustand (overkill for Phase 2 scope)

**Alternatives Considered**:
- Plain React (CRA): Rejected (Next.js provides routing + SSR for future)
- Vue/Svelte: Rejected (spec specifies Next.js)
- Advanced UI (Tailwind, MUI): Rejected (spec non-goal: no advanced styling)

### 5. Data Isolation: JWT user_id + Database Filtering

**Decision**: Extract user_id from JWT token; filter all database queries by user_id.

**Implementation Pattern**:
```python
# Dependency injection for current user
def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, JWT_SECRET)
    return payload["sub"]  # user_id

# All todo queries filtered by user_id
@router.get("/api/todos")
def list_todos(current_user: int = Depends(get_current_user), db: Session = Depends(get_db)):
    todos = db.query(Todo).filter(Todo.user_id == current_user).all()
    return {"todos": todos}
```

**Security Checks**:
1. **JWT Validation**: Verify signature, check expiration (401 if invalid)
2. **Ownership Verification**: For update/complete/delete, verify todo.user_id == current_user (403 if not match)
3. **Never Trust Client**: user_id from JWT only, never from request body/query params

**Rationale**:
- **Security**: Prevents users from accessing/modifying other users' data
- **Stateless**: No server-side session storage (Principle V)
- **Simple**: FastAPI dependency injection handles auth cleanly
- **Spec Requirement**: FR-014, FR-018 mandate data isolation and ownership checks

**Alternatives Considered**:
- Session-based with server-side user_id storage: Rejected (violates stateless principle)
- Client-provided user_id: Rejected (severe security vulnerability)

### 6. Error Handling Strategy

**Decision**: Return standard HTTP status codes with JSON error responses; frontend displays user-friendly messages.

**Backend Error Handling**:
- 400 Bad Request: Validation errors (empty title, invalid email, short password)
- 401 Unauthorized: Missing/invalid/expired JWT token
- 403 Forbidden: User doesn't own the resource (ownership check failed)
- 404 Not Found: Todo doesn't exist
- 409 Conflict: Email already registered
- 500 Internal Server Error: Database errors, unexpected exceptions

**Frontend Error Handling**:
- Catch API errors from fetch/axios
- Display error.detail message to user in UI (alert or toast)
- Redirect to /login on 401 errors (token expired/invalid)

**Rationale**:
- **Standard**: HTTP status codes are well-understood conventions
- **User Experience**: Clear error messages guide user actions
- **Security**: Generic 500 messages don't leak implementation details
- **Spec Requirement**: FR-032 (user-friendly error messages), SC-007 (appropriate status codes)

## Implementation Strategy

### Minimal Viable Approach

Per constitution Principle VIII (Process Over Features) and user requirement "avoid overengineering":

**Backend**:
- FastAPI with 2 routers (auth, todos)
- SQLAlchemy models (User, Todo)
- Pydantic schemas for validation
- JWT utilities in single auth.py file
- No background tasks, no caching, no admin panel

**Frontend**:
- 4 pages (index, signup, login, todos)
- 2 components (TodoList, TodoForm)
- Simple fetch-based API client
- localStorage for JWT
- No state management library, no complex styling

**Database**:
- 2 tables (users, todos)
- Foreign key constraint (todos.user_id → users.id)
- No migrations framework initially (manual SQL or Alembic if needed)

### Verification Strategy

Per user requirement "ensure each step is verifiable":

**Backend Verification**:
- After database setup: Run Python, check tables exist
- After User model: Create user via SQLAlchemy, verify in database
- After signup endpoint: `curl -X POST /api/auth/signup` with test data, verify user created
- After login endpoint: `curl -X POST /api/auth/login`, verify JWT returned
- After todo endpoints: Use curl/Postman with JWT to test CRUD operations

**Frontend Verification**:
- After Next.js setup: Visit http://localhost:3000, verify page loads
- After signup page: Fill form, submit, verify network request to backend
- After login page: Enter credentials, verify JWT stored in localStorage
- After todos page: Verify todos displayed, create form works

**Integration Verification**:
- Create User A, add 3 todos
- Create User B, add 2 todos
- Verify User A sees only their 3 todos (data isolation)
- Verify User B sees only their 2 todos (data isolation)

### Database Schema

**Users Table**:
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- or SERIAL for PostgreSQL
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Todos Table**:
```sql
CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- or SERIAL for PostgreSQL
    user_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
```

**Design Notes**:
- user_id indexed for fast filtering
- CASCADE delete: if user deleted (future), their todos deleted too
- Status CHECK constraint enforces "pending" or "completed" only (domain rule)

## Dependencies & Build

### Backend Dependencies (requirements.txt)

```
fastapi==0.115.0
uvicorn[standard]==0.32.0
sqlalchemy==2.0.36
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0
python-multipart==0.0.18
python-dotenv==1.0.1
```

**Rationale**:
- fastapi: Web framework with automatic OpenAPI docs
- uvicorn: ASGI server for running FastAPI
- sqlalchemy: ORM for database operations
- passlib: Password hashing (bcrypt)
- python-jose: JWT encoding/decoding
- python-multipart: Form data parsing
- python-dotenv: Environment variable loading

### Frontend Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0"
  }
}
```

**Rationale**:
- next, react, react-dom: Core Next.js dependencies
- TypeScript: Optional but recommended for type safety
- Minimal dependencies (no UI libraries, no state management)

### Build & Run Commands

**Backend**:
```bash
cd phase-2/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend**:
```bash
cd phase-2/frontend
npm install
npm run dev  # Runs on port 3000
```

**Environment Variables**:
```bash
# Backend .env
DATABASE_URL=sqlite:///./todos.db  # or postgresql://...
JWT_SECRET=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24
CORS_ORIGINS=http://localhost:3000

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Risks & Mitigations

### Risk 1: JWT Secret Management
**Impact**: Hardcoded secret = security vulnerability
**Likelihood**: High if developer forgets to set environment variable
**Mitigation**: Use .env.example template with placeholder; validation on startup to check JWT_SECRET is set
**Fallback**: App refuses to start if JWT_SECRET not configured

### Risk 2: CORS Misconfiguration
**Impact**: Frontend cannot call backend API (blocked by browser)
**Likelihood**: Medium (common mistake)
**Mitigation**: Explicitly configure CORS in FastAPI for http://localhost:3000; document in README
**Testing**: Test signup from browser immediately after CORS setup

### Risk 3: Data Isolation Bug
**Impact**: Critical security issue if User A can access User B's todos
**Likelihood**: Medium (easy to forget user_id filter)
**Mitigation**: Always use `filter(Todo.user_id == current_user)` pattern; test with 2 users immediately
**Testing**: Manual test case: Create 2 users, add todos for each, verify isolation

### Risk 4: Password Stored in Plain Text
**Impact**: Critical security vulnerability if database leaked
**Likelihood**: Low (passlib used correctly)
**Mitigation**: Code review to verify password_hash only (never password field); test by inspecting database
**Testing**: Query users table, verify password_hash starts with $2b$ (bcrypt marker)

### Risk 5: Frontend JWT Token Theft (XSS)
**Impact**: If attacker injects script, can steal JWT from localStorage
**Likelihood**: Low for Phase 2 (simple app, no user-generated HTML)
**Mitigation**: Sanitize all user inputs (title); Next.js escapes by default
**Acceptance**: localStorage acceptable for Phase 2; httpOnly cookies deferred to future phase

## Plan Completeness Checklist

- ✅ Technical context fully specified (FastAPI, Next.js, SQLite/Neon, Python 3.8+, Node 18+)
- ✅ Constitution Check passed for all 9 principles
- ✅ Project structure defined (phase-2/backend/, phase-2/frontend/)
- ✅ Design decisions documented with rationale (database, auth, API design, frontend, data isolation, error handling)
- ✅ Dependencies listed (backend requirements.txt, frontend package.json)
- ✅ Database schema specified (users, todos tables with SQL)
- ✅ Build and run commands documented
- ✅ Environment variables specified (.env templates)
- ✅ Verification strategy for incremental development
- ✅ Risks identified with mitigations (5 risks analyzed)
- ✅ No placeholders or "NEEDS CLARIFICATION" markers
- ✅ No scope expansion beyond spec
- ✅ All decisions traceable to spec requirements

**Status**: Ready for Task Definition Phase (Phase 3 per constitution workflow)

**Next Step**: Run `/sp.tasks` to generate actionable task breakdown with file paths, dependencies, and success criteria organized by user story.
