#!/bin/bash
# Remove all Kubernetes resources
# Usage: ./teardown.sh

set -e  # Exit on error

echo "================================================"
echo "Removing Kubernetes Resources"
echo "================================================"
echo

# Navigate to phase-4 directory
cd "$(dirname "$0")/.."

echo "Deleting deployments..."
kubectl delete -f kubernetes/backend-deployment.yaml --ignore-not-found=true
kubectl delete -f kubernetes/frontend-deployment.yaml --ignore-not-found=true
kubectl delete -f kubernetes/mcp-deployment.yaml --ignore-not-found=true

echo
echo "Deleting services..."
kubectl delete -f kubernetes/backend-service.yaml --ignore-not-found=true
kubectl delete -f kubernetes/frontend-service.yaml --ignore-not-found=true
kubectl delete -f kubernetes/mcp-service.yaml --ignore-not-found=true

echo
echo "Deleting ConfigMap..."
kubectl delete -f kubernetes/configmap.yaml --ignore-not-found=true

echo
echo "Deleting Secret (if exists)..."
kubectl delete secret todo-secrets --ignore-not-found=true

echo
echo "================================================"
echo "All resources removed!"
echo "================================================"
echo
kubectl get pods
