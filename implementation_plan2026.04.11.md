# Dotanote: Production-Ready Strategy & Implementation Plan

This document outlines the high-level roadmap to transition **Dotanote** from a functional local prototype to a robust, secure, and performant production application. 

> [!NOTE]
> **Notes for you:** I have structured this plan as a series of "Phases". Instead of just running basic build commands, this plan addresses the *architecture* required for a real-world application. It focuses on how we protect your AI API keys, how we make the app load instantly, and how we automate the deployment process.

---

## Phase 1: Security Architecture (Solving the API Key Problem)

**The Problem:** Currently, the `GEMINI_API_KEY` is injected directly into the Vite frontend build. If deployed to the public internet, anyone visiting the site could extract your API key and use your quota.

**The Solution:** We must decide on the deployment model to secure the key.

*   **Option A: The "Personal Tool" Model (Current Path)** 
    *   **What it is:** The app remains a local-only tool running on your machine, or deployed behind strict password protection. 
    *   **Action:** No architectural changes needed, but it cannot be shared publicly.
*   **Option B: The "Serverless Proxy" Model (Recommended for Production)**
    *   **What it is:** We move the `@google/genai` calls to a lightweight backend "Serverless Function" (e.g., Vercel API Routes or Cloudflare Workers). 
    *   **Action:** The frontend sends the audio to our secure proxy, the proxy securely adds the Gemini API key, talks to Google, and sends the text back to the frontend.

> [!CAUTION]
> **Decision Required:** Please let me know if Dotanote is strictly for personal local use, or if you plan to host it on the internet for others to use. If the latter, we MUST implement Option B before deploying.

---

## Phase 2: Codebase Optimization & Quality Gates

Before building the app, the code itself must be optimized to ensure it loads flawlessly and doesn't contain bugs.

### 1. Bundle Splitting (Performance)
*   **Action:** Configure Vite (`vite.config.ts`) to split large libraries (like `framer-motion`, `lucide-react`, and the AI SDKs) into separate "chunks". 
*   **Benefit:** Users won't have to download a massive, single JavaScript file. The app will load significantly faster, adhering to the "fast, hardware tool" aesthetic.

### 2. Automated Quality Checks (Stability)
*   **Action:** Implement strict TypeScript type-checking (`tsc --noEmit`) and introduce a linter (like ESLint).
*   **Benefit:** Prevents accidental deployment of broken code or unhandled errors.

### 3. Dependency Cleanup
*   **Action:** Remove unused dependencies. `express` is currently in your `package.json` but isn't used in the frontend code. This bloats the project.

---

## Phase 3: The CI/CD Deployment Pipeline

We need an automated way to get your code from your computer to the internet (Continuous Integration / Continuous Deployment).

### 1. Version Control & Provider Output
*   **Action:** Push the code to a Git repository (GitHub). 
*   **Action:** Connect a hosting platform like **Vercel** or **Netlify** to the repository.

### 2. The Automated Workflow
*   When you write new code and push it to GitHub:
    1.  The platform automatically runs the quality checks (Phase 2).
    2.  If it passes, it runs `vite build` to generate the highly optimized `dist` folder.
    3.  It deploys the new version globally in seconds.

---

## Phase 4: Enhancing the "Specialist Tool" Feel (Future)

To truly make this feel like a native "hardware tool":

*   **PWA (Progressive Web App) Implementation:** Add a web manifest and service workers. This will allow you to "install" Dotanote to your computer or phone directly from the browser, opening in its own clean window without browser tabs/URL bars.

---

## Immediate Next Steps (Implementation)

1.  **Remove unused dependencies:** Prune `express`.
2.  **Optimize Vite Config:** Add `manualChunks` to split the vendor code.
3.  **Local Build Verification:** Verify the `npm run build` process works locally without syntax/type errors.

### User Review Required
Please review Phase 1 and let me know how you want to handle the API keys (Option A vs. Option B), and let me know what hosting platform (Vercel, Netlify, etc.) you'd prefer to use!
