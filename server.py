# ─────────────────────────────────────────────────────────
# FILE: server.py
# ─────────────────────────────────────────────────────────

import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session

load_dotenv()

from backend.core.prompts import ROOT_PROMPT, RESUME_ANALYST_PROMPT, INTERVIEW_COACH_PROMPT
from backend.core.rag import retrieve_interview_frameworks
from backend.core.database import get_db
from backend.core.auth import require_auth
from backend.models.user import User
from backend.routes.auth import router as auth_router
from backend.services.analysis import store_analysis

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Mount auth routes
app.include_router(auth_router)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# In-memory session store
sessions = {}


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    response: str
    session_id: str
    scores: dict | None = None


def extract_scores(text: str) -> dict | None:
    patterns = {
        "overall_fit": r"OVERALL_FIT:\s*(\d+)",
        "experience_relevance": r"EXPERIENCE_RELEVANCE:\s*(\d+)",
        "resume_quality": r"RESUME_QUALITY:\s*(\d+)",
        "growth_potential": r"GROWTH_POTENTIAL:\s*(\d+)",
    }
    scores = {}
    for key, pattern in patterns.items():
        match = re.search(pattern, text)
        if match:
            scores[key] = min(100, max(0, int(match.group(1))))
    if len(scores) == 4:
        return scores
    return None


def clean_response(text: str) -> str:
    clean = text
    for marker in ["OVERALL_FIT:", "EXPERIENCE_RELEVANCE:", "RESUME_QUALITY:", "GROWTH_POTENTIAL:"]:
        clean = re.sub(rf"{marker}\s*\d+\n?", "", clean)
    return clean.strip()


def detect_mode(message: str, session_data: dict) -> str:
    msg_lower = message.lower()

    if any(kw in msg_lower for kw in [
        "mock interview", "start interview", "interview practice",
        "start a mock", "get into character", "stay in character",
        "interview mode"
    ]):
        return "interview"

    if any(kw in msg_lower for kw in ["here is my resume", "my resume:", "resume:"]):
        return "analysis"

    if session_data.get("mode") == "interview":
        return "interview"

    if session_data.get("mode") == "career":
        return "career"

    if any(kw in msg_lower for kw in [
        "career", "advisor", "discuss", "resume", "improve",
        "gap", "strategy", "career chat", "career advice"
    ]):
        return "career"

    if session_data.get("has_analysis"):
        return "career"
    return "root"


def build_system_prompt(mode: str, session_data: dict) -> str:
    if mode == "analysis":
        return RESUME_ANALYST_PROMPT

    if mode == "interview":
        rag_content = retrieve_interview_frameworks("interview preparation STAR behavioral technical")
        analysis_context = session_data.get("analysis_summary", "")
        extra_context = ""
        if analysis_context:
            extra_context += f"\n\n## STUDENT'S ANALYSIS CONTEXT\n{analysis_context}"
        if rag_content:
            extra_context += f"\n\n## INTERVIEW FRAMEWORKS FROM KNOWLEDGE BASE\n{rag_content}"
        return INTERVIEW_COACH_PROMPT + extra_context

    if mode == "career":
        analysis_context = session_data.get("analysis_summary", "")
        career_prompt = """You are CrackD's Career Advisor — a knowledgeable, supportive career mentor for university students.

## YOUR ROLE
- Help students understand their resume analysis results
- Suggest improvements to their resume
- Discuss career strategy and positioning
- Answer questions about their gaps and how to address them
- Be supportive but honest — give actionable advice, not generic platitudes

## IMPORTANT
- You are NOT in mock interview mode. Do NOT ask interview questions or start an interview.
- Be warm, direct, and helpful.
- Reference the student's analysis when relevant.
- Give concrete, specific advice.

## TONE
Confident, direct, supportive. Like a sharp friend who works in recruiting.
"""
        if analysis_context:
            career_prompt += f"\n\n## STUDENT'S ANALYSIS CONTEXT\n{analysis_context}"
        return career_prompt

    return ROOT_PROMPT


def run_completion(session_data: dict, message: str) -> str:
    mode = detect_mode(message, session_data)

    if mode in ("career", "interview"):
        session_data["mode"] = mode

    system_prompt = build_system_prompt(mode, session_data)

    messages = [{"role": "system", "content": system_prompt}]

    history = session_data.get("history", [])
    for h in history[-20:]:
        messages.append(h)

    messages.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=4000,
        )
        assistant_reply = response.choices[0].message.content

        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": assistant_reply})
        session_data["history"] = history

        return assistant_reply
    except Exception as e:
        return f"I encountered an issue processing your request. Please try again. Error: {str(e)}"


# ─── Runtime config for frontend (replaces VITE_ build-time env vars) ───
@app.get("/api/config")
async def get_public_config():
    """Serve public (non-secret) Supabase config to the frontend at runtime."""
    return {
        "supabaseUrl": os.environ.get("SUPABASE_URL", ""),
        "supabaseAnonKey": os.environ.get("SUPABASE_ANON_KEY", ""),
    }


@app.post("/api/session")
async def create_session(current_user: User = Depends(require_auth)):
    frontend_id = uuid.uuid4().hex
    sessions[frontend_id] = {
        "history": [],
        "mode": None,
        "has_analysis": False,
        "analysis_summary": "",
        "user_id": str(current_user.id),
    }
    return {"session_id": frontend_id}


@app.post("/api/chat")
async def chat(req: ChatRequest, current_user: User = Depends(require_auth)):
    if req.session_id not in sessions:
        return ChatResponse(response="Session not found. Please refresh.", session_id=req.session_id)

    session_data = sessions[req.session_id]

    if session_data.get("user_id") != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your session.")

    response_text = run_completion(session_data, req.message)
    scores = extract_scores(response_text)

    return ChatResponse(
        response=clean_response(response_text),
        session_id=req.session_id,
        scores=scores,
    )


@app.post("/api/upload")
async def upload_resume(
    session_id: str = Form(...),
    job_description: str = Form(...),
    file: UploadFile = File(None),
    resume_text: str = Form(""),
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    if session_id not in sessions:
        return ChatResponse(response="Session not found.", session_id=session_id)

    session_data = sessions[session_id]

    if session_data.get("user_id") != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your session.")

    resume_content = resume_text.strip()
    if file and file.filename:
        content_bytes = await file.read()
        if file.filename.lower().endswith(".pdf"):
            try:
                import fitz
                doc = fitz.open(stream=content_bytes, filetype="pdf")
                resume_content = ""
                for page in doc:
                    resume_content += page.get_text()
                doc.close()
            except Exception as e:
                return ChatResponse(response=f"Error reading PDF: {str(e)}", session_id=session_id)
        else:
            resume_content = content_bytes.decode("utf-8", errors="ignore")

    if not resume_content.strip():
        return ChatResponse(response="Could not extract text from the uploaded file. Please paste your resume as text.", session_id=session_id)

    message = f"Here is my resume:\n\n{resume_content}\n\n{job_description}"

    session_data["mode"] = "analysis"
    response_text = run_completion(session_data, message)
    scores = extract_scores(response_text)

    session_data["has_analysis"] = True
    session_data["mode"] = None
    session_data["analysis_summary"] = response_text[:3000]

    try:
        store_analysis(
            db=db,
            user_id=current_user.id,
            resume_text=resume_content,
            job_description=job_description,
            job_url="",
            hr_analysis=response_text[:2000],
            ats_analysis="",
            knowledge_gaps="",
            suggestions="",
        )
    except Exception as e:
        print(f"DB storage warning: {e}")

    return ChatResponse(response=clean_response(response_text), session_id=session_id, scores=scores)


# ─── Health check ───
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


# ─── Startup: log registered routes ───
@app.on_event("startup")
async def log_routes():
    for route in app.routes:
        methods = getattr(route, "methods", None)
        path = getattr(route, "path", "?")
        if methods:
            print(f"[ROUTE] {', '.join(methods):20s} {path}")
        elif hasattr(route, "path"):
            print(f"[ROUTE] {'MOUNT':20s} {path}")


# ─── Static frontend (MUST be last — catch-all) ───
# StaticFiles(html=True) serves .html files for clean URLs:
#   /analysis-center → analysis-center.html
#   / → index.html
# API routes above are matched first because they're registered first.
frontend_dist = Path("frontend/dist")
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")