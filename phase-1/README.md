# Console-Based Todo Application (Phase 1)

A simple command-line todo application with in-memory storage, built following strict Spec-Driven Development (SDD) principles.

## Features

- **Add todos** with titles
- **List all todos** with ID, title, and status
- **Mark todos as completed**
- **Update todo titles**
- **Delete todos**
- In-memory storage (no persistence between runs)
- Single-user, single-process
- Python 3.8+ standard library only

## Requirements

- Python 3.8 or higher
- No external dependencies

## Installation

No installation required. Just download `todo.py`.

## Usage

### Start the application

```bash
python todo.py
```

### Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `add <title>` | Add a new todo | `add Buy groceries` |
| `list` | List all todos | `list` |
| `complete <id>` | Mark todo as completed | `complete 1` |
| `update <id> <new_title>` | Update todo title | `update 1 Buy milk` |
| `delete <id>` | Delete a todo | `delete 1` |
| `help` | Show command help | `help` |
| `exit` or `quit` | Exit application | `exit` |

### Example Session

```
Todo App - Type 'help' for commands
> add Buy groceries
Added todo #1: Buy groceries
> add Write code
Added todo #2: Write code
> list
ID   | Title                                    | Status
------------------------------------------------------------
1    | Buy groceries                            | pending
2    | Write code                               | pending
> complete 1
Marked todo #1 as completed
> list
ID   | Title                                    | Status
------------------------------------------------------------
1    | Buy groceries                            | completed
2    | Write code                               | pending
> update 2 Review pull request
Updated todo #2: Review pull request
> delete 1
Deleted todo #1
> list
ID   | Title                                    | Status
------------------------------------------------------------
2    | Review pull request                      | pending
> exit
Goodbye!
```

## Domain Rules

- **Todo Entity**: Each todo has an ID (integer), title (string), and status ("pending" or "completed")
- **ID Assignment**: IDs start at 1 and auto-increment; IDs are never reused after deletion
- **Status Transitions**: Todos start as "pending" and can transition to "completed" (no reverse)
- **Validation**: Titles must be non-empty after trimming whitespace; IDs must be positive integers

## Exit Criteria Met

All Phase 1 specification exit criteria satisfied:

- ✅ App runs from terminal using `python todo.py` without errors
- ✅ User can add, update, delete, complete, and list todos
- ✅ Code is clean and readable (PEP 8 compliant)
- ✅ No features beyond Phase 1 scope
- ✅ Graceful exit on `exit`/`quit` commands and Ctrl+C

## Project Structure

```
todo.py              # Single-file application (all code)
README.md            # This file
specs/               # Feature specifications
  001-console-based-todo-app/
    spec.md          # Phase 1 specification
    plan.md          # Implementation plan
    tasks.md         # Task breakdown
.specify/            # Project constitution and templates
history/             # Prompt History Records (PHRs)
```

## Development Process

This application was built following the Hackathon 2 constitution with strict phase discipline:

1. **Specification Phase**: Complete user stories, requirements, domain rules
2. **Planning Phase**: Technical decisions, architecture, constitution check
3. **Task Definition Phase**: 41 verifiable tasks across 7 phases
4. **Implementation Phase**: Sequential execution with verification
5. **Validation Phase**: Manual acceptance testing

## License

Phase 1 implementation for Hackathon 2 - Spec-Driven Development demonstration.
