from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from app.database import get_session
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    task = Task(
        title=task_data.title,
        owner_id=current_user.id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = (
        select(Task)
        .where(Task.owner_id == current_user.id)
        .order_by(Task.created_at.desc())
    )
    tasks = session.exec(statement).all()
    return TaskListResponse(tasks=tasks, count=len(tasks))


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    task = session.get(Task, task_id)
    if not task or task.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    task = session.get(Task, task_id)
    if not task or task.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    if task_data.title is not None:
        task.title = task_data.title
    if task_data.is_completed is not None:
        task.is_completed = task_data.is_completed

    task.updated_at = datetime.now(timezone.utc)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    task = session.get(Task, task_id)
    if not task or task.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    session.delete(task)
    session.commit()
