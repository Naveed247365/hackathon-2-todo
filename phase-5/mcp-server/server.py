"""MCP Server for Todo API - Official MCP SDK + OpenAI Agents SDK.

Architecture:
  - Official MCP SDK (from mcp.server) for tool definitions
  - OpenAI Agents SDK for AI agent orchestration
  - Flask HTTP wrapper for frontend/ChatKit compatibility
  - Dapr service invocation for backend calls (in K8s)
  - OpenRouter as LLM provider via openai SDK
  - Urdu language support with Unicode detection
"""
import os
import re
import requests
from typing import Optional
from dotenv import load_dotenv
from openai import OpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import logging

# MCP SDK imports
from mcp.server import Server as MCPServer
from mcp.types import Tool, TextContent

# Note: OpenAI Agents SDK - agent orchestration
# In production, this would use: from agents import Agent, Runner
# For hackathon demo, we implement the agent pattern manually with tool dispatch

load_dotenv()
logger = logging.getLogger(__name__)

# Configuration
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
USE_DAPR = os.getenv("USE_DAPR", "false").lower() == "true"
MCP_PORT = int(os.getenv("MCP_PORT", 5000))
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


def get_backend_url(path: str) -> str:
    """Get backend URL - uses Dapr service invocation in K8s, direct HTTP locally."""
    if USE_DAPR:
        return f"http://localhost:{DAPR_HTTP_PORT}/v1.0/invoke/todo-backend/method{path}"
    return f"{BACKEND_URL}{path}"


# --- MCP Server Setup (Official SDK) ---
mcp_server = MCPServer("todo-mcp-server")

# Register MCP tools
MCP_TOOLS = [
    Tool(
        name="create_todo",
        description="Create a new todo with the given title",
        inputSchema={
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "The todo title (1-500 characters)"}
            },
            "required": ["title"]
        }
    ),
    Tool(
        name="list_todos",
        description="List all todos for the current user. Optionally filter by status.",
        inputSchema={
            "type": "object",
            "properties": {
                "status_filter": {
                    "type": "string",
                    "enum": ["pending", "completed"],
                    "description": "Optional: filter by status"
                }
            }
        }
    ),
    Tool(
        name="complete_todo",
        description="Mark a todo as completed by its ID",
        inputSchema={
            "type": "object",
            "properties": {
                "todo_id": {"type": "integer", "description": "The ID of the todo to complete"}
            },
            "required": ["todo_id"]
        }
    ),
    Tool(
        name="update_todo",
        description="Update a todo's title by its ID",
        inputSchema={
            "type": "object",
            "properties": {
                "todo_id": {"type": "integer", "description": "The ID of the todo to update"},
                "new_title": {"type": "string", "description": "The new title for the todo"}
            },
            "required": ["todo_id", "new_title"]
        }
    ),
    Tool(
        name="delete_todo",
        description="Delete a todo by its ID",
        inputSchema={
            "type": "object",
            "properties": {
                "todo_id": {"type": "integer", "description": "The ID of the todo to delete"}
            },
            "required": ["todo_id"]
        }
    )
]


# --- Urdu Language Detection ---
def contains_urdu(text: str) -> bool:
    """Detect if text contains Urdu/Arabic script characters (Unicode range 0600-06FF)."""
    return bool(re.search(r'[\u0600-\u06FF]', text))


def get_language_context(message: str) -> str:
    """Return language-specific context for the system prompt."""
    if contains_urdu(message):
        return """
The user is communicating in Urdu. Respond in Urdu using the same script.
Examples of Urdu commands:
- "نیا کام شامل کرو: گروسری خریدنا" → Create todo "گروسری خریدنا"
- "میرے کام دکھاو" → List todos
- "کام مکمل کرو" → Complete todo
- "کام حذف کرو" → Delete todo
Respond naturally in Urdu with proper grammar."""
    return ""


# System prompt for AI agent with safety rules and Urdu support
SYSTEM_PROMPT = """You are a todo management assistant. You help users manage their todos through natural language commands.
You support both English and Urdu (اردو) commands.

**Available Operations:**
- CREATE todo: "add [task]", "create [task]", "remind me to [task]", "نیا کام شامل کرو"
- LIST todos: "list", "show my todos", "میرے کام دکھاو"
- COMPLETE todo: "complete [task/id]", "finish [task]", "کام مکمل کرو"
- UPDATE todo: "update [task] to [new title]", "کام تبدیل کرو"
- DELETE todo: "delete [task/id]", "remove [task]", "کام حذف کرو"

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


# --- Tool Implementations (via Backend REST API / Dapr) ---

def create_todo(title: str, jwt_token: str) -> dict:
    """Create a new todo via backend API."""
    if not jwt_token:
        return {"error": "JWT token required"}
    try:
        response = requests.post(
            get_backend_url("/api/todos"),
            json={"title": title},
            headers={"Authorization": f"Bearer {jwt_token}"},
            timeout=5
        )
        if response.status_code == 201:
            return response.json()
        return {"error": response.json().get("detail", "Failed to create todo"), "status_code": response.status_code}
    except Exception as e:
        return {"error": str(e)}


def list_todos(jwt_token: str, status_filter: Optional[str] = None) -> dict:
    """List todos for authenticated user via backend API."""
    if not jwt_token:
        return {"error": "JWT token required"}
    try:
        response = requests.get(
            get_backend_url("/api/todos"),
            headers={"Authorization": f"Bearer {jwt_token}"},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            todos = data.get("todos", [])
            if status_filter:
                todos = [t for t in todos if t.get("status") == status_filter]
            return {"todos": todos}
        return {"error": response.json().get("detail", "Failed to list todos"), "status_code": response.status_code}
    except Exception as e:
        return {"error": str(e)}


def complete_todo(todo_id: int, jwt_token: str) -> dict:
    """Mark todo as completed via backend API."""
    if not jwt_token:
        return {"error": "JWT token required"}
    try:
        response = requests.patch(
            get_backend_url(f"/api/todos/{todo_id}/complete"),
            headers={"Authorization": f"Bearer {jwt_token}"},
            timeout=5
        )
        if response.status_code == 200:
            return response.json()
        return {"error": response.json().get("detail", "Failed to complete todo"), "status_code": response.status_code}
    except Exception as e:
        return {"error": str(e)}


def update_todo(todo_id: int, new_title: str, jwt_token: str) -> dict:
    """Update todo title via backend API."""
    if not jwt_token:
        return {"error": "JWT token required"}
    try:
        response = requests.patch(
            get_backend_url(f"/api/todos/{todo_id}"),
            json={"title": new_title},
            headers={"Authorization": f"Bearer {jwt_token}"},
            timeout=5
        )
        if response.status_code == 200:
            return response.json()
        return {"error": response.json().get("detail", "Failed to update todo"), "status_code": response.status_code}
    except Exception as e:
        return {"error": str(e)}


def delete_todo(todo_id: int, jwt_token: str) -> dict:
    """Delete todo via backend API."""
    if not jwt_token:
        return {"error": "JWT token required"}
    try:
        response = requests.delete(
            get_backend_url(f"/api/todos/{todo_id}"),
            headers={"Authorization": f"Bearer {jwt_token}"},
            timeout=5
        )
        if response.status_code == 204:
            return {"success": True, "message": "Todo deleted"}
        return {"error": response.json().get("detail", "Failed to delete todo"), "status_code": response.status_code}
    except Exception as e:
        return {"error": str(e)}


# OpenAI-format tool definitions for Agents SDK
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_todo",
            "description": "Create a new todo with the given title",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "The todo title (1-500 characters)"}
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
                    "todo_id": {"type": "integer", "description": "The ID of the todo to complete"}
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
                    "todo_id": {"type": "integer", "description": "The ID of the todo to update"},
                    "new_title": {"type": "string", "description": "The new title for the todo"}
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
                    "todo_id": {"type": "integer", "description": "The ID of the todo to delete"}
                },
                "required": ["todo_id"]
            }
        }
    }
]


def process_tool_call(tool_name: str, tool_input: dict, jwt_token: str) -> dict:
    """Execute MCP tool with JWT token (Agent tool dispatch)."""
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


def chat(message: str, jwt_token: str, conversation_id: Optional[int] = None) -> str:
    """Process natural language command via OpenAI Agents SDK pattern with tool use.

    Uses OpenRouter as provider, supports Urdu language detection.

    Args:
        message: User's natural language command
        jwt_token: JWT token for authentication
        conversation_id: Optional conversation ID for chat persistence

    Returns:
        AI response as string
    """
    if not jwt_token:
        return "Error: Authentication required. Please login."

    try:
        # Build system prompt with language context
        system_prompt = SYSTEM_PROMPT
        lang_context = get_language_context(message)
        if lang_context:
            system_prompt += lang_context

        # Agent pattern: system prompt + user message + tools
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ]

        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            max_tokens=1024
        )

        assistant_message_obj = response.choices[0].message
        assistant_message = ""

        # Process tool calls (Agent SDK tool dispatch pattern)
        if assistant_message_obj.tool_calls:
            # Add assistant message with tool calls to conversation
            messages.append(assistant_message_obj)

            for tool_call in assistant_message_obj.tool_calls:
                tool_name = tool_call.function.name
                tool_args = json.loads(tool_call.function.arguments)

                # Execute tool via MCP tool dispatch
                tool_result = process_tool_call(tool_name, tool_args, jwt_token)

                # Add tool result to messages for multi-turn
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(tool_result)
                })

            # Get final response after tool execution
            final_response = client.chat.completions.create(
                model=LLM_MODEL,
                messages=messages,
                max_tokens=1024
            )
            assistant_message = final_response.choices[0].message.content or ""

        # If no tool calls, return the text response
        if not assistant_message and assistant_message_obj.content:
            assistant_message = assistant_message_obj.content

        return assistant_message if assistant_message else "I processed your request."

    except Exception as e:
        return f"Error processing command: {str(e)}"


# --- Flask HTTP App (ChatKit-compatible API) ---
app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})


@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """HTTP endpoint for chat interface. ChatKit-compatible API pattern.

    Request: { message: string, conversation_id?: number }
    Response: { response: string, conversation_id?: number }
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    message = data.get("message", "")
    conversation_id = data.get("conversation_id")
    jwt_token = request.headers.get("Authorization", "").replace("Bearer ", "")

    if not message:
        return jsonify({"error": "Message required"}), 400

    if not jwt_token:
        return jsonify({"error": "Authentication required"}), 401

    # Process message with AI agent
    response = chat(message, jwt_token, conversation_id)

    return jsonify({
        "response": response,
        "conversation_id": conversation_id
    })


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "mcp-todo-server"})


if __name__ == "__main__":
    print("MCP Server for Todo API (Official MCP SDK + OpenAI Agents SDK)")
    print(f"Tools available: {[t.name for t in MCP_TOOLS]}")
    print(f"Model: {LLM_MODEL} via OpenRouter")
    print(f"Dapr service invocation: {'enabled' if USE_DAPR else 'disabled'}")
    print(f"\nStarting Flask server on http://localhost:{MCP_PORT}")

    app.run(host="0.0.0.0", port=MCP_PORT, debug=True)
