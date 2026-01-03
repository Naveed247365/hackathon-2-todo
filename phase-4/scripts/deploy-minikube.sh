#!/bin/bash
# Deploy all services to Minikube
# Usage: ./deploy-minikube.sh

set -e  # Exit on error

echo "================================================"
echo "Deploying to Minikube"
echo "================================================"
echo

# Check if Minikube is running
if ! minikube status &> /dev/null; then
    echo "Error: Minikube is not running"
    echo "Start Minikube with: minikube start --cpus=4 --memory=6144"
    exit 1
fi

# Navigate to phase-4 directory
cd "$(dirname "$0")/.."

echo "Applying ConfigMap..."
kubectl apply -f kubernetes/configmap.yaml

echo
echo "Checking for secret.yaml..."
if [ -f "kubernetes/secret.yaml" ]; then
    echo "Applying Secret..."
    kubectl apply -f kubernetes/secret.yaml
else
    echo "Warning: kubernetes/secret.yaml not found"
    echo "Please create it from secret.yaml.example with actual credentials"
    echo "Deployment will fail without secrets"
fi

echo
echo "Deploying backend..."
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml

echo
echo "Deploying frontend..."
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml

echo
echo "Deploying MCP server..."
kubectl apply -f kubernetes/mcp-deployment.yaml
kubectl apply -f kubernetes/mcp-service.yaml

echo
echo "Waiting for pods to become ready (timeout: 120s)..."
kubectl wait --for=condition=ready pod -l app=backend --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=frontend --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=mcp-server --timeout=120s || true

echo
echo "================================================"
echo "Deployment complete!"
echo "================================================"
echo
kubectl get pods
echo
kubectl get services
