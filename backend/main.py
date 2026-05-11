from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routers import auth, tutors, profile, bookings, admin
import app.models.review
import app.models.booking  
import os

app = FastAPI(title="Tutor Finder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(auth.router)
app.include_router(tutors.router)
app.include_router(profile.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "Tutor Finder API работает"}
app.include_router(bookings.router)