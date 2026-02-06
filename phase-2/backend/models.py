"""SQLModel models for User and Todo entities."""
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    """User model for authentication."""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=255, unique=True, nullable=False, index=True)
    password_hash: str = Field(max_length=255, nullable=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class Todo(SQLModel, table=True):
    """Todo model with user association."""
    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(max_length=500, nullable=False)
    status: str = Field(default="pending", max_length=20, nullable=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


# Request/Response schemas (SQLModel doubles as Pydantic models)
class UserCreate(SQLModel):
    """Schema for user signup."""
    email: str
    password: str = Field(min_length=8)


class TokenResponse(SQLModel):
    """Schema for authentication response."""
    user_id: int
    email: str
    token: str


class TodoCreate(SQLModel):
    """Schema for creating a todo."""
    title: str = Field(min_length=1, max_length=500)


class TodoUpdate(SQLModel):
    """Schema for updating a todo."""
    title: str = Field(min_length=1, max_length=500)


class TodoResponse(SQLModel):
    """Schema for todo response."""
    id: int
    user_id: int
    title: str
    status: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TodoListResponse(SQLModel):
    """Schema for list of todos."""
    todos: list[TodoResponse]
