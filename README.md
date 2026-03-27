# CrackD — AI-Powered Interview Preparation Platform

> Winner — Google Cloud Agentic AI Hackathon "Boffin's Den" (solo competitor, 40+ teams)
> 
> Rebuilt for local development with OpenAI backend, SQLite persistence, and no cloud dependencies.

## What It Does

Upload your CV (PDF) and a job description. CrackD gives you:

1. **Resume Analysis** — Dual HR + ATS perspective with 4 calibrated scores (Overall Fit, Experience Relevance, Resume Quality, Growth Potential)
2. **Career Chat** — AI career advisor that references your analysis to give targeted advice
3. **Mock Interview** — AI role-plays as a senior professional for your target role, stays in character, asks probing questions, and gives a hire/no-hire verdict

## Tech Stack

| Layer | Original (Hackathon) | Local Version |
|-------|---------------------|---------------|
| LLM | Gemini 2.5 Flash via Google ADK | OpenAI `gpt-4o-mini` via `openai` client |
| Orchestration | Google ADK (root agent + sub-agents) | Simple mode detection + system prompt swapping |
| Database | BigQuery (3 tables) | SQLite (`crackd.db`) |
| RAG | Vertex AI RAG Corpus | Local file-based retrieval (`rag_docs/`) |
| Frontend | React/Vite/Tailwind | React/Vite/Tailwind (identical) |
| Deployment | Cloud Run (Docker) | Local dev / Docker |

## Prerequisites

- **Python 3.12+** — [python.org/downloads](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **OpenAI API Key** — [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

## Setup (Windows — cmd or PowerShell)

### 1. Clone the repo

```cmd
git clone https://github.com/Sriraj-p/crackd.git
cd crackd
```

### 2. Create your `.env` file

```cmd
copy .env.example .env
```

Open `.env` in your editor and paste your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4o-mini
```

### 3. Install Python dependencies

```cmd
pip install -r requirements.txt
```

### 4. Install frontend dependencies and build

```cmd
cd frontend
npm install
npm run build
cd ..
```

### 5. Run the server

```cmd
uvicorn server:app --host 0.0.0.0 --port 8080
```

Open **http://localhost:8080** in your browser.

## Development Mode (Hot Reload)

For frontend development with hot reload, run two terminals:

**Terminal 1 — Backend:**
```cmd
uvicorn server:app --host 0.0.0.0 --port 8080 --reload
```

**Terminal 2 — Frontend dev server:**
```cmd
cd frontend
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` calls to the backend on port 8080.

## Project Structure

```
crackd/
├── server.py                    # FastAPI server (entry point)
├── backend/
│   └── core/
│       ├── prompts.py           # System prompts (from original agents)
│       ├── rag.py               # Local file-based RAG retrieval
│       └── database.py          # SQLite persistence layer
├── rag_docs/                    # Knowledge base documents
│   ├── star_framework.txt
│   ├── ats_scoring_criteria.txt
│   └── competency_framework.txt
├── frontend/                    # React/Vite/Tailwind (V5 codebase)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── index.css            # "Serene Scholar" design system
│       ├── App.jsx
│       └── components/
│           ├── Layout.jsx
│           ├── Sidebar.jsx
│           ├── TopBar.jsx
│           ├── LandingView.jsx
│           ├── ResultsDashboard.jsx
│           └── ChatView.jsx
├── requirements.txt
├── Dockerfile
├── .env.example
├── .gitignore
└── README.md
```

## Architecture

The original hackathon build used Google ADK's multi-agent orchestration (root agent → resume_analyst + interview_coach sub-agents). This local version replaces that with:

- **Mode detection** (`server.py`) — analyses the user's message and session state to determine which system prompt to use
- **System prompt swapping** (`backend/core/prompts.py`) — each "agent" is now a different system prompt injected into the OpenAI chat completion
- **Conversation history** — maintained in-memory per session, passed as message context to OpenAI

The frontend is **pixel-identical** to the V5 hackathon codebase.

## Git Workflow

- `main` — stable branch
- Feature branches → PRs into `main`

## License

Built by Sriraj Paruchuru — MSc AI & ML, University of Birmingham.
