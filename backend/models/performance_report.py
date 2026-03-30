import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Text, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from backend.core.database import Base


class PerformanceReport(Base):
    __tablename__ = "performance_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        UUID(as_uuid=True), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    communication_score = Column(Float, nullable=True)
    technical_score = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    relevance_score = Column(Float, nullable=True)
    summary = Column(Text, nullable=True)
    detailed_breakdown = Column(JSON, nullable=True)
    comparison_to_previous = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    session = relationship("InterviewSession", back_populates="performance_report")

    def __repr__(self):
        return f"<PerformanceReport session={self.session_id}>"
