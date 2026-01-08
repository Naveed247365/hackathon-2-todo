# Todo App Helm Chart

Helm chart for deploying the Todo Application on Kubernetes.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- Minikube (for local development)

## Installation

### Quick Start (Minikube)

```bash
# Start Minikube
minikube start

# Build Docker images in Minikube
eval $(minikube docker-env)
docker build -t todo-backend:v1.0.0 -f ../docker/backend/Dockerfile ../../phase-2/backend
docker build -t todo-frontend:v1.0.0 -f ../docker/frontend/Dockerfile ../../phase-2/frontend
docker build -t todo-mcp:v1.0.0 -f ../docker/mcp-server/Dockerfile ../../phase-3/mcp-server

# Install the chart
helm install todo-app ./todo-app
```

### With Custom Values

```bash
# Create secrets file
cat > my-values.yaml << EOF
secrets:
  jwtSecret: $(echo -n "your-jwt-secret" | base64)
  databaseUrl: $(echo -n "postgresql://user:pass@host:5432/db" | base64)
  openrouterApiKey: $(echo -n "sk-or-xxx" | base64)
EOF

# Install with custom values
helm install todo-app ./todo-app -f my-values.yaml
```

## Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.namespace` | Kubernetes namespace | `default` |
| `global.imagePullPolicy` | Image pull policy | `Never` |
| `backend.enabled` | Enable backend | `true` |
| `backend.replicaCount` | Backend replicas | `1` |
| `backend.service.nodePort` | Backend NodePort | `30001` |
| `frontend.enabled` | Enable frontend | `true` |
| `frontend.replicaCount` | Frontend replicas | `1` |
| `frontend.service.nodePort` | Frontend NodePort | `30002` |
| `mcp.enabled` | Enable MCP server | `true` |
| `mcp.replicaCount` | MCP replicas | `1` |
| `mcp.service.nodePort` | MCP NodePort | `30003` |

## Commands

```bash
# Install
helm install todo-app ./todo-app

# Upgrade
helm upgrade todo-app ./todo-app

# Uninstall
helm uninstall todo-app

# View templates
helm template todo-app ./todo-app

# Dry run
helm install todo-app ./todo-app --dry-run
```

## Accessing Services

After installation, access services via:

- **Backend API**: http://localhost:30001
- **Frontend**: http://localhost:30002
- **MCP Server**: http://localhost:30003
- **API Docs**: http://localhost:30001/docs

Use port-forwarding if NodePort doesn't work:
```bash
kubectl port-forward svc/todo-app-backend-svc 30001:8000
kubectl port-forward svc/todo-app-frontend-svc 30002:3000
kubectl port-forward svc/todo-app-mcp-svc 30003:5000
```
