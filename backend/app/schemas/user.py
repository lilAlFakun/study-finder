from pydantic import BaseModel, EmailStr
from enum import Enum

class UserRole(str, Enum):
    student = "student"
    tutor = "tutor"
    admin = "admin"

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str
    role: UserRole