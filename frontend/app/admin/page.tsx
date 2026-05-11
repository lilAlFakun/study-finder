"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { adminGetUsers, adminDeleteUser, adminGetReviews, adminDeleteReview, adminGetBookings, adminDeleteBooking } from "@/lib/api";
import { Users, Star, BookOpen, Trash2, Shield, AlertTriangle, Search } from "lucide-react";

type Tab = "users" | "reviews" | "bookings";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Модальное окно подтверждения удаления
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: string; id: number; label: string }>({ open: false, type: "", id: 0, label: "" });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (!token) { window.location.href = "/login"; return; }
    if (role !== "admin") { window.location.href = "/dashboard"; return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [u, r, b] = await Promise.all([adminGetUsers(), adminGetReviews(), adminGetBookings()]);
      setUsers(u);
      setReviews(r);
      setBookings(b);
    } catch (err: any) {
      if (err.message?.includes("403") || err.message?.includes("Нет доступа")) {
        window.location.href = "/dashboard";
      }
    } finally {
      setLoading(false);
    }
  };

  const openConfirm = (type: string, id: number, label: string) => {
    setConfirmModal({ open: true, type, id, label });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (confirmModal.type === "user") await adminDeleteUser(confirmModal.id);
      else if (confirmModal.type === "review") await adminDeleteReview(confirmModal.id);
      else if (confirmModal.type === "booking") await adminDeleteBooking(confirmModal.id);
      setConfirmModal({ open: false, type: "", id: 0, label: "" });
      loadAll();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const roleColor = (role: string) => {
    const map: Record<string, string> = {
      tutor: "bg-blue-100 text-blue-700",
      student: "bg-green-100 text-green-700",
      admin: "bg-purple-100 text-purple-700",
    };
    const labels: Record<string, string> = { tutor: "Репетитор", student: "Ученик", admin: "Админ" };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[role] || "bg-gray-100 text-gray-500"}`}>{labels[role] || role}</span>;
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
      pending: "Ожидает", accepted: "Принята", rejected: "Отклонена",
      completed: "Завершена", failed: "Не состоялась", cancelled: "Отменена",
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || "bg-gray-100 text-gray-500"}`}>{labels[status] || status}</span>;
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredReviews = reviews.filter(r =>
    r.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredBookings = bookings.filter(b =>
    String(b.student_id).includes(search) || String(b.tutor_id).includes(search) ||
    b.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "users", label: "Пользователи", icon: <Users className="w-4 h-4" />, count: users.length },
    { key: "reviews", label: "Отзывы", icon: <Star className="w-4 h-4" />, count: reviews.length },
    { key: "bookings", label: "Заявки", icon: <BookOpen className="w-4 h-4" />, count: bookings.length },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">Загрузка панели...</div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">

        {/* Шапка */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Панель администратора</h1>
            <p className="text-gray-500 text-sm">Управление пользователями, отзывами и заявками</p>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Пользователей", value: users.length, icon: <Users className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50" },
            { label: "Отзывов", value: reviews.length, icon: <Star className="w-5 h-5 text-yellow-500" />, bg: "bg-yellow-50" },
            { label: "Заявок", value: bookings.length, icon: <BookOpen className="w-5 h-5 text-green-500" />, bg: "bg-green-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>{s.icon}</div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{s.value}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Вкладки */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setSearch(""); }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === t.key ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t.icon}{t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.key ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Поиск */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>

        {/* Таблица: Пользователи */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">ID</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Имя</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Роль</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Дата регистрации</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">Пользователи не найдены</td></tr>
                ) : filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">#{u.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">{roleColor(u.role)}</td>
                    <td className="px-4 py-3 text-gray-400">{u.created_at ? new Date(u.created_at).toLocaleDateString("ru-RU") : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== "admin" && (
                        <button onClick={() => openConfirm("user", u.id, u.name)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Таблица: Отзывы */}
        {activeTab === "reviews" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">ID</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Ученик</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Оценка</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Комментарий</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Дата</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReviews.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">Отзывы не найдены</td></tr>
                ) : filteredReviews.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">#{r.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.student_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-yellow-400" />{r.rating}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.comment || "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{r.created_at}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openConfirm("review", r.id, `Отзыв от ${r.student_name}`)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Таблица: Заявки */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">ID</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Ученик ID</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Репетитор ID</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Предмет</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Статус</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Дата</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBookings.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">Заявки не найдены</td></tr>
                ) : filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">#{b.id}</td>
                    <td className="px-4 py-3 text-gray-600">#{b.student_id}</td>
                    <td className="px-4 py-3 text-gray-600">#{b.tutor_id}</td>
                    <td className="px-4 py-3 text-gray-800">{b.subject || "—"}</td>
                    <td className="px-4 py-3">{statusBadge(b.status)}</td>
                    <td className="px-4 py-3 text-gray-400">{b.created_at}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openConfirm("booking", b.id, `Заявка #${b.id}`)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Модальное окно подтверждения удаления */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Подтверждение удаления</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить <strong>«{confirmModal.label}»</strong>? Это действие необратимо.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmModal({ open: false, type: "", id: 0, label: "" })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition">
                Отмена
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                {deleting ? "Удаление..." : "Удалить"}
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