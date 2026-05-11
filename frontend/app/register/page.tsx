"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { registerUser } from "@/lib/api";
import { GraduationCap } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(form);
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-6">
            <GraduationCap className="text-blue-500 w-8 h-8" />
            <h2 className="text-2xl font-bold text-gray-800">Регистрация</h2>
          </div>

          {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input
                type="text" required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Введите ваше имя"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="example@mail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <input
                type="password" required minLength={6}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Минимум 6 символов"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Я регистрируюсь как</label>
              <div className="flex gap-6">
                <label className="inline-flex items-center cursor-pointer">
                  <input type="radio" name="role" value="student"
                    checked={form.role === "student"}
                    onChange={() => setForm({ ...form, role: "student" })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Ученик</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="radio" name="role" value="tutor"
                    checked={form.role === "tutor"}
                    onChange={() => setForm({ ...form, role: "tutor" })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Репетитор</span>
                </label>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition disabled:opacity-50">
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">Войти</Link>
          </p>
        </div>
      </main>
    </div>
  );
}