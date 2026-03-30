import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.core.database import Base


class UserResourceProgress(Base):
    __tablename__ = "user_resource_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(
        UUID(as_uuid=True), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status = Column(String(20), default="not_started", nullable=False)  # not_started, in_progress, completed
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="resource_progress")
    resource = relationship("LearningResource", back_populates="user_progress")

    def __repr__(self):
        return f"<UserResourceProgress {self.status}>"
