from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Enum as SAEnum
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id               = Column(Integer, primary_key=True, index=True)
    name             = Column(String, nullable=False)
    email            = Column(String, unique=True, index=True, nullable=False)
    hashed_password  = Column(String, nullable=False)
    role             = Column(SAEnum("student", "tutor", "admin", name="user_role"), nullable=False)
    phone            = Column(String, nullable=True)
    city             = Column(String, nullable=True)
    bio              = Column(Text, nullable=True)
    study_level      = Column(String, nullable=True)
    avatar           = Column(String, nullable=True)
    subject          = Column(String, nullable=True)
    formats          = Column(String, nullable=True)
    rating           = Column(Float, default=0.0)
    reviews_count    = Column(Integer, default=0)
    created_at       = Column(DateTime, default=datetime.utcnow)
