"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { getTutor, leaveReview, getTutorReviews, createBooking } from "@/lib/api";
import { MapPin, Star, BookOpen, MessageSquare, Phone } from "lucide-react";

export default function TutorPage() {
  const { id } = useParams();
  const [tutor, setTutor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    subject: "",
    message: "",
    booking_type: "single",
    date_single: "",
    date_from: "",
    date_to: "",
    lessons_per_week: 1,
    total_lessons: "",
    schedule_note: "",
  });
  const [bookingMsg, setBookingMsg] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }
    setBookingLoading(true);
    setBookingError("");
    try {
      const payload: any = {
        tutor_id: Number(id),
        subject: bookingForm.subject,
        message: bookingForm.message,
        booking_type: bookingForm.booking_type,
      };
      if (bookingForm.booking_type === "single") {
        payload.date_single = bookingForm.date_single || undefined;
      } else if (bookingForm.booking_type === "range") {
        payload.date_from = bookingForm.date_from || undefined;
        payload.date_to = bookingForm.date_to || undefined;
        payload.lessons_per_week = bookingForm.lessons_per_week;
      } else if (bookingForm.booking_type === "subscription") {
        payload.total_lessons = bookingForm.total_lessons ? Number(bookingForm.total_lessons) : undefined;
        payload.schedule_note = bookingForm.schedule_note || undefined;
      }
      await createBooking(payload);
      setBookingMsg("Заявка успешно отправлена! Репетитор рассмотрит её в ближайшее время.");
      setShowBookingForm(false);
      setBookingForm({
        subject: "",
        message: "",
        booking_type: "single",
        date_single: "",
        date_from: "",
        date_to: "",
        lessons_per_week: 1,
        total_lessons: "",
        schedule_note: "",
      });
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://127.0.0.1:8000";

  const loadData = async () => {
    const [tutorData, reviewsData] = await Promise.all([
      getTutor(Number(id)),
      getTutorReviews(Number(id))
    ]);
    setTutor(tutorData);
    setReviews(reviewsData);
  };

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
    loadData().catch(() => setTutor(null)).finally(() => setLoading(false));
  }, [id]);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localStorage.getItem("token")) {
      setReviewError("Войдите в систему чтобы оставить отзыв");
      return;
    }
    setSubmitting(true);
    setReviewError("");
    try {
      await leaveReview({ tutor_id: Number(id), ...review });
      setReviewMsg("Отзыв успешно оставлен!");
      await loadData();
      setReview({ rating: 5, comment: "" });
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">Загрузка...</div>
      </main>
    </div>
  );

  if (!tutor) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">Репетитор не найден</div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">

        {/* Карточка репетитора */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center">
                {tutor.avatar ? (
                  <img src={`${baseUrl}/${tutor.avatar}`} alt={tutor.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-blue-500">{tutor.name[0]}</span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{tutor.name}</h1>
              {tutor.subject && (
                <p className="text-blue-500 flex items-center gap-1 mb-2">
                  <BookOpen className="w-4 h-4" />{tutor.subject}
                </p>
              )}
              {tutor.city && (
                <p className="text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-4 h-4" />{tutor.city}
                </p>
              )}
              {tutor.phone && (
                <p className="text-gray-500 flex items-center gap-1 mb-2">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${tutor.phone}`} className="hover:text-blue-500 transition">{tutor.phone ? tutor.phone.slice(0, 2) + '•'.repeat(tutor.phone.length - 4) + tutor.phone.slice(-2): ''}</a>
                </p>
              )}
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-gray-800">
                  {tutor.avg_rating ? tutor.avg_rating.toFixed(1) : "Нет оценок"}
                </span>
                <span className="text-gray-400 text-sm">({tutor.review_count} отзывов)</span>
              </div>

              {tutor.lessons_count > 0 && (
                <div className="flex items-center gap-1 mb-3 text-sm text-gray-500">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Проведено занятий: <strong className="text-gray-700">{tutor.lessons_count}</strong></span>
                </div>
              )}
              {tutor.formats && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tutor.formats.split(",").map((f: string) => (
                    <span key={f} className="bg-blue-50 text-blue-600 text-sm px-3 py-1 rounded-full">{f.trim()}</span>
                  ))}
                </div>
              )}
              {tutor.study_level && (
                <p className="text-gray-500 text-sm">Уровень: {tutor.study_level}</p>
              )}
            </div>
          </div>
          {tutor.bio && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
                <MessageSquare className="w-4 h-4" /> О себе
              </h3>
              <p className="text-gray-600">{tutor.bio}</p>
            </div>
          )}
          {/* Кнопка заявки */}
{userRole === "student" && (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 className="text-lg font-bold text-gray-800 mb-3">Записаться на занятие</h2>

    {bookingMsg && (
      <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{bookingMsg}</div>
    )}
    {bookingError && (
      <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{bookingError}</div>
    )}

    {!showBookingForm ? (
      <button
        onClick={() => setShowBookingForm(true)}
        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition">
        Оставить заявку
      </button>
    ) : (
      <form onSubmit={handleBooking} className="space-y-4">
        {/* Предмет */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Предмет</label>
          <input
            type="text"
            value={bookingForm.subject}
            onChange={(e) => setBookingForm({ ...bookingForm, subject: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="Например: Математика, ЕГЭ"
          />
        </div>

        {/* Тип занятий */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Тип занятий</label>
          <select
            value={bookingForm.booking_type}
            onChange={(e) => setBookingForm({ ...bookingForm, booking_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="single">Единоразово</option>
            <option value="range">Диапазон дат</option>
            <option value="subscription">Фиксированное кол-во занятий</option>
          </select>
        </div>

        {/* Поля для single */}
        {bookingForm.booking_type === "single" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата занятия</label>
            <input
              type="date"
              value={bookingForm.date_single}
              onChange={(e) => setBookingForm({ ...bookingForm, date_single: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
        )}

        {/* Поля для range */}
        {bookingForm.booking_type === "range" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
                <input
                  type="date"
                  value={bookingForm.date_from}
                  onChange={(e) => setBookingForm({ ...bookingForm, date_from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
                <input
                  type="date"
                  value={bookingForm.date_to}
                  onChange={(e) => setBookingForm({ ...bookingForm, date_to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Занятий в неделю</label>
              <select
                value={bookingForm.lessons_per_week}
                onChange={(e) => setBookingForm({ ...bookingForm, lessons_per_week: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                {[1,2,3,4,5,6,7].map(n => (
                  <option key={n} value={n}>{n} раз в неделю</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Поля для subscription */}
        {bookingForm.booking_type === "subscription" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Количество занятий</label>
              <input
                type="number"
                min={1}
                value={bookingForm.total_lessons}
                onChange={(e) => setBookingForm({ ...bookingForm, total_lessons: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Например: 8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пожелания по расписанию</label>
              <textarea
                value={bookingForm.schedule_note}
                onChange={(e) => setBookingForm({ ...bookingForm, schedule_note: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Например: по вторникам и четвергам вечером"
              />
            </div>
          </>
        )}

        {/* Сообщение */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Сообщение репетитору</label>
          <textarea
            value={bookingForm.message}
            onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="Укажите цели обучения..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={bookingLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            {bookingLoading ? "Отправка..." : "Отправить заявку"}
          </button>
          <button
            type="button"
            onClick={() => setShowBookingForm(false)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
          >
            Отмена
          </button>
        </div>
      </form>
    )}
  </div>
)}
{/* Незалогиненный пользователь */}
{!userRole && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
    <p className="text-blue-700 mb-2">Чтобы оставить заявку, необходимо войти в систему</p>
    <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition inline-block">
      Войти
    </a>
  </div>
)}
        </div>

        {/* Отзывы */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Отзывы ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-center py-6">Отзывов пока нет. Будьте первым!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">{r.student_name}</span>
                    <span className="text-gray-400 text-sm">{r.created_at}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`w-4 h-4 ${n <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                    ))}
                  </div>
                  {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Форма отзыва — только для учеников */}
      {userRole === "student" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Оставить отзыв</h2>
            {reviewMsg && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{reviewMsg}</div>}
            {reviewError && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{reviewError}</div>}
            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Оценка</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button"
                      onClick={() => setReview({ ...review, rating: n })}
                      className={`w-10 h-10 rounded-full font-semibold transition ${review.rating >= n ? "bg-yellow-400 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
                <textarea value={review.comment}
                  onChange={e => setReview({ ...review, comment: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Поделитесь впечатлениями..." />
              </div>
              <button type="submit" disabled={submitting}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50">
                {submitting ? "Отправка..." : "Отправить отзыв"}
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 StudyFinder. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}