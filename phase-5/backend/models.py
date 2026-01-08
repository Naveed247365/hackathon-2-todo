"""SQLAlchemy models for User and Todo entities."""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, CheckConstraint, Date, Boolean, ARRAY, Text
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """User model for authentication."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())


# Define the PostgreSQL enum types
priority_enum = ENUM('High', 'Medium', 'Low', name='priority_enum', create_type=False)
recurrence_pattern_enum = ENUM('Daily', 'Weekly', 'Monthly', name='recurrence_pattern_enum', create_type=False)


class Todo(Base):
    """Todo model with user association and Phase 5 advanced features."""
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Phase 5: Advanced fields
    priority = Column(priority_enum, default="Medium", nullable=False, index=True)
    tags = Column(ARRAY(Text), default=[], nullable=False)
    due_date = Column(Date, nullable=True, index=True)
    is_recurring = Column(Boolean, default=False, nullable=False)
    recurrence_pattern = Column(recurrence_pattern_enum, nullable=True)
    parent_todo_id = Column(Integer, ForeignKey("todos.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        CheckConstraint("status IN ('pending', 'completed')", name="check_status"),
    )
