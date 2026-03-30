import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.core.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cv_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    jd_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(20), default="in_progress", nullable=False)  # in_progress, completed, abandoned
    difficulty_level = Column(String(10), default="medium", nullable=False)  # easy, medium, hard
    total_questions = Column(Integer, default=0, nullable=False)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="interview_sessions")
    cv_document = relationship("Document", foreign_keys=[cv_document_id], back_populates="sessions_as_cv")
    jd_document = relationship("Document", foreign_keys=[jd_document_id], back_populates="sessions_as_jd")
    messages = relationship("InterviewMessage", back_populates="session", cascade="all, delete-orphan")
    feedback = relationship("InterviewFeedback", back_populates="session", uselist=False, cascade="all, delete-orphan")
    performance_report = relationship(
        "PerformanceReport", back_populates="session", uselist=False, cascade="all, delete-orphan"
    )
    memory = relationship("InterviewMemory", back_populates="session", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<InterviewSession {self.id} - {self.status}>"
