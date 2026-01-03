"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


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
    """Schema for creating a todo."""
    title: str = Field(..., min_length=1, max_length=500)


class TodoUpdate(BaseModel):
    """Schema for updating a todo."""
    title: str = Field(..., min_length=1, max_length=500)


class TodoResponse(BaseModel):
    """Schema for todo response."""
    id: int
    user_id: int
    title: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TodoListResponse(BaseModel):
    """Schema for list of todos."""
    todos: list[TodoResponse]
