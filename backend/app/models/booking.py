from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Date, Enum as SAEnum
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

    # Тип заявки
    booking_type = Column(
        SAEnum("single", "range", "subscription", name="booking_type_enum"),
        default="single",
        nullable=False
    )

    # Для single
    date_single = Column(Date, nullable=True)

    # Для range
    date_from = Column(Date, nullable=True)
    date_to = Column(Date, nullable=True)
    lessons_per_week = Column(Integer, nullable=True)

    # Для subscription
    total_lessons = Column(Integer, nullable=True)      # всего занятий
    completed_lessons = Column(Integer, default=0)      # проведено
    schedule_note = Column(Text, nullable=True)         # заметка о расписании

    # Статус
    status = Column(String(20), default="pending")
    # pending | accepted | in_progress | completed | cancelled | rejected | failed

    fail_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id])
    tutor = relationship("User", foreign_keys=[tutor_id])
    lessons = relationship("Lesson", back_populates="booking", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("booking_requests.id"), nullable=False)
    lesson_date = Column(Date, nullable=True)
    status = Column(
        SAEnum("scheduled", "completed", "missed", "cancelled", name="lesson_status_enum"),
        default="scheduled"
    )
    tutor_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("BookingRequest", back_populates="lessons")