# Web-Based Todo Application (Phase 2)

A multi-user web-based todo application with FastAPI backend and Next.js frontend, built following strict Spec-Driven Development (SDD) principles.

## Features

- **Multi-user support** with user registration and login
- **JWT authentication** (stateless, token-based)
- **Full CRUD operations** for todos (create, read, update, complete, delete)
- **Data isolation** - each user can only access their own todos
- **Database persistence** - SQLite (local) or Neon PostgreSQL (cloud)
- **RESTful API** design with standard HTTP status codes
- **Simple, functional UI** - no advanced styling frameworks

## Architecture

- **Backend**: FastAPI (Python 3.8+) on port 8000
- **Frontend**: Next.js (React 18+) on port 3000
- **Database**: SQLite or PostgreSQL
- **Authentication**: JWT tokens with 24-hour expiration
- **State Management**: localStorage for JWT, React useState for UI

## Requirements

- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

## Installation

### Backend Setup

```bash
cd phase-2/backend
pip install -r requirements.txt

# Copy environment template and configure
cp .env.example .env
# Edit .env and set JWT_SECRET to a secure random string
```

### Frontend Setup

```bash
cd phase-2/frontend
npm install

# Copy environment template
cp .env.local.example .env.local
```

## Configuration

### Backend Environment Variables (.env)

```
DATABASE_URL=sqlite:///./todos.db
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24
CORS_ORIGINS=http://localhost:3000
```

### Frontend Environment Variables (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running the Application

### Start Backend

```bash
cd phase-2/backend
uvicorn main:app --reload --port 8000
```

Backend will be available at http://localhost:8000
API documentation at http://localhost:8000/docs

### Start Frontend

```bash
cd phase-2/frontend
npm run dev
```

Frontend will be available at http://localhost:3000

## Usage

### 1. Sign Up

- Visit http://localhost:3000/signup
- Enter email and password (min 8 characters)
- Click "Sign Up"
- You'll be automatically logged in and redirected to todos page

### 2. Login

- Visit http://localhost:3000/login
- Enter your email and password
- Click "Login"
- You'll be redirected to todos page with JWT token

### 3. Manage Todos

- **Create**: Enter title in input field and click "Add Todo"
- **List**: All your todos are displayed automatically
- **Complete**: Click "Complete" button to mark todo as done
- **Edit**: Click "Edit" button, enter new title in prompt
- **Delete**: Click "Delete" button and confirm

### 4. Logout

- Click "Logout" button on todos page
- JWT token is removed and you're redirected to login

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate and get JWT token

### Todos (require Authorization header with JWT)

- `POST /api/todos` - Create new todo
- `GET /api/todos` - List user's todos (filtered by user_id)
- `PATCH /api/todos/{id}/complete` - Mark todo as completed
- `PATCH /api/todos/{id}` - Update todo title
- `DELETE /api/todos/{id}` - Delete todo

### Monitoring

- `GET /health` - Health check endpoint

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Todos Table

```sql
CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (status IN ('pending', 'completed'))
);
CREATE INDEX idx_todos_user_id ON todos(user_id);
```

## Domain Rules

### User Entity
- Email must be unique
- Password minimum 8 characters
- Passwords hashed with bcrypt (never stored in plain text)

### Todo Entity (consistent with Phase 1)
- Title required, non-empty, max 500 characters
- Status: "pending" (default) or "completed"
- State transition: pending → completed (no reverse)
- Auto-incrementing IDs

### Data Isolation
- Each todo associated with exactly one user (user_id)
- Users can only view/modify their own todos
- Ownership verified on all update/complete/delete operations (403 if not owner)

## Security

- **JWT Tokens**: Contain user_id, expire after 24 hours
- **Password Hashing**: Bcrypt with passlib
- **Data Isolation**: Database queries always filter by user_id from JWT
- **Ownership Checks**: 403 Forbidden if user tries to access another user's todo
- **CORS**: Configured for localhost:3000 only

## Testing

Manual acceptance testing:

### Test Data Isolation

1. Sign up as user1@test.com
2. Create 3 todos for user1
3. Logout
4. Sign up as user2@test.com
5. Create 2 todos for user2
6. Verify user2 sees only their 2 todos (not user1's 3 todos)
7. Login as user1
8. Verify user1 still sees their 3 todos

### Test Complete CRUD Cycle

1. Sign up / login
2. Create todo "Buy groceries"
3. Create todo "Write code"
4. Mark "Buy groceries" as completed
5. Update "Write code" to "Review code"
6. Delete "Buy groceries"
7. Refresh page → Verify changes persist

## Phase 2 Exit Criteria

All exit criteria met:

- ✅ Users can sign up and log in
- ✅ Logged-in users can create, update, delete, complete todos
- ✅ Todos persist in database
- ✅ Frontend communicates with backend via API
- ✅ App runs locally without errors

## Project Structure

```
phase-2/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── models.py            # User and Todo models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # JWT utilities
│   ├── database.py          # Database connection
│   ├── routers/
│   │   ├── auth.py          # Auth endpoints
│   │   └── todos.py         # Todo endpoints
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── pages/
│   │   ├── index.tsx        # Landing page
│   │   ├── signup.tsx       # Signup form
│   │   ├── login.tsx        # Login form
│   │   └── todos.tsx        # Todo management
│   ├── components/
│   │   ├── TodoList.tsx     # Todo display
│   │   └── TodoForm.tsx     # Todo creation
│   ├── lib/
│   │   └── api.ts           # API client
│   ├── types.ts
│   ├── package.json
│   └── .env.local.example
└── README.md                # This file
```

## Constitution Compliance

Phase 2 development strictly followed all 9 constitution principles:

✅ **I. Spec-First**: Complete spec before any code
✅ **II. Phase Discipline**: All phases completed sequentially
✅ **III. Exit Criteria**: All criteria measurable and met
✅ **IV. Domain Consistency**: Phase 1 todo rules maintained, User entity added consistently
✅ **V. Stateless Services**: JWT-based auth, no server sessions
✅ **VI. MCP Tools**: Database operations via SQLAlchemy (acceptable for app code)
✅ **VII. Cloud-Native**: Environment variables used (Docker deferred to Phase 3)
✅ **VIII. Process Over Features**: Rigorous spec/plan/tasks, no scope creep
✅ **IX. Folder Organization**: All files in phase-2/ directory

## Development Process

This application was built following the Hackathon 2 constitution:

1. **Specification Phase**: 5 user stories, 32 functional requirements, API contracts
2. **Planning Phase**: Architecture decisions, database schema, dependencies
3. **Task Definition Phase**: 69 verifiable tasks
4. **Implementation Phase**: Sequential execution with verification
5. **Validation Phase**: Manual acceptance testing

## License

Phase 2 implementation for Hackathon 2 - Spec-Driven Development demonstration.
