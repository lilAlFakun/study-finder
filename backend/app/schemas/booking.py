from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List, Literal

# --- Lesson ---

class LessonOut(BaseModel):
    id: int
    lesson_date: Optional[date]
    status: str
    tutor_note: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}

class LessonCreate(BaseModel):
    lesson_date: Optional[date] = None
    tutor_note: Optional[str] = None

class LessonStatusUpdate(BaseModel):
    status: Literal["completed", "missed", "cancelled"]
    tutor_note: Optional[str] = None

# --- Booking ---

class BookingCreate(BaseModel):
    tutor_id: int
    subject: Optional[str] = None
    message: Optional[str] = None
    booking_type: Literal["single", "range", "subscription"] = "single"

    # single
    date_single: Optional[date] = None

    # range
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    lessons_per_week: Optional[int] = None

    # subscription
    total_lessons: Optional[int] = None
    schedule_note: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: str

class BookingWithdrawUpdate(BaseModel):
    fail_reason: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    student_id: int
    tutor_id: int
    subject: Optional[str]
    message: Optional[str]
    booking_type: str
    date_single: Optional[date]
    date_from: Optional[date]
    date_to: Optional[date]
    lessons_per_week: Optional[int]
    total_lessons: Optional[int]
    completed_lessons: int
    schedule_note: Optional[str]
    status: str
    fail_reason: Optional[str]
    created_at: datetime
    student_name: Optional[str] = None
    tutor_name: Optional[str] = None
    lessons: List[LessonOut] = []

    model_config = {"from_attributes": True}