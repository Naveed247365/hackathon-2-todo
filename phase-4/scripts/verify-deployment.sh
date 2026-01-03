#!/bin/bash
# Verify Kubernetes deployment
# Usage: ./verify-deployment.sh

set -e  # Exit on error

echo "================================================"
echo "Verifying Kubernetes Deployment"
echo "================================================"
echo

# Check if Minikube is running
if ! minikube status &> /dev/null; then
    echo "Error: Minikube is not running"
    exit 1
fi

echo "Checking pod status..."
kubectl get pods
echo

echo "Checking service status..."
kubectl get services
echo

echo "Checking deployment status..."
kubectl get deployments
echo

echo "Testing health endpoints..."
echo

# Get pod names
BACKEND_POD=$(kubectl get pods -l app=backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
FRONTEND_POD=$(kubectl get pods -l app=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
MCP_POD=$(kubectl get pods -l app=mcp-server -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$BACKEND_POD" ]; then
    echo "Backend health check:"
    kubectl exec $BACKEND_POD -- curl -s http://localhost:8000/health || echo "Failed"
    echo
fi

if [ -n "$FRONTEND_POD" ]; then
    echo "Frontend health check:"
    kubectl exec $FRONTEND_POD -- wget -qO- http://localhost:3000/api/health || echo "Failed"
    echo
fi

if [ -n "$MCP_POD" ]; then
    echo "MCP Server health check:"
    kubectl exec $MCP_POD -- curl -s http://localhost:5000/health || echo "Failed"
    echo
fi

echo "Frontend access URL:"
minikube service frontend-service --url || echo "Service not available"
echo

echo "================================================"
echo "Verification complete!"
echo "================================================"
