# Proposal: Critical Path Tests

## Intent

App.tsx has ~800 lines with 25+ useState hooks and 5 localStorage effect pairs. Before refactoring to Zustand, we need a test safety net that validates current behavior. Without it, every migration change risks silent breakage with no regression detection.

## Scope

### In Scope
- Settings persistence: save → reload → verify roundtrip for AIConfig, GeneralSettings, MagicFormats, sidebar/dashboard state
- AI Orchestrator: provider priority ordering, circuit breaker fallback on all-fail, config-based initialization
- History management: add entry, toggle pin, delete entry, localStorage load/save
- Magic Format: text transformation pipeline, prompt construction, default formats

### Out of Scope
- App.tsx component/DOM rendering tests — too coupled, would break in migration
- UI integration tests — deferred to after Zustand migration
- MediaRecorder / Web Speech API — browser APIs, not unit-testable
- Audio visualizer or canvas logic — visual, not critical path
- Provider-specific API call logic — tested via mock at the orchestrator boundary

## Capabilities

### New Capabilities
- `settings-persistence`: Roundtrip save/load for all localStorage-backed settings structures
- `ai-orchestrator`: Provider priority, circuit breaker fallback, error aggregation
- `history-management`: CRUD operations on TranscriptionResult entries with localStorage sync
- `magic-format`: Text transformation pipeline, prompt construction, format selection

### Modified Capabilities
None — no existing specs describe these behaviors.

## Approach

Unit tests at pure-logic layers, mock at IO boundaries:

- **Settings**: Extract default factory functions. Test serialize → write → read → deserialize roundtrip via mock localStorage. Test defaults match expected shape.
- **AI Orchestrator**: Mock `AIProvider` interface. Test providers tried in priority order, failure cascades to next, all-fail throws expected error. No real API calls.
- **History**: Pure array operations — add, remove, toggle pin, sort by timestamp. Mock localStorage for persistence layer.
- **Magic Format**: Test prompt construction, default format existence/structure, format selection by ID.

Files in `src/test/`, one per suite. No new dependencies required.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/test/settings.test.ts` | New | Settings persistence roundtrip |
| `src/test/orchestrator.test.ts` | New | AIOrchestrator fallback logic |
| `src/test/history.test.ts` | New | History CRUD operations |
| `src/test/magic-format.test.ts` | New | Magic Format pipeline |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `import.meta.env` mocking requires vitest config | Low | Already handled via `define` in vite.config.ts |
| AIOrchestrator instantiates providers in constructor | Medium | Parametrize constructor or test with mock provider instances |
| localStorage leaks between tests | Low | `beforeEach` cleanup + `vi.stubGlobal` per suite |

## Rollback Plan

Delete the 4 test files from `src/test/`. No production code is touched — zero-risk rollback.

## Dependencies

- Vitest + jsdom + @testing-library/react (already installed)
- No new npm packages

## Success Criteria

- [ ] `pnpm test` reports PASS for all 4 suites
- [ ] Each suite covers: happy path, edge case, error state
- [ ] Tests reference behavior, not React implementation — survive Zustand migration
