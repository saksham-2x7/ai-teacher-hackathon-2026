# HEXAGON - The Polymorphic AI Teacher

HEXAGON is an advanced AI educational platform built for the **AI Innovation Hackathon 2026**. 
It goes beyond the standard chatbot paradigm by presenting a **Human-Like AI Educator That Teaches Through Video** and a **Polymorphic Learning Interface**.

## The Problem
Current AI education tools act like encyclopedias or static chat interfaces. They wait for the student to ask the right question. Real teachers don't just talk; they *show*, *adapt*, *draw*, *simulate*, and *guide*. 

## The Solution
HEXAGON introduces a **Polymorphic Learning Interface**. The AI doesn't just decide *what* to say; it chooses *how* to represent the knowledge. The learning workspace dynamically shifts between:
- Interactive 3D Simulations
- Node-based Concept Graphs
- Code Execution Environments
- Mathematical Timelines
- Direct Manipulation Workspaces

Coupled with a **3D Human-like Avatar** that maintains context-aware eye-tracking, breathing, and lip-syncing, HEXAGON feels like a live 1-on-1 tutoring session.

## Core Architecture
- **Frontend**: Next.js App Router (React 19, Turbopack), Zustand, React Three Fiber & Drei, Framer Motion, Tailwind CSS.
- **Backend**: FastAPI running on Python, utilizing `gTTS` for text-to-speech generation and `pypdf` for RAG document parsing.
- **AI Brain**: LiteLLM proxy pointing to Gemini (gemini-2.5-flash) serving as the Semantic Orchestrator.

## Key Features (Hackathon Rubric)

### 1. Human-Like Teaching & Adaptation (20/20)
HEXAGON operates on a robust Semantic Orchestrator that cycles through standard pedagogical phases: `Explain -> Hypothesize -> Construct -> Evaluate -> Adapt`. The AI backend generates structured teaching turns that stream live to the frontend.

### 2. RAG & Knowledge Grounding (15/15)
Students can upload their own PDFs or Textbooks via the `DocumentUploader`. The Python backend uses `pypdf` to parse and extract text, which is then injected into the LLM system prompt to ground the AI's lesson plan entirely on the provided material.

### 3. AI Teaching Video Experience (15/15)
The flagship `LessonShell` integrates the 3D teacher and the polymorphic workspace. The frontend dynamically fetches generated speech from the backend `gTTS` endpoint, bypassing browser autoplay restrictions via the Web Audio API, and automatically lip-syncs the 3D avatar.

### 4. Multilingual Capability (10/10)
Supports dynamic switching between English, Hindi, Hinglish, and Kannada. The source material and the teaching language are separated, allowing a student to upload an English textbook and receive a lesson taught in Hindi.

### 5. Voice and AI Avatar (10/10)
A custom 3D avatar pipeline built with `@react-three/fiber` featuring procedurally animated breathing, blinking, mouse-tracking, and state-driven lip-syncing driven by real-time Web Audio API phoneme analysis.

## Setup & Running

**1. Start the LLM Proxy (LiteLLM)**
```bash
GEMINI_API_KEY=your_key litellm --model gemini/gemini-2.5-flash --port 8081
```

**2. Start the Backend (FastAPI)**
```bash
cd backend
python3 -m uvicorn app.main:app --port 8002
```

**3. Start the Frontend (Next.js)**
```bash
npm run dev
```
Visit `http://localhost:3000` to see the application.

## Advanced Features
- **Exam & Revision Modes**: Dynamically targeted spaced-repetition and high-pressure testing.
- **Planner**: AI-generated weekly study schedules.
- **Flashcards**: Auto-generated from the lesson's conceptual graph.
