# 🚀 Todo App - Complete Startup Guide

**Welcome to your fully-featured Todo Application!**

This guide will get you up and running in **5 minutes**.

---

## ✅ What You Have

A complete, production-ready todo application with:
- ✅ **5 Phases Complete**: Console App → Web App → AI Chatbot → Kubernetes → Advanced Features
- ✅ **30+ Features**: Priority management, tags, due dates, recurring tasks, AI chat, event sourcing
- ✅ **Full Stack**: FastAPI (Python) backend + Next.js (React/TypeScript) frontend
- ✅ **Database**: PostgreSQL (Neon cloud) with all migrations applied
- ✅ **Beautiful UI**: Modern, responsive interface with visual indicators

---

## 🏁 Quick Start (5 Minutes)

### Step 1: Start the Backend (2 minutes)

```powershell
# Navigate to backend
cd "E:\hackathon 2\todos\phase-5\backend"

# Activate Python virtual environment
.\venv\Scripts\Activate.ps1

# Start FastAPI server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**✅ Backend Ready!**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

**Keep this terminal open** and continue to Step 2.

---

### Step 2: Start the Frontend (2 minutes)

Open a **NEW PowerShell terminal**:

```powershell
# Navigate to frontend
cd "E:\hackathon 2\todos\phase-2\frontend"

# Start Next.js (dependencies already installed)
npm run dev
```

**✅ Frontend Ready!**
- App: http://localhost:3000

**Keep this terminal open** too.

---

### Step 3: Use the App! (1 minute)

1. **Open browser**: http://localhost:3000
2. **Sign up**: Create account (any email + 8+ char password)
3. **Create a todo** with:
   - Title: "Test all Phase 5 features"
   - Priority: **High**
   - Tags: **test, phase5**
   - Due Date: **Tomorrow**
   - Recurring: Check **Weekly**
4. **See the magic**:
   - 🔴 Red "High" badge
   - Gray "#test" and "#phase5" tags
   - Blue due date with 📅 icon
   - Blue recurring icon ↻

---

## 🎯 Features to Test

### Basic Features (Phase 1-2)
- ✅ Sign up / Login
- ✅ Create todo
- ✅ Complete todo
- ✅ Edit todo
- ✅ Delete todo
- ✅ View all todos

### Advanced Features (Phase 5)
- ✅ **Priority**: Set High/Medium/Low priority
- ✅ **Tags**: Add multiple tags (e.g., #work, #urgent)
- ✅ **Due Dates**: Set deadlines
- ✅ **Overdue Indicators**: Red border for late todos
- ✅ **Recurring Tasks**: Auto-create next occurrence on completion
- ✅ **Filter**: By priority or status
- ✅ **Sort**: By priority or date

### AI Features (Phase 3)
- ✅ **AI Chatbot**: Scroll down to chat panel
- ✅ Natural language: "add buy groceries"
- ✅ AI commands: "list my todos", "complete [task]"

---

## 📱 User Interface Guide

### Create Form
<details>
<summary>Click to see what each field does</summary>

- **Title**: Todo description (required)
- **Priority**: High (red) / Medium (yellow) / Low (green)
- **Due Date**: Optional deadline
- **Tags**: Comma-separated labels (auto-adds #)
- **Recurring**: Check to repeat Daily/Weekly/Monthly

</details>

### Todo Display
<details>
<summary>Click to see visual indicators</summary>

- **🔴 Red badge**: High priority
- **🟡 Yellow badge**: Medium priority
- **🟢 Green badge**: Low priority
- **Gray badges**: Tags
- **Blue 📅 badge**: Due date
- **Red border + ⚠**: Overdue!
- **Blue ↻ icon**: Recurring task
- **✓ button**: Mark complete
- **✎ button**: Edit title
- **✕ button**: Delete todo

</details>

### Filter Panel
<details>
<summary>Click to see filter options</summary>

- **Filter by Priority**: Show only High/Medium/Low
- **Filter by Status**: Show only Pending/Completed
- **Sort by**: Priority (High→Low) or Created Date (newest first)
- **Clear button**: Reset all filters

</details>

---

## 🧪 Testing Checklist

Copy this checklist to test all features:

```markdown
## Phase 5 Features Test
- [ ] Create todo with High priority → Red badge appears
- [ ] Create todo with tags → Gray tag badges appear
- [ ] Create todo with due date tomorrow → Blue date badge appears
- [ ] Create overdue todo (yesterday) → Red border appears
- [ ] Create weekly recurring todo → Blue ↻ icon appears
- [ ] Complete recurring todo → New todo created for next week
- [ ] Filter by "High" priority → Only high-priority todos show
- [ ] Filter by "Pending" status → Only pending todos show
- [ ] Sort by priority → Todos ordered High → Medium → Low
- [ ] Edit todo → Title updates correctly
- [ ] Delete todo → Todo removed from list

## AI Chatbot Test (Phase 3)
- [ ] Type "add buy groceries" → Todo created
- [ ] Type "list my todos" → All todos displayed
- [ ] Type "complete [todo]" → Todo marked complete

## Basic Features Test
- [ ] Sign up with new email → Account created
- [ ] Login with credentials → Logged in successfully
- [ ] Logout → Redirected to login page
```

---

## 🔧 Troubleshooting

### Backend Won't Start

**Problem**: `ModuleNotFoundError` or `command not found`

**Solution**:
```powershell
# Make sure venv is activated
cd "E:\hackathon 2\todos\phase-5\backend"
.\venv\Scripts\Activate.ps1

# Verify Python
python --version  # Should show Python 3.14

# Reinstall dependencies if needed
pip install -r requirements.txt
```

---

### Frontend Won't Start

**Problem**: `npm: command not found` or port in use

**Solution**:
```powershell
# Verify Node.js
node --version  # Should show v18+
npm --version   # Should show v9+

# If port 3000 in use, kill process or use different port:
npm run dev -- -p 3001
```

---

### Database Connection Error

**Problem**: `connection refused` or `authentication failed`

**Solution**:
- Database is cloud-hosted (Neon) - requires internet
- Check `.env` file exists in backend directory
- Verify DATABASE_URL in `.env` is correct

---

### Can't See Phase 5 Features

**Problem**: No priority badges, tags, or due dates showing

**Solution**:
1. **Check backend running**: http://localhost:8000/docs
2. **Use Phase 5 API**: Create form should have Priority/Tags/Due Date fields
3. **Clear browser cache**: Ctrl+Shift+R to hard refresh
4. **Check browser console**: F12 → Console tab for errors

---

## 📊 API Documentation

### Phase 5 Endpoints

Access full API docs at: http://localhost:8000/docs

**Quick Reference**:

```bash
# Create todo with Phase 5 fields
POST /api/v5/todos
{
  "title": "Important task",
  "priority": "High",
  "tags": ["#work", "#urgent"],
  "due_date": "2026-01-10",
  "is_recurring": true,
  "recurrence_pattern": "Weekly"
}

# List todos with filters
GET /api/v5/todos?priority=High&status=pending&sort_by=priority

# Complete todo
PATCH /api/v5/todos/{id}/complete

# Update todo
PATCH /api/v5/todos/{id}
{
  "title": "Updated title"
}

# Delete todo
DELETE /api/v5/todos/{id}
```

---

## 🎨 UI Screenshots

### Create Form
Your create form now includes:
- Title input
- Priority dropdown (High/Medium/Low)
- Tags input (comma-separated)
- Due date picker (calendar)
- Recurring checkbox + pattern selector

### Todo List
Each todo displays:
- Title (strikethrough if completed)
- Priority badge (colored)
- Tags (gray badges)
- Due date (blue badge, red if overdue)
- Recurring icon (blue ↻)
- Action buttons (✓ ✎ ✕)

### Filter Panel
Clean 3-column layout:
- Priority filter dropdown
- Status filter dropdown
- Sort selector
- Clear button

---

## 🚀 Advanced Usage

### Using AI Chatbot

Scroll to bottom of todos page to find chat panel.

**Supported commands**:
- `add [task]` - Create todo
- `list todos` - Show all todos
- `complete [task]` - Mark done
- `update [old] to [new]` - Edit title
- `delete [task]` - Remove todo

### Testing with cURL

```bash
# Get JWT token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Use token (replace YOUR_TOKEN)
curl -X GET "http://localhost:8000/api/v5/todos?priority=High" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Viewing Database

Backend test script included:

```powershell
cd "E:\hackathon 2\todos\phase-5\backend"
.\venv\Scripts\Activate.ps1
python check_enum.py  # Verify database enums
```

---

## 📁 Project Structure

```
E:\hackathon 2\todos\
│
├── phase-1/              # Console app
├── phase-2/              # Web app
│   ├── backend/          # FastAPI (original)
│   └── frontend/         # Next.js (Phase 5 UI ✅)
│
├── phase-3/              # AI chatbot (MCP server)
├── phase-4/              # Kubernetes configs
├── phase-5/              # Event-driven + Advanced features
│   ├── backend/          # FastAPI with Phase 5 API ✅
│   ├── FINAL_STATUS.md   # Backend completion report
│   └── PHASE5_COMPLETE_SUMMARY.md  # Full summary
│
└── START_HERE.md         # This file
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Backend responds at http://localhost:8000/docs
2. ✅ Frontend loads at http://localhost:3000
3. ✅ You can sign up and login
4. ✅ Create form has Priority/Tags/Due Date fields
5. ✅ Created todos show colored priority badges
6. ✅ Tags appear as gray badges
7. ✅ Due dates show with 📅 icon
8. ✅ Filter/sort controls work
9. ✅ AI chatbot responds to commands

---

## 🎯 What's Next?

After testing locally, you can:

1. **Deploy to cloud** using Phase 4 Kubernetes configs
2. **Set up Kafka** for real-time event streaming (optional)
3. **Add more features** (your ideas!)
4. **Create demo video** for presentation

---

## 📞 Quick Command Reference

**Start everything**:
```powershell
# Terminal 1: Backend
cd "E:\hackathon 2\todos\phase-5\backend"
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload

# Terminal 2: Frontend
cd "E:\hackathon 2\todos\phase-2\frontend"
npm run dev
```

**Stop everything**:
- Press `Ctrl+C` in each terminal

**Restart after changes**:
- Backend auto-reloads (--reload flag)
- Frontend auto-reloads (dev mode)
- Just save files and refresh browser!

---

## 🎉 You're Ready!

**Your complete todo application is ready to use!**

Open http://localhost:3000 and start managing your tasks with:
- Priority levels
- Tags
- Due dates
- Recurring tasks
- AI chatbot
- And more!

**Enjoy your hackathon project! 🚀**
