export type Profile = {
  id: string;
  display_name: string | null;
  exam_date: string | null;
  hours_per_week: number | null;
  prior_experience: "none" | "some" | "extensive" | null;
  learning_style: {
    visual: number;
    reading_writing: number;
    active_recall: number;
    practical: number;
  } | null;
  onboarding_completed: boolean;
  created_at: string;
};

export type Flashcard = {
  id: string;
  chapter: number;
  term: string;
  definition: string;
  is_default: boolean;
  created_by: string | null;
  created_at: string;
};

export type FlashcardProgress = {
  id: string;
  user_id: string;
  flashcard_id: string;
  rating: "didnt_know" | "kinda_knew" | "nailed_it" | null;
  next_review_at: string;
  review_count: number;
  last_reviewed_at: string | null;
};

export type Question = {
  id: string;
  chapter: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
};

export type QuizResult = {
  id: string;
  user_id: string;
  quiz_type: "chapter" | "mixed" | "weak_areas" | "exam_simulation";
  chapter: number | null;
  score: number;
  total_questions: number;
  correct_count: number;
  answers: {
    question_id: string;
    selected: number;
    correct: number;
    time_spent_seconds: number;
  }[];
  started_at: string;
  completed_at: string | null;
};

export type ChapterSummary = {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  key_terms: { term: string; definition: string }[];
  key_concepts: string[];
};

export type StudyPlan = {
  id: string;
  user_id: string;
  plan: {
    week: number;
    chapters: number[];
    focus_type: string;
    hours: number;
  }[];
  generated_at: string;
  is_active: boolean;
};

export type StudySession = {
  id: string;
  user_id: string;
  scheduled_date: string;
  chapter: number;
  activity_type: "flashcards" | "quiz" | "summary" | "practice_exam";
  duration_minutes: number;
  completed: boolean;
  completed_at: string | null;
};

export type FunFact = {
  id: string;
  chapter: number;
  emoji: string;
  fact: string;
  chapter_label: string;
};

export type FunFactView = {
  id: string;
  user_id: string;
  fun_fact_id: string;
  viewed_at: string;
};
