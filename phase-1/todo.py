#!/usr/bin/env python3
"""
Console-Based Todo Application (Phase 1)

A simple command-line todo application with in-memory storage.
Supports adding, listing, completing, updating, and deleting todos.

Features:
- CRUD operations for todos
- In-memory storage (no persistence)
- Single-user
- Python 3.8+ standard library only
"""

import sys
import signal


# Global state
todos = {}  # {id: {"id": int, "title": str, "status": str}}
next_id = 1  # Auto-incrementing ID counter


# Validation functions
def validate_title(title):
    """Validate that title is non-empty after stripping whitespace."""
    return bool(title.strip())


def validate_id(id_str):
    """Validate and convert ID string to positive integer. Returns int or None."""
    try:
        todo_id = int(id_str)
        return todo_id if todo_id > 0 else None
    except ValueError:
        return None


def find_todo(todo_id):
    """Find todo by ID. Returns todo dict or None."""
    return todos.get(todo_id)


# CRUD functions
def add_todo(title):
    """Add a new todo with the given title."""
    global next_id

    if not validate_title(title):
        print("Error: Title cannot be empty")
        return

    todo = {
        "id": next_id,
        "title": title.strip(),
        "status": "pending"
    }

    todos[next_id] = todo
    print(f"Added todo #{next_id}: {title.strip()}")
    next_id += 1


def list_todos():
    """List all todos in tabular format."""
    if not todos:
        print("No todos found")
        return

    print(f"{'ID':<4} | {'Title':<40} | {'Status':<10}")
    print("-" * 60)

    for todo_id in sorted(todos.keys()):
        todo = todos[todo_id]
        title = todo["title"][:40]  # Truncate long titles
        print(f"{todo['id']:<4} | {title:<40} | {todo['status']:<10}")


def complete_todo(id_str):
    """Mark a todo as completed by ID."""
    todo_id = validate_id(id_str)

    if todo_id is None:
        print("Error: Invalid ID: must be a positive integer")
        return

    todo = find_todo(todo_id)

    if todo is None:
        print(f"Error: Todo with ID {todo_id} not found")
        return

    if todo["status"] == "completed":
        print("Todo is already completed")
        return

    todo["status"] = "completed"
    print(f"Marked todo #{todo_id} as completed")


def update_todo(args):
    """Update todo title by ID."""
    parts = args.split(maxsplit=1)

    if len(parts) < 2:
        print("Error: Usage: update <id> <new_title>")
        return

    id_str, new_title = parts

    todo_id = validate_id(id_str)

    if todo_id is None:
        print("Error: Invalid ID: must be a positive integer")
        return

    todo = find_todo(todo_id)

    if todo is None:
        print(f"Error: Todo with ID {todo_id} not found")
        return

    if not validate_title(new_title):
        print("Error: Title cannot be empty")
        return

    todo["title"] = new_title.strip()
    print(f"Updated todo #{todo_id}: {new_title.strip()}")


def delete_todo(id_str):
    """Delete a todo by ID."""
    todo_id = validate_id(id_str)

    if todo_id is None:
        print("Error: Invalid ID: must be a positive integer")
        return

    todo = find_todo(todo_id)

    if todo is None:
        print(f"Error: Todo with ID {todo_id} not found")
        return

    del todos[todo_id]
    print(f"Deleted todo #{todo_id}")


def show_help():
    """Display usage information for all commands."""
    print("""
Available commands:
  add <title>         - Add a new todo
  list                - List all todos
  complete <id>       - Mark todo as completed
  update <id> <title> - Update todo title
  delete <id>         - Delete a todo
  help                - Show this help message
  exit, quit          - Exit the application
""")


def signal_handler(sig, frame):
    """Handle Ctrl+C signal for graceful exit."""
    print("\nGoodbye!")
    sys.exit(0)


def handle_command(command, args):
    """Route commands to appropriate functions."""
    if command == "add":
        add_todo(args)
    elif command == "list":
        list_todos()
    elif command == "complete":
        complete_todo(args)
    elif command == "update":
        update_todo(args)
    elif command == "delete":
        delete_todo(args)
    elif command == "help":
        show_help()
    else:
        print(f"Unknown command: {command}")
        print("Type 'help' for usage information")


def main():
    """Main command loop."""
    # Register signal handler for Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)

    print("Todo App - Type 'help' for commands")

    while True:
        try:
            user_input = input("> ").strip()

            if not user_input:
                continue

            parts = user_input.split(maxsplit=1)
            command = parts[0].lower()
            args = parts[1] if len(parts) > 1 else ""

            if command in ["exit", "quit"]:
                print("Goodbye!")
                sys.exit(0)

            handle_command(command, args)

        except EOFError:
            print("\nGoodbye!")
            sys.exit(0)


if __name__ == "__main__":
    main()
