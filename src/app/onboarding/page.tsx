"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ProgressBar from "@/components/onboarding/progress-bar";
import StepProfile from "@/components/onboarding/step-profile";
import StepAssessment from "@/components/onboarding/step-assessment";
import StepBaseline from "@/components/onboarding/step-baseline";
import StepPlan from "@/components/onboarding/step-plan";
import { assessmentQuestions } from "@/lib/onboarding/assessment-questions";
import { baselineQuestions } from "@/lib/onboarding/baseline-questions";
import { scoreLearningStyle, scoreBaseline } from "@/lib/onboarding/scoring";
import type { LearningStyle } from "@/lib/onboarding/scoring";
import { generateStudyPlan } from "@/lib/onboarding/plan-generator";

type PlanWeek = {
  week: number;
  chapters: number[];
  focus_type: string;
  hours: number;
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<{
    examDate: string;
    hoursPerWeek: number;
    experience: string;
  } | null>(null);
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(
    null
  );
  const [plan, setPlan] = useState<PlanWeek[]>([]);

  function handleProfileComplete(data: {
    examDate: string;
    hoursPerWeek: number;
    experience: string;
  }) {
    setProfile(data);
    setStep(1);
  }

  function handleAssessmentComplete(answers: Record<number, string>) {
    const style = scoreLearningStyle(assessmentQuestions, answers);
    setLearningStyle(style);
    setStep(2);
  }

  function handleBaselineComplete(answers: Record<number, number>) {
    if (!profile || !learningStyle) return;

    const scores = scoreBaseline(baselineQuestions, answers);
    const generatedPlan = generateStudyPlan(
      profile.examDate,
      profile.hoursPerWeek,
      learningStyle,
      scores,
      profile.experience
    );
    setPlan(generatedPlan);
    setStep(3);
  }

  async function handlePlanComplete() {
    if (!profile || !learningStyle) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        exam_date: profile.examDate,
        hours_per_week: profile.hoursPerWeek,
        prior_experience: profile.experience,
        learning_style: learningStyle,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    await supabase.from("study_plans").insert({
      user_id: user.id,
      plan: plan,
      is_active: true,
    });

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12">
      <ProgressBar currentStep={step} />

      {step === 0 && <StepProfile onComplete={handleProfileComplete} />}
      {step === 1 && <StepAssessment onComplete={handleAssessmentComplete} />}
      {step === 2 && <StepBaseline onComplete={handleBaselineComplete} />}
      {step === 3 && learningStyle && (
        <div>
          <StepPlan
            plan={plan}
            learningStyle={learningStyle}
            onComplete={handlePlanComplete}
          />
          {saving && (
            <p className="text-center text-gray-400 mt-4">
              Saving your plan...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
