# Proposal: Git Init & Tooling Foundation

## Intent

No version control, no linter beyond `tsc`, no formatter, zero test infra. Without these, professional development is impossible — no history, no code quality enforcement, no regression safety. This change builds the foundation for dotanote to evolve from AI Studio prototype to production-ready product.

## Scope

### In Scope
- Git init with `main` branch connected to `github.com/Sebastianlopez-dev/dotanote.git`
- ESLint flat config with TypeScript rules (typescript-eslint)
- Prettier for consistent formatting
- Vitest + @testing-library/react + jsdom for unit/integration tests
- npm scripts: lint, format, test, type-check

### Out of Scope
- CI/CD (GitHub Actions) — deferred
- Husky / lint-staged / pre-commit hooks — deferred
- Coverage thresholds — deferred
- E2E testing (Playwright/Cypress) — deferred

## Capabilities

### New Capabilities
None — this is development infrastructure, not user-facing functionality.

### Modified Capabilities
None — no existing specs to modify.

## Approach

**Git**: `git init -b main` → `.gitignore` (node, dist, .env) → initial commit → `git remote add origin` → push (user must auth).

**ESLint**: Install `eslint @eslint/js typescript-eslint eslint-plugin-react-hooks` → flat config `eslint.config.js` with TS parser + React plugin + typed lint rules. Script: `"lint": "eslint src/"`.

**Prettier**: Install `prettier eslint-config-prettier` → `.prettierrc` (semi, singleQuote, trailingComma es5, printWidth 100). Script: `"format": "prettier --write src/"`.

**Vitest**: Install `vitest @testing-library/react @testing-library/jest-dom jsdom` → merge `test: { environment: "jsdom", globals: true, setupFiles: "./src/test/setup.ts" }` into `vite.config.ts` → create `src/test/setup.ts`. Scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | New scripts + devDependencies |
| `vite.config.ts` | Modified | Add `test` config block |
| `eslint.config.js` | New | Flat config with TS rules |
| `.prettierrc` | New | Prettier formatting config |
| `.gitignore` | New | Node, dist, env ignores |
| `src/test/setup.ts` | New | Vitest setup file |
| `.git/` | New | Git repository |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| ESLint strict rules flag many existing files | Medium | Use `warn` first, escalate to `error` in follow-up |
| ESLint / Prettier rule conflicts | Low | eslint-config-prettier disables formatting rules in ESLint |
| Vitest config conflicts with Vite alias | Low | Reuse existing `resolve.alias` in test config |

## Rollback Plan

1. **Git**: `rm -rf .git` restores unversioned state
2. **Packages**: `npm uninstall` all added devDeps + revert `package.json` scripts
3. **Files**: Delete `eslint.config.js`, `.prettierrc`, `.gitignore`, `src/test/`, revert `vite.config.ts`

## Dependencies

- Node 18+ (already met)
- React 19 + TypeScript 5.8 (already installed)

## Success Criteria

- [ ] `git log` shows initial commit on `main`
- [ ] `npm run lint` passes with zero errors on existing codebase
- [ ] `npm run format` produces no unstaged changes (already formatted)
- [ ] `npm run test` runs and reports PASS
- [ ] Remote push succeeds to `github.com/Sebastianlopez-dev/dotanote.git`
