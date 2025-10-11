# Repository Guidelines

## Project Structure & Module Organization
TodoNex runs on Next.js 15 App Router. Core routes live in `src/app`. Shared UI sits in `src/components` (`features`, `ui`, `layout`, `providers`). Supporting logic is in `src/hooks`, `src/lib`, `src/store`, and `src/types`, with design tokens in `src/styles`. Static assets stay in `public/`. Playwright suites and baselines live under `tests/` and `tests/screenshots`. Keep `check-env.js` and `env-debug-test.js` local-only.

## Build, Test, and Development Commands
- `npm run dev` – Start the dev server on port 3000.
- `npm run dev:turbopack` – Turbopack mode for fast UI edits.
- `npm run build` / `npm run start` – Create and verify a production build.
- `npm run lint` – Apply `eslint.config.mjs`.
- `npm run test` / `npm run test:ui` – Run Playwright headless or with the inspector.
- `npm run firebase:deploy:rules` – Publish Firestore and Storage rules.

## Coding Style & Naming Conventions
Write TypeScript React components with ESM imports and `@/` aliases. Use `PascalCase` for components, hooks, and Zustand stores; keep `src/app` folders aligned with their route (e.g., `tasks/page.tsx`). Favor shared Tailwind variants before adding new utility stacks, stick to two-space indentation, stay under ~100 characters, and run `npm run lint` before commits.

## Testing Guidelines
Playwright specs live in `tests/*.spec.ts`; organize them around user journeys. Use `test.step` for readable reports and refresh baselines with `npx playwright test --update-snapshots` when UI changes are intentional—reference diffs in the PR. Every feature needs a happy-path E2E plus a guard for auth or theme regressions.

## Commit & Pull Request Guidelines
Write concise, present-tense commits (e.g., `Add inline editing for task fields`) and avoid bundling unrelated changes. PRs need a summary, test checklist (`npm run lint`, `npm run test`), linked context, and updated screenshots or GIFs for UI shifts in both themes. Request platform-team review before merging.

## Security & Configuration Tips
Keep Firebase secrets in `.env.local`. After touching `firestore.rules` or `storage.rules`, run `npm run firebase:deploy:rules` against staging before production. Validate envs with `node check-env.js` ahead of Playwright runs and drop temporary debug scripts or HTML playgrounds before opening a PR.
