# dotanote - Project Memory & Guidelines

## Project Overview
dotanote is a high-performance, minimalist voice transcription tool designed for professionals. It follows a "Hardware / Specialist Tool" aesthetic with a focus on speed, precision, and executive utility.

## Achieved Features

### 1. Core Transcription Engine
- **Hybrid Model:** Support for both Gemini-powered (high precision) and Local (Web Speech API) transcription.
- **Dynamic Capsule:** A floating UI element for recording status, visualizer, and quick language switching.
- **Multi-language Support:** EN, ES, FR, PT, and Auto-detection.

### 2. Magic Format (AI Enhancement)
- **Executive Summary:** One-click transformation of raw transcripts into structured notes or business messages using Gemini.
- **Smart Formatting:** Automatic removal of filler words, grammar correction, and bullet-point structuring.
- **Visual Feedback:** Dedicated purple-themed UI for enhanced content with auto-copy integration.

### 3. Advanced Audio Pipeline
- **Real-time Monitoring:** Option to hear your own voice while recording to verify audio quality.
- **Hardware Constraints:** Functional toggles for Noise Suppression and Automatic Gain Control (AGC).
- **Device Management:** Dynamic selection of input (microphones) and output (speakers) devices.
- **Visualizer:** Real-time frequency analysis displayed in the dynamic capsule.

### 4. Robust AI Backend (New)
- **AI Orchestrator:** Centralized management of AI providers.
- **Circuit Breaker Pattern:** Automatic failover between providers if the primary fails.
- **Multi-model Support:** Architecture designed to easily plug in new providers (Gemini, OpenRouter, etc.).
- **Metadata Telemetry:** Every transcription/enhancement tracks which model/provider generated it.

### 5. Professional UI/UX
- **Icon Standardization:** 
  - Navigation: 18px
  - Actions: 16px
  - Indicators: 14px
- **Collapsible Sidebar:** Optimized for space; icons maintain size (flex-shrink-0) and legibility when collapsed.
- **Stats Dashboard:** Integrated panel for transcription metrics.

### 6. Shortcuts & Efficiency
- **Capture Mode:** Interactive shortcut editing (press keys to assign).
- **Default Hotkeys:**
  - `Ctrl + Space`: Toggle Recording.
  - `Cmd/Ctrl + J`: Toggle Sidebar.
  - `Cmd/Ctrl + L`: Toggle Dashboard.
  - `Cmd/Ctrl + K`: Focus Mode (Toggle all panels).
  - `Alt + Z`: Push-to-Talk (PTT).

### 7. Comprehensive Settings
- **General Preferences:** Centralized control for UI hints, startup visibility of sidebar/dashboard, auto-export format (including PDF), and default language.
- **Account & Workspace:** "Dark Luxury" integrated profile mimicking a "Hardware Standard" standalone tool, with immediate workspace statistics.

## Design Rules
- **Aesthetic:** Dark Luxury / Technical Tool. Background: `#0a0a0a` with glassmorphism overlays (`backdrop-blur`).
- **Typography:** Apple System Fonts (`-apple-system`, `SF Pro Display`) for UI, JetBrains Mono for technical data.
- **Native Layout Adjustments:** `safe-area-inset` aware paddings (`safe-pt`, `safe-pb`) and hidden scrollbars for Capacitor/iOS support.
- **Icons:** Always use `lucide-react`. Standard sizes must be respected.
- **Interactions:** Use `motion` (framer-motion) for all transitions and state changes.

## Technical Architecture
- **State Management:** Centralized in `App.tsx`.
- **Types:** Shared interfaces defined in `src/types.ts` (includes `AIProvider` interface).
- **Services:** 
  - Transcription logic isolated in `src/services/transcription.ts`.
  - Orchestration logic in `src/services/AIOrchestrator.ts`.
  - Provider implementations in `src/services/providers/`.
