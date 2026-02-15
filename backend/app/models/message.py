from datetime import datetime, timezone
from uuid import UUID, uuid4
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.conversation import Conversation


class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", index=True)
    role: str = Field(max_length=20)
    content: str = Field()
    tool_name: Optional[str] = Field(default=None, max_length=50)
    tool_args: Optional[str] = Field(default=None)
    tool_result: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    conversation: Optional["Conversation"] = Relationship(back_populates="messages")
