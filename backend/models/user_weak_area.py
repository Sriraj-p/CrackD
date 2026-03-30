import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.core.database import Base


class UserWeakArea(Base):
    __tablename__ = "user_weak_areas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_area = Column(String(100), nullable=False)
    proficiency_score = Column(Float, nullable=True)
    times_tested = Column(Integer, default=0, nullable=False)
    first_identified = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    last_updated = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="weak_areas")

    def __repr__(self):
        return f"<UserWeakArea {self.skill_area} - {self.proficiency_score}>"
