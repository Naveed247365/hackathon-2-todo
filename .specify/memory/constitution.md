<!--
Sync Impact Report - Constitution Update

Version Change: 1.1.0 → 2.0.0
Rationale: MAJOR version bump - Complete refocus from general spec-driven development to UI-only
futuristic 3D interface upgrade. Removed backend/API principles, added performance-first UI principles.

Modified Principles:
  - Principle I: Spec-First Development → UI-Only Development (scope narrowed to UI changes only)
  - Principle II: Phase Discipline → remains but reinterpreted for UI-only work
  - Principle V: Stateless Services → REMOVED (backend changes out of scope)
  - Principle VI: MCP Tool Constraint → REMOVED (not applicable to UI-only work)
  - Principle VII: Cloud-Native Readiness → REMOVED (deployment not in scope)

Added Sections:
  - Principle X: Performance-First UI (60fps target, budget enforcement)
  - Principle XI: Progressive Enhancement (fallback to 2D if WebGL unavailable)
  - Principle XII: Accessibility Preservation (WCAG 2.1 AA compliance maintained)
  - Principle XIII: Subtle 3D Philosophy (enhancement over spectacle)
  - Principle XIV: Responsive Design (mobile + desktop parity)
  - Principle XV: Technology Stack Constraints (Next.js, Tailwind, Framer Motion, Three.js)

Removed Sections:
  - Principle V: Stateless Services, Database as Source of Truth (backend out of scope)
  - Principle VI: MCP Tool Constraint (not applicable)
  - Principle VII: Cloud-Native Readiness (deployment out of scope)

Templates Status:
  ⚠ spec-template.md - Update to reflect UI-only scope constraints
  ⚠ plan-template.md - Add performance budgets, accessibility checks, 3D complexity gates
  ⚠ tasks-template.md - Add UI-specific task categories (animations, 3D components, responsive)
  ⚠ All templates - Constitution Check gates must reflect new UI principles

Follow-up Actions:
  - Update spec-template.md to include accessibility scenarios
  - Update plan-template.md with performance budget section
  - Add UI-specific checklists (accessibility, performance, responsive)
  - Review existing Phase 2 (web UI) for alignment with new principles
  - Future UI phases must follow futuristic 3D design principles

Previous Sync Impact Report (v1.1.0):
Version Change: 1.0.0 → 1.1.0
Rationale: Added Principle IX (Phase-Based Folder Organization) to enforce phase separation
Modified Principles: None
Added Sections: Principle IX
-->

# Hackathon 2: Futuristic 3D Todo UI Constitution

## Core Principles

### I. UI-Only Development (NON-NEGOTIABLE)

All work MUST be limited to user interface changes. Backend, API, and database logic are FROZEN:
- No changes to API endpoints, request/response formats, or backend logic
- No changes to database schema, queries, or data models
- No changes to business logic or validation rules
- UI layer MAY call existing APIs but MUST NOT modify them
- All improvements MUST be purely presentational and interaction-focused

**Rationale**: This constitution governs a UI upgrade phase only. Backend stability is a hard constraint. Mixing UI and backend changes increases risk, complexity, and testing burden. UI-only scope enables rapid iteration on visual design without regression risk to core functionality.

### II. Performance-First UI (NON-NEGOTIABLE)

Visual enhancements MUST NOT compromise performance. All UI changes MUST meet strict performance budgets:
- **Desktop Target**: 60fps (16.67ms per frame) during all interactions
- **Mobile Target**: 60fps on mid-range devices (iPhone 12, Galaxy S21 equivalent)
- **Initial Load**: First Contentful Paint < 1.5s, Time to Interactive < 3s
- **Animation Budget**: Max 50ms for layout animations, prefer transform/opacity
- **3D Budget**: Max 500 draw calls, < 500k triangles, < 200MB texture memory per scene
- **JavaScript Bundle**: Main bundle < 200KB gzipped, lazy load 3D dependencies

Performance budgets MUST be enforced via automated monitoring. Features that violate budgets MUST be optimized or removed.

**Rationale**: Futuristic UI is worthless if it's janky or slow. Users abandon slow apps. 60fps is the baseline for premium feel. Performance budgets prevent feature creep from degrading experience. Mobile devices have 1/10th the GPU power of desktop—design for constraints first.

### III. Progressive Enhancement (NON-NEGOTIABLE)

3D effects MUST gracefully degrade when WebGL is unavailable or performance is insufficient:
- Detect WebGL support on load; fallback to 2D CSS if unsupported
- Monitor FPS in real-time; reduce quality or disable 3D if sustained < 30fps
- Provide user control to disable 3D effects ("Performance Mode" toggle)
- Core functionality MUST work without 3D (3D is enhancement, not requirement)
- Fallback UI MUST be visually cohesive (not broken/ugly without 3D)

Progressive enhancement applies to animations, effects, and interactions—not just 3D scenes.

**Rationale**: Not all users have high-end GPUs. Battery-conscious users disable animations. Older browsers lack WebGL2 support. Accessibility settings (prefers-reduced-motion) must be respected. The app must be usable on all devices, not just the developer's MacBook Pro.

### IV. Accessibility Preservation (NON-NEGOTIABLE)

Visual upgrades MUST NOT break accessibility. WCAG 2.1 Level AA compliance is MANDATORY:
- All interactive elements MUST be keyboard navigable (no mouse-only 3D interactions)
- All text MUST meet 4.5:1 contrast ratio (watch glassmorphism, gradients)
- All animations MUST respect `prefers-reduced-motion` media query
- Screen readers MUST announce state changes (todo completion, deletion, errors)
- Focus indicators MUST be visible on all interactive elements
- 3D elements MUST have semantic HTML equivalents for assistive tech

Accessibility is tested with keyboard-only navigation, screen readers (NVDA/JAWS), and automated tools (axe-core).

**Rationale**: Flashy UI that excludes disabled users is unethical and illegal. WCAG compliance is non-negotiable. Reduced motion preferences are set by users with vestibular disorders—ignoring them causes nausea. Keyboard navigation is essential for power users and accessibility.

### V. Subtle 3D Philosophy (NON-NEGOTIABLE)

3D effects MUST enhance usability, not distract from it. Spectacle is REJECTED in favor of purposeful depth:
- 3D depth for hierarchy (cards float above background, modals above cards)
- Parallax for spatial context (background layers move slower than foreground)
- Smooth transitions for state changes (cards flip on completion, slide on delete)
- Hover effects for affordance (cards lift slightly on hover, buttons depress on click)
- AVOID: Spinning logos, unnecessary rotations, gratuitous particle effects, VR-style scenes

3D should feel like natural depth, not a tech demo. If the user notices the 3D instead of the task, it's too much.

**Rationale**: Heavy 3D scenes tank performance and distract users. The goal is a futuristic feel, not a video game. Subtle depth cues (shadows, parallax, layering) create premium feel without cognitive overload. Users should feel "wow, this is polished" not "what's happening on my screen?"

### VI. Responsive Design Parity (NON-NEGOTIABLE)

Mobile and desktop experiences MUST have feature parity and visual consistency:
- All 3D effects MUST work on mobile (with appropriate quality reduction)
- Touch gestures MUST have mouse/keyboard equivalents (swipe = arrow keys)
- Layouts MUST adapt fluidly from 320px to 4K displays
- Performance budgets apply to BOTH desktop and mobile (test on real devices)
- Mobile-first design: if a feature can't work on mobile, it's cut entirely

Responsive design is NOT just layout—it's interaction patterns, performance, and feature availability.

**Rationale**: Mobile users are 60%+ of web traffic. Designing desktop-only 3D UI is obsolete. Touch and mouse have different affordances—design for both. "Mobile version in 2D, desktop in 3D" creates inconsistent experience and doubles maintenance cost.

### VII. Technology Stack Constraints (NON-NEGOTIABLE)

UI implementation MUST use the following approved stack. Deviations require explicit justification:
- **Framework**: Next.js 14+ (App Router, React Server Components where applicable)
- **Styling**: Tailwind CSS 3+ with CSS variables for theming
- **Animations**: Framer Motion 11+ for layout animations and gestures
- **3D Library**: Three.js (via React Three Fiber) ONLY where it adds clear value
- **Icons**: Lucide React or Heroicons (SVG, tree-shakeable)
- **Fonts**: Variable fonts (Inter, Geist, or system fonts for performance)

Additional libraries require performance/bundle size justification in implementation plan.

**Rationale**: Consistency enables maintainability. Tailwind + CSS variables enable theming without runtime cost. Framer Motion handles complex animations declaratively. Three.js is industry standard for WebGL. Limiting libraries prevents bundle bloat and fragmentation.

### VIII. Domain Consistency (NON-NEGOTIABLE)

Todo domain rules MUST remain consistent with existing backend implementation:
- Todo entity structure (id, title, description, status, createdAt, updatedAt) is FROZEN
- Todo state transitions (pending → completed → archived) MUST match API behavior
- Validation rules (title required, max lengths) MUST match backend constraints
- Domain terminology MUST align with API contracts (use "todo" not "task", "status" not "state")

UI layer displays and manipulates todos but MUST NOT redefine domain rules.

**Rationale**: UI is a presentation layer for backend-defined domain. Inventing UI-only validation rules or state transitions creates inconsistency bugs. Domain logic lives in backend; UI reflects it faithfully.

### IX. Phase Discipline (NON-NEGOTIABLE)

UI development MUST proceed through distinct phases with zero overlap:
1. **Specification Phase**: Define visual design, interactions, animations, accessibility requirements
2. **Planning Phase**: Component architecture, performance budgets, 3D complexity analysis, technology choices
3. **Task Definition Phase**: Breakdown into testable UI tasks (components, animations, responsive layouts)
4. **Implementation Phase**: Build components in dependency order (design system → pages → 3D enhancements)
5. **Validation Phase**: Verify performance budgets, accessibility, responsive behavior, visual polish

Each phase MUST have explicit exit criteria. No phase may begin until the prior phase is complete.

**Rationale**: UI work is prone to scope creep ("just one more animation"). Phase discipline prevents endless tweaking. Clear exit criteria ensure performance budgets and accessibility are validated, not assumed.

### X. Clear Exit Criteria (NON-NEGOTIABLE)

Every UI phase, task, and deliverable MUST define measurable completion criteria:
- Specifications: All screens/components mocked up; all animations described; accessibility scenarios defined
- Plans: Component hierarchy documented; performance budgets set; 3D complexity analyzed; Constitution Check passed
- Tasks: Visual acceptance criteria stated; file paths specified; dependencies explicit
- Implementation: All visual specs met; performance budgets passed; accessibility tests passed; no visual regressions

Exit criteria for UI work include visual QA (screenshot comparison), performance profiling, and accessibility audits.

**Rationale**: "Looks good" is not exit criteria. Measurable criteria (FPS > 60, contrast ratio > 4.5:1, bundle < 200KB) prevent endless polish cycles and ensure quality gates.

### XI. Phase-Based Folder Organization (NON-NEGOTIABLE)

All UI implementation artifacts MUST be organized into phase-specific folders:
- Phase 3 UI upgrade files MUST reside in `phase-3/` directory (or appropriate phase number)
- Each phase folder contains: Next.js app, components, styles, public assets, README, Dockerfile
- Specifications remain in `specs/` directory (not moved to phase folders)
- Shared infrastructure (`.specify/`, `history/`) remains at repository root

**Folder Structure Example for UI Phase**:
```
repository-root/
├── phase-3/              # Futuristic 3D UI implementation
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   ├── ui/           # Design system primitives
│   │   ├── todo/         # Todo-specific components
│   │   └── 3d/           # Three.js/R3F components
│   ├── styles/           # Global CSS, Tailwind config
│   ├── public/           # Static assets (textures, models, fonts)
│   ├── lib/              # Utils, hooks, API client
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── specs/                # All specifications (shared)
│   └── 003-futuristic-ui/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── .specify/             # Constitution and templates (shared)
└── history/              # PHRs and ADRs (shared)
```

**Rationale**: Phase isolation enables side-by-side comparison (Phase 2 basic UI vs Phase 3 futuristic UI). Each phase is independently deployable. Clear separation demonstrates evolutionary development for hackathon judging.

### XII. Process Over Features

For hackathon judging, demonstration of rigorous UI process is prioritized over visual complexity:
- Comprehensive design specs (with mockups, interaction flows) count more than numerous screens
- Performance profiling and optimization count more than heavy 3D scenes
- Accessibility audits and compliance count more than flashy animations
- Traceable design decisions (ADRs for major UI choices) count more than volume of components

**Rationale**: Hackathon judging rewards disciplined process. One fully-specified, accessible, performant screen demonstrates more engineering maturity than ten janky, inaccessible screens.

## Development Workflow

### Phase 0: UI Feature Request
- User provides description of desired UI enhancement (e.g., "futuristic 3D todo cards")
- Run `/sp.specify` to generate UI specification draft
- Include visual mockups, interaction descriptions, animation sequences
- Clarify design ambiguities (color schemes, spacing, 3D complexity)
- Iterate until UI spec is complete and approved

**Exit Criteria**: Spec file exists in `specs/<feature>/spec.md`; all screens/components described; all animations specified; all "NEEDS CLARIFICATION" resolved; user approval obtained.

### Phase 1: UI Specification Refinement
- Review generated UI spec for completeness
- Identify missing responsive behaviors, accessibility requirements, or performance constraints
- Run `/sp.clarify` if needed to address underspecified UI areas
- Add performance budgets for each component/screen

**Exit Criteria**: All UI components numbered and described; all animations detailed; all accessibility scenarios documented; performance budgets set; no ambiguous visual language.

### Phase 2: UI Implementation Planning
- Run `/sp.plan` to generate component architecture and design system
- Research optimal approaches (CSS Grid vs Flexbox, Three.js vs CSS 3D transforms)
- Document key UI decisions with rationale (why Framer Motion over CSS transitions)
- Pass Constitution Check (validate against all 12 UI principles)
- Identify ADR-worthy decisions (e.g., "Why we chose glassmorphism over neumorphism")

**Exit Criteria**: Plan file exists with component hierarchy, design system tokens, performance budgets, 3D complexity analysis, Constitution Check passed, architectural decisions documented.

### Phase 3: UI Task Breakdown
- Run `/sp.tasks` to generate actionable UI task list
- Organize tasks by dependency (design system → primitives → composites → pages → 3D enhancements)
- Verify each task has visual acceptance criteria and file paths
- Confirm foundational tasks (design system, theme setup) block dependent work

**Exit Criteria**: Tasks file exists with clear visual success criteria, dependencies explicit, file paths specified, responsive and accessibility tasks included.

### Phase 4: UI Implementation
- Execute tasks in dependency order (build design system first)
- Mark tasks in-progress before starting, completed immediately after finishing
- Create commits after each logical component or feature
- Test responsiveness on real devices (mobile, tablet, desktop)
- Profile performance continuously (Stats.js, Chrome DevTools)
- Never mark task completed if performance budgets fail or accessibility tests fail

**Exit Criteria**: All tasks completed; all visual specs met; all performance budgets passed; all accessibility tests passed; code committed to feature branch.

### Phase 5: UI Validation and Delivery
- Run performance profiling suite (FPS monitoring, bundle size analysis)
- Validate against all accessibility scenarios (keyboard nav, screen reader, reduced motion)
- Test responsive behavior across breakpoints (320px to 4K)
- Generate UI validation checklist using `/sp.checklist`
- Create pull request with visual regression screenshots

**Exit Criteria**: Performance budgets passed; accessibility audits passed; responsive tests passed; visual QA approved; PR merged.

## Quality Standards

### UI Testing Requirements
- **Visual Regression Tests**: MANDATORY (screenshot comparison on key screens)
- **Performance Tests**: MANDATORY (FPS monitoring, bundle size, load time)
- **Accessibility Tests**: MANDATORY (axe-core automated + manual keyboard/screen reader)
- **Responsive Tests**: MANDATORY (320px, 768px, 1024px, 1920px breakpoints)
- **Unit Tests**: OPTIONAL (for complex UI logic like animation sequencing)

### UI Documentation Requirements
- **Specification**: MANDATORY for every UI feature (`specs/<feature>/spec.md` with visual mockups)
- **Implementation Plan**: MANDATORY (`specs/<feature>/plan.md` with component architecture)
- **Task List**: MANDATORY (`specs/<feature>/tasks.md` with visual acceptance criteria)
- **Design System Docs**: MANDATORY (document color tokens, spacing scale, typography)
- **Component Storybook**: RECOMMENDED (isolate and document UI components)
- **ADRs**: MANDATORY for major UI decisions (technology choices, design philosophy)
- **PHRs**: MANDATORY for every user request (auto-generated after work completion)

### Performance Monitoring Requirements
- All 3D scenes MUST include Stats.js during development (FPS, MS, MB panels)
- All pages MUST log Web Vitals (LCP, FID, CLS) to console in dev mode
- Performance budgets MUST be validated in CI (bundle size, Lighthouse scores)
- Slow animations (> 50ms) MUST log warnings with component/element identifier
- Production builds MUST tree-shake dev-only performance monitoring code

### Accessibility Monitoring Requirements
- All pages MUST pass axe-core automated checks (0 violations)
- All interactive elements MUST be keyboard-testable (manual validation required)
- All animations MUST respect `prefers-reduced-motion` (automated test in CI)
- Color contrast MUST meet WCAG AA (4.5:1 for text, 3:1 for UI components)
- Screen reader announcements MUST be validated manually (NVDA/VoiceOver)

## Governance

### Constitution Supremacy
This UI-focused constitution supersedes all other UI practices, design preferences, or visual conventions. When in conflict, constitution principles take precedence.

### Amendment Process
- Amendments require explicit user approval
- Version must be incremented per semantic versioning:
  - **MAJOR**: Backward-incompatible principle changes (e.g., removing accessibility requirement)
  - **MINOR**: New principle or section added (e.g., adding animation philosophy)
  - **PATCH**: Clarifications, wording fixes, non-semantic refinements
- All dependent templates MUST be reviewed and updated for consistency
- Amendment rationale MUST be documented in Sync Impact Report
- Use `/sp.constitution` to propose and apply amendments

### Compliance Review
- All PRs and code reviews MUST verify compliance with UI constitution
- Constitution Check gate in plan phase MUST pass before implementation begins
- 3D complexity or performance violations MUST be explicitly justified in plan
- Unjustified violations (accessibility failures, performance budget misses) result in rejected PRs

### Enforcement
- Agents MUST follow UI constitution principles in all generated UI artifacts
- Users MAY override constitution for specific cases with explicit justification
- Repeated violations indicate constitution is too strict or unclear—consider amendment

**Version**: 2.0.0 | **Ratified**: 2026-01-03 | **Last Amended**: 2026-01-03
