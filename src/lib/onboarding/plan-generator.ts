import type { LearningStyle, ChapterScore } from "./scoring";

type PlanWeek = {
  week: number;
  chapters: number[];
  focus_type: string;
  hours: number;
};

const ALL_CHAPTERS = Array.from({ length: 20 }, (_, i) => i + 1);

const CHAPTER_NAMES: Record<number, string> = {
  1: "The Scientific Rationale for Integrated Training",
  2: "Basic Exercise Science",
  3: "The Cardiorespiratory System",
  4: "Fitness Assessment",
  5: "Human Movement Science",
  6: "Flexibility Training",
  7: "Cardiorespiratory Training",
  8: "Core Training",
  9: "Balance Training",
  10: "Plyometric Training",
  11: "Speed, Agility, and Quickness Training",
  12: "Resistance Training",
  13: "The Optimum Performance Training (OPT) Model",
  14: "Nutrition",
  15: "Supplementation",
  16: "Lifestyle Modification and Behavioral Coaching",
  17: "Special Populations",
  18: "Chronic Health Conditions",
  19: "The Personal Training Profession",
  20: "Developing a Successful Personal Training Business",
};

function getTopLearningMethod(style: LearningStyle): string {
  const entries = Object.entries(style) as [keyof LearningStyle, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const top = entries[0][0];

  const methodMap: Record<keyof LearningStyle, string> = {
    visual: "Diagrams & visual guides",
    reading_writing: "Summaries & note-taking",
    active_recall: "Quizzes & flashcards",
    practical: "Case studies & scenarios",
  };

  return methodMap[top];
}

export function generateStudyPlan(
  examDate: string,
  hoursPerWeek: number,
  learningStyle: LearningStyle,
  baselineScores: ChapterScore[],
  experience: string
): PlanWeek[] {
  const now = new Date();
  const exam = new Date(examDate);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const totalWeeks = Math.max(1, Math.floor((exam.getTime() - now.getTime()) / msPerWeek));

  const weakChapters = new Set(
    baselineScores.filter((s) => !s.correct).map((s) => s.chapter)
  );

  const sortedChapters = [...ALL_CHAPTERS].sort((a, b) => {
    const aWeak = weakChapters.has(a) ? 0 : 1;
    const bWeak = weakChapters.has(b) ? 0 : 1;
    if (aWeak !== bWeak) return aWeak - bWeak;
    return a - b;
  });

  const reviewWeeks = totalWeeks >= 6 ? 2 : totalWeeks >= 3 ? 1 : 0;
  const studyWeeks = totalWeeks - reviewWeeks;

  if (studyWeeks <= 0) {
    return [
      {
        week: 1,
        chapters: sortedChapters.slice(0, 10),
        focus_type: "Intensive review — " + getTopLearningMethod(learningStyle),
        hours: hoursPerWeek,
      },
      {
        week: 2,
        chapters: sortedChapters.slice(10),
        focus_type: "Intensive review + practice exam",
        hours: hoursPerWeek,
      },
    ];
  }

  const chaptersPerWeek = Math.ceil(sortedChapters.length / studyWeeks);
  const plan: PlanWeek[] = [];

  for (let w = 0; w < studyWeeks; w++) {
    const weekChapters = sortedChapters.slice(
      w * chaptersPerWeek,
      (w + 1) * chaptersPerWeek
    );
    if (weekChapters.length === 0) break;

    const hasWeakChapters = weekChapters.some((ch) => weakChapters.has(ch));

    plan.push({
      week: w + 1,
      chapters: weekChapters,
      focus_type: hasWeakChapters
        ? "Priority review — " + getTopLearningMethod(learningStyle)
        : getTopLearningMethod(learningStyle),
      hours: hasWeakChapters
        ? Math.min(hoursPerWeek + 1, 20)
        : hoursPerWeek,
    });
  }

  for (let r = 0; r < reviewWeeks; r++) {
    plan.push({
      week: studyWeeks + r + 1,
      chapters: r === 0 ? [...weakChapters] : ALL_CHAPTERS,
      focus_type:
        r === 0
          ? "Weak area review + mixed quizzes"
          : "Full practice exam + final review",
      hours: Math.min(hoursPerWeek + 2, 20),
    });
  }

  return plan;
}

export { CHAPTER_NAMES };
