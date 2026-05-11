import Link from "next/link";
import { MapPin, Star, BookOpen } from "lucide-react";

interface TutorCardProps {
  id: number;
  name: string;
  city?: string;
  subject?: string;
  formats?: string;
  bio?: string;
  avg_rating?: number;
  review_count: number;
  avatar?: string;
}

export default function TutorCard({ id, name, city, subject, formats, bio, avg_rating, review_count, avatar }: TutorCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col">
      <div className="relative h-48 bg-gray-100 flex items-center justify-center">
        {avatar ? (
          <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://127.0.0.1:8000"}/${avatar}`} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-3xl font-bold text-blue-500">{name[0]}</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h4 className="font-bold text-lg mb-1 text-gray-800">{name}</h4>
        {subject && (
          <p className="text-blue-500 text-sm mb-1 flex items-center gap-1">
            <BookOpen className="w-4 h-4" />{subject}
          </p>
        )}
        {city && (
          <p className="text-gray-500 text-sm mb-2 flex items-center gap-1">
            <MapPin className="w-4 h-4" />{city}
          </p>
        )}
        {bio && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bio}</p>}
        {formats && (
          <p className="text-gray-400 text-xs mb-3">{formats}</p>
        )}
        <div className="mt-auto flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-gray-600 text-sm">
              {avg_rating ? avg_rating.toFixed(1) : "Нет оценок"} ({review_count})
            </span>
          </div>
          <Link href={`/tutors/${id}`} className="text-blue-500 hover:text-blue-700 text-sm font-medium">
            Подробнее →
          </Link>
        </div>
      </div>
    </div>
  );
}