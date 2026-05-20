from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import BookingRequest, User
from app.models.booking import Lesson
from app.schemas.booking import (
    BookingCreate, BookingResponse,
    LessonCreate, LessonOut, LessonStatusUpdate,
    BookingWithdrawUpdate
)
from app.auth import get_current_user


router = APIRouter(prefix="/bookings", tags=["bookings"])


# --- Создать заявку ---
@router.post("/", response_model=BookingResponse)
async def create_booking(
    data: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Только ученики могут оставлять заявки")

    existing = await db.execute(
        select(BookingRequest).where(
            BookingRequest.student_id == current_user.id,
            BookingRequest.tutor_id == data.tutor_id,
            BookingRequest.status.in_(["pending", "accepted", "in_progress"]),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="У вас уже есть активная заявка этому репетитору")

    total = data.total_lessons
    if data.booking_type == "range" and data.date_from and data.date_to and data.lessons_per_week:
        days = (data.date_to - data.date_from).days
        weeks = max(days / 7, 1)
        total = round(weeks * data.lessons_per_week)

    booking = BookingRequest(
        student_id=current_user.id,
        tutor_id=data.tutor_id,
        subject=data.subject,
        message=data.message,
        booking_type=data.booking_type,
        date_single=data.date_single,
        date_from=data.date_from,
        date_to=data.date_to,
        lessons_per_week=data.lessons_per_week,
        total_lessons=total,
        schedule_note=data.schedule_note,
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)

    student = await db.get(User, booking.student_id)
    tutor = await db.get(User, booking.tutor_id)
    return BookingResponse(
        id=booking.id,
        student_id=booking.student_id,
        tutor_id=booking.tutor_id,
        subject=booking.subject,
        message=booking.message,
        booking_type=booking.booking_type or "single",
        date_single=booking.date_single,
        date_from=booking.date_from,
        date_to=booking.date_to,
        lessons_per_week=booking.lessons_per_week,
        total_lessons=booking.total_lessons,
        completed_lessons=booking.completed_lessons or 0,
        schedule_note=booking.schedule_note,
        status=booking.status,
        fail_reason=booking.fail_reason,
        created_at=booking.created_at,
        student_name=student.name if student else None,
        tutor_name=tutor.name if tutor else None,
        lessons=[],
    )


# --- Мои заявки (ученик) ---
@router.get("/my/as-student", response_model=list[BookingResponse])
async def get_my_bookings_as_student(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(BookingRequest)
        .where(BookingRequest.student_id == current_user.id)
        .order_by(BookingRequest.created_at.desc())
    )
    bookings = result.scalars().all()
    out = []
    for b in bookings:
        tutor = await db.get(User, b.tutor_id)
        lessons_result = await db.execute(
            select(Lesson).where(Lesson.booking_id == b.id).order_by(Lesson.lesson_date)
        )
        lessons = list(lessons_result.scalars().all())
        out.append(BookingResponse(
            id=b.id,
            student_id=b.student_id,
            tutor_id=b.tutor_id,
            subject=b.subject,
            message=b.message,
            booking_type=b.booking_type or "single",
            date_single=b.date_single,
            date_from=b.date_from,
            date_to=b.date_to,
            lessons_per_week=b.lessons_per_week,
            total_lessons=b.total_lessons,
            completed_lessons=b.completed_lessons or 0,
            schedule_note=b.schedule_note,
            status=b.status,
            fail_reason=b.fail_reason,
            created_at=b.created_at,
            tutor_name=tutor.name if tutor else None,
            lessons=lessons,
        ))
    return out


# --- Мои заявки (репетитор) ---
@router.get("/my/as-tutor", response_model=list[BookingResponse])
async def get_my_bookings_as_tutor(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(BookingRequest)
        .where(BookingRequest.tutor_id == current_user.id)
        .order_by(BookingRequest.created_at.desc())
    )
    bookings = result.scalars().all()
    out = []
    for b in bookings:
        student = await db.get(User, b.student_id)
        lessons_result = await db.execute(
            select(Lesson).where(Lesson.booking_id == b.id).order_by(Lesson.lesson_date)
        )
        lessons = list(lessons_result.scalars().all())
        out.append(BookingResponse(
            id=b.id,
            student_id=b.student_id,
            tutor_id=b.tutor_id,
            subject=b.subject,
            message=b.message,
            booking_type=b.booking_type or "single",
            date_single=b.date_single,
            date_from=b.date_from,
            date_to=b.date_to,
            lessons_per_week=b.lessons_per_week,
            total_lessons=b.total_lessons,
            completed_lessons=b.completed_lessons or 0,
            schedule_note=b.schedule_note,
            status=b.status,
            fail_reason=b.fail_reason,
            created_at=b.created_at,
            student_name=student.name if student else None,
            lessons=lessons,
        ))
    return out


# --- Принять / Отклонить (репетитор) ---
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


# --- Отменить заявку (ученик) ---
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
    if booking.status not in ("pending", "accepted", "in_progress"):
        raise HTTPException(status_code=400, detail="Нельзя отменить эту заявку")

    booking.status = "cancelled"
    await db.commit()
    return {"status": booking.status}


# --- Отказаться от заявки (репетитор) ---
@router.patch("/{booking_id}/withdraw")
async def withdraw_booking(
    booking_id: int,
    data: BookingWithdrawUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = await db.get(BookingRequest, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    if booking.tutor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    if booking.status not in ("accepted", "in_progress"):
        raise HTTPException(status_code=400, detail="Нельзя отказаться от этой заявки")

    booking.status = "failed"
    booking.fail_reason = data.fail_reason
    await db.commit()
    return {"status": booking.status}


# --- Добавить занятие (репетитор) ---
@router.post("/{booking_id}/lessons", response_model=LessonOut)
async def add_lesson(
    booking_id: int,
    data: LessonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = await db.get(BookingRequest, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    if booking.tutor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    if booking.status not in ("accepted", "in_progress"):
        raise HTTPException(status_code=400, detail="Заявка должна быть принята")

    lesson = Lesson(
        booking_id=booking_id,
        lesson_date=data.lesson_date,
        tutor_note=data.tutor_note,
        status="scheduled",
    )
    db.add(lesson)

    if booking.status == "accepted":
        booking.status = "in_progress"

    await db.commit()
    await db.refresh(lesson)
    return lesson


# --- Обновить статус занятия (репетитор) ---
@router.patch("/{booking_id}/lessons/{lesson_id}", response_model=LessonOut)
async def update_lesson_status(
    booking_id: int,
    lesson_id: int,
    data: LessonStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = await db.get(BookingRequest, booking_id)
    if not booking or booking.tutor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа")

    lesson = await db.get(Lesson, lesson_id)
    if not lesson or lesson.booking_id != booking_id:
        raise HTTPException(status_code=404, detail="Занятие не найдено")

    lesson.status = data.status
    lesson.tutor_note = data.tutor_note or lesson.tutor_note

    if data.status == "completed":
        booking.completed_lessons = (booking.completed_lessons or 0) + 1

    if booking.total_lessons and booking.completed_lessons >= booking.total_lessons:
        booking.status = "completed"

    await db.commit()
    await db.refresh(lesson)
    return lesson