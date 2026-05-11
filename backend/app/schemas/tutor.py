from pydantic import BaseModel
from typing import Optional

class TutorCard(BaseModel):
    id: int
    name: str
    city: Optional[str]
    subject: Optional[str]
    formats: Optional[str]
    study_level: Optional[str]
    bio: Optional[str]
    avatar: Optional[str]
    avg_rating: Optional[float]
    review_count: int
    lessons_count: int = 0
    phone: Optional[str]

    model_config = {"from_attributes": True}

class ReviewCreate(BaseModel):
    tutor_id: int
    rating: int      # 1-5
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    student_id: int
    tutor_id: int
    rating: int
    comment: Optional[str]

    model_config = {"from_attributes": True}