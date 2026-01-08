---
description: "Task list for Phase 4: Containerization and Local Kubernetes Deployment"
---

# Tasks: Containerization and Local Kubernetes Deployment

**Input**: Design documents from `/specs/004-kubernetes-deployment/`
**Prerequisites**: plan.md (complete), spec.md (complete)

**Tests**: No automated tests required for Phase 4. Validation is manual (container builds, pod status, health checks, feature parity testing).

**Organization**: Tasks are grouped by user story from spec.md (P1-P4) to enable independent implementation and testing of each deployment stage.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, SETUP, FOUNDATION)
- Include exact file paths in descriptions

## Path Conventions

Phase 4 uses `phase-4/` directory at repository root per Constitution Principle IX:
- **Dockerfiles**: `phase-4/docker/{backend,frontend,mcp-server}/Dockerfile`
- **Kubernetes manifests**: `phase-4/kubernetes/*.yaml`
- **Scripts**: `phase-4/scripts/*.sh`
- **Documentation**: `phase-4/README.md`, `phase-4/DEPLOYMENT_GUIDE.md`
- **Source code**: Remains in `phase-2/` and `phase-3/` directories (NO CHANGES)

---

## Phase 0: Research & Discovery

**Purpose**: Gather information needed for implementation decisions

**Exit Criteria**: All research questions answered, templates documented

- [ ] T001 [P] [R1] Research Docker multi-stage build patterns for Python (FastAPI/Flask)
  - **File**: `specs/004-kubernetes-deployment/research.md` (section: R1)
  - **Success**: Document recommended base images (python:3.11-slim vs alpine), builder/runtime stage patterns, non-root user setup
  - **Dependencies**: None

- [ ] T002 [P] [R1] Research Docker multi-stage build patterns for Node.js (Next.js)
  - **File**: `specs/004-kubernetes-deployment/research.md` (section: R1)
  - **Success**: Document Next.js official Dockerfile recommendations, dependency stage → build stage → runtime stage pattern, node:18-alpine base image
  - **Dependencies**: None

- [ ] T003 [P] [R1] Document .dockerignore patterns for each service type
  - **File**: `specs/004-kubernetes-deployment/research.md` (section: R1)
  - **Success**: Python ignore patterns (*.pyc, __pycache__, .env, etc.), Node.js ignore patterns (node_modules, .next, .git, etc.)
  - **Dependencies**: None

- [ ] T004 [P] [R2] Identify health check endpoints in existing Phase 2/3 code
  - **Files**: Read `phase-2/backend/main.py`, `phase-2/frontend/pages/`, `phase-3/mcp-server/server.py`
  - **Success**: Document whether /health endpoints exist, or plan to add them
  - **Dependencies**: None

- [ ] T005 [P] [R2] Calculate Kubernetes resource limits for local Minikube
  - **File**: `specs/004-kubernetes-deployment/research.md` (section: R2)
  - **Success**: Recommended CPU/memory limits for each service (backend, frontend, MCP server) on 8GB RAM machine
  - **Dependencies**: None

- [ ] T006 [P] [R2] Document liveness and readiness probe configurations
  - **File**: `specs/004-kubernetes-deployment/research.md` (section: R2)
  - **Success**: Probe timing (initialDelaySeconds, periodSeconds, timeoutSeconds, failureThreshold) for each service
  - **Dependencies**: T004

- [ ] T007 [P] [R3] Inventory environment variables from backend .env.example
  - **Files**: Read `phase-2/backend/.env.example`
  - **File**: `specs/004-kubernetes-deployment/research.md` (section: R3, table: Backend Env Vars)
  - **Success**: List all variables, categorize as ConfigMap or Secret, document default values
  - **Dependencies**: None

- [ ] T008 [P] [R3] Inventory environment variables from frontend .env.local.example
  - **Files**: Read `phase-2/frontend/.env.local.example`
  - **File**: `specs/004-kubernetes-deployment/research.md` (section: R3, table: Frontend Env Vars)
  - **Success**: List all variables, categorize as ConfigMap or Secret, document default values
  - **Dependencies**: None

- [ ] T009 [P] [R3] Inventory environment variables from MCP server .env.example
  - **Files**: Read `phase-3/mcp-server/.env.example`
  - **File**: `specs/004-kubernetes-deployment/research.md` (section: R3, table: MCP Env Vars)
  - **Success**: List all variables, categorize as ConfigMap or Secret, document default values
  - **Dependencies**: None

- [ ] T010 [P] [R4] Document Kubernetes service DNS naming and port mappings
  - **File**: `specs/004-kubernetes-deployment/research.md` (section: R4)
  - **Success**: DNS patterns (e.g., backend-service.default.svc.cluster.local), port mapping table (container → service → NodePort)
  - **Dependencies**: None

- [ ] T011 [R0] Create research.md summary document
  - **File**: `specs/004-kubernetes-deployment/research.md`
  - **Success**: Consolidate all research findings (T001-T010) into single document with sections R1-R4
  - **Dependencies**: T001, T002, T003, T004, T005, T006, T007, T008, T009, T010

**Checkpoint**: Research complete - all technical questions answered, templates ready

---

## Phase 1: Setup (Project Structure)

**Purpose**: Create Phase 4 directory structure and basic files

**Exit Criteria**: All directories and template files exist

- [ ] T012 [SETUP] Create phase-4 root directory
  - **Path**: `phase-4/` (at repository root)
  - **Success**: Directory exists
  - **Dependencies**: None

- [ ] T013 [P] [SETUP] Create docker subdirectories
  - **Paths**: `phase-4/docker/backend/`, `phase-4/docker/frontend/`, `phase-4/docker/mcp-server/`
  - **Success**: All 3 directories exist
  - **Dependencies**: T012

- [ ] T014 [P] [SETUP] Create kubernetes directory
  - **Path**: `phase-4/kubernetes/`
  - **Success**: Directory exists
  - **Dependencies**: T012

- [ ] T015 [P] [SETUP] Create scripts directory
  - **Path**: `phase-4/scripts/`
  - **Success**: Directory exists
  - **Dependencies**: T012

- [ ] T016 [P] [SETUP] Create env-templates directory
  - **Path**: `phase-4/env-templates/`
  - **Success**: Directory exists
  - **Dependencies**: T012

- [ ] T017 [P] [SETUP] Create backend environment template
  - **File**: `phase-4/env-templates/backend.env.example`
  - **Success**: Contains all backend environment variables from research (T007) with placeholder values
  - **Dependencies**: T016, T007 (research)

- [ ] T018 [P] [SETUP] Create frontend environment template
  - **File**: `phase-4/env-templates/frontend.env.example`
  - **Success**: Contains all frontend environment variables from research (T008) with placeholder values
  - **Dependencies**: T016, T008 (research)

- [ ] T019 [P] [SETUP] Create MCP server environment template
  - **File**: `phase-4/env-templates/mcp-server.env.example`
  - **Success**: Contains all MCP server environment variables from research (T009) with placeholder values
  - **Dependencies**: T016, T009 (research)

**Checkpoint**: Phase 4 directory structure complete, environment templates ready

---

## Phase 2: Foundational (Docker Images)

**Purpose**: Create Dockerfiles and .dockerignore files for all 3 services (User Story 1 - P1 MVP)

**Exit Criteria**: All Docker images build successfully without errors

### User Story 1 - Docker Container Execution (Priority: P1) 🎯 MVP

**Goal**: Backend, frontend, and MCP server run in Docker containers locally with identical functionality to non-containerized version

**Independent Test**: Build all images, run containers with environment variables, verify services accessible and functional

---

#### Health Check Endpoints (Prerequisite for User Story 1)

- [ ] T020 [P] [US1] Add /health endpoint to backend
  - **File**: `phase-2/backend/main.py`
  - **Success**: `GET /health` returns `{"status": "healthy"}` with 200 status code
  - **Implementation**: Add FastAPI route before existing routes
  - **Dependencies**: T004 (research - confirm endpoint doesn't exist)

- [ ] T021 [P] [US1] Add /api/health endpoint to frontend
  - **File**: `phase-2/frontend/pages/api/health.ts` (create new file)
  - **Success**: `GET /api/health` returns `{"status": "healthy"}` with 200 status code
  - **Implementation**: Next.js API route
  - **Dependencies**: T004 (research - confirm endpoint doesn't exist)

- [ ] T022 [P] [US1] Add /health endpoint to MCP server
  - **File**: `phase-3/mcp-server/server.py`
  - **Success**: `GET /health` returns `{"status": "healthy"}` with 200 status code
  - **Implementation**: Add Flask route before existing routes
  - **Dependencies**: T004 (research - confirm endpoint doesn't exist)

---

#### Backend Docker Image

- [ ] T023 [US1] Create backend .dockerignore
  - **File**: `phase-4/docker/backend/.dockerignore`
  - **Success**: Contains patterns from research (T003): *.pyc, __pycache__, .env, .git, *.md, tests/, .pytest_cache/
  - **Dependencies**: T013, T003 (research)

- [ ] T024 [US1] Create backend Dockerfile (multi-stage build)
  - **File**: `phase-4/docker/backend/Dockerfile`
  - **Success**:
    - Stage 1 (builder): FROM python:3.11-slim, install requirements.txt dependencies
    - Stage 2 (runtime): FROM python:3.11-slim, copy installed packages and app code from phase-2/backend/
    - Non-root user: appuser (UID 1000)
    - EXPOSE 8000
    - CMD runs uvicorn main:app
    - Environment variables configurable (DATABASE_URL, JWT_SECRET via env)
  - **Dependencies**: T023, T001 (research - Python multi-stage pattern), T020 (health endpoint)

- [ ] T025 [US1] Build backend Docker image
  - **Command**: `docker build -t todo-backend:v1.0.0 -f phase-4/docker/backend/Dockerfile .` (context: repo root)
  - **Success**: Build completes without errors, image tagged todo-backend:v1.0.0 exists in `docker images`
  - **Dependencies**: T024

- [ ] T026 [US1] Test backend container locally
  - **Command**: `docker run --rm -p 8000:8000 --env-file phase-2/backend/.env todo-backend:v1.0.0`
  - **Success**:
    - Container starts without errors
    - `curl http://localhost:8000/health` returns {"status": "healthy"}
    - `curl http://localhost:8000/docs` shows FastAPI docs (Swagger UI)
  - **Dependencies**: T025

---

#### Frontend Docker Image

- [ ] T027 [US1] Create frontend .dockerignore
  - **File**: `phase-4/docker/frontend/.dockerignore`
  - **Success**: Contains patterns from research (T003): node_modules, .next, .git, *.md, .env.local, .env*.local, npm-debug.log
  - **Dependencies**: T013, T003 (research)

- [ ] T028 [US1] Create frontend Dockerfile (multi-stage build)
  - **File**: `phase-4/docker/frontend/Dockerfile`
  - **Success**:
    - Stage 1 (dependencies): FROM node:18-alpine, copy package.json/package-lock.json, npm ci
    - Stage 2 (builder): FROM node:18-alpine, copy source from phase-2/frontend/, npm run build
    - Stage 3 (runtime): FROM node:18-alpine, copy build artifacts (.next, public, package.json), npm ci --production
    - Non-root user: nextjs (UID 1001)
    - EXPOSE 3000
    - CMD runs npm start
    - Environment variables configurable (NEXT_PUBLIC_API_URL via env)
  - **Dependencies**: T027, T002 (research - Next.js multi-stage pattern), T021 (health endpoint)

- [ ] T029 [US1] Build frontend Docker image
  - **Command**: `docker build -t todo-frontend:v1.0.0 -f phase-4/docker/frontend/Dockerfile .` (context: repo root)
  - **Success**: Build completes without errors, image tagged todo-frontend:v1.0.0 exists in `docker images`
  - **Dependencies**: T028

- [ ] T030 [US1] Test frontend container locally
  - **Command**: `docker run --rm -p 3000:3000 --env NEXT_PUBLIC_API_URL=http://localhost:8000 todo-frontend:v1.0.0`
  - **Success**:
    - Container starts without errors
    - `curl http://localhost:3000/api/health` returns {"status": "healthy"}
    - Browser at http://localhost:3000 shows login page
  - **Dependencies**: T029

---

#### MCP Server Docker Image

- [ ] T031 [US1] Create MCP server .dockerignore
  - **File**: `phase-4/docker/mcp-server/.dockerignore`
  - **Success**: Contains patterns from research (T003): *.pyc, __pycache__, .env, .git, *.md, .pytest_cache/
  - **Dependencies**: T013, T003 (research)

- [ ] T032 [US1] Create MCP server Dockerfile (multi-stage build)
  - **File**: `phase-4/docker/mcp-server/Dockerfile`
  - **Success**:
    - Stage 1 (builder): FROM python:3.11-slim, install requirements.txt dependencies
    - Stage 2 (runtime): FROM python:3.11-slim, copy installed packages and app code from phase-3/mcp-server/
    - Non-root user: appuser (UID 1000)
    - EXPOSE 5000
    - CMD runs python server.py
    - Environment variables configurable (OPENROUTER_API_KEY, BACKEND_URL via env)
  - **Dependencies**: T031, T001 (research - Python multi-stage pattern), T022 (health endpoint)

- [ ] T033 [US1] Build MCP server Docker image
  - **Command**: `docker build -t todo-mcp-server:v1.0.0 -f phase-4/docker/mcp-server/Dockerfile .` (context: repo root)
  - **Success**: Build completes without errors, image tagged todo-mcp-server:v1.0.0 exists in `docker images`
  - **Dependencies**: T032

- [ ] T034 [US1] Test MCP server container locally
  - **Command**: `docker run --rm -p 5000:5000 --env-file phase-3/mcp-server/.env todo-mcp-server:v1.0.0`
  - **Success**:
    - Container starts without errors
    - `curl http://localhost:5000/health` returns {"status": "healthy"}
    - MCP server logs show "Running on http://0.0.0.0:5000"
  - **Dependencies**: T033

---

#### User Story 1 Validation

- [ ] T035 [US1] Validate all 3 containers run simultaneously
  - **Commands**: Run backend (T026), frontend (T030), MCP server (T034) in separate terminals
  - **Success**:
    - All 3 containers running without errors
    - All 3 health endpoints return 200 OK
    - Frontend can make API calls to backend (login/register works)
    - Frontend can make chat requests to MCP server (AI chat works)
  - **Dependencies**: T026, T030, T034

- [ ] T036 [US1] Verify Phase 1-3 feature parity (acceptance scenario 5)
  - **Test**: Use frontend in browser (http://localhost:3000), perform all Phase 2/3 operations
  - **Success**:
    - User registration works
    - User login works (JWT authentication)
    - Create todo works
    - List todos works
    - Update todo works
    - Complete todo works
    - Delete todo works
    - AI chat works (create/list/complete/update/delete todos via natural language)
  - **Dependencies**: T035

**Checkpoint**: User Story 1 (P1 MVP) complete - all services containerized and functional

---

## Phase 3: Kubernetes Manifests (User Story 2 - P2)

**Purpose**: Create Kubernetes manifests for local Minikube deployment

**Exit Criteria**: All manifests created, pods running, services accessible

### User Story 2 - Kubernetes Local Deployment (Priority: P2)

**Goal**: All services deployed to local Minikube with pods running and services accessible

**Independent Test**: Deploy manifests to Minikube, verify pod status "Running", access services through Kubernetes

---

#### ConfigMap and Secret

- [ ] T037 [P] [US2] Create Kubernetes ConfigMap manifest
  - **File**: `phase-4/kubernetes/configmap.yaml`
  - **Success**:
    - apiVersion: v1, kind: ConfigMap
    - name: todo-config
    - data: contains non-sensitive environment variables from research (T007, T008, T009)
    - Example: BACKEND_SERVICE_URL=http://backend-service:8000, MCP_SERVICE_URL=http://mcp-service:5000
  - **Dependencies**: T014, T007, T008, T009 (research)

- [ ] T038 [P] [US2] Create Kubernetes Secret manifest (template only)
  - **File**: `phase-4/kubernetes/secret.yaml.example`
  - **Success**:
    - apiVersion: v1, kind: Secret
    - name: todo-secrets
    - type: Opaque
    - stringData: contains placeholder values for sensitive variables (DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY)
    - Includes comment: "Copy to secret.yaml and replace placeholders with actual values"
  - **Dependencies**: T014, T007, T008, T009 (research)

---

#### Backend Kubernetes Resources

- [ ] T039 [US2] Create backend Deployment manifest
  - **File**: `phase-4/kubernetes/backend-deployment.yaml`
  - **Success**:
    - apiVersion: apps/v1, kind: Deployment
    - name: backend-deployment
    - replicas: 1
    - selector: matchLabels app=backend
    - template.spec.containers[0]:
      - name: backend
      - image: todo-backend:v1.0.0
      - imagePullPolicy: Never (uses local Minikube images)
      - ports: containerPort 8000
      - envFrom: configMapRef (todo-config), secretRef (todo-secrets)
      - resources: limits/requests from research (T005)
      - livenessProbe: httpGet /health on port 8000 (config from T006)
      - readinessProbe: httpGet /health on port 8000 (config from T006)
  - **Dependencies**: T014, T005, T006 (research), T025 (image built)

- [ ] T040 [US2] Create backend Service manifest
  - **File**: `phase-4/kubernetes/backend-service.yaml`
  - **Success**:
    - apiVersion: v1, kind: Service
    - name: backend-service
    - type: ClusterIP (internal only)
    - selector: app=backend
    - ports: port 8000, targetPort 8000
  - **Dependencies**: T014, T010 (research - service naming)

---

#### Frontend Kubernetes Resources

- [ ] T041 [US2] Create frontend Deployment manifest
  - **File**: `phase-4/kubernetes/frontend-deployment.yaml`
  - **Success**:
    - apiVersion: apps/v1, kind: Deployment
    - name: frontend-deployment
    - replicas: 1
    - selector: matchLabels app=frontend
    - template.spec.containers[0]:
      - name: frontend
      - image: todo-frontend:v1.0.0
      - imagePullPolicy: Never
      - ports: containerPort 3000
      - envFrom: configMapRef (todo-config), secretRef (todo-secrets)
      - resources: limits/requests from research (T005)
      - livenessProbe: httpGet /api/health on port 3000 (config from T006)
      - readinessProbe: httpGet /api/health on port 3000 (config from T006)
  - **Dependencies**: T014, T005, T006 (research), T029 (image built)

- [ ] T042 [US2] Create frontend Service manifest (NodePort for external access)
  - **File**: `phase-4/kubernetes/frontend-service.yaml`
  - **Success**:
    - apiVersion: v1, kind: Service
    - name: frontend-service
    - type: NodePort
    - selector: app=frontend
    - ports: port 3000, targetPort 3000, nodePort 30000 (fixed for predictability)
  - **Dependencies**: T014, T010 (research - service naming)

---

#### MCP Server Kubernetes Resources

- [ ] T043 [US2] Create MCP server Deployment manifest
  - **File**: `phase-4/kubernetes/mcp-deployment.yaml`
  - **Success**:
    - apiVersion: apps/v1, kind: Deployment
    - name: mcp-deployment
    - replicas: 1
    - selector: matchLabels app=mcp-server
    - template.spec.containers[0]:
      - name: mcp-server
      - image: todo-mcp-server:v1.0.0
      - imagePullPolicy: Never
      - ports: containerPort 5000
      - envFrom: configMapRef (todo-config), secretRef (todo-secrets)
      - resources: limits/requests from research (T005)
      - livenessProbe: httpGet /health on port 5000 (config from T006)
      - readinessProbe: httpGet /health on port 5000 (config from T006)
  - **Dependencies**: T014, T005, T006 (research), T033 (image built)

- [ ] T044 [US2] Create MCP server Service manifest
  - **File**: `phase-4/kubernetes/mcp-service.yaml`
  - **Success**:
    - apiVersion: v1, kind: Service
    - name: mcp-service
    - type: ClusterIP (internal only)
    - selector: app=mcp-server
    - ports: port 5000, targetPort 5000
  - **Dependencies**: T014, T010 (research - service naming)

---

#### User Story 2 Manual Deployment Test

- [ ] T045 [US2] Deploy ConfigMap to Minikube
  - **Command**: `kubectl apply -f phase-4/kubernetes/configmap.yaml`
  - **Success**: ConfigMap created, `kubectl get configmap todo-config` shows READY
  - **Dependencies**: T037, Minikube running

- [ ] T046 [US2] Deploy Secret to Minikube (manual creation with actual credentials)
  - **Command**: `kubectl create secret generic todo-secrets --from-env-file=phase-4/env-templates/backend.env --from-env-file=phase-4/env-templates/mcp-server.env`
  - **Success**: Secret created, `kubectl get secret todo-secrets` shows TYPE=Opaque
  - **Dependencies**: T038, T017, T019, Minikube running

- [ ] T047 [US2] Deploy backend to Minikube
  - **Command**: `kubectl apply -f phase-4/kubernetes/backend-deployment.yaml && kubectl apply -f phase-4/kubernetes/backend-service.yaml`
  - **Success**:
    - Deployment created, `kubectl get deployment backend-deployment` shows READY 1/1
    - Service created, `kubectl get service backend-service` shows TYPE=ClusterIP
    - Pod running, `kubectl get pods -l app=backend` shows STATUS=Running
  - **Dependencies**: T039, T040, T045, T046

- [ ] T048 [US2] Deploy frontend to Minikube
  - **Command**: `kubectl apply -f phase-4/kubernetes/frontend-deployment.yaml && kubectl apply -f phase-4/kubernetes/frontend-service.yaml`
  - **Success**:
    - Deployment created, `kubectl get deployment frontend-deployment` shows READY 1/1
    - Service created, `kubectl get service frontend-service` shows TYPE=NodePort
    - Pod running, `kubectl get pods -l app=frontend` shows STATUS=Running
  - **Dependencies**: T041, T042, T045, T046

- [ ] T049 [US2] Deploy MCP server to Minikube
  - **Command**: `kubectl apply -f phase-4/kubernetes/mcp-deployment.yaml && kubectl apply -f phase-4/kubernetes/mcp-service.yaml`
  - **Success**:
    - Deployment created, `kubectl get deployment mcp-deployment` shows READY 1/1
    - Service created, `kubectl get service mcp-service` shows TYPE=ClusterIP
    - Pod running, `kubectl get pods -l app=mcp-server` shows STATUS=Running
  - **Dependencies**: T043, T044, T045, T046

- [ ] T050 [US2] Verify all pods running and healthy
  - **Command**: `kubectl get pods`
  - **Success**:
    - All 3 pods show STATUS=Running, READY=1/1
    - No CrashLoopBackOff or ImagePullBackOff errors
    - `kubectl logs <backend-pod>` shows no errors
    - `kubectl logs <frontend-pod>` shows no errors
    - `kubectl logs <mcp-pod>` shows no errors
  - **Dependencies**: T047, T048, T049

- [ ] T051 [US2] Access frontend via NodePort
  - **Command**: `minikube service frontend-service --url` (or manually `http://<minikube-ip>:30000`)
  - **Success**: Browser shows frontend login page, no errors
  - **Dependencies**: T048, T050

- [ ] T052 [US2] Verify full application functionality through Kubernetes
  - **Test**: Use frontend via Minikube NodePort, perform all Phase 2/3 operations
  - **Success**:
    - Login/register works (frontend → backend via backend-service DNS)
    - CRUD operations work (create/list/update/complete/delete todos)
    - AI chat works (frontend → MCP server via mcp-service DNS)
    - Backend connects to external Neon database successfully
  - **Dependencies**: T051

**Checkpoint**: User Story 2 (P2) complete - all services deployed to Kubernetes and functional

---

## Phase 4: Configuration Management (User Story 3 - P3)

**Purpose**: Externalize configuration and enable changes without image rebuilds

**Exit Criteria**: Configuration changes via ConfigMap/Secret take effect on pod restart

### User Story 3 - Environment Configuration Management (Priority: P3)

**Goal**: Manage configuration through Kubernetes ConfigMaps/Secrets with easy updates

**Independent Test**: Modify ConfigMap/Secret, restart pods, verify new configuration applied

---

- [ ] T053 [US3] Update ConfigMap with different values
  - **Command**: Edit `phase-4/kubernetes/configmap.yaml`, change a non-sensitive value (e.g., BACKEND_SERVICE_URL)
  - **Success**: File updated with new value
  - **Dependencies**: T037

- [ ] T054 [US3] Apply updated ConfigMap to Minikube
  - **Command**: `kubectl apply -f phase-4/kubernetes/configmap.yaml`
  - **Success**: ConfigMap updated, `kubectl describe configmap todo-config` shows new value
  - **Dependencies**: T053

- [ ] T055 [US3] Restart backend pod to pick up ConfigMap changes
  - **Command**: `kubectl rollout restart deployment backend-deployment`
  - **Success**: New pod created with updated ConfigMap values, old pod terminated
  - **Dependencies**: T054, T047

- [ ] T056 [US3] Verify backend uses new ConfigMap values
  - **Command**: `kubectl exec -it <backend-pod> -- env | grep <CHANGED_VAR>`
  - **Success**: Environment variable shows new value from ConfigMap
  - **Dependencies**: T055

- [ ] T057 [US3] Update Secret with different values (test with non-production secret)
  - **Command**: `kubectl delete secret todo-secrets && kubectl create secret generic todo-secrets --from-literal=TEST_SECRET=newvalue`
  - **Success**: Secret updated, `kubectl get secret todo-secrets` exists
  - **Dependencies**: T046

- [ ] T058 [US3] Restart backend pod to pick up Secret changes
  - **Command**: `kubectl rollout restart deployment backend-deployment`
  - **Success**: New pod created with updated Secret values, old pod terminated
  - **Dependencies**: T057

- [ ] T059 [US3] Verify backend uses new Secret values
  - **Command**: `kubectl exec -it <backend-pod> -- env | grep TEST_SECRET`
  - **Success**: Environment variable shows new value from Secret
  - **Dependencies**: T058

**Checkpoint**: User Story 3 (P3) complete - configuration management working, changes apply on restart

---

## Phase 5: Service Networking (User Story 4 - P4)

**Purpose**: Verify service-to-service communication via Kubernetes DNS

**Exit Criteria**: All services communicate through Kubernetes service names (no hardcoded IPs)

### User Story 4 - Service Communication and Networking (Priority: P4)

**Goal**: Frontend and backend communicate via Kubernetes service discovery using DNS names

**Independent Test**: Verify frontend calls backend using service DNS name, MCP server via service DNS name

---

- [ ] T060 [US4] Verify backend service DNS resolution from frontend pod
  - **Command**: `kubectl exec -it <frontend-pod> -- nslookup backend-service`
  - **Success**: DNS resolves to ClusterIP (e.g., 10.x.x.x), no errors
  - **Dependencies**: T047, T048

- [ ] T061 [US4] Verify MCP service DNS resolution from frontend pod
  - **Command**: `kubectl exec -it <mcp-pod> -- nslookup mcp-service`
  - **Success**: DNS resolves to ClusterIP, no errors
  - **Dependencies**: T048, T049

- [ ] T062 [US4] Verify frontend makes API calls to backend via service DNS
  - **Test**: Check frontend logs or network requests, confirm URLs use `http://backend-service:8000`
  - **Success**: All API calls route through backend-service (not IP address), requests succeed
  - **Dependencies**: T052

- [ ] T063 [US4] Verify frontend makes MCP requests via service DNS
  - **Test**: Check frontend logs or network requests, confirm URLs use `http://mcp-service:5000`
  - **Success**: All MCP requests route through mcp-service (not IP address), requests succeed
  - **Dependencies**: T052

- [ ] T064 [US4] Test pod restart maintains service communication (no IP changes break connections)
  - **Command**: `kubectl delete pod <backend-pod>` (Deployment recreates it)
  - **Success**:
    - New backend pod starts with different IP
    - Frontend continues making requests to backend-service DNS name
    - No connection errors, requests succeed
  - **Dependencies**: T062

**Checkpoint**: User Story 4 (P4) complete - service discovery working, communication resilient to pod restarts

---

## Phase 6: Automation Scripts (Deployment Workflow)

**Purpose**: Automate build, deploy, verify, and teardown workflows

**Exit Criteria**: All scripts executable, deployment achievable with single command

---

- [ ] T065 [P] [AUTO] Create build-images.sh script
  - **File**: `phase-4/scripts/build-images.sh`
  - **Success**:
    - Bash script with shebang `#!/bin/bash`
    - Sets Minikube Docker env: `eval $(minikube docker-env)`
    - Builds all 3 images: backend, frontend, MCP server with v1.0.0 tag
    - Success message: "All images built successfully"
    - Executable: `chmod +x phase-4/scripts/build-images.sh`
  - **Dependencies**: T015, T024, T028, T032

- [ ] T066 [P] [AUTO] Create deploy-minikube.sh script
  - **File**: `phase-4/scripts/deploy-minikube.sh`
  - **Success**:
    - Bash script with shebang `#!/bin/bash`
    - Applies manifests in order: ConfigMap → Secret (if exists) → Deployments → Services
    - Uses `kubectl apply -f phase-4/kubernetes/`
    - Waits for pods to become ready: `kubectl wait --for=condition=ready pod -l app=backend --timeout=60s`
    - Success message: "All services deployed successfully"
    - Executable: `chmod +x phase-4/scripts/deploy-minikube.sh`
  - **Dependencies**: T015, T037-T044

- [ ] T067 [P] [AUTO] Create verify-deployment.sh script
  - **File**: `phase-4/scripts/verify-deployment.sh`
  - **Success**:
    - Bash script with shebang `#!/bin/bash`
    - Checks pod status: `kubectl get pods`
    - Checks service status: `kubectl get services`
    - Tests health endpoints via port-forward or exec
    - Displays Minikube frontend URL: `minikube service frontend-service --url`
    - Success message: "All health checks passed"
    - Executable: `chmod +x phase-4/scripts/verify-deployment.sh`
  - **Dependencies**: T015, T047-T049

- [ ] T068 [P] [AUTO] Create teardown.sh script
  - **File**: `phase-4/scripts/teardown.sh`
  - **Success**:
    - Bash script with shebang `#!/bin/bash`
    - Deletes all Kubernetes resources: `kubectl delete -f phase-4/kubernetes/`
    - Deletes ConfigMap, Secret if exist
    - Success message: "All resources removed"
    - Executable: `chmod +x phase-4/scripts/teardown.sh`
  - **Dependencies**: T015

- [ ] T069 [AUTO] Test build-images.sh script end-to-end
  - **Command**: `cd phase-4 && ./scripts/build-images.sh`
  - **Success**: Script runs without errors, all 3 images built and visible in `docker images`
  - **Dependencies**: T065

- [ ] T070 [AUTO] Test deploy-minikube.sh script end-to-end
  - **Command**: `cd phase-4 && ./scripts/deploy-minikube.sh`
  - **Success**: Script runs without errors, all pods/services created and running
  - **Dependencies**: T066, T069 (images built)

- [ ] T071 [AUTO] Test verify-deployment.sh script end-to-end
  - **Command**: `cd phase-4 && ./scripts/verify-deployment.sh`
  - **Success**: Script runs without errors, all health checks pass, frontend URL displayed
  - **Dependencies**: T067, T070 (deployment complete)

- [ ] T072 [AUTO] Test teardown.sh script end-to-end
  - **Command**: `cd phase-4 && ./scripts/teardown.sh`
  - **Success**: Script runs without errors, all Kubernetes resources deleted (`kubectl get pods` shows no resources)
  - **Dependencies**: T068, T070 (resources exist to delete)

**Checkpoint**: Automation complete - single-command deployment working (SC-004 satisfied)

---

## Phase 7: Documentation (User Guides)

**Purpose**: Provide comprehensive setup and deployment documentation

**Exit Criteria**: README and DEPLOYMENT_GUIDE complete, quickstart guide validated

---

- [ ] T073 [P] [DOC] Create phase-4/README.md
  - **File**: `phase-4/README.md`
  - **Success**:
    - Overview of Phase 4 (containerization and Kubernetes deployment)
    - Prerequisites (Docker, Minikube, kubectl)
    - Quick start (3-step: build, deploy, verify)
    - Directory structure explanation
    - Links to DEPLOYMENT_GUIDE.md
    - Troubleshooting section (5 common issues from plan.md)
  - **Dependencies**: T012

- [ ] T074 [P] [DOC] Create phase-4/DEPLOYMENT_GUIDE.md
  - **File**: `phase-4/DEPLOYMENT_GUIDE.md`
  - **Success**:
    - Step-by-step deployment instructions (7 steps from plan.md quickstart)
    - Environment variable setup instructions
    - Minikube start command with resource limits
    - Build images instructions (using script)
    - Deploy to Minikube instructions (using script)
    - Access application instructions (NodePort URL)
    - Verify deployment instructions (using script)
    - Teardown instructions (using script)
    - Troubleshooting section with solutions
  - **Dependencies**: T012

- [ ] T075 [DOC] Validate README quickstart guide
  - **Test**: Follow README quick start steps on clean Minikube installation
  - **Success**: Application deployed successfully by following README only, no missing steps
  - **Dependencies**: T073, T069, T070, T071

- [ ] T076 [DOC] Validate DEPLOYMENT_GUIDE step-by-step
  - **Test**: Follow DEPLOYMENT_GUIDE all 7 steps on clean Minikube installation
  - **Success**: Application deployed successfully by following DEPLOYMENT_GUIDE only, no missing steps
  - **Dependencies**: T074, T069, T070, T071

**Checkpoint**: Documentation complete and validated

---

## Phase 8: Final Validation (Success Criteria)

**Purpose**: Verify all 10 success criteria from spec.md are satisfied

**Exit Criteria**: All success criteria validated and documented

---

- [ ] T077 [VAL] Validate SC-001: Build time under 5 minutes
  - **Test**: Time execution of `./scripts/build-images.sh` on standard hardware
  - **Success**: Total build time (all 3 images) < 5 minutes
  - **Dependencies**: T069

- [ ] T078 [VAL] Validate SC-002: Container startup under 30 seconds
  - **Test**: Measure time from pod creation to READY=1/1 for each service
  - **Success**: All 3 services become ready within 30 seconds of container launch
  - **Dependencies**: T070

- [ ] T079 [VAL] Validate SC-003: 100% Phase 1-3 feature parity
  - **Test**: Execute all Phase 2/3 acceptance scenarios in containerized environment
  - **Success**:
    - User registration/login works
    - All CRUD operations work (create/list/update/complete/delete todos)
    - AI chat works (all 5 MCP tools functional)
    - No functionality lost compared to non-containerized version
  - **Dependencies**: T052

- [ ] T080 [VAL] Validate SC-004: Single-command deployment
  - **Test**: Run `./scripts/deploy-minikube.sh` after images built
  - **Success**: All services deployed and accessible with single script execution
  - **Dependencies**: T070

- [ ] T081 [VAL] Validate SC-005: Config changes without rebuilds
  - **Test**: Modify ConfigMap, restart pods, verify change applied (already tested in US3)
  - **Success**: Configuration change takes effect within 1 minute without image rebuild
  - **Dependencies**: T056

- [ ] T082 [VAL] Validate SC-006: Zero data loss during pod restarts
  - **Test**: Create todo, delete backend pod (Deployment recreates), verify todo still exists
  - **Success**: All data persists across pod restarts, no data loss
  - **Dependencies**: T064

- [ ] T083 [VAL] Validate SC-007: Database performance parity (within 10%)
  - **Test**: Measure API response times (e.g., create todo) in containerized vs non-containerized
  - **Success**: Containerized backend API response times within 10% of non-containerized baseline
  - **Dependencies**: T052

- [ ] T084 [VAL] Validate SC-008: Application accessible within 2 minutes
  - **Test**: Time from `kubectl apply` start to frontend accessible via browser
  - **Success**: Full application accessible within 2 minutes of deployment command
  - **Dependencies**: T070

- [ ] T085 [VAL] Validate SC-009: Redeployment under 3 minutes
  - **Test**: Time execution of `./scripts/teardown.sh && ./scripts/deploy-minikube.sh`
  - **Success**: Complete teardown and redeploy finishes in under 3 minutes
  - **Dependencies**: T070, T072

- [ ] T086 [VAL] Validate SC-010: Service-to-service communication 100% success
  - **Test**: Monitor frontend → backend and frontend → MCP server requests over 10 operations
  - **Success**: All service-to-service calls succeed via Kubernetes DNS, 100% success rate
  - **Dependencies**: T062, T063

**Checkpoint**: All 10 success criteria validated and satisfied

---

## Phase 9: Edge Case Validation

**Purpose**: Verify all 8 edge cases from spec.md are handled correctly

**Exit Criteria**: All edge cases tested and documented

---

- [ ] T087 [P] [EDGE] Test missing environment variable failure
  - **Test**: Remove DATABASE_URL from Secret, restart backend pod
  - **Success**: Container fails to start with clear error message indicating DATABASE_URL is missing
  - **Dependencies**: T046, T047

- [ ] T088 [P] [EDGE] Test database connection failure handling
  - **Test**: Provide invalid DATABASE_URL, restart backend pod
  - **Success**: Backend logs show connection retry attempts with exponential backoff and clear error messages
  - **Dependencies**: T046, T047

- [ ] T089 [P] [EDGE] Test pod restart resilience
  - **Test**: Delete backend pod while user is logged in, verify Deployment recreates pod
  - **Success**: New pod starts automatically, connects to database, resumes serving requests without data loss
  - **Dependencies**: T047, T082

- [ ] T090 [P] [EDGE] Test architecture mismatch error (if applicable)
  - **Test**: Attempt to build image with wrong --platform flag (if multi-arch support added)
  - **Success**: Build fails with architecture mismatch error or image won't run
  - **Dependencies**: T025 (or skip if not applicable)

- [ ] T091 [P] [EDGE] Test port conflict in Kubernetes
  - **Test**: Attempt to create duplicate Service with same NodePort 30000
  - **Success**: Second Service creation fails with "port already allocated" error
  - **Dependencies**: T042

- [ ] T092 [P] [EDGE] Test missing ConfigMap/Secret during startup
  - **Test**: Delete ConfigMap, then try to create Deployment
  - **Success**: Pods fail to start with clear error indicating missing ConfigMap
  - **Dependencies**: T039, T045

- [ ] T093 [P] [EDGE] Test code change requiring image rebuild
  - **Test**: Modify backend code, attempt to deploy without rebuilding image
  - **Success**: Kubernetes uses old image (no code change), confirming rebuild is required for code changes
  - **Dependencies**: T047

- [ ] T094 [P] [EDGE] Test multiple developers on same Minikube (if applicable)
  - **Test**: Verify Minikube contexts are separate per user
  - **Success**: Different contexts don't conflict unless same cluster name used
  - **Dependencies**: Minikube installed (or skip if single developer)

**Checkpoint**: All edge cases validated

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, optimization, and quality checks

**Exit Criteria**: Code clean, documentation complete, ready for merge

---

- [ ] T095 [P] [POLISH] Add .gitignore entries for Phase 4
  - **File**: `.gitignore` (repository root, or create `phase-4/.gitignore`)
  - **Success**: Ignore `phase-4/env-templates/*.env` (actual credentials), `phase-4/kubernetes/secret.yaml` (actual secret)
  - **Dependencies**: T012

- [ ] T096 [P] [POLISH] Review all Dockerfiles for security best practices
  - **Files**: `phase-4/docker/*/Dockerfile`
  - **Success**:
    - All images use non-root users (UID 1000/1001)
    - No sensitive data in Dockerfiles
    - Minimal attack surface (only necessary packages)
  - **Dependencies**: T024, T028, T032

- [ ] T097 [P] [POLISH] Review all Kubernetes manifests for best practices
  - **Files**: `phase-4/kubernetes/*.yaml`
  - **Success**:
    - Resource limits set for all containers
    - Health probes configured correctly
    - Labels consistent across resources
  - **Dependencies**: T037-T044

- [ ] T098 [P] [POLISH] Verify zero application code changes (Constitution Principle IV)
  - **Command**: `git diff phase-2/ phase-3/` (excluding health endpoints)
  - **Success**: Only changes are health endpoint additions (T020, T021, T022), no business logic changes
  - **Dependencies**: All implementation tasks complete

- [ ] T099 [POLISH] Run Constitution Check final validation
  - **Test**: Verify all 9 Constitution principles satisfied
  - **Success**:
    - Principle I: Spec-first ✅ (spec complete before implementation)
    - Principle II: Phase discipline ✅ (followed Spec → Plan → Tasks → Implement)
    - Principle III: Exit criteria ✅ (all success criteria validated)
    - Principle IV: Domain consistency ✅ (no todo domain logic changes)
    - Principle V: Stateless services ✅ (no persistent volumes)
    - Principle VI: MCP tools ✅ (N/A - no MCP changes)
    - Principle VII: Cloud-native ✅ (Dockerfiles, env vars, health checks)
    - Principle VIII: Process over features ✅ (comprehensive process demonstrated)
    - Principle IX: Folder organization ✅ (phase-4/ directory structure)
  - **Dependencies**: T098

- [ ] T100 [POLISH] Create Phase 4 completion summary
  - **File**: `phase-4/COMPLETION_SUMMARY.md`
  - **Success**: Document all deliverables, success criteria results, edge case validations, next steps
  - **Dependencies**: T077-T094

**Checkpoint**: Phase 4 complete and ready for merge

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 0 (Research)**: No dependencies - can start immediately
- **Phase 1 (Setup)**: Depends on Research completion (for templates)
- **Phase 2 (Foundational - Docker)**: Depends on Setup + Research
  - **User Story 1 (P1 MVP)**: Health endpoints → Dockerfiles → Build → Test containers
- **Phase 3 (Kubernetes Manifests)**: Depends on Foundational (images must exist)
  - **User Story 2 (P2)**: ConfigMap/Secret → Deployments → Services → Deploy → Verify
- **Phase 4 (Configuration)**: Depends on US2 (Kubernetes deployed)
  - **User Story 3 (P3)**: Modify ConfigMap/Secret → Restart pods → Verify
- **Phase 5 (Networking)**: Depends on US2 (services deployed)
  - **User Story 4 (P4)**: DNS resolution → Service communication → Pod restart resilience
- **Phase 6 (Automation)**: Depends on US1 + US2 (tasks to automate exist)
- **Phase 7 (Documentation)**: Can be done in parallel with automation
- **Phase 8 (Validation)**: Depends on all user stories + automation complete
- **Phase 9 (Edge Cases)**: Can be done in parallel with validation
- **Phase 10 (Polish)**: Depends on all tasks complete

### User Story Dependencies

- **US1 (P1)**: No dependencies - can start after Setup + Research
- **US2 (P2)**: Depends on US1 (Docker images must exist)
- **US3 (P3)**: Depends on US2 (Kubernetes deployed)
- **US4 (P4)**: Depends on US2 (services deployed)

### Parallel Opportunities

**Phase 0 (Research)**: T001-T010 all marked [P] can run in parallel

**Phase 1 (Setup)**: T013-T019 all marked [P] can run in parallel after T012

**Phase 2 (User Story 1)**:
- T020, T021, T022 (health endpoints) can run in parallel
- T023-T034 (Dockerfiles and builds) must be sequential per service but services can be parallelized:
  - Backend: T023 → T024 → T025 → T026
  - Frontend: T027 → T028 → T029 → T030
  - MCP Server: T031 → T032 → T033 → T034
  - These 3 chains can run in parallel

**Phase 3 (User Story 2)**:
- T037, T038 (ConfigMap, Secret) can run in parallel
- T039-T044 (Deployments/Services) can run in parallel after ConfigMap/Secret

**Phase 6 (Automation)**: T065-T068 all marked [P] can run in parallel

**Phase 7 (Documentation)**: T073, T074 marked [P] can run in parallel

**Phase 8 (Validation)**: T077-T086 some can run in parallel (build time and startup time are independent)

**Phase 9 (Edge Cases)**: T087-T094 all marked [P] can run in parallel

**Phase 10 (Polish)**: T095-T097 marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 0: Research (T001-T011)
2. Complete Phase 1: Setup (T012-T019)
3. Complete Phase 2: User Story 1 (T020-T036)
4. **STOP and VALIDATE**: Test all 3 containers running locally
5. Optionally skip to automation (T065-T068) for build script

**Deliverable**: All services containerized and running in Docker (not yet Kubernetes)

### Incremental Delivery

1. MVP (US1) → Docker containers working
2. Add US2 → Kubernetes deployment working
3. Add US3 → Configuration management working
4. Add US4 → Service networking validated
5. Add Automation → Single-command deployment
6. Add Documentation → User-ready guides
7. Final Validation → All success criteria met

### Parallel Team Strategy

With multiple developers:

1. Team completes Research + Setup together (T001-T019)
2. Split Phase 2 (US1):
   - Dev A: Backend Docker (T020, T023-T026)
   - Dev B: Frontend Docker (T021, T027-T030)
   - Dev C: MCP Server Docker (T022, T031-T034)
3. One person does US2 (Kubernetes manifests T037-T052)
4. Split remaining work:
   - Dev A: Automation (T065-T072)
   - Dev B: Documentation (T073-T076)
   - Dev C: Validation (T077-T086)

---

## Task Summary

**Total Tasks**: 100
- **Research (Phase 0)**: 11 tasks (T001-T011)
- **Setup (Phase 1)**: 8 tasks (T012-T019)
- **User Story 1 (P1 MVP)**: 17 tasks (T020-T036)
- **User Story 2 (P2)**: 17 tasks (T037-T052)
- **User Story 3 (P3)**: 7 tasks (T053-T059)
- **User Story 4 (P4)**: 5 tasks (T060-T064)
- **Automation**: 8 tasks (T065-T072)
- **Documentation**: 4 tasks (T073-T076)
- **Validation (Success Criteria)**: 10 tasks (T077-T086)
- **Edge Cases**: 8 tasks (T087-T094)
- **Polish**: 6 tasks (T095-T100)

**Estimated Effort**: ~2-3 days for single developer (assuming research + implementation + testing)

**Critical Path**: Research → Setup → US1 (Docker) → US2 (Kubernetes) → Validation

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label (US1, US2, US3, US4, SETUP, FOUNDATION, AUTO, DOC, VAL, EDGE, POLISH) maps task to phase/user story
- Each user story should be independently completable and testable
- No application code changes except health endpoints (minimal, infrastructure-focused)
- All source code remains in phase-2/ and phase-3/ directories
- All Phase 4 artifacts in phase-4/ directory (Constitution Principle IX)
- Commit after each logical task group or checkpoint
- Stop at any checkpoint to validate independently
- **Constitution compliance**: Verify no domain logic changes (Principle IV) at T098
