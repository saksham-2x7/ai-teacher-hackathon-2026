# HEXAGON — Your Personal AI Teacher (MVP)

HEXAGON is an AI education platform built for the **AI Innovation Hackathon 2026**.
Core loop: tell the app **what you want to learn** (any topic), optionally drop in a **class
document**, pick a **time budget** — and a live **3D AI teacher** teaches the lesson out loud,
step by step, swapping live visuals (text, diagrams, concept maps) as it speaks, asking you
questions and chatting back. It runs on three screens: **Home → Setup → Lesson**.

## Screens

- **Home** (`/home`) — one input, one START button. Type anything ("Black Holes", "Newton's laws").
- **Setup** (`/setup`) — topic + optional notes upload + time budget (10–45 min) → START LESSON.
  The lesson URL is derived from the topic (`/lesson/black-holes?sessionId=<uuid>`).
- **Lesson** (`/lesson/[slug]`) — the 3D teacher PiP (speech + lip-sync + captions + waveform +
  mute/expand), live streaming teaching content in the centre (SSE), a chat panel that talks back
  (`/interact`), and pop-in questions. Reloading a lesson re-renders the last teacher turn from
  session history.
- **Settings** (`/settings`) — paste your own API key (used as `X-API-Key` per session) or reset
  all browser data.

## How the AI pipeline works

1. `POST /api/v1/sessions` creates a session from your topic + learner profile (level, time, style).
2. `GET /api/v1/sessions/{id}/stream` opens a **server-sent-events** stream: the backend
   (FastAPI + Gemini) pushes teaching turns `{ spoken_text, visual_intent, interactive_prompt, state }`.
   The frontend connects **directly to the backend** for SSE (the dev proxy buffers streams in the
   browser), with heartbeat `: ping` keeping it alive.
3. `visual_intent.type` switches the visible representation (text / diagram / concept map / graph /
   timeline / code), and `spoken_text` is spoken via TTS with audio-driven lip-sync.
4. Chat uses `POST /api/v1/sessions/{id}/interact` (also an SSE stream of the same turn shape).
5. Backend is OpenAI-compatible against Gemini; a shared key is a local fallback, and any
   per-student key sent as `X-API-Key` overrides it for that session.

## Tech

- **Next.js App Router (React 19), Zustand, Tailwind CSS, Framer Motion, Lucide**
- **React Three Fiber + Drei** — 3D teacher avatar with procedural lip-sync / breathing / idle
- **FastAPI + Gemini** backend at `http://127.0.0.1:8000`
- **UI:** Neo-brutalist — thick black borders, hard offset shadows, flat lime/black/white. Dark
  "stage" in the lesson so the 3D avatar pops.

## Run it

```bash
# frontend (port 3000)
npm install
npm run dev

# backend (port 8000)
pip install -r backend/requirements.txt
cd backend && uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The frontend proxies `/api/*` to `127.0.0.1:8000` in dev (non-streaming). SSE bypasses the proxy.

## Personal API key

Open **Settings** on the home page and paste a key from your model provider's console. It is stored
in this browser only, sent to the lesson backend as the `X-API-Key` header, and used instead of the
shared server key for every lesson you start. The app works without one (shared classroom key).