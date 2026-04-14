import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Account Created!
        </h1>
        <p className="text-gray-400 mb-8">
          Your onboarding experience (learning style assessment, knowledge
          baseline, and personalized study plan) is coming in the next update.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors inline-block"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
