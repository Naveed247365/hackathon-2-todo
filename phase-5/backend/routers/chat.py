"""Chat endpoints with conversation persistence."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_db
from models import Conversation, Message, ChatRequest, ChatResponse, ConversationResponse, MessageResponse
from auth import get_current_user
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all conversations for the authenticated user."""
    statement = select(Conversation).where(
        Conversation.user_id == current_user
    ).order_by(Conversation.updated_at.desc())
    conversations = db.exec(statement).all()
    return conversations


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(
    conversation_id: int,
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all messages in a conversation."""
    conversation = db.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conversation.user_id != current_user:
        raise HTTPException(status_code=403, detail="Access denied")

    statement = select(Message).where(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at)
    messages = db.exec(statement).all()
    return messages


@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new conversation."""
    conversation = Conversation(user_id=current_user)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def save_message(db: Session, conversation_id: int, role: str, content: str) -> Message:
    """Save a message to a conversation."""
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content
    )
    db.add(message)

    # Update conversation timestamp
    conversation = db.get(Conversation, conversation_id)
    if conversation:
        conversation.updated_at = datetime.utcnow()
        if not conversation.title and role == "user":
            conversation.title = content[:100]
        db.add(conversation)

    db.commit()
    db.refresh(message)
    return message
