from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    is_completed: Optional[bool] = None


class TaskResponse(BaseModel):
    id: UUID
    title: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    count: int
