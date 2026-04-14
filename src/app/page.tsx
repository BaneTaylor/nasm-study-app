import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <nav className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto w-full">
        <span className="text-xl font-bold text-white">NASM Study</span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 max-w-3xl">
          Pass Your NASM CPT Exam
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl">
          Personalized study plans, smart flashcards, practice quizzes, and
          analytics — all tailored to how you learn best.
        </p>
        <Link
          href="/signup"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg transition-colors"
        >
          Start Studying Free
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl">
          <div className="text-left">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Adaptive Study Plan
            </h3>
            <p className="text-gray-400 text-sm">
              Takes a quick assessment of how you learn, then builds a
              week-by-week plan that adapts as you improve.
            </p>
          </div>
          <div className="text-left">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Know Where You Stand
            </h3>
            <p className="text-gray-400 text-sm">
              Real-time stats show your mastery percentage, exam readiness
              projection, and exactly which chapters need work.
            </p>
          </div>
          <div className="text-left">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Smart Flashcards & Quizzes
            </h3>
            <p className="text-gray-400 text-sm">
              Spaced repetition flashcards and exam-style practice quizzes
              with detailed explanations for every answer.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
