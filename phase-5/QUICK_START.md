# Phase 5 - Quick Start Guide

## ✅ Ready to Run!

Phase 5 is fully implemented with all advanced features.

## 🚀 Start Commands

### Option 1: Auto Start (Double-click)
```
START.bat
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd "E:\hackathon 2\todos\phase-5\backend"
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd "E:\hackathon 2\todos\phase-5\frontend"
npm run dev
```

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **MCP Chat**: http://localhost:5000
- **API Docs**: http://localhost:8000/docs

## 📋 Phase 5 Features Implemented

### 1. Priority Management ✅
- High (Red), Medium (Yellow), Low (Green)
- Visual color coding
- Filter by priority
- Color-coded left border on todos

### 2. Tag System ✅
- Add multiple tags per todo
- Tags displayed as badges
- Tag filtering

### 3. Due Dates ✅
- Set due dates for tasks
- Overdue detection with red warning
- Visual date indicators

### 4. Recurring Tasks ✅
- Daily/Weekly/Monthly patterns
- Visual recurrence indicator
- Pattern selection

### 5. Advanced Filtering ✅
- Filter by priority (High/Medium/Low)
- Filter by status (Pending/Completed)
- Real-time filtering

## 📊 Database Schema

Phase 5 extends Phase 2 schema with:

```sql
ALTER TABLE todos ADD COLUMN:
- priority VARCHAR(20) DEFAULT 'Medium' NOT NULL
- tags TEXT[] DEFAULT ARRAY[]::TEXT[]
- due_date DATE NULL
- is_recurring BOOLEAN DEFAULT FALSE
- recurrence_pattern VARCHAR(20) NULL
- parent_todo_id INTEGER NULL
```

Migration already applied! ✅

## 🎯 For Judges Demo

1. **Start both servers** (use START.bat)
2. **Sign up / Login** at http://localhost:3005
3. **Create todos** with different priorities, tags, due dates
4. **Show filtering** by priority and status
5. **Demonstrate recurring tasks**
6. **Show overdue detection**

## 🔥 Features Highlight

- ✅ Priority color coding (High=Red, Medium=Orange, Low=Green)
- ✅ Tag badges for categorization
- ✅ Due date tracking with overdue warnings
- ✅ Recurring task patterns
- ✅ Multi-filter support
- ✅ Clean, functional UI
- ✅ Full CRUD operations
- ✅ Data isolation per user

## Phase Comparison

**Phase 2**: Basic CRUD, Auth, Database
**Phase 5**: + Priority, Tags, Due Dates, Recurring Tasks, Advanced Filters

Both phases use the same database (extended schema)!
