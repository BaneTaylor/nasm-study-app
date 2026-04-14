"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setEmail(user.email || "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      setDisplayName(profile.display_name || "");
      setExamDate(profile.exam_date || "");
      setHoursPerWeek(profile.hours_per_week || 8);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        exam_date: examDate || null,
        hours_per_week: hoursPerWeek,
      })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white text-sm"
          >
            Back
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-600 mt-1">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Study Hours Per Week
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={2}
                max={20}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-white font-bold text-lg w-16 text-center">
                {hoursPerWeek} hrs
              </span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium rounded-lg transition-colors"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>

          {saved && (
            <p className="text-green-400 text-sm text-center">
              Settings updated successfully.
            </p>
          )}
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">
            Danger Zone
          </h2>
          <p className="text-gray-400 text-sm mb-3">
            Want to redo the onboarding assessment? This will reset your
            learning style profile and generate a new study plan.
          </p>
          <button
            onClick={async () => {
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (!user) return;
              await supabase
                .from("profiles")
                .update({ onboarding_completed: false, learning_style: {} })
                .eq("id", user.id);
              await supabase
                .from("study_plans")
                .update({ is_active: false })
                .eq("user_id", user.id);
              window.location.href = "/onboarding";
            }}
            className="px-4 py-2 bg-red-600/20 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
          >
            Retake Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
