#!/bin/bash
# Phase 5 - Dapr Deployment Script
# Deploys the event-driven architecture with Dapr on Minikube

set -e

echo "=== Phase 5: Event-Driven Cloud Deployment ==="
echo ""

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    if ! command -v minikube &> /dev/null; then
        echo "ERROR: minikube not found. Please install minikube first."
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        echo "ERROR: kubectl not found. Please install kubectl first."
        exit 1
    fi
    
    if ! command -v dapr &> /dev/null; then
        echo "WARNING: dapr CLI not found. Install with: winget install Dapr.CLI"
        echo "Continuing without dapr CLI..."
    fi
    
    echo "Prerequisites check passed!"
}

# Start Minikube if not running
start_minikube() {
    echo ""
    echo "Starting Minikube..."
    
    if minikube status | grep -q "Running"; then
        echo "Minikube is already running"
    else
        minikube start --memory=4096 --cpus=2
    fi
    
    # Use Minikube Docker daemon
    eval $(minikube docker-env)
    echo "Minikube started and Docker configured"
}

# Install Dapr on Kubernetes
install_dapr() {
    echo ""
    echo "Installing Dapr on Kubernetes..."
    
    if command -v dapr &> /dev/null; then
        dapr init -k --wait
        echo "Dapr installed successfully"
    else
        echo "Skipping Dapr installation (CLI not found)"
        echo "To install manually: dapr init -k"
    fi
}

# Build Docker images
build_images() {
    echo ""
    echo "Building Docker images..."
    
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    PHASE5_DIR="$(dirname "$SCRIPT_DIR")"
    PROJECT_ROOT="$(dirname "$PHASE5_DIR")"
    
    echo "Building backend image..."
    docker build -t todo-backend:v5.0.0 -f "$PHASE5_DIR/backend/Dockerfile" "$PHASE5_DIR/backend" 2>/dev/null || \
    docker build -t todo-backend:v5.0.0 -f "$PROJECT_ROOT/phase-4/docker/backend/Dockerfile" "$PHASE5_DIR/backend"
    
    echo "Building frontend image..."
    docker build -t todo-frontend:v5.0.0 -f "$PHASE5_DIR/frontend/Dockerfile" "$PHASE5_DIR/frontend" 2>/dev/null || \
    docker build -t todo-frontend:v5.0.0 -f "$PROJECT_ROOT/phase-4/docker/frontend/Dockerfile" "$PHASE5_DIR/frontend"
    
    echo "Building event-processor image..."
    docker build -t todo-event-processor:v5.0.0 -f "$PHASE5_DIR/event-processor/Dockerfile" "$PHASE5_DIR/event-processor"
    
    echo "Building mcp image..."
    docker build -t todo-mcp:v5.0.0 -f "$PHASE5_DIR/mcp-server/Dockerfile" "$PHASE5_DIR/mcp-server" 2>/dev/null || \
    docker build -t todo-mcp:v5.0.0 -f "$PROJECT_ROOT/phase-4/docker/mcp-server/Dockerfile" "$PHASE5_DIR/mcp-server"
    
    echo "All images built successfully"
}

# Deploy Dapr components
deploy_dapr_components() {
    echo ""
    echo "Deploying Dapr components..."
    
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    PHASE5_DIR="$(dirname "$SCRIPT_DIR")"
    
    kubectl apply -f "$PHASE5_DIR/dapr/components/"
    echo "Dapr components deployed"
}

# Deploy Kubernetes resources
deploy_k8s() {
    echo ""
    echo "Deploying Kubernetes resources..."
    
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    PHASE5_DIR="$(dirname "$SCRIPT_DIR")"
    
    # Deploy Redis first (for Dapr state/pubsub)
    kubectl apply -f "$PHASE5_DIR/kubernetes/redis-deployment.yaml"
    
    # Wait for Redis
    kubectl wait --for=condition=ready pod -l app=redis --timeout=60s
    
    # Deploy ConfigMap and Secrets
    kubectl apply -f "$PHASE5_DIR/kubernetes/configmap.yaml"
    
    if [ -f "$PHASE5_DIR/kubernetes/secret.yaml" ]; then
        kubectl apply -f "$PHASE5_DIR/kubernetes/secret.yaml"
    else
        echo "WARNING: secret.yaml not found. Copy secret.yaml.example to secret.yaml"
    fi
    
    # Deploy applications
    kubectl apply -f "$PHASE5_DIR/kubernetes/backend-deployment.yaml"
    kubectl apply -f "$PHASE5_DIR/kubernetes/frontend-deployment.yaml"
    kubectl apply -f "$PHASE5_DIR/kubernetes/mcp-deployment.yaml"
    kubectl apply -f "$PHASE5_DIR/kubernetes/event-processor-deployment.yaml"
    
    echo "All Kubernetes resources deployed"
}

# Wait for pods
wait_for_pods() {
    echo ""
    echo "Waiting for pods to be ready..."
    
    kubectl wait --for=condition=ready pod -l app=todo-backend --timeout=120s
    kubectl wait --for=condition=ready pod -l app=todo-frontend --timeout=120s
    kubectl wait --for=condition=ready pod -l app=todo-event-processor --timeout=120s
    
    echo "All pods are ready!"
}

# Show status
show_status() {
    echo ""
    echo "=== Deployment Status ==="
    echo ""
    
    kubectl get pods
    echo ""
    kubectl get services
    echo ""
    
    echo "=== Access URLs ==="
    MINIKUBE_IP=$(minikube ip)
    echo "Backend API:  http://$MINIKUBE_IP:30001"
    echo "Frontend:     http://$MINIKUBE_IP:30002"
    echo "MCP Server:   http://$MINIKUBE_IP:30003"
    echo "API Docs:     http://$MINIKUBE_IP:30001/docs"
    echo ""
    echo "Or use port-forward:"
    echo "  kubectl port-forward svc/todo-backend-svc 8000:8000"
    echo "  kubectl port-forward svc/todo-frontend-svc 3000:3000"
}

# Main execution
main() {
    check_prerequisites
    start_minikube
    install_dapr
    build_images
    deploy_dapr_components
    deploy_k8s
    wait_for_pods
    show_status
    
    echo ""
    echo "=== Phase 5 Deployment Complete! ==="
}

main "$@"
