"""Todo CRUD endpoints with data isolation."""
import os
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_db
from models import Todo, TodoCreate, TodoUpdate, TodoResponse, TodoListResponse
from auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/todos", tags=["todos"])

# Dapr configuration for event publishing
DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
PUBSUB_NAME = os.getenv("PUBSUB_NAME", "todo-pubsub")


async def publish_event(topic: str, data: dict):
    """Publish event to Dapr pub/sub (Kafka/Redpanda)."""
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"http://localhost:{DAPR_HTTP_PORT}/v1.0/publish/{PUBSUB_NAME}/{topic}",
                json=data
            )
            if response.status_code in (200, 204):
                logger.info(f"Published event to {topic}: {data.get('title', 'N/A')}")
            else:
                logger.warning(f"Failed to publish event to {topic}: {response.status_code}")
    except Exception as e:
        logger.warning(f"Event publish failed (non-blocking): {e}")


@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
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
        tags=todo_data.tags or [],
        due_date=todo_data.due_date,
        is_recurring=todo_data.is_recurring or False,
        recurrence_pattern=todo_data.recurrence_pattern.value if todo_data.recurrence_pattern else None
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)

    # Publish task-created event
    await publish_event("task-created", {
        "task_id": new_todo.id,
        "user_id": current_user,
        "title": new_todo.title,
        "priority": new_todo.priority,
        "tags": new_todo.tags,
        "due_date": str(new_todo.due_date) if new_todo.due_date else None,
        "is_recurring": new_todo.is_recurring,
        "recurrence_pattern": new_todo.recurrence_pattern,
        "action": "created"
    })

    return new_todo


@router.get("", response_model=TodoListResponse)
def list_todos(
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all todos for the authenticated user (data isolation)."""
    statement = select(Todo).where(Todo.user_id == current_user).order_by(Todo.id)
    todos = db.exec(statement).all()
    return TodoListResponse(todos=todos)


@router.patch("/{todo_id}/complete", response_model=TodoResponse)
async def complete_todo(
    todo_id: int,
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark todo as completed. Auto-generates next occurrence for recurring tasks."""
    todo = db.get(Todo, todo_id)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with ID {todo_id} not found"
        )

    if todo.user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this todo"
        )

    todo.status = "completed"
    db.add(todo)
    db.commit()
    db.refresh(todo)

    # Publish task-completed event
    await publish_event("task-completed", {
        "task_id": todo.id,
        "user_id": current_user,
        "title": todo.title,
        "priority": todo.priority,
        "tags": todo.tags,
        "due_date": str(todo.due_date) if todo.due_date else None,
        "is_recurring": todo.is_recurring,
        "recurrence_pattern": todo.recurrence_pattern,
        "action": "completed"
    })

    # Auto-generate next occurrence for recurring tasks
    if todo.is_recurring and todo.recurrence_pattern:
        from datetime import timedelta

        next_due_date = None
        if todo.due_date:
            if todo.recurrence_pattern == "Daily":
                next_due_date = todo.due_date + timedelta(days=1)
            elif todo.recurrence_pattern == "Weekly":
                next_due_date = todo.due_date + timedelta(weeks=1)
            elif todo.recurrence_pattern == "Monthly":
                next_due_date = todo.due_date + timedelta(days=30)

        next_todo = Todo(
            user_id=current_user,
            title=todo.title,
            status="pending",
            priority=todo.priority,
            tags=todo.tags,
            due_date=next_due_date,
            is_recurring=True,
            recurrence_pattern=todo.recurrence_pattern,
            parent_todo_id=todo.id
        )
        db.add(next_todo)
        db.commit()

    return todo


@router.patch("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update todo with Phase 5 fields (ownership check enforced)."""
    todo = db.get(Todo, todo_id)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with ID {todo_id} not found"
        )

    if todo.user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this todo"
        )

    if todo_data.title is not None:
        todo.title = todo_data.title.strip()
    if todo_data.status is not None:
        todo.status = todo_data.status
    if todo_data.priority is not None:
        todo.priority = todo_data.priority.value
    if todo_data.tags is not None:
        todo.tags = todo_data.tags
    if todo_data.due_date is not None:
        todo.due_date = todo_data.due_date
    if todo_data.is_recurring is not None:
        todo.is_recurring = todo_data.is_recurring
    if todo_data.recurrence_pattern is not None:
        todo.recurrence_pattern = todo_data.recurrence_pattern.value if todo_data.recurrence_pattern else None

    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: int,
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete todo (ownership check enforced)."""
    todo = db.get(Todo, todo_id)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with ID {todo_id} not found"
        )

    if todo.user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this todo"
        )

    # Publish delete event before deletion
    await publish_event("task-deleted", {
        "task_id": todo.id,
        "user_id": current_user,
        "title": todo.title,
        "action": "deleted"
    })

    db.delete(todo)
    db.commit()
    return None
