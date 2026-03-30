import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    doc_type = Column(String(10), nullable=False)  # "cv" or "jd"
    extracted_text = Column(Text, nullable=False)
    file_url = Column(String(500), nullable=True)  # nullable — premium only
    original_filename = Column(String(255), nullable=True)
    uploaded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="documents")
    sessions_as_cv = relationship(
        "InterviewSession", foreign_keys="InterviewSession.cv_document_id", back_populates="cv_document"
    )
    sessions_as_jd = relationship(
        "InterviewSession", foreign_keys="InterviewSession.jd_document_id", back_populates="jd_document"
    )

    def __repr__(self):
        return f"<Document {self.doc_type} - {self.original_filename}>"
