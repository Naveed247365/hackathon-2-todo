"""SQLModel models for User, Todo, Conversation, and Message entities."""
from typing import Optional, List
from datetime import datetime, date
from enum import Enum
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import Text, JSON


class PriorityEnum(str, Enum):
    High = "High"
    Medium = "Medium"
    Low = "Low"


class RecurrencePatternEnum(str, Enum):
    Daily = "Daily"
    Weekly = "Weekly"
    Monthly = "Monthly"


class User(SQLModel, table=True):
    """User model for authentication."""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=255, unique=True, nullable=False, index=True)
    password_hash: str = Field(max_length=255, nullable=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class Todo(SQLModel, table=True):
    """Todo model with user association and Phase 5 advanced features."""
    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(max_length=500, nullable=False)
    status: str = Field(default="pending", max_length=20, nullable=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    # Phase 5: Advanced fields
    priority: str = Field(default="Medium", nullable=False, index=True)
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON, default=[]))
    due_date: Optional[date] = Field(default=None, index=True)
    is_recurring: bool = Field(default=False, nullable=False)
    recurrence_pattern: Optional[str] = Field(default=None)
    parent_todo_id: Optional[int] = Field(default=None, foreign_key="todos.id")


class Conversation(SQLModel, table=True):
    """Conversation model for chat history."""
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    title: Optional[str] = Field(default=None, max_length=255)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class Message(SQLModel, table=True):
    """Message model for chat persistence."""
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", nullable=False, index=True)
    role: str = Field(max_length=20, nullable=False)  # 'user' | 'assistant' | 'system'
    content: str = Field(sa_column=Column(Text, nullable=False))
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


# Request/Response schemas
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
    """Schema for creating a todo with Phase 5 advanced fields."""
    title: str = Field(min_length=1, max_length=500)
    priority: Optional[PriorityEnum] = PriorityEnum.Medium
    tags: Optional[List[str]] = Field(default_factory=list)
    due_date: Optional[date] = None
    is_recurring: Optional[bool] = False
    recurrence_pattern: Optional[RecurrencePatternEnum] = None


class TodoUpdate(SQLModel):
    """Schema for updating a todo with Phase 5 fields."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    status: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    tags: Optional[List[str]] = None
    due_date: Optional[date] = None
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[RecurrencePatternEnum] = None


class TodoResponse(SQLModel):
    """Schema for todo response with Phase 5 fields."""
    id: int
    user_id: int
    title: str
    status: str
    created_at: Optional[datetime] = None
    priority: str = "Medium"
    tags: List[str] = []
    due_date: Optional[date] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
    parent_todo_id: Optional[int] = None

    model_config = {"from_attributes": True}


class TodoListResponse(SQLModel):
    """Schema for list of todos."""
    todos: list[TodoResponse]


class ConversationCreate(SQLModel):
    """Schema for creating a conversation."""
    title: Optional[str] = None


class ConversationResponse(SQLModel):
    """Schema for conversation response."""
    id: int
    user_id: int
    title: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class MessageResponse(SQLModel):
    """Schema for message response."""
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ChatRequest(SQLModel):
    """Schema for chat request."""
    message: str
    conversation_id: Optional[int] = None


class ChatResponse(SQLModel):
    """Schema for chat response."""
    response: str
    conversation_id: int
