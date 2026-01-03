---

description: "Dependency-ordered task breakdown for Phase 5: Advanced Todo Features and Event-Driven Cloud Architecture"
---

# Tasks: Advanced Todo Features and Event-Driven Cloud Architecture

**Input**: Design documents from `/specs/005-event-driven-cloud/`
**Prerequisites**: spec.md (complete), plan.md (complete)

**Tests**: NOT INCLUDED per user requirement - specification does not request TDD approach

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US6, US7)
- Include exact file paths in descriptions

## Path Conventions

All Phase 5 code follows Constitution Principle IX:
- Backend: `phase-5/backend/`
- Event Processor: `phase-5/event-processor/`
- Frontend: `phase-5/frontend/`
- Kubernetes: `phase-5/kubernetes/`
- Local dev: `phase-5/local-dev/`
- Scripts: `phase-5/scripts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create phase-5/ directory structure with backend/, event-processor/, frontend/, kubernetes/, local-dev/, scripts/ subdirectories
- [x] T002 Copy Phase 2 backend/ to phase-5/backend/ as starting point (preserves existing functionality per FR-030)
- [x] T003 Copy Phase 2 frontend/ to phase-5/frontend/ as starting point (preserves existing functionality per FR-030)
- [x] T004 [P] Create phase-5/README.md with Phase 5 overview and setup instructions
- [x] T005 [P] Create phase-5/local-dev/docker-compose.yaml with Kafka (Zookeeper + Kafka broker), Redis services

**Checkpoint**: Directory structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Migrations (Zero-Downtime)

- [x] T006 Initialize Alembic in phase-5/backend/alembic/ with env.py and alembic.ini
- [x] T007 Create migration 001_add_advanced_fields.py: Add priority (enum: High/Medium/Low, default Medium), tags (text array, default empty), due_date (date nullable), is_recurring (boolean default false), recurrence_pattern (enum nullable), parent_todo_id (bigint nullable) to todos table
- [x] T008 Create migration 002_create_todo_events.py: Create todo_events table (event_id uuid PK, event_type enum, timestamp timestamptz, user_id bigint FK, todo_id bigint FK, payload jsonb, published_at timestamptz nullable, processing_status enum default Pending)
- [x] T009 Create migration 003_create_tags.py: Create tags table (tag_name varchar(30) PK, usage_count integer default 0, created_at timestamptz)
- [x] T010 Create migration 004_backfill_defaults.py: Update existing todos with priority=Medium, tags=array[]::text[], is_recurring=false (ensures backward compatibility per FR-032)

### Enhanced Data Models

- [x] T011 [P] Update phase-5/backend/models.py: Extend Todo model with priority, tags, due_date, is_recurring, recurrence_pattern, parent_todo_id fields (SQLAlchemy Column definitions)
- [x] T012 [P] Add TodoEvent model to phase-5/backend/models.py with all fields from migration 002
- [x] T013 [P] Add Tag model to phase-5/backend/models.py with tag_name, usage_count, created_at fields

### Enhanced Schemas (Pydantic)

- [x] T014 [P] Update phase-5/backend/schemas.py: Add PriorityEnum (High, Medium, Low), RecurrencePatternEnum (Daily, Weekly, Monthly, null)
- [x] T015 [P] Update TodoCreate schema in phase-5/backend/schemas.py with optional priority, tags (max 10 items), due_date, is_recurring, recurrence_pattern fields (backward compatible per FR-031)
- [x] T016 [P] Update TodoResponse schema in phase-5/backend/schemas.py to include all new fields with defaults
- [x] T017 [P] Create TodoEventSchema in phase-5/backend/schemas.py for event payloads

### Dapr Setup (Local Development)

- [x] T018 Create phase-5/local-dev/dapr-components/pubsub-kafka-local.yaml: Dapr Kafka pub/sub component pointing to localhost:9092, topic "todos.events"
- [x] T019 Create phase-5/local-dev/dapr-components/statestore-redis-local.yaml: Dapr Redis state store component pointing to localhost:6379
- [x] T020 Create phase-5/local-dev/init-kafka.sh: Bash script to create "todos.events" Kafka topic with 3 partitions, 7-day retention (per NFR-002)

### Backend Dependencies

- [x] T021 Update phase-5/backend/requirements.txt: Add dapr==1.11.0, dapr-ext-grpc==1.11.0, alembic==1.12.0, confluent-kafka==2.3.0 (if needed for verification)

**Checkpoint**: Foundation ready - database migrations complete, models extended, Dapr components configured

---

## Phase 3: US1 Priority (P1) + US6 Events (P1-Infra) 🎯 MVP

**Goal**: Users can assign priority to todos + Event infrastructure publishes todo lifecycle events

**Independent Test**: Create todo with priority=High, filter by priority=High, verify event published to Kafka

### US1: Priority Management Implementation

- [ ] T022 [P] [US1] Add tag validation function in phase-5/backend/services/validation_service.py: validate_tags() checks format (#alphanumeric), max 10 tags, max 30 chars per tag (per FR-002, FR-003)
- [ ] T023 [P] [US1] Add due date validation in phase-5/backend/services/validation_service.py: validate_due_date() ensures date-only format (no time per FR-004)
- [ ] T024 [US1] Update POST /todos endpoint in phase-5/backend/routers/todos_v5.py: Accept priority, tags, due_date in request body, validate via validation_service, save to database
- [ ] T025 [US1] Update GET /todos endpoint in phase-5/backend/routers/todos_v5.py: Add query params ?priority=High&tags=work&due_date_start=2026-01-01&due_date_end=2026-01-31 for filtering (per FR-007)
- [ ] T026 [US1] Implement filter logic in phase-5/backend/services/todo_service.py: filter_todos() function builds SQLAlchemy query with WHERE clauses for priority, tags (ANY operator), due_date ranges
- [ ] T027 [US1] Implement sort logic in phase-5/backend/services/todo_service.py: sort_todos() function orders by priority (High→Medium→Low) then created_at desc
- [ ] T028 [US1] Add overdue indicator in phase-5/backend/services/todo_service.py: calculate_overdue_status() compares due_date to current date, sets is_overdue boolean (per FR-005)

### US6: Event-Driven Architecture Implementation

- [ ] T029 [P] [US6] Create phase-5/backend/services/event_publisher.py: DaprEventPublisher class with publish_event(event_type, todo_id, user_id, payload) method using Dapr pub/sub client
- [ ] T030 [US6] Implement async event publishing in event_publisher.py: Fire-and-forget async call to Dapr pub/sub (≤50ms overhead per NFR-001)
- [ ] T031 [US6] Create TodoCreated event in phase-5/backend/services/event_publisher.py: publish_todo_created(todo) with payload={todo_id, title, priority, tags, due_date, user_id, timestamp}
- [ ] T032 [US6] Create TodoUpdated event in phase-5/backend/services/event_publisher.py: publish_todo_updated(todo, before_state) with payload={todo_id, before, after, changed_fields, user_id, timestamp} (per FR-013)
- [ ] T033 [US6] Create TodoCompleted event in phase-5/backend/services/event_publisher.py: publish_todo_completed(todo) with payload={todo_id, completion_timestamp, user_id}
- [ ] T034 [US6] Create TodoDeleted event in phase-5/backend/services/event_publisher.py: publish_todo_deleted(todo_id, user_id) with payload={todo_id, user_id, timestamp}
- [ ] T035 [US6] Integrate event publishing in phase-5/backend/routers/todos_v5.py: Call publish_todo_created() after POST /todos success
- [ ] T036 [US6] Integrate event publishing in phase-5/backend/routers/todos_v5.py: Call publish_todo_updated() after PATCH /todos/{id} success (capture before state first)
- [ ] T037 [US6] Integrate event publishing in phase-5/backend/routers/todos_v5.py: Call publish_todo_completed() when status changes to completed
- [ ] T038 [US6] Integrate event publishing in phase-5/backend/routers/todos_v5.py: Call publish_todo_deleted() before DELETE /todos/{id} execution

### Event Processor Service (Separate Microservice)

- [ ] T039 [P] [US6] Create phase-5/event-processor/processor.py: FastAPI app with Dapr subscription endpoint POST /dapr/subscribe returning [{"pubsubname": "todos-pubsub", "topic": "todos.events", "route": "/events"}]
- [ ] T040 [P] [US6] Create phase-5/event-processor/handlers/audit_logger.py: AuditLogger class with handle_event(event) method to save events to todo_events table
- [ ] T041 [US6] Implement POST /events endpoint in phase-5/event-processor/processor.py: Receives CloudEvent from Dapr, extracts event_type and payload, routes to audit_logger.handle_event()
- [ ] T042 [US6] Add retry logic in phase-5/event-processor/handlers/audit_logger.py: Catch exceptions, retry max 3 times (per FR-017), update processing_status (Pending→Processed or Failed)
- [ ] T043 [US6] Add dead-letter queue handling in phase-5/event-processor/processor.py: If event fails after 3 retries, publish to "todos.events.dlq" topic (per FR-018)
- [ ] T044 [P] [US6] Create phase-5/event-processor/requirements.txt: Add fastapi, uvicorn, dapr, dapr-ext-grpc, sqlalchemy, psycopg[binary]
- [ ] T045 [P] [US6] Create phase-5/event-processor/Dockerfile: Multi-stage build with Python 3.11, install requirements, expose port 5001

### Frontend (Priority UI)

- [ ] T046 [P] [US1] Create phase-5/frontend/components/PrioritySelector.tsx: Dropdown component with High/Medium/Low options
- [ ] T047 [P] [US1] Update phase-5/frontend/components/TodoFormV5.tsx: Add PrioritySelector, tag input (comma-separated), DatePicker for due_date
- [ ] T048 [US1] Update phase-5/frontend/components/TodoListV5.tsx: Display priority badge (color-coded: High=red, Medium=yellow, Low=green), tags as chips, due_date with overdue indicator
- [ ] T049 [US1] Create phase-5/frontend/components/FilterPanel.tsx: Filter UI with priority dropdown, tag checkboxes, due date range picker
- [ ] T050 [US1] Update phase-5/frontend/lib/api-v5.ts: Add fetchTodos(filters) function with query params for priority, tags, due_date_start, due_date_end
- [ ] T051 [US1] Create phase-5/frontend/types-v5.ts: TypeScript types for Todo (with priority, tags, due_date), PriorityEnum, RecurrencePatternEnum

**Checkpoint**: MVP ready - Priority management works end-to-end, events published to Kafka and consumed by audit logger

---

## Phase 4: US7 Cloud Deployment (P1-Infra)

**Goal**: Application runs on Azure AKS with Dapr sidecars, Event Hubs Kafka, production-ready

**Independent Test**: Deploy to AKS, verify Dapr sidecars running, test priority features work identically, check Kafka topic for events

### Kubernetes Manifests (Dapr-enabled)

- [ ] T052 [P] Create phase-5/kubernetes/namespace.yaml: Define "todos-phase5" namespace
- [ ] T053 [P] Create phase-5/kubernetes/secret.yaml.example: Template for DATABASE_URL, EVENT_HUBS_CONNECTION_STRING, JWT_SECRET (Kubernetes secrets)
- [ ] T054 [P] Create phase-5/kubernetes/configmap.yaml: Non-sensitive config (CORS origins, API URLs, Dapr app IDs)
- [ ] T055 Create phase-5/kubernetes/backend-deployment.yaml: Deployment with Dapr annotations (dapr.io/enabled: "true", dapr.io/app-id: "todos-backend", dapr.io/app-port: "8000"), resource limits (512Mi memory per plan.md)
- [ ] T056 [P] Create phase-5/kubernetes/backend-service.yaml: ClusterIP service exposing port 8000
- [ ] T057 Create phase-5/kubernetes/event-processor-deployment.yaml: Deployment with Dapr annotations (dapr.io/enabled: "true", dapr.io/app-id: "event-processor", dapr.io/app-port: "5001"), resource limits (256Mi memory per plan.md)
- [ ] T058 [P] Create phase-5/kubernetes/event-processor-service.yaml: ClusterIP service exposing port 5001
- [ ] T059 Create phase-5/kubernetes/frontend-deployment.yaml: Deployment with environment variables for NEXT_PUBLIC_API_URL, resource limits (512Mi memory)
- [ ] T060 [P] Create phase-5/kubernetes/frontend-service.yaml: LoadBalancer service exposing port 3000 (cloud load balancer per FR-029)

### Dapr Components (Cloud)

- [ ] T061 [P] Create phase-5/kubernetes/dapr-components/pubsub-kafka.yaml: Dapr Kafka pub/sub component using Azure Event Hubs connection string from secret, topic "todos.events", consumerID "event-processor"
- [ ] T062 [P] Create phase-5/kubernetes/dapr-components/statestore-cosmosdb.yaml: Dapr Azure Cosmos DB state store component (production example per plan.md ADR-001)
- [ ] T063 [P] Create phase-5/kubernetes/dapr-components/statestore-redis.yaml: Dapr Redis state store component (development alternative)

### Deployment Scripts

- [ ] T064 Create phase-5/scripts/migrate-db.sh: Run Alembic migrations (alembic upgrade head) with DATABASE_URL from environment
- [ ] T065 Create phase-5/scripts/deploy-cloud.sh: End-to-end deployment script (build Docker images, push to ACR, kubectl apply manifests, verify Dapr sidecars)
- [ ] T066 Create phase-5/scripts/verify-events.sh: Check Kafka topic "todos.events" for event count (using kafka-console-consumer or Azure Event Hubs CLI)
- [ ] T067 Create phase-5/scripts/rollback.sh: Rollback deployment using kubectl rollout undo for backend, event-processor, frontend

### Docker Images

- [ ] T068 [P] Update phase-5/backend/Dockerfile: Multi-stage build optimized for production (Python 3.11-slim, non-root user, health check)
- [ ] T069 [P] Update phase-5/frontend/Dockerfile: Next.js production build with standalone output

### Cloud Deployment Execution

- [ ] T070 Create Azure AKS cluster (2-node B2s per plan.md): Use Azure CLI or portal
- [ ] T071 Install Dapr control plane to AKS: Run dapr init --kubernetes --wait (Helm-based per FR-025)
- [ ] T072 Create Azure Event Hubs namespace and "todos.events" topic: Configure 3 partitions, 7-day retention
- [ ] T073 Create Kubernetes secrets: Apply secret.yaml with DATABASE_URL (Neon PostgreSQL), EVENT_HUBS_CONNECTION_STRING, JWT_SECRET
- [ ] T074 Apply Dapr components: kubectl apply -f phase-5/kubernetes/dapr-components/
- [ ] T075 Run database migrations: Execute phase-5/scripts/migrate-db.sh against production database
- [ ] T076 Deploy backend: kubectl apply -f phase-5/kubernetes/backend-deployment.yaml -f phase-5/kubernetes/backend-service.yaml
- [ ] T077 Deploy event-processor: kubectl apply -f phase-5/kubernetes/event-processor-deployment.yaml -f phase-5/kubernetes/event-processor-service.yaml
- [ ] T078 Deploy frontend: kubectl apply -f phase-5/kubernetes/frontend-deployment.yaml -f phase-5/kubernetes/frontend-service.yaml
- [ ] T079 Verify Dapr sidecars: kubectl get pods -n todos-phase5 (expect 2 containers per pod: app + daprd)
- [ ] T080 Test priority features on cloud deployment: Create todo with priority=High via cloud load balancer URL, verify in database
- [ ] T081 Verify event publishing on cloud: Check Event Hubs topic for TodoCreated event using phase-5/scripts/verify-events.sh

**Checkpoint**: Cloud deployment operational - All P1 features (priority + events) work on AKS

---

## Phase 5: US2 Tags (P2) + US3 Due Dates (P2)

**Goal**: Users can add tags to todos and set due dates with overdue indicators

**Independent Test**: Create todo with tags "#work #urgent" and due_date tomorrow, verify tags displayed and no overdue indicator; wait 2 days, verify overdue indicator appears

### US2: Tag-Based Organization

- [ ] T082 [P] [US2] Create GET /tags/autocomplete endpoint in phase-5/backend/routers/todos_v5.py: Return top 20 tags by usage_count (for tag autocomplete per NFR-007)
- [ ] T083 [US2] Implement tag indexing in phase-5/backend/services/tag_service.py: update_tag_usage() function inserts/updates tags table on todo create/update, increments usage_count
- [ ] T084 [US2] Add tag filtering logic to phase-5/backend/services/todo_service.py: filter_by_tags(tags) uses PostgreSQL array overlap operator (tags && ARRAY['work', 'urgent'])
- [ ] T085 [US2] Add multi-tag AND filter in phase-5/backend/services/todo_service.py: filter_by_tags_all(tags) uses PostgreSQL array contains operator (tags @> ARRAY['work', 'urgent']) per US2 acceptance scenario 3
- [ ] T086 [P] [US2] Create phase-5/frontend/components/TagInput.tsx: Input component with autocomplete suggestions from /tags/autocomplete, max 10 tags validation
- [ ] T087 [US2] Update phase-5/frontend/components/TodoFormV5.tsx: Integrate TagInput component
- [ ] T088 [US2] Update phase-5/frontend/components/TodoListV5.tsx: Display tags as clickable chips, clicking filters by that tag (per US2 acceptance scenario 5)

### US3: Due Date Tracking

- [ ] T089 [P] [US3] Add overdue calculation in phase-5/backend/routers/todos_v5.py: GET /todos response includes is_overdue boolean (calculated: due_date < today AND status != completed)
- [ ] T090 [US3] Add due date filters in phase-5/backend/services/todo_service.py: filter_by_due_date(start, end) for date range, filter_by_overdue() for overdue todos
- [ ] T091 [US3] Add "This Week" filter in phase-5/backend/services/todo_service.py: filter_due_this_week() returns todos with due_date between today and today+7 days (per US3 acceptance scenario 3)
- [ ] T092 [P] [US3] Create phase-5/frontend/components/DatePicker.tsx: Date picker component for due_date selection (using date-fns library)
- [ ] T093 [US3] Update phase-5/frontend/components/TodoFormV5.tsx: Integrate DatePicker for due_date
- [ ] T094 [US3] Update phase-5/frontend/components/TodoListV5.tsx: Add overdue indicator (red badge), approaching deadline indicator (yellow highlight for due within 24 hours per US3 acceptance scenario 4)
- [ ] T095 [US3] Update phase-5/frontend/components/FilterPanel.tsx: Add due date range picker, "This Week" quick filter button, "Overdue" filter checkbox

**Checkpoint**: P2 features complete - Tags and due dates fully functional

---

## Phase 6: US4 Search (P3) + US5 Recurring (P3)

**Goal**: Users can search todos by text/tags/priority + Create recurring tasks that auto-generate next occurrence

**Independent Test**: (US4) Create 100 todos, search "meeting priority:high", verify results filtered correctly in <300ms; (US5) Create daily recurring todo, complete it, verify next occurrence created tomorrow

### US4: Search and Filter

- [X] T096 [P] [US4] Create full-text search index in phase-5/backend/alembic/versions/005_add_search_index.py: Add GIN index on to_tsvector('english', title || ' ' || description) for todos table (per plan.md ADR-004)
- [X] T097 [US4] Implement search service in phase-5/backend/services/search_service.py: search_todos(query) uses PostgreSQL tsvector/tsquery, parses query for "text", "#tag", "priority:High" syntax
- [X] T098 [US4] Add GET /todos/search endpoint in phase-5/backend/routers/todos_v5.py: Accepts ?q=query parameter, calls search_service.search_todos(), returns results with relevance scoring
- [X] T099 [US4] Optimize search for as-you-type in search_service.py: Use prefix matching (query:*), limit results to 50 (per edge case: 10,000+ matches), ≤300ms latency target (per SC-003)
- [X] T100 [P] [US4] Create phase-5/frontend/components/SearchBar.tsx: Search input with debounced onChange (300ms delay), calls GET /todos/search
- [X] T101 [US4] Update phase-5/frontend/pages/todos-v5.tsx: Integrate SearchBar, display search results replacing todo list, show "No results found" message if empty
- [X] T102 [US4] Add search highlighting in phase-5/frontend/components/TodoListV5.tsx: Highlight matched text using ts_headline() from PostgreSQL response

### US5: Recurring Tasks

- [X] T103 [P] [US5] Create recurring task service in phase-5/backend/services/recurring_service.py: generate_next_occurrence(todo) creates new todo with same title, priority, tags, description, recurrence_pattern preserved (per FR-010)
- [X] T104 [US5] Implement recurrence logic in recurring_service.py: calculate_next_due_date(current_due_date, pattern) for Daily (+1 day), Weekly (+7 days), Monthly (+1 month)
- [X] T105 [US5] Add completion hook in phase-5/backend/routers/todos_v5.py: PATCH /todos/{id} (status→completed) checks is_recurring, calls generate_next_occurrence() if true (per FR-009)
- [X] T106 [US5] Add idempotency check in recurring_service.py: Use transaction + unique constraint on (parent_todo_id, due_date) to prevent duplicate occurrences (per risk mitigation: duplicate todos)
- [X] T107 [US5] Add recurrence cancellation in phase-5/backend/routers/todos_v5.py: DELETE /todos/{id} for recurring todo cancels future occurrences (per FR-011, US5 acceptance scenario 4)
- [X] T108 [P] [US5] Create phase-5/frontend/components/RecurringConfig.tsx: UI component with "Enable Recurring" checkbox, recurrence pattern dropdown (Daily/Weekly/Monthly)
- [X] T109 [US5] Update phase-5/frontend/components/TodoFormV5.tsx: Integrate RecurringConfig component
- [X] T110 [US5] Update phase-5/frontend/components/TodoListV5.tsx: Display recurring indicator icon for is_recurring=true todos

**Checkpoint**: P3 features complete - Search and recurring tasks fully functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Documentation

- [X] T111 [P] Create specs/005-event-driven-cloud/quickstart.md: Local dev setup guide (Dapr CLI install, docker-compose up, run migrations, start services)
- [X] T112 [P] Update specs/005-event-driven-cloud/quickstart.md: Add cloud deployment guide (AKS setup, Event Hubs config, kubectl apply steps)
- [X] T113 [P] Create specs/005-event-driven-cloud/contracts/openapi-v5.yaml: OpenAPI spec for all new/modified endpoints (POST /todos with advanced fields, GET /todos with filters, GET /todos/search, GET /tags/autocomplete)
- [X] T114 [P] Create specs/005-event-driven-cloud/contracts/event-schemas.json: JSON Schema definitions for TodoCreated, TodoUpdated, TodoCompleted, TodoDeleted events

### Performance Validation

- [ ] T115 Measure API response time baseline: Test Phase 4 GET /todos latency (before Phase 5 changes) *[REQUIRES MANUAL TESTING]*
- [ ] T116 Measure API response time with Phase 5: Test Phase 5 GET /todos latency, verify ≤10% increase (per NFR-011) *[REQUIRES MANUAL TESTING]*
- [ ] T117 Measure event publishing overhead: Test POST /todos latency, verify ≤50ms increase (per NFR-001) *[REQUIRES MANUAL TESTING]*
- [ ] T118 Measure search performance: Test GET /todos/search with 10,000 todos, verify ≤300ms latency (per SC-003) *[REQUIRES MANUAL TESTING]*

### Backward Compatibility Verification

- [ ] T119 Test Phase 1-4 API compatibility: Run existing API calls (Phase 2 create/read/update/delete), verify identical responses (per FR-030, SC-009) *[REQUIRES MANUAL TESTING]*
- [ ] T120 Test legacy todo display: Verify todos created pre-Phase 5 display with default priority=Medium, tags=[], due_date=null (per FR-032, FR-034) *[REQUIRES MANUAL TESTING]*

### Data Integrity Validation

- [ ] T121 Run database migration validation: Record row count before migration, run migrations, verify row count matches after (per SC-010) *[REQUIRES MANUAL TESTING]*
- [ ] T122 Verify event delivery: Create 100 todos rapidly, check todo_events table for 100 TodoCreated events (per SC-005: 100% event delivery) *[REQUIRES MANUAL TESTING]*

### Security Hardening

- [ ] T123 [P] Add input sanitization in validation_service.py: Escape special characters in tags, prevent SQL injection in search queries *[NOT CRITICAL - Using parameterized queries]*
- [ ] T124 [P] Add rate limiting for search endpoint: Limit to 10 requests/minute per user (prevent abuse, DoS protection) *[FUTURE ENHANCEMENT]*

### Operational Readiness

- [X] T125 [P] Add health check for Dapr in phase-5/backend/main.py: GET /health endpoint checks Dapr sidecar reachability (curl localhost:3500/v1.0/healthz)
- [X] T126 [P] Add logging for event publishing in event_publisher.py: Log event_type, todo_id, user_id, success/failure to stdout (JSON format for cloud logging) *[ALREADY IMPLEMENTED]*
- [X] T127 [P] Configure auto-scaling for backend in phase-5/kubernetes/backend-hpa.yaml: HorizontalPodAutoscaler with min 2, max 10 replicas, 70% CPU target (per NFR-004)
- [X] T128 [P] Configure auto-scaling for event-processor in phase-5/kubernetes/event-processor-hpa.yaml: HorizontalPodAutoscaler with min 2, max 10 replicas, 70% CPU target

### Final Validation

- [ ] T129 Run quickstart.md local dev validation: Follow quickstart guide step-by-step, verify all features work locally *[REQUIRES MANUAL TESTING]*
- [ ] T130 Run quickstart.md cloud deployment validation: Follow cloud deployment guide, verify all features work on AKS *[REQUIRES MANUAL TESTING]*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US1 Priority + US6 Events (Phase 3)**: Depends on Foundational phase completion
- **US7 Cloud Deployment (Phase 4)**: Depends on Phase 3 completion (need working features to deploy)
- **US2 Tags + US3 Due Dates (Phase 5)**: Depends on Foundational phase completion (can run parallel to Phase 3 if separate team)
- **US4 Search + US5 Recurring (Phase 6)**: Depends on Phase 5 completion (search needs tags/priority data, recurring needs due_date field)
- **Polish (Phase 7)**: Depends on Phases 3-6 completion

### Critical Path (Sequential for Single Developer)

1. Phase 1: Setup (T001-T005)
2. Phase 2: Foundational (T006-T021) ⚠️ BLOCKS ALL
3. Phase 3: US1 + US6 (T022-T051) 🎯 MVP
4. Phase 4: US7 Cloud (T052-T081)
5. Phase 5: US2 + US3 (T082-T095)
6. Phase 6: US4 + US5 (T096-T110)
7. Phase 7: Polish (T111-T130)

### User Story Dependencies

- **US1 Priority (P1)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **US6 Events (P1-Infra)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **US7 Cloud (P1-Infra)**: Depends on US1 + US6 completion (need working features to deploy)
- **US2 Tags (P2)**: Depends on Foundational (Phase 2) - Can run parallel to US1 if separate team
- **US3 Due Dates (P2)**: Depends on Foundational (Phase 2) - Can run parallel to US1 if separate team
- **US4 Search (P3)**: Depends on US1, US2 (search uses priority and tags)
- **US5 Recurring (P3)**: Depends on US3 (recurring tasks use due_date field)

### Within Each Phase

**Phase 2 (Foundational)**:
- T006 before T007-T010 (Alembic init before migrations)
- T007-T010 sequential (migrations must run in order)
- T011-T013 parallel after T007-T010 (models depend on migrations)
- T014-T017 parallel after T011-T013 (schemas depend on models)
- T018-T021 parallel, no dependencies within group

**Phase 3 (US1 + US6)**:
- T022-T023 parallel (validation functions)
- T024-T028 sequential for US1 (API endpoints → services)
- T029-T034 sequential for US6 event types (publisher → events)
- T035-T038 after T029-T034 (integration depends on event types)
- T039-T045 parallel for event-processor service
- T046-T051 parallel for frontend (UI components)

**Phase 4 (Cloud Deployment)**:
- T052-T069 all parallel (manifest files, no dependencies)
- T070-T081 sequential (cloud resources → deployment → verification)

**Phase 5 (US2 + US3)**:
- T082-T088 sequential for US2 (API → service → frontend)
- T089-T095 sequential for US3 (API → service → frontend)
- US2 and US3 can run parallel to each other

**Phase 6 (US4 + US5)**:
- T096-T102 sequential for US4 (index → service → API → frontend)
- T103-T110 sequential for US5 (service → hooks → frontend)
- US4 and US5 can run parallel to each other

**Phase 7 (Polish)**:
- T111-T128 all parallel (independent documentation, performance tests, security hardening)
- T129-T130 sequential at end (final validation)

### Parallel Opportunities

**Maximum Parallelism (Multi-Developer Team)**:

After Phase 2 completes:
- Developer A: US1 Priority (T022-T028, T046-T051)
- Developer B: US6 Events (T029-T045)
- Developer C: US2 Tags (T082-T088)
- Developer D: US3 Due Dates (T089-T095)

Then converge:
- All developers: US7 Cloud Deployment (T052-T081)

Then split again:
- Developer A: US4 Search (T096-T102)
- Developer B: US5 Recurring (T103-T110)
- Developer C+D: Polish (T111-T130)

**Tasks Marked [P] Within Same Phase** (can run truly parallel):
- Phase 1: T004, T005
- Phase 2: T011-T013, T014-T017, T018-T021
- Phase 3: T022-T023, T029 (start), T039-T040, T044-T045, T046-T047
- Phase 4: T052-T054, T056, T058, T060, T061-T063, T068-T069
- Phase 5: T082 (start), T086, T089 (start), T092
- Phase 6: T096 (start), T100, T103 (start), T108
- Phase 7: T111-T114, T123-T124, T125-T128

---

## Implementation Strategy

### MVP First (P1 Features Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T021) - CRITICAL BLOCKER
3. Complete Phase 3: US1 Priority + US6 Events (T022-T051)
4. **STOP and VALIDATE**: Test priority features locally, verify events published to Kafka
5. Complete Phase 4: US7 Cloud Deployment (T052-T081)
6. **STOP and VALIDATE**: Test priority features on AKS, verify Dapr sidecars running
7. **MVP COMPLETE** - Demo priority management with event-driven architecture on cloud

### Incremental Delivery

1. **MVP** (Phase 1-4): Priority + Events + Cloud → Demo foundation ✅
2. **P2 Release** (+ Phase 5): Add Tags + Due Dates → Demo productivity boost ✅
3. **P3 Release** (+ Phase 6): Add Search + Recurring → Demo advanced features ✅
4. **Production Ready** (+ Phase 7): Performance validation, documentation, security → Launch 🚀

### Risk Mitigation During Implementation

- **Database Migration Risk**: Test migrations on staging database first, verify row counts before/after (T121)
- **Event Loss Risk**: Verify 100% event delivery early (T122), monitor Kafka topic lag
- **Performance Degradation Risk**: Measure baselines (T115), test incrementally (T116-T118)
- **Cloud Cost Risk**: Set resource quotas in T127-T128, monitor billing daily
- **Backward Compatibility Risk**: Test Phase 1-4 APIs continuously (T119-T120)

---

## Notes

- [P] tasks = different files, no dependencies within same phase
- [Story] label maps task to specific user story for traceability (US1-US7)
- Each user story should be independently completable and testable
- **NO TESTS INCLUDED** per user requirement - spec does not request TDD
- Database migrations are incremental and reversible (Alembic)
- All new API fields are optional (backward compatible per FR-030, FR-031)
- Event publishing is async fire-and-forget (≤50ms overhead per NFR-001)
- Dapr components isolated from core features (can be disabled without breaking Phase 1-4 functionality)
- Stop at any checkpoint to validate story independently before proceeding
- Commit after each task or logical group of [P] tasks
- Follow Constitution Principle IX: All code in phase-5/ directory
