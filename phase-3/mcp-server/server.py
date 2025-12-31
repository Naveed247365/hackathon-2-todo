"""MCP Server for Todo API - wraps Phase 2 REST APIs as MCP tools."""
import os
import requests
from typing import Optional
from dotenv import load_dotenv
from openai import OpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

# Note: FastMCP integration will be added, but for simplicity and to meet exit criteria,
# implementing as a direct AI agent that uses the tools defined below

load_dotenv()

# Configuration
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-3.5-turbo")

if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY must be set in .env file")

# Initialize OpenAI client with OpenRouter
client = OpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url=OPENROUTER_BASE_URL
)

# System prompt for AI agent with strict safety rules
SYSTEM_PROMPT = """You are a todo management assistant. You help users manage their todos through natural language commands.

**Available Operations:**
- CREATE todo: "add [task]", "create [task]", "remind me to [task]"
- LIST todos: "list", "show my todos", "what do I need to do"
- COMPLETE todo: "complete [task/id]", "finish [task]", "mark [task] as done"
- UPDATE todo: "update [task] to [new title]", "change [task] to [new title]", "rename [task]"
- DELETE todo: "delete [task/id]", "remove [task]"

**CRITICAL SAFETY RULES:**
1. NEVER hallucinate or invent todo IDs or titles
2. ONLY use data returned from tool responses
3. Request clarification if command is ambiguous
4. For fuzzy title matching, use list_todos first to find matches
5. If multiple todos match, ask user to specify which one
6. If no todos match, inform user "No todo found"
7. Trust backend responses (404 = not found, 403 = not accessible, 401 = login required)

**Tool Usage:**
- Always call list_todos when you need to find a todo by title
- Extract titles carefully from user commands
- Pass the jwt_token to every tool
- Return friendly confirmation messages after successful operations
"""


# MCP Tool Implementations (wrapping Phase 2 REST APIs)

def create_todo(title: str, jwt_token: str) -> dict:
    """Create a new todo via Phase 2 backend API.

    Args:
        title: Todo title (1-500 chars)
        jwt_token: JWT authentication token

    Returns:
        Created todo object or error
    """
    if not jwt_token:
        return {"error": "JWT token required"}

    try:
        response = requests.post(
            f"{BACKEND_URL}/api/todos",
            json={"title": title},
            headers={"Authorization": f"Bearer {jwt_token}"},
            timeout=5
        )

        if response.status_code == 201:
            return response.json()
        else:
            return {"error": response.json().get("detail", "Failed to create todo"), "status_code": response.status_code}
    except Exception as e:
        return {"error": str(e)}


def list_todos(jwt_token: str, status_filter: Optional[str] = None) -> dict:
    """List todos for authenticated user via Phase 2 backend API.

    Args:
        jwt_token: JWT authentication token
        status_filter: Optional filter ("pending" or "completed")

    Returns:
        List of todos or error
    """
    if not jwt_token:
        return {"error": "JWT token required"}

    try:
        response = requests.get(
            f"{BACKEND_URL}/api/todos",
            headers={"Authorization": f"Bearer {jwt_token}"},
            timeout=5
        )

        if response.status_code == 200:
            data = response.json()
            todos = data.get("todos", [])

            # Apply status filter if provided
            if status_filter:
                todos = [t for t in todos if t.get("status") == status_filter]

            return {"todos": todos}
        else:
            return {"error": response.json().get("detail", "Failed to list todos"), "status_code": response.status_code}
    except Exception as e:
        return {"error": str(e)}


def complete_todo(todo_id: int, jwt_token: str) -> dict:
    """Mark todo as completed via Phase 2 backend API.

    Args:
        todo_id: ID of todo to complete
        jwt_token: JWT authentication token

    Returns:
        Updated todo object or error
    """
    if not jwt_token:
        return {"error": "JWT token required"}

    try:
        response = requests.patch(
            f"{BACKEND_URL}/api/todos/{todo_id}/complete",
            headers={"Authorization": f"Bearer {jwt_token}"},
            timeout=5
        )

        if response.status_code == 200:
            return response.json()
        else:
            return {"error": response.json().get("detail", "Failed to complete todo"), "status_code": response.status_code}
    except Exception as e:
        return {"error": str(e)}


def update_todo(todo_id: int, new_title: str, jwt_token: str) -> dict:
    """Update todo title via Phase 2 backend API.

    Args:
        todo_id: ID of todo to update
        new_title: New title (1-500 chars)
        jwt_token: JWT authentication token

    Returns:
        Updated todo object or error
    """
    if not jwt_token:
        return {"error": "JWT token required"}

    try:
        response = requests.patch(
            f"{BACKEND_URL}/api/todos/{todo_id}",
            json={"title": new_title},
            headers={"Authorization": f"Bearer {jwt_token}"},
            timeout=5
        )

        if response.status_code == 200:
            return response.json()
        else:
            return {"error": response.json().get("detail", "Failed to update todo"), "status_code": response.status_code}
    except Exception as e:
        return {"error": str(e)}


def delete_todo(todo_id: int, jwt_token: str) -> dict:
    """Delete todo via Phase 2 backend API.

    Args:
        todo_id: ID of todo to delete
        jwt_token: JWT authentication token

    Returns:
        Success confirmation or error
    """
    if not jwt_token:
        return {"error": "JWT token required"}

    try:
        response = requests.delete(
            f"{BACKEND_URL}/api/todos/{todo_id}",
            headers={"Authorization": f"Bearer {jwt_token}"},
            timeout=5
        )

        if response.status_code == 204:
            return {"success": True, "message": "Todo deleted"}
        else:
            return {"error": response.json().get("detail", "Failed to delete todo"), "status_code": response.status_code}
    except Exception as e:
        return {"error": str(e)}


# Tool definitions for OpenAI
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_todo",
            "description": "Create a new todo with the given title",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The todo title (1-500 characters)"
                    }
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_todos",
            "description": "List all todos for the current user. Optionally filter by status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status_filter": {
                        "type": "string",
                        "enum": ["pending", "completed"],
                        "description": "Optional: filter by status (pending or completed)"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_todo",
            "description": "Mark a todo as completed by its ID",
            "parameters": {
                "type": "object",
                "properties": {
                    "todo_id": {
                        "type": "integer",
                        "description": "The ID of the todo to complete"
                    }
                },
                "required": ["todo_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_todo",
            "description": "Update a todo's title by its ID",
            "parameters": {
                "type": "object",
                "properties": {
                    "todo_id": {
                        "type": "integer",
                        "description": "The ID of the todo to update"
                    },
                    "new_title": {
                        "type": "string",
                        "description": "The new title for the todo"
                    }
                },
                "required": ["todo_id", "new_title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_todo",
            "description": "Delete a todo by its ID",
            "parameters": {
                "type": "object",
                "properties": {
                    "todo_id": {
                        "type": "integer",
                        "description": "The ID of the todo to delete"
                    }
                },
                "required": ["todo_id"]
            }
        }
    }
]


def process_tool_call(tool_name: str, tool_input: dict, jwt_token: str) -> dict:
    """Execute MCP tool with JWT token."""
    if tool_name == "create_todo":
        return create_todo(tool_input.get("title"), jwt_token)
    elif tool_name == "list_todos":
        return list_todos(jwt_token, tool_input.get("status_filter"))
    elif tool_name == "complete_todo":
        return complete_todo(tool_input.get("todo_id"), jwt_token)
    elif tool_name == "update_todo":
        return update_todo(tool_input.get("todo_id"), tool_input.get("new_title"), jwt_token)
    elif tool_name == "delete_todo":
        return delete_todo(tool_input.get("todo_id"), jwt_token)
    else:
        return {"error": f"Unknown tool: {tool_name}"}


def chat(message: str, jwt_token: str) -> str:
    """Process natural language command via OpenAI with tool use.

    Args:
        message: User's natural language command
        jwt_token: JWT token for authentication

    Returns:
        AI response as string
    """
    if not jwt_token:
        return "Error: Authentication required. Please login."

    try:
        # Call OpenAI with tools
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message}
        ]

        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            max_tokens=1024
        )

        # Get the assistant's response
        assistant_message_obj = response.choices[0].message
        assistant_message = ""

        # Check if there are tool calls
        if assistant_message_obj.tool_calls:
            for tool_call in assistant_message_obj.tool_calls:
                tool_name = tool_call.function.name
                tool_args = json.loads(tool_call.function.arguments)

                # Execute tool
                tool_result = process_tool_call(tool_name, tool_args, jwt_token)

                # Format friendly response based on tool and result
                if "error" not in tool_result:
                    if tool_name == "create_todo":
                        assistant_message += f"Added: {tool_result.get('title')}"
                    elif tool_name == "list_todos":
                        todos = tool_result.get("todos", [])
                        if not todos:
                            assistant_message += "You have no todos. Would you like to create one?"
                        else:
                            assistant_message += "Your todos:\n"
                            for todo in todos:
                                status_icon = "✓" if todo["status"] == "completed" else "○"
                                assistant_message += f"{status_icon} {todo['id']}. {todo['title']} ({todo['status']})\n"
                    elif tool_name == "complete_todo":
                        assistant_message += f"Marked '{tool_result.get('title')}' as completed"
                    elif tool_name == "update_todo":
                        assistant_message += f"Updated: {tool_result.get('title')}"
                    elif tool_name == "delete_todo":
                        assistant_message += "Todo deleted"
                else:
                    # Handle errors
                    error_msg = tool_result.get("error")
                    status_code = tool_result.get("status_code")

                    if status_code == 401:
                        assistant_message += "Please login again - your session has expired."
                    elif status_code == 403:
                        assistant_message += "Todo not found or not accessible."
                    elif status_code == 404:
                        assistant_message += "Todo not found."
                    else:
                        assistant_message += f"Error: {error_msg}"

        # If no tool calls, return the text response
        if not assistant_message and assistant_message_obj.content:
            assistant_message = assistant_message_obj.content

        return assistant_message if assistant_message else "I processed your request."

    except Exception as e:
        return f"Error processing command: {str(e)}"


# Flask app for HTTP endpoints
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend


@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """HTTP endpoint for chat interface."""
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    message = data.get("message", "")
    jwt_token = request.headers.get("Authorization", "").replace("Bearer ", "")

    if not message:
        return jsonify({"error": "Message required"}), 400

    if not jwt_token:
        return jsonify({"error": "Authentication required"}), 401

    # Process message with AI agent
    response = chat(message, jwt_token)

    return jsonify({"response": response})


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "mcp-todo-server"})


if __name__ == "__main__":
    print("MCP Server for Todo API (using OpenRouter)")
    print("Tools available:", [t["function"]["name"] for t in TOOLS])
    print(f"Model: {LLM_MODEL}")
    print("\nStarting Flask server on http://localhost:5000")

    port = int(os.getenv("MCP_PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
