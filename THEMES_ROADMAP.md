# Theme Expansion Roadmap

TodoNex will introduce a fully fledged theming system derived from the ten board mockups. The program below translates those concepts into two launch themes and a scalable architecture that supports a growing palette.

## 1. Theme Architecture Upgrades

- **Tokenized Design System**  
  - Convert existing Tailwind config to expose semantic tokens (e.g., `--board-bg`, `--card-border`, `--accent-glow`).  
  - Create a `theme.json` loader in `src/lib/theme/registry.ts` that maps theme IDs (`aurora-flow`, `calm-workbench`, `command-center`, etc.) to token values.  
  - Extend `ThemeProvider` to load tokens at runtime via `<style>` injection or CSS variables set on `<body>`.

- **Component Variants**  
  - Refactor key UI components (`TaskCard`, column shells, header bars, navigation) to consume semantic tokens instead of hard-coded classes.  
  - Provide fallback to default theme to avoid regressions.

- **Animation/Motion Hooks**  
  - Add optional animation descriptors (`statusGlow`, `headerShimmer`) to theme definitions; hook into Framer Motion or CSS transitions conditionally.

- **Asset Pipeline**  
  - Organize theme-specific assets (SVG patterns, illustrations) under `public/themes/{id}/`.  
  - Lazy-load heavy assets with dynamic imports triggered when a theme is activated.

## 2. Launch Themes

### Theme A: Aurora Flow
- Inspired by mockup #1.  
- **Palette**: Midnight navy base, teal→violet gradient overlays, cyan accent glows.  
- **Surface Treatments**: Glassy cards with pulse border when due dates near; animated gradient header.  
- **Unique Touches**: Status beams on column edges, AI action button with aurora flare.  
- **Use Cases**: Creative professionals, tech teams wanting energizing UI.

### Theme B: Calm Workbench
- Inspired by mockup #6.  
- **Palette**: Bone, warm greige, charcoal text, brass accents.  
- **Surface Treatments**: Subtle elevation, corner-fold indicators for priority, serif headings, minimal shadows.  
- **Unique Touches**: Executive summary bar at top, quiet animation scheme.  
- **Use Cases**: Leadership dashboards, operations teams preferring low-key aesthetics.

### Theme C (Optional Beta): Command Center
- Inspired by mockup #7. Launch as beta behind flag.  
- Neon edges, command palette integration, data-heavy overlays.

## 3. Implementation Phases

| Phase | Duration | Objectives | Deliverables |
| --- | --- | --- | --- |
| **Phase 0 – Prep** | Week 0.5 | Inventory existing styles, flag hard-coded values, plan token migration. | Style audit doc, token naming spec. |
| **Phase 1 – Tokenization** | Weeks 1–2 | Introduce CSS variable tokens, update Tailwind config, refactor shared components. | Tokenized `TaskCard`, `MainLayout`, `BoardColumn`. |
| **Phase 2 – Theme Infrastructure** | Weeks 3–4 | Implement theme registry, provider updates, persistence (localStorage) + deep links. | `ThemeProvider` enhancements, `useTheme` hook, settings UI skeleton. |
| **Phase 3 – Theme Builds** | Weeks 5–6 | Apply Aurora Flow and Calm Workbench tokens. Build QA stories in Storybook, cross-browser test. | Style sheets, Storybook scenes, Playwright snapshots. |
| **Phase 4 – Beta & Command Center** | Weeks 7–8 | Release to beta cohort, capture telemetry, polish. Optionally enable Command Center theme flag. | Beta feedback report, iteration backlog, optional theme flag release. |
| **Phase 5 – GA Launch** | Week 9 | Marketing rollout, onboarding update, docs refresh. | Landing updates, in-app announcements, README + THEMES_ROADMAP notes. |

## 4. Integration Checklist

- ✅ Mockup gallery (`/mockups`) for reference.  
- ❑ Add design tokens to Tailwind config.  
- ❑ Build theme registry & provider update.  
- ❑ Refactor board components to use tokens.  
- ❑ Implement theme switcher UI in settings + quick palette button on board header.  
- ❑ Snapshot & visual diff tests for each theme.  
- ❑ Marketing/update docs (README, onboarding screens).

## 5. Next Steps

1. **Token Specification Workshop** – finalize naming + values with design.  
2. **Kickoff Task Tickets** – break phases into Jira/Linear tasks (token migration, provider, theme-specific styling).  
3. **Begin Phase 1** – refactor `TaskCard` styles to draw from CSS variables; commit to branch `feature/theme-tokens`.
