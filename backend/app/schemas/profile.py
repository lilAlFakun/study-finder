from pydantic import BaseModel
from typing import Optional

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    study_level: Optional[str] = None
    # Только для репетиторов:
    subject: Optional[str] = None
    formats: Optional[str] = None

class ProfileOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str]
    city: Optional[str]
    bio: Optional[str]
    study_level: Optional[str]
    avatar: Optional[str]
    subject: Optional[str]
    formats: Optional[str]

    model_config = {"from_attributes": True}