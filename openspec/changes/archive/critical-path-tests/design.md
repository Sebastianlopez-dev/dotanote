# Design: Critical Path Tests

## Technical Approach

Extract pure logic from App.tsx into standalone modules so tests import behavior, not React. Mock at IO boundaries: localStorage and AIProvider. One test file per domain suite under `src/test/`.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|----------|---------|-----------|--------|
| **Where to put pure logic** | `src/lib/` | Keeps utils close; no React imports | `src/lib/` |
| **AIOrchestrator testability** | Add `createProviders` constructor overload | Minimal refactor, preserves existing usage | Constructor accepts optional `providerFactories` map |
| **localStorage mocking** | `vi.stubGlobal` per suite | Simple, no wrapper needed | `vi.stubGlobal('localStorage', mockStorage)` |
| **Test factories** | Shared `src/test/factories.ts` | Reusable, avoids duplication | Dedicated factories file |
| **Orchestrator provider instantiation** | Factory injection vs instance injection | Factories keep test setup simple; instances require more boilerplate | Factory injection via `createProviders?: (config) => AIProvider[]` |

## Data Flow

```
Test Suite
  ├── factories.ts → generates test data (AIConfig, TranscriptionResult, etc.)
  ├── mock localStorage → stubbed via vi.stubGlobal
  ├── mock AIProvider → plain object implementing interface
  └── production code (pure logic only) → assertions
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/test/factories.ts` | Create | Reusable test data builders |
| `src/test/settings.test.ts` | Create | localStorage roundtrip for AIConfig, GeneralSettings, MagicFormats, UI state |
| `src/test/orchestrator.test.ts` | Create | Provider priority, fallback, error aggregation |
| `src/test/history.test.ts` | Create | CRUD ops, sorting, persistence, clear |
| `src/test/magic-format.test.ts` | Create | Default formats, selection by ID, prompt forwarding |
| `src/lib/settings.ts` | Create | Factory functions for default settings (extracted from App.tsx) |
| `src/lib/history.ts` | Create | Pure history array helpers (add, delete, togglePin, sort) |
| `src/lib/magic-format.ts` | Create | Pure format selection logic (find by ID, find default) |
| `src/services/AIOrchestrator.ts` | Modify | Add optional `providerFactories` parameter for DI |
| `src/test/setup.ts` | Modify | Add `beforeEach` cleanup to wipe localStorage and mocks |

## Interfaces / Contracts

```typescript
// src/services/AIOrchestrator.ts — optional injection
export class AIOrchestrator {
  constructor(
    config: AIConfig,
    factories?: {
      createTranscribeProviders?: (config: AIConfig) => AIProvider[];
      createEnhanceProviders?: (config: AIConfig) => AIProvider[];
    }
  )
}

// src/lib/settings.ts
export function createDefaultAIConfig(): AIConfig;
export function createDefaultGeneralSettings(): GeneralSettings;
export function createDefaultMagicFormats(): MagicFormat[];

// src/lib/history.ts
export function addHistoryEntry(history: TranscriptionResult[], text: string, metadata?: ModelMetadata): TranscriptionResult[];
export function deleteHistoryEntry(history: TranscriptionResult[], id: string): TranscriptionResult[];
export function togglePin(history: TranscriptionResult[], id: string): TranscriptionResult[];
export function sortHistory(history: TranscriptionResult[]): TranscriptionResult[];

// src/lib/magic-format.ts
export function findFormatById(formats: MagicFormat[], id?: string): MagicFormat;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Settings factories, history CRUD, format selection | Direct function calls, assert return values |
| Unit | AIOrchestrator priority + fallback | Inject mock factories, assert call order and results |
| Integration | localStorage roundtrip | Write via `mockStorage.setItem`, read back, assert equality |
| E2E | None | Out of scope — deferred to post-Zustand migration |

## Migration / Rollout

No migration required. Tests are additive. Production code refactor is minimal (extract pure functions, add optional DI parameter). Existing behavior is preserved.

## Open Questions

- [ ] Should we also test the `import.meta.env` fallback logic in AIOrchestrator, or is that covered by the integration test suite later? (Decision: skip for now — unit tests mock factories; env fallback is build-time concern.)
- [ ] Should `handleEnhance` lifecycle be tested in `history.test.ts` or `magic-format.test.ts`? (Decision: test in `magic-format.test.ts` — it covers the full pipeline from format selection to state update.)