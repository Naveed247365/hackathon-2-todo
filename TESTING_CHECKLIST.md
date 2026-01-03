# Complete Testing Checklist - All Phases

**Project**: Todo Application (Hackathon 2)
**Date**: January 2, 2026
**Tester**: _______________

---

## 🎯 Testing Instructions

1. Start backend and frontend (see START_HERE.md)
2. Check each box `[ ]` → `[X]` as you test
3. Note any issues in the "Notes" column
4. All features should work - report failures immediately

---

## Phase 1: Console App ✅ (Previously Tested)

**Skip this phase** - Phase 1 functionality is integrated into web app.

---

## Phase 2: Basic Web App Features

### Authentication
- [ ] **Sign Up**: Create new account with email + password (8+ chars)
  - **Expected**: "Account created" message, auto-login
  - **Notes**: ____________________________________________

- [ ] **Login**: Login with existing credentials
  - **Expected**: Redirect to /todos page
  - **Notes**: ____________________________________________

- [ ] **Logout**: Click logout button
  - **Expected**: Redirect to /login page
  - **Notes**: ____________________________________________

- [ ] **Auth Protection**: Try accessing /todos without login
  - **Expected**: Redirect to /login
  - **Notes**: ____________________________________________

### Basic CRUD Operations
- [ ] **Create Todo**: Enter title "Test todo 1" and submit
  - **Expected**: Todo appears in list immediately
  - **Notes**: ____________________________________________

- [ ] **View Todos**: Refresh page
  - **Expected**: Created todo still visible
  - **Notes**: ____________________________________________

- [ ] **Complete Todo**: Click ✓ button
  - **Expected**: Todo gets strikethrough, status shows "completed"
  - **Notes**: ____________________________________________

- [ ] **Edit Todo**: Click ✎ button, change title to "Test todo 1 (edited)"
  - **Expected**: Title updates in list
  - **Notes**: ____________________________________________

- [ ] **Delete Todo**: Click ✕ button, confirm deletion
  - **Expected**: Todo removed from list
  - **Notes**: ____________________________________________

---

## Phase 3: AI Chatbot Features

### Natural Language Commands
- [ ] **AI Create**: Type "add buy groceries" in chat panel
  - **Expected**: Todo created, AI confirms creation
  - **Notes**: ____________________________________________

- [ ] **AI List**: Type "list my todos" in chat
  - **Expected**: AI shows all your todos
  - **Notes**: ____________________________________________

- [ ] **AI Complete**: Type "complete buy groceries"
  - **Expected**: Todo marked as completed, AI confirms
  - **Notes**: ____________________________________________

- [ ] **AI Update**: Type "update [todo] to [new title]"
  - **Expected**: Todo title updated, AI confirms
  - **Notes**: ____________________________________________

- [ ] **AI Delete**: Type "delete [todo]"
  - **Expected**: Todo deleted, AI confirms
  - **Notes**: ____________________________________________

### AI Edge Cases
- [ ] **Unclear Command**: Type "asdf random text"
  - **Expected**: AI provides help message with examples
  - **Notes**: ____________________________________________

- [ ] **Incomplete Command**: Type "add" (no title)
  - **Expected**: AI asks "What would you like to add?"
  - **Notes**: ____________________________________________

---

## Phase 5: Advanced Features

### Priority Management
- [ ] **Create High Priority**: Create todo with Priority = High
  - **Expected**: Red badge showing "High"
  - **Notes**: ____________________________________________

- [ ] **Create Medium Priority**: Create todo with Priority = Medium
  - **Expected**: Yellow badge showing "Medium"
  - **Notes**: ____________________________________________

- [ ] **Create Low Priority**: Create todo with Priority = Low
  - **Expected**: Green badge showing "Low"
  - **Notes**: ____________________________________________

- [ ] **Filter by Priority**: Select "High" in priority filter
  - **Expected**: Only high-priority todos shown
  - **Notes**: ____________________________________________

- [ ] **Sort by Priority**: Select "Priority" in sort dropdown
  - **Expected**: Todos ordered High → Medium → Low
  - **Notes**: ____________________________________________

### Tag Organization
- [ ] **Create with Tags**: Create todo with tags "work, urgent"
  - **Expected**: Two gray badges "#work" and "#urgent" appear
  - **Notes**: ____________________________________________

- [ ] **Create with # Tags**: Create todo with tags "#test #demo"
  - **Expected**: Tags displayed correctly (no double #)
  - **Notes**: ____________________________________________

- [ ] **Multiple Tags**: Create todo with 5+ tags
  - **Expected**: All tags display as separate badges
  - **Notes**: ____________________________________________

### Due Dates & Overdue Tracking
- [ ] **Create with Future Due Date**: Set due date = tomorrow
  - **Expected**: Blue badge with 📅 icon showing date
  - **Notes**: ____________________________________________

- [ ] **Create with Past Due Date**: Set due date = yesterday
  - **Expected**: Red border + red "⚠ OVERDUE" badge
  - **Notes**: ____________________________________________

- [ ] **Complete Overdue Todo**: Mark overdue todo as complete
  - **Expected**: Red border/badge removed, gray date badge remains
  - **Notes**: ____________________________________________

- [ ] **Due Date Display**: Check date format is readable
  - **Expected**: Shows "Jan 3, 2026" format
  - **Notes**: ____________________________________________

### Recurring Tasks
- [ ] **Create Daily Recurring**: Check "Recurring" → Select "Daily"
  - **Expected**: Blue ↻ icon appears
  - **Notes**: ____________________________________________

- [ ] **Create Weekly Recurring**: Check "Recurring" → Select "Weekly"
  - **Expected**: Blue ↻ icon appears
  - **Notes**: ____________________________________________

- [ ] **Create Monthly Recurring**: Check "Recurring" → Select "Monthly"
  - **Expected**: Blue ↻ icon appears
  - **Notes**: ____________________________________________

- [ ] **Complete Recurring Todo**: Complete a recurring task
  - **Expected**: Original marked complete, new todo created for next occurrence
  - **Notes**: ____________________________________________

- [ ] **Recurring Icon Tooltip**: Hover over ↻ icon
  - **Expected**: Tooltip shows "Recurring: Daily" (or pattern)
  - **Notes**: ____________________________________________

### Advanced Filtering & Sorting
- [ ] **Filter by Status (Pending)**: Select "Pending" status filter
  - **Expected**: Only pending todos shown
  - **Notes**: ____________________________________________

- [ ] **Filter by Status (Completed)**: Select "Completed" status filter
  - **Expected**: Only completed todos shown
  - **Notes**: ____________________________________________

- [ ] **Sort by Created Date**: Select "Created Date" in sort dropdown
  - **Expected**: Newest todos first
  - **Notes**: ____________________________________________

- [ ] **Multiple Filters**: Set Priority=High + Status=Pending
  - **Expected**: Only high-priority pending todos shown
  - **Notes**: ____________________________________________

- [ ] **Clear Filters**: Click "Clear" button
  - **Expected**: All filters reset, all todos shown
  - **Notes**: ____________________________________________

- [ ] **Todo Count**: Check "Showing X todos" text
  - **Expected**: Count matches visible todos
  - **Notes**: ____________________________________________

### Combined Features Test
- [ ] **Create Full-Featured Todo**: Create todo with ALL fields:
  - Title: "Complete hackathon testing"
  - Priority: High
  - Tags: work, urgent, test
  - Due Date: Tomorrow
  - Recurring: Weekly

  **Expected**:
  - ✅ Red "High" badge
  - ✅ Three gray tag badges
  - ✅ Blue due date badge
  - ✅ Blue ↻ recurring icon

  **Notes**: ____________________________________________

- [ ] **Complete Full-Featured Todo**: Mark above todo as complete
  - **Expected**: Original completed + new weekly instance created
  - **Notes**: ____________________________________________

---

## Backend API Testing (Optional - Advanced)

### Using Swagger UI (http://localhost:8000/docs)

- [ ] **GET /api/v5/todos**: List all todos
  - **Expected**: 200 OK, array of todos
  - **Notes**: ____________________________________________

- [ ] **POST /api/v5/todos**: Create todo with all Phase 5 fields
  - **Expected**: 201 Created, todo object returned
  - **Notes**: ____________________________________________

- [ ] **GET /api/v5/todos?priority=High**: Filter by priority
  - **Expected**: 200 OK, only high-priority todos
  - **Notes**: ____________________________________________

- [ ] **GET /api/v5/todos?sort_by=priority**: Sort by priority
  - **Expected**: 200 OK, todos sorted High → Medium → Low
  - **Notes**: ____________________________________________

- [ ] **PATCH /api/v5/todos/{id}/complete**: Complete todo
  - **Expected**: 200 OK, status changed to "completed"
  - **Notes**: ____________________________________________

- [ ] **PATCH /api/v5/todos/{id}**: Update todo title
  - **Expected**: 200 OK, title updated
  - **Notes**: ____________________________________________

- [ ] **DELETE /api/v5/todos/{id}**: Delete todo
  - **Expected**: 204 No Content, todo deleted
  - **Notes**: ____________________________________________

---

## Performance & Usability Testing

### Page Load & Responsiveness
- [ ] **Initial Page Load**: Time from URL to interactive
  - **Expected**: < 3 seconds
  - **Actual**: _______ seconds
  - **Notes**: ____________________________________________

- [ ] **Todo Creation Speed**: Time from submit to display
  - **Expected**: < 1 second
  - **Actual**: _______ seconds
  - **Notes**: ____________________________________________

- [ ] **Filter Response Time**: Time from filter change to update
  - **Expected**: < 500ms
  - **Actual**: _______ ms
  - **Notes**: ____________________________________________

### Browser Compatibility
- [ ] **Chrome**: Test all features
  - **Status**: ☐ Pass ☐ Fail
  - **Notes**: ____________________________________________

- [ ] **Edge**: Test all features
  - **Status**: ☐ Pass ☐ Fail
  - **Notes**: ____________________________________________

- [ ] **Firefox**: Test all features (optional)
  - **Status**: ☐ Pass ☐ Fail
  - **Notes**: ____________________________________________

### Mobile Responsiveness (Optional)
- [ ] **Mobile View**: Resize browser to phone size (375px width)
  - **Expected**: UI remains usable, no horizontal scroll
  - **Notes**: ____________________________________________

---

## Error Handling Testing

### Form Validation
- [ ] **Empty Title**: Try creating todo with blank title
  - **Expected**: Error message "Title cannot be empty"
  - **Notes**: ____________________________________________

- [ ] **Very Long Title**: Try creating todo with 600+ character title
  - **Expected**: Backend validation error (500 char limit)
  - **Notes**: ____________________________________________

- [ ] **Invalid Date**: Try setting due date in distant past (1900)
  - **Expected**: Date picker prevents or backend validates
  - **Notes**: ____________________________________________

### Network Errors
- [ ] **Backend Offline**: Stop backend, try creating todo
  - **Expected**: Error message "Failed to create todo"
  - **Notes**: ____________________________________________

- [ ] **Session Expired**: Use old JWT token
  - **Expected**: Redirect to login page
  - **Notes**: ____________________________________________

---

## Final Verification

### Data Persistence
- [ ] **Refresh Test**: Create 3 todos, refresh page
  - **Expected**: All 3 todos still visible
  - **Notes**: ____________________________________________

- [ ] **Logout/Login Test**: Create todo, logout, login again
  - **Expected**: Todo still visible after re-login
  - **Notes**: ____________________________________________

- [ ] **Multi-User Isolation**: Login as User A, create todos, logout. Login as User B
  - **Expected**: User B sees only their own todos, not User A's
  - **Notes**: ____________________________________________

### Visual Polish
- [ ] **No Console Errors**: Open F12 → Console tab
  - **Expected**: No red error messages
  - **Notes**: ____________________________________________

- [ ] **Layout Quality**: Check spacing, alignment, colors
  - **Expected**: Professional appearance, no overlapping elements
  - **Notes**: ____________________________________________

- [ ] **Icons & Badges**: Verify all icons/badges display correctly
  - **Expected**: ✓ ✎ ✕ ↻ 📅 ⚠ all visible
  - **Notes**: ____________________________________________

---

## Test Summary

**Date Tested**: _______________
**Tester Name**: _______________
**Total Tests**: 80+
**Tests Passed**: _____ / 80+
**Tests Failed**: _____

### Critical Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Minor Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Overall Assessment
☐ **PASS** - Ready for demo/production
☐ **FAIL** - Critical issues must be fixed
☐ **PARTIAL** - Minor issues acceptable, can proceed

---

## Sign-Off

**Tester Signature**: _______________
**Date**: _______________

---

**Notes**:
- Focus on Phase 5 features (priority, tags, due dates, recurring, filters)
- Phase 3 AI chatbot is optional but should work
- All Phase 2 basic features must work
- Report any broken functionality immediately
