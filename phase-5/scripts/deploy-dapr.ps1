# Phase 5 - Dapr Deployment Script for Windows
# Deploys the event-driven architecture with Dapr on Minikube

$ErrorActionPreference = "Stop"

Write-Host "=== Phase 5: Event-Driven Cloud Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
function Check-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    if (-not (Get-Command minikube -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: minikube not found. Please install minikube first." -ForegroundColor Red
        exit 1
    }
    
    if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: kubectl not found. Please install kubectl first." -ForegroundColor Red
        exit 1
    }
    
    $hasDapr = Get-Command dapr -ErrorAction SilentlyContinue
    if (-not $hasDapr) {
        Write-Host "WARNING: dapr CLI not found. Install with: winget install Dapr.CLI" -ForegroundColor Yellow
    }
    
    Write-Host "Prerequisites check passed!" -ForegroundColor Green
}

# Start Minikube
function Start-Minikube {
    Write-Host ""
    Write-Host "Starting Minikube..." -ForegroundColor Yellow
    
    $status = minikube status 2>$null
    if ($status -match "Running") {
        Write-Host "Minikube is already running" -ForegroundColor Green
    } else {
        minikube start --memory=4096 --cpus=2
    }
    
    # Configure Docker to use Minikube's daemon
    & minikube -p minikube docker-env --shell powershell | Invoke-Expression
    Write-Host "Minikube started and Docker configured" -ForegroundColor Green
}

# Install Dapr
function Install-Dapr {
    Write-Host ""
    Write-Host "Installing Dapr on Kubernetes..." -ForegroundColor Yellow
    
    if (Get-Command dapr -ErrorAction SilentlyContinue) {
        dapr init -k --wait
        Write-Host "Dapr installed successfully" -ForegroundColor Green
    } else {
        Write-Host "Skipping Dapr installation (CLI not found)" -ForegroundColor Yellow
    }
}

# Build images
function Build-Images {
    Write-Host ""
    Write-Host "Building Docker images..." -ForegroundColor Yellow
    
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $Phase5Dir = Split-Path -Parent $ScriptDir
    $ProjectRoot = Split-Path -Parent $Phase5Dir
    
    Write-Host "Building backend image..."
    docker build -t todo-backend:v5.0.0 -f "$Phase5Dir\event-processor\Dockerfile" "$Phase5Dir\backend"
    
    Write-Host "Building event-processor image..."
    docker build -t todo-event-processor:v5.0.0 -f "$Phase5Dir\event-processor\Dockerfile" "$Phase5Dir\event-processor"
    
    Write-Host "All images built successfully" -ForegroundColor Green
}

# Deploy Dapr components
function Deploy-DaprComponents {
    Write-Host ""
    Write-Host "Deploying Dapr components..." -ForegroundColor Yellow
    
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $Phase5Dir = Split-Path -Parent $ScriptDir
    
    kubectl apply -f "$Phase5Dir\dapr\components\"
    Write-Host "Dapr components deployed" -ForegroundColor Green
}

# Deploy K8s resources
function Deploy-K8s {
    Write-Host ""
    Write-Host "Deploying Kubernetes resources..." -ForegroundColor Yellow
    
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $Phase5Dir = Split-Path -Parent $ScriptDir
    
    # Deploy Redis
    kubectl apply -f "$Phase5Dir\kubernetes\redis-deployment.yaml"
    kubectl wait --for=condition=ready pod -l app=redis --timeout=60s
    
    # Deploy configs
    kubectl apply -f "$Phase5Dir\kubernetes\configmap.yaml"
    
    if (Test-Path "$Phase5Dir\kubernetes\secret.yaml") {
        kubectl apply -f "$Phase5Dir\kubernetes\secret.yaml"
    }
    
    # Deploy apps
    kubectl apply -f "$Phase5Dir\kubernetes\backend-deployment.yaml"
    kubectl apply -f "$Phase5Dir\kubernetes\frontend-deployment.yaml"
    kubectl apply -f "$Phase5Dir\kubernetes\mcp-deployment.yaml"
    kubectl apply -f "$Phase5Dir\kubernetes\event-processor-deployment.yaml"
    
    Write-Host "All Kubernetes resources deployed" -ForegroundColor Green
}

# Show status
function Show-Status {
    Write-Host ""
    Write-Host "=== Deployment Status ===" -ForegroundColor Cyan
    
    kubectl get pods
    Write-Host ""
    kubectl get services
    
    $minikubeIp = minikube ip
    Write-Host ""
    Write-Host "=== Access URLs ===" -ForegroundColor Cyan
    Write-Host "Backend API:  http://${minikubeIp}:30001"
    Write-Host "Frontend:     http://${minikubeIp}:30002"
    Write-Host "MCP Server:   http://${minikubeIp}:30003"
}

# Main
Check-Prerequisites
Start-Minikube
Install-Dapr
Deploy-DaprComponents
Deploy-K8s
Show-Status

Write-Host ""
Write-Host "=== Phase 5 Deployment Complete! ===" -ForegroundColor Green
