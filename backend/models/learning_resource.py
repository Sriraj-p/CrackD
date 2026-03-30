import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.core.database import Base


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    resource_type = Column(String(20), nullable=False)  # article, video, exercise, quiz
    skill_area = Column(String(100), nullable=False, index=True)
    difficulty_level = Column(String(10), nullable=False)  # easy, medium, hard
    url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user_progress = relationship("UserResourceProgress", back_populates="resource", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<LearningResource {self.title}>"
