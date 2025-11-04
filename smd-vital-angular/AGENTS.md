# Repository Guidelines

## Project Structure & Module Organization
- Angular sources live in `src/app`, organized by feature modules under `app/modules`, with shared utilities in `app/shared`. Keep UI assets in `src/assets` and configuration in `src/environments`. Build artifacts land in `dist/`, and custom automation such as `dev-server.ps1` sits at the repo root.

## Build, Test, and Development Commands
- `npm start`: runs `ng serve` on port 3001 with the dev proxy. Use during active feature work.
- `npm run build`: produces a production-ready bundle in `dist/`.
- `npm run build:prod`: runs the Angular production build configuration; gate releases with this.
- `npm test`: executes Karma/Jasmine unit tests in watch mode.
- `npm run test:ci`: headless test run for CI pipelines.
- `npm run lint`: enforces Angular CLI lint rules; fix all warnings before opening a PR.

## Coding Style & Naming Conventions
- Follow Angular style guide: use PascalCase for components (`PatientDashboardComponent`), camelCase for services and methods, and kebab-case for folders and SCSS files.
- Use two-space indentation in TypeScript/HTML, keep SCSS consistent with existing files.
- Prefer standalone Angular components unless a shared module already exists; reuse selectors beginning with `app-`.
- Run `npm run lint` after major edits; format with the Angular ESLint fixer when available (`ng lint --fix`).

## Testing Guidelines
- Write unit tests with Jasmine/Karma; place specs next to implementation (`*.spec.ts`).
- Aim to touch meaningful user paths; keep coverage above the current baseline reflected in CI.
- For integration flows, coordinate with `test-login.js` Playwright harness before modifying login screens.
- Name tests with scenario-driven descriptions (`should display vitals chart when data loads`).

## Commit & Pull Request Guidelines
- Model commit messages after existing history: short imperative subject (`Add vitals trend helper`) with optional body for context.
- Keep commits scoped; separate lint-only fixes from feature work.
- PRs should include: concise summary, screenshots for UI changes, linked Azure DevOps or GitHub issue IDs, and notes on test commands executed.
- Request review from module owners in `src/app`, and ensure branch passes `npm run build:prod` and `npm run test:ci` before marking ready.

## Environment & Configuration Tips
- Use `proxy.conf.json` for local API wiring; update `proxy.conf.dev.json` only when backend endpoints shift.
- Environment-specific URLs live in `src/environments`. Never hardcode secrets; use `.env` files injected at build time if needed.
