# Tasks: Critical Path Tests

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350-500 (3 new `src/lib/` modules, 4 test files, 1 modified `AIOrchestrator`, 1 modified `setup.ts`, 1 modified `App.tsx`) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: settings.ts + settings.test.ts. PR 2: history.ts + history.test.ts. PR 3: magic-format.ts + magic-format.test.ts. PR 4: AIOrchestrator DI + orchestrator.test.ts. |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Settings persistence suite | PR 1 | `src/lib/settings.ts` + `src/test/settings.test.ts`; independent, no DI required |
| 2 | History CRUD suite | PR 2 | `src/lib/history.ts` + `src/test/history.test.ts`; independent |
| 3 | Magic Format suite | PR 3 | `src/lib/magic-format.ts` + `src/test/magic-format.test.ts`; independent |
| 4 | AI Orchestrator suite | PR 4 | `AIOrchestrator` DI param + `src/test/orchestrator.test.ts`; depends on no other unit, but modifies existing service |

## Phase 1: Foundation — Extract Pure Logic from App.tsx

- [ ] 1.1 Create `src/lib/settings.ts` exporting `createDefaultAIConfig()`, `createDefaultGeneralSettings()`, `createDefaultMagicFormats()`, `loadAIConfig()`, `loadGeneralSettings()`, `loadMagicFormats()` — behavior-preserving extraction from `App.tsx` lines 102-164
- [ ] 1.2 Create `src/lib/history.ts` exporting `addHistoryEntry`, `deleteHistoryEntry`, `togglePin`, `sortHistory`, `loadHistory`, `saveHistory`, `clearHistory` — pure functions, no React, `localStorage` only at the load/save boundary (extracted from `App.tsx` lines 267-280)
- [ ] 1.3 Create `src/lib/magic-format.ts` exporting `findFormatById`, `getDefaultFormat`, `DEFAULT_FORMATS` constant — pure selection logic, no `localStorage` access (extracted from App.tsx magic-format handling)
- [ ] 1.4 Update `App.tsx` to import and call the new `src/lib/` functions instead of inline `localStorage.getItem/setItem` blocks; verify `pnpm dev` still renders and persists correctly

## Phase 2: AI Orchestrator Dependency Injection

- [ ] 2.1 Modify `src/services/AIOrchestrator.ts` constructor to accept optional second arg `factories?: { createTranscribeProviders?: (config: AIConfig) => AIProvider[]; createEnhanceProviders?: (config: AIConfig) => AIProvider[] }` — default behavior unchanged when omitted
- [ ] 2.2 Refactor `AIOrchestrator` internal provider construction to use injected factories when present, else fall back to current `createTranscribeProviders(config)` / `createEnhanceProviders(config)` call sites
- [ ] 2.3 Verify existing `App.tsx` usage (`new AIOrchestrator(aiConfig)`) still works without modification — run `pnpm dev` and `pnpm build`

## Phase 3: Test Infrastructure

- [ ] 3.1 Create `src/test/factories.ts` exporting `createMockAIProvider(overrides?)`, `createMockAIConfig(overrides?)`, `createMockTranscriptionResult(overrides?)`, `createMockMagicFormat(overrides?)`, `createMockGeneralSettings(overrides?)` — plain-object factories, no class instantiation
- [ ] 3.2 Update `src/test/setup.ts` to add `beforeEach` that calls `vi.unstubAllGlobals()` and resets the in-memory `localStorage` mock between tests

## Phase 4: Write Test Suites (RED → GREEN)

- [ ] 4.1 Write `src/test/settings.test.ts` — cover `settings-persistence` spec: AIConfig roundtrip (custom keys, missing key → default, malformed JSON), GeneralSettings roundtrip, MagicFormats 4-default + custom survival, UI state (`sidebarOpen` / `dashboardOpen` boolean-derived strings)
- [ ] 4.2 Write `src/test/history.test.ts` — cover `history-management` spec: add prepends with unique id + timestamp, delete by id is no-op-safe, togglePin twice returns to original, pinned-first then timestamp-desc sort, `vozia-history` roundtrip, corrupted JSON → `[]`, clear replaces with `[]`
- [ ] 4.3 Write `src/test/magic-format.test.ts` — cover `magic-format` spec: 4 defaults exist with Executive `isDefault: true` AND `isPinned: true`, every default has non-empty `id`/`name`/`prompt`, `findFormatById` returns match, missing id falls back to default, `enhance()` receives `customPrompt` equal to selected format prompt, lifecycle sets `isEnhancing: true` then stores `enhancedText`
- [ ] 4.4 Write `src/test/orchestrator.test.ts` — cover `ai-orchestrator` spec using injected `factories`: full transcribe list `[Groq, Gemini]`, skipped provider when key absent, enhance chain `[Claude, Qwen, Gemini, Groq, OpenRouter]`, first-success short-circuits, first-fail-second-succeeds, all-fail throws LAST error, empty list throws descriptive error
- [ ] 4.5 Run `pnpm test` and verify all 4 suites pass with 0 failures and 0 unhandled errors

## Phase 5: Integration Verification

- [ ] 5.1 Run `pnpm dev` and manually verify: settings persist across reload, history persists, sidebar/dashboard toggles persist, transcription still works end-to-end, magic-format enhancement still produces enhanced text
- [ ] 5.2 Run `pnpm build` to confirm production bundle compiles with the new `src/lib/` imports and `AIOrchestrator` DI signature
- [ ] 5.3 Run `pnpm test` final pass — confirm green and that tests are implementation-agnostic (no React imports, no DOM rendering, no real API calls)
