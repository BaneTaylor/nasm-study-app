import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, display_name, exam_date")
    .eq("id", user.id)
    .single();

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const daysUntilExam = profile?.exam_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(profile.exam_date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}
            </h1>
            <p className="text-gray-400">
              {daysUntilExam !== null
                ? `${daysUntilExam} days until your exam`
                : "Your NASM study dashboard"}
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/flashcards"
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors group"
          >
            <div className="text-3xl mb-3">🗂️</div>
            <h2 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
              Flashcards
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Study terms with spaced repetition
            </p>
          </Link>

          <Link
            href="/quiz"
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500 transition-colors group"
          >
            <div className="text-3xl mb-3">📝</div>
            <h2 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
              Practice Quiz
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Test your knowledge with exam-style questions
            </p>
          </Link>

          <Link
            href="/chapters"
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500 transition-colors group"
          >
            <div className="text-3xl mb-3">📖</div>
            <h2 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
              Chapter Summaries
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Condensed notes for each chapter
            </p>
          </Link>

          <Link
            href="/stats"
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-yellow-500 transition-colors group"
          >
            <div className="text-3xl mb-3">📊</div>
            <h2 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">
              Stats & Analytics
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Track your progress and exam readiness
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
