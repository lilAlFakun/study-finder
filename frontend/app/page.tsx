"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import TutorCard from "@/components/TutorCard";
import { getTutors } from "@/lib/api";
import { Search, Star, Shield, Clock, Users, BookOpen, Award, ChevronRight, GraduationCap, Laptop, MapPin } from "lucide-react";

export default function Home() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTutors()
      .then(setTutors)
      .catch(() => setTutors([]))
      .finally(() => setLoading(false));
  }, []);

  const subjects = [
    { name: "Математика", icon: "📐", color: "bg-blue-50 text-blue-600 border-blue-100" },
    { name: "Физика", icon: "⚛️", color: "bg-purple-50 text-purple-600 border-purple-100" },
    { name: "Химия", icon: "🧪", color: "bg-green-50 text-green-600 border-green-100" },
    { name: "Английский", icon: "🇬🇧", color: "bg-red-50 text-red-600 border-red-100" },
    { name: "Русский язык", icon: "📝", color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
    { name: "История", icon: "📜", color: "bg-orange-50 text-orange-600 border-orange-100" },
    { name: "Информатика", icon: "💻", color: "bg-cyan-50 text-cyan-600 border-cyan-100" },
    { name: "Биология", icon: "🌿", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  ];

  const steps = [
    {
      num: "01",
      title: "Найдите репетитора",
      desc: "Используйте фильтры по предмету, городу и формату занятий чтобы найти подходящего специалиста.",
      icon: <Search className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      num: "02",
      title: "Отправьте заявку",
      desc: "Оставьте заявку с описанием ваших целей и удобного времени для занятий.",
      icon: <BookOpen className="w-6 h-6" />,
      color: "bg-indigo-500",
    },
    {
      num: "03",
      title: "Начните обучение",
      desc: "Репетитор примет заявку и вы сможете приступить к занятиям в удобном формате.",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "bg-violet-500",
    },
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: "Проверенные репетиторы",
      desc: "Все преподаватели проходят регистрацию и имеют реальные отзывы от учеников.",
      bg: "bg-blue-50",
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      title: "Система рейтингов",
      desc: "Честные оценки и отзывы помогут выбрать лучшего специалиста для ваших целей.",
      bg: "bg-yellow-50",
    },
    {
      icon: <Laptop className="w-6 h-6 text-green-500" />,
      title: "Гибкий формат проведения",
      desc: "Выбирайте удобный формат: занятия дома у репетитора или через видеосвязь.",
      bg: "bg-green-50",
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-500" />,
      title: "Удобное расписание",
      desc: "Договаривайтесь напрямую с репетитором о времени, которое удобно именно вам.",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
          {/* Декоративные круги */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

          <div className="relative max-w-5xl mx-auto px-4 py-24 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-blue-100 text-sm px-4 py-1.5 rounded-full mb-6">
              <Award className="w-4 h-4" />
              Платформа для поиска репетиторов
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Найди своего<br />
              <span className="text-white">идеального репетитора</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Опытные преподаватели по любым предметам. Удобный выбор проведения занятий. Подбери специалиста под свои цели уже сегодня.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition text-base shadow-lg shadow-blue-900/20">
                <Search className="w-5 h-5" />
                Найти репетитора
              </Link>
              <Link href="/register"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition text-base backdrop-blur-sm">
                Стать репетитором
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Мини-статистика */}
            <div className="flex flex-wrap justify-center gap-8 mt-14">
              {[
                { icon: <Users className="w-5 h-5" />, value: tutors.length || "0", label: "Репетиторов" },
                { icon: <Star className="w-5 h-5" />, value: "4.8", label: "Средний рейтинг" },
                { icon: <BookOpen className="w-5 h-5" />, value: "20+", label: "Предметов" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-lg">{s.icon}</div>
                  <div className="text-left">
                    <div className="text-2xl font-bold">{s.value}</div>
                    <div className="text-blue-200 text-sm">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Предметы */}
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Популярные предметы</h2>
            <Link href="/search" className="text-blue-500 text-sm hover:text-blue-600 flex items-center gap-1">
              Все предметы <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {subjects.map((s) => (
              <Link key={s.name} href={`/search?subject=${encodeURIComponent(s.name)}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${s.color} hover:shadow-md transition font-medium`}>
                <span className="text-xl">{s.icon}</span>
                {s.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Как это работает */}
        <section className="bg-white py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Как это работает</h2>
              <p className="text-gray-500">Начать заниматься с репетитором легко — всего три шага</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={i} className="relative text-center">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-2/3 w-full h-0.5 bg-gray-100 z-0" />
                  )}
                  <div className={`relative z-10 w-16 h-16 ${step.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    {step.icon}
                  </div>
                  <div className="text-xs font-bold text-gray-300 mb-1 tracking-widest">{step.num}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Преимущества */}
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Почему StudyFinder</h2>
            <p className="text-gray-500">Мы делаем поиск репетитора простым и надёжным</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Репетиторы */}
        <section className="bg-white py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Репетиторы на сайте</h2>
                <p className="text-gray-500 text-sm mt-1">Познакомьтесь с нашими преподавателями</p>
              </div>
              {tutors.length > 0 && (
                <Link href="/search" className="text-blue-500 text-sm hover:text-blue-600 flex items-center gap-1">
                  Все репетиторы <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : tutors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {tutors.slice(0, 8).map((t) => <TutorCard key={t.id} {...t} />)}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-xl">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium text-gray-500">Репетиторов пока нет</p>
                <p className="text-sm mt-2">Зарегистрируйся как репетитор и заполни профиль</p>
                <Link href="/register" className="inline-block mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition text-sm">
                  Зарегистрироваться
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* CTA баннер */}
        <section className="bg-gradient-to-r from-indigo-600 to-blue-600 py-16 px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Вы репетитор?</h2>
            <p className="text-indigo-100 text-lg mb-8">
              Создайте профиль бесплатно и начните получать учеников уже сегодня
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition">
                <GraduationCap className="w-5 h-5" />
                Зарегистрироваться как репетитор
              </Link>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <div className="text-xl font-bold text-white mb-1">StudyFinder</div>
              <p className="text-gray-400 text-sm">Платформа для поиска репетиторов</p>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/search" className="hover:text-white transition">Найти репетитора</Link>
              <Link href="/register" className="hover:text-white transition">Стать репетитором</Link>
              <Link href="/login" className="hover:text-white transition">Войти</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
            © 2025 StudyFinder. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}