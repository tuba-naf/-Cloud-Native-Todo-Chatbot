from uuid import UUID
from typing import Optional
from pydantic import BaseModel


class AddTaskInput(BaseModel):
    title: str


class ListTasksInput(BaseModel):
    status: Optional[str] = None


class CompleteTaskInput(BaseModel):
    task_id: UUID


class DeleteTaskInput(BaseModel):
    task_id: UUID


class UpdateTaskInput(BaseModel):
    task_id: UUID
    title: Optional[str] = None
