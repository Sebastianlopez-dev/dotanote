# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> For detailed project history, features, and design rules, read `AGENTS.md` first — it is the authoritative project memory.

---

## Commands

```bash
npm run dev        # Start dev server on port 3000 (http://localhost:3000)
npm run build      # Production build (outputs to dist/)
npm run lint       # TypeScript type-check only (tsc --noEmit) — no ESLint configured
npm run preview    # Preview production build locally
npm run clean      # Delete dist/
```

**Environment setup:** Copy `.env.local` and set:
```
GEMINI_API_KEY=...
GROQ_API_KEY=...
```
API keys are injected at build time via `vite.config.ts` using `define`. They are exposed in the frontend bundle — this is intentional for the current personal-tool model (see `implementation_plan2026.04.11.md` Phase 1 for the production security decision).

---

## Architecture

**Stack:** React 19 + TypeScript + Vite 6 + Tailwind CSS v4 (via `@tailwindcss/vite`) + `motion` (Framer Motion v12)

### State management
All application state lives in `src/App.tsx`. There is no external state manager (no Redux, Zustand, etc.). `App.tsx` is the single source of truth and passes props/callbacks down to all components.

### AI layer
```
src/services/
  AIOrchestrator.ts      — Circuit breaker: iterates providers in priority order,
                           returns first success, falls back on error
  transcription.ts       — LocalTranscriber (Web Speech API fallback)
  providers/
    GeminiProvider.ts    — Transcription + enhancement via @google/genai
    GroqProvider.ts      — Transcription via Whisper (primary when key available)
    AnthropicProvider.ts — Enhancement only (requires custom key)
    QwenProvider.ts      — Enhancement only (requires custom key)
    OpenRouterProvider.ts— Enhancement only (requires custom key)
```

**Transcription priority:** Groq → Gemini → Local (Web Speech API)  
**Enhancement priority:** Claude → Qwen → Gemini → Groq → OpenRouter

All providers implement the `AIProvider` interface from `src/types.ts`. Every result returns `{ text, metadata: ModelMetadata }` including the model/provider name for telemetry.

### Key types (`src/types.ts`)
- `AIProvider` — interface all providers implement
- `AIConfig` — which keys/models are active
- `MagicFormat` — user-defined AI enhancement prompts (stored in `localStorage`)
- `AudioSettings` / `GeneralSettings` — persisted to `localStorage`
- `ModelMetadata` — tracks which model generated each result

### Components
```
src/components/
  Sidebar.tsx        — Collapsible left nav; icons 18px (nav), 16px (actions), 14px (indicators)
  TranscriptFeed.tsx — Scrollable list of transcription results with copy/delete/enhance
  StatsDashboard.tsx — Metrics panel (toggled by Cmd+L)
  Settings.tsx       — Modal settings (General, Audio, AI, Shortcuts, Account)
  Toast.tsx          — Toast notification system
```

### Design system (enforced)
- **Background:** `#0a0a0a` with glassmorphism (`backdrop-blur`) overlays
- **Typography:** `-apple-system` / SF Pro Display for UI; JetBrains Mono for technical data
- **Animations:** Always use `motion` from `motion/react` — never raw CSS transitions for state changes
- **Icons:** Always `lucide-react`. Sizes: nav=18px, actions=16px, indicators=14px
- **Utilities:** `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge)

### Default hotkeys
| Shortcut | Action |
|---|---|
| `Ctrl + Space` | Toggle recording |
| `Cmd/Ctrl + J` | Toggle sidebar |
| `Cmd/Ctrl + L` | Toggle dashboard |
| `Cmd/Ctrl + K` | Focus mode |
| `Alt + Z` | Push-to-talk |

### Path alias
`@` resolves to the project root (e.g., `import { cn } from "@/src/lib/utils"`).
