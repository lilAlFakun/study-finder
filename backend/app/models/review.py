from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id         = Column(Integer, primary_key=True, index=True)
    tutor_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating     = Column(Integer, nullable=False)  # 1-5
    comment    = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    tutor   = relationship("User", foreign_keys=[tutor_id])
    student = relationship("User", foreign_keys=[student_id])