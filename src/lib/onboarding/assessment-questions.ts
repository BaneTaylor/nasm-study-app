export type AssessmentQuestion = {
  id: number;
  question: string;
  options: {
    text: string;
    dimension: "visual" | "reading_writing" | "active_recall" | "practical";
  }[];
};

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    question: "When learning a new exercise technique, you prefer to:",
    options: [
      { text: "Watch a video demonstration", dimension: "visual" },
      { text: "Read the step-by-step instructions", dimension: "reading_writing" },
      { text: "Quiz yourself on the muscle groups involved", dimension: "active_recall" },
      { text: "Try performing it right away with guidance", dimension: "practical" },
    ],
  },
  {
    id: 2,
    question: "You remember information best when you:",
    options: [
      { text: "See it in a chart or diagram", dimension: "visual" },
      { text: "Write it down in your own words", dimension: "reading_writing" },
      { text: "Test yourself on it repeatedly", dimension: "active_recall" },
      { text: "Apply it to a real scenario", dimension: "practical" },
    ],
  },
  {
    id: 3,
    question: "If you had to learn the muscles of the leg, you'd start by:",
    options: [
      { text: "Looking at an anatomy diagram", dimension: "visual" },
      { text: "Reading the textbook descriptions", dimension: "reading_writing" },
      { text: "Using flashcards to memorize them", dimension: "active_recall" },
      { text: "Feeling each muscle on your own leg while studying", dimension: "practical" },
    ],
  },
  {
    id: 4,
    question: "When studying for an exam, your ideal setup is:",
    options: [
      { text: "Color-coded notes with highlights and diagrams", dimension: "visual" },
      { text: "Detailed written summaries of each chapter", dimension: "reading_writing" },
      { text: "Practice tests and self-quizzing", dimension: "active_recall" },
      { text: "Teaching the material to someone else", dimension: "practical" },
    ],
  },
  {
    id: 5,
    question: "A client asks you to explain the OPT model. You'd explain it by:",
    options: [
      { text: "Drawing the pyramid diagram on a whiteboard", dimension: "visual" },
      { text: "Walking through each phase in written detail", dimension: "reading_writing" },
      { text: "Asking them questions to guide their understanding", dimension: "active_recall" },
      { text: "Showing them example exercises from each phase", dimension: "practical" },
    ],
  },
  {
    id: 6,
    question: "When you don't understand a concept, you usually:",
    options: [
      { text: "Search for an infographic or visual explanation", dimension: "visual" },
      { text: "Re-read the material more carefully", dimension: "reading_writing" },
      { text: "Try practice problems until it clicks", dimension: "active_recall" },
      { text: "Find a real-world example to relate it to", dimension: "practical" },
    ],
  },
  {
    id: 7,
    question: "You find it easiest to remember:",
    options: [
      { text: "Images and spatial layouts", dimension: "visual" },
      { text: "Written definitions and descriptions", dimension: "reading_writing" },
      { text: "Things you've been tested on before", dimension: "active_recall" },
      { text: "Things you've physically done or applied", dimension: "practical" },
    ],
  },
  {
    id: 8,
    question: "If you had one hour to study, you'd spend it:",
    options: [
      { text: "Reviewing diagrams and visual study guides", dimension: "visual" },
      { text: "Reading and taking notes on a chapter", dimension: "reading_writing" },
      { text: "Doing as many practice questions as possible", dimension: "active_recall" },
      { text: "Working through case studies or client scenarios", dimension: "practical" },
    ],
  },
  {
    id: 9,
    question: "In a classroom setting, you learn best from:",
    options: [
      { text: "Slides with images and diagrams", dimension: "visual" },
      { text: "The textbook and written handouts", dimension: "reading_writing" },
      { text: "Pop quizzes and group review games", dimension: "active_recall" },
      { text: "Hands-on labs and group exercises", dimension: "practical" },
    ],
  },
  {
    id: 10,
    question: "To prepare for the NASM exam, the most helpful resource would be:",
    options: [
      { text: "Video walkthroughs of each chapter with visuals", dimension: "visual" },
      { text: "A condensed study guide with all key points", dimension: "reading_writing" },
      { text: "A huge bank of practice exam questions", dimension: "active_recall" },
      { text: "Real client scenarios to design programs for", dimension: "practical" },
    ],
  },
];
