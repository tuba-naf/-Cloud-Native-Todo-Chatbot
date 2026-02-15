"""MCP server configuration — registers all 5 task-management tools.

The MCP tools run in-process within FastAPI. The chat agent invokes them
via the OpenAI Agents SDK function-calling mechanism, and the chat endpoint
dispatches the actual function calls using the tool registry below.
"""

from app.mcp.tools import add_task, list_tasks, complete_task, delete_task, update_task

TOOL_REGISTRY = {
    "add_task": add_task,
    "list_tasks": list_tasks,
    "complete_task": complete_task,
    "delete_task": delete_task,
    "update_task": update_task,
}

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task for the user. Use when the user wants to add, create, or make a new task or todo item.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The title of the task to create",
                    },
                },
                "required": ["title"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "List the user's tasks. Use when the user wants to see, view, show, or check their tasks or todo items. Can filter by status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["pending", "completed"],
                        "description": "Optional filter: 'pending' for incomplete tasks, 'completed' for done tasks. Omit to list all tasks.",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as completed/done. Use when the user wants to finish, complete, check off, or mark a task as done.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "The UUID of the task to mark as completed",
                    },
                },
                "required": ["task_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete/remove a task. Use when the user wants to delete, remove, or discard a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "The UUID of the task to delete",
                    },
                },
                "required": ["task_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update/rename a task's title. Use when the user wants to rename, change, edit, or update a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "The UUID of the task to update",
                    },
                    "title": {
                        "type": "string",
                        "description": "The new title for the task",
                    },
                },
                "required": ["task_id"],
            },
        },
    },
]
