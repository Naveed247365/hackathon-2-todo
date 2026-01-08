# Phase 4 Research & Discovery

**Date**: 2026-01-01
**Phase**: Research (Phase 0)
**Tasks**: T001-T011

---

## R1: Docker Multi-Stage Build Patterns

### Python Applications (Backend, MCP Server)

**Recommended Base Image**: `python:3.11-slim`

**Rationale**:
- Smaller than full `python:3.11` image (~900MB vs ~150MB final)
- Better compatibility than `alpine` for packages with C extensions (psycopg, bcrypt)
- Includes essential build tools in slim variant
- Official Python image, well-maintained

**Multi-Stage Pattern**:
```dockerfile
# Stage 1: Builder
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
USER appuser
CMD ["python", "main.py"]
```

**Non-Root User**:
- UID 1000 (appuser)
- Create with: `RUN useradd -m -u 1000 appuser`

### Node.js Application (Frontend - Next.js)

**Recommended Base Image**: `node:18-alpine`

**Rationale**:
- Alpine-based for minimal size (~180MB final vs ~1GB full node)
- Node.js 18 LTS (long-term support)
- Next.js officially supports Alpine
- Smaller attack surface

**Multi-Stage Pattern (3 stages)**:
```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Runtime
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules
USER nextjs
CMD ["npm", "start"]
```

**Non-Root User**:
- UID 1001 (nextjs)
- Create with: `RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001`

### .dockerignore Patterns

**Python Services** (backend, MCP server):
```
*.pyc
__pycache__
.env
.env.*
.git
.gitignore
*.md
README.md
tests/
.pytest_cache/
.venv/
venv/
*.sqlite
*.db
.DS_Store
```

**Node.js Service** (frontend):
```
node_modules
.next
.git
.gitignore
*.md
README.md
.env.local
.env*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
.vercel
```

---

## R2: Kubernetes Resource Configuration

### Health Check Endpoints

**Existing Health Endpoints**:
- ✅ Backend: `GET /health` exists (phase-2/backend/main.py:46)
- ❌ Frontend: No `/api/health` endpoint (needs to be created)
- ✅ MCP Server: `GET /health` exists (phase-3/mcp-server/server.py:432)

**Action Required**: Create frontend health endpoint at `phase-2/frontend/pages/api/health.ts`

### Resource Limits (Local Minikube - 8GB RAM Machine)

**Backend (FastAPI)**:
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

**Frontend (Next.js)**:
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

**MCP Server (Flask)**:
```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "250m"
```

**Total Resources**: ~1.25GB RAM, ~1 CPU core (leaves plenty for Minikube system overhead)

### Probe Configuration

**Liveness Probe** (restart on failure):
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: <service-port>
  initialDelaySeconds: 15
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

**Readiness Probe** (remove from service if not ready):
```yaml
readinessProbe:
  httpGet:
    path: /health
    port: <service-port>
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

**Service-Specific Paths**:
- Backend: `/health` on port 8000
- Frontend: `/api/health` on port 3000
- MCP Server: `/health` on port 5000

---

## R3: Environment Variable Mapping

### Backend Environment Variables

| Variable | Type | Description | Default/Example |
|----------|------|-------------|-----------------|
| `DATABASE_URL` | **Secret** | PostgreSQL connection string (Neon) | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | **Secret** | JWT signing key | (random secret) |
| `JWT_ALGORITHM` | ConfigMap | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_HOURS` | ConfigMap | Token expiration time | `24` |
| `CORS_ORIGINS` | ConfigMap | Allowed CORS origins | `http://frontend-service:3000` |

**Total**: 2 Secrets, 3 ConfigMap

### Frontend Environment Variables

| Variable | Type | Description | Default/Example |
|----------|------|-------------|-----------------|
| `NEXT_PUBLIC_API_URL` | ConfigMap | Backend API URL | `http://backend-service:8000` |
| `NEXT_PUBLIC_MCP_SERVER_URL` | ConfigMap | MCP server URL | `http://mcp-service:5000` |

**Total**: 0 Secrets, 2 ConfigMap

**Note**: In Kubernetes, these will use service DNS names. For local development (Docker only), use `http://localhost:<port>`.

### MCP Server Environment Variables

| Variable | Type | Description | Default/Example |
|----------|------|-------------|-----------------|
| `BACKEND_URL` | ConfigMap | Backend API URL | `http://backend-service:8000` |
| `MCP_PORT` | ConfigMap | MCP server port | `5000` |
| `ANTHROPIC_API_KEY` | **Secret** | Anthropic API key (deprecated - using OpenRouter) | (not used) |
| `OPENROUTER_API_KEY` | **Secret** | OpenRouter API key | (actual key) |
| `LLM_MODEL` | ConfigMap | LLM model identifier | `openai/gpt-3.5-turbo` |

**Total**: 2 Secrets (only OPENROUTER_API_KEY used), 3 ConfigMap

**Note**: Phase 3 switched from Anthropic to OpenRouter. ANTHROPIC_API_KEY is deprecated but kept for backwards compatibility.

### ConfigMap vs Secret Summary

**ConfigMap** (non-sensitive, 8 total):
- Backend: JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_HOURS, CORS_ORIGINS
- Frontend: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_MCP_SERVER_URL
- MCP Server: BACKEND_URL, MCP_PORT, LLM_MODEL

**Secret** (sensitive, 3 total):
- Backend: DATABASE_URL, JWT_SECRET
- MCP Server: OPENROUTER_API_KEY

---

## R4: Service Networking Strategy

### Kubernetes Service DNS Names

**Pattern**: `<service-name>.<namespace>.svc.cluster.local`

**Short form** (same namespace): `<service-name>`

**Service Names**:
- Backend: `backend-service` (full: `backend-service.default.svc.cluster.local`)
- Frontend: `frontend-service` (full: `frontend-service.default.svc.cluster.local`)
- MCP Server: `mcp-service` (full: `mcp-service.default.svc.cluster.local`)

**Namespace**: `default` (for local Minikube simplicity)

### Port Mappings

| Service | Container Port | Service Port | Service Type | NodePort | External Access |
|---------|---------------|--------------|--------------|----------|-----------------|
| Backend | 8000 | 8000 | ClusterIP | N/A | Internal only |
| Frontend | 3000 | 3000 | NodePort | 30000 | Yes (via NodePort) |
| MCP Server | 5000 | 5000 | ClusterIP | N/A | Internal only |

**ClusterIP**: Internal-only service (no external access)
**NodePort**: Exposes service on each node's IP at a static port (30000-32767 range)

### Service-to-Service Communication

**Frontend → Backend**:
- URL: `http://backend-service:8000`
- From frontend pod, API calls route through Kubernetes service

**Frontend → MCP Server**:
- URL: `http://mcp-service:5000`
- From frontend pod, chat requests route through Kubernetes service

**Backend → Database**:
- URL: External Neon PostgreSQL (not in Kubernetes)
- Connection string from Secret (DATABASE_URL)
- Requires external connectivity from Minikube

### External Access

**User → Frontend**:
- Method 1 (NodePort): `http://<minikube-ip>:30000`
- Method 2 (Minikube service): `minikube service frontend-service --url`
- Method 3 (Port-forward): `kubectl port-forward svc/frontend-service 3000:3000`

**Recommendation**: Use fixed NodePort 30000 for predictability

### Network Diagram

```
User Browser
    ↓ HTTP (NodePort 30000)
Frontend Pod (Next.js) - Service: frontend-service:3000
    ↓ HTTP (backend-service:8000)
Backend Pod (FastAPI) - Service: backend-service:8000
    ↓ PostgreSQL (external)
Neon Database (External)

Frontend Pod
    ↓ HTTP (mcp-service:5000)
MCP Server Pod (Flask) - Service: mcp-service:5000
    ↓ HTTPS (api.openrouter.ai)
OpenRouter API (External)
```

### External Connectivity Verification

**From Minikube to External Services**:
- Neon Database: Outbound PostgreSQL (port 5432) must be allowed
- OpenRouter API: Outbound HTTPS (port 443) must be allowed

**Test**: Minikube has external internet access by default in most configurations

---

## Research Summary

**Completion Date**: 2026-01-01

**Key Findings**:
1. ✅ Docker base images selected: `python:3.11-slim`, `node:18-alpine`
2. ✅ Multi-stage build patterns documented for all 3 services
3. ✅ Health endpoints: Backend ✅ exists, Frontend ❌ needs creation, MCP ✅ exists
4. ✅ Resource limits calculated for 8GB RAM Minikube (total: ~1.25GB used)
5. ✅ Environment variables categorized: 8 ConfigMap, 3 Secrets
6. ✅ Service networking strategy: ClusterIP for backend/MCP, NodePort for frontend
7. ✅ DNS naming: `<service-name>` short form in same namespace

**Action Items for Implementation**:
- Create frontend health endpoint: `phase-2/frontend/pages/api/health.ts`
- Use fixed NodePort 30000 for frontend external access
- Use service DNS names (`backend-service`, `mcp-service`) in Kubernetes environment variables
- Verify Minikube external connectivity to Neon and OpenRouter

**Ready for**: Phase 1 (Setup) - Create phase-4/ directory structure
