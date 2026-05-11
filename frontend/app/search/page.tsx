"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import TutorCard from "@/components/TutorCard";
import { getTutors } from "@/lib/api";
import { Search, SlidersHorizontal } from "lucide-react";

export default function SearchPage() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    city: "", subject: "", study_level: "", format: ""
  });

  const fetchTutors = async (params = {}) => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "")
      );
      const data = await getTutors(clean as Record<string, string>);
      setTutors(data);
    } catch {
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTutors(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTutors(filters);
  };

  const handleReset = () => {
    const empty = { city: "", subject: "", study_level: "", format: "" };
    setFilters(empty);
    fetchTutors(empty);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Найти репетитора</h1>

        {/* Фильтры */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">Фильтры</h2>
          </div>
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
                <input type="text" value={filters.city}
                  onChange={e => setFilters({ ...filters, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Москва" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Предмет</label>
                <input type="text" value={filters.subject}
                  onChange={e => setFilters({ ...filters, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Математика" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Уровень обучения</label>
                <select value={filters.study_level}
                  onChange={e => setFilters({ ...filters, study_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                  <option value="">Любой</option>
                  <option value="Дошкольник">Дошкольник</option>
                  <option value="Школьник">Школьник</option>
                  <option value="Студент">Студент</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Формат</label>
                <select value={filters.format}
                  onChange={e => setFilters({ ...filters, format: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                  <option value="">Любой</option>
                  <option value="Онлайн">Онлайн</option>
                  <option value="Очно">Очно</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit"
                className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition">
                <Search className="w-4 h-4" />
                Найти
              </button>
              <button type="button" onClick={handleReset}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition">
                Сбросить
              </button>
            </div>
          </form>
        </div>

        {/* Результаты */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-64 animate-pulse" />
            ))}
          </div>
        ) : tutors.length > 0 ? (
          <>
            <p className="text-gray-500 text-sm mb-4">Найдено репетиторов: {tutors.length}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map(t => <TutorCard key={t.id} {...t} />)}
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Репетиторы не найдены</p>
            <p className="text-sm mt-2">Попробуй изменить фильтры</p>
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