# Phase 5 - Advanced Todo Features

**Version**: 5.0.0
**Status**: Ready to Run

## Features

### ✅ Phase 5 Advanced Features

1. **Priority Management** (High/Medium/Low)
   - Color-coded priorities
   - Filter by priority
   - Sort by priority

2. **Tag System** (#work, #personal, #urgent)
   - Multiple tags per todo
   - Tag-based filtering
   - Tag badges

3. **Due Dates**
   - Set deadlines
   - Overdue detection
   - Visual date indicators

4. **Recurring Tasks**
   - Daily/Weekly/Monthly patterns
   - Auto-create next occurrence
   - Parent-child tracking

5. **Advanced Filtering**
   - Filter by priority
   - Filter by tags
   - Filter by status
   - Sort options

## Quick Start

### Backend (Port 8000)

```bash
cd "E:\hackathon 2\todos\phase-5\backend"

# Run migration (first time only)
python migrate_phase5.py

# Start server
uvicorn main:app --reload --port 8000
```

**API Docs**: http://localhost:8000/docs

### Frontend (Port 3000)

```bash
cd "E:\hackathon 2\todos\phase-5\frontend"

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

**Frontend**: http://localhost:3000

### MCP Chat Server (Port 5000)

```bash
cd "E:\hackathon 2\todos\phase-5\mcp-server"

# Install dependencies (first time only)
pip install -r requirements.txt

# Start server
python server.py
```

**Chat API**: http://localhost:5000

## Database

Uses same Neon PostgreSQL database as Phase 2 with additional columns:
- `priority` (High/Medium/Low)
- `tags` (text array)
- `due_date` (date)
- `is_recurring` (boolean)
- `recurrence_pattern` (Daily/Weekly/Monthly)
- `parent_todo_id` (foreign key)

## API Changes

All existing Phase 2 endpoints work unchanged.

New fields in requests/responses:
```json
{
  "title": "Complete project",
  "priority": "High",
  "tags": ["#work", "#urgent"],
  "due_date": "2026-01-10",
  "is_recurring": false,
  "recurrence_pattern": null
}
```

## Demo for Judges

1. Start backend on port 8000
2. Start frontend on port 3005
3. Show Phase 2 vs Phase 5 side-by-side
4. Demonstrate:
   - Priority color coding
   - Tag system
   - Due date tracking
   - Filtering and sorting
   - Recurring tasks

## Notes

- Backward compatible with Phase 2
- Same authentication system
- Same database (extended schema)
- Port 8000 for backend, 3005 for frontend
