import json
import logging
from datetime import datetime, timezone
from uuid import UUID

from sqlmodel import Session, select

from app.models.task import Task

logger = logging.getLogger(__name__)


def add_task(user_id: UUID, title: str, session: Session) -> dict:
    """Create a new task for the authenticated user."""
    task = Task(title=title, owner_id=user_id)
    session.add(task)
    session.commit()
    session.refresh(task)
    logger.info("add_task: created task %s for user %s", task.id, user_id)
    return {
        "id": str(task.id),
        "title": task.title,
        "is_completed": task.is_completed,
    }


def list_tasks(user_id: UUID, session: Session, status: str | None = None) -> dict:
    """List tasks for the authenticated user, optionally filtered by status."""
    statement = select(Task).where(Task.owner_id == user_id)
    if status == "pending":
        statement = statement.where(Task.is_completed == False)  # noqa: E712
    elif status == "completed":
        statement = statement.where(Task.is_completed == True)  # noqa: E712
    statement = statement.order_by(Task.created_at.desc())
    tasks = session.exec(statement).all()
    logger.info("list_tasks: found %d tasks for user %s (status=%s)", len(tasks), user_id, status)
    return {
        "tasks": [
            {
                "id": str(t.id),
                "title": t.title,
                "is_completed": t.is_completed,
            }
            for t in tasks
        ],
        "count": len(tasks),
    }


def complete_task(user_id: UUID, task_id: UUID, session: Session) -> dict:
    """Mark a task as completed. Enforces ownership."""
    task = session.get(Task, task_id)
    if task is None or task.owner_id != user_id:
        return {"error": "Task not found"}
    task.is_completed = True
    task.updated_at = datetime.now(timezone.utc)
    session.add(task)
    session.commit()
    session.refresh(task)
    logger.info("complete_task: completed task %s for user %s", task_id, user_id)
    return {
        "id": str(task.id),
        "title": task.title,
        "is_completed": task.is_completed,
    }


def delete_task(user_id: UUID, task_id: UUID, session: Session) -> dict:
    """Delete a task. Enforces ownership."""
    task = session.get(Task, task_id)
    if task is None or task.owner_id != user_id:
        return {"error": "Task not found"}
    title = task.title
    session.delete(task)
    session.commit()
    logger.info("delete_task: deleted task %s for user %s", task_id, user_id)
    return {"deleted": True, "title": title}


def update_task(
    user_id: UUID, task_id: UUID, session: Session, title: str | None = None
) -> dict:
    """Update a task's title. Enforces ownership."""
    task = session.get(Task, task_id)
    if task is None or task.owner_id != user_id:
        return {"error": "Task not found"}
    if title is not None:
        task.title = title
    task.updated_at = datetime.now(timezone.utc)
    session.add(task)
    session.commit()
    session.refresh(task)
    logger.info("update_task: updated task %s for user %s", task_id, user_id)
    return {
        "id": str(task.id),
        "title": task.title,
        "is_completed": task.is_completed,
    }
