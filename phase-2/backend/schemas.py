"""DEPRECATED: Schemas merged into models.py using SQLModel.
This file re-exports for backwards compatibility."""
from models import UserCreate, TokenResponse, TodoCreate, TodoUpdate, TodoResponse, TodoListResponse

__all__ = ["UserCreate", "TokenResponse", "TodoCreate", "TodoUpdate", "TodoResponse", "TodoListResponse"]
