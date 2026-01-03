#!/bin/bash
# Build all Docker images for Phase 4
# Usage: ./build-images.sh

set -e  # Exit on error

echo "================================================"
echo "Building Docker Images for Phase 4"
echo "================================================"
echo

# Navigate to repository root (parent of phase-4)
cd "$(dirname "$0")/../.."

# Use Minikube Docker environment (if Minikube is running)
if command -v minikube &> /dev/null && minikube status &> /dev/null; then
    echo "Using Minikube Docker environment..."
    eval $(minikube docker-env)
fi

echo "Building backend image..."
docker build \
    -t todo-backend:v1.0.0 \
    -f phase-4/docker/backend/Dockerfile \
    .

echo
echo "Building frontend image..."
docker build \
    -t todo-frontend:v1.0.0 \
    -f phase-4/docker/frontend/Dockerfile \
    .

echo
echo "Building MCP server image..."
docker build \
    -t todo-mcp-server:v1.0.0 \
    -f phase-4/docker/mcp-server/Dockerfile \
    .

echo
echo "================================================"
echo "All images built successfully!"
echo "================================================"
echo
docker images | grep todo-
