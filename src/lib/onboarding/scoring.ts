import type { AssessmentQuestion } from "./assessment-questions";
import type { BaselineQuestion } from "./baseline-questions";

export type LearningStyle = {
  visual: number;
  reading_writing: number;
  active_recall: number;
  practical: number;
};

export function scoreLearningStyle(
  questions: AssessmentQuestion[],
  answers: Record<number, string>
): LearningStyle {
  const counts = { visual: 0, reading_writing: 0, active_recall: 0, practical: 0 };
  const total = Object.keys(answers).length;

  for (const dimension of Object.values(answers)) {
    if (dimension in counts) {
      counts[dimension as keyof LearningStyle]++;
    }
  }

  return {
    visual: total > 0 ? Math.round((counts.visual / total) * 100) : 25,
    reading_writing: total > 0 ? Math.round((counts.reading_writing / total) * 100) : 25,
    active_recall: total > 0 ? Math.round((counts.active_recall / total) * 100) : 25,
    practical: total > 0 ? Math.round((counts.practical / total) * 100) : 25,
  };
}

export type ChapterScore = {
  chapter: number;
  correct: boolean;
};

export function scoreBaseline(
  questions: BaselineQuestion[],
  answers: Record<number, number>
): ChapterScore[] {
  return questions.map((q) => ({
    chapter: q.chapter,
    correct: answers[q.id] === q.correctAnswer,
  }));
}
