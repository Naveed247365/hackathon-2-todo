# Dapr Event-Driven Architecture for Todo App

This directory contains Dapr components and configurations for the event-driven architecture in Phase 5.

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend  │────▶│   Backend    │────▶│  Event Processor │
│  (Next.js)  │     │  (FastAPI)   │     │    (FastAPI)     │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │                      │
                           │  Dapr Pub/Sub        │
                           ▼                      ▼
                    ┌──────────────────────────────┐
                    │      Redis (Pub/Sub)         │
                    │   - task-created topic       │
                    │   - task-completed topic     │
                    │   - task-reminder topic      │
                    └──────────────────────────────┘
```

## Dapr Components

### 1. Pub/Sub (`pubsub.yaml`)
- **Type**: Redis
- **Topics**:
  - `task-created`: When a new task is created
  - `task-completed`: When a task is marked complete
  - `task-reminder`: For due date reminders
  - `recurring-trigger`: For recurring task generation

### 2. State Store (`statestore.yaml`)
- **Type**: Redis
- **Purpose**: Store application state, caching

### 3. Cron Binding (`binding-cron.yaml`)
- **Type**: Cron input binding
- **Schedule**: Every hour
- **Purpose**: Check for tasks with upcoming due dates

### 4. Secret Store (`secretstore.yaml`)
- **Type**: Kubernetes secrets
- **Purpose**: Secure credential management

## Event Flow

1. **Task Created**:
   - Backend creates task → Publishes to `task-created`
   - Event processor receives → Schedules reminder if due date exists

2. **Task Completed**:
   - Backend marks complete → Publishes to `task-completed`
   - Event processor receives → Creates next recurring task if applicable

3. **Reminder Flow**:
   - Cron binding triggers hourly
   - Event processor checks for tasks due within 24 hours
   - Publishes `task-reminder` events

## Installation

### Prerequisites
- Minikube running
- Dapr CLI installed: `winget install Dapr.CLI`

### Deploy Dapr to Kubernetes
```bash
# Initialize Dapr on K8s
dapr init -k --wait

# Verify installation
dapr status -k
```

### Deploy Components
```bash
# Apply Dapr components
kubectl apply -f components/

# Verify components
dapr components -k
```

## Testing Events

### Publish Test Event
```bash
# Via Dapr CLI
dapr publish --pubsub todo-pubsub --topic task-created --data '{"task_id": 1, "title": "Test"}'

# Via HTTP (from within cluster)
curl -X POST http://localhost:3500/v1.0/publish/todo-pubsub/task-created \
  -H "Content-Type: application/json" \
  -d '{"task_id": 1, "title": "Test Task"}'
```

### Check Event Processor Logs
```bash
kubectl logs -l app=todo-event-processor -f
```

## Production Considerations

For production deployment:
1. Replace Redis with Apache Kafka for better scalability
2. Use Azure Service Bus, AWS SNS/SQS, or GCP Pub/Sub
3. Configure proper authentication and TLS
4. Set up monitoring with Dapr observability

## Files Structure

```
dapr/
├── README.md
└── components/
    ├── pubsub.yaml       # Pub/Sub configuration
    ├── statestore.yaml   # State store configuration
    ├── binding-cron.yaml # Cron binding for reminders
    └── secretstore.yaml  # Secret store configuration
```
