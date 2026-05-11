from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.review import Review
from app.schemas.profile import ProfileUpdate, ProfileOut
from app.schemas.tutor import ReviewOut
from app.auth import get_current_user
import shutil, os, uuid

router = APIRouter(prefix="/profile", tags=["profile"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/me", response_model=ProfileOut)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=ProfileOut)
async def update_profile(
    data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    for field, value in data.model_dump(exclude_unset=True).items():
        # Репетиторские поля доступны только репетиторам
        if field in ("subject", "formats") and current_user.role != "tutor":
            continue
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.post("/me/avatar", response_model=ProfileOut)
async def upload_avatar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Разрешены только изображения (jpg, png, gif, webp)")

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    # Удали старый аватар если есть
    if current_user.avatar and os.path.exists(current_user.avatar):
        os.remove(current_user.avatar)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    current_user.avatar = filepath
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.get("/me/reviews", response_model=list[ReviewOut])
async def get_my_reviews(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "tutor":
        raise HTTPException(status_code=403, detail="Только для репетиторов")

    result = await db.execute(
        select(Review).where(Review.tutor_id == current_user.id)
    )
    return result.scalars().all()

@router.delete("/me")
async def delete_my_account(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.delete(current_user)
    await db.commit()
    return {"detail": "Аккаунт удалён"}