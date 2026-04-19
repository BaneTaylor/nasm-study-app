// =============================================================================
// NASM CPT Campaign Curriculum — Units, Stages, and Lessons
// =============================================================================

export type OfflineExercise = {
  type: "write" | "move" | "teach" | "speak" | "self-assess";
  icon: string;
  instruction: string;
  timeMinutes: number;
  verificationPrompt: string;
  aiReviewEnabled: boolean;
};

export type Lesson = {
  id: string;
  title: string;
  type: "learn" | "flashcards" | "quiz" | "scenario" | "review" | "offline" | "feynman";
  description: string;
  xpReward: number;
  prerequisites?: string[];
  content?: LearnContent | FlashcardContent | QuizContent | ScenarioContent;
  offlineExercise?: OfflineExercise;
  feynmanTopic?: string;
};

export type Stage = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  masteryThreshold: number;
};

export type Unit = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  stages: Stage[];
};

// ---------------------------------------------------------------------------
// Content Types for each lesson type
// ---------------------------------------------------------------------------

export type LearnSection = {
  heading: string;
  body: string;
  keyPoint: string;
};

export type LearnContent = {
  sections: LearnSection[];
};

export type FlashcardItem = {
  term: string;
  definition: string;
};

export type FlashcardContent = {
  cards: FlashcardItem[];
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  conceptTag: string;
};

export type QuizContent = {
  questions: QuizQuestion[];
};

export type ScenarioContent = {
  clientName: string;
  clientAge: number;
  clientGoal: string;
  clientBackground: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTag: string;
};

// ---------------------------------------------------------------------------
// Curriculum Data
// ---------------------------------------------------------------------------

const curriculum: Unit[] = [
  {
    id: "unit-1",
    title: "Foundations of Personal Training",
    description:
      "The science behind exercise, evidence-based practice, and the NASM OPT model.",
    icon: "🏋️",
    color: "blue",
    stages: [
      {
        id: "u1-s1",
        title: "The Scientific Rationale",
        description: "Why evidence-based fitness matters",
        masteryThreshold: 70,
        lessons: [
          {
            id: "u1-s1-l1",
            title: "Evidence-Based Practice",
            type: "learn",
            description:
              "Understand why personal trainers need a scientific foundation.",
            xpReward: 25,
            content: {
              sections: [
                {
                  heading: "Why Science Matters in Fitness",
                  body: "The fitness industry is full of trends and fads. As a NASM-certified personal trainer, you distinguish yourself by grounding your practice in peer-reviewed research and proven methodologies. Evidence-based practice means making decisions about client programming based on the best available scientific evidence, combined with your professional expertise and the client's preferences.",
                  keyPoint:
                    "Evidence-based practice combines scientific research, professional expertise, and client preferences.",
                },
                {
                  heading: "The NASM Approach",
                  body: "NASM's Optimum Performance Training (OPT) model is a systematic approach to program design that is grounded in scientific principles. It progresses clients through phases of training that build upon each other, starting with stabilization and corrective exercise before advancing to strength and power training.",
                  keyPoint:
                    "The OPT model is NASM's systematic, science-based approach to program design.",
                },
                {
                  heading: "Scope of Practice",
                  body: "Personal trainers must understand their scope of practice. You can design exercise programs, provide general nutrition guidance, and motivate clients. However, diagnosing injuries, prescribing diets, or treating medical conditions falls outside your scope. Knowing when to refer a client to another professional is a critical skill.",
                  keyPoint:
                    "Know your scope of practice: design programs and motivate, but refer out for medical and dietary prescriptions.",
                },
              ],
            } as LearnContent,
          },
          {
            id: "u1-s1-l2",
            title: "Key Terms Flashcards",
            type: "flashcards",
            description: "Master the foundational vocabulary.",
            xpReward: 20,
            prerequisites: ["u1-s1-l1"],
            content: {
              cards: [
                {
                  term: "Evidence-Based Practice",
                  definition:
                    "An approach that integrates scientific evidence, clinical expertise, and client values to guide decision-making.",
                },
                {
                  term: "OPT Model",
                  definition:
                    "Optimum Performance Training — NASM's systematic approach to program design with progressive phases.",
                },
                {
                  term: "Scope of Practice",
                  definition:
                    "The legal and professional boundaries defining what a certified personal trainer can and cannot do.",
                },
                {
                  term: "Peer-Reviewed Research",
                  definition:
                    "Scientific studies that have been evaluated by experts in the field before publication.",
                },
                {
                  term: "Progressive Overload",
                  definition:
                    "The gradual increase of stress placed upon the body during exercise training to drive adaptation.",
                },
                {
                  term: "General Adaptation Syndrome (GAS)",
                  definition:
                    "Selye's model describing how the body responds to stress: alarm, resistance, exhaustion.",
                },
              ],
            } as FlashcardContent,
          },
          {
            id: "u1-s1-l3",
            title: "Foundations Quiz",
            type: "quiz",
            description: "Test your understanding of the scientific rationale.",
            xpReward: 30,
            prerequisites: ["u1-s1-l2"],
            content: {
              questions: [
                {
                  id: "q1",
                  question:
                    "What three components make up evidence-based practice?",
                  options: [
                    "Scientific evidence, clinical expertise, and client values",
                    "Textbook knowledge, gym experience, and client goals",
                    "Research papers, certifications, and equipment",
                    "Education, motivation, and nutrition",
                  ],
                  correctIndex: 0,
                  explanation:
                    "Evidence-based practice integrates the best available scientific evidence with clinical expertise and client values/preferences.",
                  difficulty: "easy",
                  conceptTag: "evidence-based-practice",
                },
                {
                  id: "q2",
                  question: "What does OPT stand for?",
                  options: [
                    "Optimal Physical Training",
                    "Optimum Performance Training",
                    "Organized Program Technique",
                    "Overload Periodization Theory",
                  ],
                  correctIndex: 1,
                  explanation:
                    "OPT stands for Optimum Performance Training, NASM's systematic approach to exercise program design.",
                  difficulty: "easy",
                  conceptTag: "opt-model",
                },
                {
                  id: "q3",
                  question:
                    "Which of the following is OUTSIDE a personal trainer's scope of practice?",
                  options: [
                    "Designing a progressive exercise program",
                    "Providing general healthy eating guidelines",
                    "Diagnosing a client's knee injury",
                    "Motivating clients during workouts",
                  ],
                  correctIndex: 2,
                  explanation:
                    "Diagnosing injuries is outside a personal trainer's scope of practice. This should be referred to a qualified healthcare professional.",
                  difficulty: "medium",
                  conceptTag: "scope-of-practice",
                },
                {
                  id: "q4",
                  question:
                    "According to the General Adaptation Syndrome (GAS), what are the three stages of stress response?",
                  options: [
                    "Activation, adaptation, maintenance",
                    "Alarm, resistance, exhaustion",
                    "Stimulus, response, recovery",
                    "Stress, growth, plateau",
                  ],
                  correctIndex: 1,
                  explanation:
                    "Hans Selye's GAS model describes three stages: alarm reaction, resistance development, and exhaustion.",
                  difficulty: "medium",
                  conceptTag: "general-adaptation-syndrome",
                },
                {
                  id: "q5",
                  question:
                    "Why is progressive overload important in exercise programming?",
                  options: [
                    "It prevents clients from getting bored",
                    "It ensures the body continues to adapt by gradually increasing stress",
                    "It reduces the risk of all injuries",
                    "It is only important for advanced athletes",
                  ],
                  correctIndex: 1,
                  explanation:
                    "Progressive overload is the principle of gradually increasing the demands on the body to continue driving physiological adaptations.",
                  difficulty: "easy",
                  conceptTag: "progressive-overload",
                },
              ],
            } as QuizContent,
          },
          {
            id: "u1-s1-l4",
            title: "Offline: Scope of Practice Recall",
            type: "offline",
            description: "Write down everything you remember about scope of practice — no peeking.",
            xpReward: 20,
            prerequisites: ["u1-s1-l3"],
            offlineExercise: {
              type: "write",
              icon: "📝",
              instruction: "Close the app. On paper, write down everything you remember about what personal trainers can and cannot do (scope of practice). Don't look anything up. Come back and type what you wrote.",
              timeMinutes: 5,
              verificationPrompt: "Type what you wrote on paper:",
              aiReviewEnabled: true,
            },
          },
          {
            id: "u1-s1-l5",
            title: "Feynman: Evidence-Based Practice",
            type: "feynman",
            description: "Explain evidence-based practice in your own words.",
            xpReward: 25,
            prerequisites: ["u1-s1-l4"],
            feynmanTopic: "Evidence-based practice in personal training and its three components",
          },
        ],
      },
      {
        id: "u1-s2",
        title: "The OPT Model Overview",
        description: "Understanding the phases of training",
        masteryThreshold: 70,
        lessons: [
          {
            id: "u1-s2-l1",
            title: "OPT Model Deep Dive",
            type: "learn",
            description: "Explore all 5 phases of the OPT model in detail.",
            xpReward: 30,
            content: {
              sections: [
                {
                  heading: "Phase 1: Stabilization Endurance",
                  body: "The foundation of the OPT model. This phase focuses on improving muscular endurance, stability, flexibility, and neuromuscular efficiency. Exercises involve unstable environments, high repetitions (12-20), and slow tempos. This phase is ideal for new clients, deconditioned individuals, and those returning from injury.",
                  keyPoint:
                    "Phase 1 builds the foundation with stability, endurance, and neuromuscular control (12-20 reps, unstable surfaces).",
                },
                {
                  heading: "Phase 2: Strength Endurance",
                  body: "This phase bridges stabilization and strength training by using supersets that pair a traditional strength exercise with a stabilization exercise. For example, a bench press followed by a push-up on a stability ball. This develops both strength and stability simultaneously.",
                  keyPoint:
                    "Phase 2 uses supersets pairing strength + stabilization exercises.",
                },
                {
                  heading: "Phases 3-4: Hypertrophy and Maximal Strength",
                  body: "Phase 3 targets muscle growth with moderate to heavy loads (6-12 reps) and moderate volume. Phase 4 focuses on maximal strength with heavy loads (1-5 reps), longer rest periods, and compound movements. These phases are for clients with established training foundations.",
                  keyPoint:
                    "Phase 3 = hypertrophy (6-12 reps), Phase 4 = max strength (1-5 reps).",
                },
                {
                  heading: "Phase 5: Power",
                  body: "The pinnacle of the OPT model. This phase develops speed and power through explosive exercises paired with heavy strength exercises. It uses supersets combining a strength exercise (e.g., squat) with a power exercise (e.g., jump squat). Only for clients who have progressed through earlier phases.",
                  keyPoint:
                    "Phase 5 develops power by pairing heavy strength exercises with explosive movements.",
                },
              ],
            } as LearnContent,
          },
          {
            id: "u1-s2-l2",
            title: "OPT Phases Flashcards",
            type: "flashcards",
            description: "Memorize the key characteristics of each OPT phase.",
            xpReward: 20,
            prerequisites: ["u1-s2-l1"],
            content: {
              cards: [
                {
                  term: "Phase 1: Stabilization Endurance",
                  definition:
                    "12-20 reps, low intensity, unstable surfaces, slow tempo. Focus: muscular endurance, stability, neuromuscular efficiency.",
                },
                {
                  term: "Phase 2: Strength Endurance",
                  definition:
                    "Supersets pairing strength + stabilization exercises. Bridge between stabilization and pure strength training.",
                },
                {
                  term: "Phase 3: Hypertrophy",
                  definition:
                    "6-12 reps, moderate to heavy loads, moderate volume. Focus: muscle growth and increased lean body mass.",
                },
                {
                  term: "Phase 4: Maximal Strength",
                  definition:
                    "1-5 reps, heavy loads, longer rest periods, compound movements. Focus: maximum force production.",
                },
                {
                  term: "Phase 5: Power",
                  definition:
                    "Supersets pairing heavy strength + explosive power exercises. Focus: speed and force production.",
                },
              ],
            } as FlashcardContent,
          },
          {
            id: "u1-s2-l3",
            title: "Client Scenario: New Client",
            type: "scenario",
            description: "Apply OPT model knowledge to a real client situation.",
            xpReward: 35,
            prerequisites: ["u1-s2-l2"],
            content: {
              clientName: "Sarah",
              clientAge: 35,
              clientGoal: "General fitness and weight loss",
              clientBackground:
                "Sarah is a 35-year-old office worker who hasn't exercised regularly in 3 years. She has no injuries but reports occasional lower back stiffness from sitting all day. She wants to lose 20 pounds and feel more energetic.",
              question:
                "Which OPT phase should Sarah begin her training program in?",
              options: [
                "Phase 1: Stabilization Endurance",
                "Phase 2: Strength Endurance",
                "Phase 3: Hypertrophy",
                "Phase 4: Maximal Strength",
              ],
              correctIndex: 0,
              explanation:
                "Sarah should start in Phase 1 (Stabilization Endurance) because she is deconditioned, hasn't trained in years, and reports postural issues (lower back stiffness). Phase 1 builds the neuromuscular foundation, addresses stability imbalances, and prepares her body for more intense training in later phases.",
              conceptTag: "opt-model-application",
            } as ScenarioContent,
          },
          {
            id: "u1-s2-l4",
            title: "Offline: Teach the Kinetic Chain",
            type: "offline",
            description: "Explain the OPT model phases to someone out loud.",
            xpReward: 20,
            prerequisites: ["u1-s2-l3"],
            offlineExercise: {
              type: "teach",
              icon: "🗣️",
              instruction: "Find someone nearby (roommate, friend, family member, or even a pet). Explain the 5 phases of the OPT model in under 90 seconds — name each phase and one key feature of each. Come back and describe how it went.",
              timeMinutes: 3,
              verificationPrompt: "How did your explanation go? What did you forget or struggle to explain?",
              aiReviewEnabled: true,
            },
          },
          {
            id: "u1-s2-l5",
            title: "Unit 1 Review",
            type: "review",
            description:
              "Adaptive review of all concepts from Unit 1 so far.",
            xpReward: 25,
            prerequisites: ["u1-s2-l4"],
          },
        ],
      },
    ],
  },
  {
    id: "unit-2",
    title: "Human Movement Science",
    description:
      "Anatomy, biomechanics, and how the body moves through the kinetic chain.",
    icon: "🦴",
    color: "purple",
    stages: [
      {
        id: "u2-s1",
        title: "The Nervous System",
        description: "How the brain controls movement",
        masteryThreshold: 70,
        lessons: [
          {
            id: "u2-s1-l1",
            title: "Nervous System Basics",
            type: "learn",
            description:
              "Central and peripheral nervous systems and their role in movement.",
            xpReward: 25,
            content: {
              sections: [
                {
                  heading: "Central Nervous System (CNS)",
                  body: "The CNS consists of the brain and spinal cord. It serves as the main processing center for the entire nervous system. The brain interprets sensory information and sends motor commands to muscles. The spinal cord acts as a conduit for signals between the brain and the rest of the body, and also controls simple reflexes independently.",
                  keyPoint:
                    "The CNS (brain + spinal cord) is the command center that processes information and directs movement.",
                },
                {
                  heading: "Peripheral Nervous System (PNS)",
                  body: "The PNS includes all nerves outside the brain and spinal cord. It has two main divisions: the sensory (afferent) division carries information TO the CNS, while the motor (efferent) division carries commands FROM the CNS to muscles and organs. Motor neurons are the final pathway for voluntary movement.",
                  keyPoint:
                    "Sensory (afferent) nerves send info TO the CNS; motor (efferent) nerves send commands FROM the CNS.",
                },
                {
                  heading: "Motor Units and Recruitment",
                  body: "A motor unit is a motor neuron and all the muscle fibers it innervates. When greater force is needed, the nervous system recruits more motor units (size principle). Smaller motor units are recruited first for fine motor control, and larger ones are recruited as force demands increase.",
                  keyPoint:
                    "Motor unit = motor neuron + its muscle fibers. More force = more motor units recruited (size principle).",
                },
              ],
            } as LearnContent,
          },
          {
            id: "u2-s1-l2",
            title: "Nervous System Terms",
            type: "flashcards",
            description: "Key neuroscience vocabulary for trainers.",
            xpReward: 20,
            prerequisites: ["u2-s1-l1"],
            content: {
              cards: [
                {
                  term: "Motor Unit",
                  definition:
                    "A motor neuron and all the muscle fibers it innervates.",
                },
                {
                  term: "Afferent Neurons",
                  definition:
                    "Sensory neurons that carry information from the body TO the central nervous system.",
                },
                {
                  term: "Efferent Neurons",
                  definition:
                    "Motor neurons that carry commands FROM the central nervous system to muscles.",
                },
                {
                  term: "Proprioception",
                  definition:
                    "The body's ability to sense its position, movement, and equilibrium without visual input.",
                },
                {
                  term: "Muscle Spindle",
                  definition:
                    "Sensory receptor within muscle that detects changes in muscle length and rate of length change.",
                },
                {
                  term: "Golgi Tendon Organ",
                  definition:
                    "Sensory receptor in tendons that detects changes in muscle tension; triggers relaxation when tension is too high.",
                },
              ],
            } as FlashcardContent,
          },
          {
            id: "u2-s1-l3",
            title: "Nervous System Quiz",
            type: "quiz",
            description: "Test your neuroscience knowledge.",
            xpReward: 30,
            prerequisites: ["u2-s1-l2"],
            content: {
              questions: [
                {
                  id: "u2q1",
                  question:
                    "What are the two main components of the central nervous system?",
                  options: [
                    "Brain and spinal cord",
                    "Sensory and motor nerves",
                    "Sympathetic and parasympathetic systems",
                    "Cerebellum and brainstem",
                  ],
                  correctIndex: 0,
                  explanation:
                    "The CNS consists of the brain and spinal cord, which together serve as the main processing center.",
                  difficulty: "easy",
                  conceptTag: "nervous-system",
                },
                {
                  id: "u2q2",
                  question:
                    "Which type of neuron carries signals FROM the CNS to the muscles?",
                  options: [
                    "Afferent neurons",
                    "Efferent neurons",
                    "Interneurons",
                    "Sensory neurons",
                  ],
                  correctIndex: 1,
                  explanation:
                    "Efferent (motor) neurons carry signals from the CNS to muscles and organs. Remember: Efferent = Exit.",
                  difficulty: "easy",
                  conceptTag: "nervous-system",
                },
                {
                  id: "u2q3",
                  question: "What is the size principle of motor unit recruitment?",
                  options: [
                    "Larger muscles are always recruited first",
                    "Smaller motor units are recruited before larger ones as force demands increase",
                    "The size of the muscle determines which exercises to use",
                    "Motor units of the same size are always recruited together",
                  ],
                  correctIndex: 1,
                  explanation:
                    "The size principle states that smaller motor units (with lower thresholds) are recruited first, with progressively larger motor units activated as force demands increase.",
                  difficulty: "medium",
                  conceptTag: "motor-recruitment",
                },
                {
                  id: "u2q4",
                  question:
                    "What is the function of the Golgi tendon organ?",
                  options: [
                    "Detects changes in muscle length",
                    "Detects changes in muscle tension and triggers relaxation when tension is excessive",
                    "Controls voluntary muscle contraction",
                    "Transmits pain signals to the brain",
                  ],
                  correctIndex: 1,
                  explanation:
                    "The Golgi tendon organ senses tension in the tendon and triggers a reflexive relaxation (autogenic inhibition) to protect the muscle from excessive force.",
                  difficulty: "medium",
                  conceptTag: "proprioception",
                },
              ],
            } as QuizContent,
          },
          {
            id: "u2-s1-l4",
            title: "Offline: Draw the Nervous System",
            type: "offline",
            description: "Sketch the CNS and PNS from memory and label key parts.",
            xpReward: 20,
            prerequisites: ["u2-s1-l3"],
            offlineExercise: {
              type: "write",
              icon: "📝",
              instruction: "Draw the 3 planes of motion on paper. For each plane, write one exercise that occurs in it. Don't look anything up first.",
              timeMinutes: 5,
              verificationPrompt: "Describe what you drew and which exercises you chose:",
              aiReviewEnabled: true,
            },
          },
        ],
      },
      {
        id: "u2-s2",
        title: "The Muscular System",
        description: "Muscles, fiber types, and how they produce force",
        masteryThreshold: 70,
        lessons: [
          {
            id: "u2-s2-l1",
            title: "Muscle Anatomy & Fiber Types",
            type: "learn",
            description: "Types of muscle tissue and muscle fiber characteristics.",
            xpReward: 30,
            content: {
              sections: [
                {
                  heading: "Types of Muscle Tissue",
                  body: "There are three types of muscle tissue: skeletal (voluntary, attached to bones), cardiac (involuntary, heart only), and smooth (involuntary, found in blood vessels and organs). Personal trainers primarily work with skeletal muscle, which is responsible for all voluntary movement.",
                  keyPoint:
                    "Skeletal muscle is voluntary and responsible for movement; cardiac and smooth muscle are involuntary.",
                },
                {
                  heading: "Type I (Slow-Twitch) Fibers",
                  body: "Type I fibers are fatigue-resistant and designed for endurance. They have a high density of mitochondria, use aerobic metabolism, and produce lower force. They are recruited first during low-intensity activities like walking, jogging, or maintaining posture.",
                  keyPoint:
                    "Type I fibers = slow-twitch, fatigue-resistant, aerobic, lower force, recruited first.",
                },
                {
                  heading: "Type II (Fast-Twitch) Fibers",
                  body: "Type II fibers produce more force and contract faster but fatigue quickly. Type IIa fibers have moderate endurance and power (hybrid). Type IIx fibers are the most powerful but fatigue fastest, relying on anaerobic metabolism. They are recruited for high-intensity efforts like sprinting or heavy lifting.",
                  keyPoint:
                    "Type II fibers = fast-twitch, high force, fatigue quickly. IIa = hybrid, IIx = most powerful.",
                },
              ],
            } as LearnContent,
          },
          {
            id: "u2-s2-l2",
            title: "Muscle Flashcards",
            type: "flashcards",
            description: "Memorize key muscular system terms.",
            xpReward: 20,
            prerequisites: ["u2-s2-l1"],
            content: {
              cards: [
                {
                  term: "Type I Muscle Fibers",
                  definition:
                    "Slow-twitch fibers: fatigue-resistant, aerobic, lower force output, recruited first. Ideal for endurance.",
                },
                {
                  term: "Type IIa Muscle Fibers",
                  definition:
                    "Fast-twitch hybrid fibers: moderate power and endurance. Can adapt toward either endurance or power characteristics.",
                },
                {
                  term: "Type IIx Muscle Fibers",
                  definition:
                    "Fast-twitch fibers: highest force production, fastest fatigue, anaerobic. Used for explosive movements.",
                },
                {
                  term: "Agonist",
                  definition:
                    "The prime mover muscle responsible for producing a specific movement.",
                },
                {
                  term: "Antagonist",
                  definition:
                    "The muscle that opposes the prime mover; it must relax to allow the movement.",
                },
                {
                  term: "Synergist",
                  definition:
                    "A muscle that assists the prime mover in producing a movement.",
                },
              ],
            } as FlashcardContent,
          },
          {
            id: "u2-s2-l3",
            title: "Muscular System Quiz",
            type: "quiz",
            description: "Test your muscle knowledge.",
            xpReward: 30,
            prerequisites: ["u2-s2-l2"],
            content: {
              questions: [
                {
                  id: "u2s2q1",
                  question:
                    "Which muscle fiber type is recruited first during low-intensity exercise?",
                  options: ["Type IIx", "Type IIa", "Type I", "All equally"],
                  correctIndex: 2,
                  explanation:
                    "Type I (slow-twitch) fibers are recruited first due to their lower activation threshold (size principle).",
                  difficulty: "easy",
                  conceptTag: "muscle-fiber-types",
                },
                {
                  id: "u2s2q2",
                  question: "What is the role of an antagonist muscle?",
                  options: [
                    "It is the prime mover",
                    "It assists the prime mover",
                    "It opposes the prime mover and must relax to allow movement",
                    "It stabilizes the joint",
                  ],
                  correctIndex: 2,
                  explanation:
                    "The antagonist opposes the agonist (prime mover). For example, during a bicep curl, the triceps is the antagonist.",
                  difficulty: "easy",
                  conceptTag: "muscle-roles",
                },
                {
                  id: "u2s2q3",
                  question:
                    "Which fiber type has the highest force production but fatigues the fastest?",
                  options: ["Type I", "Type IIa", "Type IIx", "Cardiac muscle"],
                  correctIndex: 2,
                  explanation:
                    "Type IIx fibers produce the most force and power but have the least endurance, relying primarily on anaerobic metabolism.",
                  difficulty: "medium",
                  conceptTag: "muscle-fiber-types",
                },
              ],
            } as QuizContent,
          },
          {
            id: "u2-s2-l4",
            title: "Offline: Feel Your Muscle Fibers",
            type: "offline",
            description: "Experience autogenic inhibition and compare stretching techniques.",
            xpReward: 20,
            prerequisites: ["u2-s2-l3"],
            offlineExercise: {
              type: "self-assess",
              icon: "🔍",
              instruction: "Hold a stretch on your hamstring for 30 seconds. Notice the moment your muscle relaxes — that's autogenic inhibition via the GTO. Now try a quick dynamic stretch. Notice how different it feels. Write down the difference.",
              timeMinutes: 5,
              verificationPrompt: "Describe what you felt during the static vs dynamic stretch:",
              aiReviewEnabled: true,
            },
          },
          {
            id: "u2-s2-l5",
            title: "Feynman: Muscle Fiber Types",
            type: "feynman",
            description: "Explain Type I vs Type II muscle fibers like you're teaching a beginner.",
            xpReward: 25,
            prerequisites: ["u2-s2-l4"],
            feynmanTopic: "The differences between Type I, Type IIa, and Type IIx muscle fibers — what they do, when they're recruited, and why it matters for training",
          },
          {
            id: "u2-s2-l6",
            title: "Unit 2 Review",
            type: "review",
            description: "Adaptive review of human movement science concepts.",
            xpReward: 25,
            prerequisites: ["u2-s2-l5"],
          },
        ],
      },
    ],
  },
  {
    id: "unit-3",
    title: "Assessment & Program Design",
    description:
      "Client assessments, movement screens, and designing effective programs.",
    icon: "📋",
    color: "green",
    stages: [
      {
        id: "u3-s1",
        title: "Health & Fitness Assessments",
        description: "Screening clients and identifying risk factors",
        masteryThreshold: 75,
        lessons: [
          {
            id: "u3-s1-l1",
            title: "PAR-Q and Health Screening",
            type: "learn",
            description: "Pre-exercise screening and risk stratification.",
            xpReward: 25,
            content: {
              sections: [
                {
                  heading: "The PAR-Q+",
                  body: "The Physical Activity Readiness Questionnaire for Everyone (PAR-Q+) is a self-screening tool used to determine if a client should seek medical clearance before starting an exercise program. It asks about heart conditions, chest pain, balance issues, medications, and other health concerns.",
                  keyPoint:
                    "PAR-Q+ is the first screening tool — determines if medical clearance is needed before exercise.",
                },
                {
                  heading: "Risk Stratification",
                  body: "Based on screening results, clients are categorized by risk level. Factors include age, family history of heart disease, smoking, hypertension, obesity, sedentary lifestyle, and cholesterol levels. Higher-risk clients may need physician clearance before vigorous exercise.",
                  keyPoint:
                    "Risk factors include: age, family history, smoking, hypertension, obesity, inactivity, cholesterol.",
                },
              ],
            } as LearnContent,
          },
          {
            id: "u3-s1-l2",
            title: "Assessment Terms",
            type: "flashcards",
            description: "Key assessment vocabulary.",
            xpReward: 20,
            prerequisites: ["u3-s1-l1"],
            content: {
              cards: [
                {
                  term: "PAR-Q+",
                  definition:
                    "Physical Activity Readiness Questionnaire for Everyone — pre-exercise screening tool to identify need for medical clearance.",
                },
                {
                  term: "Subjective Information",
                  definition:
                    "Client-reported data such as occupation, lifestyle, medical history, and goals.",
                },
                {
                  term: "Objective Information",
                  definition:
                    "Measurable data collected by the trainer: heart rate, blood pressure, body composition, movement assessments.",
                },
                {
                  term: "Overhead Squat Assessment (OHSA)",
                  definition:
                    "A movement assessment that identifies muscle imbalances and compensations through a full-body squat with arms overhead.",
                },
              ],
            } as FlashcardContent,
          },
          {
            id: "u3-s1-l3",
            title: "Assessment Scenario",
            type: "scenario",
            description: "Screen a new client for exercise readiness.",
            xpReward: 35,
            prerequisites: ["u3-s1-l2"],
            content: {
              clientName: "Mike",
              clientAge: 52,
              clientGoal: "Improve cardiovascular health and lose weight",
              clientBackground:
                "Mike is a 52-year-old man with controlled hypertension (on medication), a sedentary desk job, and a BMI of 31. He hasn't exercised in over 5 years. His father had a heart attack at age 55. He answered 'Yes' to two PAR-Q+ questions.",
              question:
                "What is the most appropriate next step before starting Mike's exercise program?",
              options: [
                "Begin with Phase 1 of the OPT model immediately",
                "Refer Mike for medical clearance before starting any exercise program",
                "Start with high-intensity interval training to maximize results",
                "Have Mike sign a waiver and proceed with moderate exercise",
              ],
              correctIndex: 1,
              explanation:
                "Mike has multiple risk factors (age >45, hypertension, sedentary, obese, family history) and answered Yes to PAR-Q+ questions. He should obtain medical clearance from his physician before beginning an exercise program. This is both a safety requirement and within scope of practice guidelines.",
              conceptTag: "health-screening",
            } as ScenarioContent,
          },
          {
            id: "u3-s1-l4",
            title: "Assessments Quiz",
            type: "quiz",
            description: "Test your assessment knowledge.",
            xpReward: 30,
            prerequisites: ["u3-s1-l3"],
            content: {
              questions: [
                {
                  id: "u3q1",
                  question: "What is the primary purpose of the PAR-Q+?",
                  options: [
                    "To measure body composition",
                    "To determine if medical clearance is needed before exercise",
                    "To assess cardiovascular fitness",
                    "To create an exercise program",
                  ],
                  correctIndex: 1,
                  explanation:
                    "The PAR-Q+ is a self-screening tool that helps identify individuals who may need medical clearance before starting an exercise program.",
                  difficulty: "easy",
                  conceptTag: "health-screening",
                },
                {
                  id: "u3q2",
                  question:
                    "During an overhead squat assessment, a client's knees move inward. What compensation pattern is this?",
                  options: [
                    "Knee valgus",
                    "Knee varus",
                    "Anterior pelvic tilt",
                    "Excessive forward lean",
                  ],
                  correctIndex: 0,
                  explanation:
                    "Knee valgus (knees caving inward) during a squat indicates potential weakness in the gluteus medius/maximus and tightness in the adductors.",
                  difficulty: "medium",
                  conceptTag: "movement-assessment",
                },
              ],
            } as QuizContent,
          },
          {
            id: "u3-s1-l5",
            title: "Offline: Overhead Squat Self-Check",
            type: "offline",
            description: "Perform an overhead squat and observe your own compensations.",
            xpReward: 20,
            prerequisites: ["u3-s1-l4"],
            offlineExercise: {
              type: "move",
              icon: "🏃",
              instruction: "Stand up. Perform 5 slow overhead squats. Pay attention to: Do your knees cave in? Does your back arch? Do your arms fall forward? Write down what you noticed.",
              timeMinutes: 3,
              verificationPrompt: "What compensations did you notice in your own overhead squat?",
              aiReviewEnabled: true,
            },
          },
          {
            id: "u3-s1-l6",
            title: "Feynman: Risk Stratification",
            type: "feynman",
            description: "Explain the client screening process to a new trainer.",
            xpReward: 25,
            prerequisites: ["u3-s1-l5"],
            feynmanTopic: "The client health screening process: PAR-Q+, risk stratification, and when to refer to a physician",
          },
        ],
      },
    ],
  },
  {
    id: "unit-4",
    title: "Exercise Technique & Training",
    description:
      "Proper form, exercise selection, and training modalities.",
    icon: "💪",
    color: "amber",
    stages: [
      {
        id: "u4-s1",
        title: "Core Training & Balance",
        description: "Building a strong foundation through the core",
        masteryThreshold: 70,
        lessons: [
          {
            id: "u4-s1-l1",
            title: "Core Training Principles",
            type: "learn",
            description: "Understanding the core and how to train it effectively.",
            xpReward: 25,
            content: {
              sections: [
                {
                  heading: "The Core Defined",
                  body: "The core is not just the 'abs.' NASM defines the core as the lumbo-pelvic-hip complex (LPHC), thoracic spine, and cervical spine. It includes deep stabilizers like the transverse abdominis, multifidus, and pelvic floor muscles, as well as larger muscles like the rectus abdominis, obliques, erector spinae, and hip musculature.",
                  keyPoint:
                    "Core = LPHC + thoracic + cervical spine. Includes deep stabilizers AND global movers.",
                },
                {
                  heading: "Core Training Progression",
                  body: "Core training should follow the OPT model: start with stabilization exercises (drawing-in maneuver, planks, bridges on unstable surfaces), progress to strength exercises (ball crunches, cable rotations), then power exercises (medicine ball throws, rotation slams). Always master stability before adding load or speed.",
                  keyPoint:
                    "Progress core training: stabilization (planks, draw-in) -> strength (crunches, cables) -> power (med ball throws).",
                },
              ],
            } as LearnContent,
          },
          {
            id: "u4-s1-l2",
            title: "Core & Balance Flashcards",
            type: "flashcards",
            description: "Key terms for core and balance training.",
            xpReward: 20,
            prerequisites: ["u4-s1-l1"],
            content: {
              cards: [
                {
                  term: "Drawing-In Maneuver",
                  definition:
                    "Activating the deep core stabilizers by pulling the navel toward the spine. Engages transverse abdominis and multifidus.",
                },
                {
                  term: "LPHC",
                  definition:
                    "Lumbo-Pelvic-Hip Complex — the core region including lumbar spine, pelvis, and hip joints.",
                },
                {
                  term: "Transverse Abdominis",
                  definition:
                    "The deepest abdominal muscle; acts as a natural weight belt to stabilize the spine.",
                },
                {
                  term: "Bracing",
                  definition:
                    "Co-contracting the global core muscles (rectus abdominis, obliques, erector spinae) to create 360-degree trunk stiffness.",
                },
              ],
            } as FlashcardContent,
          },
          {
            id: "u4-s1-l3",
            title: "Core Training Quiz",
            type: "quiz",
            description: "Test your core training knowledge.",
            xpReward: 30,
            prerequisites: ["u4-s1-l2"],
            content: {
              questions: [
                {
                  id: "u4q1",
                  question: "What does LPHC stand for?",
                  options: [
                    "Lumbar-Pectoral-Hip Circuit",
                    "Lumbo-Pelvic-Hip Complex",
                    "Lower-Posterior-Hip Chain",
                    "Lateral-Pelvic-Hamstring Complex",
                  ],
                  correctIndex: 1,
                  explanation:
                    "LPHC stands for Lumbo-Pelvic-Hip Complex, which is the central core region of the body.",
                  difficulty: "easy",
                  conceptTag: "core-training",
                },
                {
                  id: "u4q2",
                  question:
                    "What is the drawing-in maneuver designed to activate?",
                  options: [
                    "Rectus abdominis and obliques",
                    "Transverse abdominis and multifidus",
                    "Erector spinae and gluteus maximus",
                    "Hip flexors and quadriceps",
                  ],
                  correctIndex: 1,
                  explanation:
                    "The drawing-in maneuver specifically targets the deep local stabilizers: the transverse abdominis and multifidus.",
                  difficulty: "medium",
                  conceptTag: "core-training",
                },
              ],
            } as QuizContent,
          },
          {
            id: "u4-s1-l4",
            title: "Offline: Activate Your Core",
            type: "offline",
            description: "Practice the drawing-in maneuver and bracing — feel the difference.",
            xpReward: 20,
            prerequisites: ["u4-s1-l3"],
            offlineExercise: {
              type: "move",
              icon: "🏃",
              instruction: "Stand up. First, perform the drawing-in maneuver: pull your navel toward your spine and hold for 10 seconds. Feel your deep stabilizers engage. Next, practice bracing: tighten all your core muscles as if someone was about to punch your stomach. Hold 10 seconds. Do each 3 times. Write down: which felt easier? Could you breathe normally during each?",
              timeMinutes: 4,
              verificationPrompt: "Describe the difference between the drawing-in maneuver and bracing. Which was harder? Could you breathe during each?",
              aiReviewEnabled: true,
            },
          },
          {
            id: "u4-s1-l5",
            title: "Offline: Teach Core Training Progression",
            type: "offline",
            description: "Explain core training progression out loud to lock it in.",
            xpReward: 20,
            prerequisites: ["u4-s1-l4"],
            offlineExercise: {
              type: "speak",
              icon: "🎤",
              instruction: "Record yourself (voice memo on your phone) explaining the core training progression through the OPT model: what exercises go with stabilization, strength, and power? Speak for at least 60 seconds. Then listen back. Come back and describe what you said well and what you missed.",
              timeMinutes: 4,
              verificationPrompt: "What did you cover in your recording? What did you miss or get wrong when you listened back?",
              aiReviewEnabled: true,
            },
          },
        ],
      },
    ],
  },
  {
    id: "unit-5",
    title: "Nutrition & Behavior Change",
    description:
      "Nutritional science, client communication, and psychology of behavior change.",
    icon: "🥗",
    color: "rose",
    stages: [
      {
        id: "u5-s1",
        title: "Nutrition Fundamentals",
        description: "Macronutrients, micronutrients, and energy balance",
        masteryThreshold: 70,
        lessons: [
          {
            id: "u5-s1-l1",
            title: "Macronutrients",
            type: "learn",
            description: "Understanding proteins, carbohydrates, and fats.",
            xpReward: 25,
            content: {
              sections: [
                {
                  heading: "Proteins",
                  body: "Proteins provide 4 calories per gram and are essential for muscle repair, immune function, and enzyme production. They are made of amino acids — 9 of which are essential (must come from diet). Complete proteins contain all essential amino acids (meat, eggs, dairy, soy). Current guidelines suggest 1.4-2.0 g/kg/day for active individuals.",
                  keyPoint:
                    "Protein: 4 cal/g, 9 essential amino acids, 1.4-2.0 g/kg/day for active individuals.",
                },
                {
                  heading: "Carbohydrates",
                  body: "Carbohydrates provide 4 calories per gram and are the body's preferred energy source, especially during high-intensity exercise. They include simple sugars (quick energy) and complex carbohydrates (sustained energy, fiber). Glycemic index measures how quickly a carb raises blood sugar.",
                  keyPoint:
                    "Carbs: 4 cal/g, preferred energy source for high-intensity exercise. GI measures blood sugar impact.",
                },
                {
                  heading: "Fats",
                  body: "Fats provide 9 calories per gram — the most energy-dense macronutrient. They are essential for hormone production, cell membranes, and fat-soluble vitamin absorption (A, D, E, K). Unsaturated fats (olive oil, nuts, fish) are heart-healthy. Trans fats and excessive saturated fats should be limited.",
                  keyPoint:
                    "Fat: 9 cal/g, needed for hormones and vitamin absorption. Favor unsaturated fats.",
                },
              ],
            } as LearnContent,
          },
          {
            id: "u5-s1-l2",
            title: "Nutrition Flashcards",
            type: "flashcards",
            description: "Key nutrition terms and values.",
            xpReward: 20,
            prerequisites: ["u5-s1-l1"],
            content: {
              cards: [
                {
                  term: "Calorie Values per Gram",
                  definition:
                    "Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g, Alcohol: 7 cal/g.",
                },
                {
                  term: "Essential Amino Acids",
                  definition:
                    "9 amino acids the body cannot produce — must be obtained from food. Include leucine, isoleucine, valine (BCAAs), and others.",
                },
                {
                  term: "Glycemic Index (GI)",
                  definition:
                    "A scale (0-100) measuring how quickly a carbohydrate food raises blood sugar levels. Low GI < 55, High GI > 70.",
                },
                {
                  term: "BMR (Basal Metabolic Rate)",
                  definition:
                    "The number of calories the body burns at complete rest to maintain basic life functions (breathing, circulation, etc.).",
                },
              ],
            } as FlashcardContent,
          },
          {
            id: "u5-s1-l3",
            title: "Nutrition Quiz",
            type: "quiz",
            description: "Test your nutrition knowledge.",
            xpReward: 30,
            prerequisites: ["u5-s1-l2"],
            content: {
              questions: [
                {
                  id: "u5q1",
                  question:
                    "Which macronutrient provides the most calories per gram?",
                  options: ["Protein", "Carbohydrates", "Fat", "Fiber"],
                  correctIndex: 2,
                  explanation:
                    "Fat provides 9 calories per gram, compared to 4 cal/g for both protein and carbohydrates.",
                  difficulty: "easy",
                  conceptTag: "macronutrients",
                },
                {
                  id: "u5q2",
                  question:
                    "A personal trainer's client asks for a specific meal plan. What is the appropriate response?",
                  options: [
                    "Create a detailed meal plan with exact portions",
                    "Provide general nutrition guidelines and refer to a registered dietitian for a specific meal plan",
                    "Recommend a popular diet they read about",
                    "Tell the client to figure it out on their own",
                  ],
                  correctIndex: 1,
                  explanation:
                    "Creating specific meal plans is outside a personal trainer's scope of practice. Trainers can provide general nutrition guidance but should refer clients to registered dietitians for specific dietary prescriptions.",
                  difficulty: "medium",
                  conceptTag: "scope-of-practice",
                },
              ],
            } as QuizContent,
          },
          {
            id: "u5-s1-l4",
            title: "Offline: Calorie Math on Paper",
            type: "offline",
            description: "Calculate macros for a meal by hand — no calculator.",
            xpReward: 20,
            prerequisites: ["u5-s1-l3"],
            offlineExercise: {
              type: "write",
              icon: "📝",
              instruction: "On paper, write down what you ate for your last meal (or make one up). Estimate the grams of protein, carbs, and fat. Then calculate total calories by hand using the calorie-per-gram values. Show your work. Come back and type your calculations.",
              timeMinutes: 5,
              verificationPrompt: "Type your meal, the macros you estimated, and your calorie calculation (show the math):",
              aiReviewEnabled: true,
            },
          },
          {
            id: "u5-s1-l5",
            title: "Offline: Scope of Practice Role-Play",
            type: "offline",
            description: "Practice responding when a client asks for a meal plan.",
            xpReward: 20,
            prerequisites: ["u5-s1-l4"],
            offlineExercise: {
              type: "speak",
              icon: "🎤",
              instruction: "Imagine a client says: 'Can you write me a meal plan? I want to lose 20 pounds.' Practice your response out loud — staying within scope of practice while still being helpful. Say it at least twice until it feels natural. Come back and type what you said.",
              timeMinutes: 3,
              verificationPrompt: "What did you say to the client? How did you balance being helpful with staying in scope?",
              aiReviewEnabled: true,
            },
          },
          {
            id: "u5-s1-l6",
            title: "Feynman: Macronutrients",
            type: "feynman",
            description: "Explain all three macronutrients as if teaching a client.",
            xpReward: 25,
            prerequisites: ["u5-s1-l5"],
            feynmanTopic: "The three macronutrients (protein, carbohydrates, fat): calorie values, functions in the body, and general guidelines for active individuals",
          },
        ],
      },
    ],
  },
  {
    id: "unit-6",
    title: "Exam Preparation",
    description:
      "Comprehensive review, practice exams, and test-taking strategies.",
    icon: "🎯",
    color: "teal",
    stages: [
      {
        id: "u6-s1",
        title: "Comprehensive Review",
        description: "Pulling it all together before the exam",
        masteryThreshold: 80,
        lessons: [
          {
            id: "u6-s1-l1",
            title: "Full Curriculum Review",
            type: "review",
            description: "Adaptive review across all units and concepts.",
            xpReward: 40,
          },
          {
            id: "u6-s1-l2",
            title: "Practice Exam Scenarios",
            type: "scenario",
            description: "Complex client scenarios combining multiple concepts.",
            xpReward: 40,
            prerequisites: ["u6-s1-l1"],
            content: {
              clientName: "David",
              clientAge: 28,
              clientGoal:
                "Train for a physique competition in 16 weeks",
              clientBackground:
                "David is a 28-year-old experienced lifter (3+ years consistent training) with no injuries. He has passed through phases 1-3 of the OPT model and has solid movement quality. His current body fat is 15% and he wants to get to competition-ready levels. He has good nutrition habits and is willing to follow a structured program.",
              question:
                "What OPT phase and rep range would be most appropriate for the initial mesocycle of David's competition prep?",
              options: [
                "Phase 1: Stabilization Endurance (12-20 reps)",
                "Phase 3: Hypertrophy (6-12 reps)",
                "Phase 4: Maximal Strength (1-5 reps)",
                "Phase 5: Power (1-5 reps explosive)",
              ],
              correctIndex: 1,
              explanation:
                "For a physique competitor looking to maximize muscle definition and size, Phase 3 (Hypertrophy) with 6-12 reps is most appropriate. This phase focuses on muscle growth with moderate to heavy loads. Since David is experienced, he can handle this training intensity. The hypertrophy phase directly supports his competition goals of maximizing lean muscle appearance.",
              conceptTag: "opt-model-application",
            } as ScenarioContent,
          },
          {
            id: "u6-s1-l3",
            title: "Offline: Full Brain Dump",
            type: "offline",
            description: "Write down everything you know — the ultimate recall exercise.",
            xpReward: 25,
            prerequisites: ["u6-s1-l2"],
            offlineExercise: {
              type: "self-assess",
              icon: "🔍",
              instruction: "Get a blank piece of paper. Set a timer for 10 minutes. Write down EVERYTHING you can remember about the NASM CPT material: OPT model phases, muscle fiber types, assessment procedures, scope of practice, nutrition guidelines, core training, nervous system — all of it. Don't organize, just dump. When the timer goes off, come back and describe what you remembered and what you know you forgot.",
              timeMinutes: 12,
              verificationPrompt: "What topics did you cover in your brain dump? What major areas did you realize you forgot or are weak on?",
              aiReviewEnabled: true,
            },
          },
          {
            id: "u6-s1-l4",
            title: "Feynman: The OPT Model Complete",
            type: "feynman",
            description: "Explain the entire OPT model as if teaching a new trainer.",
            xpReward: 30,
            prerequisites: ["u6-s1-l3"],
            feynmanTopic: "The complete NASM OPT model: all 5 phases, their rep ranges, exercise types, progressions, and how to determine which phase a client should start in",
          },
          {
            id: "u6-s1-l5",
            title: "Final Assessment",
            type: "quiz",
            description: "Comprehensive final quiz covering all units.",
            xpReward: 50,
            prerequisites: ["u6-s1-l4"],
            content: {
              questions: [
                {
                  id: "u6q1",
                  question:
                    "Which OPT phase uses supersets pairing a strength exercise with a stabilization exercise?",
                  options: [
                    "Phase 1",
                    "Phase 2",
                    "Phase 3",
                    "Phase 5",
                  ],
                  correctIndex: 1,
                  explanation:
                    "Phase 2 (Strength Endurance) uniquely pairs traditional strength exercises with stabilization exercises in supersets.",
                  difficulty: "medium",
                  conceptTag: "opt-model",
                },
                {
                  id: "u6q2",
                  question:
                    "A client exhibits excessive forward lean during an overhead squat. Which muscles are likely overactive?",
                  options: [
                    "Anterior tibialis and gluteus maximus",
                    "Soleus, gastrocnemius, and hip flexors",
                    "Hamstrings and rhomboids",
                    "Quadriceps and deltoids",
                  ],
                  correctIndex: 1,
                  explanation:
                    "Excessive forward lean is typically caused by overactive soleus, gastrocnemius (calves), and hip flexor complex, along with underactive anterior tibialis, gluteus maximus, and erector spinae.",
                  difficulty: "hard",
                  conceptTag: "movement-assessment",
                },
                {
                  id: "u6q3",
                  question:
                    "How many calories are in a meal containing 30g protein, 50g carbohydrates, and 15g fat?",
                  options: [
                    "380 calories",
                    "455 calories",
                    "520 calories",
                    "295 calories",
                  ],
                  correctIndex: 1,
                  explanation:
                    "Protein: 30g x 4 cal = 120. Carbs: 50g x 4 cal = 200. Fat: 15g x 9 cal = 135. Total = 455 calories.",
                  difficulty: "medium",
                  conceptTag: "macronutrients",
                },
                {
                  id: "u6q4",
                  question:
                    "What principle describes the body's predictable response to stress through alarm, resistance, and exhaustion?",
                  options: [
                    "SAID Principle",
                    "Progressive Overload",
                    "General Adaptation Syndrome",
                    "Wolff's Law",
                  ],
                  correctIndex: 2,
                  explanation:
                    "The General Adaptation Syndrome (GAS), developed by Hans Selye, describes three stages of stress response: alarm reaction, resistance development, and exhaustion.",
                  difficulty: "easy",
                  conceptTag: "general-adaptation-syndrome",
                },
              ],
            } as QuizContent,
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

export function getCurriculum(): Unit[] {
  return curriculum;
}

export function getAllLessons(): Lesson[] {
  const lessons: Lesson[] = [];
  for (const unit of curriculum) {
    for (const stage of unit.stages) {
      for (const lesson of stage.lessons) {
        lessons.push(lesson);
      }
    }
  }
  return lessons;
}

export function getUnit(id: string): Unit | undefined {
  return curriculum.find((u) => u.id === id);
}

export function getStage(id: string): Stage | undefined {
  for (const unit of curriculum) {
    const stage = unit.stages.find((s) => s.id === id);
    if (stage) return stage;
  }
  return undefined;
}

export function getLesson(id: string): Lesson | undefined {
  for (const unit of curriculum) {
    for (const stage of unit.stages) {
      const lesson = stage.lessons.find((l) => l.id === id);
      if (lesson) return lesson;
    }
  }
  return undefined;
}

export function getUnitForLesson(
  lessonId: string
): Unit | undefined {
  for (const unit of curriculum) {
    for (const stage of unit.stages) {
      if (stage.lessons.some((l) => l.id === lessonId)) return unit;
    }
  }
  return undefined;
}

export function getStageForLesson(
  lessonId: string
): Stage | undefined {
  for (const unit of curriculum) {
    for (const stage of unit.stages) {
      if (stage.lessons.some((l) => l.id === lessonId)) return stage;
    }
  }
  return undefined;
}

export function getNextLesson(
  currentLessonId: string
): Lesson | undefined {
  const allLessons = getAllLessons();
  const idx = allLessons.findIndex((l) => l.id === currentLessonId);
  if (idx === -1 || idx >= allLessons.length - 1) return undefined;
  return allLessons[idx + 1];
}
