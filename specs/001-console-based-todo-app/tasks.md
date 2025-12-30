---
description: "Task list for Console-Based Todo Application (Phase 1)"
---

# Tasks: Console-Based Todo Application

**Input**: Design documents from `/specs/001-console-based-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Manual acceptance testing only (no automated tests per spec non-goals)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different code sections, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions (single file: `todo.py`)

## Path Conventions

- **Single file application**: All code in `todo.py` at repository root
- All tasks modify the same file but different sections/functions

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create file structure and basic skeleton

- [ ] T001 Create `todo.py` file at repository root with file header comment
  - **Success**: File exists, contains project description comment
  - **Verification**: `ls todo.py` shows file exists

- [ ] T002 Add shebang and imports section to `todo.py` (sys, signal modules)
  - **Success**: File starts with `#!/usr/bin/env python3` and import statements
  - **Verification**: `python todo.py` runs without import errors

- [ ] T003 Initialize global state in `todo.py` (empty todos dict, next_id = 1)
  - **Success**: Global variables `todos = {}` and `next_id = 1` defined
  - **Verification**: File contains global state section with correct initialization

**Checkpoint**: Basic file structure ready, imports work, global state initialized

---

## Phase 2: Foundational (Core Infrastructure)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Implement `validate_title(title)` function in `todo.py`
  - **Success**: Returns True if title non-empty after strip, False otherwise
  - **Verification**: Manually test: `validate_title("  ")` returns False, `validate_title("Task")` returns True
  - **Domain Rule**: Title MUST be non-empty after stripping whitespace (per spec)

- [ ] T005 Implement `validate_id(id_str)` function in `todo.py`
  - **Success**: Returns integer if valid positive int, None otherwise
  - **Verification**: Manually test: `validate_id("5")` returns 5, `validate_id("abc")` returns None
  - **Domain Rule**: ID MUST be positive integer (per spec)

- [ ] T006 Implement `find_todo(todo_id)` function in `todo.py`
  - **Success**: Returns todo dict if found, None otherwise
  - **Verification**: Manually test with sample todos dict
  - **Domain Rule**: Todo lookup by ID (per spec)

- [ ] T007 Implement `show_help()` function in `todo.py`
  - **Success**: Prints usage information for all commands
  - **Verification**: Call function, verify output shows command syntax
  - **Requirement**: FR-013 (help message for unknown commands)

- [ ] T008 Implement main command loop in `main()` function in `todo.py`
  - **Success**: Infinite loop with `input("> ")`, splits command and args, handles exit/quit
  - **Verification**: Run `python todo.py`, enter `exit`, verify "Goodbye!" and clean exit
  - **Requirements**: FR-011 (command loop), FR-012 (exit command)

- [ ] T009 Add signal handler for Ctrl+C in `todo.py`
  - **Success**: `signal.signal(signal.SIGINT, handler)` catches Ctrl+C, prints "Goodbye!", exits
  - **Verification**: Run app, press Ctrl+C, verify graceful exit with message
  - **Requirement**: Edge case (Ctrl+C graceful exit)

- [ ] T010 Add try/except EOFError for Ctrl+D in `main()` loop in `todo.py`
  - **Success**: Catches EOFError on input(), prints "Goodbye!", exits
  - **Verification**: Run app, press Ctrl+D (Unix) or Ctrl+Z (Windows), verify graceful exit
  - **Requirement**: Edge case (Ctrl+D graceful exit)

- [ ] T011 Implement command dispatcher in `handle_command(command, args)` function in `todo.py`
  - **Success**: Routes commands to appropriate functions, calls `show_help()` for unknown commands
  - **Verification**: Run app, enter unknown command, verify help message displayed
  - **Requirement**: FR-013 (unknown command handling)

**Checkpoint**: Foundation ready - validation works, command loop runs, exit handlers work, help displays

---

## Phase 3: User Story 1 - Create and List Todos (Priority: P1) 🎯 MVP

**Goal**: User can add todos and see a list of all todos

**Independent Test**: Run app, add 3 todos, list them, verify all appear with status "pending"

### Implementation for User Story 1

- [ ] T012 [US1] Implement `add_todo(title)` function in `todo.py`
  - **Success**: Creates todo dict with id, title, status="pending"; increments next_id; stores in todos dict
  - **Verification**: Call function with "Test task", verify todos dict contains entry with id=1
  - **Domain Rules**:
    - ID starts at 1, auto-increments (spec: Todo ID Assignment)
    - Status defaults to "pending" (spec: Todo State Transitions)
    - Title stored as-is after validation
  - **Requirements**: FR-001 (add command), FR-002 (auto-increment ID), FR-003 (in-memory storage)

- [ ] T013 [US1] Add title validation to `add_todo()` in `todo.py`
  - **Success**: Calls `validate_title()`, prints error if invalid, returns without creating todo
  - **Verification**: Call with empty title, verify error "Title cannot be empty" and no todo created
  - **Domain Rule**: Title MUST be non-empty after strip (spec: Todo Validation Rules)
  - **Requirement**: FR-008 (validate title)

- [ ] T014 [US1] Add `add` command handler to `handle_command()` in `todo.py`
  - **Success**: Extracts title from args, calls `add_todo()`, prints confirmation
  - **Verification**: Run app, type `add Buy groceries`, verify confirmation "Added todo #1: Buy groceries"
  - **Acceptance**: Spec User Story 1, Scenario 1

- [ ] T015 [US1] Implement `list_todos()` function in `todo.py`
  - **Success**: Prints table header (ID | Title | Status), iterates todos dict, prints each row
  - **Verification**: Manually populate todos dict, call function, verify tabular output
  - **Requirement**: FR-004 (list todos with ID, title, status)

- [ ] T016 [US1] Handle empty list case in `list_todos()` in `todo.py`
  - **Success**: Checks if todos dict empty, prints "No todos found" instead of table
  - **Verification**: Run app with empty todos, type `list`, verify "No todos found" message
  - **Acceptance**: Spec User Story 1, Scenario 3
  - **Requirement**: FR-010 (appropriate error messages)

- [ ] T017 [US1] Add `list` command handler to `handle_command()` in `todo.py`
  - **Success**: Calls `list_todos()` when command is "list"
  - **Verification**: Run app, add 2 todos, type `list`, verify both displayed
  - **Acceptance**: Spec User Story 1, Scenario 2

**Checkpoint**: User Story 1 complete - can add todos and list them; empty title rejected; empty list handled

**Manual Acceptance Test for US1**:
1. Run `python todo.py`
2. Type `add Buy groceries` → Verify confirmation
3. Type `add Write code` → Verify confirmation
4. Type `list` → Verify 2 todos with IDs 1,2, status "pending"
5. Type `add ` (empty) → Verify error "Title cannot be empty"
6. Exit and restart app
7. Type `list` → Verify "No todos found"

---

## Phase 4: User Story 2 - Mark Todos as Completed (Priority: P2)

**Goal**: User can mark todos as completed

**Independent Test**: Add 3 todos, mark 2 as completed, list, verify status shows "completed"

### Implementation for User Story 2

- [ ] T018 [US2] Implement `complete_todo(todo_id)` function in `todo.py`
  - **Success**: Finds todo by ID, checks if already completed, updates status to "completed"
  - **Verification**: Manually create pending todo, call function, verify status changes to "completed"
  - **Domain Rule**: Status transitions from "pending" to "completed" only (spec: Todo State Transitions)
  - **Requirement**: FR-005 (mark completed by ID)

- [ ] T019 [US2] Add ID validation to `complete_todo()` in `todo.py`
  - **Success**: Calls `validate_id()`, prints error if invalid, returns without completing
  - **Verification**: Call with "abc", verify error "Invalid ID: must be a positive integer"
  - **Domain Rule**: ID MUST be positive integer (spec: Todo Validation Rules)
  - **Requirement**: FR-009 (validate ID)

- [ ] T020 [US2] Add todo-not-found check to `complete_todo()` in `todo.py`
  - **Success**: Calls `find_todo()`, prints error if None, returns without completing
  - **Verification**: Call with ID 99, verify error "Todo with ID 99 not found"
  - **Acceptance**: Spec User Story 2, Scenario 2
  - **Requirement**: FR-010 (appropriate error messages)

- [ ] T021 [US2] Add already-completed check to `complete_todo()` in `todo.py`
  - **Success**: Checks if status already "completed", prints message, returns
  - **Verification**: Complete same todo twice, verify "Todo is already completed" on second attempt
  - **Acceptance**: Spec User Story 2, Scenario 3

- [ ] T022 [US2] Add success confirmation to `complete_todo()` in `todo.py`
  - **Success**: Prints "Marked todo #X as completed" after updating status
  - **Verification**: Complete pending todo, verify confirmation message
  - **Acceptance**: Spec User Story 2, Scenario 1

- [ ] T023 [US2] Add `complete` command handler to `handle_command()` in `todo.py`
  - **Success**: Extracts ID from args, calls `complete_todo()`
  - **Verification**: Run app, add todo, type `complete 1`, list, verify status "completed"
  - **Acceptance**: Spec User Story 2, Scenario 1

**Checkpoint**: User Story 2 complete - can mark todos completed; invalid ID rejected; not-found handled; already-completed handled

**Manual Acceptance Test for US2**:
1. Run `python todo.py`
2. Type `add Task 1`, `add Task 2`, `add Task 3`
3. Type `complete 1` → Verify confirmation
4. Type `complete 2` → Verify confirmation
5. Type `list` → Verify IDs 1,2 show "completed", ID 3 shows "pending"
6. Type `complete 99` → Verify error "Todo with ID 99 not found"
7. Type `complete 1` again → Verify "Todo is already completed"
8. Type `complete abc` → Verify error "Invalid ID: must be a positive integer"

---

## Phase 5: User Story 3 - Update Todo Title (Priority: P3)

**Goal**: User can update todo title

**Independent Test**: Add todo "Buy milk", update to "Buy almond milk", list, verify title changed

### Implementation for User Story 3

- [ ] T024 [US3] Implement `update_todo(todo_id, new_title)` function in `todo.py`
  - **Success**: Finds todo by ID, validates new title, updates title field
  - **Verification**: Create todo, call function with new title, verify todo dict updated
  - **Requirement**: FR-006 (update title by ID)

- [ ] T025 [US3] Add ID validation to `update_todo()` in `todo.py`
  - **Success**: Calls `validate_id()`, prints error if invalid, returns without updating
  - **Verification**: Call with "abc", verify error "Invalid ID: must be a positive integer"
  - **Domain Rule**: ID MUST be positive integer (spec: Todo Validation Rules)
  - **Requirement**: FR-009 (validate ID)

- [ ] T026 [US3] Add todo-not-found check to `update_todo()` in `todo.py`
  - **Success**: Calls `find_todo()`, prints error if None, returns without updating
  - **Verification**: Call with ID 99, verify error "Todo with ID 99 not found"
  - **Acceptance**: Spec User Story 3, Scenario 2
  - **Requirement**: FR-010 (appropriate error messages)

- [ ] T027 [US3] Add title validation to `update_todo()` in `todo.py`
  - **Success**: Calls `validate_title()` on new title, prints error if invalid, returns without updating
  - **Verification**: Call with empty title, verify error "Title cannot be empty" and todo unchanged
  - **Acceptance**: Spec User Story 3, Scenario 3
  - **Domain Rule**: Title MUST be non-empty after strip (spec: Todo Validation Rules)
  - **Requirement**: FR-008 (validate title)

- [ ] T028 [US3] Add success confirmation to `update_todo()` in `todo.py`
  - **Success**: Prints "Updated todo #X: <new_title>" after updating
  - **Verification**: Update todo title, verify confirmation message
  - **Acceptance**: Spec User Story 3, Scenario 1

- [ ] T029 [US3] Add `update` command handler to `handle_command()` in `todo.py`
  - **Success**: Extracts ID and new title from args, calls `update_todo()`
  - **Verification**: Run app, add todo, type `update 1 New title`, list, verify title changed
  - **Acceptance**: Spec User Story 3, Scenario 1

**Checkpoint**: User Story 3 complete - can update titles; invalid ID/title rejected; not-found handled

**Manual Acceptance Test for US3**:
1. Run `python todo.py`
2. Type `add Buy milk`
3. Type `update 1 Buy almond milk` → Verify confirmation
4. Type `list` → Verify title changed to "Buy almond milk"
5. Type `update 99 Test` → Verify error "Todo with ID 99 not found"
6. Type `update 1 ` (empty) → Verify error "Title cannot be empty" and title unchanged
7. Type `update abc Test` → Verify error "Invalid ID: must be a positive integer"

---

## Phase 6: User Story 4 - Delete Todos (Priority: P4)

**Goal**: User can delete todos

**Independent Test**: Add 4 todos, delete 2, list, verify only 2 remain with original IDs

### Implementation for User Story 4

- [ ] T030 [US4] Implement `delete_todo(todo_id)` function in `todo.py`
  - **Success**: Finds todo by ID, removes from todos dict using `del todos[todo_id]`
  - **Verification**: Create 2 todos, call function with ID 1, verify todos dict only has ID 2
  - **Domain Rule**: IDs not reused or renumbered after deletion (spec: Todo ID Assignment)
  - **Requirement**: FR-007 (delete by ID)

- [ ] T031 [US4] Add ID validation to `delete_todo()` in `todo.py`
  - **Success**: Calls `validate_id()`, prints error if invalid, returns without deleting
  - **Verification**: Call with "abc", verify error "Invalid ID: must be a positive integer"
  - **Domain Rule**: ID MUST be positive integer (spec: Todo Validation Rules)
  - **Requirement**: FR-009 (validate ID)

- [ ] T032 [US4] Add todo-not-found check to `delete_todo()` in `todo.py`
  - **Success**: Calls `find_todo()`, prints error if None, returns without deleting
  - **Verification**: Call with ID 99, verify error "Todo with ID 99 not found"
  - **Acceptance**: Spec User Story 4, Scenario 2
  - **Requirement**: FR-010 (appropriate error messages)

- [ ] T033 [US4] Add success confirmation to `delete_todo()` in `todo.py`
  - **Success**: Prints "Deleted todo #X" after deletion
  - **Verification**: Delete todo, verify confirmation message
  - **Acceptance**: Spec User Story 4, Scenario 1

- [ ] T034 [US4] Add `delete` command handler to `handle_command()` in `todo.py`
  - **Success**: Extracts ID from args, calls `delete_todo()`
  - **Verification**: Run app, add 2 todos, type `delete 1`, list, verify only ID 2 remains
  - **Acceptance**: Spec User Story 4, Scenario 1

**Checkpoint**: User Story 4 complete - can delete todos; invalid ID rejected; not-found handled; IDs not renumbered

**Manual Acceptance Test for US4**:
1. Run `python todo.py`
2. Type `add Task 1`, `add Task 2`, `add Task 3`, `add Task 4`
3. Type `delete 2` → Verify confirmation
4. Type `delete 4` → Verify confirmation
5. Type `list` → Verify only IDs 1,3 remain (no renumbering)
6. Type `delete 99` → Verify error "Todo with ID 99 not found"
7. Type `delete abc` → Verify error "Invalid ID: must be a positive integer"

---

## Phase 7: Polish & Final Validation

**Purpose**: Final touches and full acceptance testing

- [ ] T035 Add docstring comments to all functions in `todo.py`
  - **Success**: Each function has brief docstring explaining purpose
  - **Verification**: Read file, verify all functions documented
  - **Requirement**: SC-005 (clean, readable code)

- [ ] T036 Verify PEP 8 compliance for `todo.py`
  - **Success**: Function/variable names follow snake_case, no unused imports, proper spacing
  - **Verification**: Manual review or run `python -m py_compile todo.py` (checks syntax)
  - **Requirement**: SC-005 (follows PEP 8 naming conventions)

- [ ] T037 Test Unicode and special characters in titles
  - **Success**: Add todo with title "日本語 タスク", list, verify displays correctly
  - **Verification**: Run app, type `add 日本語 タスク`, list, verify UTF-8 display works
  - **Edge Case**: Spec edge case (Unicode support)

- [ ] T038 Test very long title (500+ characters)
  - **Success**: Add todo with 500+ char title, list, verify accepted and displayed (truncated if needed)
  - **Verification**: Generate long string, add as title, list, verify no crash
  - **Edge Case**: Spec edge case (long titles)

- [ ] T039 Test performance with 100 todos
  - **Success**: Add 100 todos (via Python script or manual loop), list, verify completes < 1 second
  - **Verification**: Time the list operation: `import time; start=time.time(); list_todos(); print(time.time()-start)`
  - **Requirement**: SC-006 (handle 100 todos without degradation)

- [ ] T040 Run full acceptance test suite
  - **Success**: All user story acceptance tests pass (US1, US2, US3, US4)
  - **Verification**: Execute manual test steps from spec for all 4 user stories
  - **Requirements**: All acceptance scenarios from spec validated

- [ ] T041 Create `README.md` at repository root
  - **Success**: File contains: project description, requirements (Python 3.8+), usage instructions, command reference
  - **Verification**: Read file, verify all sections present and clear
  - **Requirement**: Documentation requirement (plan: beginner-friendly)

**Checkpoint**: All user stories implemented and tested; edge cases validated; documentation complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start here
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - MVP
- **User Story 2 (Phase 4)**: Depends on Foundational completion - Can run after US1 or in parallel if separate developer
- **User Story 3 (Phase 5)**: Depends on Foundational completion - Can run after US2 or in parallel
- **User Story 4 (Phase 6)**: Depends on Foundational completion - Can run after US3 or in parallel
- **Polish (Phase 7)**: Depends on all user stories complete

### Sequential Execution (Recommended for Single Developer)

1. **Phase 1**: T001 → T002 → T003
2. **Phase 2**: T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 (sequential, build on each other)
3. **Phase 3**: T012 → T013 → T014 → T015 → T016 → T017 (sequential, build add/list commands)
4. **Phase 4**: T018 → T019 → T020 → T021 → T022 → T023 (sequential, build complete command)
5. **Phase 5**: T024 → T025 → T026 → T027 → T028 → T029 (sequential, build update command)
6. **Phase 6**: T030 → T031 → T032 → T033 → T034 (sequential, build delete command)
7. **Phase 7**: T035 → T036 → T037 → T038 → T039 → T040 → T041 (sequential, finalize)

### Verification After Each Task

Per user requirement "each task must be independently checkable":

- After T001-T003: File exists, imports work, no errors
- After T004-T011: Validation functions work, command loop runs, exit handlers work
- After T012-T017: Can add todos, can list todos, empty title/list handled
- After T018-T023: Can mark completed, invalid ID/not-found/already-completed handled
- After T024-T029: Can update title, invalid ID/title/not-found handled
- After T030-T034: Can delete todos, invalid ID/not-found handled, IDs preserved
- After T035-T041: Code documented, PEP 8 compliant, edge cases tested, README exists

---

## Implementation Strategy

### MVP First (User Story 1 Only)

For fastest value delivery:
1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T011)
3. Complete Phase 3: User Story 1 (T012-T017)
4. **STOP and VALIDATE**: Test adding and listing todos manually
5. Demo or checkpoint with user

This delivers a working (minimal) todo app in ~17 tasks.

### Incremental Delivery

1. Setup + Foundational → Command loop works
2. Add User Story 1 → Can add/list todos (MVP!)
3. Add User Story 2 → Can mark completed
4. Add User Story 3 → Can update titles
5. Add User Story 4 → Can delete todos (full CRUD)
6. Polish → Production-ready

Each addition maintains all previous functionality.

---

## Notes

- All tasks modify single file `todo.py` (no parallel file work possible)
- Tasks within each phase are sequential (each builds on previous)
- Phases 3-6 (user stories) can be reordered if needed, but P1→P2→P3→P4 recommended
- Verify each task immediately after completion (per user requirement)
- No task includes future-phase features (no persistence, no API, no tests framework)
- Commit after each phase completion (5-7 commits total)

---

## Task Summary

- **Total Tasks**: 41
- **Setup**: 3 tasks
- **Foundational**: 8 tasks (CRITICAL - blocks all stories)
- **User Story 1 (P1/MVP)**: 6 tasks
- **User Story 2 (P2)**: 6 tasks
- **User Story 3 (P3)**: 6 tasks
- **User Story 4 (P4)**: 5 tasks
- **Polish**: 7 tasks

**Estimated Completion**:
- MVP (Phases 1-3): 17 tasks
- Full CRUD (Phases 1-6): 34 tasks
- Production-ready (All phases): 41 tasks

**Constitution Compliance**:
- ✅ Each task independently checkable
- ✅ All tasks within Phase 1 scope
- ✅ No future-phase features
- ✅ Tasks minimal and sequential
- ✅ Domain rules enforced in implementation tasks
