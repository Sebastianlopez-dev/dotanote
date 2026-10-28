# Feature: local-voice-dictation

On-device speech-to-text (Parakeet TDT 0.6B v3 + sherpa-onnx) for web, then desktop (macOS Intel + Windows, then Apple Silicon), with dictation into the focused field of any app.
Source of truth for this feature. OpenProject mirrors it via `node tools/openproject/sync.mjs`. Read until `## Log`.

## Specs

- **S1** Local model: "Reemplazar los modelos externos de voz a texto por un modelo que corra completamente en el dispositivo" — "Modelo: NVIDIA Parakeet TDT 0.6B v3 (cuantizado int8, exportado a ONNX)." — "Motor de ejecución: sherpa-onnx, con versiones para escritorio, Android, iOS y web." — "Licencia: CC-BY-4.0 para el modelo (se puede usar comercialmente si se cita a NVIDIA) y Apache-2.0 para sherpa-onnx."
- **S2** Gains: "Privacidad: la voz y los datos no salen del dispositivo." — "Costo cero por uso: no hay API keys ni suscripciones." — "Funciona sin conexión."
- **S3** Platforms: "La app debe servir primero para Windows, navegador y Mac (idealmente para Mac con Intel, que es el que yo tengo; después podemos hacer la integración para chip M). Podemos terminar de desarrollar todo en la web y luego hacer las integraciones a Windows y Mac."
- **S4** Dictation to cursor: "cuando la app esté abierta, la persona pueda apretar una tecla, hablar, y que el texto vaya directamente al campo donde esté puesto el cursor."
- **S5** Keep: "Lo que me gusta de lo que tenemos ahorita es el registro y que podemos usar el portapapeles para copiar cosas que se dijeron antes."
- **S6** Web model question: "No sé si podamos correr el modelo directo en la web para que funcione de una vez cuando alguien lo use ahí."
- **S7** Extra AI: "Para todas las funciones extra de IA (como el magic message y lo demás) creo que se va a necesitar una API."
- **S8** Keys: "Actualmente hay APIs expuestas: vamos a eliminarlas para que no queden filtradas en el código. Dejé una de Google visible para hacer pruebas cuando hice esto para mis profesores en el bootcamp, y es importante que ya no quede expuesta; cada vez que vaya a meter una API, la coloco yo mismo."
- **S9** Non-goals: "El usuario no tiene que llenar bases de datos desde la app, eso es parte de su trabajo." — "no tenemos que hacer los botones más grandes; ahorita me parece que todo está funcional. Primero enfoquémonos en que se pueda integrar bien con Mac, Windows y la web."
- **S10** Tracking: "crear un openproyect para hacer el tracking de como está la app ahora y cuales son los siguientes pasos a seguir" — "Quiero poder presentarlo paso a paso para cuando alguun reclutador me lo pida" — "prefiero tener el ODD + openproyect"

## Tasks

Format: `- [ ] <id> <task> | <S#> | <route> | commit: <sha or —>`

### Phase 0: Audit

- [x] 0.1 Locate every external model call (transcribe: Groq, Gemini; enhance: Claude, Qwen, Gemini, Groq, OpenRouter) | S1 | inline | commit: —
- [x] 0.2 Confirm platform (web-only SPA) | S3 | inline | commit: —
- [x] 0.3 Record findings: Web Speech mode is not local and unreachable; dictionary depends on prompts; `VITE_*` keys are inlined in the bundle | S1, S8 | inline | commit: —
- [x] 0.4 Scan working tree and full git history for real keys — none found (only `MY_*` placeholders) | S8 | inline | commit: —

### Phase 1: Remove bundled API keys

- [ ] 1.1 User action: revoke or rotate the Google key used for the bootcamp demo in Google Cloud Console | S8 | user | commit: —
- [ ] 1.2 Remove `VITE_*_API_KEY` fallbacks from `src/App.tsx` and `src/services/AIOrchestrator.ts`; providers use only keys entered in Settings | S8 | inline | commit: —
- [ ] 1.3 Remove unused `process.env.*_API_KEY` entries from `vite.config.ts` | S8 | inline | commit: —
- [ ] 1.4 Update `.env.example` and README: keys are entered in Settings, never in env files | S8 | inline | commit: —
- [ ] 1.5 Tests: orchestrator registers no cloud provider without a user key, even if env keys exist | S8 | inline | commit: —
- [ ] 1.6 Build check: `pnpm build` with a populated `.env.local`, then `grep` over `dist/` finds no key | S8 | inline | commit: —

### Phase 2: Spikes and decisions

- [x] 2.1 Record the exact Mac Intel model, CPU and RAM: Intel Core i7-9750H, 16 GB RAM | S3 | inline | commit: —
- [ ] 2.2 S1 spike — Parakeet in the browser on the Mac Intel: `parakeet.js` vs sherpa-onnx WASM (size, load time, memory, 30 s Spanish clip) | S1, S6 | spike | commit: —
- [ ] 2.3 S2 spike — `sherpa-onnx-node` on macOS Intel and Windows x64 (load time, real-time factor, memory) | S1, S3 | spike | commit: —
- [ ] 2.4 S3 spike — Hotword support for this model in sherpa-onnx (dictionary) | S1 | spike | commit: —
- [ ] 2.5 S4 spike — Electron prototype: global hotkey → record → paste into TextEdit/Notepad and a browser form | S4 | spike | commit: —
- [ ] 2.6 Close decisions D3–D7 in the Log | S1, S3, S4 | inline | commit: —

### Phase 3: Split transcription from enhancement

- [ ] 3.1 Introduce `TranscriptionEngine` and `EnhancementProvider` contracts in `src/types.ts` | S1, S7 | inline | commit: —
- [ ] 3.2 Adapt Groq and Gemini providers to the split contracts | S1, S7 | inline | commit: —
- [ ] 3.3 Update `AIOrchestrator` (behavior unchanged) and `src/test/orchestrator.test.ts` | S1, S7 | inline | commit: —
- [ ] 3.4 Document the new transcription priority (local first, cloud opt-in) in README | S1 | inline | commit: —

### Phase 4: Local engine on the web

- [ ] 4.1 16 kHz mono resampler in `src/lib/audio.ts` with unit tests | S1 | inline | commit: —
- [ ] 4.2 `WebParakeetEngine` in a Web Worker with model status and progress (runtime per D3) | S1, S6 | inline | commit: —
- [ ] 4.3 Model download and browser caching | S1, S2 | inline | commit: —
- [ ] 4.4 Local engine as default; cloud transcription opt-in in Settings | S1, S2, S7 | inline | commit: —
- [ ] 4.5 Route recordings and uploaded files through the local engine | S1 | inline | commit: —
- [ ] 4.6 Dictionary per D7 | S1 | inline | commit: —
- [ ] 4.7 Remove or relabel the Web Speech mode; fix the "Switch to Local mode" toast | S1, S2 | inline | commit: —
- [ ] 4.8 NVIDIA Parakeet CC-BY-4.0 attribution in Settings | S1 | inline | commit: —

### Phase 5: Desktop app — macOS Intel + Windows

- [ ] 5.1 Electron shell loading the existing React UI (dev + production builds) | S3 | inline | commit: —
- [ ] 5.2 `DesktopParakeetEngine`: IPC to the main process running `sherpa-onnx-node` | S1, S3 | inline | commit: —
- [ ] 5.3 Model download to the app data folder with progress | S1 | inline | commit: —
- [ ] 5.4 Global hotkey (toggle) that works while other apps are focused; configurable | S4 | inline | commit: —
- [ ] 5.5 Insert transcribed text at the cursor of the focused app (D5); also save to history and keep clipboard behavior | S4, S5 | inline | commit: —
- [ ] 5.6 macOS permission onboarding (Microphone, Accessibility) | S3, S4 | inline | commit: —
- [ ] 5.7 Store user API keys with `safeStorage` | S8 | inline | commit: —
- [ ] 5.8 Packaging: macOS x64 `.dmg`, Windows x64 installer | S3 | inline | commit: —

### Phase 6: Desktop app — macOS Apple Silicon

- [ ] 6.1 arm64 (or universal) build with the arm64 `sherpa-onnx-node` binary | S3 | inline | commit: —
- [ ] 6.2 Smoke test on an M-series Mac | S3 | user | commit: —

### Phase 7: Hardening and docs

- [ ] 7.1 Offline checks on web and desktop; no outbound requests during local transcription | S2 | inline | commit: —
- [ ] 7.2 Performance check on the Mac Intel and Windows | S3 | user | commit: —
- [ ] 7.3 README: setup, model download, desktop permissions, licenses | S1, S3 | inline | commit: —
- [ ] 7.4 Close the feature: all tasks checked, OpenProject synced | S10 | inline | commit: —

## Log

- **L1** (user, original request, verbatim):

  > Integrar dictado por voz local en la aplicación
  >
  > ### Por qué
  >
  > La aplicación busca que menos personas tengan que escribir a mano en sus tareas diarias. El caso que la motiva es el de una persona con artritis que, por su trabajo, completa bases de datos todos los días. Escribir le causa dolor y fatiga, y hablar no.
  >
  > Hoy la aplicación depende de modelos externos a los que accede con API keys. Esto trae costos por uso, necesita conexión a internet y envía los datos a terceros.
  >
  > ### Qué se propone
  >
  > Reemplazar los modelos externos de voz a texto por un modelo que corra completamente en el dispositivo:
  >
  > - Modelo: NVIDIA Parakeet TDT 0.6B v3 (cuantizado int8, exportado a ONNX).
  > - Motor de ejecución: sherpa-onnx, con versiones para escritorio, Android, iOS y web.
  > - Idiomas: multilingüe, con muy buen rendimiento en español.
  > - Licencia: CC-BY-4.0 para el modelo (se puede usar comercialmente si se cita a NVIDIA) y Apache-2.0 para sherpa-onnx.
  > - Tamaño: unos 640 MB.
  >
  > Ya está probado: el entorno Gentle AI usa este mismo modelo para dictar con la barra espaciadora, y la transcripción en español es de alta calidad.
  >
  > ### Qué se gana
  >
  > - Privacidad: la voz y los datos no salen del dispositivo.
  > - Costo cero por uso: no hay API keys ni suscripciones.
  > - Funciona sin conexión.
  > - Accesibilidad: se escribe mucho menos.
  >
  > ### Preguntas que hay que responder antes de implementar
  >
  > 1. ¿Qué hace hoy la integración externa? Si solo transcribe voz, Parakeet la reemplaza directamente. Si además interpreta el texto para llenar campos de la base de datos, también hará falta un modelo de lenguaje local.
  > 2. ¿En qué plataforma corre la app? Web, escritorio o móvil. Esto define cómo se distribuye un modelo de unos 640 MB.
  > 3. ¿En qué equipo la va a usar? Hay que confirmar que el rendimiento sea aceptable en ese hardware.
  > 4. ¿Cómo se diseña la interfaz para movilidad reducida? Botones grandes, pocos toques, sin gestos finos y la opción de corregir el texto antes de guardarlo.
  >
  > ### Próximo paso
  >
  > Revisar el repositorio para ubicar dónde se llaman hoy los modelos externos y armar un plan de migración por etapas. Primero la transcripción, después el llenado de campos si hace falta.
  >
  > No me interesa terminar la tarea aqui. me interesa tener el plan y crear un openproyect para hacer el tracking de como está la app ahora y cuales son los siguientes pasos a seguir

- **L2** (evidence, audit 2026-10-28):
  - Web-only SPA (React 19 + Vite 6); no Electron/Tauri/Capacitor; `express` dependency unused.
  - Transcription: `AIOrchestrator.transcribe()` tries Groq `whisper-large-v3`, then Gemini; one `audio/webm` blob uploaded after stop (`src/services/AIOrchestrator.ts:21-31`, `src/App.tsx:375-421`). Uploaded files use the same path (`src/App.tsx:590-615`).
  - "Local" mode is the Web Speech API (sends audio to Google in Chrome) and is unreachable: `setModel` is never called while the error toast says "Switch to Local mode" (`src/services/transcription.ts`, `src/App.tsx:73,362,407-414,450`).
  - Magic Format = separate LLM rewrite (Claude → Qwen → Gemini → Groq → OpenRouter); no database field filling exists.
  - Dictionary words go into the cloud prompt; Parakeet has no prompt. Language selector is prompt text; Parakeet auto-detects.
  - `VITE_GEMINI_API_KEY` / `VITE_GROQ_API_KEY` are inlined in the bundle (`src/App.tsx:112-113`, `src/services/AIOrchestrator.ts:25-43`); `vite.config.ts:11-14` defines unused `process.env.*` keys.
  - `AIProvider` couples `transcribe()` and `enhance()` (`src/types.ts:31-38`). Vitest suite: 67 tests.

- **L3** (user, verbatim): "1. La app debe servir primero para Windows, navegador y Mac (idealmente para Mac con Intel, que es el que yo tengo; después podemos hacer la integración para chip M). Podemos terminar de desarrollar todo en la web y luego hacer las integraciones a Windows y Mac. El usuario no tiene que llenar bases de datos desde la app, eso es parte de su trabajo. Lo que realmente me importa es que, cuando la app esté abierta, la persona pueda apretar una tecla, hablar, y que el texto vaya directamente al campo donde esté puesto el cursor. Lo que me gusta de lo que tenemos ahorita es el registro y que podemos usar el portapapeles para copiar cosas que se dijeron antes. Sobre el funcionamiento y la IA: 1. No sé si podamos correr el modelo directo en la web para que funcione de una vez cuando alguien lo use ahí. 2. Para todas las funciones extra de IA (como el magic message y lo demás) creo que se va a necesitar una API. Actualmente hay APIs expuestas: vamos a eliminarlas para que no queden filtradas en el código. Dejé una de Google visible para hacer pruebas cuando hice esto para mis profesores en el bootcamp, y es importante que ya no quede expuesta; cada vez que vaya a meter una API, la coloco yo mismo. Por último, no tenemos que hacer los botones más grandes; ahorita me parece que todo está funcional. Primero enfoquémonos en que se pueda integrar bien con Mac, Windows y la web. open proyect porque quiero aprender a usarlo"

- **L4** (evidence): no real key in the working tree or full git history (only `MY_*` placeholders); repo is private. A deployed bundle built with the Google key would still contain it → task 1.1. Hardware: Intel Core i7-9750H, 16 GB RAM, macOS, time zone Europe/Madrid.

- **L5** (decisions):
  - D1 platform order: web → desktop macOS Intel + Windows → macOS Apple Silicon (from S3). Decided.
  - D3 web runtime: `parakeet.js` (onnxruntime-web, WebGPU/WASM) vs sherpa-onnx WASM vs cloud-only on web. Open → spike 2.2.
  - D4 desktop shell: Electron proposed — `sherpa-onnx-node` ships official prebuilt binaries for macOS x64, macOS arm64 and Windows x64; same TypeScript stack; built-in `globalShortcut`. Tauri needs Rust + community bindings. Confirm after 2.3/2.5.
  - D5 insertion: paste (save clipboard → write text → simulate Cmd/Ctrl+V → restore clipboard) proposed over simulated typing (accents/ñ).
  - D6 hotkey: toggle first (`globalShortcut` is key-down only); push-to-talk later (needs key-up hook + macOS Input Monitoring).
  - D7 dictionary: sherpa-onnx hotwords if supported, else word replacement. Open → spike 2.4.
  - D8 keys: no build-time keys; user enters keys in Settings; desktop stores them with `safeStorage`; cloud transcription opt-in; Magic Format stays cloud (S7). Decided.
  - Web cannot register a global hotkey or type into other apps: S4 is desktop-only; on web, dictation stays in dotanote (history + auto-copy).
  - macOS needs Microphone + Accessibility permissions; Windows cannot paste into apps running as administrator (UIPI).

- **L6** (user, verbatim): "Openspect + openproject porque openspect me odd me ayuda a hacer tareas en md y luego las ordenamos en el openproject. Es un poco mas de documentacion, si, pero me da trasabilidad en el proyecto. Quiero poder presentarlo paso a paso para cuando alguun reclutador me lo pida"

- **L7** (evidence): OpenProject runs locally from `~/openproject` at `http://localhost:8080`. Project `dotanote` (id 3) created; Epic, Feature and Task types enabled manually; 93 work packages synced, authored by Sebastian Lopez (`sebaslopez`). See `tools/openproject/README.md`.

- **L8** (user, verbatim): "no lo veo practico. Me parece que pasaremos mucho tiempo en documentacioón. Cuando lo importante es documentar facilmente y reconocr el flujo. Pero desarrollar y tenerlo listo pronto"

- **L9** (user, verbatim): "no. prefiero tener el ODD + openproyect"

- **L10** (decision): this ODD document replaces `openspec/changes/local-voice-dictation/` (removed; its proposal/design content is condensed in L2, L4, L5). Archived OpenSpec changes stay as project history. Per task: code + checkbox + commit sha in this file, task id in the commit message, then sync OpenProject.

- **L11** (user, verbatim): "saca la necesidad de hacer sdd de nuestrasrules" — scope chosen: "Solo en este repo". Done: `openspec/config.yaml` (SDD phase config from `sdd-init`) removed; `openspec/specs/` and `openspec/changes/archive/` kept as history. No other SDD rule exists in the repo.
