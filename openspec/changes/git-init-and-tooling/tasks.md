# Tasks: Git Init & Tooling Foundation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~80 config lines + 1 generated lockfile (lockfile excluded from review count) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation: git + pnpm + lint/format/test infra | PR 1 | All changes are co-dependent (tooling only works as a whole); no independent slice is meaningful. |

The change is a single coherent tooling boot. Splitting would break toolchain validation (lint needs prettier config, test needs vitest config, etc.). Single PR with linear commit history.

## Phase 1: Repository Bootstrap (R1)

- [ ] 1.1 `git init -b main` in project root; create `.gitignore` with `node_modules/`, `dist/`, `.env*`, `coverage/` (verify pre-existing entries are preserved).
- [ ] 1.2 `git remote add origin https://github.com/Sebastianlopez-dev/dotanote.git`; verify with `git remote -v` (Scenario: Repository initialized + Remote configured).

## Phase 2: pnpm Migration (R6 foundation)

- [ ] 2.1 Delete `node_modules/`, then run `pnpm install` to regenerate dependencies from `package.json`; verify `pnpm-lock.yaml` exists and `pnpm dev` starts cleanly.
- [ ] 2.2 After successful verification in 2.1, delete `package-lock.json`; confirm only `pnpm-lock.yaml` remains (do NOT delete if `pnpm dev` failed).

## Phase 3: Tooling Configuration (R2, R3, R4)

- [ ] 3.1 `pnpm add -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier globals prettier vitest @testing-library/react @testing-library/jest-dom jsdom` (installs all 12 devDeps in one step).
- [ ] 3.2 Create `.prettierrc` with `semi: true`, `singleQuote: true`, `trailingComma: "es5"`, `printWidth: 100` (Scenario: Tailwind class order preserved — no `prettier-plugin-tailwindcss`).
- [ ] 3.3 Create `eslint.config.js` with flat config including `downgradeToWarn()` helper and `prettier` last to disable formatting rules (Scenarios: Lint passes, Type-aware rules active, Lint rules silent on legitimate patterns).
- [ ] 3.4 Create `src/test/setup.ts` importing `@testing-library/jest-dom`; merge `test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.ts' }` into `vite.config.ts` reusing existing `resolve.alias`.
- [ ] 3.5 Update `package.json` `scripts` to: `lint: "eslint src/"`, `format: "prettier --write src/"`, `test: "vitest run"`, `test:watch: "vitest"`, `type-check: "tsc --noEmit"` (Scenario: All scripts resolve).

## Phase 4: One-Time Format Pass with UI Protection (R5)

- [ ] 4.1 `git status` → record baseline; run `pnpm format` once to normalize quote style; `git diff src/` MUST show ONLY quote character changes in `.ts`/`.tsx`/`.css`/`.js` files. No Tailwind class reordering, no structural rewrites. If any non-quote change appears, `git checkout -- src/` and stop (Scenario: No CSS or JS changes from tooling).
- [ ] 4.2 Re-run `pnpm format`; `git diff` MUST show zero unstaged changes (idempotency proof) (Scenario: Format produces no unstaged changes).

## Phase 5: Verification & Remote Push (R2-R6)

- [ ] 5.1 Run `pnpm lint` (exit 0 required), `pnpm test` (Vitest reports PASS, even with no tests), `pnpm type-check` (exit 0); all three MUST pass with zero errors (Scenarios: Lint passes on existing code, Tests execute, Type-aware rules active).
- [ ] 5.2 `git add -A && git commit -m "chore: init git and tooling foundation with pnpm"`; verify commit lands on `main`; `git push -u origin main` to seed `github.com/Sebastianlopez-dev/dotanote.git` (Success Criteria: initial commit on main, remote push succeeds).

## Spec Coverage Map

| Req | Covered by |
|-----|-----------|
| R1 Version Control | 1.1, 1.2 |
| R2 Code Linting | 3.1, 3.3, 5.1 |
| R3 All rules as `warn` | 3.3 (`downgradeToWarn` helper) |
| R4 Code Formatting | 3.2, 4.1, 4.2 |
| R5 UI Non-Regression | 4.1, 4.2 (byte-identical `src/` after format) |
| R6 Test Infrastructure | 3.1, 3.4, 5.1 |
