# Implementation Plan: Advanced Todo Features and Event-Driven Cloud Architecture

**Branch**: `005-event-driven-cloud` | **Date**: 2026-01-02 | **Spec**: [spec.md](./spec.md)

## Summary

Phase 5 extends the todo application with advanced productivity features (priority, tags, due dates, search, recurring tasks) and implements event-driven cloud architecture using Kafka and Dapr. This phase introduces:

- **Advanced Todo Features**: Priority levels (High/Medium/Low), tags (max 10 per todo), due dates with overdue indicators, full-text search, and recurring tasks (Daily/Weekly/Monthly)
- **Event-Driven Architecture**: Kafka pub/sub for todo lifecycle events (Created, Updated, Completed, Deleted) via Dapr
- **Cloud Kubernetes Deployment**: Production-ready deployment to Azure AKS with Event Hubs, Dapr sidecars, and auto-scaling
- **Backward Compatibility**: All Phase 1-4 features remain fully functional with zero breaking changes

**Technical Approach**:
- Database schema migration using Alembic (zero-downtime with nullable fields first)
- RESTful API extensions with optional fields (backward compatible per FR-030)
- Dapr pub/sub component for async Kafka event publishing
- PostgreSQL full-text search (tsvector/tsquery) for search functionality
- Kubernetes deployment with Dapr sidecar injection
- Cloud-managed Kafka via Azure Event Hubs Kafka API

**Incremental Rollout Strategy**:
1. **P1 Features**: Priority management (foundation for filtering/sorting)
2. **P1 Infrastructure**: Event-driven architecture with Dapr + Kafka
3. **P2 Features**: Tags and due dates (builds on priority foundation)
4. **P3 Features**: Search and recurring tasks (requires P1/P2 data)

---

## Technical Context

**Language/Version**:
- Backend: Python 3.11+ (FastAPI 0.104+)
- Frontend: Node.js 18+ (Next.js 13+)
- Event Processing: Python 3.11+ (Dapr SDK 1.11+)

**Primary Dependencies**:
- Backend: FastAPI, SQLAlchemy 2.0, Alembic 1.12, psycopg[binary] 3.1, dapr 1.11, dapr-ext-grpc 1.11
- Frontend: Next.js 13, React 18, TypeScript 5, date-fns 2.30 (for date handling)
- Infrastructure: Dapr CLI 1.12, confluent-kafka-python 2.3, Helm 3.13

**Storage**:
- PostgreSQL (Neon cloud-hosted) with Alembic migrations
- Dapr state store: Redis 7 (dev) / Azure Cosmos DB (prod)
- Kafka: Azure Event Hubs Kafka API (managed service)

**Testing**:
- Manual acceptance testing against spec acceptance scenarios
- Event publishing verification via Kafka topic inspection
- Dapr pub/sub integration testing (publish → consume → verify audit log)
- Database migration validation (pre/post row counts match per SC-010)

**Target Platform**:
- Cloud Kubernetes: Azure AKS (2-node B2s cluster)
- Local development: Dapr CLI + Redis + Kafka via Docker Compose

**Project Type**: Multi-service event-driven web application

**Performance Goals**:
- API response time increase ≤10% for existing endpoints (NFR-011)
- Event publishing overhead ≤50ms async (NFR-001)
- Search results latency ≤300ms (SC-003)
- Event processing latency p95 ≤5s (SC-006)
- 100% event delivery to Kafka (SC-005)

**Constraints**:
- Zero breaking changes to Phase 1-4 APIs (FR-030)
- All new fields optional with sensible defaults (FR-031: priority=Medium, tags=[], due_date=null)
- Stateless services maintained (FR-027, Principle V)
- No UI redesign (use existing Phase 2 design patterns)
- No overengineering (per user requirement: avoid complexity)

**Scale/Scope**:
- 6 new todo fields (priority, tags, due_date, is_recurring, recurrence_pattern, parent_todo_id)
- 2 new entities (TodoEvent for event sourcing, Tag for autocomplete)
- 7 new/modified API endpoints (create with advanced fields, filter, search, tag autocomplete)
- 4 Kafka event types (TodoCreated, TodoUpdated, TodoCompleted, TodoDeleted)
- 3 Dapr components (pub/sub, state store, service invocation)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-First Development ✅ PASS
- **Status**: Complete specification at `specs/005-event-driven-cloud/spec.md`
- **Evidence**: 7 user stories (prioritized P1-P3), 34 functional requirements (FR-001 to FR-034), 12 measurable success criteria (SC-001 to SC-012)
- **Action**: None required

### Principle II: Phase Discipline ✅ PASS
- **Status**: Following workflow: Specification (complete) → Planning (this document) → Research → Data Model → Tasks → Implementation
- **Evidence**: No implementation overlap; planning artifacts will be created before coding begins
- **Action**: Execute phases sequentially; no code until tasks.md complete

### Principle III: Clear Exit Criteria ✅ PASS
- **Status**: 5 exit criteria defined in specification
- **Evidence**:
  - Advanced todo features work (priority, tags, due dates, search, recurring)
  - Events published and consumed successfully (100% delivery to Kafka)
  - Dapr pub/sub operational (sidecars running, components configured)
  - Application runs on cloud Kubernetes (AKS deployment verified)
  - Existing functionality intact (Phase 1-4 APIs unchanged)
- **Action**: Validate all criteria during implementation phase

### Principle IV: Domain Consistency ✅ PASS
- **Status**: Todo domain rules extended, not replaced
- **Evidence**:
  - Todo entity structure extended with new fields (priority, tags, due_date, recurrence) but core fields (id, user_id, title, status, created_at) unchanged
  - State transitions remain: pending → completed (no new states)
  - Validation rules extended consistently: tag format validation (#alphanumeric, max 30 chars), priority enum (High/Medium/Low), due date validation (date-only, no time)
- **Action**: Verify domain rule consistency in all code paths (routers, services, database constraints)

### Principle V: Stateless Services, Database as Source of Truth ✅ PASS
- **Status**: Services remain stateless; database is source of truth
- **Evidence**:
  - All persistent todo data stored in PostgreSQL (FR-027, FR-033)
  - Dapr state store used for session/cache only, NOT primary data (FR-019)
  - Event publishing is async fire-and-forget (NFR-001: ≤50ms overhead, doesn't block requests)
  - No in-memory todo storage (services horizontally scalable)
- **Action**: Ensure no in-memory state for todos in implementation; verify services can restart without data loss

### Principle VI: MCP Tool Constraint ⚠️ CONDITIONAL PASS
- **Status**: Principle applies to AI agents, not production services
- **Evidence**:
  - Production application code (backend) uses Dapr SDK and SQLAlchemy directly (not MCP tools)
  - AI agents (Phase 3 MCP server) continue using MCP tools for todo CRUD operations
  - Clear separation: production services use standard libraries; AI agents use MCP tools
- **Clarification**: This principle governs AI agent operations (Phase 3 chatbot), not core application services. Application services use industry-standard libraries (Dapr SDK, SQLAlchemy, FastAPI).
- **Action**: None required for Phase 5; maintain MCP tool usage in Phase 3 chatbot

### Principle VII: Cloud-Native Readiness ✅ PASS
- **Status**: Full Kubernetes compatibility maintained and enhanced
- **Evidence**:
  - Kubernetes deployment to Azure AKS (FR-024)
  - Environment variables for all config: DATABASE_URL, EVENT_HUBS_CONNECTION_STRING, JWT_SECRET (FR-028)
  - Health check endpoints exist from Phase 2 (backend: `/health`, frontend: `/api/health`)
  - Dapr sidecars for pub/sub and state management (FR-023)
  - Stateless architecture maintained (FR-027)
  - Logs to stdout/stderr (no file logging)
  - Graceful shutdown handling (SIGTERM)
  - Resource limits documented (backend: 512Mi, event-processor: 256Mi)
- **Action**: Add Kubernetes manifests with Dapr annotations (`dapr.io/enabled: "true"`)

### Principle VIII: Process Over Features ✅ PASS
- **Status**: Incremental rollout prioritizes process demonstration
- **Evidence**:
  - Phase 5 follows P1 features → P1 infrastructure → P2 features → P3 features rollout
  - Each priority level independently testable and deployable
  - Comprehensive documentation (plan.md, research.md, data-model.md, contracts/, quickstart.md)
  - ADRs required for: cloud provider choice, Kafka vs managed service, tag storage strategy, search implementation
- **Action**: Create ADRs for architectural decisions; demonstrate rigorous process for hackathon judging

### Principle IX: Phase-Based Folder Organization ✅ PASS
- **Status**: All Phase 5 artifacts in `phase-5/` directory
- **Evidence**:
  - Source code: `phase-5/backend/`, `phase-5/event-processor/`, `phase-5/frontend/`
  - Kubernetes manifests: `phase-5/kubernetes/`
  - Local dev setup: `phase-5/local-dev/`
  - Scripts: `phase-5/scripts/`
  - Specifications remain in `specs/005-event-driven-cloud/`
- **Action**: Create `phase-5/` directory structure before implementation; ensure no files leak into phase-2/ or phase-4/

**Constitution Compliance Summary**: 9/9 principles PASS (1 conditional pass with clarification)

---

## Project Structure

### Documentation (this feature)

```
specs/005-event-driven-cloud/
├── spec.md                  # Feature specification (complete)
├── plan.md                  # This file (/sp.plan output)
├── research.md              # Phase 0: Cloud provider, Kafka, Dapr research (see below)
├── data-model.md            # Phase 1: Enhanced schema, migrations (see below)
├── quickstart.md            # Phase 1: Local dev + cloud deployment guide (see below)
├── contracts/               # Phase 1: API and event contracts (see below)
│   ├── openapi-v5.yaml      # OpenAPI spec for new endpoints
│   ├── event-schemas.json   # Kafka event schemas (JSON Schema format)
│   └── dapr-components/     # Dapr component YAML templates
│       ├── pubsub-kafka.yaml
│       ├── statestore-redis.yaml
│       └── statestore-cosmosdb.yaml
├── checklists/
│   └── requirements.md      # Specification quality checklist (complete)
└── tasks.md                 # Phase 2: Testable tasks (/sp.tasks - NOT created by /sp.plan)
```

### Source Code (repository root)

```
phase-5/
├── backend/                      # Enhanced FastAPI backend
│   ├── alembic/                  # Database migrations
│   │   ├── versions/
│   │   │   ├── 001_add_advanced_fields.py   # Add priority, tags, due_date, recurrence fields
│   │   │   ├── 002_create_todo_events.py    # Create TodoEvent table
│   │   │   ├── 003_create_tags.py           # Create Tag autocomplete table
│   │   │   └── 004_backfill_defaults.py     # Set default values for existing todos
│   │   ├── env.py
│   │   └── alembic.ini
│   ├── models.py                 # Extended Todo, new TodoEvent, Tag models
│   ├── schemas.py                # Enhanced Pydantic schemas with new fields
│   ├── routers/
│   │   ├── todos_v5.py           # New/modified endpoints (priority, tags, search, etc.)
│   │   └── events.py             # Event subscription endpoint (Dapr callback)
│   ├── services/
│   │   ├── event_publisher.py    # Dapr pub/sub event publishing
│   │   ├── search_service.py     # PostgreSQL full-text search
│   │   └── recurring_service.py  # Recurring todo generation logic
│   ├── main.py                   # FastAPI app with new routers
│   ├── requirements.txt          # Updated dependencies (dapr, alembic)
│   └── Dockerfile                # Updated Docker build
│
├── event-processor/              # New service for event consumption
│   ├── processor.py              # Dapr subscription handler
│   ├── handlers/
│   │   ├── audit_logger.py       # Log events to TodoEvent table
│   │   └── analytics.py          # Future: event analytics (placeholder)
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                     # Next.js frontend additions
│   ├── components/
│   │   ├── TodoFormV5.tsx        # Enhanced form with priority, tags, due_date fields
│   │   ├── TodoListV5.tsx        # Display with filters (priority, tags, due date)
│   │   ├── SearchBar.tsx         # Search input component
│   │   ├── FilterPanel.tsx       # Priority/tag/date filter panel
│   │   └── RecurringConfig.tsx   # Recurring task configuration UI
│   ├── pages/
│   │   └── todos-v5.tsx          # New page with advanced features
│   ├── lib/
│   │   └── api-v5.ts             # API client for new endpoints
│   └── types-v5.ts               # TypeScript types for enhanced todo
│
├── kubernetes/                   # Kubernetes manifests with Dapr
│   ├── namespace.yaml
│   ├── configmap.yaml            # Environment config (CORS, API URLs)
│   ├── secret.yaml.example       # Secrets template (Kafka, DB, Dapr)
│   ├── backend-deployment.yaml   # With Dapr sidecar annotations
│   ├── backend-service.yaml
│   ├── event-processor-deployment.yaml  # Event consumer deployment
│   ├── event-processor-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── dapr-components/          # Dapr component definitions
│   │   ├── pubsub-kafka.yaml     # Kafka pub/sub component (Event Hubs)
│   │   ├── statestore-redis.yaml # Redis state store (dev)
│   │   └── statestore-cosmosdb.yaml # Azure Cosmos DB (prod example)
│   └── ingress.yaml              # Cloud load balancer ingress
│
├── local-dev/                    # Local development setup
│   ├── docker-compose.yaml       # Kafka + Redis + Zookeeper
│   ├── dapr-components/          # Local Dapr components
│   │   ├── pubsub-kafka-local.yaml
│   │   └── statestore-redis-local.yaml
│   └── init-kafka.sh             # Create Kafka topics script
│
├── scripts/
│   ├── migrate-db.sh             # Run Alembic migrations
│   ├── deploy-cloud.sh           # Deploy to AKS/GKE (end-to-end script)
│   ├── verify-events.sh          # Check Kafka topic for events
│   └── rollback.sh               # Rollback deployment (kubectl rollout undo)
│
└── README.md                     # Phase 5 overview and setup instructions
```

**Structure Decision**: Phase 5 follows Constitution Principle IX with all implementation in `phase-5/` directory. Backend and event-processor are separate services (microservices pattern for event isolation). Frontend additions are isolated to new components/pages (no modification to existing Phase 2 components). Kubernetes manifests include Dapr component definitions for cloud deployment. Local development setup uses Docker Compose for Kafka/Redis.

---

## Complexity Tracking

**No constitution violations detected.** All complexity is justified by feature requirements and aligns with constitution principles:

| Potential Concern | Justification | Alternative Rejected Because |
|-------------------|---------------|------------------------------|
| New event-processor service | Event consumption must not block API requests (FR-015: async publishing). Separate service enables independent scaling and failure isolation. | Embedding event processing in backend would violate stateless principle (Principle V) and degrade API performance (NFR-001: ≤50ms overhead) |
| Dapr sidecar injection | Required for cloud-native pub/sub and state management (FR-020, FR-021). Provides Kafka abstraction for portability. | Direct Kafka client in backend would couple architecture to Kafka implementation, violating portability requirement and increasing operational complexity |
| Alembic migrations | Zero-downtime schema changes for production (FR-033: no data loss). Versioned migrations enable rollback. | Manual SQL scripts would risk data loss during deployment, violate safety requirements (SC-010: verified by row counts), and lack rollback capability |
| PostgreSQL full-text search | Uses existing database (Assumption 6), no new service. Meets NFR-006 (≤1s index refresh) and SC-003 (≤300ms latency). | Elasticsearch would add operational complexity (new cluster to manage), cost ($50+/month), and violate "avoid overengineering" constraint |

**Total Complexity Score**: LOW
- 1 new service (event-processor) for clear separation of concerns
- 0 new external dependencies beyond Dapr + Kafka (both required per spec)
- 0 new frameworks (reuse FastAPI, Next.js, SQLAlchemy from Phase 2)
- 4 database migrations (incremental, reversible)

---

## Implementation Phases

### Phase 0: Research and Technical Decisions

**Artifacts**: `research.md` (see attached artifact below)

**Key Decisions**:
1. **Cloud Provider**: Azure AKS (recommended) for best Dapr integration and Event Hubs Kafka API
2. **Kafka Service**: Azure Event Hubs with Kafka protocol (eliminates Kafka operations)
3. **Database Migration**: Zero-downtime approach (add nullable columns → backfill → optionally add constraints)
4. **Tag Storage**: PostgreSQL array column + materialized Tag table (simpler than join table)
5. **Search**: PostgreSQL tsvector/tsquery (meets performance requirements without Elasticsearch)
6. **Recurring Tasks**: Generate next occurrence on completion (immediate feedback, ≤1s latency)
7. **Event Schema**: JSON payloads with before/after state for updates

### Phase 1: Data Model and Contracts

**Artifacts**: `data-model.md`, `contracts/` directory (see attached artifacts below)

**Key Outputs**:
1. Enhanced Todo model with 6 new fields (priority, tags, due_date, is_recurring, recurrence_pattern, parent_todo_id)
2. TodoEvent model for event sourcing audit trail
3. Tag model for autocomplete suggestions
4. 4 Alembic migration scripts (incremental schema changes)
5. OpenAPI spec for new API endpoints (create with advanced fields, filter, search, tag autocomplete)
6. Kafka event schemas (JSON Schema format for TodoCreated, TodoUpdated, TodoCompleted, TodoDeleted)
7. Dapr component YAMLs (pub/sub, state store for Redis and Cosmos DB)

### Phase 2: Task Breakdown

**Artifact**: `tasks.md` (generated by `/sp.tasks` command)

**Expected Task Categories**:
1. **Foundational Tasks** (T001-T015): Database migrations, model updates, Dapr setup
2. **P1 Feature Tasks** (T016-T030): Priority management API, UI, tests
3. **P1 Infrastructure Tasks** (T031-T045): Event publisher, Dapr pub/sub, event-processor service
4. **P2 Feature Tasks** (T046-T065): Tags, due dates API, UI, tests
5. **P3 Feature Tasks** (T066-T085): Search, recurring tasks API, UI, tests
6. **Cloud Deployment Tasks** (T086-T100): AKS setup, Helm deployment, verification

### Phase 3: Implementation

**Execution**: `/sp.implement` (task-by-task guided implementation)

**Critical Path**:
1. Database migrations (zero-downtime) → Backend model updates → API endpoint extensions
2. Dapr pub/sub component → Event publisher service → Event-processor service
3. Frontend components (priority, tags, due dates) → Search UI → Recurring task UI
4. Kubernetes manifests with Dapr annotations → Cloud deployment → Verification

### Phase 4: Validation and Delivery

**Exit Criteria Validation**:
1. ✅ Advanced todo features work correctly (priority, tags, due dates, search, recurring)
2. ✅ Events published and consumed successfully (100% delivery to Kafka, SC-005)
3. ✅ Dapr pub/sub operational (sidecars running, components configured)
4. ✅ Application runs on cloud Kubernetes (AKS deployment verified, SC-008)
5. ✅ Existing functionality intact (Phase 1-4 APIs unchanged, SC-009)

---

## Architectural Decision Records (ADRs)

The following ADRs must be created during implementation (with user consent per Principle VIII):

1. **ADR-001: Cloud Provider Selection (Azure AKS)**
   - **Context**: Need managed Kubernetes for production deployment
   - **Decision**: Azure AKS with Event Hubs Kafka API
   - **Rationale**: Best Dapr integration, managed Kafka via Event Hubs, competitive cost (~$85/month)
   - **Alternatives**: GCP GKE ($65/month, less mature Dapr), Oracle OCI (lowest cost but smaller ecosystem)

2. **ADR-002: Kafka vs Managed Pub/Sub**
   - **Context**: Event-driven architecture requires pub/sub messaging
   - **Decision**: Azure Event Hubs Kafka API (managed service)
   - **Rationale**: Zero Kafka operations, 7-day retention, Kafka client compatibility
   - **Alternatives**: Self-hosted Kafka (operational complexity, violates "avoid overengineering"), GCP Pub/Sub (requires Kafka compatibility mode)

3. **ADR-003: Tag Storage Strategy**
   - **Context**: Todos can have multiple tags (max 10)
   - **Decision**: PostgreSQL array column + materialized Tag table for autocomplete
   - **Rationale**: Simpler queries (no JOINs), atomic updates, sufficient for Phase 5 scale
   - **Alternatives**: Many-to-many join table (over-engineered for simple tag strings)

4. **ADR-004: Search Implementation**
   - **Context**: Full-text search across todo title and description
   - **Decision**: PostgreSQL tsvector/tsquery with GIN index
   - **Rationale**: Uses existing database, meets NFR-006 (≤1s index refresh) and SC-003 (≤300ms latency)
   - **Alternatives**: Elasticsearch (adds operational complexity, cost, violates assumption 6)

---

## Next Steps

1. Review and approve this implementation plan
2. Create ADRs for architectural decisions (ADR-001 to ADR-004)
3. Run `/sp.tasks` to generate detailed task breakdown
4. Execute implementation phase via `/sp.implement`

**Plan Status**: ✅ **COMPLETE** - Ready for task generation

**Branch**: `005-event-driven-cloud`
**Plan File**: `E:\hackathon 2\todos\specs\005-event-driven-cloud\plan.md`
**Next Command**: `/sp.tasks` to generate actionable tasks
