const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Ошибка сервера" }));
    throw new Error(error.detail || "Ошибка сервера");
  }
  return res.json();
}

// Auth
export const registerUser = (data: object) =>
  request("/auth/register", { method: "POST", body: JSON.stringify(data) });

export const loginUser = (data: object) =>
  request("/auth/login", { method: "POST", body: JSON.stringify(data) });

// Tutors
export const getTutors = (params?: Record<string, string>) => {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return request(`/tutors${query}`);
};

export const getTutor = (id: number) => request(`/tutors/${id}`);

// Profile
export const getMyProfile = () => request("/profile/me");

export const updateMyProfile = (data: object) =>
  request("/profile/me", { method: "PUT", body: JSON.stringify(data) });

export const uploadAvatar = (file: File) => {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  return fetch(`${base}/profile/me/avatar`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  }).then((r) => r.json());
};

// Reviews
export const leaveReview = (data: object) =>
  request("/tutors/reviews", { method: "POST", body: JSON.stringify(data) });

export const getTutorReviews = (id: number) =>
  request(`/tutors/${id}/reviews`);

export const createBooking = (data: { tutor_id: number; subject?: string; message?: string }) =>
  request('/bookings/', { method: 'POST', body: JSON.stringify(data) });

export const getMyBookingsAsStudent = () =>
  request('/bookings/my/as-student');

export const getMyBookingsAsTutor = () =>
  request('/bookings/my/as-tutor');

export const updateBookingStatus = (id: number, status: 'accepted' | 'rejected') =>
  request(`/bookings/${id}/status?status=${status}`, { method: 'PATCH' });

export const completeBooking = (id: number, data: { lesson_held: boolean; fail_reason?: string }) =>
  request(`/bookings/${id}/complete`, { method: 'PATCH', body: JSON.stringify(data) });

export const cancelBooking = (id: number) =>
  request(`/bookings/${id}/cancel`, { method: 'PATCH' });

// Удаление своего аккаунта
export const deleteMyAccount = () =>
  request('/profile/me', { method: 'DELETE' });

// Админ
export const adminGetUsers = () => request('/admin/users');
export const adminDeleteUser = (id: number) => request(`/admin/users/${id}`, { method: 'DELETE' });
export const adminGetReviews = () => request('/admin/reviews');
export const adminDeleteReview = (id: number) => request(`/admin/reviews/${id}`, { method: 'DELETE' });
export const adminGetBookings = () => request('/admin/bookings');
export const adminDeleteBooking = (id: number) => request(`/admin/bookings/${id}`, { method: 'DELETE' });