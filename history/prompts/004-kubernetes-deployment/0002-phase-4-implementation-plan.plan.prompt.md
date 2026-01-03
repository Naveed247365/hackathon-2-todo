---
id: 0002
title: Phase 4 Implementation Plan
stage: plan
date: 2026-01-01
surface: agent
model: claude-sonnet-4-5
feature: 004-kubernetes-deployment
branch: 004-kubernetes-deployment
user: developer
command: /sp.plan
labels: ["architecture", "docker", "kubernetes", "deployment", "planning", "phase-4"]
links:
  spec: specs/004-kubernetes-deployment/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-kubernetes-deployment/plan.md
tests:
  - Constitution Check: 9/9 principles passed
---

## Prompt

/sp.plan

Create a clear, ordered execution plan for Phase 4 based strictly on the approved Phase 4 specification.

Rules:
- Do not modify application logic
- Separate backend and frontend containerization
- Keep Kubernetes setup minimal and local (Minikube)
- Ensure each step is verifiable before moving forward

## Response snapshot

Created comprehensive implementation plan for Phase 4 containerization and Kubernetes deployment.

**Plan Document**: `specs/004-kubernetes-deployment/plan.md` (~650 lines)

**Key Architecture Decisions**:

1. **AD-001: Docker Multi-Stage Build Strategy**
   - Separate builder and runtime stages for all 3 services
   - Python: `python:3.11-slim` base image
   - Next.js: `node:18-alpine` base image with 3-stage build
   - Non-root users for security (FR-005 compliance)
   - 50-70% reduction in final image size

2. **AD-002: Environment Configuration Strategy**
   - ConfigMaps for non-sensitive config (service URLs, ports)
   - Secrets for sensitive data (DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY)
   - Environment variable injection (envFrom in Deployments)
   - Zero image rebuilds for config changes

3. **AD-003: Service Networking and Discovery**
   - ClusterIP for backend and MCP server (internal only)
   - NodePort for frontend (external access on Minikube)
   - Kubernetes DNS for service discovery
   - Port mappings: Backend 8000, Frontend 3000, MCP 5000

4. **AD-004: Stateless Architecture Implementation**
   - All services completely stateless (Constitution Principle V)
   - No persistent volumes (FR-018)
   - External Neon PostgreSQL for all state
   - Enables horizontal scaling in future

5. **AD-005: Health Check Implementation**
   - `/health` endpoints for all 3 services
   - Liveness probes (restart if failing)
   - Readiness probes (remove from service if not ready)
   - 10-15 second initial delay, 10 second period

6. **AD-006: Build and Deployment Automation**
   - `build-images.sh`: Build all Docker images
   - `deploy-minikube.sh`: Deploy to Kubernetes
   - `verify-deployment.sh`: Validate deployment success
   - `teardown.sh`: Clean removal of resources
   - Single-command deployment (SC-004)

**Phase 4 Directory Structure** (`phase-4/` at repository root):
```
phase-4/
├── docker/                    # Dockerfiles for 3 services
│   ├── backend/Dockerfile
│   ├── frontend/Dockerfile
│   └── mcp-server/Dockerfile
├── kubernetes/                # K8s manifests (8 files)
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── mcp-deployment.yaml
│   └── mcp-service.yaml
├── scripts/                   # Automation (4 scripts)
├── env-templates/             # Environment templates
└── README.md + DEPLOYMENT_GUIDE.md
```

**Research Areas Identified** (Phase 0):
- R1: Docker multi-stage build patterns (Python, Node.js)
- R2: Kubernetes resource configuration (limits, probes)
- R3: Environment variable mapping (ConfigMap vs Secret)
- R4: Service networking strategy (DNS, ports, external access)

**Constitution Check**: ✅ 9/9 Principles PASS
- Principle I: Spec-First Development ✅
- Principle II: Phase Discipline ✅
- Principle III: Clear Exit Criteria ✅
- Principle IV: Domain Consistency ✅ (zero application logic changes)
- Principle V: Stateless Services ✅
- Principle VI: MCP Tool Constraint ✅ (N/A - no MCP changes)
- Principle VII: Cloud-Native Readiness ✅
- Principle VIII: Process Over Features ✅
- Principle IX: Phase-Based Folder Organization ✅

**Quickstart Guide Included**:
- 7-step deployment process (start Minikube → build images → deploy → verify)
- Troubleshooting section (5 common issues with solutions)
- Teardown instructions
- Prerequisites verification commands

**Key Constraints Enforced**:
- Zero changes to Phase 2/3 source code (SL-001 to SL-005)
- Local Kubernetes only (Minikube, no cloud)
- External Neon PostgreSQL (no database containerization)
- Stateless services (Constitution Principle V)
- 100% feature parity with non-containerized version

## Outcome

- ✅ Impact: Complete architecture and design for Phase 4 containerization. All technical decisions documented with rationale.
- 🧪 Tests: Constitution Check 9/9 principles passed
- 📁 Files: 1 file created (plan.md, 650 lines)
- 🔁 Next prompts: `/sp.tasks` to generate actionable task breakdown for implementation
- 🧠 Reflection: Plan maintains strict separation between infrastructure work (Phase 4) and application logic (Phase 2/3 unchanged). All 6 architecture decisions (AD-001 to AD-006) directly trace to functional requirements in spec. Multi-stage Docker builds and Kubernetes manifests designed for local development workflow while maintaining cloud-native readiness for future production deployment.

## Evaluation notes (flywheel)

- Failure modes observed: None. Plan creation succeeded on first attempt.
- Graders run and results (PASS/FAIL): Constitution Check - 9/9 PASS
- Prompt variant (if applicable): Standard /sp.plan workflow with detailed architecture decisions
- Next experiment (smallest change to try): N/A - plan complete, ready for task breakdown
