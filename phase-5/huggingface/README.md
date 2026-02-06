---
title: Todo App with AI Assistant - Complete Solution
emoji: 🤖
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Todo App with AI Assistant - Complete Solution

A full-stack Todo application featuring advanced AI capabilities, event-driven architecture, and cloud-native deployment.

## Features

### Core Todo Management
- Create, read, update, delete, and complete todos
- Multi-user support with authentication
- Data isolation between users

### Advanced Features
- **Priority Levels**: High, Medium, Low priority assignment
- **Tags**: Categorize todos with multiple tags
- **Due Dates**: Set deadlines with overdue tracking
- **Recurring Tasks**: Daily, Weekly, Monthly recurring todos
- **Search & Filter**: Find todos by text, tags, priority, and due dates

### AI-Powered Assistant
- **Natural Language Interface**: Manage todos using conversational commands
- **Supports Urdu**: Automatic Urdu language detection and RTL text support
- **Voice Commands**: Web Speech API integration for voice input
- **Chat History**: Persistent conversation history
- **OpenAI Agents SDK**: Official agent framework for reliable tool usage

### Cloud-Native Architecture
- **Event-Driven**: Kafka/Redpanda pub/sub for todo lifecycle events
- **Dapr Integration**: Sidecar architecture for service communication
- **SQLModel**: Unified Pydantic + SQLAlchemy ORM
- **Better Auth**: Modern authentication with JWT plugin

## Technologies

- **Backend**: FastAPI with SQLModel ORM
- **Frontend**: Next.js with React and TypeScript
- **AI/ML**: OpenAI Agents SDK via MCP protocol
- **Database**: PostgreSQL/SQLite
- **Messaging**: Redpanda (Kafka-compatible)
- **Orchestration**: Dapr runtime
- **Authentication**: Better Auth
- **CI/CD**: GitHub Actions

## Usage

1. Sign up or log in to create your account
2. Create todos with priority, tags, and due dates
3. Use the AI assistant to manage todos via natural language
4. Set recurring tasks for routine activities
5. Organize todos with tags and priority levels

### Natural Language Commands

The AI assistant understands commands like:
- "Add buy groceries"
- "List my pending todos"
- "Complete task 1"
- "Update groceries to buy organic groceries"
- "Show high priority tasks"
- "Set due date for task tomorrow"

#### Urdu Support
- "نیا کام شامل کرو: گروسری خریدنا"
- "میرے کام دکھاو"

#### Voice Commands
- Click the microphone button to speak commands
- Supports both English and Urdu voice input

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, React
- **Backend**: FastAPI, SQLModel, PostgreSQL (Neon)
- **AI**: OpenAI Agents SDK, OpenRouter API
- **Database**: SQLModel (Pydantic + SQLAlchemy)
- **Auth**: Better Auth with JWT plugin
- **Messaging**: Redpanda (Kafka-compatible)
- **Service Mesh**: Dapr runtime
- **CI/CD**: GitHub Actions

## Environment Variables (Secrets)
- `DATABASE_URL` - PostgreSQL/SQLite connection string
- `BETTER_AUTH_SECRET` - Better Auth signing key
- `OPENROUTER_API_KEY` - OpenRouter API key for AI
- `OPENROUTER_BASE_URL` - Base URL for OpenRouter API
- `LLM_MODEL` - AI model name (default: gpt-3.5-turbo)

## Architecture

The application uses a microservices architecture with:
- Backend API for todo management
- MCP server for AI agent integration
- Event processor for async event handling
- Dapr sidecars for service mesh capabilities
- Redpanda for event streaming