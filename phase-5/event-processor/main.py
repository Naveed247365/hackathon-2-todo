"""
Event Processor Service for Todo App
Handles Dapr pub/sub events for task notifications and recurring task generation.
"""
import os
import json
import logging
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import httpx

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Todo Event Processor",
    description="Dapr-enabled event processor for todo notifications and recurring tasks",
    version="5.0.0"
)

# Dapr configuration
DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
PUBSUB_NAME = os.getenv("PUBSUB_NAME", "todo-pubsub")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Event Topics
TOPIC_TASK_CREATED = "task-created"
TOPIC_TASK_COMPLETED = "task-completed"
TOPIC_TASK_REMINDER = "task-reminder"
TOPIC_RECURRING_TRIGGER = "recurring-trigger"


class CloudEvent(BaseModel):
    """CloudEvents format for Dapr pub/sub"""
    id: str
    source: str
    type: str
    specversion: str = "1.0"
    datacontenttype: str = "application/json"
    data: dict


class TaskEvent(BaseModel):
    """Task event payload"""
    task_id: int
    user_id: int
    title: str
    priority: str
    tags: List[str] = []
    due_date: Optional[str] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
    action: str  # created, completed, deleted, updated


class ReminderEvent(BaseModel):
    """Reminder event payload"""
    task_id: int
    user_id: int
    title: str
    due_date: str
    hours_until_due: int


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "event-processor"}


@app.get("/dapr/subscribe")
async def subscribe():
    """Dapr subscription configuration"""
    subscriptions = [
        {
            "pubsubname": PUBSUB_NAME,
            "topic": TOPIC_TASK_CREATED,
            "route": "/events/task-created"
        },
        {
            "pubsubname": PUBSUB_NAME,
            "topic": TOPIC_TASK_COMPLETED,
            "route": "/events/task-completed"
        },
        {
            "pubsubname": PUBSUB_NAME,
            "topic": TOPIC_TASK_REMINDER,
            "route": "/events/task-reminder"
        },
        {
            "pubsubname": PUBSUB_NAME,
            "topic": TOPIC_RECURRING_TRIGGER,
            "route": "/events/recurring-trigger"
        }
    ]
    return subscriptions


@app.post("/events/task-created")
async def handle_task_created(event: CloudEvent):
    """Handle task created events"""
    try:
        data = event.data
        logger.info(f"Task created: {data.get('title')} (ID: {data.get('task_id')})")
        
        # Check if task has a due date for reminder scheduling
        if data.get("due_date"):
            await schedule_reminder(data)
        
        return {"status": "SUCCESS"}
    except Exception as e:
        logger.error(f"Error processing task-created event: {e}")
        return {"status": "DROP"}  # Don't retry on error


@app.post("/events/task-completed")
async def handle_task_completed(event: CloudEvent):
    """Handle task completed events - trigger recurring task generation"""
    try:
        data = event.data
        logger.info(f"Task completed: {data.get('title')} (ID: {data.get('task_id')})")
        
        # If recurring, create next occurrence
        if data.get("is_recurring") and data.get("recurrence_pattern"):
            await create_next_recurring_task(data)
        
        return {"status": "SUCCESS"}
    except Exception as e:
        logger.error(f"Error processing task-completed event: {e}")
        return {"status": "DROP"}


@app.post("/events/task-reminder")
async def handle_task_reminder(event: CloudEvent):
    """Handle task reminder events"""
    try:
        data = event.data
        logger.info(f"Reminder for task: {data.get('title')} - Due in {data.get('hours_until_due')} hours")
        
        # In production, send notification via email/push/SMS
        # For demo, just log it
        logger.info(f"[NOTIFICATION] Task '{data.get('title')}' is due soon!")
        
        return {"status": "SUCCESS"}
    except Exception as e:
        logger.error(f"Error processing reminder event: {e}")
        return {"status": "DROP"}


@app.post("/events/recurring-trigger")
async def handle_recurring_trigger(event: CloudEvent):
    """Handle cron trigger for checking recurring tasks"""
    try:
        logger.info("Recurring task check triggered")
        
        # Query backend for overdue recurring tasks
        # This would be called by the cron binding
        
        return {"status": "SUCCESS"}
    except Exception as e:
        logger.error(f"Error processing recurring trigger: {e}")
        return {"status": "DROP"}


@app.post("/todo-reminder-cron")
async def handle_cron_binding():
    """Handle cron binding input for periodic reminder checks"""
    try:
        logger.info("Cron job triggered - checking for due tasks")
        
        # In production, query database for tasks due within next 24 hours
        # and publish reminder events
        
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Cron handler error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def schedule_reminder(task_data: dict):
    """Schedule a reminder for a task with due date"""
    try:
        due_date = datetime.fromisoformat(task_data["due_date"].replace("Z", "+00:00"))
        now = datetime.now(due_date.tzinfo) if due_date.tzinfo else datetime.now()
        
        hours_until_due = int((due_date - now).total_seconds() / 3600)
        
        if hours_until_due > 0 and hours_until_due <= 24:
            # Publish reminder event
            reminder = {
                "task_id": task_data["task_id"],
                "user_id": task_data["user_id"],
                "title": task_data["title"],
                "due_date": task_data["due_date"],
                "hours_until_due": hours_until_due
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"http://localhost:{DAPR_HTTP_PORT}/v1.0/publish/{PUBSUB_NAME}/{TOPIC_TASK_REMINDER}",
                    json=reminder
                )
                logger.info(f"Reminder scheduled for task {task_data['task_id']}")
                
    except Exception as e:
        logger.error(f"Failed to schedule reminder: {e}")


async def create_next_recurring_task(task_data: dict):
    """Create the next occurrence of a recurring task"""
    try:
        pattern = task_data.get("recurrence_pattern")
        due_date_str = task_data.get("due_date")
        
        if not due_date_str:
            due_date = datetime.now()
        else:
            due_date = datetime.fromisoformat(due_date_str.replace("Z", "+00:00"))
        
        # Calculate next due date based on pattern
        if pattern == "Daily":
            next_due = due_date + timedelta(days=1)
        elif pattern == "Weekly":
            next_due = due_date + timedelta(weeks=1)
        elif pattern == "Monthly":
            next_due = due_date + timedelta(days=30)  # Approximate
        else:
            return
        
        # Create new task via backend API
        new_task = {
            "title": task_data["title"],
            "priority": task_data.get("priority", "Medium"),
            "tags": task_data.get("tags", []),
            "due_date": next_due.isoformat(),
            "is_recurring": True,
            "recurrence_pattern": pattern,
            "parent_todo_id": task_data["task_id"]
        }
        
        logger.info(f"Would create next recurring task: {new_task['title']} due {next_due}")
        # In production: POST to backend API to create the task
        
    except Exception as e:
        logger.error(f"Failed to create recurring task: {e}")


# Publish event helper
async def publish_event(topic: str, data: dict):
    """Publish event to Dapr pub/sub"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"http://localhost:{DAPR_HTTP_PORT}/v1.0/publish/{PUBSUB_NAME}/{topic}",
                json=data
            )
            return response.status_code == 204
    except Exception as e:
        logger.error(f"Failed to publish event: {e}")
        return False


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=6000)
