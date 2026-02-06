"""DEPRECATED: Schemas merged into models.py using SQLModel.
This file re-exports for backwards compatibility."""
from models import (
    PriorityEnum, RecurrencePatternEnum,
    UserCreate, TokenResponse,
    TodoCreate, TodoUpdate, TodoResponse, TodoListResponse,
    ConversationCreate, ConversationResponse, MessageResponse,
    ChatRequest, ChatResponse
)

__all__ = [
    "PriorityEnum", "RecurrencePatternEnum",
    "UserCreate", "TokenResponse",
    "TodoCreate", "TodoUpdate", "TodoResponse", "TodoListResponse",
    "ConversationCreate", "ConversationResponse", "MessageResponse",
    "ChatRequest", "ChatResponse"
]
