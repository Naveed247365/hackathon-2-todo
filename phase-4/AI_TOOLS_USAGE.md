# AI-Powered Kubernetes Tools Usage Guide

## Phase 4: AI-Assisted Kubernetes Deployment

This guide covers AI tools that enhance Kubernetes workflows for the Todo App.

---

## 1. kubectl-ai

**kubectl-ai** is a kubectl plugin that uses AI to generate Kubernetes manifests from natural language descriptions.

### Installation

```bash
# Via krew plugin manager
kubectl krew install ai

# Or via Go install
go install github.com/sozercan/kubectl-ai@latest

# Or download binary from releases
# https://github.com/sozercan/kubectl-ai/releases
```

### Configuration

```bash
export OPENAI_API_KEY="your-api-key"
# Or use OpenRouter:
export OPENAI_API_BASE="https://openrouter.ai/api/v1"
export OPENAI_API_KEY="your-openrouter-key"
```

### Usage Examples

```bash
# Generate a deployment for the todo backend
kubectl ai "Create a deployment for a Python FastAPI app called todo-backend on port 8000 with 2 replicas"

# Generate a service
kubectl ai "Create a NodePort service for todo-backend exposing port 8000 on nodePort 30001"

# Generate a ConfigMap
kubectl ai "Create a ConfigMap called todo-config with DATABASE_URL=sqlite:///./todos.db"

# Debug a failing pod
kubectl ai "Why is my todo-backend pod in CrashLoopBackOff?"

# Scale deployment
kubectl ai "Scale todo-backend to 3 replicas"
```

### Used in this project

```bash
# Generate Redpanda deployment
kubectl ai "Create a StatefulSet for Redpanda with Kafka on port 9092"

# Generate Dapr component
kubectl ai "Create a Dapr pubsub component using Kafka broker at redpanda:9092"
```

---

## 2. kagent

**kagent** is an AI agent that directly manages Kubernetes clusters through natural language interaction.

### Installation

```bash
# Install via pip
pip install kagent

# Or via Helm (runs as a pod in cluster)
helm repo add kagent https://kagent-dev.github.io/kagent/
helm install kagent kagent/kagent
```

### Usage Examples

```bash
# Start interactive session
kagent

# One-shot commands
kagent "Show me all pods in the default namespace"
kagent "What's the status of the todo-backend deployment?"
kagent "Show me the logs from the todo-mcp pod"
kagent "List all Dapr components"
kagent "Describe the todo-pubsub component"
```

### Used in this project

```bash
# Check deployment health
kagent "Are all todo app pods healthy?"

# Debug connectivity
kagent "Can the todo-mcp pod reach the todo-backend service?"

# Monitor events
kagent "Show me recent events related to todo-backend"
```

---

## 3. Docker Gordon (AI Assistant)

**Gordon** is Docker's built-in AI assistant for container management.

### Availability

Gordon is integrated into Docker Desktop (v4.38+). It provides AI-powered assistance for:
- Dockerfile optimization
- Container debugging
- Image analysis
- Compose file generation

### Usage

Gordon is accessed through Docker Desktop's GUI:
1. Open Docker Desktop
2. Click the "Gordon" icon (AI assistant)
3. Ask questions in natural language

### Example Prompts

```
"Help me optimize the Dockerfile for my Python FastAPI backend"
"Why is my todo-backend container failing to start?"
"Generate a docker-compose.yml for backend, frontend, and MCP server"
"What's the best base image for a Next.js frontend?"
```

### Note on Availability

> Gordon requires Docker Desktop v4.38+ and may not be available in all Docker editions.
> For CI/CD environments without Docker Desktop, use `docker build` and `docker push` directly.

---

## Summary Matrix

| Tool | Type | Install Method | Best For |
|------|------|---------------|----------|
| kubectl-ai | kubectl plugin | krew / Go | Manifest generation from NL |
| kagent | Cluster agent | pip / Helm | Cluster management & debugging |
| Gordon | Docker Desktop AI | Built-in (Docker Desktop) | Container & image management |

---

## Environment Setup for This Project

```bash
# Set OpenRouter as the AI provider (shared across tools)
export OPENAI_API_BASE="https://openrouter.ai/api/v1"
export OPENAI_API_KEY="$OPENROUTER_API_KEY"

# Verify tools are installed
kubectl ai --version
kagent --version
docker --version  # Gordon requires Docker Desktop 4.38+
```
