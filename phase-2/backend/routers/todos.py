"""Todo CRUD endpoints with data isolation."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_db
from models import Todo, TodoCreate, TodoUpdate, TodoResponse, TodoListResponse
from auth import get_current_user

router = APIRouter(prefix="/api/todos", tags=["todos"])


@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo_data: TodoCreate,
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new todo for the authenticated user."""
    new_todo = Todo(
        user_id=current_user,
        title=todo_data.title.strip(),
        status="pending"
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
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
def complete_todo(
    todo_id: int,
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark todo as completed (ownership check enforced)."""
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
    return todo


@router.patch("/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update todo title (ownership check enforced)."""
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

    todo.title = todo_data.title.strip()
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
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

    db.delete(todo)
    db.commit()
    return None
