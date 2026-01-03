# Phase 4 Deployment Guide

**Complete step-by-step instructions for deploying to local Minikube**

## Step 1: Start Minikube

Start Minikube with sufficient resources for all 3 services:

```bash
minikube start --cpus=4 --memory=6144 --driver=docker
```

**Verify Minikube is running**:
```bash
minikube status
# Should show: "host: Running", "kubelet: Running", "apiserver: Running"
```

**Configure kubectl to use Minikube context**:
```bash
kubectl config use-context minikube
```

---

## Step 2: Configure Environment Variables

Navigate to phase-4 directory:
```bash
cd "E:/hackathon 2/todos/phase-4"
```

**Create secret.yaml with actual credentials**:
```bash
cp kubernetes/secret.yaml.example kubernetes/secret.yaml
```

**Edit secret.yaml** and replace placeholders:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `JWT_SECRET`: Generate with `openssl rand -hex 32` or use existing from Phase 2
- `OPENROUTER_API_KEY`: Your OpenRouter API key

**Example secret.yaml**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
  namespace: default
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@ep-example.us-east-2.aws.neon.tech:5432/todos?sslmode=require"
  JWT_SECRET: "a1b2c3d4e5f6...your-actual-secret-here"
  OPENROUTER_API_KEY: "sk-or-v1-...your-actual-key-here"
```

**IMPORTANT**: Do NOT commit secret.yaml to git (it's in .gitignore)

---

## Step 3: Build Docker Images

Use Minikube's Docker daemon to build images (avoids pushing to external registry):

```bash
# Set Docker environment to use Minikube
eval $(minikube docker-env)

# Build all images
cd "E:/hackathon 2/todos/phase-4"
./scripts/build-images.sh
```

**Expected output**:
```
Building backend image...
Building frontend image...
Building MCP server image...
All images built successfully!
```

**Verify images exist**:
```bash
docker images | grep todo-
# Should show:
# todo-backend       v1.0.0
# todo-frontend      v1.0.0
# todo-mcp-server    v1.0.0
```

**Build time**: Should complete in under 5 minutes (SC-001)

---

## Step 4: Deploy to Minikube

Deploy all services using the automation script:

```bash
cd "E:/hackathon 2/todos/phase-4"
./scripts/deploy-minikube.sh
```

**Expected output**:
```
Applying ConfigMap...
Applying Secret...
Deploying backend...
Deploying frontend...
Deploying MCP server...
Waiting for pods to become ready...
Deployment complete!
```

**Verify pods are running**:
```bash
kubectl get pods
# All 3 pods should show STATUS=Running, READY=1/1
```

**Verify services are created**:
```bash
kubectl get services
# Should show:
# backend-service    ClusterIP   10.x.x.x   <none>        8000/TCP      Xs
# frontend-service   NodePort    10.x.x.x   <none>        3000:30000/TCP Xs
# mcp-service        ClusterIP   10.x.x.x   <none>        5000/TCP      Xs
```

---

## Step 5: Access the Application

Get the frontend access URL:

**Method 1 (Recommended)**: Use Minikube service command
```bash
minikube service frontend-service --url
# Returns: http://192.168.49.2:30000 (or similar)
```

**Method 2**: Manual URL construction
```bash
# Get Minikube IP
minikube ip
# Example: 192.168.49.2

# Frontend is on NodePort 30000
# URL: http://192.168.49.2:30000
```

**Method 3**: Port forwarding (alternative)
```bash
kubectl port-forward svc/frontend-service 3000:3000
# Access: http://localhost:3000
```

**Open in browser**:
- Visit the URL from Method 1 or 2
- You should see the todo application login page

---

## Step 6: Verify Deployment

Run the verification script:

```bash
cd "E:/hackathon 2/todos/phase-4"
./scripts/verify-deployment.sh
```

**Manual verification steps**:

### 6.1 Check Pod Health
```bash
kubectl get pods
# All pods should be Running with READY=1/1
```

### 6.2 Test Health Endpoints
```bash
# Backend health
kubectl exec <backend-pod-name> -- curl -s http://localhost:8000/health
# Should return: {"status":"healthy"}

# Frontend health
kubectl exec <frontend-pod-name> -- wget -qO- http://localhost:3000/api/health
# Should return: {"status":"healthy"}

# MCP Server health
kubectl exec <mcp-pod-name> -- curl -s http://localhost:5000/health
# Should return: {"status":"healthy"}
```

### 6.3 Check Pod Logs
```bash
kubectl logs <backend-pod-name>
kubectl logs <frontend-pod-name>
kubectl logs <mcp-pod-name>
# No error messages should appear
```

### 6.4 Test Application Functionality
- **Register**: Create a new user account
- **Login**: Log in with credentials
- **Create Todo**: Add a new todo item
- **List Todos**: View all todos
- **Update Todo**: Edit a todo
- **Complete Todo**: Mark a todo as complete
- **Delete Todo**: Remove a todo
- **AI Chat**: Test natural language commands (e.g., "add buy groceries")

**All Phase 1-3 features should work identically** (SC-003)

---

## Step 7: Monitor and Manage

### View Logs
```bash
# Follow logs in real-time
kubectl logs -f <pod-name>

# View logs from all backend pods
kubectl logs -l app=backend
```

### Restart Pods
```bash
# Restart a specific deployment
kubectl rollout restart deployment backend-deployment
```

### Update Configuration
```bash
# Edit ConfigMap
kubectl edit configmap todo-config

# Restart pods to pick up changes
kubectl rollout restart deployment backend-deployment
```

### Scale Services (Optional)
```bash
# Scale backend to 2 replicas
kubectl scale deployment backend-deployment --replicas=2

# Verify
kubectl get pods
```

---

## Teardown

When done, remove all Kubernetes resources:

```bash
cd "E:/hackathon 2/todos/phase-4"
./scripts/teardown.sh
```

**Stop Minikube** (optional):
```bash
minikube stop
```

**Delete Minikube cluster** (optional, complete cleanup):
```bash
minikube delete
```

---

## Troubleshooting

### Pod won't start - ImagePullBackOff
**Problem**: Kubernetes can't find Docker images

**Solution**:
1. Ensure you ran `eval $(minikube docker-env)` before building images
2. Rebuild images: `./scripts/build-images.sh`
3. Check imagePullPolicy is "Never" in Deployment manifests

### Pod won't start - CrashLoopBackOff
**Problem**: Container crashes on startup

**Solution**:
1. Check logs: `kubectl logs <pod-name>`
2. Verify secret.yaml has correct credentials
3. Test DATABASE_URL from host: `psql $DATABASE_URL`
4. Check health endpoint path is correct

### Frontend can't reach backend
**Problem**: Service networking not working

**Solution**:
1. Verify services exist: `kubectl get svc`
2. Test DNS: `kubectl exec <frontend-pod> -- nslookup backend-service`
3. Check NEXT_PUBLIC_API_URL in ConfigMap uses `backend-service:8000`

### Database connection fails
**Problem**: Backend can't connect to Neon database

**Solution**:
1. Verify DATABASE_URL includes `?sslmode=require`
2. Test from host: `psql $DATABASE_URL`
3. Check firewall allows outbound port 5432
4. Verify Neon database is running and accessible

### Pods ready but health checks failing
**Problem**: Health endpoint not responding

**Solution**:
1. Check pod logs for errors
2. Verify health endpoint paths:
   - Backend: `/health`
   - Frontend: `/api/health`
   - MCP Server: `/health`
3. Test manually: `kubectl exec <pod> -- curl localhost:8000/health`

---

## Success Criteria Validation

After deployment, verify these metrics:

- ✅ **SC-001**: Build time under 5 minutes (time the build-images.sh script)
- ✅ **SC-002**: Containers start under 30 seconds (check pod READY time)
- ✅ **SC-003**: 100% feature parity (test all CRUD operations and AI chat)
- ✅ **SC-004**: Single-command deployment (deploy-minikube.sh succeeds)
- ✅ **SC-005**: Config changes without rebuilds (edit ConfigMap, restart pods)
- ✅ **SC-006**: Zero data loss on pod restart (delete pod, verify data persists)
- ✅ **SC-007**: Database performance within 10% (compare API response times)
- ✅ **SC-008**: Application accessible within 2 minutes of deployment
- ✅ **SC-009**: Redeployment under 3 minutes (teardown + deploy)
- ✅ **SC-010**: Service communication 100% success (all API calls succeed)

---

## Additional Commands

### View all resources
```bash
kubectl get all
```

### Describe a pod
```bash
kubectl describe pod <pod-name>
```

### Execute command in pod
```bash
kubectl exec -it <pod-name> -- /bin/sh
```

### Port forward a service
```bash
kubectl port-forward svc/backend-service 8000:8000
```

### View ConfigMap contents
```bash
kubectl get configmap todo-config -o yaml
```

### View Secret contents (base64 encoded)
```bash
kubectl get secret todo-secrets -o yaml
```

---

**Deployment Complete!** Your application is now running in local Kubernetes with all Phase 1-3 features functional.
