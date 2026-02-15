"""Phase III chat endpoint: POST /api/{user_id}/chat and GET /api/{user_id}/conversations/recent.

Stateless design — context is reconstructed from the database on every request.
"""

import json
import logging
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import get_current_user
from app.database import get_session
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.chat import ChatRequest, ChatResponse
from app.agents.chat_agent import process_chat

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Chat"])

MAX_HISTORY_MESSAGES = 50


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def send_chat_message(
    user_id: UUID,
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ChatResponse:
    """Process a natural language message through the AI agent."""
    # Verify user_id matches JWT claims (FR-001)
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this resource.",
        )

    # Resolve or create conversation (FR-004)
    conversation = _resolve_conversation(
        user_id=user_id,
        conversation_id=request.conversation_id,
        first_message=request.message,
        session=session,
    )

    # Load conversation history (FR-007 — stateless reconstruction)
    history = _load_history(conversation.id, session)

    # Invoke AI agent (FR-002, FR-003)
    try:
        assistant_response, tool_invocations = process_chat(
            user_id=user_id,
            message=request.message,
            history=history,
            session=session,
        )
    except Exception as e:
        logger.exception("AI agent error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable, please try again.",
        )

    # Persist exchange (FR-005, FR-006)
    _persist_exchange(
        conversation_id=conversation.id,
        user_content=request.message,
        assistant_content=assistant_response,
        tool_invocations=tool_invocations,
        session=session,
    )

    # Update conversation timestamp
    conversation.updated_at = datetime.now(timezone.utc)
    session.add(conversation)
    session.commit()

    return ChatResponse(
        response=assistant_response,
        conversation_id=conversation.id,
    )


@router.get("/{user_id}/conversations/recent")
async def get_recent_conversation(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Return the most recent conversation with message history (FR-015)."""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this resource.",
        )

    statement = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .limit(1)
    )
    conversation = session.exec(statement).first()

    if conversation is None:
        return None  # 204-like: no content

    messages = _load_history(conversation.id, session)

    return {
        "conversation_id": str(conversation.id),
        "title": conversation.title,
        "messages": [
            {
                "role": m["role"],
                "content": m["content"],
                "created_at": m.get("created_at"),
            }
            for m in messages
        ],
    }


def _resolve_conversation(
    user_id: UUID,
    conversation_id: UUID | None,
    first_message: str,
    session: Session,
) -> Conversation:
    """Get existing conversation or create a new one."""
    if conversation_id is not None:
        conversation = session.get(Conversation, conversation_id)
        if conversation is None or conversation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found.",
            )
        return conversation

    # Create new conversation with auto-generated title (truncated to 50 chars)
    title = first_message[:50].strip()
    conversation = Conversation(user_id=user_id, title=title)
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


def _load_history(conversation_id: UUID, session: Session) -> list[dict]:
    """Load the most recent messages for a conversation."""
    statement = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(MAX_HISTORY_MESSAGES)
    )
    results = session.exec(statement).all()
    # Reverse to chronological order
    messages = list(reversed(results))
    return [
        {
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
        if m.role in ("user", "assistant")  # Skip tool messages for agent context
    ]


def _persist_exchange(
    conversation_id: UUID,
    user_content: str,
    assistant_content: str,
    tool_invocations: list[dict],
    session: Session,
) -> None:
    """Persist user message, tool invocations, and assistant response."""
    # User message
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=user_content,
    )
    session.add(user_msg)

    # Tool messages (FR-006: audit trail)
    for tool in tool_invocations:
        tool_msg = Message(
            conversation_id=conversation_id,
            role="tool",
            content=json.dumps(tool.get("result", {})),
            tool_name=tool["name"],
            tool_args=json.dumps(tool["args"]),
            tool_result=json.dumps(tool["result"]),
        )
        session.add(tool_msg)

    # Assistant message
    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=assistant_content,
    )
    session.add(assistant_msg)

    session.commit()
