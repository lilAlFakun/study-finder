"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { getMyProfile, updateMyProfile, uploadAvatar, getMyBookingsAsStudent, getMyBookingsAsTutor, updateBookingStatus, completeBooking, cancelBooking, deleteMyAccount } from "@/lib/api";
import { User, Save, Camera, BookOpen, CheckCircle, XCircle, AlertCircle, Trash2, Shield } from "lucide-react";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "bookings">("profile");
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [completeModal, setCompleteModal] = useState<{ open: boolean; bookingId: number | null }>({ open: false, bookingId: null });
  const [lessonHeld, setLessonHeld] = useState<boolean | null>(null);
  const [failReason, setFailReason] = useState("");
  const [completeLoading, setCompleteLoading] = useState(false);

  // Модальное окно удаления аккаунта
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [addingLesson, setAddingLesson] = useState(false);
  const [lessonDate, setLessonDate] = useState("");
  const [lessonNote, setLessonNote] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    getMyProfile()
      .then(data => { setProfile(data); setForm(data); })
      .catch(() => { window.location.href = "/login"; })
      .finally(() => setLoading(false));
  }, []);

  const loadBookings = async (role: string) => {
    setBookingsLoading(true);
    try {
      const data = role === "student"
        ? await getMyBookingsAsStudent()
        : await getMyBookingsAsTutor();
      setBookings(data);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleTabChange = (tab: "profile" | "bookings") => {
    setActiveTab(tab);
    if (tab === "bookings" && profile) loadBookings(profile.role);
  };

  const handleBookingAction = async (id: number, status: "accepted" | "rejected") => {
    await updateBookingStatus(id, status);
    loadBookings(profile.role);
  };

  const openCompleteModal = (bookingId: number) => {
    setLessonHeld(null);
    setFailReason("");
    setCompleteModal({ open: true, bookingId });
  };

  const handleComplete = async () => {
    if (lessonHeld === null) return;
    if (!lessonHeld && !failReason.trim()) return;
    setCompleteLoading(true);
    try {
      await completeBooking(completeModal.bookingId!, {
        lesson_held: lessonHeld,
        fail_reason: lessonHeld ? undefined : failReason,
      });
      setCompleteModal({ open: false, bookingId: null });
      loadBookings(profile.role);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Вы уверены, что хотите отменить заявку?")) return;
    try {
      await cancelBooking(id);
      loadBookings(profile.role);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "УДАЛИТЬ") return;
    setDeleteLoading(true);
    try {
      await deleteMyAccount();
      localStorage.clear();
      window.location.href = "/";
    } catch (err: any) {
      alert(err.message);
      setDeleteLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      accepted: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      completed: "bg-blue-100 text-blue-700",
      failed: "bg-orange-100 text-orange-700",
      cancelled: "bg-gray-100 text-gray-500",
    };
    const labels: Record<string, string> = {
      pending: "Ожидает ответа",
      accepted: "Принята",
      rejected: "Отклонена",
      completed: "Занятие состоялось",
      failed: "Занятие не состоялось",
      cancelled: "Отменена",
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[status] || "bg-gray-100 text-gray-500"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData: any = { name: form.name, phone: form.phone, city: form.city, bio: form.bio, study_level: form.study_level };
      if (profile.role === "tutor") {
        updateData.subject = form.subject;
        updateData.formats = form.formats;
      }
      const updated = await updateMyProfile(updateData);
      setProfile(updated);
      localStorage.setItem("userName", updated.name);
      setMessage("Профиль успешно обновлён!");
      setMessageType("success");
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const updated = await uploadAvatar(file);
      setProfile(updated);
      setMessage("Аватар обновлён!");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Ошибка загрузки аватара");
      setMessageType("error");
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

  const bookingTypeLabel = (type: string) => {
    if (!type || type === "single") return "Единоразово";
    if (type === "range") return "Диапазон дат";
    if (type === "subscription") return "Абонемент";
    return type;
  };

  const lessonStatusLabel = (status: string) => {
    if (status === "scheduled") return { label: "Запланировано", color: "text-gray-500" };
    if (status === "completed") return { label: "Проведено", color: "text-green-600" };
    if (status === "missed") return { label: "Пропущено", color: "text-red-500" };
    if (status === "cancelled") return { label: "Отменено", color: "text-gray-400" };
    return { label: status, color: "text-gray-500" };
  };

  const handleAddLesson = async (bookingId: number) => {
    const token = localStorage.getItem("token");
    setAddingLesson(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lesson_date: lessonDate || undefined, tutor_note: lessonNote || undefined }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // обновляем selectedBooking
      await loadBookings(profile.role);
      setLessonDate("");
      setLessonNote("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingLesson(false);
    }
  };

  const handleLessonStatus = async (bookingId: number, lessonId: number, status: string) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      // Перезагружаем заявки
      loadBookings(profile.role);
      setSelectedBooking((prev: any) => prev ? {
        ...prev,
        lessons: prev.lessons.map((l: any) => l.id === lessonId ? { ...l, status } : l)
      } : null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleWithdraw = async (bookingId: number) => {
    const token = localStorage.getItem("token");
    if (!confirm("Вы уверены, что хотите отказаться от заявки?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/withdraw`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      loadBookings(profile.role);
      setSelectedBooking(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Личный кабинет</h1>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button onClick={() => handleTabChange("profile")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === "profile" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <User className="w-4 h-4 inline mr-1" />Профиль
          </button>
          <button onClick={() => handleTabChange("bookings")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === "bookings" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <BookOpen className="w-4 h-4 inline mr-1" />Заявки
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-md mb-6 ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Левая колонка */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-28 h-28 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center">
                  {profile.avatar ? (
                    <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://127.0.0.1:8000"}/${profile.avatar}`} />
                  ) : (
                    <User className="w-14 h-14 text-blue-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-blue-600 transition">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                </label>
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-800">{profile.name}</h3>
              <p className="text-gray-500 text-sm mb-1">{profile.email}</p>
              <span className={`text-xs px-3 py-1 rounded-full mt-2 ${profile.role === "tutor" ? "bg-blue-100 text-blue-600" : profile.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-green-100 text-green-600"}`}>
                {profile.role === "tutor" ? "Репетитор" : profile.role === "admin" ? "Администратор" : "Ученик"}
              </span>

              {/* Кнопка удаления аккаунта */}
              <button
                onClick={() => { setDeleteModal(true); setDeleteConfirmText(""); }}
                className="mt-6 w-full flex items-center justify-center gap-2 text-red-500 border border-red-200 text-sm px-4 py-2 rounded-md hover:bg-red-50 transition">
                <Trash2 className="w-4 h-4" />
                Удалить аккаунт
              </button>

              {profile.role === "admin" && (
                <a href="/admin"
                  className="mt-3 w-full flex items-center justify-center gap-2 text-purple-600 border border-purple-200 text-sm px-4 py-2 rounded-md hover:bg-purple-50 transition">
                  <Shield className="w-4 h-4" />
                  Панель администратора
                </a>
              )}
            </div>

            {/* Правая колонка — форма */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Редактировать профиль</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                    <input type="text" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                    <input type="tel" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+7 999 123-45-67" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
                  <input type="text" value={form.city || ""} onChange={e => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Москва" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Уровень обучения</label>
                  <select value={form.study_level || ""} onChange={e => setForm({ ...form, study_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Не указан</option>
                    <option value="Дошкольник">Дошкольник</option>
                    <option value="Школьник">Школьник</option>
                    <option value="Студент">Студент</option>
                  </select>
                </div>
                {profile.role === "tutor" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Предмет</label>
                      <input type="text" value={form.subject || ""} onChange={e => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Математика, Физика..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Формат занятий</label>
                      <div className="flex flex-wrap gap-4">
                        {["Онлайн", "Очно"].map(f => (
                          <label key={f} className="inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={(form.formats || "").includes(f)}
                              onChange={e => {
                                const formats = (form.formats || "").split(",").filter(Boolean);
                                const updated = e.target.checked ? [...formats, f] : formats.filter((x: string) => x !== f);
                                setForm({ ...form, formats: updated.join(",") });
                              }}
                              className="h-4 w-4 text-blue-600" />
                            <span className="ml-2 text-gray-700">{f}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">О себе</label>
                  <textarea value={form.bio || ""} onChange={e => setForm({ ...form, bio: e.target.value })}
                    rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Расскажите о себе..." />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition disabled:opacity-50">
                    <Save className="w-4 h-4" />
                    {saving ? "Сохранение..." : "Сохранить"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {profile.role === "student" ? "Мои заявки репетиторам" : "Заявки от учеников"}
            </h3>
            {bookingsLoading ? (
              <div className="text-gray-400 text-center py-8">Загрузка...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>Заявок пока нет</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b: any) => (
                  <div key={b.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {profile.role === "student" ? `Репетитор: ${b.tutor_name}` : `Ученик: ${b.student_name}`}
                        </p>
                        {b.subject && <p className="text-sm text-gray-600">Предмет: {b.subject}</p>}
                        <p className="text-sm text-gray-500">{bookingTypeLabel(b.booking_type)}</p>
                        {b.booking_type === "range" && b.date_from && (
                          <p className="text-sm text-gray-500">
                            {new Date(b.date_from).toLocaleDateString("ru-RU")} — {new Date(b.date_to).toLocaleDateString("ru-RU")}
                          </p>
                        )}
                        {b.booking_type === "subscription" && b.total_lessons && (
                          <p className="text-sm text-gray-500">
                            {b.completed_lessons} из {b.total_lessons} занятий
                          </p>
                        )}
                        {b.booking_type === "single" && b.date_single && (
                          <p className="text-sm text-gray-500">{new Date(b.date_single).toLocaleDateString("ru-RU")}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          b.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          b.status === "accepted" ? "bg-blue-100 text-blue-700" :
                          b.status === "in_progress" ? "bg-purple-100 text-purple-700" :
                          b.status === "completed" ? "bg-green-100 text-green-700" :
                          b.status === "cancelled" ? "bg-gray-100 text-gray-500" :
                          b.status === "rejected" ? "bg-red-100 text-red-500" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {b.status === "pending" ? "Ожидает" :
                          b.status === "accepted" ? "Принята" :
                          b.status === "in_progress" ? "В процессе" :
                          b.status === "completed" ? "Завершена" :
                          b.status === "cancelled" ? "Отменена" :
                          b.status === "rejected" ? "Отклонена" :
                          b.status === "failed" ? "Сорвалась" : b.status}
                        </span>
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="text-sm text-blue-500 hover:underline"
                        >
                          Подробнее →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Модальное окно завершения заявки */}
      {completeModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Завершение заявки</h3>
            <p className="text-gray-600 mb-5">Удалось провести занятие?</p>
            <div className="flex gap-3 mb-4">
              <button onClick={() => setLessonHeld(true)}
                className={`flex-1 py-2 rounded-md font-medium border-2 transition ${lessonHeld === true ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-green-300"}`}>
                ✅ Да
              </button>
              <button onClick={() => setLessonHeld(false)}
                className={`flex-1 py-2 rounded-md font-medium border-2 transition ${lessonHeld === false ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 text-gray-600 hover:border-red-300"}`}>
                ❌ Нет
              </button>
            </div>
            {lessonHeld === false && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Укажите причину <span className="text-red-500">*</span>
                </label>
                <textarea value={failReason} onChange={e => setFailReason(e.target.value)} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Например: ученик не вышел на связь..." />
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCompleteModal({ open: false, bookingId: null })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition">
                Отмена
              </button>
              <button onClick={handleComplete}
                disabled={completeLoading || lessonHeld === null || (lessonHeld === false && !failReason.trim())}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50">
                {completeLoading ? "Сохранение..." : "Подтвердить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно удаления аккаунта */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Удалить аккаунт</h3>
            </div>
            <p className="text-gray-600 mb-2">Это действие <strong>необратимо</strong>. Будут удалены:</p>
            <ul className="text-sm text-gray-500 mb-4 space-y-1 list-disc list-inside">
              <li>Ваш профиль и все данные</li>
              <li>Все ваши заявки</li>
              {profile.role === "tutor" && <li>Все отзывы о вас</li>}
            </ul>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Введите <span className="font-mono bg-gray-100 px-1 rounded">УДАЛИТЬ</span> для подтверждения:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 mb-4"
              placeholder="УДАЛИТЬ" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition">
                Отмена
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText !== "УДАЛИТЬ"}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50">
                {deleteLoading ? "Удаление..." : "Удалить аккаунт"}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-white py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 StudyFinder. Все права защищены.</p>
        </div>
      </footer>
            {/* Модалка подробнее */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Заявка #{selectedBooking.id}</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-2 text-sm text-gray-700 mb-4">
              {profile.role === "student"
                ? <p><span className="font-medium">Репетитор:</span> {selectedBooking.tutor_name}</p>
                : <p><span className="font-medium">Ученик:</span> {selectedBooking.student_name}</p>
              }
              {selectedBooking.subject && <p><span className="font-medium">Предмет:</span> {selectedBooking.subject}</p>}
              <p><span className="font-medium">Тип:</span> {bookingTypeLabel(selectedBooking.booking_type)}</p>

              {selectedBooking.booking_type === "single" && selectedBooking.date_single && (
                <p><span className="font-medium">Дата:</span> {new Date(selectedBooking.date_single).toLocaleDateString("ru-RU")}</p>
              )}
              {selectedBooking.booking_type === "range" && (
                <>
                  <p><span className="font-medium">Период:</span> {new Date(selectedBooking.date_from).toLocaleDateString("ru-RU")} — {new Date(selectedBooking.date_to).toLocaleDateString("ru-RU")}</p>
                  <p><span className="font-medium">Занятий в неделю:</span> {selectedBooking.lessons_per_week}</p>
                </>
              )}
              {selectedBooking.booking_type === "subscription" && (
                <>
                  <p><span className="font-medium">Всего занятий:</span> {selectedBooking.total_lessons}</p>
                  {selectedBooking.schedule_note && <p><span className="font-medium">Расписание:</span> {selectedBooking.schedule_note}</p>}
                </>
              )}

              {/* Прогресс-бар для subscription/range */}
              {selectedBooking.total_lessons > 0 && (
                <div>
                  <p className="font-medium mb-1">Прогресс: {selectedBooking.completed_lessons} / {selectedBooking.total_lessons}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((selectedBooking.completed_lessons / selectedBooking.total_lessons) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {selectedBooking.message && (
                <p><span className="font-medium">Сообщение:</span> «{selectedBooking.message}»</p>
              )}
              {selectedBooking.fail_reason && (
                <p className="text-red-500"><span className="font-medium">Причина:</span> {selectedBooking.fail_reason}</p>
              )}
            </div>

            {/* История занятий */}
            {selectedBooking.lessons && selectedBooking.lessons.length > 0 && (
              <div className="mb-4">
                <p className="font-medium text-gray-800 mb-2">История занятий:</p>
                <div className="space-y-2">
                  {selectedBooking.lessons.map((lesson: any) => {
                    const { label, color } = lessonStatusLabel(lesson.status);
                    return (
                      <div key={lesson.id} className="flex justify-between items-center border border-gray-100 rounded-lg p-2">
                        <div>
                          <p className="text-sm text-gray-700">
                            {lesson.lesson_date ? new Date(lesson.lesson_date).toLocaleDateString("ru-RU") : "Дата не указана"}
                          </p>
                          {lesson.tutor_note && <p className="text-xs text-gray-400">{lesson.tutor_note}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${color}`}>{label}</span>
                          {/* Кнопки смены статуса — только для репетитора */}
                          {profile.role === "tutor" && lesson.status === "scheduled" && (
                            <>
                              <button
                                onClick={() => handleLessonStatus(selectedBooking.id, lesson.id, "completed")}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                              >✓ Проведено</button>
                              <button
                                onClick={() => handleLessonStatus(selectedBooking.id, lesson.id, "missed")}
                                className="text-xs bg-red-100 text-red-500 px-2 py-1 rounded hover:bg-red-200"
                              >✗ Пропущено</button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Добавить занятие — только репетитор */}
            {profile.role === "tutor" && ["accepted", "in_progress"].includes(selectedBooking.status) && (
              <div className="border-t pt-4 mb-4">
                <p className="font-medium text-gray-800 mb-2">Добавить занятие:</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="date"
                    value={lessonDate}
                    onChange={(e) => setLessonDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                  />
                </div>
                <textarea
                  value={lessonNote}
                  onChange={(e) => setLessonNote(e.target.value)}
                  rows={2}
                  placeholder="Заметка (необязательно)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 mb-2"
                />
                <button
                  onClick={() => handleAddLesson(selectedBooking.id)}
                  disabled={addingLesson}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition"
                >
                  {addingLesson ? "Добавление..." : "Добавить занятие"}
                </button>
              </div>
            )}

            {/* Кнопки действий */}
            <div className="border-t pt-4 flex gap-3 flex-wrap">
              {/* Ученик: отменить */}
              {profile.role === "student" && ["pending", "accepted", "in_progress"].includes(selectedBooking.status) && (
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    if (!confirm("Отменить заявку?")) return;
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${selectedBooking.id}/cancel`, {
                      method: "PATCH", headers: { Authorization: `Bearer ${token}` }
                    });
                    loadBookings(profile.role);
                    setSelectedBooking(null);
                  }}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200 transition"
                >
                  Отозвать заявку
                </button>
              )}
              {/* Репетитор: принять/отклонить */}
              {profile.role === "tutor" && selectedBooking.status === "pending" && (
                <>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${selectedBooking.id}/status?status=accepted`, {
                        method: "PATCH", headers: { Authorization: `Bearer ${token}` }
                      });
                      loadBookings(profile.role);
                      setSelectedBooking(null);
                    }}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition"
                  >Принять</button>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${selectedBooking.id}/status?status=rejected`, {
                        method: "PATCH", headers: { Authorization: `Bearer ${token}` }
                      });
                      fetchBookings();
                      setSelectedBooking(null);
                    }}
                    className="px-4 py-2 bg-red-100 text-red-500 rounded-md text-sm hover:bg-red-200 transition"
                  >Отклонить</button>
                </>
              )}
              {/* Репетитор: отказаться от активной заявки */}
              {profile.role === "tutor" && ["accepted", "in_progress"].includes(selectedBooking.status) && (
                <button
                  onClick={() => handleWithdraw(selectedBooking.id)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm hover:bg-gray-200 transition"
                >Отказаться от заявки</button>
              )}
            </div>
          </div>
        </div>
    )}
    </div>
  );
}