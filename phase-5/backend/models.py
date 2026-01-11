"""SQLAlchemy models for User and Todo entities."""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, CheckConstraint, Date, Boolean, Text
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """User model for authentication."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Todo(Base):
    """Todo model with user association and Phase 5 advanced features."""
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Phase 5: Advanced fields (SQLite-compatible)
    priority = Column(String(20), default="Medium", nullable=False, index=True)
    tags = Column(Text, default="[]", nullable=False)  # JSON string for SQLite
    due_date = Column(Date, nullable=True, index=True)
    is_recurring = Column(Boolean, default=False, nullable=False)
    recurrence_pattern = Column(String(20), nullable=True)  # Daily, Weekly, Monthly
    parent_todo_id = Column(Integer, ForeignKey("todos.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        CheckConstraint("status IN ('pending', 'completed')", name="check_status"),
    )
