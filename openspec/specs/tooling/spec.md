# Development Tooling Specification

## Purpose

Define the foundational developer infrastructure — version control, code quality, formatting, and test tooling — with strict guarantees that existing UI/UX is never altered.

## Requirements

### Requirement: Version Control Foundation

The project MUST be initialized as a Git repository on branch `main` with remote `origin` pointing to `github.com/Sebastianlopez-dev/dotanote.git`. Sensitive and generated files MUST be excluded via `.gitignore`.

#### Scenario: Repository initialized

- GIVEN the project directory
- WHEN `git init -b main` is executed
- THEN a `.git` directory exists with `main` as the active branch

#### Scenario: Remote configured

- GIVEN an initialized Git repository
- WHEN `git remote add origin` is executed
- THEN `git remote -v` shows `origin` pointing to `github.com/Sebastianlopez-dev/dotanote.git`

#### Scenario: Sensitive files excluded

- GIVEN a `.gitignore` file
- WHEN checking tracked exclusions
- THEN `node_modules/`, `dist/`, `.env*`, and `coverage/` MUST be listed

### Requirement: Code Linting

A flat ESLint config MUST be added with TypeScript rules (`typescript-eslint`). All rules MUST default to `warn` severity — no `error` rules.

#### Scenario: Lint passes on existing code

- GIVEN the current codebase
- WHEN `npm run lint` is executed
- THEN it exits with code 0 (zero errors, warnings allowed)

#### Scenario: Type-aware rules active

- GIVEN a TypeScript file with a type error
- WHEN `npm run lint` is executed
- THEN the file's type error is reported as a warning

### Requirement: Code Formatting

Prettier MUST be configured with `semi`, `singleQuote`, `trailingComma: "es5"`, `printWidth: 100`. It MUST NOT reorder or modify Tailwind CSS class ordering.

#### Scenario: Format produces no unstaged changes

- GIVEN a formatted codebase
- WHEN `npm run format` is executed
- THEN `git diff` shows zero unstaged changes

#### Scenario: Tailwind class order preserved

- GIVEN a file with `class="bg-black text-white p-4"`
- WHEN Prettier formats the file
- THEN the class attribute remains `bg-black text-white p-4` unchanged

### Requirement: Test Infrastructure

Vitest MUST be configured with `jsdom` environment and `@testing-library/react` for component testing. `vite.config.ts` MUST be extended with a `test` block that reuses existing `resolve.alias`.

#### Scenario: Tests execute

- GIVEN a passing test file
- WHEN `npm run test` is executed
- THEN Vitest runs and reports PASS

#### Scenario: Path alias resolved in tests

- GIVEN a test that imports `@/src/App`
- WHEN the test executes
- THEN the `@` alias resolves correctly via `vite.config.ts`

### Requirement: UI Non-Regression

Tooling MUST NOT alter, break, or degrade the existing visual UI. No config files, rules, or auto-fixes SHALL modify `src/` UI components.

#### Scenario: No CSS or JS changes from tooling

- GIVEN the existing UI components
- WHEN linting and formatting are run
- THEN all `.tsx`, `.css`, `.js` files in `src/` remain byte-identical

#### Scenario: Lint rules silent on legitimate patterns

- GIVEN a Tailwind class like `backdrop-blur-xl` or a lucide-react icon import
- WHEN `npm run lint` is executed
- THEN no warnings are raised for valid framework patterns

### Requirement: npm Script Targets

The project SHALL expose scripts: `lint`, `format`, `test`, `test:watch`, and `type-check`.

#### Scenario: All scripts resolve

- GIVEN the installed project
- WHEN `npm run <script>` is called for each target
- THEN each script executes without throwing "missing script" errors
