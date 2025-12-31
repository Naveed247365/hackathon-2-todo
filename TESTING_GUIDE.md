# Phase 3 Testing Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Start All Services

**Terminal 1 - Backend:**
```powershell
cd "E:\hackathon 2\todos\phase-2\backend"
python main.py
```
Wait for: `Uvicorn running on http://0.0.0.0:8000`

**Terminal 2 - MCP Server:**
```powershell
cd "E:\hackathon 2\todos\phase-3\mcp-server"
python server.py
```
Wait for: `Starting Flask server on http://localhost:5000`

**Terminal 3 - Frontend:**
```powershell
cd "E:\hackathon 2\todos\phase-2\frontend"
npm run dev
```
Wait for: `ready started server on 0.0.0.0:3000`

---

### Step 2: Run Health Check

```powershell
cd "E:\hackathon 2\todos"
powershell -ExecutionPolicy Bypass -File test-setup.ps1
```

**Expected Output:**
```
🔍 Testing Phase 3 AI Todo Chatbot Setup...

1. Testing Backend (port 8000)... ✅ RUNNING
2. Testing MCP Server (port 5000)... ✅ RUNNING
3. Testing Frontend (port 3000)... ✅ RUNNING
4. Testing AI Chat Endpoint... ✅ WORKING
   AI Response: Hello! How can I assist you today with managing your todos?
```

---

### Step 3: Test in Browser

1. **Open:** http://localhost:3000
2. **Login/Signup:** Create account or login
3. **Find Chat:** Look for "AI Todo Assistant" at bottom-right
4. **Click:** Opens chat panel

---

## 🧪 Test Cases

### Test 1: CREATE Todo
**Command:** `add buy groceries`

**Expected:**
- ✅ AI responds: "Added: buy groceries"
- ✅ Todo appears in list above
- ✅ Status shows "pending"

---

### Test 2: LIST Todos
**Command:** `list my todos`

**Expected:**
- ✅ AI shows all todos
- ✅ Format: "○ 1. buy groceries (pending)"

---

### Test 3: COMPLETE Todo
**Command:** `complete buy groceries`

**Expected:**
- ✅ AI responds: "Marked 'buy groceries' as completed"
- ✅ Todo status changes to "completed" in UI
- ✅ Checkmark appears in list

---

### Test 4: UPDATE Todo
**Command:** `update buy groceries to buy organic groceries`

**Expected:**
- ✅ AI responds: "Updated: buy organic groceries"
- ✅ Title changes in UI

---

### Test 5: DELETE Todo
**Command:** `delete buy groceries`

**Expected:**
- ✅ AI responds: "Todo deleted"
- ✅ Todo disappears from UI list

---

## 🎯 Full User Story Tests

### User Story 1: Natural Language Creation
```
Commands to test:
1. add buy groceries
2. create a task to review pull requests
3. remind me to call mom
4. add (incomplete - should ask for clarification)
5. what's the weather (unknown - should show help)
```

### User Story 2: Natural Language Listing
```
Commands to test:
1. list my todos
2. show me my tasks
3. what do I need to do?
4. show pending
5. show completed
```

### User Story 3: Natural Language Completion
```
Commands to test:
1. complete buy groceries
2. mark task 5 as done
3. finish the code review task
4. complete (no match - should ask which one)
```

### User Story 4: Natural Language Update
```
Commands to test:
1. update buy milk to buy almond milk
2. rename task 3 to review security audit
3. change the groceries task to buy organic groceries
```

### User Story 5: Natural Language Deletion
```
Commands to test:
1. delete buy groceries
2. remove task 7
3. get rid of the completed tasks (should ask confirmation)
```

---

## 🔍 Manual Testing Checklist

### Basic Functionality
- [ ] Backend responds on port 8000
- [ ] MCP server responds on port 5000
- [ ] Frontend loads on port 3000
- [ ] Can signup/login
- [ ] Todos page loads
- [ ] Chat panel opens/closes

### AI Features
- [ ] CREATE: "add buy groceries" works
- [ ] LIST: "list my todos" works
- [ ] COMPLETE: "complete buy groceries" works
- [ ] UPDATE: "update buy milk to buy almond milk" works
- [ ] DELETE: "delete buy groceries" works

### Safety Features
- [ ] AI doesn't hallucinate todos
- [ ] JWT authentication required
- [ ] Fuzzy matching works ("groceries" matches "buy groceries")
- [ ] Clarification for ambiguous commands
- [ ] Error handling (401, 403, 404)
- [ ] Bulk delete asks for confirmation

### Integration
- [ ] Todo created via chat appears in UI
- [ ] Todo completed via chat updates in UI
- [ ] Todo deleted via chat removes from UI
- [ ] Todo created in UI appears when listing via chat
- [ ] Chat works while UI operations continue

---

## 🐛 Troubleshooting

### Issue: "Connection refused" in chat
**Fix:** All 3 services must be running. Run test-setup.ps1 to check.

### Issue: AI doesn't respond
**Check:** MCP server logs for errors
**Test:**
```powershell
curl -X POST http://localhost:5000/api/chat -H "Content-Type: application/json" -H "Authorization: Bearer test" -d "{\"message\": \"hello\"}"
```

### Issue: Environment variables not loaded
**Fix:** Restart frontend:
```powershell
# In Terminal 3, press Ctrl+C
# Then:
npm run dev
```

### Issue: "OPENROUTER_API_KEY must be set"
**Fix:** Check phase-3/mcp-server/.env has API key

### Issue: Backend database error
**Fix:** Check phase-2/backend/.env has correct DATABASE_URL

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Services:
[ ] Backend running
[ ] MCP Server running
[ ] Frontend running
[ ] Health check passes

User Stories:
[ ] US1: CREATE todos
[ ] US2: LIST todos
[ ] US3: COMPLETE todos
[ ] US4: UPDATE todos
[ ] US5: DELETE todos

Safety:
[ ] No hallucinations
[ ] Auth required
[ ] Fuzzy matching
[ ] Error handling

Integration:
[ ] Chat ↔ UI sync

Issues Found:
_____________________
_____________________

Overall Result: PASS / FAIL
```

---

## ✅ Success Criteria

Phase 3 is **COMPLETE** when:
- ✅ All 3 services start without errors
- ✅ Health check passes
- ✅ All 5 user stories work
- ✅ AI safety features work
- ✅ Chat and UI stay in sync
- ✅ No backend changes (verified with git)

---

## 📹 Demo Script

**For showcasing the AI chatbot:**

1. **Start fresh** - Clear all todos
2. **Show chat panel** - Click to open
3. **Create todos:**
   - "add buy groceries"
   - "add review pull requests"
   - "remind me to call mom"
4. **List them:** "list my todos"
5. **Complete one:** "complete buy groceries"
6. **Show UI** - Point out completed checkmark
7. **Update one:** "update buy milk to buy almond milk"
8. **Delete one:** "delete the call mom task"
9. **Verify:** "list my todos"

---

**Ready to test!** 🚀

Run `test-setup.ps1` to verify all services are ready!
