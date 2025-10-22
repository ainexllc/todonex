# NoteNex Responsive Workspace Spec

## Goals
- Deliver a document-centric workspace that always prioritizes the editing canvas while scaling supporting tools with available real estate.
- Preserve core editing capability across every device; larger viewports unlock additional panels rather than altering fundamentals.
- Use fluid layouts (CSS Grid, flex, container queries) instead of hard-coded breakpoints so components adapt gracefully to both mobile portrait and ultra-wide desktop screens.

## Viewport Tiers
| Token | Range (shortest edge) | Layout posture | Primary unlocks |
| ----- | --------------------- | -------------- | ---------------- |
| `XS`  | `< 480px`             | Single column  | Essential toolbar, collapsible utility tray |
| `SM`  | `480–767px`           | Single column  | Ribbon toggle, swipeable inspector, inline comments |
| `MD`  | `768–1199px`          | Two column     | Persistent inspector, full ribbon, quick actions |
| `LG`  | `1200–1599px`         | Three column   | Activity/history rail, secondary toolbar row |
| `XL`  | `≥ 1600px`            | Multi-pane     | Dockable palettes, split document view, analytics |

> Orientation switch uses the shortest edge to determine the tier so large tablets in portrait fall back to the tier that ensures readability.

## Wireframe Notes by Tier
- **XS**  
  - Sticky top bar with logo, document title dropdown, quick capture button, overflow menu.  
  - Document canvas spans full width with gutters handled via internal padding.  
  - Bottom sheet houses formatting controls, inspector, and comments (keeps actions reachable by thumb).  
  - Floating chips for filters/labels replace sidebar.

- **SM**  
  - Similar to XS but introduce collapsible ribbon above canvas (icon-only, swipe to reveal).  
  - Comments + inspector accessed through a right-edge drawer triggered by swipe or button.  
  - Footer status compresses to a pill with word count + presence indicator.

- **MD**  
  - Grid: `left gutter (min 72px)` + `primary column` + `context column (360px)`.  
  - Top ribbon pinned under header with grouped actions (text, insert, layout, AI).  
  - Context column hosts inspector tabs (styles, comments, AI suggestions).  
  - Sidebar overlays when invoked, sized 288px, collapses when clicking canvas.

- **LG**  
  - Grid: `nav sidebar 80px collapsed/320px expanded` + `canvas` + `context` + `utility`.  
  - Left nav can collapse to icon rail; right utility column (280px) exposes history, tasks, integrations.  
  - Secondary toolbar row surfaces advanced formatting, automation scripts, and collaboration tools.

- **XL**  
  - Workspace switches to adjustable panes: left nav, primary canvas (max 1200px per doc view), optional second canvas (compare/split), context stack, floating palettes.  
  - Panels can undock into modal windows; analytics dashboard (engagement, AI summaries) available in right-most column.

## Core Regions & Behavior
- **Header**: Always visible. Contains product navigation, document switcher, global search, collaboration menu. Icon-only in XS/SM, labeled buttons MD+.  
- **Ribbon / Tool Shelf**:  
  - XS/SM: collapsible pill menu with most-used actions; “More” sheet reveals advanced tools.  
  - MD+: persistent horizontal bar grouped into Format, Insert, Automations, AI. Secondary row toggles at LG+.  
- **Document Canvas**:  
  - Centered with fluid max width (container queries adapt padding).  
  - Snap guides and page outlines appear MD+; XS/SM rely on simple padding.  
  - Zoom control accessible at all tiers (toolbar button + pinch).  
- **Context Sidebar**:  
  - Hidden behind floating action (XS/SM).  
  - MD: docked right column with tabbed inspector.  
  - LG+: persists and can split into stacked panels (Inspector, Comments, AI).  
- **Utility Panels**:  
  - Comments/chat, version history, extensions.  
  - Modal/bottom sheet at XS/SM; third column dock at LG; multi-pane at XL.  
- **Footer Status**:  
  - XS/SM: condensed pill toggles detail tray.  
  - MD+: persistent bar with word count, connectivity, collaborators.  
  - LG+: adds AI suggestions ticker, automation diagnostics.

## Adaptive Patterns
- Progressive disclosure hides advanced formatting, automations, and analytics on smaller tiers—accessible via command palette (`⌘K` / `Ctrl+K`) or overflow menus.
- Collaboration indicators scale from single avatar dot (XS) to full roster (LG+) with presence statuses and cursor colors.
- Quick capture + note switching available across tiers; LG+ introduces drag-to-dock mini notes.
- Keyboard shortcut hints appear when pointer hover available; replaced with long-press tooltips on touch-only devices.

## Interaction & Navigation
- Command palette acts as universal action search with contextual suggestions; accessible every tier.
- Outline navigation: dropdown overlay on XS/SM; persistent tree in context column MD+; dedicated pane in XL.
- Gestures: pinch-to-zoom, two-finger tap context menu (mobile), swipe from edges to open drawers, drag handles for resizing panels (desktop).
- Multi-instance support at XL with two canvases; share toolbar when both active.

## Performance & Technical Guidance
- Prefer container queries for ribbon, inspector, and utility panels so they respond to actual container width rather than global viewport.
- Virtualize long lists (comments, history) for mobile performance; progressive load additional panes on-demand.
- Use CSS custom properties to describe column widths/gutters; update values responsively to avoid hard-coded `px`.
- Ensure all interactive controls meet 44px touch targets on XS/SM and 36px on desktop while keeping hover affordances.

## Accessibility & Theming
- Respect reduced-motion preferences (disable slide-in animations, use fades).  
- Provide high-contrast theme variants; ensure ribbon and sidebar gracefully reflow when font scaling (200%+) is enabled.  
- Keyboard navigation mirrors visual order; include focus traps for drawers/bottom sheets; ARIA landmarks (`header`, `main`, `aside`, `footer`) per tier.

## Component Inventory & Container Queries
| Component | Primary role | Container query triggers | Notes |
| --------- | ------------ | ------------------------ | ----- |
| `AppShell` | Owns global grid (`nav`, `main`, `utility`) | `shell-width: <720px`, `<1200px`, `≥1600px` | Toggle sidebar overlay vs dock, reveal utility rail at LG+, enable multi-pane at XL |
| `TopNav` | Header/ribbon housing nav, command palette, session controls | `nav-width: <420px`, `≥768px` | Swap search input for icon-only button on tight widths; reveal quick-action buttons from MD up |
| `CommandPalette` | Global action launcher | N/A | Always accessible; adjust density with prefers-reduced-motion |
| `Ribbon` | Formatting + AI actions | `ribbon-width: <480px`, `<720px`, `≥960px` | Collapse to segmented control on mobile, show full text labels on MD+, add secondary row at LG+ |
| `DocumentCanvas` | Core editing surface | `canvas-width: <540px`, `<900px`, `≥1200px` | Adjust inner padding/gutter, promote page guides from MD+, allow split view when `≥1200px` |
| `Sidebar` | Primary navigation and label management | `shell-width: <768px`, `≥1200px` | Overlay on mobile, collapsible icon rail on desktop, expand to full column at LG+ |
| `ContextInspector` | Styles, comments, metadata | `inspector-width: <360px`, `≥480px` | Bottom sheet on XS/SM, tabbed dock MD+, stackable panel LG+, undock option XL |
| `UtilityPanels` (History, Chat, Integrations) | Supplemental workflows | `utility-width: <320px`, `≥400px` | Hidden by default mobile, slide-in drawers MD, persistent third column LG+, detachable windows XL |
| `FooterStatus` | Presence + stats | `footer-width: <360px`, `≥600px` | Compress to pill when constrained, show AI ticker when wide |
| `NoteBoard` | Board/list of notes | `board-width: <640px`, `≥960px` | Switch column count via container columns, enable pinned grid layout MD+, allow drag-dock mini notes LG+ |

### Container Query Tokens
- Define logical custom properties in CSS (`--cq-shell`, `--cq-nav`, `--cq-ribbon`, etc.) that map to the component container width.  
- Use `@container (min-width: 720px)` style rules inside each component file rather than global breakpoints, letting nested components react independently.  
- Maintain Tailwind plugin or utility classes for common thresholds to avoid repetition:
  ```css
  @layer base {
    @container shell (min-width: 1200px) {
      .shell-lg\\:grid-cols-3 {
        grid-template-columns: var(--nav-col) 1fr var(--utility-col);
      }
    }
  }
  ```
- Surface container names in JSX via `style={{ containerName: "shell" }}` (or Tailwind plugin) for `AppShell`, `Ribbon`, `DocumentCanvas`, and `Inspector` wrappers.
- Backfill with viewport breakpoints only when container queries unsupported (progressive enhancement fallback).

### Implementation Changelog
- `AppShell` now exposes `cq-shell` container with grid tracks unlocking at 1200px (sidebar dock) and 1600px (utility rail).  
- `TopNav` uses `@container nav` to collapse the search input into an icon action below 640px and stagger quick-action visibility above 640px/900px.  
- `NoteBoard` replaces viewport column classes with `@container board` queries (2 cols ≥640px, 3 cols ≥960px) to respect panel width within multi-pane layouts.
- `Sidebar` content is marked `cq-sidebar`, allowing section titles to auto-hide when the rail collapses, independent of viewport size.  
- Utility rail scaffold (`cq-utility`) is present but hidden until the shell reaches ≥1600px; future work will populate it with history/chat modules.
- Context inspector (`cq-inspector`) activates at ≥1024px, surfacing selected note preview, workspace stats, active filters, and recent activity alongside the canvas; uses sticky positioning and internal scroll to keep tools in view.

### Follow-up
1. Layer in document-specific formatting/comment tabs within the inspector and hook into collaborative data sources.  
2. Build real utility modules (activity, chat, automations) and mount them in the new rail, with progressive disclosure rules per tier.  
3. Validate combined container rules for overlapping states (e.g., narrow shell + expanded sidebar) and adjust spacing tokens where needed.
