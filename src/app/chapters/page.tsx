import Link from "next/link";
import { chapters } from "@/lib/chapters/chapter-data";
import ChapterSearch from "./chapter-search";

export default function ChaptersPage() {
  const chapterData = chapters.map((ch) => ({
    number: ch.number,
    title: ch.title,
    termCount: ch.keyTerms.length,
    conceptCount: ch.keyConcepts.length,
  }));

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Chapter Summaries
            </h1>
            <p className="text-gray-400 mt-1">
              Condensed notes for all 20 NASM CPT chapters
            </p>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 px-4 py-2.5 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-xl transition-colors text-sm"
          >
            Dashboard
          </Link>
        </div>

        <ChapterSearch chapters={chapterData} />
      </div>
    </div>
  );
}
