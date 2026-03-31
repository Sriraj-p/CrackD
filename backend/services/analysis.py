"""
CrackD Analysis Service
SQLAlchemy-based replacements for the old sqlite3 store/retrieve functions.
"""

import uuid
from sqlalchemy.orm import Session

from backend.models.analysis_session import AnalysisSession


def store_analysis(
    db: Session,
    user_id: uuid.UUID,
    resume_text: str,
    job_description: str,
    job_url: str,
    hr_analysis: str,
    ats_analysis: str,
    knowledge_gaps: str,
    suggestions: str,
) -> AnalysisSession:
    """Store a resume analysis result linked to the authenticated user."""
    session = AnalysisSession(
        user_id=user_id,
        resume_text=resume_text[:5000] if resume_text else None,
        job_description=job_description[:3000] if job_description else None,
        job_url=job_url or None,
        hr_analysis=hr_analysis[:5000] if hr_analysis else None,
        ats_analysis=ats_analysis or None,
        knowledge_gaps=knowledge_gaps or None,
        suggestions=suggestions or None,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_user_history(db: Session, user_id: uuid.UUID, limit: int = 5) -> list[dict]:
    """Retrieve recent analysis sessions for a user."""
    rows = (
        db.query(AnalysisSession)
        .filter(AnalysisSession.user_id == user_id)
        .order_by(AnalysisSession.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": str(r.id),
            "job_description": r.job_description,
            "hr_analysis": r.hr_analysis,
            "ats_analysis": r.ats_analysis,
            "knowledge_gaps": r.knowledge_gaps,
            "suggestions": r.suggestions,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


def get_latest_analysis(db: Session, user_id: uuid.UUID) -> dict | None:
    """Retrieve the most recent analysis for a user."""
    row = (
        db.query(AnalysisSession)
        .filter(AnalysisSession.user_id == user_id)
        .order_by(AnalysisSession.created_at.desc())
        .first()
    )
    if not row:
        return None
    return {
        "id": str(row.id),
        "resume_text": row.resume_text,
        "job_description": row.job_description,
        "job_url": row.job_url,
        "hr_analysis": row.hr_analysis,
        "ats_analysis": row.ats_analysis,
        "knowledge_gaps": row.knowledge_gaps,
        "suggestions": row.suggestions,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }
