from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.review import Review
from app.schemas.tutor import TutorCard, ReviewCreate, ReviewOut
from app.models.booking import BookingRequest as BookingModel, Lesson
from app.auth import get_current_user


router = APIRouter(prefix="/tutors", tags=["tutors"])


@router.get("", response_model=list[TutorCard])
async def get_tutors(
    city: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    study_level: Optional[str] = Query(None),
    format: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(User).where(User.role == "tutor")

    if city:
        query = query.where(User.city.ilike(f"%{city}%"))
    if subject:
        query = query.where(User.subject.ilike(f"%{subject}%"))
    if study_level:
        query = query.where(User.study_level == study_level)
    if format:
        query = query.where(User.formats.ilike(f"%{format}%"))

    result = await db.execute(query)
    tutors = result.scalars().all()

    tutor_cards = []
    for tutor in tutors:
        rating_result = await db.execute(
            select(func.avg(Review.rating), func.count(Review.id))
            .where(Review.tutor_id == tutor.id)
        )
        avg_rating, review_count = rating_result.one()

        lessons_result = await db.execute(
            select(func.count(Lesson.id))
            .join(BookingModel, BookingModel.id == Lesson.booking_id)
            .where(
                BookingModel.tutor_id == tutor.id,
                Lesson.status == "completed"
            )
        )
        lessons_count = lessons_result.scalar() or 0

        tutor_cards.append(TutorCard(
            id=tutor.id,
            name=tutor.name,
            city=tutor.city,
            subject=tutor.subject,
            phone=tutor.phone,
            formats=tutor.formats,
            study_level=tutor.study_level,
            bio=tutor.bio,
            avatar=tutor.avatar,
            avg_rating=round(float(avg_rating), 1) if avg_rating else None,
            review_count=review_count or 0,
            lessons_count=lessons_count,
        ))

    return tutor_cards


@router.get("/{tutor_id}", response_model=TutorCard)
async def get_tutor(tutor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.id == tutor_id, User.role == "tutor")
    )
    tutor = result.scalar_one_or_none()
    if not tutor:
        raise HTTPException(status_code=404, detail="Репетитор не найден")

    rating_result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .where(Review.tutor_id == tutor_id)
    )
    avg_rating, review_count = rating_result.one()

    lessons_result = await db.execute(
        select(func.count(Lesson.id))
        .join(BookingModel, BookingModel.id == Lesson.booking_id)
        .where(
            BookingModel.tutor_id == tutor_id,
            Lesson.status == "completed"
        )
    )
    lessons_count = lessons_result.scalar() or 0

    return TutorCard(
        id=tutor.id,
        name=tutor.name,
        city=tutor.city,
        subject=tutor.subject,
        phone=tutor.phone,
        formats=tutor.formats,
        study_level=tutor.study_level,
        bio=tutor.bio,
        avatar=tutor.avatar,
        avg_rating=round(float(avg_rating), 1) if avg_rating else None,
        review_count=review_count or 0,
        lessons_count=lessons_count,
    )


@router.post("/reviews", response_model=ReviewOut)
async def leave_review(
    data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Только ученики могут оставлять отзывы")
    if not 1 <= data.rating <= 5:
        raise HTTPException(status_code=400, detail="Рейтинг должен быть от 1 до 5")

    tutor = await db.get(User, data.tutor_id)
    if not tutor or tutor.role != "tutor":
        raise HTTPException(status_code=404, detail="Репетитор не найден")

    review = Review(
        tutor_id=data.tutor_id,
        student_id=current_user.id,
        rating=data.rating,
        comment=data.comment
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review


@router.get("/{tutor_id}/reviews")
async def get_tutor_reviews(tutor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review, User.name.label("student_name"))
        .join(User, Review.student_id == User.id)
        .where(Review.tutor_id == tutor_id)
        .order_by(Review.created_at.desc())
    )
    rows = result.all()
    return [
        {
            "id": r.Review.id,
            "rating": r.Review.rating,
            "comment": r.Review.comment,
            "student_name": r.student_name,
            "created_at": r.Review.created_at.strftime("%d.%m.%Y")
        }
        for r in rows
    ]