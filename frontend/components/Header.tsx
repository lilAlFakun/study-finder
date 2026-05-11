"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GraduationCap, Menu, X, Sun, Moon } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("userRole");
    if (token && name && role) setUser({ name, role });

    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    window.location.href = "/";
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="text-blue-500 w-7 h-7" />
          <span className="text-xl font-bold text-gray-800">StudyFinder</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-blue-500 transition">Главная</Link>
          <Link href="/search" className="text-gray-600 hover:text-blue-500 transition">Найти репетитора</Link>
          {!user ? (
            <>
              <Link href="/register" className="text-gray-600 hover:text-blue-500 transition">Регистрация</Link>
              <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">Войти</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-500 transition">
                Кабинет ({user.name})
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="text-purple-600 hover:text-purple-700 transition font-medium">
                  Админ-панель
                </Link>
              )}
              <button onClick={logout} className="text-red-500 hover:text-red-600 transition">Выйти</button>
            </>
          )}
          {/* Кнопка темы */}
          <button onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600"
            aria-label="Переключить тему">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="text-gray-600">Главная</Link>
          <Link href="/search" className="text-gray-600">Найти репетитора</Link>
          {!user ? (
            <>
              <Link href="/register" className="text-gray-600">Регистрация</Link>
              <Link href="/login" className="text-gray-600">Войти</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-gray-600">Личный кабинет</Link>
              <button onClick={logout} className="text-red-500 text-left">Выйти</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}