import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Text, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from backend.core.database import Base


class InterviewMemory(Base):
    __tablename__ = "interview_memory"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        UUID(as_uuid=True), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_summary = Column(Text, nullable=True)
    identified_weak_areas = Column(JSON, nullable=True)
    identified_strengths = Column(JSON, nullable=True)
    recommended_difficulty = Column(String(10), nullable=True)  # easy, medium, hard
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    session = relationship("InterviewSession", back_populates="memory")
    user = relationship("User", back_populates="interview_memories")

    def __repr__(self):
        return f"<InterviewMemory session={self.session_id}>"
