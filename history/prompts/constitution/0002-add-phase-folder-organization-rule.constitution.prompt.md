---
id: 0002
title: Add Phase Folder Organization Rule
stage: constitution
date: 2025-12-30
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-console-based-todo-app
user: naveed247365
command: restructure
labels: ["constitution", "amendment", "folder-structure", "phase-organization"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
 - phase-1/todo.py (moved from root)
 - phase-1/README.md (moved from root)
tests:
 - N/A (constitution amendment, no tests)
---

## Prompt

agy kam karne se phele sterturter set karo phsahe 1 ki all files phase 1 folder me rakho or agy k all phases bhi folder me hi rakna hai isy constitution ka hissa bna do

(Translation: Before moving forward, set up the structure properly. Put all Phase 1 files in a phase-1 folder and keep all future phases in folders as well. Make this part of the constitution.)

## Response snapshot

Amended constitution from v1.0.0 to v1.1.0 by adding Principle IX (Phase-Based Folder Organization):

**New Principle IX**:
- All implementation artifacts MUST be organized into phase-N/ folders at repository root
- Phase 1 → `phase-1/`, Phase 2 → `phase-2/`, etc.
- Each phase folder contains: source code, README, configuration, Dockerfile (if applicable)
- Specifications remain in `specs/` directory (shared)
- Shared infrastructure (`.specify/`, `history/`) remains at repository root

**Folder Structure Enforced**:
```
repository-root/
├── phase-1/              # Phase 1 implementation
│   ├── todo.py
│   └── README.md
├── phase-2/              # Future phases
├── specs/                # Specifications (shared)
├── .specify/             # Constitution, templates (shared)
└── history/              # PHRs, ADRs (shared)
```

**Actions Completed**:
1. Created `phase-1/` directory
2. Moved `todo.py` and `README.md` from root to `phase-1/`
3. Added Principle IX to constitution
4. Updated constitution version: 1.0.0 → 1.1.0 (MINOR bump - new principle added)
5. Updated Sync Impact Report with amendment details

**Rationale**: Phase-based folder organization provides:
- Clear separation of evolutionary stages
- Easy phase comparison and rollback
- Self-contained, independently runnable phases
- Demonstrates iterative development for hackathon judging

## Outcome

- ✅ Impact: Constitution amended to v1.1.0; Principle IX enforced; Phase 1 files relocated to phase-1/; future phases must follow phase-N/ structure
- 🧪 Tests: N/A (constitution amendment)
- 📁 Files: Updated constitution.md; moved todo.py and README.md to phase-1/
- 🔁 Next prompts: Future implementation phases will automatically create phase-N/ folders; project README should document folder structure
- 🧠 Reflection: Phase separation enables clean evolution tracking; constitution now enforces 9 principles (8 original + 1 new); folder structure makes phase boundaries explicit for judges

## Evaluation notes (flywheel)

- Failure modes observed: None; restructuring completed successfully
- Graders run and results (PASS/FAIL): Structure compliance PASS (Phase 1 files in phase-1/); constitution versioning PASS (MINOR bump appropriate for new principle)
- Prompt variant (if applicable): N/A (user-requested amendment)
- Next experiment (smallest change to try): Monitor Phase 2 implementation to validate folder structure scales properly with multiple phases
