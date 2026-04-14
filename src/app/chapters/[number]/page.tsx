import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapter, chapters } from "@/lib/chapters/chapter-data";

export function generateStaticParams() {
  return chapters.map((ch) => ({ number: String(ch.number) }));
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const chapterNumber = parseInt(number, 10);
  const chapter = getChapter(chapterNumber);

  if (!chapter) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/chapters"
            className="text-gray-400 hover:text-white text-sm inline-flex items-center gap-1 mb-4"
          >
            &larr; All Chapters
          </Link>
          <div className="flex items-start gap-4">
            <span className="text-4xl font-bold text-purple-500 tabular-nums leading-none mt-1">
              {String(chapter.number).padStart(2, "0")}
            </span>
            <h1 className="text-2xl font-bold text-white leading-tight">
              {chapter.title}
            </h1>
          </div>
        </div>

        {/* Summary */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Summary</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-300 leading-relaxed">{chapter.summary}</p>
          </div>
        </section>

        {/* Key Terms */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Key Terms</h2>
          <div className="space-y-3">
            {chapter.keyTerms.map((item) => (
              <div
                key={item.term}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5"
              >
                <dt className="text-purple-400 font-semibold mb-1">
                  {item.term}
                </dt>
                <dd className="text-gray-400 text-sm leading-relaxed">
                  {item.definition}
                </dd>
              </div>
            ))}
          </div>
        </section>

        {/* Key Concepts */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">
            Key Concepts
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <ul className="space-y-3">
              {chapter.keyConcepts.map((concept, i) => (
                <li key={i} className="flex gap-3 text-gray-300 text-sm">
                  <span className="text-purple-500 mt-0.5 shrink-0">
                    &#x2022;
                  </span>
                  <span className="leading-relaxed">{concept}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Quick-launch buttons */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">
            Study This Chapter
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/flashcards?chapter=${chapter.number}`}
              className="flex-1 text-center py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Study Flashcards
            </Link>
            <Link
              href="/quiz"
              className="flex-1 text-center py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              Take Quiz
            </Link>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-800">
          {chapterNumber > 1 ? (
            <Link
              href={`/chapters/${chapterNumber - 1}`}
              className="text-gray-400 hover:text-white text-sm"
            >
              &larr; Chapter {chapterNumber - 1}
            </Link>
          ) : (
            <span />
          )}
          {chapterNumber < 20 ? (
            <Link
              href={`/chapters/${chapterNumber + 1}`}
              className="text-gray-400 hover:text-white text-sm"
            >
              Chapter {chapterNumber + 1} &rarr;
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
