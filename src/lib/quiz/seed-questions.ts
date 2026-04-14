// Starter quiz questions — enough for initial studying
// Full content seeding happens in Phase 9

export const seedQuestions = [
  // Chapter 1
  {
    chapter: 1,
    question: "What is the primary goal of NASM's integrated training approach?",
    options: ["Maximize muscle size", "Improve all functional abilities simultaneously", "Focus exclusively on strength", "Train only cardiovascular endurance"],
    correct_answer: 1,
    explanation: "NASM's integrated training combines flexibility, core, balance, reactive, resistance, and cardio training to improve all functional abilities — not just one area in isolation.",
    difficulty: "easy",
  },
  {
    chapter: 1,
    question: "Evidence-based practice in personal training relies on which three components?",
    options: ["Cost, availability, popularity", "Scientific evidence, clinical experience, client values", "Equipment, facility, schedule", "Certification, insurance, marketing"],
    correct_answer: 1,
    explanation: "Evidence-based practice integrates the best available scientific evidence with clinical expertise and individual client values/preferences to guide training decisions.",
    difficulty: "medium",
  },

  // Chapter 2
  {
    chapter: 2,
    question: "Which type of muscle fiber is best suited for endurance activities?",
    options: ["Type II (fast-twitch)", "Type I (slow-twitch)", "Type IIx (fast-twitch glycolytic)", "Type III (super fast-twitch)"],
    correct_answer: 1,
    explanation: "Type I (slow-twitch) fibers are fatigue-resistant and well-suited for sustained, endurance-based activities. They use aerobic metabolism primarily.",
    difficulty: "easy",
  },
  {
    chapter: 2,
    question: "What is the role of the Golgi tendon organ (GTO)?",
    options: ["Detect changes in muscle length", "Sense changes in muscular tension and cause relaxation", "Increase muscle contraction speed", "Store elastic energy"],
    correct_answer: 1,
    explanation: "The GTO is a sensory receptor in tendons that senses changes in muscular tension. When stimulated (like during a sustained stretch), it causes the muscle to relax — this is called autogenic inhibition.",
    difficulty: "medium",
  },
  {
    chapter: 2,
    question: "What is the function of a synergist muscle?",
    options: ["Oppose the primary mover", "Assist the primary mover in performing a movement", "Stabilize joints not directly involved", "Generate maximum force independently"],
    correct_answer: 1,
    explanation: "A synergist assists the agonist (primary mover) in producing a desired movement. For example, the brachialis is a synergist to the biceps during elbow flexion.",
    difficulty: "easy",
  },

  // Chapter 4
  {
    chapter: 4,
    question: "During an overhead squat assessment, the knees moving inward (valgus) indicates:",
    options: ["Strong adductors", "Overactive adductors and underactive gluteus medius", "Proper movement mechanics", "Excessive hamstring flexibility"],
    correct_answer: 1,
    explanation: "Knee valgus (knees caving inward) during a squat indicates overactive adductors/IT band and underactive gluteus medius/maximus. This is a common compensation pattern.",
    difficulty: "medium",
  },
  {
    chapter: 4,
    question: "What are the five kinetic chain checkpoints observed during movement assessments?",
    options: ["Hands, elbows, shoulders, hips, knees", "Feet/ankles, knees, LPHC, shoulders, head", "Wrists, shoulders, spine, hips, feet", "Neck, chest, core, thighs, calves"],
    correct_answer: 1,
    explanation: "The five kinetic chain checkpoints are: feet and ankles, knees, lumbo-pelvic-hip complex (LPHC), shoulders, and head/cervical spine. These are observed from anterior, lateral, and posterior views.",
    difficulty: "medium",
  },

  // Chapter 5
  {
    chapter: 5,
    question: "During the lowering phase of a push-up, the chest muscles are performing which type of contraction?",
    options: ["Concentric", "Isometric", "Eccentric", "Isokinetic"],
    correct_answer: 2,
    explanation: "During the lowering phase, the chest muscles lengthen under tension to control the descent — this is an eccentric contraction. The pushing-up phase is concentric.",
    difficulty: "easy",
  },
  {
    chapter: 5,
    question: "According to the force-velocity curve, what happens as concentric contraction velocity increases?",
    options: ["Force production increases", "Force production decreases", "Force stays the same", "Force becomes unpredictable"],
    correct_answer: 1,
    explanation: "The force-velocity relationship shows that as the speed of a concentric contraction increases, the force the muscle can produce decreases. This is why you can lift heavier weights slowly than quickly.",
    difficulty: "hard",
  },

  // Chapter 6
  {
    chapter: 6,
    question: "What is the primary mechanism by which foam rolling (SMR) improves flexibility?",
    options: ["Stretching the muscle fibers", "Autogenic inhibition via GTO stimulation", "Increasing blood flow only", "Breaking down scar tissue"],
    correct_answer: 1,
    explanation: "Self-myofascial release (foam rolling) applies sustained pressure to soft tissue, stimulating the GTO which triggers autogenic inhibition — causing the muscle to relax and allowing greater range of motion.",
    difficulty: "medium",
  },

  // Chapter 8
  {
    chapter: 8,
    question: "The drawing-in maneuver activates which core muscle?",
    options: ["Rectus abdominis", "External obliques", "Transverse abdominis", "Erector spinae"],
    correct_answer: 2,
    explanation: "The drawing-in maneuver (pulling the navel toward the spine) specifically activates the transverse abdominis, the deepest core muscle that acts like a natural weight belt to stabilize the spine.",
    difficulty: "easy",
  },

  // Chapter 12
  {
    chapter: 12,
    question: "In OPT Phase 1 (Stabilization Endurance), what is the recommended rep range?",
    options: ["1-5 reps", "6-10 reps", "12-20 reps", "25-30 reps"],
    correct_answer: 2,
    explanation: "Phase 1 uses 12-20 reps with low intensity and a slow tempo (4/2/1) to build muscular endurance and stabilization. The focus is on proper form and neuromuscular control, not heavy loads.",
    difficulty: "easy",
  },
  {
    chapter: 12,
    question: "What tempo is recommended for Phase 1 (Stabilization Endurance) exercises?",
    options: ["1/0/1 (fast)", "2/0/2 (moderate)", "4/2/1 (slow eccentric)", "X/0/X (explosive)"],
    correct_answer: 2,
    explanation: "Phase 1 uses a 4/2/1 tempo: 4-second eccentric, 2-second isometric hold, 1-second concentric. The slow eccentric phase increases time under tension and demands more stabilization.",
    difficulty: "medium",
  },
  {
    chapter: 12,
    question: "A client who can perform 20 push-ups easily but shows poor scapular stability should start in which OPT phase?",
    options: ["Phase 2 — Strength Endurance", "Phase 3 — Muscular Development", "Phase 1 — Stabilization Endurance", "Phase 4 — Maximal Strength"],
    correct_answer: 2,
    explanation: "Regardless of strength levels, any client showing movement compensations or stability issues should start in Phase 1 to correct imbalances before progressing. Strength without stability leads to injury.",
    difficulty: "medium",
  },

  // Chapter 13
  {
    chapter: 13,
    question: "The OPT model consists of how many phases across how many levels?",
    options: ["3 phases, 2 levels", "5 phases, 3 levels", "4 phases, 4 levels", "6 phases, 3 levels"],
    correct_answer: 1,
    explanation: "The OPT model has 5 phases across 3 levels: Level 1 (Stabilization) = Phase 1, Level 2 (Strength) = Phases 2-4, Level 3 (Power) = Phase 5.",
    difficulty: "easy",
  },

  // Chapter 14
  {
    chapter: 14,
    question: "How many calories does one gram of fat provide?",
    options: ["4 calories", "7 calories", "9 calories", "11 calories"],
    correct_answer: 2,
    explanation: "Fat provides 9 calories per gram — more than double that of carbohydrates (4 cal/g) or protein (4 cal/g). This is why fat is the most calorie-dense macronutrient.",
    difficulty: "easy",
  },
  {
    chapter: 14,
    question: "Which component accounts for the largest portion of total daily energy expenditure (TDEE)?",
    options: ["Physical activity", "Thermic effect of food", "Basal metabolic rate (BMR)", "Non-exercise activity thermogenesis"],
    correct_answer: 2,
    explanation: "BMR accounts for approximately 70% of total daily energy expenditure. Physical activity accounts for ~20% and the thermic effect of food for ~10%.",
    difficulty: "medium",
  },

  // Chapter 17
  {
    chapter: 17,
    question: "For older adult clients, which training consideration is most important?",
    options: ["Maximize heavy lifting immediately", "Emphasize balance, stability, and functional movements", "Focus only on cardiovascular training", "Skip warm-ups to save time"],
    correct_answer: 1,
    explanation: "Older adults benefit most from programs emphasizing balance, stability, and functional movements that support activities of daily living and reduce fall risk. Always start with Phase 1 principles.",
    difficulty: "easy",
  },

  // Chapter 19
  {
    chapter: 19,
    question: "Which of the following is outside the scope of practice for a personal trainer?",
    options: ["Creating exercise programs", "Providing general nutrition information", "Diagnosing a client's knee pain", "Performing fitness assessments"],
    correct_answer: 2,
    explanation: "Personal trainers cannot diagnose injuries or medical conditions — that's the scope of licensed medical professionals. Trainers can refer clients to appropriate healthcare providers when needed.",
    difficulty: "easy",
  },
  {
    chapter: 19,
    question: "What is the purpose of the PAR-Q questionnaire?",
    options: ["Measure body composition", "Screen for potential health risks before exercise", "Assess cardiovascular fitness", "Determine training experience level"],
    correct_answer: 1,
    explanation: "The Physical Activity Readiness Questionnaire (PAR-Q) is a pre-participation screening tool that identifies individuals who may need medical clearance before starting an exercise program.",
    difficulty: "easy",
  },
];
