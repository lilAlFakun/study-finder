from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BookingCreate(BaseModel):
    tutor_id: int
    subject: Optional[str] = None
    message: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: str

class BookingCompleteUpdate(BaseModel):
    lesson_held: bool
    fail_reason: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    student_id: int
    tutor_id: int
    subject: Optional[str]
    message: Optional[str]
    status: str
    lesson_held: Optional[bool]
    fail_reason: Optional[str]
    created_at: datetime
    student_name: Optional[str] = None
    tutor_name: Optional[str] = None

    model_config = {"from_attributes": True}