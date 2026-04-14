import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapter, chapters } from "@/lib/chapters/chapter-data";
import TermCard from "./term-card";
import AudioSection from "./audio-section";

const chapterGradients = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-amber-500",
  "from-rose-500 to-red-500",
  "from-indigo-500 to-violet-500",
  "from-teal-500 to-green-500",
  "from-fuchsia-500 to-purple-500",
  "from-sky-500 to-blue-500",
  "from-lime-500 to-emerald-500",
];

function getGradient(index: number) {
  return chapterGradients[index % chapterGradients.length];
}

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

  const gradient = getGradient(chapterNumber - 1);
  const prevChapter = chapterNumber > 1 ? getChapter(chapterNumber - 1) : null;
  const nextChapter = chapterNumber < 20 ? getChapter(chapterNumber + 1) : null;

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/chapters"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          All Chapters
        </Link>

        {/* Hero Header */}
        <div className="relative mb-10 rounded-2xl p-1">
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradient} opacity-60`}
          />
          <div className="relative bg-gray-900 rounded-xl p-6 sm:p-8">
            <div className="flex items-center gap-5">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}
              >
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {chapter.number}
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Chapter {chapter.number}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {chapter.title}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Listen to chapter */}
        <div className="mb-8">
          <AudioSection
            chapterTitle={`Chapter ${chapter.number}: ${chapter.title}`}
            summary={chapter.summary}
            keyTerms={chapter.keyTerms}
          />
        </div>

        {/* Summary */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            Summary
          </h2>
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-300 leading-relaxed text-base">
              {chapter.summary}
            </p>
          </div>
        </section>

        {/* Key Terms - Accordion */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"
              />
            </svg>
            Key Terms
            <span className="text-sm font-normal text-gray-500 ml-1">
              ({chapter.keyTerms.length})
            </span>
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Tap a term to reveal its definition
          </p>
          <div className="space-y-3">
            {chapter.keyTerms.map((item) => (
              <TermCard
                key={item.term}
                term={item.term}
                definition={item.definition}
              />
            ))}
          </div>
        </section>

        {/* Key Concepts - Visual Bullet Cards */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
              />
            </svg>
            Key Concepts
            <span className="text-sm font-normal text-gray-500 ml-1">
              ({chapter.keyConcepts.length})
            </span>
          </h2>
          <div className="space-y-3">
            {chapter.keyConcepts.map((concept, i) => (
              <div
                key={i}
                className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 flex gap-4 items-start"
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 text-sm font-bold text-white`}
                >
                  {i + 1}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed pt-1">
                  {concept}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Study This Chapter */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"
              />
            </svg>
            Study This Chapter
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href={`/flashcards?chapter=${chapter.number}`}
              className="group relative rounded-2xl p-px"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-gray-900 border border-gray-800 group-hover:border-transparent rounded-2xl p-5 text-center h-full transition-colors">
                <svg
                  className="w-8 h-8 mx-auto text-blue-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25"
                  />
                </svg>
                <div className="text-white font-semibold">Flashcards</div>
                <div className="text-gray-500 text-xs mt-1">
                  Review key terms
                </div>
              </div>
            </Link>
            <Link
              href={`/quiz?chapter=${chapter.number}`}
              className="group relative rounded-2xl p-px"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-gray-900 border border-gray-800 group-hover:border-transparent rounded-2xl p-5 text-center h-full transition-colors">
                <svg
                  className="w-8 h-8 mx-auto text-green-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  />
                </svg>
                <div className="text-white font-semibold">Take Quiz</div>
                <div className="text-gray-500 text-xs mt-1">
                  Test your knowledge
                </div>
              </div>
            </Link>
            <Link
              href={`/chapters/${chapter.number}`}
              className="group relative rounded-2xl p-px"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-gray-900 border border-gray-800 group-hover:border-transparent rounded-2xl p-5 text-center h-full transition-colors">
                <svg
                  className="w-8 h-8 mx-auto text-purple-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
                <div className="text-white font-semibold">Full Summary</div>
                <div className="text-gray-500 text-xs mt-1">
                  Read the overview
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Previous / Next Navigation */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-800">
          {prevChapter ? (
            <Link
              href={`/chapters/${chapterNumber - 1}`}
              className="group bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition-colors"
            >
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                Previous
              </div>
              <div className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors">
                Ch. {chapterNumber - 1}: {prevChapter.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
          {nextChapter ? (
            <Link
              href={`/chapters/${chapterNumber + 1}`}
              className="group bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition-colors text-right"
            >
              <div className="text-xs text-gray-500 mb-1 flex items-center justify-end gap-1">
                Next
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
              <div className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors">
                Ch. {chapterNumber + 1}: {nextChapter.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
