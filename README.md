# CrackD

**AI-Powered Interview Preparation Platform**

> Winner — Google Cloud Agentic AI Hackathon "Boffin's Den" (Part 2 — Dragon's Den-style pitch)
> Solo competitor · 40+ teams · Built by [Sriraj Paruchuru](https://github.com/Sriraj-p)
> MSc Artificial Intelligence & Machine Learning, University of Birmingham

---

## The Problem

Students apply to dozens of roles, get ghosted, and when they finally land an interview — they freeze because they've never practised in a way that feels real. Career services are overbooked. Mock interview tools ask generic questions. Nobody tells you the truth about your CV.

## The Solution

Upload your CV and a job description. CrackD gives you:

- **Resume Analysis** — Dual HR + ATS perspective. Four calibrated scores: Overall Fit, Experience Relevance, Resume Quality, and Growth Potential. Most students score 40–75. You have to be exceptional to break 80.
- **Career Chat** — An AI career advisor that has read your analysis and gives targeted, actionable advice — not generic platitudes.
- **Mock Interview** — An AI that role-plays as a senior professional for your target role. It introduces itself with a name and title, stays in character, asks one question at a time, pushes back on vague answers, and at the end gives you a verdict: *"Would I hire you for this role?"*

---

## Architecture

### Original Hackathon Build (Google Cloud)

```
Student Browser
    ↓
Cloud Run (FastAPI + React)
    ↓
Google ADK Root Agent → Resume Analyst Agent (Gemini 2.5 Flash)
                      → Interview Coach Agent (Gemini 2.5 Flash)
    ↓
BigQuery (3 tables) + Vertex AI RAG Corpus (STAR, ATS, Competency docs)
```

### Local Rebuild (This Repo)

```
Student Browser
    ↓
FastAPI (server.py) + Vite Dev Server (React)
    ↓
Mode Detection + System Prompt Swapping → OpenAI gpt-4o-mini
    ↓
SQLite (crackd.db) + Local File RAG (rag_docs/)
```

The multi-agent orchestration from Google ADK has been replaced with simple mode detection — the server analyses each message and session state, selects the right system prompt (resume analyst, career advisor, or interview coach), and sends it as a chat completion to OpenAI. Same behaviour, no SDK dependency.

### Migration Map

| Layer | Hackathon | Local |
|-------|-----------|-------|
| LLM | Gemini 2.5 Flash | OpenAI `gpt-4o-mini` |
| Agent Orchestration | Google ADK (root + 2 sub-agents) | Mode detection + prompt swapping |
| Database | BigQuery (3 tables) | SQLite |
| RAG | Vertex AI RAG Corpus | Local file retrieval (`rag_docs/`) |
| PDF Parsing | PyMuPDF | PyMuPDF (unchanged) |
| Frontend | React / Vite / Tailwind | React / Vite / Tailwind (identical) |
| Deployment | Cloud Run (Docker) | Local / Docker / Render |

---

## Tech Stack

**Backend:** Python 3.12, FastAPI, OpenAI API, SQLite, PyMuPDF

**Frontend:** React 18, Vite, Tailwind CSS v4, react-markdown, jsPDF, lucide-react

**Design System:** "Serene Scholar" — Newsreader + Inter fonts, teal primary palette, dark/light mode, glassmorphism cards

---

## Project Structure

```
crackd/
├── server.py                        # FastAPI entry point + mode detection
├── backend/
│   └── core/
│       ├── prompts.py               # All system prompts (analyst, coach, advisor)
│       ├── rag.py                   # Local file-based RAG retrieval
│       └── database.py              # SQLite persistence (3 tables)
├── rag_docs/                        # Knowledge base
│   ├── star_framework.txt           # STAR interview methodology
│   ├── ats_scoring_criteria.txt     # ATS scoring dimensions
│   └── competency_framework.txt     # Role competency assessment
├── frontend/                        # React/Vite/Tailwind
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── index.css                # Serene Scholar design tokens
│       ├── App.jsx                  # State management + routing
│       └── components/
│           ├── Layout.jsx           # Shell (sidebar + topbar + footer)
│           ├── Sidebar.jsx          # Navigation
│           ├── TopBar.jsx           # Logo + time-aware greeting + theme toggle
│           ├── LandingView.jsx      # Upload CV + job description
│           ├── ResultsDashboard.jsx  # Score cards + analysis display
│           └── ChatView.jsx         # Career chat + mock interview
├── requirements.txt
├── Dockerfile
├── .env.example
├── .gitignore
└── README.md
```

---

## Feature Roadmap

Planned development path from hackathon prototype to Masters dissertation deliverable.

### Highest Priority — Core Dissertation Contributions

| Feature | Description |
|---------|-------------|
| **Voice Chat in Mock Interview** | Phase 1: Web Speech API (speech-to-text) so students speak answers aloud. Phase 2: Google Cloud Text-to-Speech so the AI interviewer responds in voice. The agent already maintains a named persona — adding voice brings that persona to life. |
| **Login-Based Authentication** | Replace anonymous sessions with OAuth 2.0 / Firebase Auth. Enables persistent identity, personalised dashboards, and gated access. |
| **30-Day Session Memory** | Store up to 30 days of analysis sessions, mock interview transcripts, and career chat history per user. Track progress over time across multiple CV iterations. |

### High Priority — Strong Feature Additions

| Feature | Description |
|---------|-------------|
| **Target Company Prep** | Scrape Glassdoor, LeetCode, and Blind for company-specific question patterns, interview structure, and round breakdown. The Interview Coach receives the company profile as context. |
| **Company Templates** | Pre-built interview profiles for FAANG, Big 4, and major tech companies with known question banks, round formats, and focus areas. |
| **Compare Resumes** | Accept two CVs for structured side-by-side comparison against the same job description. Scores each independently. |

### Medium Priority — Design & Reporting

| Feature | Description |
|---------|-------------|
| **Redesign PDF Report** | Replace plain-text jsPDF export with branded, visually rich report: score visualisations, colour-coded gap analysis, structured sections. |
| **Interview Round Selection** | Dropdown before interview starts: Phone Screen, Technical, Onsite, Behavioural, Hiring Manager, or custom. Agent adjusts question type and difficulty. |
| **Pressure Mode** | Toggleable interview style with curveball questions, deliberately vague prompts, rapid topic pivots, and composure-testing scenarios. |

### Low Priority — Polish

| Feature | Description |
|---------|-------------|
| **Fix UI Bugs** | Light-mode CSS ordering, theme variable inconsistencies, responsive edge cases. |
| **Refine Agent Scope** | Intent detection to distinguish general knowledge queries from personalised advice requests. |
| **Mid-Session File Attachment** | Wire up the paperclip icon so students can drop a revised CV mid-conversation. |
| **Save to Google Drive** | Export transcripts and reports directly to Google Drive with one click. |

### Experimental

- **Multilingual Interview Mode** — Let the student choose the interview language upfront; the agent responds natively in that language.
- **Bring Your Own API Key** — Let power users select an alternative model (Claude, GPT-4o) for comparative evaluation of interview quality and scoring consistency across foundation models.

---

## Business Model

| Tier | Price | What You Get |
|------|-------|-------------|
| **Free** | £0 | 1 resume analysis + 1 mock interview per month |
| **Pro** | £9.99/mo | Unlimited sessions, voice interviews, branded PDF reports, progress tracking |
| **University** | £3.99/student/mo | Billed to careers services. Aggregated cohort analytics on readiness gaps |
| **B2B** (future) | Custom | Companies send candidates a CrackD session instead of one-way video interviews |

---

## Acknowledgements

CrackD was built solo during the Google Cloud Agentic AI Hackathon "Boffin's Den" using Google ADK, Gemini 2.5 Flash, Vertex AI RAG, BigQuery, and Cloud Run. This repository is the local rebuild for continued development as a Masters dissertation project.

**Google Cloud services used in the original build:** ADK (Agent Development Kit), Gemini 2.5 Flash, Vertex AI RAG, BigQuery, Cloud Run.

---

*Built by Sriraj Paruchuru — MSc AI & ML, University of Birmingham*

*Stay Curious.*