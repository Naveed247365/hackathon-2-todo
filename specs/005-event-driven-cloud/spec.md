# Feature Specification: Advanced Todo Features and Event-Driven Cloud Architecture

**Feature Branch**: `005-event-driven-cloud`
**Created**: 2026-01-02
**Status**: Draft
**Input**: User description: "Create Phase 5 specification for Hackathon 2: Advanced Todo Features and Event-Driven Cloud Architecture."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Priority-Based Todo Management (Priority: P1)

Users need to organize their tasks by importance to focus on what matters most. They should be able to assign priority levels (High, Medium, Low) to todos and filter/sort by priority.

**Why this priority**: Priority management is the most fundamental productivity feature that delivers immediate value. Users can start organizing existing todos without requiring other advanced features.

**Independent Test**: Can be fully tested by creating todos with different priorities, filtering the todo list by priority, and verifying sort order. Delivers standalone value for task organization.

**Acceptance Scenarios**:

1. **Given** a user is creating a new todo, **When** they select a priority level (High/Medium/Low), **Then** the todo is saved with that priority
2. **Given** a user has todos with different priorities, **When** they filter by "High" priority, **Then** only high-priority todos are displayed
3. **Given** a user has multiple todos, **When** they sort by priority, **Then** todos are ordered: High → Medium → Low
4. **Given** a user edits an existing todo, **When** they change the priority from Low to High, **Then** the updated priority is reflected immediately

---

### User Story 2 - Tag-Based Todo Organization (Priority: P2)

Users need to categorize todos across multiple dimensions (e.g., #work, #personal, #urgent) to enable flexible organization beyond single-level priority. They should be able to add multiple tags per todo and filter by tags.

**Why this priority**: Tags enable cross-cutting organization (e.g., "work AND urgent") that priority alone cannot provide. Requires priority (P1) to be useful but adds significant organizational power.

**Independent Test**: Can be tested by creating todos with multiple tags, filtering by single/multiple tags, and verifying tag display. Delivers value for users managing complex projects.

**Acceptance Scenarios**:

1. **Given** a user is creating a todo, **When** they add tags "#work #urgent", **Then** both tags are saved with the todo
2. **Given** a user has todos with various tags, **When** they filter by "#work", **Then** all todos tagged with #work are shown
3. **Given** a user filters by multiple tags "#work #urgent", **When** they apply the filter, **Then** only todos with BOTH tags are displayed
4. **Given** a user has a todo with tags, **When** they remove a tag, **Then** the tag is removed immediately without affecting other tags
5. **Given** a user clicks on a tag, **When** the tag is selected, **Then** the view filters to show all todos with that tag

---

### User Story 3 - Due Date and Deadline Tracking (Priority: P2)

Users need to set deadlines for todos to ensure timely completion. They should be able to assign due dates, see overdue todos, and get visual indicators for approaching deadlines.

**Why this priority**: Due dates add time-based urgency to tasks. Works independently but synergizes with priority (P1) for comprehensive task management.

**Independent Test**: Can be tested by setting due dates on todos, filtering by date ranges, and verifying overdue indicators. Delivers standalone value for deadline tracking.

**Acceptance Scenarios**:

1. **Given** a user is creating a todo, **When** they set a due date of "2026-01-10", **Then** the due date is saved and displayed
2. **Given** today is 2026-01-11 and a todo has due date 2026-01-10, **When** the user views the todo, **Then** it is marked as "Overdue"
3. **Given** a user has todos with various due dates, **When** they filter by "This Week", **Then** only todos due within 7 days are shown
4. **Given** a todo is due tomorrow, **When** the user views the list, **Then** a visual indicator (e.g., yellow highlight) shows the approaching deadline
5. **Given** a user completes an overdue todo, **When** they mark it complete, **Then** the overdue indicator is removed

---

### User Story 4 - Search and Filter Todos (Priority: P3)

Users need to quickly find specific todos from a large list by searching todo text, tags, or priority. They should get instant search results as they type.

**Why this priority**: Search becomes valuable once users have accumulated many todos with tags and priorities. Requires P1/P2 features to be most useful.

**Independent Test**: Can be tested by creating diverse todos and searching by text, tags, and combinations. Delivers value for users with large todo lists.

**Acceptance Scenarios**:

1. **Given** a user has 100 todos, **When** they type "meeting" in the search box, **Then** only todos containing "meeting" are displayed
2. **Given** a user searches for "#work", **When** they type the tag, **Then** all todos with #work tag are shown
3. **Given** a user searches for "priority:high urgent", **When** they apply the search, **Then** high-priority todos containing "urgent" are displayed
4. **Given** a user clears the search box, **When** they delete all search text, **Then** all todos are displayed again
5. **Given** a user searches for non-existent text, **When** no matches are found, **Then** a "No results found" message is displayed

---

### User Story 5 - Recurring Tasks (Priority: P3)

Users need to create tasks that repeat on a schedule (daily, weekly, monthly) to automate routine todo creation. When a recurring todo is completed, the next occurrence should be automatically created.

**Why this priority**: Recurring tasks are valuable for routine management but depend on solid foundation features (P1/P2). More complex to implement and serves fewer users initially.

**Independent Test**: Can be tested by creating a recurring todo, completing it, and verifying the next occurrence is created. Delivers value for users with routine tasks.

**Acceptance Scenarios**:

1. **Given** a user creates a todo "Daily standup", **When** they set recurrence to "Daily", **Then** the todo is marked as recurring
2. **Given** a daily recurring todo is completed today, **When** the user marks it complete, **Then** a new instance is created for tomorrow
3. **Given** a weekly recurring todo, **When** it recurs, **Then** it maintains the same priority, tags, and description
4. **Given** a user wants to stop a recurring todo, **When** they delete it, **Then** all future recurrences are cancelled
5. **Given** a user edits a recurring todo, **When** they change the description, **Then** future occurrences reflect the updated description

---

### User Story 6 - Event-Driven Architecture (Priority: P1 - Infrastructure)

The system needs to publish events for todo lifecycle changes (created, updated, completed, deleted) to enable asynchronous processing, analytics, and future integrations. Events should be published to Kafka and consumed via Dapr pub/sub.

**Why this priority**: Event infrastructure is foundational for scalability and future features. Must be implemented early to avoid retrofitting into existing code.

**Independent Test**: Can be tested by performing todo operations and verifying events are published to Kafka and consumed by event handlers. Delivers architectural foundation.

**Acceptance Scenarios**:

1. **Given** a user creates a new todo, **When** the todo is saved, **Then** a "TodoCreated" event is published to Kafka topic "todos.events"
2. **Given** a user updates a todo priority, **When** the change is saved, **Then** a "TodoUpdated" event is published with before/after state
3. **Given** a user completes a todo, **When** marked complete, **Then** a "TodoCompleted" event is published
4. **Given** a "TodoCreated" event is published, **When** the event consumer receives it, **Then** it successfully processes the event without errors
5. **Given** multiple events are published rapidly, **When** events are consumed, **Then** they are processed in order without data loss

---

### User Story 7 - Cloud Kubernetes Deployment (Priority: P1 - Infrastructure)

The application must run on cloud-managed Kubernetes (AKS, GKE, or OCI) with Dapr sidecars for pub/sub, state management, and service invocation. All services must remain stateless with external state managed by Dapr.

**Why this priority**: Cloud deployment is a hard requirement for production readiness and enables Dapr/Kafka integration. Must be completed early to validate architecture.

**Independent Test**: Can be tested by deploying to cloud K8s, verifying Dapr sidecars are running, and testing pub/sub communication. Delivers production infrastructure.

**Acceptance Scenarios**:

1. **Given** the application is deployed to cloud Kubernetes, **When** all services start, **Then** each pod has a Dapr sidecar injected
2. **Given** Dapr is configured for pub/sub, **When** an event is published, **Then** Dapr routes it to the correct Kafka topic
3. **Given** a service needs to read state, **When** it queries Dapr state store, **Then** state is retrieved successfully
4. **Given** a service is restarted, **When** it comes back online, **Then** no state is lost (stateless architecture maintained)
5. **Given** the application is running on cloud K8s, **When** a user accesses the frontend, **Then** all Phase 1-4 features work identically

---

### Edge Cases

- **What happens when a user sets a due date in the past?** System should accept it and immediately mark as overdue
- **What happens when a recurring todo is deleted mid-cycle?** All future occurrences are cancelled, but past completed instances remain in history
- **What happens when Kafka is temporarily unavailable?** Events should be buffered and retried (Dapr handles this), without blocking user actions
- **What happens when a user adds 100+ tags to a single todo?** System should enforce a reasonable limit (e.g., 10 tags max) with a validation error
- **What happens when two users simultaneously update the same todo?** Last-write-wins with optimistic concurrency (timestamp-based conflict detection)
- **What happens when a search query matches 10,000+ todos?** Results are paginated with a default limit (e.g., 50 per page)
- **What happens when an event consumer fails to process an event?** Event is retried (Dapr dead-letter queue after N retries)
- **What happens when a user filters by multiple criteria (priority + tags + due date)?** Filters are combined with AND logic (all criteria must match)

## Requirements *(mandatory)*

### Functional Requirements

#### Core Todo Features

- **FR-001**: System MUST allow users to assign one of three priority levels (High, Medium, Low) to each todo
- **FR-002**: System MUST allow users to add multiple tags to a todo (max 10 tags per todo)
- **FR-003**: System MUST validate tag format (alphanumeric, starts with #, max 30 characters)
- **FR-004**: System MUST allow users to set an optional due date (date-only, no time) on todos
- **FR-005**: System MUST mark todos as "Overdue" when current date exceeds due date and todo is not complete
- **FR-006**: System MUST support full-text search across todo title and description
- **FR-007**: System MUST support filtering by priority, tags, completion status, and due date ranges
- **FR-008**: System MUST allow users to create recurring todos with intervals: Daily, Weekly, Monthly
- **FR-009**: System MUST automatically create the next occurrence when a recurring todo is marked complete
- **FR-010**: System MUST preserve priority, tags, and description when generating recurring todo instances
- **FR-011**: System MUST allow users to stop recurrence by deleting the recurring todo

#### Event-Driven Architecture

- **FR-012**: System MUST publish events for all todo lifecycle changes: Created, Updated, Completed, Deleted
- **FR-013**: Events MUST include: event type, timestamp, user ID, todo ID, before/after state (for updates)
- **FR-014**: System MUST publish events to Kafka topic "todos.events" via Dapr pub/sub component
- **FR-015**: Events MUST be published asynchronously without blocking user actions
- **FR-016**: System MUST consume events via Dapr subscriptions for audit logging
- **FR-017**: System MUST handle event processing failures with retry logic (max 3 retries)
- **FR-018**: Failed events (after retries) MUST be routed to dead-letter queue for manual review

#### Dapr Integration

- **FR-019**: System MUST use Dapr state store for session/cache data (not primary database)
- **FR-020**: System MUST use Dapr pub/sub component for Kafka event publishing/consuming
- **FR-021**: System MUST use Dapr service invocation for inter-service communication (backend ↔ event processor)
- **FR-022**: System MUST configure Dapr with Redis state store for development and cloud-native state store (Azure Cosmos DB, GCP Firestore, or OCI Object Storage) for production
- **FR-023**: System MUST run Dapr sidecars in Kubernetes sidecar injection mode

#### Cloud Kubernetes Deployment

- **FR-024**: System MUST deploy to managed Kubernetes: Azure AKS, Google GKE, or Oracle OCI Container Engine for Kubernetes
- **FR-025**: System MUST use Dapr Helm chart for Dapr control plane installation
- **FR-026**: System MUST configure Kafka via managed service (Azure Event Hubs, GCP Pub/Sub Kafka API, or OCI Streaming) OR self-hosted Kafka in K8s
- **FR-027**: System MUST maintain stateless services (all state in database or Dapr state store)
- **FR-028**: System MUST use Kubernetes Secrets for sensitive configuration (Kafka credentials, database URLs)
- **FR-029**: System MUST expose frontend via cloud load balancer (Azure Load Balancer, GCP Load Balancer, or OCI Load Balancer)

#### Backward Compatibility

- **FR-030**: System MUST support all existing Phase 1-4 APIs without breaking changes
- **FR-031**: New fields (priority, tags, due_date, recurrence) MUST be optional with sensible defaults
- **FR-032**: Existing todos (created pre-Phase 5) MUST display with default priority=Medium, tags=[], due_date=null
- **FR-033**: System MUST migrate existing database schema without data loss
- **FR-034**: Frontend MUST gracefully handle missing advanced fields for legacy todos

### Key Entities

- **Todo (Enhanced)**: Existing todo entity extended with:
  - `priority`: Enum (High, Medium, Low) - default Medium
  - `tags`: Array of strings (max 10) - default empty array
  - `due_date`: Date (nullable) - default null
  - `is_recurring`: Boolean - default false
  - `recurrence_pattern`: Enum (Daily, Weekly, Monthly, null) - default null
  - `parent_todo_id`: Foreign key (nullable, for recurring instances) - default null

- **TodoEvent**: New entity for event sourcing
  - `event_id`: UUID (primary key)
  - `event_type`: Enum (Created, Updated, Completed, Deleted)
  - `timestamp`: DateTime (UTC)
  - `user_id`: Foreign key to User
  - `todo_id`: Foreign key to Todo
  - `payload`: JSON (event-specific data, e.g., before/after state)
  - `published_at`: DateTime (when event sent to Kafka)
  - `processing_status`: Enum (Pending, Processed, Failed)

- **Tag**: Reusable tags (denormalized storage for search performance)
  - `tag_name`: String (unique, indexed)
  - `usage_count`: Integer (number of todos using this tag)
  - `created_at`: DateTime

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can assign priority to a todo in under 5 seconds
- **SC-002**: Users can filter todos by priority/tags/due date and see results in under 1 second
- **SC-003**: Search returns results as-you-type with max 300ms latency
- **SC-004**: Recurring todos generate next occurrence within 1 second of completion
- **SC-005**: 100% of todo lifecycle events are published to Kafka successfully
- **SC-006**: Event consumers process events within 5 seconds of publication (95th percentile)
- **SC-007**: System handles 10,000 events per minute without event loss
- **SC-008**: Application deploys to cloud Kubernetes with 99.9% uptime SLA
- **SC-009**: All Phase 1-4 features work identically on cloud deployment (100% feature parity)
- **SC-010**: Database migration completes without data loss (verified by pre/post row counts)
- **SC-011**: API response times remain within 10% of Phase 4 baseline for existing endpoints
- **SC-012**: 90% of users successfully create a todo with priority, tags, and due date on first attempt

### Non-Functional Requirements

- **NFR-001**: Event publishing must not increase API response time by more than 50ms (async fire-and-forget)
- **NFR-002**: Kafka topics must retain events for minimum 7 days for audit trail
- **NFR-003**: Dapr sidecar overhead must not exceed 50MB memory per pod
- **NFR-004**: Cloud deployment must use auto-scaling (min 2 replicas, max 10 replicas per service)
- **NFR-005**: Database must support 1000 concurrent connections for production load
- **NFR-006**: Search index must refresh within 1 second of todo creation/update
- **NFR-007**: Tag autocomplete must suggest tags within 200ms as user types

## Assumptions

1. **Cloud Provider Choice**: Implementation will target one cloud provider initially (recommend starting with Azure AKS or GCP GKE due to better Dapr integration)
2. **Kafka vs Managed Pub/Sub**: Will use cloud-native Kafka-compatible services (Azure Event Hubs Kafka API or GCP Pub/Sub with Kafka protocol) to avoid self-hosting Kafka complexity
3. **Database**: Continue using Neon PostgreSQL (cloud-hosted) with schema migration; no database migration to cloud-provider-specific services
4. **Dapr State Store**: Use Redis for development/testing, cloud-native state store (Azure Cosmos DB or GCP Firestore) for production
5. **Event Schema**: Use JSON for event payloads (not Avro/Protobuf) for simplicity; can evolve later if needed
6. **Search Implementation**: Use PostgreSQL full-text search (tsvector/tsquery) for simplicity; Elasticsearch/Algolia are out of scope
7. **Recurring Tasks Logic**: Generate next occurrence immediately on completion (not on due date); skip missed occurrences if user doesn't complete on time
8. **Tag Storage**: Tags are stored as array in todos table (PostgreSQL array type); no separate many-to-many join table for Phase 5 (optimize later if needed)
9. **Authentication**: Continue using existing JWT-based auth from Phase 2; no changes to auth mechanism
10. **Frontend Framework**: Continue using existing Next.js frontend; add new UI components for advanced features without redesign

## Out of Scope

- **UI/UX Redesign**: Use existing Phase 2 frontend design patterns; no visual overhaul
- **AI Model Training**: No custom AI models for task prediction or smart suggestions
- **Complex Workflow Engines**: No BPMN/workflow orchestration (e.g., Temporal, Airflow)
- **Real-time Collaboration**: No multi-user simultaneous editing with CRDT/OT
- **Mobile Apps**: No native iOS/Android apps; continue with responsive web app only
- **Vendor Lock-in**: Avoid cloud-specific features that prevent portability (e.g., Azure-only APIs)
- **Advanced Analytics**: No BI dashboards, reports, or data warehouse integration
- **Third-Party Integrations**: No calendar sync (Google Calendar, Outlook), Slack notifications, etc.
- **Batch Processing**: No scheduled jobs for bulk operations (e.g., nightly reports)
- **GraphQL API**: Continue with REST API; no GraphQL layer for Phase 5

## Dependencies

- **External Services**:
  - Cloud Kubernetes cluster (AKS, GKE, or OCI)
  - Kafka-compatible service (Azure Event Hubs, GCP Pub/Sub, or self-hosted)
  - Dapr control plane (installed via Helm)
  - Neon PostgreSQL database (existing, requires schema migration)

- **Phase Completion**:
  - Phase 4 must be fully deployed and operational
  - Kubernetes manifests from Phase 4 serve as baseline

- **Libraries/Frameworks**:
  - Dapr Python SDK (`dapr-ext-grpc`, `dapr`)
  - Kafka Python client (`kafka-python` or `confluent-kafka`)
  - Dapr JavaScript SDK (for Next.js frontend if needed)
  - PostgreSQL migration tool (Alembic for Python backend)

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Event storm during high load causes Kafka backlog | High | Medium | Implement rate limiting, backpressure, and consumer auto-scaling |
| Dapr sidecar failures cascade to service failures | High | Low | Configure Dapr health checks, circuit breakers, and graceful degradation |
| Cloud costs exceed budget | Medium | High | Set resource quotas, use auto-scaling with max limits, monitor billing alerts |
| Schema migration causes downtime | High | Medium | Use zero-downtime migration (add columns first, backfill data, deploy code) |
| Recurring task logic creates duplicate todos | Medium | Medium | Implement idempotency keys and transaction-based task generation |
| Tag autocomplete degrades with 10,000+ unique tags | Low | Low | Implement tag pagination and cache frequent tags |
| Multi-cloud support complexity | Medium | Low | Start with single cloud provider; design abstractions for future portability |

## Technology Updates (Gap Fixes)

### Kafka/Redpanda Pub/Sub (GAP 8)
- **Message Broker**: Replaced Redis Pub/Sub with **Redpanda** (Kafka-compatible, lightweight)
- Redpanda deployed as StatefulSet in Kubernetes (`redpanda-deployment.yaml`)
- Dapr pubsub component changed from `pubsub.redis` to `pubsub.kafka` with brokers `redpanda:9092`
- Backend publishes events on CRUD operations (task-created, task-completed, task-deleted)
- Redis retained for Dapr state store only
- Redpanda provides Kafka API compatibility without JVM overhead

### Dapr Service Invocation (GAP 9)
- **Service Communication**: MCP server calls backend via Dapr service invocation
- URL pattern: `http://localhost:3500/v1.0/invoke/todo-backend/method/...`
- MCP deployment updated with Dapr sidecar annotations (`dapr.io/enabled: "true"`)
- `USE_DAPR` environment variable controls local vs K8s routing
- Backend already has Dapr sidecar from Phase 5 base deployment

### GitHub Actions CI/CD (GAP 10)
- **CI Pipeline** (`.github/workflows/ci.yml`):
  - Backend: Python 3.12 + lint + import verification
  - Frontend: Node 20 + TypeScript check + build
  - MCP Server: Python 3.12 + MCP SDK import verification
  - Triggers on push to feature branches and PRs to main
- **Docker Pipeline** (`.github/workflows/docker.yml`):
  - Builds Docker images for backend, frontend, and MCP server
  - Pushes to GitHub Container Registry (ghcr.io)
  - Triggers on push to main and version tags

### Urdu Language Support (GAP 11, +100 points)
- **MCP Server**: System prompt includes Urdu command examples and response patterns
- Unicode range detection (`\u0600-\u06FF`) for automatic language identification
- AI responds in Urdu when Urdu input is detected
- **Frontend (ChatPanel)**: RTL text direction for Urdu messages
- Example commands include Urdu phrases (e.g., "نیا کام شامل کرو", "میرے کام دکھاو")

### Voice Commands (GAP 12, +200 points)
- **Web Speech API** integration in ChatPanel component
- Microphone button with pulse animation when listening
- Speech-to-text fills chat input automatically
- Supports English (`en-US`) and Urdu (`ur-PK`) speech recognition
- Graceful fallback for browsers without Speech API support

## Exit Criteria

1. ✅ **Advanced Todo Features Work Correctly**:
   - Users can assign priority, add tags, set due dates, and create recurring todos
   - Search and filtering return accurate results
   - Recurring todos generate next occurrences automatically

2. ✅ **Events Are Published and Consumed Successfully**:
   - All todo lifecycle events (Created, Updated, Completed, Deleted) are published to Kafka
   - Event consumers process events without data loss
   - Failed events are routed to dead-letter queue

3. ✅ **Dapr Pub/Sub Is Operational**:
   - Dapr sidecars are running on all pods
   - Pub/sub component publishes to Kafka successfully
   - State store (Redis or cloud-native) stores and retrieves state correctly

4. ✅ **Application Runs on Cloud Kubernetes**:
   - All services deployed to AKS, GKE, or OCI
   - Frontend accessible via cloud load balancer
   - Auto-scaling configured and tested

5. ✅ **Existing Functionality Remains Intact**:
   - All Phase 1-4 APIs return identical responses
   - No breaking changes to existing endpoints
   - Legacy todos display correctly with default values for new fields
   - Database migration completes without data loss

---

**Next Steps After Specification Approval**:
1. Run `/sp.clarify` to resolve any ambiguities in the specification
2. Run `/sp.plan` to create detailed architecture and implementation plan
3. Run `/sp.tasks` to generate dependency-ordered task list
4. Run `/sp.implement` to execute Phase 5 implementation
