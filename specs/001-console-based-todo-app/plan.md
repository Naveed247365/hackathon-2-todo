# Implementation Plan: Console-Based Todo Application

**Branch**: `001-console-based-todo-app` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-console-based-todo-app/spec.md`

## Summary

Build a beginner-friendly Python console application for managing todos with full CRUD operations. The application stores todos in-memory using Python dictionaries, provides a command-loop interface, and implements strict domain rules for todo entity management. No external dependencies, no persistence, no testing framework - focus on clean, readable code that demonstrates rigorous process adherence.

**Technical Approach**: Single-file Python script with clear separation of concerns (data storage, business logic, user interface). Use Python's built-in data structures (dict for todo storage, int for ID counter) and standard library modules (sys for exit handling, signal for Ctrl+C handling).

## Technical Context

**Language/Version**: Python 3.8 or higher
**Primary Dependencies**: None (Python standard library only)
**Storage**: In-memory Python dictionary (key: todo_id, value: todo dict)
**Testing**: Manual acceptance testing (no pytest, no unittest per spec non-goals)
**Target Platform**: Cross-platform console (Windows, macOS, Linux terminals)
**Project Type**: Single-file application
**Performance Goals**: < 100ms response time for all operations; handle 100 todos without degradation (< 1 second for list)
**Constraints**: No external dependencies; no file I/O; no persistence; no GUI/web/API
**Scale/Scope**: Single-user, single-process, in-memory only

## Constitution Check

*GATE: Must pass before implementation begins. Re-checked after design decisions.*

### Principle I: Spec-First Development ✅
- Spec complete and approved in `specs/001-console-based-todo-app/spec.md`
- All user stories, functional requirements, and domain rules documented
- No code written before spec approval

### Principle II: Phase Discipline ✅
- Specification Phase: COMPLETE
- Planning Phase: IN PROGRESS (this document)
- Task Definition Phase: BLOCKED (awaits plan approval)
- Implementation Phase: BLOCKED (awaits tasks definition)
- Validation Phase: BLOCKED (awaits implementation)

### Principle III: Clear Exit Criteria ✅
- **Plan Exit Criteria**: All placeholders resolved; technical stack specified; constitution check passed; user approval obtained
- **Implementation Exit Criteria**: All acceptance scenarios from spec validated manually; code runs without errors; PEP 8 compliant

### Principle IV: Domain Consistency ✅
- **Todo Entity**: Implemented as Python dict with keys: `id` (int), `title` (str), `status` (str: "pending"|"completed")
- **State Transitions**: Enforced in `complete_todo()` function (pending → completed only)
- **Validation Rules**: Enforced in `add_todo()` and `update_todo()` (non-empty title after strip, positive integer ID)
- **ID Assignment**: Global counter `next_id` starts at 1, increments, never reused
- **Terminology**: "todo", "pending", "completed", "id", "title", "status" used consistently

### Principle V: Stateless Services ✅
- N/A for Phase 1 (single-process, no services)
- In-memory storage acceptable for console application
- No service-to-service communication

### Principle VI: MCP Tool Constraint ✅
- N/A for Phase 1 (no AI agent interaction required)
- Future phases will integrate MCP tools for SQLite persistence

### Principle VII: Cloud-Native Readiness ⚠️
- N/A for Phase 1 (no deployment per spec non-goals)
- **Justification**: Phase 1 is console-only prototype; Docker/Kubernetes deferred to future phases
- **Future Consideration**: Phase 2+ will add Dockerfile and environment variable configuration

### Principle VIII: Process Over Features ✅
- Comprehensive spec with 4 prioritized user stories, 15 functional requirements, explicit domain rules
- This plan focuses on minimal, verifiable implementation
- Manual acceptance testing documented for hackathon judging
- No feature creep beyond spec scope

**Constitution Check Result**: ✅ PASS (with justified N/A for Principles V, VI, VII per Phase 1 scope)

## Project Structure

### Documentation (this feature)

```text
specs/001-console-based-todo-app/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (IN PROGRESS)
└── tasks.md             # Task breakdown (PENDING - created by /sp.tasks)
```

### Source Code (repository root)

```text
todo.py                  # Single-file application (all code in one file)
README.md                # Project-level documentation
.specify/                # Constitution and templates (existing)
history/                 # PHRs and ADRs (existing)
```

**Structure Decision**: Single-file architecture chosen for Phase 1 because:
1. **Simplicity**: Beginner-friendly (user requirement)
2. **Scope**: Only ~200-300 lines of code expected
3. **No Modules**: Python standard library only, no package structure needed
4. **Clarity**: All code visible in one place for review/judging

Future phases will refactor into modular structure (`src/models/`, `src/services/`, `src/cli/`) when adding persistence and API layers.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | N/A        | N/A                                 |

## Design Decisions

### 1. Data Structure Choice

**Decision**: Use a dictionary for todo storage with integer keys (todo IDs) and dict values (todo objects).

**Rationale**:
- O(1) lookup by ID for complete/update/delete operations (spec requirement: < 100ms response)
- Simple iteration for list operation
- Beginner-friendly: basic Python data structure, no classes needed initially
- Memory efficient for 100 todos (spec performance requirement)

**Implementation**:
```python
todos = {}  # {id: {"id": int, "title": str, "status": str}}
next_id = 1  # Global counter for ID assignment
```

**Alternatives Considered**:
- List of dicts: Rejected (O(n) lookup, slower for 100 todos)
- Dataclass: Rejected (unnecessary complexity for Phase 1, no serialization needed)
- Named tuple: Rejected (immutable, can't update title/status)

### 2. Command Interface Design

**Decision**: Simple command-loop with verb-based commands and positional arguments.

**Command Format**:
- `add <title>` - Add new todo
- `list` - List all todos
- `complete <id>` - Mark todo as completed
- `update <id> <new_title>` - Update todo title
- `delete <id>` - Delete todo
- `help` - Show usage
- `exit` or `quit` - Exit application

**Rationale**:
- Minimal learning curve (beginner-friendly requirement)
- No argument parsing library needed (standard library only)
- Clear, verb-first structure mirrors Git/Unix conventions
- Easy to validate and error-handle

**Input Parsing**:
```python
user_input = input("> ").strip()
parts = user_input.split(maxsplit=1)  # ["command", "args"]
command = parts[0].lower()
args = parts[1] if len(parts) > 1 else ""
```

**Alternatives Considered**:
- argparse module: Rejected (overkill for REPL, designed for CLI args)
- Natural language: Rejected (spec non-goal: no AI)
- Menu-driven UI: Rejected (less efficient than direct commands)

### 3. Error Handling Strategy

**Decision**: Validate inputs before operations; display clear error messages; never crash.

**Validation Functions**:
- `validate_title(title)`: Check non-empty after strip (FR-008)
- `validate_id(id_str)`: Check positive integer (FR-009)
- `find_todo(todo_id)`: Check todo exists (FR-010)

**Error Message Format**:
```
Error: <specific problem>
```

**Rationale**:
- Spec requirement: "appropriate error messages for invalid operations" (FR-010)
- User experience: immediate, actionable feedback
- Simplicity: no exception hierarchies, just print and continue loop

**Edge Cases Handled** (per spec):
- Invalid command → "Unknown command. Type 'help' for usage."
- Non-numeric ID → "Invalid ID: must be a positive integer"
- Todo not found → "Todo with ID X not found"
- Empty title → "Title cannot be empty"
- Already completed → "Todo is already completed"

### 4. Display Format

**Decision**: Tabular format with columns for ID, Title, and Status.

**Example Output**:
```
ID | Title                | Status
---+----------------------+-----------
1  | Buy groceries        | pending
2  | Write documentation  | completed
3  | Review pull request  | pending
```

**Rationale**:
- Spec requirement: "list all todos showing ID, title, and status" (FR-004)
- Readability: columns aligned, easy to scan
- Simplicity: no external table libraries, use string formatting

**Implementation**:
```python
print(f"{id:3} | {title:20} | {status}")
```

**Alternatives Considered**:
- JSON output: Rejected (not beginner-friendly, spec implies human-readable)
- CSV format: Rejected (no export requirement in spec)
- Rich library: Rejected (external dependency)

### 5. Exit Handling

**Decision**: Graceful exit on `exit`/`quit` commands and Ctrl+C/Ctrl+D.

**Implementation**:
- `exit`/`quit` command: `print("Goodbye!")` then `sys.exit(0)`
- Ctrl+C: Signal handler with `signal.signal(signal.SIGINT, ...)`
- Ctrl+D (EOF): `try/except EOFError` on input()

**Rationale**:
- Spec requirement: "exits cleanly... with no stack traces or error messages" (SC-007)
- Edge case requirement: "exits gracefully with 'Goodbye!' message"
- User experience: no Python tracebacks visible to user

### 6. Code Organization (Single File)

**Decision**: Organize todo.py into logical sections with clear separation of concerns.

**File Structure**:
```python
# 1. Imports (sys, signal)
# 2. Global state (todos dict, next_id counter)
# 3. Validation functions (validate_title, validate_id)
# 4. CRUD functions (add_todo, list_todos, complete_todo, update_todo, delete_todo)
# 5. Command handler (handle_command)
# 6. Main loop (main function)
# 7. Entry point (if __name__ == "__main__")
```

**Rationale**:
- Clear separation even in single file
- Top-to-bottom readability
- Functions grouped by responsibility
- Beginner-friendly: standard Python script structure

**Alternatives Considered**:
- Class-based design: Rejected (unnecessary for Phase 1, adds complexity)
- Separate modules: Rejected (overkill for ~300 lines, single file per user requirement)

## Implementation Strategy

### Minimal Viable Approach

Per constitution Principle VIII (Process Over Features) and user requirement "keep the plan minimal and beginner-friendly":

1. **One file**: `todo.py` contains all code
2. **No classes**: Use functions and global state (dict, counter)
3. **No external dependencies**: Python 3.8+ standard library only
4. **No tests**: Manual acceptance testing (per spec non-goals)
5. **No logging framework**: Use print() for all output
6. **No config files**: No .env, no settings (not needed for Phase 1)

### Verification Strategy

Per user requirement "one step must be verifiable before moving to the next":

Each implementation task will include a verification command:
- After implementing `add` command: Run `python todo.py`, type `add Test`, verify confirmation
- After implementing `list` command: Add 2 todos, type `list`, verify both appear
- After implementing `complete` command: Add todo, complete it, list, verify status changed
- After implementing `update` command: Add todo, update title, list, verify new title
- After implementing `delete` command: Add 2 todos, delete one, list, verify only one remains

**Exit Criteria for Each Step**: Command works correctly for happy path + displays appropriate error for edge cases.

## Acceptance Testing Plan

Manual testing without test framework (per spec non-goal). Each user story has explicit test scenarios:

### User Story 1 (P1) - Create and List Todos
**Test Steps**:
1. Launch: `python todo.py`
2. Add todo: `add Buy groceries` → Verify confirmation displayed
3. Add todo: `add Write code` → Verify confirmation displayed
4. Add todo: `add Review PR` → Verify confirmation displayed
5. List todos: `list` → Verify all 3 displayed with IDs (1, 2, 3), titles, status "pending"
6. Exit: `exit` → Verify "Goodbye!" displayed

**Expected Output**:
```
> add Buy groceries
Added todo #1: Buy groceries
> list
ID | Title           | Status
---+-----------------+--------
1  | Buy groceries   | pending
2  | Write code      | pending
3  | Review PR       | pending
```

**Edge Case Tests**:
- Empty title: `add ` → "Error: Title cannot be empty"
- Empty list: Launch, `list` → "No todos found"

### User Story 2 (P2) - Mark Todos as Completed
**Test Steps**:
1. Create 3 todos (from Story 1)
2. Complete todo: `complete 1` → Verify confirmation
3. Complete todo: `complete 2` → Verify confirmation
4. List todos: `list` → Verify IDs 1,2 show "completed", ID 3 shows "pending"

**Edge Case Tests**:
- Non-existent ID: `complete 99` → "Error: Todo with ID 99 not found"
- Already completed: `complete 1` (twice) → "Todo is already completed"
- Invalid ID: `complete abc` → "Error: Invalid ID: must be a positive integer"

### User Story 3 (P3) - Update Todo Title
**Test Steps**:
1. Add todo: `add Buy milk`
2. Update todo: `update 1 Buy almond milk` → Verify confirmation
3. List todos: `list` → Verify title changed to "Buy almond milk"

**Edge Case Tests**:
- Non-existent ID: `update 99 New title` → "Error: Todo with ID 99 not found"
- Empty title: `update 1 ` → "Error: Title cannot be empty"

### User Story 4 (P4) - Delete Todos
**Test Steps**:
1. Add 4 todos
2. Delete todo: `delete 2` → Verify confirmation
3. Delete todo: `delete 4` → Verify confirmation
4. List todos: `list` → Verify only IDs 1,3 remain (IDs not renumbered)

**Edge Case Tests**:
- Non-existent ID: `delete 99` → "Error: Todo with ID 99 not found"

### Additional Edge Case Tests
- Unknown command: `foo` → "Unknown command. Type 'help' for usage."
- Help command: `help` → Display usage information
- Long title (500+ chars): Verify accepted and displayed (truncate in list if needed)
- Unicode title: `add 日本語 タスク` → Verify accepted and displayed correctly
- Ctrl+C: Press Ctrl+C → "Goodbye!" and exit
- Exit commands: `exit` or `quit` → "Goodbye!" and exit

### Performance Test (SC-006)
**Test Steps**:
1. Add 100 todos using a loop or repeated commands
2. List todos: `list` → Verify completes in < 1 second

## Dependencies & Build

**Dependencies**: None (Python 3.8+ standard library only)

**Build/Compilation**: Not required (interpreted language)

**Execution**:
```bash
python todo.py
# Or with explicit version:
python3 todo.py
```

**Environment Requirements**:
- Python 3.8 or higher installed
- Terminal/console access
- No virtual environment needed (no external packages)

## Risks & Mitigations

### Risk 1: Unicode Display Issues
**Impact**: Spec requires "Unicode/special characters" support (edge case)
**Likelihood**: Medium (depends on terminal encoding)
**Mitigation**: Use UTF-8 encoding for input/output; test on Windows/Mac/Linux terminals
**Fallback**: Document terminal configuration requirements in README if issues persist

### Risk 2: Very Long Titles Break Display
**Impact**: Spec mentions "very long title (500+ characters)"
**Likelihood**: Low (uncommon use case)
**Mitigation**: Truncate titles in list view to 50 chars with "..." indicator
**Acceptance**: Full title stored in memory, only display truncated

### Risk 3: Ctrl+C Handler Platform Differences
**Impact**: Graceful exit requirement (SC-007)
**Likelihood**: Low (signal module cross-platform)
**Mitigation**: Test on Windows, macOS, Linux; use try/except KeyboardInterrupt as fallback
**Fallback**: Document known issues if platform-specific behavior found

## Plan Completeness Checklist

- ✅ Technical context fully specified (Python 3.8+, standard library, in-memory dict)
- ✅ Constitution Check passed for all 8 principles
- ✅ Project structure defined (single-file todo.py)
- ✅ Design decisions documented with rationale (data structures, commands, error handling, display, exit handling, code organization)
- ✅ Implementation strategy minimal and beginner-friendly
- ✅ Verification strategy for incremental development
- ✅ Acceptance testing plan maps to all user stories and edge cases
- ✅ No placeholders or "NEEDS CLARIFICATION" markers
- ✅ No scope expansion beyond spec
- ✅ All decisions traceable to spec requirements

**Status**: Ready for Task Definition Phase (Phase 3 per constitution workflow)

**Next Step**: Run `/sp.tasks` to generate actionable task breakdown with file paths, dependencies, and success criteria.
