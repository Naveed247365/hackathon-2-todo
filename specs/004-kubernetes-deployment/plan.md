# Implementation Plan: Containerization and Local Kubernetes Deployment

**Branch**: `004-kubernetes-deployment` | **Date**: 2026-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-kubernetes-deployment/spec.md`

## Summary

Phase 4 containerizes the existing Phase 2 backend (FastAPI), Phase 2 frontend (Next.js), and Phase 3 MCP server (Flask) for local Kubernetes deployment using Minikube. This is pure infrastructure work with **zero application logic changes**. The goal is to make all three services runnable in Docker containers and deployable to local Kubernetes while maintaining 100% feature parity with non-containerized versions.

**Technical Approach**:
- Multi-stage Docker builds to minimize image sizes
- Environment-based configuration using Kubernetes ConfigMaps and Secrets
- Stateless architecture (Constitution Principle V compliance)
- External Neon PostgreSQL database (no database containerization)
- Kubernetes manifests for Deployments and Services
- Service discovery via Kubernetes DNS
- Local-only deployment (Minikube, no cloud)

## Technical Context

**Language/Version**:
- Backend: Python 3.11+
- Frontend: Node.js 18+ (Next.js 13+)
- MCP Server: Python 3.11+

**Primary Dependencies**:
- Backend: FastAPI, SQLAlchemy, psycopg2-binary, python-jose (JWT)
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- MCP Server: Flask, OpenAI SDK, python-dotenv
- Infrastructure: Docker, Kubernetes (Minikube), kubectl

**Storage**:
- External PostgreSQL (Neon managed database)
- No persistent volumes for application state (stateless services)

**Testing**:
- Container build validation (docker build succeeds)
- Container runtime validation (health checks pass)
- Kubernetes deployment validation (pods running, services accessible)
- Feature parity validation (all Phase 1-3 tests pass in containerized environment)

**Target Platform**:
- Local Kubernetes (Minikube) on Windows/Mac/Linux
- Docker Desktop required for local development
- x86_64 architecture (standard Intel/AMD processors)

**Project Type**: Multi-service web application (backend + frontend + AI server)

**Performance Goals**:
- Docker image builds complete in under 5 minutes total
- Container startup time under 30 seconds per service
- Kubernetes deployment completes in under 2 minutes
- Feature parity with non-containerized version (within 10% performance variance)

**Constraints**:
- Local Kubernetes only (Minikube) - no cloud deployment
- No application code changes (FR-001 to FR-030 all infrastructure-focused)
- External database must remain accessible (Neon PostgreSQL)
- All services must be stateless (Constitution Principle V)
- Must support local development workflow

**Scale/Scope**:
- 3 services to containerize (backend, frontend, MCP server)
- 3 Dockerfiles to create
- 6 Kubernetes manifests minimum (3 Deployments + 3 Services)
- 2 ConfigMaps (non-sensitive config)
- 1 Secret (database credentials, API keys)
- Single replica per service (local development)

---

## Constitution Check

*GATE: Must pass before implementation. Re-check after design decisions.*

### Principle I: Spec-First Development ✅
- **Status**: PASS
- **Evidence**: Complete specification at `specs/004-kubernetes-deployment/spec.md` with 30 functional requirements, 10 success criteria, 4 user stories
- **Action**: None required

### Principle II: Phase Discipline ✅
- **Status**: PASS
- **Evidence**: Following proper workflow: Specification (complete) → Planning (this document) → Tasks (next) → Implementation
- **Action**: None required

### Principle III: Clear Exit Criteria ✅
- **Status**: PASS
- **Evidence**: Specification defines 10 measurable success criteria (SC-001 to SC-010) and explicit exit criteria in spec input
- **Action**: Validate all success criteria during implementation phase

### Principle IV: Domain Consistency ✅
- **Status**: PASS
- **Evidence**: Phase 4 makes **zero changes** to todo domain logic (SL-001 to SL-005 in constraints). All todo entity structures, validation rules, and state transitions remain unchanged from Phase 1-3.
- **Action**: Verify no domain logic changes during code review

### Principle V: Stateless Services, Database as Source of Truth ✅
- **Status**: PASS
- **Evidence**:
  - All services designed stateless (FR-018, TC-003)
  - External Neon PostgreSQL remains source of truth (TC-002, DA-002)
  - No persistent volumes for application state
  - Horizontally scalable design (single replica for local, but supports scaling)
- **Action**: Verify no session state stored in containers

### Principle VI: MCP Tool Constraint ✅
- **Status**: PASS (N/A for Phase 4)
- **Evidence**: Phase 4 is infrastructure work. MCP tools already implemented in Phase 3 and remain unchanged (SL-003).
- **Action**: None required (no MCP tool changes)

### Principle VII: Cloud-Native Readiness ✅
- **Status**: PASS
- **Evidence**:
  - Dockerfiles required (FR-001)
  - Environment variables for all configuration (FR-006, FR-020 to FR-024)
  - Health check endpoints required (FR-010, FR-015)
  - Logs to stdout/stderr (container best practice, will be implemented)
  - Graceful shutdown handling (will be implemented with SIGTERM)
  - Resource limits documented (FR-014)
- **Action**: Implement all cloud-native patterns during containerization

### Principle VIII: Process Over Features ✅
- **Status**: PASS
- **Evidence**: Phase 4 demonstrates rigorous process with comprehensive specification, architectural planning, and zero feature scope creep (all features explicitly out of scope in spec)
- **Action**: None required

### Principle IX: Phase-Based Folder Organization ✅
- **Status**: PASS
- **Evidence**: Phase 4 artifacts will be created in `phase-4/` directory at repository root
- **Action**: Create `phase-4/` directory and organize all implementation artifacts there

**CONSTITUTION CHECK RESULT**: ✅ **ALL PRINCIPLES PASS** - Ready to proceed

---

## Project Structure

### Documentation (this feature)

```text
specs/004-kubernetes-deployment/
├── spec.md                    # Feature specification (complete)
├── plan.md                    # This file (architecture & design)
├── tasks.md                   # Task breakdown (next step via /sp.tasks)
├── checklists/
│   └── requirements.md        # Specification quality checklist (complete)
└── contracts/                 # API contracts (N/A - no API changes)
```

### Source Code (repository root)

```text
phase-4/                              # Phase 4 implementation directory
├── docker/                           # Docker build context
│   ├── backend/
│   │   ├── Dockerfile                # Multi-stage build for FastAPI backend
│   │   └── .dockerignore             # Exclude unnecessary files
│   ├── frontend/
│   │   ├── Dockerfile                # Multi-stage build for Next.js frontend
│   │   └── .dockerignore             # Exclude node_modules, .next, etc.
│   └── mcp-server/
│       ├── Dockerfile                # Multi-stage build for Flask MCP server
│       └── .dockerignore             # Exclude unnecessary files
├── kubernetes/                       # Kubernetes manifests
│   ├── configmap.yaml                # Non-sensitive configuration
│   ├── secret.yaml                   # Sensitive data (database credentials, API keys)
│   ├── backend-deployment.yaml       # Backend Deployment manifest
│   ├── backend-service.yaml          # Backend Service manifest
│   ├── frontend-deployment.yaml      # Frontend Deployment manifest
│   ├── frontend-service.yaml         # Frontend Service manifest
│   ├── mcp-deployment.yaml           # MCP server Deployment manifest
│   └── mcp-service.yaml              # MCP server Service manifest
├── scripts/                          # Deployment automation
│   ├── build-images.sh               # Build all Docker images
│   ├── deploy-minikube.sh            # Deploy to Minikube
│   ├── teardown.sh                   # Remove all Kubernetes resources
│   └── verify-deployment.sh          # Validate deployment success
├── env-templates/                    # Environment variable templates
│   ├── backend.env.example           # Backend environment variables
│   ├── frontend.env.example          # Frontend environment variables
│   └── mcp-server.env.example        # MCP server environment variables
├── README.md                         # Phase 4 setup and deployment guide
└── DEPLOYMENT_GUIDE.md               # Step-by-step Kubernetes deployment instructions

# Existing phase directories (unchanged)
phase-1/                              # Console-based todo app (no changes)
phase-2/                              # Web-based todo app (source code unchanged)
├── backend/                          # FastAPI backend (Dockerfile references this)
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── auth.py
│   ├── schemas.py
│   ├── routers/
│   │   ├── auth.py
│   │   └── todos.py
│   ├── requirements.txt              # Backend dependencies
│   └── .env.example                  # Backend environment template
└── frontend/                         # Next.js frontend (Dockerfile references this)
    ├── pages/
    ├── components/
    ├── styles/
    ├── package.json                  # Frontend dependencies
    └── .env.local.example            # Frontend environment template

phase-3/                              # AI-driven chatbot (source code unchanged)
└── mcp-server/                       # Flask MCP server (Dockerfile references this)
    ├── server.py
    ├── requirements.txt              # MCP server dependencies
    └── .env.example                  # MCP server environment template

specs/                                # All specifications (shared)
.specify/                             # Constitution and templates (shared)
history/                              # PHRs and ADRs (shared)
```

**Structure Decision**: Phase 4 uses a dedicated `phase-4/` directory containing all containerization and Kubernetes artifacts (Dockerfiles, manifests, scripts). This approach:
- Keeps Phase 2 and Phase 3 source code completely unchanged (satisfies SL-001 to SL-005)
- Provides clear separation between application code (phase-2/, phase-3/) and infrastructure code (phase-4/)
- Enables independent evolution of deployment strategy without touching application code
- Follows Constitution Principle IX (Phase-Based Folder Organization)
- Dockerfiles reference source code in phase-2/ and phase-3/ directories using build context paths

---

## Complexity Tracking

**No constitution violations to justify** - all principles pass without exceptions.

---

## Phase 0: Research & Discovery

### Research Areas

#### R1: Docker Multi-Stage Build Patterns

**Goal**: Identify optimal multi-stage build patterns for Python (FastAPI, Flask) and Node.js (Next.js) to minimize final image sizes.

**Key Questions**:
- What base images should we use? (python:3.11-slim vs python:3.11-alpine)
- How do we structure build stages for dependency installation vs runtime?
- How do we handle Next.js build artifacts efficiently?
- What files should be excluded via .dockerignore?

**Research Tasks**:
- Review Docker best practices for Python applications
- Review Next.js official Dockerfile recommendations
- Identify security best practices (non-root user, minimal attack surface)
- Document recommended base images and build patterns

**Expected Outcomes**:
- Documented Dockerfile template for FastAPI/Flask (Python)
- Documented Dockerfile template for Next.js
- .dockerignore patterns for each service type
- Base image recommendations with rationale

---

#### R2: Kubernetes Resource Configuration

**Goal**: Determine appropriate resource limits, health check configurations, and replica strategies for local Minikube deployment.

**Key Questions**:
- What CPU/memory limits are appropriate for local development (8GB RAM machine)?
- How should liveness and readiness probes be configured for each service?
- What health check endpoints do the services expose?
- What startup ordering/dependencies exist between services?

**Research Tasks**:
- Review existing Phase 2/3 code for health check endpoints (or plan to add them)
- Calculate reasonable resource limits for 3 services on local Minikube
- Identify service dependencies (frontend depends on backend and MCP server)
- Document recommended probe configurations

**Expected Outcomes**:
- Resource limit recommendations (CPU, memory) for each service
- Health check endpoint paths and configurations
- Service dependency graph
- Probe timing recommendations (initialDelaySeconds, periodSeconds, etc.)

---

#### R3: Environment Variable Mapping

**Goal**: Map all existing environment variables from Phase 2 and Phase 3 to Kubernetes ConfigMaps and Secrets.

**Key Questions**:
- What environment variables does the backend require? (DATABASE_URL, JWT_SECRET, etc.)
- What environment variables does the frontend require? (NEXT_PUBLIC_API_URL, etc.)
- What environment variables does the MCP server require? (OPENROUTER_API_KEY, etc.)
- Which variables are sensitive (Secrets) vs non-sensitive (ConfigMaps)?

**Research Tasks**:
- Read backend .env.example and identify all required variables
- Read frontend .env.local.example and identify all required variables
- Read MCP server .env.example and identify all required variables
- Categorize each variable as sensitive (Secret) or non-sensitive (ConfigMap)

**Expected Outcomes**:
- Complete environment variable inventory for all 3 services
- Categorization: ConfigMap variables vs Secret variables
- Default values for non-sensitive variables
- Template structure for Kubernetes ConfigMap and Secret manifests

---

#### R4: Service Networking Strategy

**Goal**: Design Kubernetes service networking to enable frontend→backend, frontend→MCP server, and backend→database communication.

**Key Questions**:
- How will frontend discover backend service? (Kubernetes DNS name)
- How will frontend discover MCP server service? (Kubernetes DNS name)
- What service type should frontend use for external access? (NodePort vs LoadBalancer)
- What service type should backend and MCP server use? (ClusterIP for internal only)
- How will containerized services reach external Neon database? (external connectivity)

**Research Tasks**:
- Document Kubernetes service DNS naming pattern (e.g., `backend-service.default.svc.cluster.local`)
- Identify port mappings for each service (backend: 8000, frontend: 3000, MCP: 5000)
- Determine external access strategy for frontend (NodePort for Minikube)
- Verify network connectivity from Minikube to external internet (Neon database, OpenRouter API)

**Expected Outcomes**:
- Service DNS name patterns
- Port mapping table (container port → service port → NodePort if applicable)
- Network diagram showing service-to-service communication
- External connectivity validation plan

---

### Research Deliverables

Upon completion of Phase 0 research, create:
- `specs/004-kubernetes-deployment/research.md` documenting all findings
- Dockerfile templates for each service type
- Kubernetes manifest templates with recommended configurations
- Environment variable mapping table

**Exit Criteria for Phase 0**:
- All 4 research areas (R1-R4) completed with documented findings
- Docker base images selected with rationale
- Resource limits defined for all services
- Environment variables categorized (ConfigMap vs Secret)
- Service networking strategy documented
- No unresolved technical questions blocking implementation

---

## Phase 1: Design & Architecture

### Data Model

**N/A for Phase 4**: No database schema changes. Phase 4 uses existing Phase 2 PostgreSQL schema hosted on Neon. All domain entities (User, Todo) remain unchanged per Constitution Principle IV (Domain Consistency) and constraint SL-004 (no database schema changes).

**Database Connectivity**:
- Backend container connects to external Neon PostgreSQL via `DATABASE_URL` environment variable
- Connection string format: `postgresql://user:password@host:port/database`
- Provided via Kubernetes Secret (sensitive data)

---

### API Contracts

**N/A for Phase 4**: No API changes. Phase 4 maintains 100% API compatibility with Phase 2 backend per constraints SL-001 (no backend endpoint changes) and FR-028 (all services maintain Phase 1-3 functionality).

**API Endpoints** (existing, unchanged):
- **Backend**: `/api/auth/*`, `/api/todos/*` (Phase 2)
- **MCP Server**: `/chat` (Phase 3)
- **Frontend**: Next.js pages (no API changes)

**Container-Specific Endpoints** (new):
- **Backend Health Check**: `GET /health` (to be added for FR-010 compliance)
- **Frontend Health Check**: `GET /api/health` (to be added for FR-010 compliance)
- **MCP Server Health Check**: `GET /health` (to be added for FR-010 compliance)

---

### Architecture Decisions

#### AD-001: Docker Multi-Stage Build Strategy

**Decision**: Use multi-stage builds with separate builder and runtime stages for all three services.

**Rationale**:
- Minimizes final image size by excluding build tools from runtime (FR-004)
- Separates dependency installation from application runtime
- Reduces attack surface by using minimal runtime base images
- Improves build caching and speeds up rebuilds

**Approach**:
- **Backend/MCP Server (Python)**:
  - Stage 1 (builder): `python:3.11-slim` with pip, install all requirements.txt dependencies
  - Stage 2 (runtime): `python:3.11-slim`, copy only installed packages and application code
  - Non-root user: `appuser` (FR-005)

- **Frontend (Next.js)**:
  - Stage 1 (dependencies): `node:18-alpine`, install package.json dependencies
  - Stage 2 (builder): Build Next.js production bundle with `npm run build`
  - Stage 3 (runtime): `node:18-alpine`, copy only build artifacts and production dependencies
  - Non-root user: `nextjs` (FR-005)

**Trade-offs**:
- Slightly more complex Dockerfile structure
- Build time remains fast due to layer caching
- Significant reduction in final image size (50-70% smaller)

**Alternatives Considered**:
- Single-stage builds: Rejected due to larger image sizes and unnecessary build dependencies in production
- Alpine-only base images: Considered but slim images provide better compatibility (especially for Python psycopg2)

---

#### AD-002: Environment Configuration Strategy

**Decision**: Use Kubernetes ConfigMaps for non-sensitive configuration and Secrets for sensitive data, injected as environment variables.

**Rationale**:
- Satisfies FR-020 to FR-024 (ConfigMap and Secret requirements)
- Enables configuration changes without image rebuilds (FR-024)
- Follows Kubernetes best practices
- Supports Constitution Principle VII (Cloud-Native Readiness)

**ConfigMap Variables** (non-sensitive):
- Backend service URLs (e.g., `BACKEND_SERVICE_URL=http://backend-service:8000`)
- MCP service URLs (e.g., `MCP_SERVICE_URL=http://mcp-service:5000`)
- Frontend public API URLs (e.g., `NEXT_PUBLIC_API_URL=http://localhost:30000`)
- Service ports, timeouts, feature flags

**Secret Variables** (sensitive):
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Backend JWT signing key
- `OPENROUTER_API_KEY`: MCP server API key for OpenRouter

**Injection Method**: Environment variables (envFrom in Deployment manifests)

**Trade-offs**:
- Requires pod restart to pick up ConfigMap/Secret changes
- Secrets base64-encoded but not encrypted at rest in basic Minikube (acceptable for local development)

**Alternatives Considered**:
- Volume-mounted configs: Rejected as less convenient for 12-factor apps
- External secret management (Vault): Out of scope per spec (basic setup only)

---

#### AD-003: Service Networking and Discovery

**Decision**: Use ClusterIP services for backend and MCP server (internal only), NodePort service for frontend (external access), Kubernetes DNS for service discovery.

**Rationale**:
- ClusterIP provides internal networking for backend/MCP without external exposure (security)
- NodePort enables external access to frontend on Minikube (FR-017, DA-003)
- Kubernetes DNS enables services to find each other by name (FR-025, FR-026)
- Simplifies configuration (no hardcoded IP addresses)

**Service DNS Names**:
- Backend: `backend-service.default.svc.cluster.local` (or short: `backend-service`)
- MCP Server: `mcp-service.default.svc.cluster.local` (or short: `mcp-service`)
- Frontend: `frontend-service.default.svc.cluster.local` (external NodePort)

**Port Mappings**:
- Backend: Container 8000 → Service 8000 → ClusterIP only
- Frontend: Container 3000 → Service 3000 → NodePort 30000 (example)
- MCP Server: Container 5000 → Service 5000 → ClusterIP only

**External Access**:
- Users access frontend via `http://localhost:30000` (or Minikube IP + NodePort)
- Frontend makes API calls to `http://backend-service:8000` from within cluster
- Frontend makes MCP calls to `http://mcp-service:5000` from within cluster

**Trade-offs**:
- NodePort requires knowing the assigned port (can be fixed or dynamic)
- LoadBalancer not available in Minikube without additional setup (acceptable per DA-003)

**Alternatives Considered**:
- Ingress controller: Deferred as out of scope (spec: "no ingress controller beyond basic setup")
- Port-forwarding: Could be used as alternative but NodePort is more convenient

---

#### AD-004: Stateless Architecture Implementation

**Decision**: Ensure all services are completely stateless with no in-memory session storage or local file persistence.

**Rationale**:
- Satisfies Constitution Principle V (Stateless Services)
- Satisfies FR-018 (no persistent volumes for application state)
- Enables horizontal scaling in future
- Simplifies pod restarts and rollouts

**Implementation**:
- **Backend**: Already stateless (JWT tokens for auth, database for all state)
- **Frontend**: Already stateless (server-side rendering, no session storage)
- **MCP Server**: Already stateless (no conversation history per Phase 3 design)
- **Database**: External Neon PostgreSQL (not containerized per TC-002)

**Verification**:
- Pod restarts must not lose any user data (SC-006)
- Multiple replicas (if scaled) must be interchangeable
- No shared volumes between pods

**Trade-offs**:
- Cannot add conversation history or session caching in Phase 4 (deferred to future phases)

**Alternatives Considered**:
- Persistent volumes for session storage: Rejected due to Constitution Principle V violation

---

#### AD-005: Health Check Implementation

**Decision**: Add `/health` endpoints to all services for Kubernetes liveness and readiness probes.

**Rationale**:
- Satisfies FR-010 (health check endpoints required)
- Satisfies FR-015 (liveness and readiness probes required)
- Enables Kubernetes to automatically restart failed containers
- Provides deployment verification mechanism

**Health Check Endpoints**:
- **Backend**: `GET /health` → Returns `{"status": "healthy"}` if app running
- **Frontend**: `GET /api/health` → Returns `{"status": "healthy"}` if Next.js server running
- **MCP Server**: `GET /health` → Returns `{"status": "healthy"}` if Flask app running

**Probe Configuration**:
- **Liveness Probe**: Checks if container should be restarted (failure = restart pod)
- **Readiness Probe**: Checks if container is ready to receive traffic (failure = remove from service)
- Initial delay: 10-15 seconds (allow time for application startup)
- Period: 10 seconds (check every 10 seconds)
- Timeout: 5 seconds
- Failure threshold: 3 consecutive failures before action

**Trade-offs**:
- Requires minor code changes to add health endpoints (minimal, infrastructure-focused)

**Alternatives Considered**:
- TCP socket probes: Less informative than HTTP health checks
- Exec probes: More overhead than HTTP probes

---

#### AD-006: Build and Deployment Automation

**Decision**: Provide shell scripts for building images, deploying to Minikube, and verifying deployment.

**Rationale**:
- Satisfies SC-004 (deploy with single command)
- Reduces human error in deployment process
- Provides repeatable deployment workflow
- Demonstrates proper DevOps practices for hackathon judging

**Scripts**:
1. **`build-images.sh`**: Builds all 3 Docker images with consistent tagging
2. **`deploy-minikube.sh`**: Applies all Kubernetes manifests in correct order (ConfigMap → Secret → Deployments → Services)
3. **`verify-deployment.sh`**: Checks pod status, service endpoints, health checks
4. **`teardown.sh`**: Deletes all Kubernetes resources for clean slate

**Image Tagging Strategy**:
- Format: `todo-{service}:{version}` (e.g., `todo-backend:v1.0.0`, `todo-frontend:v1.0.0`)
- Version: Align with git commit hash or semantic version
- Local registry: Minikube's Docker daemon (no external registry needed)

**Trade-offs**:
- Shell scripts not Windows-native (provide .bat equivalents or WSL instructions)

**Alternatives Considered**:
- Makefile: Could be used but shell scripts are more accessible
- Helm charts: Out of scope for Phase 4 (spec says "manifests or Helm", choosing manifests for simplicity)

---

### Architecture Summary

**Infrastructure Pattern**: Container orchestration with local Kubernetes

**Key Components**:
1. **Docker Images**: 3 multi-stage builds (backend, frontend, MCP server)
2. **Kubernetes Deployments**: 3 deployments managing pod replicas
3. **Kubernetes Services**: 3 services (2 ClusterIP, 1 NodePort)
4. **Configuration**: 1 ConfigMap + 1 Secret
5. **Automation**: 4 shell scripts for build/deploy/verify/teardown

**Data Flow**:
```
User Browser
    ↓ HTTP (port 30000)
Frontend Pod (Next.js)
    ↓ HTTP (backend-service:8000)
Backend Pod (FastAPI)
    ↓ PostgreSQL (external Neon)
Database (Neon PostgreSQL)

User Browser → Frontend
    ↓ HTTP (mcp-service:5000)
MCP Server Pod (Flask)
    ↓ HTTPS (api.openrouter.ai)
OpenRouter API
```

**Deployment Flow**:
```
1. Build Docker images (build-images.sh)
2. Load images into Minikube (or use Minikube Docker daemon)
3. Create ConfigMap and Secret (kubectl apply)
4. Create Deployments (kubectl apply)
5. Create Services (kubectl apply)
6. Verify pods running (verify-deployment.sh)
7. Access frontend via NodePort
```

---

## Phase 2: Quickstart Guide

### Prerequisites

**Required Software**:
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Minikube (latest version)
- kubectl CLI (latest version)
- Git (for cloning repository)

**System Requirements**:
- 8GB RAM minimum
- 20GB free disk space
- x86_64 processor
- Internet connection (for Neon database and OpenRouter API)

**Verification Commands**:
```bash
docker --version        # Should be 20.10+ or newer
minikube version        # Should be v1.30+ or newer
kubectl version         # Should be v1.26+ or newer
```

---

### Local Development Setup

#### Step 1: Start Minikube

```bash
# Start Minikube with sufficient resources
minikube start --cpus=4 --memory=6144 --driver=docker

# Verify Minikube is running
minikube status

# Configure kubectl to use Minikube context
kubectl config use-context minikube
```

---

#### Step 2: Configure Environment Variables

```bash
# Navigate to phase-4 directory
cd E:/hackathon 2/todos/phase-4

# Copy environment templates
cp env-templates/backend.env.example env-templates/backend.env
cp env-templates/frontend.env.example env-templates/frontend.env
cp env-templates/mcp-server.env.example env-templates/mcp-server.env

# Edit env files with actual credentials
# - backend.env: Set DATABASE_URL (Neon connection string), JWT_SECRET
# - frontend.env: Set NEXT_PUBLIC_API_URL (will be updated after deployment)
# - mcp-server.env: Set OPENROUTER_API_KEY

# IMPORTANT: These env files are used to create Kubernetes Secret and ConfigMap
```

---

#### Step 3: Build Docker Images

```bash
# Use Minikube's Docker daemon (avoids pushing to external registry)
eval $(minikube docker-env)

# Build all images (runs build-images.sh)
cd E:/hackathon 2/todos/phase-4
./scripts/build-images.sh

# Verify images built successfully
docker images | grep todo-
# Should see: todo-backend, todo-frontend, todo-mcp-server
```

---

#### Step 4: Create Kubernetes Secret and ConfigMap

```bash
# Create Secret from environment variables
kubectl create secret generic todo-secrets \
  --from-env-file=env-templates/backend.env \
  --from-env-file=env-templates/mcp-server.env

# Create ConfigMap from environment variables
kubectl create configmap todo-config \
  --from-env-file=env-templates/frontend.env

# Verify created
kubectl get secret todo-secrets
kubectl get configmap todo-config
```

**Note**: Alternatively, Secret and ConfigMap can be created from YAML manifests in `kubernetes/` directory.

---

#### Step 5: Deploy to Minikube

```bash
# Deploy all services (runs deploy-minikube.sh)
cd E:/hackathon 2/todos/phase-4
./scripts/deploy-minikube.sh

# Wait for pods to become ready
kubectl get pods -w
# Watch until all 3 pods show "Running" status and READY "1/1"

# Verify deployments
kubectl get deployments
# Should see: backend-deployment, frontend-deployment, mcp-deployment

# Verify services
kubectl get services
# Should see: backend-service (ClusterIP), frontend-service (NodePort), mcp-service (ClusterIP)
```

---

#### Step 6: Access the Application

```bash
# Get frontend NodePort
kubectl get service frontend-service -o jsonpath='{.spec.ports[0].nodePort}'
# Example output: 30000

# Get Minikube IP
minikube ip
# Example output: 192.168.49.2

# Access frontend in browser
# URL: http://<minikube-ip>:<node-port>
# Example: http://192.168.49.2:30000

# Alternatively, use Minikube service command (opens browser automatically)
minikube service frontend-service
```

---

#### Step 7: Verify Deployment

```bash
# Run verification script
cd E:/hackathon 2/todos/phase-4
./scripts/verify-deployment.sh

# Manual verification commands
kubectl logs deployment/backend-deployment    # Check backend logs
kubectl logs deployment/frontend-deployment   # Check frontend logs
kubectl logs deployment/mcp-deployment        # Check MCP server logs

# Test health endpoints
kubectl port-forward deployment/backend-deployment 8000:8000
curl http://localhost:8000/health
# Should return: {"status": "healthy"}

# Test database connectivity (via backend logs or API call)
# Login and create todo via frontend UI to verify end-to-end flow
```

---

### Teardown and Cleanup

```bash
# Remove all Kubernetes resources
cd E:/hackathon 2/todos/phase-4
./scripts/teardown.sh

# Or manually delete resources
kubectl delete deployment backend-deployment frontend-deployment mcp-deployment
kubectl delete service backend-service frontend-service mcp-service
kubectl delete secret todo-secrets
kubectl delete configmap todo-config

# Stop Minikube (optional)
minikube stop

# Delete Minikube cluster (optional, complete cleanup)
minikube delete
```

---

### Troubleshooting

**Issue: Pods stuck in "ImagePullBackOff" or "ErrImagePull"**
- **Cause**: Minikube cannot find Docker images
- **Solution**: Ensure you ran `eval $(minikube docker-env)` before building images, or load images into Minikube: `minikube image load todo-backend:v1.0.0`

**Issue: Pods stuck in "CrashLoopBackOff"**
- **Cause**: Container failing to start (missing env vars, database unreachable, etc.)
- **Solution**: Check logs with `kubectl logs <pod-name>`, verify Secret/ConfigMap, test database connectivity

**Issue: Frontend cannot reach backend or MCP server**
- **Cause**: Service networking misconfiguration or DNS not working
- **Solution**: Verify services exist (`kubectl get svc`), check DNS resolution from frontend pod (`kubectl exec -it <frontend-pod> -- nslookup backend-service`)

**Issue: Database connection fails from backend**
- **Cause**: Neon database not accessible from Minikube
- **Solution**: Verify DATABASE_URL is correct, check firewall settings, test connection from host machine first

**Issue: Health checks failing**
- **Cause**: Health endpoints not responding or configured incorrectly
- **Solution**: Check pod logs for errors, verify health endpoint paths in Deployment manifests match actual code

---

## Exit Criteria for Planning Phase

Before proceeding to `/sp.tasks`:

- [x] All architecture decisions documented (AD-001 to AD-006)
- [x] Research areas identified (R1-R4)
- [x] Dockerfile strategies defined
- [x] Kubernetes manifest structure designed
- [x] Environment variable mapping planned
- [x] Service networking strategy documented
- [x] Health check implementation designed
- [x] Build and deployment automation planned
- [x] Constitution Check passed (all 9 principles)
- [x] Project structure defined (phase-4/ directory layout)
- [x] Quickstart guide provided
- [x] No unresolved technical questions

**Plan Status**: ✅ **COMPLETE** - Ready for `/sp.tasks` to generate actionable task breakdown

---

## Notes for Implementation Phase

**Critical Constraints to Enforce**:
- **Zero Application Logic Changes**: Dockerfiles must not modify Phase 2/3 source code
- **Feature Parity**: All Phase 1-3 functionality must work identically in containers
- **Stateless Architecture**: No persistent volumes, no session storage
- **Local Only**: No cloud deployment, no external registries (use Minikube Docker daemon)

**Success Validation**:
- All 10 success criteria (SC-001 to SC-010) must be verified
- All 4 user stories (P1-P4) must be tested
- All 8 edge cases must be validated
- Constitution compliance must be maintained

**Next Steps**:
1. Run `/sp.tasks` to generate task breakdown
2. Execute tasks in dependency order
3. Validate each task against success criteria
4. Create pull request with reference to spec
5. Merge after all tests pass
