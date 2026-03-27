import asyncio
import os
import re
import uuid
import json
import sqlite3
from datetime import datetime, timezone

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

from backend.core.prompts import ROOT_PROMPT, RESUME_ANALYST_PROMPT, INTERVIEW_COACH_PROMPT
from backend.core.rag import retrieve_interview_frameworks
from backend.core.database import init_db, store_analysis, get_student_history, get_latest_analysis, store_interview_session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# Initialize database
init_db()

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
    """Detect which mode/agent to route to based on message content and session state."""
    msg_lower = message.lower()

    # If session already has an analysis and user asks for interview
    if any(kw in msg_lower for kw in [
        "mock interview", "start interview", "interview practice",
        "start a mock", "get into character", "stay in character",
        "interview mode"
    ]):
        return "interview"

    # If message contains a resume (long text with resume-like content)
    if any(kw in msg_lower for kw in ["here is my resume", "my resume:", "resume:"]):
        return "analysis"

    # If session has been in interview mode, stay there
    if session_data.get("mode") == "interview":
        return "interview"

    # If session has been in career mode, stay there
    if session_data.get("mode") == "career":
        return "career"

    # Career-related questions
    if any(kw in msg_lower for kw in [
        "career", "advisor", "discuss", "resume", "improve",
        "gap", "strategy", "career chat", "career advice"
    ]):
        return "career"

    # Default: if analysis exists, career chat; otherwise root
    if session_data.get("has_analysis"):
        return "career"
    return "root"


def build_system_prompt(mode: str, session_data: dict) -> str:
    """Build the appropriate system prompt based on detected mode."""
    if mode == "analysis":
        return RESUME_ANALYST_PROMPT

    if mode == "interview":
        # Enrich with RAG content
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

    # Root/default
    return ROOT_PROMPT


def run_completion(session_data: dict, message: str) -> str:
    """Run an OpenAI chat completion with the appropriate system prompt."""
    mode = detect_mode(message, session_data)

    # Update session mode (but don't override analysis mode—that's one-shot)
    if mode in ("career", "interview"):
        session_data["mode"] = mode

    system_prompt = build_system_prompt(mode, session_data)

    # Build messages list with conversation history
    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history (keep last 20 messages to stay within token limits)
    history = session_data.get("history", [])
    for h in history[-20:]:
        messages.append(h)

    # Add current message
    messages.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=4000,
        )
        assistant_reply = response.choices[0].message.content

        # Store in history
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": assistant_reply})
        session_data["history"] = history

        return assistant_reply
    except Exception as e:
        return f"I encountered an issue processing your request. Please try again. Error: {str(e)}"


@app.post("/api/session")
async def create_session():
    frontend_id = uuid.uuid4().hex
    sessions[frontend_id] = {
        "history": [],
        "mode": None,
        "has_analysis": False,
        "analysis_summary": "",
    }
    return {"session_id": frontend_id}


@app.post("/api/chat")
async def chat(req: ChatRequest):
    if req.session_id not in sessions:
        return ChatResponse(response="Session not found. Please refresh.", session_id=req.session_id)

    session_data = sessions[req.session_id]
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
):
    if session_id not in sessions:
        return ChatResponse(response="Session not found.", session_id=session_id)

    session_data = sessions[session_id]

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

    # Force analysis mode for this request
    session_data["mode"] = "analysis"
    response_text = run_completion(session_data, message)
    scores = extract_scores(response_text)

    # Mark session as having analysis
    session_data["has_analysis"] = True
    session_data["mode"] = None  # Reset mode so next message can be routed freely
    # Store a summary for career chat and interview context
    session_data["analysis_summary"] = response_text[:3000]

    # Store in SQLite
    try:
        store_analysis(
            student_name="Student",
            resume_text=resume_content[:5000],
            job_description=job_description[:3000],
            job_url="",
            hr_analysis=response_text[:2000],
            ats_analysis="",
            knowledge_gaps="",
            suggestions="",
        )
    except Exception as e:
        print(f"DB storage warning: {e}")

    return ChatResponse(response=clean_response(response_text), session_id=session_id, scores=scores)


# Serve frontend build (only mount if dist exists)
import pathlib
frontend_dist = pathlib.Path("frontend/dist")
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")
