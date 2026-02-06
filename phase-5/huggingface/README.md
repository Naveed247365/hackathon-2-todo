---
title: Todo App - Phase 5
emoji: 📋
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Todo App - Phase 5: Event-Driven Cloud Architecture

A full-stack Todo application with AI-powered chatbot.

## Features
- User Authentication (JWT)
- CRUD Operations for Todos
- Priority, Tags, Due Dates
- Recurring Tasks
- AI Chatbot (MCP Server)
- Dark/Light Theme

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL (Neon)
- **AI**: OpenRouter API, GPT-3.5-turbo
- **Database**: Neon PostgreSQL

## Usage
1. Sign up / Login
2. Create, edit, complete, delete todos
3. Use the AI chatbot for natural language commands

## Environment Variables (Secrets)
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET_KEY` - JWT signing key
- `OPENROUTER_API_KEY` - OpenRouter API key
