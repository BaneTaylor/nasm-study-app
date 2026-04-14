export type BaselineQuestion = {
  id: number;
  chapter: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

export const baselineQuestions: BaselineQuestion[] = [
  {
    id: 1,
    chapter: 1,
    question: "What does NASM stand for?",
    options: [
      "National Academy of Sports Medicine",
      "National Association of Sports Medicine",
      "National Academy of Strength Management",
      "National Association of Strength Medicine",
    ],
    correctAnswer: 0,
  },
  {
    id: 2,
    chapter: 2,
    question: "Which muscle is the primary hip flexor?",
    options: ["Gluteus maximus", "Iliopsoas", "Rectus femoris", "Hamstrings"],
    correctAnswer: 1,
  },
  {
    id: 3,
    chapter: 4,
    question: "What does the overhead squat assessment primarily evaluate?",
    options: [
      "Maximum strength",
      "Cardiovascular endurance",
      "Dynamic flexibility and neuromuscular control",
      "Body composition",
    ],
    correctAnswer: 2,
  },
  {
    id: 4,
    chapter: 5,
    question: "What type of muscle action occurs when a muscle lengthens under tension?",
    options: ["Concentric", "Isometric", "Eccentric", "Isokinetic"],
    correctAnswer: 2,
  },
  {
    id: 5,
    chapter: 8,
    question: "How many phases does the NASM OPT model have?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 2,
  },
  {
    id: 6,
    chapter: 10,
    question: "Supersets involve performing two exercises:",
    options: [
      "With long rest periods between them",
      "Back to back with minimal rest",
      "For the same muscle group only",
      "At maximum intensity only",
    ],
    correctAnswer: 1,
  },
  {
    id: 7,
    chapter: 12,
    question: "Which OPT phase focuses on stabilization endurance?",
    options: ["Phase 1", "Phase 2", "Phase 3", "Phase 5"],
    correctAnswer: 0,
  },
  {
    id: 8,
    chapter: 14,
    question: "Approximately how many calories are in one gram of protein?",
    options: ["2", "4", "7", "9"],
    correctAnswer: 1,
  },
  {
    id: 9,
    chapter: 17,
    question: "What is the recommended daily water intake guideline for active adults?",
    options: [
      "4 cups per day",
      "8 cups per day regardless of activity",
      "Half your body weight in ounces",
      "1 gallon minimum for everyone",
    ],
    correctAnswer: 2,
  },
  {
    id: 10,
    chapter: 19,
    question: "What is the primary role of a personal trainer?",
    options: [
      "Diagnose injuries",
      "Prescribe meal plans",
      "Help clients achieve fitness goals safely",
      "Provide physical therapy",
    ],
    correctAnswer: 2,
  },
];
