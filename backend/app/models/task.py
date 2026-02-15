from datetime import datetime, timezone
from uuid import UUID, uuid4
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.user import User


class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=500)
    is_completed: bool = Field(default=False)
    owner_id: UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    owner: Optional["User"] = Relationship(back_populates="tasks")
