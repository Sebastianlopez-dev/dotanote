# dotanote

A high-performance, minimalist voice transcription tool built for professionals. Dark luxury aesthetic, hybrid AI engine, and keyboard-driven efficiency.

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Vite](https://img.shields.io/badge/Vite-6-646cff)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)
![Tests](https://img.shields.io/badge/tests-64%20passing-brightgreen)

---

## Features

### Transcription Engine
- **Hybrid model** — Gemini (high precision) or Web Speech API (local, offline-capable)
- **Dynamic capsule** — floating recording UI with real-time visualizer and language switching
- **Multi-language** — English, Spanish, French, Portuguese, and auto-detection

### Magic Format
- **One-click enhancement** — transform raw transcripts into structured notes, summaries, or business messages
- **Smart formatting** — filler word removal, grammar correction, bullet-point structuring
- **Auto-copy** — enhanced output copied to clipboard automatically

### Audio Pipeline
- **Real-time monitoring** — hear your own voice while recording
- **Hardware controls** — noise suppression and automatic gain control (AGC) toggles
- **Device management** — dynamic mic/speaker selection
- **Frequency visualizer** — real-time audio spectrum in the recording capsule

### AI Backend
- **AI Orchestrator** — centralized provider management with circuit breaker pattern
- **Automatic failover** — if the primary provider fails, the next one takes over seamlessly
- **Multi-model support** — plug in Gemini, Groq, OpenRouter, or custom providers
- **Metadata telemetry** — every transcription tracks which model and provider generated it

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Space` | Toggle recording |
| `Cmd/Ctrl + J` | Toggle sidebar |
| `Cmd/Ctrl + L` | Toggle stats dashboard |
| `Cmd/Ctrl + K` | Focus mode (hide all panels) |
| `Alt + Z` | Push-to-talk |

### Design System
- **Aesthetic** — Dark luxury / technical tool. Background `#0a0a0a` with glassmorphism overlays
- **Typography** — Apple system fonts for UI, JetBrains Mono for technical data
- **Icons** — lucide-react (18px nav, 16px actions, 14px indicators)
- **Animations** — Framer Motion for all transitions
- **Mobile-ready** — safe-area-inset aware, hidden scrollbars for Capacitor/iOS

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js, TypeScript 5.8 |
| Framework | React 19 + Vite 6 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Icons | lucide-react |
| Package manager | pnpm |
| Testing | Vitest + Testing Library + jsdom |
| Linting | ESLint (flat config, TypeScript-aware) |
| Formatting | Prettier |

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (install via `npm install -g pnpm`)

### Setup

```bash
# Clone the repo
git clone https://github.com/Sebastianlopez-dev/dotanote.git
cd dotanote

# Install dependencies
pnpm install

# Set your Gemini API key
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Start the dev server
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | TypeScript type checking |

---

## Project Structure

```
src/
├── App.tsx              # Main application component
├── main.tsx             # Entry point
├── types.ts             # Shared TypeScript interfaces
├── components/          # React components
├── services/            # Business logic
│   ├── AIOrchestrator.ts    # AI provider management with circuit breaker
│   ├── transcription.ts     # Transcription engine
│   └── providers/           # AI provider implementations
├── lib/                 # Pure logic (extracted for testability)
│   ├── settings.ts          # Settings factories and persistence
│   ├── history.ts           # History CRUD operations
│   └── magic-format.ts      # Format selection and prompts
└── test/                # Test suites
    ├── settings.test.ts     # Settings persistence (19 tests)
    ├── history.test.ts      # History management (16 tests)
    ├── magic-format.test.ts # Magic format pipeline (17 tests)
    ├── orchestrator.test.ts # AI Orchestrator fallback (12 tests)
    └── setup.ts             # Vitest setup
```

---

## Architecture

dotanote follows a **service-layer architecture** with a central AI Orchestrator managing multiple provider implementations through a shared `AIProvider` interface. State is currently centralized in `App.tsx`, with a planned migration to Zustand.

### AI Provider Pattern

```
AIOrchestrator
  ├── prioritize(providers) → ordered by config
  ├── transcribe(audio) → try each provider, failover on error
  └── enhance(text)    → try each provider, aggregate errors
       │
       ├── GeminiProvider   (implements AIProvider)
       ├── GroqProvider      (implements AIProvider)
       └── ...custom providers
```

---

## License

MIT
