# Phase 4: Containerization and Local Kubernetes Deployment

**Status**: Complete
**Date**: 2026-01-01

## Overview

Phase 4 containerizes the Phase 2 backend (FastAPI), Phase 2 frontend (Next.js), and Phase 3 MCP server (Flask) for local Kubernetes deployment using Minikube. This is **pure infrastructure work** with zero application logic changes.

**Key Features**:
- ✅ Multi-stage Docker builds for all 3 services
- ✅ Kubernetes manifests (Deployments, Services, ConfigMaps, Secrets)
- ✅ Local Minikube deployment
- ✅ Environment-based configuration
- ✅ Service discovery via Kubernetes DNS
- ✅ Stateless architecture
- ✅ Health check endpoints
- ✅ Single-command deployment

## Prerequisites

**Required Software**:
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Minikube (latest version)
- kubectl CLI (latest version)

**System Requirements**:
- 8GB RAM minimum
- 20GB free disk space
- x86_64 processor
- Internet connection (for Neon database and OpenRouter API)

**Verification**:
```bash
docker --version        # Should be 20.10+ or newer
minikube version        # Should be v1.30+ or newer
kubectl version         # Should be v1.26+ or newer
```

## Quick Start (3 Steps)

### 1. Start Minikube
```bash
minikube start --cpus=4 --memory=6144 --driver=docker
```

### 2. Build Images
```bash
cd phase-4
./scripts/build-images.sh
```

### 3. Deploy to Kubernetes
```bash
# Create secret.yaml from template with actual credentials
cp kubernetes/secret.yaml.example kubernetes/secret.yaml
# Edit secret.yaml with your DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY

# Deploy all services
./scripts/deploy-minikube.sh
```

**Access Application**:
```bash
# Get frontend URL
minikube service frontend-service --url
# Or visit: http://<minikube-ip>:30000
```

## Directory Structure

```
phase-4/
├── docker/                      # Dockerfiles and .dockerignore
│   ├── backend/
│   │   ├── Dockerfile           # Multi-stage Python build
│   │   └── .dockerignore
│   ├── frontend/
│   │   ├── Dockerfile           # Multi-stage Node.js build
│   │   └── .dockerignore
│   └── mcp-server/
│       ├── Dockerfile           # Multi-stage Python build
│       └── .dockerignore
├── kubernetes/                  # Kubernetes manifests
│   ├── configmap.yaml           # Non-sensitive configuration
│   ├── secret.yaml.example      # Sensitive data template
│   ├── backend-deployment.yaml  # Backend Deployment
│   ├── backend-service.yaml     # Backend Service (ClusterIP)
│   ├── frontend-deployment.yaml # Frontend Deployment
│   ├── frontend-service.yaml    # Frontend Service (NodePort 30000)
│   ├── mcp-deployment.yaml      # MCP server Deployment
│   └── mcp-service.yaml         # MCP server Service (ClusterIP)
├── scripts/                     # Automation scripts
│   ├── build-images.sh          # Build all Docker images
│   ├── deploy-minikube.sh       # Deploy to Kubernetes
│   ├── verify-deployment.sh     # Verify deployment success
│   └── teardown.sh              # Remove all resources
├── env-templates/               # Environment variable templates
│   ├── backend.env.example
│   ├── frontend.env.example
│   └── mcp-server.env.example
├── README.md                    # This file
└── DEPLOYMENT_GUIDE.md          # Detailed step-by-step guide
```

## Automation Scripts

### build-images.sh
Builds all 3 Docker images with proper tags.

```bash
cd phase-4
./scripts/build-images.sh
```

**What it does**:
- Uses Minikube Docker environment (if Minikube running)
- Builds todo-backend:v1.0.0
- Builds todo-frontend:v1.0.0
- Builds todo-mcp-server:v1.0.0

### deploy-minikube.sh
Deploys all services to Minikube.

```bash
cd phase-4
./scripts/deploy-minikube.sh
```

**What it does**:
- Applies ConfigMap
- Applies Secret (if secret.yaml exists)
- Creates all 3 Deployments
- Creates all 3 Services
- Waits for pods to become ready

### verify-deployment.sh
Verifies deployment health.

```bash
cd phase-4
./scripts/verify-deployment.sh
```

**What it does**:
- Checks pod status
- Checks service status
- Tests health endpoints
- Shows frontend access URL

### teardown.sh
Removes all Kubernetes resources.

```bash
cd phase-4
./scripts/teardown.sh
```

**What it does**:
- Deletes all Deployments
- Deletes all Services
- Deletes ConfigMap and Secret

## Troubleshooting

### Issue: Pods stuck in "ImagePullBackOff"
**Cause**: Minikube cannot find Docker images

**Solution**:
```bash
# Use Minikube Docker environment before building images
eval $(minikube docker-env)
cd phase-4
./scripts/build-images.sh
```

### Issue: Pods stuck in "CrashLoopBackOff"
**Cause**: Container failing to start (missing env vars, database unreachable)

**Solution**:
```bash
# Check logs
kubectl logs <pod-name>

# Verify secret.yaml exists with correct credentials
cat kubernetes/secret.yaml

# Test database connectivity from host
psql $DATABASE_URL
```

### Issue: Frontend cannot reach backend or MCP server
**Cause**: Service networking misconfiguration or DNS not working

**Solution**:
```bash
# Verify services exist
kubectl get svc

# Test DNS resolution from frontend pod
kubectl exec -it <frontend-pod> -- nslookup backend-service
```

### Issue: Database connection fails from backend
**Cause**: Neon database not accessible from Minikube

**Solution**:
```bash
# Test from host machine first
psql $DATABASE_URL

# Verify DATABASE_URL in secret.yaml includes ?sslmode=require
# Check firewall allows outbound PostgreSQL (port 5432)
```

### Issue: Health checks failing
**Cause**: Health endpoints not responding or configured incorrectly

**Solution**:
```bash
# Check pod logs
kubectl logs <pod-name>

# Verify health endpoint paths in Deployment manifests
# Backend: /health
# Frontend: /api/health
# MCP Server: /health
```

## Next Steps

After successful deployment:

1. **Test Application**: Visit frontend URL, perform CRUD operations, test AI chat
2. **Monitor Logs**: `kubectl logs -f <pod-name>`
3. **Update Configuration**: Edit ConfigMap/Secret, restart pods
4. **Scale Services**: `kubectl scale deployment backend-deployment --replicas=2`
5. **Teardown**: `./scripts/teardown.sh` when done

## Additional Resources

- **Detailed Guide**: See `DEPLOYMENT_GUIDE.md` for step-by-step instructions
- **Specification**: `specs/004-kubernetes-deployment/spec.md`
- **Implementation Plan**: `specs/004-kubernetes-deployment/plan.md`
- **Task List**: `specs/004-kubernetes-deployment/tasks.md`

---

**Phase 4 Complete** - All services containerized and deployable to local Kubernetes
