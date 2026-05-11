from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.review import Review
from app.models.booking import BookingRequest
from app.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Нет доступа")
    return current_user

# Все пользователи
@router.get("/users")
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "created_at": u.created_at} for u in users]

# Удалить пользователя
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Нельзя удалить администратора")
    await db.delete(user)
    await db.commit()
    return {"detail": "Пользователь удалён"}

# Все отзывы
@router.get("/reviews")
async def get_all_reviews(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(
        select(Review, User.name.label("student_name"))
        .join(User, Review.student_id == User.id)
        .order_by(Review.created_at.desc())
    )
    rows = result.all()
    return [
        {
            "id": r.Review.id,
            "rating": r.Review.rating,
            "comment": r.Review.comment,
            "student_name": r.student_name,
            "tutor_id": r.Review.tutor_id,
            "created_at": r.Review.created_at.strftime("%d.%m.%Y"),
        }
        for r in rows
    ]

# Удалить отзыв
@router.delete("/reviews/{review_id}")
async def delete_review(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    review = await db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден")
    await db.delete(review)
    await db.commit()
    return {"detail": "Отзыв удалён"}

# Все заявки
@router.get("/bookings")
async def get_all_bookings(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(BookingRequest).order_by(BookingRequest.created_at.desc()))
    bookings = result.scalars().all()
    return [
        {
            "id": b.id,
            "student_id": b.student_id,
            "tutor_id": b.tutor_id,
            "subject": b.subject,
            "status": b.status,
            "created_at": b.created_at.strftime("%d.%m.%Y"),
        }
        for b in bookings
    ]

# Удалить заявку
@router.delete("/bookings/{booking_id}")
async def delete_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    booking = await db.get(BookingRequest, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    await db.delete(booking)
    await db.commit()
    return {"detail": "Заявка удалена"}