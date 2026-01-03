# Phase 5 Quickstart Guide

Complete guide for setting up and running the Phase 5 Event-Driven Todo Application.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Cloud Deployment (Azure AKS)](#cloud-deployment-azure-aks)
3. [Testing Features](#testing-features)
4. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

**Required:**
- **Python 3.11+** - Backend runtime
- **Node.js 18+** - Frontend runtime
- **Docker Desktop** - For Kafka, Redis, and Dapr runtime
- **Dapr CLI 1.11+** - Event-driven runtime
- **PostgreSQL** - Database (Neon cloud or local)

**Installation:**

```bash
# Install Dapr CLI (macOS/Linux)
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Install Dapr CLI (Windows PowerShell)
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"

# Initialize Dapr (installs Docker containers for local dev)
dapr init
```

### Step 1: Start Infrastructure Services

Navigate to Phase 5 directory and start Kafka, Redis, Zookeeper:

```bash
cd phase-5/local-dev
docker-compose up -d

# Verify services running
docker ps
# Expected: kafka, zookeeper, redis, kafka-ui containers
```

**Service Ports:**
- Kafka: `localhost:9092`
- Kafka UI: `http://localhost:8081`
- Redis: `localhost:6379`
- Zookeeper: `localhost:2181`

### Step 2: Setup Backend

```bash
cd phase-5/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL (Neon PostgreSQL or local)
```

**Sample .env:**

```env
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGINS=http://localhost:3000
```

### Step 3: Run Database Migrations

```bash
# Run Alembic migrations
cd phase-5/backend
alembic upgrade head

# Verify migrations
alembic current
# Expected: 006 (recurring unique constraint)
```

**Migrations Applied:**
1. `001_add_advanced_fields` - Priority, tags, due_date, recurring fields
2. `002_add_todo_events_table` - Event sourcing table
3. `003_add_tags_table` - Tag autocomplete table
4. `004_backfill_defaults` - Backward compatibility defaults
5. `005_add_search_index` - Full-text search GIN index
6. `006_add_recurring_unique_constraint` - Recurring idempotency

### Step 4: Start Backend with Dapr

```bash
cd phase-5/backend

# Start backend with Dapr sidecar
dapr run \
  --app-id todos-backend \
  --app-port 8000 \
  --dapr-http-port 3500 \
  --components-path ../local-dev/dapr-components \
  -- uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Verify backend:**
- API: `http://localhost:8000/docs` (Swagger UI)
- Dapr sidecar: `http://localhost:3500/v1.0/healthz`

### Step 5: Start Event Processor with Dapr

Open a new terminal:

```bash
cd phase-5/event-processor

# Install dependencies
pip install -r requirements.txt

# Start event processor with Dapr
dapr run \
  --app-id event-processor \
  --app-port 5001 \
  --dapr-http-port 3501 \
  --components-path ../local-dev/dapr-components \
  -- uvicorn main:app --host 0.0.0.0 --port 5001
```

**Verify event processor:**
- Health: `http://localhost:5001/health`
- Subscription: `http://localhost:5001/dapr/subscribe`

### Step 6: Start Frontend

Open a new terminal:

```bash
cd phase-5/frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with NEXT_PUBLIC_API_URL=http://localhost:8000

# Start Next.js dev server
npm run dev
```

**Access application:**
- Frontend: `http://localhost:3000/todos-v5`
- Login/Signup: `http://localhost:3000/login`

### Step 7: Verify Event-Driven Architecture

**Create a todo and verify event flow:**

1. **Create todo via frontend:**
   - Visit `http://localhost:3000/todos-v5`
   - Create a todo with priority=High, tags=#work
   - Todo should appear immediately

2. **Check Kafka topic (via Kafka UI):**
   - Visit `http://localhost:8081`
   - Navigate to Topics → `todos.events`
   - Verify `TodoCreated` event published

3. **Check database for event:**
   ```sql
   SELECT event_type, todo_id, processing_status, timestamp
   FROM todo_events
   ORDER BY timestamp DESC
   LIMIT 10;
   ```
   - Should show `TodoCreated` event with `Processed` status

---

## Cloud Deployment (Azure AKS)

### Prerequisites

**Required:**
- **Azure CLI** - `az` command
- **kubectl** - Kubernetes CLI
- **Helm 3** - Package manager (for Dapr install)
- **Azure subscription** - With permissions to create resources

**Resources to create:**
- Azure AKS cluster (2-node B2s)
- Azure Event Hubs namespace (Kafka-compatible)
- Neon PostgreSQL database (or Azure Database for PostgreSQL)

### Step 1: Create Azure Resources

```bash
# Login to Azure
az login

# Set variables
RESOURCE_GROUP="todos-phase5-rg"
LOCATION="eastus"
AKS_CLUSTER="todos-aks"
EVENT_HUBS_NAMESPACE="todos-events-ns"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create AKS cluster (2-node B2s per plan.md)
az aks create \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_CLUSTER \
  --node-count 2 \
  --node-vm-size Standard_B2s \
  --enable-managed-identity \
  --generate-ssh-keys

# Get AKS credentials
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER

# Verify kubectl connection
kubectl get nodes
```

### Step 2: Create Azure Event Hubs (Kafka-compatible)

```bash
# Create Event Hubs namespace
az eventhubs namespace create \
  --resource-group $RESOURCE_GROUP \
  --name $EVENT_HUBS_NAMESPACE \
  --location $LOCATION \
  --sku Standard

# Create 'todos.events' topic
az eventhubs eventhub create \
  --resource-group $RESOURCE_GROUP \
  --namespace-name $EVENT_HUBS_NAMESPACE \
  --name todos.events \
  --partition-count 3 \
  --message-retention 7

# Get connection string
az eventhubs namespace authorization-rule keys list \
  --resource-group $RESOURCE_GROUP \
  --namespace-name $EVENT_HUBS_NAMESPACE \
  --name RootManageSharedAccessKey \
  --query primaryConnectionString -o tsv
```

**Save connection string** - needed for Kubernetes secrets.

### Step 3: Install Dapr on AKS

```bash
# Install Dapr control plane via Helm
helm repo add dapr https://dapr.github.io/helm-charts/
helm repo update

helm upgrade --install dapr dapr/dapr \
  --version=1.11 \
  --namespace dapr-system \
  --create-namespace \
  --wait

# Verify Dapr installation
kubectl get pods -n dapr-system
# Expected: dapr-operator, dapr-sidecar-injector, dapr-sentry, dapr-placement
```

### Step 4: Create Kubernetes Secrets

```bash
cd phase-5/kubernetes

# Copy secret template
cp secret.yaml.example secret.yaml

# Edit secret.yaml with base64-encoded values:
# - DATABASE_URL (Neon PostgreSQL or Azure Database)
# - EVENT_HUBS_CONNECTION_STRING (from Step 2)
# - JWT_SECRET (generate with: openssl rand -base64 32)

# Apply secrets
kubectl apply -f secret.yaml
```

**Example secret.yaml:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todos-secrets
  namespace: todos-phase5
type: Opaque
data:
  DATABASE_URL: <base64-encoded-postgres-url>
  EVENT_HUBS_CONNECTION_STRING: <base64-encoded-connection-string>
  JWT_SECRET: <base64-encoded-secret>
```

### Step 5: Apply Dapr Components

```bash
cd phase-5/kubernetes/dapr-components

# Edit pubsub-kafka.yaml with your Event Hubs namespace
# Replace: your-eventhubs.servicebus.windows.net

# Apply Dapr components
kubectl apply -f pubsub-kafka.yaml
kubectl apply -f statestore-cosmosdb.yaml  # Or statestore-redis.yaml for dev

# Verify components
kubectl get components -n todos-phase5
```

### Step 6: Run Database Migrations

```bash
cd phase-5/scripts

# Set DATABASE_URL from secret
export DATABASE_URL=$(kubectl get secret todos-secrets -n todos-phase5 -o jsonpath='{.data.DATABASE_URL}' | base64 --decode)

# Run migrations
./migrate-db.sh
```

### Step 7: Deploy Services to AKS

```bash
cd phase-5/kubernetes

# Apply namespace and ConfigMap
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml

# Deploy backend
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# Deploy event processor
kubectl apply -f event-processor-deployment.yaml
kubectl apply -f event-processor-service.yaml

# Deploy frontend
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# Wait for deployments
kubectl wait --for=condition=available --timeout=300s deployment/todos-backend -n todos-phase5
kubectl wait --for=condition=available --timeout=300s deployment/event-processor -n todos-phase5
kubectl wait --for=condition=available --timeout=300s deployment/todos-frontend -n todos-phase5
```

### Step 8: Verify Deployment

```bash
# Check pods (should have 2 containers: app + daprd sidecar)
kubectl get pods -n todos-phase5

# Check services
kubectl get services -n todos-phase5

# Get LoadBalancer external IP for frontend
kubectl get service todos-frontend -n todos-phase5 -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

**Access application:**
- Frontend: `http://<EXTERNAL-IP>:3000/todos-v5`

### Step 9: Verify Event Flow on Cloud

```bash
# Check Event Hubs activity
az eventhubs eventhub show \
  --resource-group $RESOURCE_GROUP \
  --namespace-name $EVENT_HUBS_NAMESPACE \
  --name todos.events \
  --query messageRetentionInDays

# Check backend logs
kubectl logs -n todos-phase5 -l app=todos-backend -c todos-backend --tail=50

# Check event processor logs
kubectl logs -n todos-phase5 -l app=event-processor -c event-processor --tail=50
```

---

## Testing Features

### Test 1: Priority Feature (US1)

1. Create todo with priority=High
2. Verify red badge displayed
3. Filter by priority=High
4. Verify only High priority todos shown

### Test 2: Tags Feature (US2)

1. Create todo with tags: `work, urgent`
2. Verify tags auto-prefixed with `#` and displayed as blue chips
3. Filter by tag `#work`
4. Verify todos with `#work` tag shown

### Test 3: Due Dates Feature (US3)

1. Create todo with due_date = tomorrow
2. Verify due date displayed with calendar icon
3. Wait for due_date to pass
4. Verify "Overdue" indicator appears (red background)

### Test 4: Search Feature (US4)

1. Create 5 todos with different titles/tags/priorities
2. Search: `"meeting #work priority:High"`
3. Verify only matching todos shown
4. Verify matched text highlighted in yellow

### Test 5: Recurring Tasks Feature (US5)

1. Create todo: Title="Daily standup", Due Date=Today, Recurring=Daily
2. Complete the todo
3. Verify new todo created with due_date=Tomorrow
4. Verify parent_todo_id links to original
5. Delete original recurring todo
6. Verify future occurrences cancelled

### Test 6: Event Sourcing (US6)

1. Create a todo
2. Update its priority from Medium to High
3. Complete the todo
4. Query `todo_events` table:
   ```sql
   SELECT event_type, payload FROM todo_events WHERE todo_id = <id> ORDER BY timestamp;
   ```
5. Verify 3 events: `TodoCreated`, `TodoUpdated`, `TodoCompleted`

---

## Troubleshooting

### Backend won't start

**Issue:** `dapr: command not found`
- **Fix:** Install Dapr CLI: `curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash`

**Issue:** `connection refused` to PostgreSQL
- **Fix:** Verify DATABASE_URL in `.env` is correct. Test connection: `psql $DATABASE_URL`

**Issue:** Dapr sidecar won't start
- **Fix:** Check Docker is running. Run `dapr init` to reinstall.

### Event processor not receiving events

**Issue:** Events published but not processed
- **Fix:**
  1. Check Kafka is running: `docker ps | grep kafka`
  2. Verify topic exists: Visit `http://localhost:8081` (Kafka UI)
  3. Check event processor logs: `docker logs <event-processor-container>`
  4. Verify Dapr subscription: `curl http://localhost:3501/dapr/subscribe`

### Search not working

**Issue:** Search returns no results
- **Fix:**
  1. Verify migration 005 applied: `alembic current`
  2. Check GIN index exists:
     ```sql
     SELECT indexname FROM pg_indexes WHERE tablename = 'todos' AND indexname = 'idx_todos_search_vector';
     ```
  3. Test search manually:
     ```sql
     SELECT title FROM todos WHERE search_vector @@ to_tsquery('english', 'meeting:*');
     ```

### Recurring tasks not generating

**Issue:** Completed recurring todo doesn't create next occurrence
- **Fix:**
  1. Verify migration 006 applied (unique constraint)
  2. Check backend logs for errors during completion
  3. Verify `is_recurring=true` and `recurrence_pattern` is set
  4. Test manually:
     ```python
     from services.recurring_service import recurring_service
     next_todo = recurring_service.generate_next_occurrence(db, original_todo)
     ```

### Cloud deployment issues

**Issue:** Pods in `CrashLoopBackOff`
- **Fix:**
  1. Check logs: `kubectl logs <pod-name> -n todos-phase5 -c todos-backend`
  2. Verify secrets exist: `kubectl get secrets -n todos-phase5`
  3. Check Dapr sidecar: `kubectl logs <pod-name> -n todos-phase5 -c daprd`

**Issue:** LoadBalancer stuck in `Pending`
- **Fix:** Wait 5-10 minutes for Azure to provision external IP. Check Azure Portal for Load Balancer resource.

**Issue:** Events not flowing through Event Hubs
- **Fix:**
  1. Verify connection string in secret is correct
  2. Check Event Hubs firewall settings (allow AKS outbound IP)
  3. Test Event Hubs connectivity from AKS:
     ```bash
     kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- sh
     # Inside pod: curl <eventhubs-namespace>.servicebus.windows.net:9093
     ```

---

## Additional Resources

- **Dapr Documentation:** https://docs.dapr.io/
- **Event Hubs Kafka Protocol:** https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-for-kafka-ecosystem-overview
- **PostgreSQL Full-Text Search:** https://www.postgresql.org/docs/current/textsearch.html
- **Next.js Documentation:** https://nextjs.org/docs
- **FastAPI Documentation:** https://fastapi.tiangolo.com/

---

**Phase 5 Quickstart Guide - Version 1.0**
*Last Updated: 2026-01-02*
