from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class BookingRequest(Base):
    __tablename__ = "booking_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tutor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(200), nullable=True)
    message = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending | accepted | rejected
    lesson_held = Column(Boolean, nullable=True)       # True = занятие состоялось
    fail_reason = Column(Text, nullable=True)          # причина если не состоялось
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id])
    tutor = relationship("User", foreign_keys=[tutor_id])