<!--
Sync Impact Report - Constitution Update

Version Change: 1.0.0 → 1.1.0
Rationale: Added Principle IX (Phase-Based Folder Organization) to enforce phase separation

Modified Principles: None
Added Sections:
  - Principle IX: Phase-Based Folder Organization (NON-NEGOTIABLE)
    - All implementation artifacts must be in phase-N/ folders
    - Specs remain in specs/ directory
    - Shared infrastructure stays at repository root

Removed Sections: None

Templates Status:
  ✅ spec-template.md - No changes needed
  ✅ plan-template.md - No changes needed
  ✅ tasks-template.md - File paths should reference phase-N/ directory
  ✅ All templates - Phase folder structure now enforced

Follow-up Actions:
  ✅ Phase 1 files moved to phase-1/ directory
  - Future phases must follow phase-N/ structure
  - Update project README to reflect folder organization

Previous Sync Impact Report (v1.0.0):
Version Change: [none] → 1.0.0
Rationale: Initial constitution for Hackathon 2: Spec-Driven Todo Application
Added: 8 core principles, development workflow, quality standards, governance
-->

# Hackathon 2: Spec-Driven Todo Application Constitution

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE)

All code MUST be preceded by a complete specification. No implementation work may begin without:
- Approved feature specification in `specs/<feature>/spec.md`
- Complete implementation plan in `specs/<feature>/plan.md`
- Task breakdown in `specs/<feature>/tasks.md`

**Rationale**: Spec-first development ensures alignment between business requirements and technical implementation before resources are committed. Bugs are treated as spec violations—either the code deviates from the spec, or the spec was incomplete. This eliminates the "we forgot to consider X" category of defects.

### II. Phase Discipline (NON-NEGOTIABLE)

Development MUST proceed through distinct phases with zero overlap:
1. **Specification Phase**: Define requirements, user stories, acceptance criteria
2. **Planning Phase**: Architecture, design decisions, technical approach
3. **Task Definition Phase**: Breakdown into testable, trackable work items
4. **Implementation Phase**: Execute tasks in dependency order
5. **Validation Phase**: Verify all acceptance criteria met

Each phase MUST have explicit exit criteria. No phase may begin until the prior phase is complete and approved.

**Rationale**: Phase discipline prevents premature optimization, scope creep, and rework. Clear boundaries ensure that design decisions are made with full context, and implementation follows a validated plan.

### III. Clear Exit Criteria (NON-NEGOTIABLE)

Every phase, task, and deliverable MUST define measurable completion criteria before work begins:
- Specifications: All user stories have acceptance scenarios; all edge cases documented; all "NEEDS CLARIFICATION" resolved
- Plans: All architectural decisions documented; all dependencies identified; Constitution Check passed
- Tasks: Success criteria stated; file paths specified; dependencies explicit
- Implementation: All tests pass; all acceptance criteria met; no TODOs in production code

**Rationale**: Ambiguous completion criteria lead to gold-plating, missed requirements, and unclear progress. Explicit exit criteria enable confident handoffs and prevent endless iteration.

### IV. Domain Consistency (NON-NEGOTIABLE)

Todo domain rules MUST remain consistent across all phases and artifacts:
- Todo entity structure defined in spec MUST match implementation
- Todo state transitions (pending → completed → archived) MUST be enforced uniformly
- Todo validation rules (title required, max length, etc.) MUST be consistent in API, database, and UI
- Domain terminology MUST be used consistently in specs, code, tests, and documentation

**Rationale**: Domain inconsistency is a primary source of bugs and confusion. A single source of truth for domain rules—established in the spec and enforced in all artifacts—eliminates an entire class of defects.

### V. Stateless Services, Database as Source of Truth

Application services MUST be stateless. All persistent state MUST reside in the database:
- No in-memory caching of domain entities (session state, request-scoped caching acceptable)
- All CRUD operations MUST interact with the database
- Services MUST be horizontally scalable without coordination
- Database schema MUST be versioned and migration-managed

**Rationale**: Stateless services enable horizontal scaling, simplify deployment, and eliminate session affinity requirements. Database-as-source-of-truth ensures consistency and enables Kubernetes-native patterns.

### VI. MCP Tool Constraint (NON-NEGOTIABLE)

AI agents MAY ONLY interact with the system through defined Model Context Protocol (MCP) tools:
- All database operations via SQLite MCP tools
- All file operations via Filesystem MCP tools
- All Git operations via Git MCP tools
- No direct shell commands for CRUD operations
- No agent-generated SQL outside MCP tools

**Rationale**: MCP tools enforce safe, auditable, and reversible operations. Direct shell access or ad-hoc SQL invites injection vulnerabilities, untracked changes, and context drift. Tool constraints create a security boundary and enable traceability.

### VII. Cloud-Native Readiness (NON-NEGOTIABLE)

All code and infrastructure MUST maintain compatibility with Kubernetes deployment:
- Dockerfiles MUST be present and functional
- Environment variables for all configuration (no hardcoded values)
- Healthcheck endpoints required for all services
- Logs to stdout/stderr (no file logging)
- Graceful shutdown handling (SIGTERM)
- Resource limits documented (CPU, memory)

**Rationale**: Kubernetes compatibility is non-negotiable for production deployment. Designing for cloud-native from the start avoids costly refactoring later. Healthchecks, log streaming, and graceful shutdown are table stakes for reliability.

### VIII. Process Over Features

For hackathon judging, demonstration of rigorous process is prioritized over feature completeness:
- Comprehensive specs count more than numerous features
- Complete, passing tests count more than untested features
- Clear architecture documentation counts more than clever code
- Traceable decision-making (ADRs, PHRs) counts more than volume of output

**Rationale**: Hackathon judging criteria explicitly reward disciplined process. Building one fully-specified, tested, documented feature demonstrates more engineering maturity than ten half-baked features.

### IX. Phase-Based Folder Organization (NON-NEGOTIABLE)

All implementation artifacts MUST be organized into phase-specific folders at the repository root:
- Phase 1 implementation files MUST reside in `phase-1/` directory
- Phase 2 implementation files MUST reside in `phase-2/` directory
- Phase N implementation files MUST reside in `phase-N/` directory
- Each phase folder contains: source code, README, configuration files, Dockerfile (if applicable)
- Specifications remain in `specs/` directory (not moved to phase folders)
- Shared infrastructure (`.specify/`, `history/`) remains at repository root

**Folder Structure Example**:
```
repository-root/
├── phase-1/              # Phase 1 implementation
│   ├── todo.py
│   └── README.md
├── phase-2/              # Phase 2 implementation (future)
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   └── README.md
├── specs/                # All specifications (shared)
│   └── 001-console-based-todo-app/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── .specify/             # Constitution and templates (shared)
└── history/              # PHRs and ADRs (shared)
```

**Rationale**: Phase-based folder organization provides clear separation of evolutionary stages, enables phase comparisons, simplifies rollback to previous phases, and demonstrates iterative development for hackathon judging. Each phase is self-contained and independently runnable.

## Development Workflow

### Phase 0: Feature Request
- User provides natural language description of desired functionality
- Run `/sp.specify` to generate initial specification draft
- Clarify ambiguities using AskUserQuestion tool
- Iterate until spec is complete and approved

**Exit Criteria**: Spec file exists in `specs/<feature>/spec.md`; all user stories have acceptance scenarios; all "NEEDS CLARIFICATION" resolved; user approval obtained.

### Phase 1: Specification Refinement
- Review generated spec for completeness
- Identify missing edge cases, functional requirements, or success criteria
- Run `/sp.clarify` if needed to address underspecified areas
- Update spec based on clarification responses

**Exit Criteria**: All functional requirements numbered and testable; all edge cases documented; all entities defined; success criteria measurable; no ambiguous language.

### Phase 2: Implementation Planning
- Run `/sp.plan` to generate architecture and design artifacts
- Research technical approach (language, framework, dependencies)
- Document key decisions with rationale
- Pass Constitution Check (validate against all 8 core principles)
- Identify ADR-worthy decisions and run `/sp.adr` with user consent

**Exit Criteria**: Plan file exists in `specs/<feature>/plan.md`; all placeholders resolved; technical stack specified; Constitution Check passed; architectural decisions documented; user approval obtained.

### Phase 3: Task Breakdown
- Run `/sp.tasks` to generate actionable task list
- Ensure tasks are organized by user story priority
- Verify each task has file paths, dependencies, and success criteria
- Confirm foundational tasks block user story work appropriately

**Exit Criteria**: Tasks file exists in `specs/<feature>/tasks.md`; all tasks have clear success criteria; dependencies explicit; file paths specified; no vague or ambiguous tasks.

### Phase 4: Implementation
- Execute tasks in dependency order
- Mark tasks in-progress using TodoWrite tool before starting
- Mark tasks completed immediately after finishing
- Run `/sp.implement` for guided execution (optional)
- Create commits after each logical task or task group
- Never mark a task completed if tests fail or errors remain

**Exit Criteria**: All tasks marked completed; all acceptance criteria from spec met; all tests passing; no TODO comments in production code; code committed to feature branch.

### Phase 5: Validation and Delivery
- Run full test suite (unit, integration, contract tests if present)
- Validate against all acceptance scenarios in spec
- Generate final validation checklist using `/sp.checklist`
- Create pull request with reference to spec
- Merge only after all checks pass

**Exit Criteria**: All tests passing; all acceptance scenarios validated; PR approved and merged; feature deployed or deployable.

## Quality Standards

### Testing Requirements
- **Unit Tests**: OPTIONAL (only if explicitly requested in spec)
- **Integration Tests**: OPTIONAL (only if explicitly requested in spec)
- **Contract Tests**: OPTIONAL (only if explicitly requested in spec)
- **Acceptance Validation**: MANDATORY for all features (validate against spec scenarios)
- **Test-First Discipline**: If tests are included, they MUST be written before implementation and MUST fail before code is added

### Documentation Requirements
- **Specification**: MANDATORY for every feature (`specs/<feature>/spec.md`)
- **Implementation Plan**: MANDATORY for every feature (`specs/<feature>/plan.md`)
- **Task List**: MANDATORY for every feature (`specs/<feature>/tasks.md`)
- **README**: MANDATORY for project-level guidance
- **API Documentation**: MANDATORY for all public endpoints (in plan or contracts/)
- **ADRs**: MANDATORY for architecturally significant decisions (with user consent)
- **PHRs**: MANDATORY for every user request (auto-generated after work completion)

### Observability Requirements
- All critical operations MUST log at appropriate levels (INFO, WARN, ERROR)
- All database operations MUST be traceable via logs or query logs
- All API endpoints MUST log request/response (excluding sensitive data)
- All errors MUST include context (stack trace, request ID, user ID if applicable)
- Logs MUST be structured (JSON preferred) for parsing

## Governance

### Constitution Supremacy
This constitution supersedes all other practices, preferences, or conventions. When in conflict, constitution principles take precedence.

### Amendment Process
- Amendments require explicit user approval
- Version must be incremented per semantic versioning:
  - **MAJOR**: Backward-incompatible principle changes
  - **MINOR**: New principle or section added
  - **PATCH**: Clarifications, wording fixes, non-semantic refinements
- All dependent templates MUST be reviewed and updated for consistency
- Amendment rationale MUST be documented in Sync Impact Report
- Use `/sp.constitution` to propose and apply amendments

### Compliance Review
- All PRs and code reviews MUST verify compliance with this constitution
- Constitution Check gate in plan phase MUST pass before implementation begins
- Complexity that violates principles MUST be explicitly justified in plan
- Unjustified violations result in rejected PRs

### Enforcement
- Agents MUST follow constitution principles in all generated artifacts
- Users MAY override constitution for specific cases with explicit justification
- Repeated violations indicate constitution is too strict or unclear—consider amendment

**Version**: 1.1.0 | **Ratified**: 2025-12-30 | **Last Amended**: 2025-12-30
