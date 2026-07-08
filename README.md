# Salesforce AI Admin Setup Guide

A polished, **fully offline** local website that turns the *"Admin Guide:
Automated AI Use Case"* PDF into an interactive, progress-tracking walkthrough
for Salesforce admins — including beginners.

It guides you through two independent journeys:

1. **Activate Agentforce Coworker** — turn on Einstein, Agentforce, and Data 360,
   assign access, and validate the coworker search experience.
2. **Use Personalized AI Prompts** — build an Account Meeting Briefing with
   Prompt Builder and a Schedule-Triggered Flow (Phases 0–5), plus a 10-template
   prompt library.

Every step has a plain-English explanation, the exact Salesforce Setup
navigation path, the values to enter (with copy buttons), why it matters,
beginner tips, common blockers, and a completion checkbox.

---

## Quick start

> Requires **Node 20+** (built and tested on Node 24 / npm 11).

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check (tsc) + production build into dist/
npm run preview  # serve the production build locally
npm test         # run the unit test suite (Vitest)
```

- `npm run typecheck` — type-check only, no emit.
- `npm run test:watch` — tests in watch mode.

---

## Features

- **Two guided journeys** sharing one wizard: section/phase navigation, a live
  progress bar, per-step completion, and per-section checklists with go/no-go
  status.
- **Beginner vs Compact mode** — full explanatory cards, or a dense operational
  checklist for experienced admins. Toggle in the header.
- **Copy buttons everywhere** — API names, prompt text, JSON inputs, flow
  references, and Setup Quick Find terms. Includes a `file://`-safe fallback.
- **Search** across every step, prompt, troubleshooting entry, Setup path, and
  API name, with match highlighting.
- **Prompt Library** — 10 ready-to-use templates with tag filtering.
- **Prompt Customizer** — adjust object, language, tone, word limit, and output
  format with a live preview. Runs entirely in your browser; **no AI is
  called**, and Salesforce merge fields like `{!$RecordSnapshot:Account.Snapshot}`
  are preserved byte-for-byte.
- **Troubleshooting assistant** — pick a symptom to get the likely cause, the
  fix, and a jump to the related step. Includes a table view and quick-reference
  tables (best practices, common errors, scheduled-flow limits).
- **Validation dashboard** — per-journey checks you can tick off, with an overall
  go/no-go summary.
- **Printable export** — a linearized, print-optimized document for each journey
  (use *Print / Save as PDF*).
- **Progress panel** — completion ring, per-section status, open warnings, and a
  "ready for validation?" gate.
- **Persistence** — progress, notes, selected mode, and copy history are saved to
  `localStorage` and restored on reload. A **Reset** button clears everything.
- **Accessible & responsive** — keyboard navigation, ARIA landmarks/labels,
  visible focus states, semantic headings, and a desktop + tablet layout.

---

## How your data is stored

All state lives in your browser's **`localStorage`** under a single versioned
key (`sf-journeys:v1`). Nothing is sent anywhere — there is no backend and no
network access at runtime. Clearing your browser storage (or the in-app
**Reset** button) removes it. If storage is unavailable (e.g. private mode),
the app still runs from memory for the session.

## Offline use

The app is built with relative asset paths (`base: './'`) and uses a
hash-based router, so it works with **no server**:

- `npm run preview` serves the production build locally, **or**
- open `dist/index.html` directly via `file://` after `npm run build`.

Deep links (e.g. `#/journey/prompts/s/phase-3`) never 404 because routing is
entirely client-side in the URL hash.

---

## Tech stack

- **React 19** + **TypeScript** (strict)
- **Vite 8** (build & dev server)
- **Tailwind CSS v4** (CSS-first `@theme`, via `@tailwindcss/vite` — no
  `tailwind.config.js` or `postcss.config.js`)
- **lucide-react** icons
- **Vitest** + Testing Library (jsdom) for the pure-logic unit tests

No routing, state, or search libraries — the router (hash-based via
`useSyncExternalStore`), state (Context + `useReducer` with debounced
persistence), progress selectors, prompt customizer, and search index are all
small, dependency-free, and unit-tested modules under `src/lib/`.

### Project layout

```
src/
  lib/         router, state, storage, progress selectors, search,
               prompt customizer, clipboard hook, icon map, types (+ *.test.ts)
  data/        journey/step/prompt/troubleshooting content from the PDF
  components/  Home, JourneyLayout, StepCard, Checklist, ProgressPanel,
               Search, PromptLibrary, PromptCustomizer,
               TroubleshootingAssistant, ValidationDashboard, PrintView
  components/ui/  Badge, Callout, ExpandableSection, NavPathDisplay, Disclaimer
```

---

## Content & disclaimer

All content is transcribed from the source admin guide. It does **not** require
Salesforce API access, and does not require any external or paid service.

> **Salesforce product names, menus, and feature availability can change.**
> Always confirm against current Salesforce Help and your org's licenses.
