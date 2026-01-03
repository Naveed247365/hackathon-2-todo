"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import Optional, List
from enum import Enum


# Phase 5: Enums
class PriorityEnum(str, Enum):
    High = "High"
    Medium = "Medium"
    Low = "Low"


class RecurrencePatternEnum(str, Enum):
    Daily = "Daily"
    Weekly = "Weekly"
    Monthly = "Monthly"


# User schemas
class UserCreate(BaseModel):
    """Schema for user signup."""
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserResponse(BaseModel):
    """Schema for user response."""
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for authentication response."""
    user_id: int
    email: str
    token: str


# Todo schemas
class TodoCreate(BaseModel):
    """Schema for creating a todo with Phase 5 advanced fields."""
    title: str = Field(..., min_length=1, max_length=500)
    priority: Optional[PriorityEnum] = PriorityEnum.Medium
    tags: Optional[List[str]] = Field(default_factory=list, max_length=10)
    due_date: Optional[date] = None
    is_recurring: Optional[bool] = False
    recurrence_pattern: Optional[RecurrencePatternEnum] = None


class TodoUpdate(BaseModel):
    """Schema for updating a todo with Phase 5 fields."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    status: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    tags: Optional[List[str]] = Field(None, max_length=10)
    due_date: Optional[date] = None
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[RecurrencePatternEnum] = None


class TodoResponse(BaseModel):
    """Schema for todo response with Phase 5 fields."""
    id: int
    user_id: int
    title: str
    status: str
    created_at: datetime
    priority: str = "Medium"
    tags: List[str] = []
    due_date: Optional[date] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
    parent_todo_id: Optional[int] = None

    class Config:
        from_attributes = True


class TodoListResponse(BaseModel):
    """Schema for list of todos."""
    todos: list[TodoResponse]
