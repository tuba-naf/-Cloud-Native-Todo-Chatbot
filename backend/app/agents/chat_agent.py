"""OpenAI Agents SDK chat agent for task management.

Provides a stateless function that sends conversation history + a new message
to the OpenAI chat completions API with tool definitions, processes any tool
calls, and returns the final assistant response along with tool invocation
metadata for persistence.
"""

import json
import logging
from uuid import UUID

from openai import OpenAI
from sqlmodel import Session

from app.config import get_settings
from app.mcp.server import TOOL_DEFINITIONS, TOOL_REGISTRY

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """\
You are a helpful task management assistant. You help users manage their todo tasks through natural language conversation.

You can:
- Create new tasks (add_task)
- List tasks, optionally filtered by status (list_tasks)
- Mark tasks as completed (complete_task)
- Delete tasks (delete_task)
- Rename/update tasks (update_task)

Guidelines:
- When the user asks to act on a specific task by name, first call list_tasks to find the matching task ID, then perform the requested action.
- If multiple tasks match a name reference, list them and ask the user to specify which one.
- If no tasks match, let the user know the task was not found.
- Always respond in clear, friendly natural language.
- If the user asks something unrelated to task management, politely let them know you can only help with managing tasks.
- Never expose raw IDs, database errors, or technical details to the user.
- When listing tasks, format them as a numbered list for readability.
- When there are no tasks, respond with a friendly message encouraging the user to create one.
"""

MAX_HISTORY_MESSAGES = 50


def build_messages(history: list[dict], new_message: str) -> list[dict]:
    """Build the messages array for the OpenAI API call."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history[-MAX_HISTORY_MESSAGES:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": new_message})
    return messages


def process_chat(
    user_id: UUID,
    message: str,
    history: list[dict],
    session: Session,
) -> tuple[str, list[dict]]:
    """Process a chat message through the AI agent.

    Returns:
        A tuple of (assistant_response_text, tool_invocations) where
        tool_invocations is a list of dicts with keys: name, args, result.
    """
    settings = get_settings()
    client = OpenAI(api_key=settings.openai_api_key)

    messages = build_messages(history, message)
    tool_invocations: list[dict] = []

    # Allow up to 5 rounds of tool calls for multi-step operations
    for _ in range(5):
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=TOOL_DEFINITIONS,
        )

        choice = response.choices[0]

        if choice.finish_reason == "tool_calls" and choice.message.tool_calls:
            messages.append(choice.message)

            for tool_call in choice.message.tool_calls:
                fn_name = tool_call.function.name
                fn_args = json.loads(tool_call.function.arguments)
                logger.info("Tool call: %s(%s)", fn_name, fn_args)

                result = _dispatch_tool(fn_name, fn_args, user_id, session)

                tool_invocations.append({
                    "name": fn_name,
                    "args": fn_args,
                    "result": result,
                })

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result),
                })
        else:
            assistant_text = choice.message.content or ""
            return assistant_text, tool_invocations

    # Fallback if we exhaust tool-call rounds
    return "I encountered an issue processing your request. Please try again.", tool_invocations


def _dispatch_tool(
    name: str, args: dict, user_id: UUID, session: Session
) -> dict:
    """Dispatch a tool call to the appropriate MCP tool function."""
    fn = TOOL_REGISTRY.get(name)
    if fn is None:
        logger.error("Unknown tool: %s", name)
        return {"error": f"Unknown tool: {name}"}

    try:
        if name == "add_task":
            return fn(user_id=user_id, title=args["title"], session=session)
        elif name == "list_tasks":
            return fn(user_id=user_id, session=session, status=args.get("status"))
        elif name == "complete_task":
            return fn(user_id=user_id, task_id=UUID(args["task_id"]), session=session)
        elif name == "delete_task":
            return fn(user_id=user_id, task_id=UUID(args["task_id"]), session=session)
        elif name == "update_task":
            return fn(
                user_id=user_id,
                task_id=UUID(args["task_id"]),
                session=session,
                title=args.get("title"),
            )
        else:
            return {"error": f"Unhandled tool: {name}"}
    except Exception as e:
        logger.exception("Tool dispatch error for %s: %s", name, e)
        return {"error": "An internal error occurred while processing your request."}
