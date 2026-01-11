"""Todo CRUD endpoints with data isolation."""
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Todo
from schemas import TodoCreate, TodoUpdate, TodoResponse, TodoListResponse
from auth import get_current_user

router = APIRouter(prefix="/api/todos", tags=["todos"])


def todo_to_response(todo: Todo) -> dict:
    """Convert Todo model to response dict with tags as list."""
    tags = []
    if todo.tags:
        try:
            tags = json.loads(todo.tags) if isinstance(todo.tags, str) else todo.tags
        except (json.JSONDecodeError, TypeError):
            tags = []

    return {
        "id": todo.id,
        "user_id": todo.user_id,
        "title": todo.title,
        "status": todo.status,
        "created_at": todo.created_at,
        "priority": todo.priority or "Medium",
        "tags": tags,
        "due_date": todo.due_date,
        "is_recurring": todo.is_recurring,
        "recurrence_pattern": todo.recurrence_pattern,
        "parent_todo_id": todo.parent_todo_id
    }


@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo_data: TodoCreate,
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new todo with Phase 5 advanced fields."""
    new_todo = Todo(
        user_id=current_user,
        title=todo_data.title.strip(),
        status="pending",
        priority=todo_data.priority.value if todo_data.priority else "Medium",
        tags=json.dumps(todo_data.tags or []),  # Serialize to JSON string
        due_date=todo_data.due_date,
        is_recurring=todo_data.is_recurring or False,
        recurrence_pattern=todo_data.recurrence_pattern.value if todo_data.recurrence_pattern else None
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return todo_to_response(new_todo)


@router.get("", response_model=TodoListResponse)
def list_todos(
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all todos for the authenticated user (data isolation)."""
    todos = db.query(Todo).filter(Todo.user_id == current_user).order_by(Todo.id).all()
    return TodoListResponse(todos=[todo_to_response(t) for t in todos])


@router.patch("/{todo_id}/complete", response_model=TodoResponse)
def complete_todo(
    todo_id: int,
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark todo as completed (ownership check enforced). Auto-generates next occurrence for recurring tasks."""
    todo = db.query(Todo).filter(Todo.id == todo_id).first()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with ID {todo_id} not found"
        )

    # Ownership check
    if todo.user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this todo"
        )

    # Idempotent - allow completing already completed todo
    todo.status = "completed"
    db.commit()
    db.refresh(todo)

    # Auto-generate next occurrence for recurring tasks
    if todo.is_recurring and todo.recurrence_pattern:
        from datetime import datetime, timedelta

        # Calculate next due date
        next_due_date = None
        if todo.due_date:
            if todo.recurrence_pattern == "Daily":
                next_due_date = todo.due_date + timedelta(days=1)
            elif todo.recurrence_pattern == "Weekly":
                next_due_date = todo.due_date + timedelta(weeks=1)
            elif todo.recurrence_pattern == "Monthly":
                # Approximate monthly recurrence (30 days)
                next_due_date = todo.due_date + timedelta(days=30)

        # Create next occurrence
        next_todo = Todo(
            user_id=current_user,
            title=todo.title,
            status="pending",
            priority=todo.priority,
            tags=todo.tags,  # Already JSON string
            due_date=next_due_date,
            is_recurring=True,
            recurrence_pattern=todo.recurrence_pattern,
            parent_todo_id=todo.id
        )
        db.add(next_todo)
        db.commit()

    return todo_to_response(todo)


@router.patch("/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update todo with Phase 5 fields (ownership check enforced)."""
    todo = db.query(Todo).filter(Todo.id == todo_id).first()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with ID {todo_id} not found"
        )

    # Ownership check
    if todo.user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this todo"
        )

    # Update fields if provided
    if todo_data.title is not None:
        todo.title = todo_data.title.strip()
    if todo_data.status is not None:
        todo.status = todo_data.status
    if todo_data.priority is not None:
        todo.priority = todo_data.priority.value
    if todo_data.tags is not None:
        todo.tags = json.dumps(todo_data.tags)  # Serialize to JSON string
    if todo_data.due_date is not None:
        todo.due_date = todo_data.due_date
    if todo_data.is_recurring is not None:
        todo.is_recurring = todo_data.is_recurring
    if todo_data.recurrence_pattern is not None:
        todo.recurrence_pattern = todo_data.recurrence_pattern.value if todo_data.recurrence_pattern else None

    db.commit()
    db.refresh(todo)
    return todo_to_response(todo)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int,
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete todo (ownership check enforced)."""
    todo = db.query(Todo).filter(Todo.id == todo_id).first()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with ID {todo_id} not found"
        )

    # Ownership check
    if todo.user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this todo"
        )

    db.delete(todo)
    db.commit()
    return None
