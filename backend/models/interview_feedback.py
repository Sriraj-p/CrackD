import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Text, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from backend.core.database import Base


class InterviewFeedback(Base):
    __tablename__ = "interview_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        UUID(as_uuid=True), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    overall_feedback = Column(Text, nullable=True)
    overall_score = Column(Float, nullable=True)
    per_question_scores = Column(JSON, nullable=True)
    strengths = Column(JSON, nullable=True)
    improvements = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    session = relationship("InterviewSession", back_populates="feedback")

    def __repr__(self):
        return f"<InterviewFeedback session={self.session_id} score={self.overall_score}>"
