# Quick Start Guide - Phase 2

## Problem: CORS Error?

The CORS error means the **backend is not running**. Follow these steps:

---

## Step-by-Step Startup

### Step 1: Start Backend Server (Required First!)

Open a **new terminal** and run:

```bash
cd phase-2/backend
python -m uvicorn main:app --reload --port 8000
```

**Expected output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Keep this terminal open!** The backend must keep running.

Verify backend is running by visiting:
- http://localhost:8000 (should show API message)
- http://localhost:8000/docs (Swagger API documentation)

---

### Step 2: Start Frontend Server

In a **different terminal**, run:

```bash
cd phase-2/frontend
npm install   # Only needed first time
npm run dev
```

**Expected output**:
```
- ready started server on 0.0.0.0:3000
```

---

### Step 3: Test the Application

Visit http://localhost:3000

You should see:
1. Automatic redirect to /login page
2. Click "Sign up" link
3. Create account with email and password
4. Get redirected to /todos page
5. Create, complete, edit, delete todos!

---

## Troubleshooting

### "CORS policy" error
**Problem**: Backend not running
**Solution**: Start backend first (Step 1 above)

### "Connection refused" or "Failed to fetch"
**Problem**: Backend not running or wrong port
**Solution**:
- Check backend is running on port 8000
- Check terminal for backend errors

### Frontend shows blank page
**Problem**: npm install not run
**Solution**: Run `cd phase-2/frontend && npm install`

### "JWT_SECRET not set" error
**Problem**: .env file missing or JWT_SECRET not configured
**Solution**: Your .env is already configured, this shouldn't happen

---

## Quick Test Commands

### Test Backend (while backend is running):

```bash
# Test signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"

# Test health check
curl http://localhost:8000/health
```

---

## Current Status

✅ Database: Neon PostgreSQL configured and tables created
✅ Backend: Code complete, ready to run
✅ Frontend: Code complete, ready to run
⚠️ **Action Required**: Start both servers (see Step 1 and Step 2 above)

---

**Once both servers are running, the CORS error will disappear and the app will work!**
