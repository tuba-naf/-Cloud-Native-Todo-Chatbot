from uuid import UUID
from typing import Optional
from pydantic import BaseModel, field_validator


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[UUID] = None

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Message must not be empty")
        return v


class ChatResponse(BaseModel):
    response: str
    conversation_id: UUID
