# Board View Redesign Concepts

A concept gallery and implementation roadmap exploring how TodoNex’s board view can evolve beyond the current red gradient treatment. These mockups are expressed descriptively so the team can evaluate direction before investing in visual production.

## Concept Gallery (10 Mockups)

1. **Aurora Flow** – Deep navy canvas with animated teal–violet gradient header, glowing column dividers, and pill-shaped task cards featuring slim status bars that pulse when deadlines near.
2. **Glass Blueprint** – Frosted glass cards floating over a blueprint grid, with cyan structural lines, compact typography, and a persistent left dock showcasing metrics in translucent tiles.
3. **Productivity Heatmap** – Neutral slate background, warm-to-cool column bands indicating workload density, cards carrying soft shadows plus temperature chips that shift color with urgency.
4. **Split Focus Timeline** – Upper board stays kanban; lower panel adds horizontal swimlanes for time-of-day scheduling. Tasks drag between layers, exposing start/end time pickers on drop.
5. **Pinned Panels** – Column headers become sticky modules holding quick filters, AI suggestions, and “Add Task” shortcuts that slide in via micro-interactions; cards display metadata on hover ribbons.
6. **Calm Workbench** – Bone-white surface with muted accent strokes, serif headlines, and minimalist cards. Priority chips convert into subtle corner folds instead of badges for an executive-ready look.
7. **Command Center** – Dark charcoal UI with neon edge highlights, quick command palette at top, live completion gauge tucked into the right rail, and focus mode that single-selects a card.
8. **Hybrid Matrix** – Columns pivot into stacked tiles that reveal calendar micro views per status, enabling same-screen due date edits and a “Reschedule” drop target perched on the side.
9. **Adaptive Glow** – Theme-aware gradient beams that respond to time (sunrise, midday, dusk, midnight). Cards swap iconography and color temperature automatically to reflect the day segment.
10. **Accessible Bold** – High contrast palette (ink, ivory, cyan accents) with 18px body text, explicit icon labels, colorblind-safe priority markers, and configurable spacing for motor accessibility.

## Detailed Plans

### Plan A – Board UI Modernization
- **Discovery**: Audit current board usage, identify pain points (card density, metadata hierarchy, contrast). Collect qualitative input from active users.  
- **Design System Updates**: Expand spacing scale, introduce shadow and border tokens, and define new gradient + background layers for board contexts.  
- **Card Redesign Sprint**: Prototype two card styles (glass + solid); test readability, drag affordance, and hover tools. Implement in Tailwind with variant props.  
- **Column & Header Refresh**: Add sticky filters, progress chips, and summary badges. Implement responsive breakpoints so the board gracefully collapses on tablets.  
- **Motion & Micro-interactions**: Introduce subtle hover lifts, focus halo for keyboard navigation, and smooth drag drop transitions leveraging `@dnd-kit` transform APIs.  
- **Validation**: Usability test with at least five power users; monitor task completion speed and subjective delight; iterate before production rollout.

### Plan B – Theme Expansion Program
- **Architecture**: Extend existing theme store to support multi-theme bundles (e.g., `aurora`, `workspace`, `contrast`). Build token generator mapping for Tailwind CSS and Radix primitives.  
- **Theme Design**: Produce high-fidelity palettes, surface treatments, and illustration accents for two hero themes (e.g., “Aurora Flow” & “Calm Workbench”). Define typography + shadow variants per theme.  
- **Implementation**: Ship theme toggle with preview modal, lazy-load heavy assets (pattern SVGs, gradients), and add URL param support (`?theme=aurora`) for shareable demos.  
- **Testing & Accessibility**: Run contrast audits (WCAG AA minimum), verify with prefers-color-scheme, snapshot tests for Playwright visual regressions, and add theme regression smoke tests.  
- **Launch Enablement**: Update onboarding to suggest themes, craft marketing assets, and measure adoption via analytics event `theme_selected`.

### Plan C – Unified Roadmap (UI Refresh + Themes)
- **Phase 1 (Weeks 1–3)**: Execute Plan A discovery + card redesign while foundational theme tokens are defined in parallel. Deliver updated cards using neutral base theme tokens.  
- **Phase 2 (Weeks 4–6)**: Layer in new column layouts, motion, and accessibility upgrades. Begin integrating themed variants behind feature flags.  
- **Phase 3 (Weeks 7–8)**: Finalize and QA two hero themes, wire up theme selector, and ensure cards/columns automatically adapt to palette + typography changes.  
- **Launch (Week 9)**: Soft release to beta cohort with feedback capture inside the board (inline banner + survey). Iterate rapidly, then general availability with marketing reveal.
