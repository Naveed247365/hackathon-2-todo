# Test Phase 3 Setup
# Run this after starting all services

Write-Host "🔍 Testing Phase 3 AI Todo Chatbot Setup..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend
Write-Host "1. Testing Backend (port 8000)..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ RUNNING" -ForegroundColor Green
    }
} catch {
    Write-Host " ❌ NOT RUNNING" -ForegroundColor Red
    Write-Host "   Start with: cd 'E:\hackathon 2\todos\phase-2\backend'; python main.py" -ForegroundColor Yellow
}

# Test 2: MCP Server
Write-Host "2. Testing MCP Server (port 5000)..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ RUNNING" -ForegroundColor Green
    }
} catch {
    Write-Host " ❌ NOT RUNNING" -ForegroundColor Red
    Write-Host "   Start with: cd 'E:\hackathon 2\todos\phase-3\mcp-server'; python server.py" -ForegroundColor Yellow
}

# Test 3: Frontend
Write-Host "3. Testing Frontend (port 3000)..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ RUNNING" -ForegroundColor Green
    }
} catch {
    Write-Host " ❌ NOT RUNNING" -ForegroundColor Red
    Write-Host "   Start with: cd 'E:\hackathon 2\todos\phase-2\frontend'; npm run dev" -ForegroundColor Yellow
}

# Test 4: MCP Chat Endpoint
Write-Host "4. Testing AI Chat Endpoint..." -NoNewline
try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer test-token"
    }
    $body = '{"message": "hello"}'
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/chat" -Method POST -Headers $headers -Body $body -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ WORKING" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   AI Response: $($content.response)" -ForegroundColor Gray
    }
} catch {
    Write-Host " ❌ FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  - Backend: http://localhost:8000"
Write-Host "  - MCP Server: http://localhost:5000"
Write-Host "  - Frontend: http://localhost:3000"
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Ensure all services are running (see above)"
Write-Host "  2. Open browser: http://localhost:3000"
Write-Host "  3. Login to the app"
Write-Host "  4. Click 'AI Todo Assistant' button"
Write-Host "  5. Type: add buy groceries"
Write-Host ""
