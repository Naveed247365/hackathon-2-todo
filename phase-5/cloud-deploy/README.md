# Cloud Deployment Guide for Todo App

This directory contains deployment configurations for various cloud platforms.

## Supported Platforms

| Platform | Type | Cost | Best For |
|----------|------|------|----------|
| Render.com | PaaS | Free tier | Quick demos |
| Railway | PaaS | Free tier | Development |
| Oracle OKE | Kubernetes | Free tier | Production |
| Vercel + Railway | Hybrid | Free | Frontend + API |

---

## Option 1: Render.com (Easiest)

### Steps:
1. Fork/push repo to GitHub
2. Create Render account at https://render.com
3. Click "New" → "Blueprint"
4. Connect GitHub repo
5. Select `phase-5/cloud-deploy/render.yaml`
6. Click "Apply"

### Services Created:
- Backend API (Python)
- Frontend (Node.js)
- MCP Server (Python)
- Event Processor (Worker)
- PostgreSQL Database
- Redis

### Environment Variables:
Set these in Render dashboard:
- `OPENROUTER_API_KEY`: Your OpenRouter API key

---

## Option 2: Railway

### Steps:
1. Create Railway account at https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Connect repo and select branch
4. Add services manually or use `railway.json`

### Add Plugins:
- PostgreSQL (from Railway templates)
- Redis (from Railway templates)

### Link Variables:
```bash
railway link
railway variables set DATABASE_URL=${{Postgres.DATABASE_URL}}
railway variables set REDIS_URL=${{Redis.REDIS_URL}}
```

---

## Option 3: Oracle Cloud OKE (Free Kubernetes)

### Prerequisites:
- Oracle Cloud account (Always Free tier)
- OCI CLI configured
- kubectl configured

### Setup Steps:

#### 1. Create OKE Cluster (Free)
```bash
# Create cluster via OCI Console
# Choose "Quick Create" with Always Free shape
```

#### 2. Configure kubectl
```bash
oci ce cluster create-kubeconfig --cluster-id <cluster-id> --file $HOME/.kube/config
```

#### 3. Create Container Registry Secret
```bash
kubectl create secret docker-registry ocir-secret \
  --docker-server=${REGION}.ocir.io \
  --docker-username=${TENANCY_NAMESPACE}/oracleidentitycloudservice/${EMAIL} \
  --docker-password=${AUTH_TOKEN} \
  -n todo-app
```

#### 4. Build and Push Images
```bash
# Login to OCIR
docker login ${REGION}.ocir.io

# Build and push
docker build -t ${REGION}.ocir.io/${NAMESPACE}/todo-backend:v5.0.0 ./phase-5/backend
docker push ${REGION}.ocir.io/${NAMESPACE}/todo-backend:v5.0.0

# Repeat for frontend, mcp, event-processor
```

#### 5. Deploy to OKE
```bash
cd phase-5/cloud-deploy/oracle-oke

# Create namespace
kubectl apply -f namespace.yaml

# Deploy configs
kubectl apply -f configmap.yaml
kubectl create secret generic todo-secrets \
  --from-literal=JWT_SECRET_KEY=your-secret \
  --from-literal=DATABASE_URL=postgresql://... \
  -n todo-app

# Deploy applications
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f event-processor-deployment.yaml

# Deploy ingress
kubectl apply -f ingress.yaml
```

#### 6. Install Dapr on OKE
```bash
dapr init -k --wait
kubectl apply -f ../dapr/components/ -n todo-app
```

---

## Option 4: Vercel (Frontend Only)

Best for deploying just the frontend.

### Steps:
1. Go to https://vercel.com
2. Import GitHub repo
3. Set root directory to `phase-5/frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
   - `NEXT_PUBLIC_MCP_SERVER_URL`: Your MCP URL
5. Deploy

### Backend Options:
- Deploy backend to Render/Railway
- Use Vercel Serverless Functions (requires code changes)

---

## Quick Comparison

### For Hackathon Demo:
**Recommended: Render.com**
- One-click deployment
- All services included
- Free tier sufficient

### For Production:
**Recommended: Oracle OKE**
- Free Kubernetes forever
- Full control
- Dapr support

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| JWT_SECRET_KEY | JWT signing key | Yes |
| OPENROUTER_API_KEY | OpenRouter API key | For MCP |
| CORS_ORIGINS | Allowed origins | Yes |
| NEXT_PUBLIC_API_URL | Backend API URL | Frontend |
| NEXT_PUBLIC_MCP_SERVER_URL | MCP server URL | Frontend |

---

## Troubleshooting

### Render: Build fails
- Check build logs
- Ensure requirements.txt/package.json exists
- Verify root directory setting

### Railway: Connection refused
- Check service is running
- Verify environment variables linked
- Check exposed ports

### OKE: Pods not starting
- Check image pull secrets
- Verify OCIR image exists
- Check resource limits

---

## Cost Summary

| Platform | Free Tier Limits |
|----------|------------------|
| Render | 750 hours/month, spins down after 15min |
| Railway | $5 credit/month |
| Oracle OKE | Always Free (1 node cluster) |
| Vercel | 100GB bandwidth, unlimited deploys |

For hackathon: All platforms offer sufficient free tier.
