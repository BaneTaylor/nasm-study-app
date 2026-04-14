import Link from "next/link";
import { chapters } from "@/lib/chapters/chapter-data";

export default function ChaptersPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Chapter Summaries
            </h1>
            <p className="text-gray-400">
              Condensed notes for all 20 NASM CPT chapters
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white text-sm"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.map((chapter) => (
            <Link
              key={chapter.number}
              href={`/chapters/${chapter.number}`}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-purple-500 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl font-bold text-purple-500 tabular-nums">
                  {String(chapter.number).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h2 className="text-white font-semibold group-hover:text-purple-400 transition-colors leading-tight">
                    {chapter.title}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {chapter.keyTerms.length} key terms &middot;{" "}
                    {chapter.keyConcepts.length} concepts
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
