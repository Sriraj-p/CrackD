"""
AnalysisSession — carries over the existing analysis_sessions table from V1.
This stores the HR/ATS resume analysis results that currently power ResultsDashboard.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.core.database import Base


class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_text = Column(Text, nullable=True)
    job_description = Column(Text, nullable=True)
    job_url = Column(String(500), nullable=True)
    hr_analysis = Column(Text, nullable=True)
    ats_analysis = Column(Text, nullable=True)
    knowledge_gaps = Column(Text, nullable=True)
    suggestions = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="analysis_sessions")

    def __repr__(self):
        return f"<AnalysisSession {self.id}>"
