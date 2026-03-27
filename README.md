# CrackD: A Multi-Agent System for Personalised Interview Preparation Using RAG-Augmented LLMs

> Winner — Google Cloud Agentic AI Hackathon "Boffin's Den" (Part 2 — Dragon's Den-style pitch)
>
> **Sriraj Paruchuru** — MSc Artificial Intelligence & Machine Learning, University of Birmingham (2999550)

---

## Abstract

CrackD is an AI-powered interview preparation platform that combines multi-agent orchestration, retrieval-augmented generation (RAG), and role-play simulation to deliver personalised, actionable feedback to university students. The system analyses resumes against job descriptions from dual HR and ATS perspectives, identifies competency gaps through a structured scoring framework, and conducts realistic mock interviews where the AI adopts the persona of a senior professional tailored to the target role.

Originally built as a solo entry for the Google Cloud Agentic AI Hackathon using Google ADK, Gemini 2.5 Flash, Vertex AI RAG, BigQuery, and Cloud Run, the platform has been rebuilt for local development and continued research as a Masters dissertation project.

---

## Research Contributions

1. **Multi-agent orchestration without framework dependency** — The original Google ADK sub-agent routing has been replaced with a lightweight mode detection and system prompt swapping architecture, demonstrating that complex agent behaviours can be replicated through prompt engineering alone.

2. **Dual-perspective resume evaluation** — A structured scoring framework that evaluates candidates simultaneously from HR (narrative, impact, red flags) and ATS (keyword match, formatting, section detection) perspectives across four calibrated dimensions.

3. **RAG-augmented interview simulation** — The mock interview agent retrieves from a local knowledge corpus (STAR framework, ATS criteria, competency framework) to generate questions that target the candidate's specific weak areas identified during analysis.

4. **Persona-persistent role-play** — The interview agent maintains a named senior professional persona throughout the session, adapts question difficulty based on performance, and delivers a structured hire/no-hire verdict with actionable feedback.

---

## System Architecture

### Original Implementation (Google Cloud)
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

### Local Rebuild (This Repository)
```
Student Browser
    ↓
FastAPI (server.py) + Vite Dev Server (React)
    ↓
Mode Detection + System Prompt Swapping → OpenAI gpt-4o-mini
    ↓
SQLite (crackd.db) + Local File RAG (rag_docs/)
```

### Component Migration

| Layer | Hackathon Implementation | Local Implementation |
|-------|-------------------------|---------------------|
| LLM | Gemini 2.5 Flash | OpenAI `gpt-4o-mini` |
| Agent Orchestration | Google ADK (root + 2 sub-agents) | Mode detection + prompt swapping |
| Data Persistence | BigQuery (3 tables) | SQLite |
| Knowledge Retrieval | Vertex AI RAG Corpus | Local file-based retrieval (`rag_docs/`) |
| PDF Parsing | PyMuPDF | PyMuPDF (unchanged) |
| Frontend | React / Vite / Tailwind | React / Vite / Tailwind (unchanged) |
| Deployment | Cloud Run (Docker) | Local / Docker / Render |

---

## Technical Stack

**Backend:** Python 3.12, FastAPI, OpenAI API, SQLite, PyMuPDF

**Frontend:** React 18, Vite, Tailwind CSS v4, react-markdown, jsPDF, lucide-react

**Design System:** "Serene Scholar" — Newsreader + Inter typefaces, teal primary palette, dark/light mode, glassmorphism surfaces

---

## Repository Structure
```
crackd/
├── server.py                        # FastAPI entry point + mode detection
├── backend/
│   └── core/
│       ├── prompts.py               # System prompts (analyst, coach, advisor)
│       ├── rag.py                   # Local file-based RAG retrieval
│       └── database.py              # SQLite persistence layer (3 tables)
├── rag_docs/                        # Knowledge base corpus
│   ├── star_framework.txt           # STAR interview methodology
│   ├── ats_scoring_criteria.txt     # ATS scoring dimensions & weights
│   └── competency_framework.txt     # Role competency assessment criteria
├── frontend/                        # React / Vite / Tailwind
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── index.css                # Design system tokens
│       ├── App.jsx                  # State management + view routing
│       └── components/
│           ├── Layout.jsx           # Application shell
│           ├── Sidebar.jsx          # Navigation
│           ├── TopBar.jsx           # Branding + theme toggle
│           ├── LandingView.jsx      # Resume upload + job description input
│           ├── ResultsDashboard.jsx  # Score visualisation + analysis display
│           └── ChatView.jsx         # Career chat + mock interview interface
├── requirements.txt
├── Dockerfile
├── .env.example
├── .gitignore
└── README.md
```

---

## Planned Research Extensions

Development roadmap from hackathon prototype to Masters dissertation deliverable.

### Highest Priority — Core Dissertation Contributions

| Feature | Research Value |
|---------|---------------|
| **Voice-Based Interview Simulation** | Phase 1: Web Speech API (STT) for spoken responses. Phase 2: Google Cloud TTS for interviewer voice. Enables investigation of modality effects on candidate performance and anxiety. |
| **User Authentication & Persistent Identity** | OAuth 2.0 / Firebase Auth. Required infrastructure for longitudinal study of student interview readiness over time. |
| **30-Day Session Memory & Progress Tracking** | Store analysis sessions, transcripts, and scores per user. Enables measurement of score improvement across multiple CV iterations — core evaluation metric for the dissertation. |

### High Priority — Feature Extensions

| Feature | Research Value |
|---------|---------------|
| **Target Company Preparation** | Scrape Glassdoor, LeetCode, and Blind for company-specific question patterns. Investigates whether company-contextualised preparation improves interview specificity. |
| **Company Templates** | Pre-built interview profiles for high-data employers (FAANG, Big 4). Baseline for comparing generated vs curated question quality. |
| **Resume Comparison** | Side-by-side dual-CV analysis against the same job description. Enables A/B evaluation of resume strategies. |

### Medium Priority — Interaction Design

| Feature | Research Value |
|---------|---------------|
| **Branded PDF Reports** | Structured diagnostic with score visualisations and gap analysis. Designed for sharing with career services advisors. |
| **Interview Round Selection** | Round-specific question generation (Phone Screen, Technical, Behavioural, etc.). Studies how round context affects question difficulty and type distribution. |
| **Pressure Mode** | Curveball questions, vague prompts, rapid pivots. Measures candidate composure under adversarial interview conditions. |

### Experimental

- **Multilingual Interview Mode** — Native-language interview sessions for investigating cross-lingual LLM performance in structured assessment.
- **Cross-Model Evaluation** — BYOK support for comparative analysis of interview quality, scoring consistency, and response latency across foundation models (Gemini, GPT-4o, Claude) using identical prompts and RAG pipeline.

---

## Acknowledgements

CrackD was built solo during the Google Cloud Agentic AI Hackathon "Boffin's Den" using Google ADK, Gemini 2.5 Flash, Vertex AI RAG, BigQuery, and Cloud Run.

**Google Cloud services used in the original build:** ADK (Agent Development Kit), Gemini 2.5 Flash, Vertex AI RAG, BigQuery, Cloud Run.

---

*Sriraj Paruchuru — MSc Artificial Intelligence & Machine Learning, University of Birmingham*

*Stay Curious.*