@echo off
echo ========================================
echo   Phase 5 - Quick Start
echo ========================================
echo.
echo Starting Backend on Port 8000...
echo.
cd "%~dp0backend"
start cmd /k "uvicorn main:app --reload --port 8000"
echo.
echo Starting Frontend on Port 3005...
echo.
cd "%~dp0frontend"
start cmd /k "npm run dev"
echo.
echo ========================================
echo   Phase 5 Started!
echo ========================================
echo.
echo Backend: http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo MCP: http://localhost:5000
echo.
echo Press any key to exit...
pause >nul
