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
                  <div key={b.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {profile.role === "student" ? `Репетитор: ${b.tutor_name}` : `Ученик: ${b.student_name}`}
                        </p>
                        {b.subject && <p className="text-sm text-gray-500 mt-1">Предмет: {b.subject}</p>}
                        {b.message && <p className="text-sm text-gray-600 mt-1 italic">«{b.message}»</p>}
                        {b.fail_reason && (
                          <p className="text-sm text-orange-600 mt-1">
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            Причина: {b.fail_reason}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">{new Date(b.created_at).toLocaleDateString("ru-RU")}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        {statusBadge(b.status)}
                        {profile.role === "tutor" && b.status === "pending" && (
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => handleBookingAction(b.id, "accepted")}
                              className="flex items-center gap-1 bg-green-500 text-white text-xs px-3 py-1 rounded-md hover:bg-green-600 transition">
                              <CheckCircle className="w-3 h-3" /> Принять
                            </button>
                            <button onClick={() => handleBookingAction(b.id, "rejected")}
                              className="flex items-center gap-1 bg-red-500 text-white text-xs px-3 py-1 rounded-md hover:bg-red-600 transition">
                              <XCircle className="w-3 h-3" /> Отклонить
                            </button>
                          </div>
                        )}
                        {profile.role === "tutor" && b.status === "accepted" && (
                          <button onClick={() => openCompleteModal(b.id)}
                            className="flex items-center gap-1 bg-blue-500 text-white text-xs px-3 py-1 rounded-md hover:bg-blue-600 transition mt-1">
                            <CheckCircle className="w-3 h-3" /> Завершить заявку
                          </button>
                        )}
                        {profile.role === "student" && (b.status === "pending" || b.status === "accepted") && (
                          <button onClick={() => handleCancel(b.id)}
                            className="flex items-center gap-1 bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-md hover:bg-gray-300 transition mt-1">
                            <XCircle className="w-3 h-3" /> Отменить заявку
                          </button>
                        )}
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
    </div>
  );
}