from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import BookingRequest, User
from app.schemas.booking import BookingCreate, BookingResponse, BookingCompleteUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/", response_model=BookingResponse)
async def create_booking(
    data: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Только ученики могут оставлять заявки")

    # Проверь нет ли уже активной заявки
    existing = await db.execute(
        select(BookingRequest).where(
            BookingRequest.student_id == current_user.id,
            BookingRequest.tutor_id == data.tutor_id,
            BookingRequest.status == "pending",
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="У вас уже есть активная заявка этому репетитору")

    booking = BookingRequest(
        student_id=current_user.id,
        tutor_id=data.tutor_id,
        subject=data.subject,
        message=data.message,
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)

    student = await db.get(User, booking.student_id)
    tutor = await db.get(User, booking.tutor_id)
    result = BookingResponse.model_validate(booking)
    result.student_name = student.name if student else None
    result.tutor_name = tutor.name if tutor else None
    return result


@router.get("/my/as-student", response_model=list[BookingResponse])
async def get_my_bookings_as_student(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(BookingRequest).where(
            BookingRequest.student_id == current_user.id
        ).order_by(BookingRequest.created_at.desc())
    )
    bookings = result.scalars().all()
    out = []
    for b in bookings:
        tutor = await db.get(User, b.tutor_id)
        item = BookingResponse.model_validate(b)
        item.tutor_name = tutor.name if tutor else None
        out.append(item)
    return out


@router.get("/my/as-tutor", response_model=list[BookingResponse])
async def get_my_bookings_as_tutor(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(BookingRequest).where(
            BookingRequest.tutor_id == current_user.id
        ).order_by(BookingRequest.created_at.desc())
    )
    bookings = result.scalars().all()
    out = []
    for b in bookings:
        student = await db.get(User, b.student_id)
        item = BookingResponse.model_validate(b)
        item.student_name = student.name if student else None
        out.append(item)
    return out


@router.patch("/{booking_id}/status")
async def update_booking_status(
    booking_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if status not in ("accepted", "rejected"):
        raise HTTPException(status_code=400, detail="Недопустимый статус")

    booking = await db.get(BookingRequest, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    if booking.tutor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа")

    booking.status = status
    await db.commit()
    return {"status": booking.status}

@router.patch("/{booking_id}/complete")
async def complete_booking(
    booking_id: int,
    data: BookingCompleteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = await db.get(BookingRequest, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    if booking.tutor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    if booking.status != "accepted":
        raise HTTPException(status_code=400, detail="Завершить можно только принятую заявку")

    booking.lesson_held = data.lesson_held
    booking.fail_reason = data.fail_reason if not data.lesson_held else None
    booking.status = "completed" if data.lesson_held else "failed"
    await db.commit()
    return {"status": booking.status, "lesson_held": booking.lesson_held}


@router.patch("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = await db.get(BookingRequest, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    if booking.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    if booking.status not in ("pending", "accepted"):
        raise HTTPException(status_code=400, detail="Нельзя отменить эту заявку")

    booking.status = "cancelled"
    await db.commit()
    return {"status": booking.status}