export type Scenario = {
  id: number;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  client: {
    name: string;
    age: number;
    gender: string;
    occupation: string;
    goals: string;
    history: string;
    assessmentFindings: string;
  };
  steps: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    category: string;
  }[];
  relatedChapters: number[];
};

export const scenarios: Scenario[] = [
  // 1. Sedentary Office Worker
  {
    id: 1,
    title: "The Desk-Bound Developer",
    difficulty: "beginner",
    client: {
      name: "Marcus Chen",
      age: 34,
      gender: "Male",
      occupation: "Software developer, sits 10+ hours/day",
      goals:
        "Lose 20 lbs, reduce back pain, improve energy levels for long work days",
      history:
        "No exercise in 3 years. Occasional lower back pain. No medical conditions. BMI 29. Cleared by physician.",
      assessmentFindings:
        "Overhead squat: excessive forward lean, arms fall forward, knees move inward. Anterior pelvic tilt observed. Shoulders rounded forward. Hip flexors and calves tight on length-tension testing.",
    },
    steps: [
      {
        question:
          "Based on Marcus's overhead squat assessment, which finding is MOST concerning and should be addressed first?",
        options: [
          "Knees moving inward (valgus)",
          "Excessive forward lean with arms falling forward",
          "All findings are equally concerning and should be addressed simultaneously",
          "His BMI of 29 is the primary concern",
        ],
        correctAnswer: 1,
        explanation:
          "The excessive forward lean with arms falling forward indicates significant upper-body dysfunction including tight latissimus dorsi, tight hip flexors, and weak core stabilizers. This compensation pattern, combined with his reported back pain and prolonged sitting posture, makes it the most impactful finding to address first. According to NASM, the overhead squat assessment identifies movement compensations that relate to muscle imbalances, and the forward lean is often the dominant pattern in sedentary individuals.",
        category: "assessment",
      },
      {
        question:
          "Which OPT phase should Marcus begin training in?",
        options: [
          "Phase 2: Strength Endurance",
          "Phase 3: Muscular Development (Hypertrophy)",
          "Phase 1: Stabilization Endurance",
          "Phase 5: Power",
        ],
        correctAnswer: 2,
        explanation:
          "Marcus should start in Phase 1 (Stabilization Endurance). As a deconditioned client with significant movement compensations, postural imbalances, and no recent training history, he needs to build a foundation of stability, correct muscle imbalances, and improve neuromuscular efficiency before progressing. The OPT model is designed so that all clients, especially beginners with dysfunction, start in Phase 1.",
        category: "phase-selection",
      },
      {
        question:
          "Which flexibility exercises should be prioritized for Marcus based on his assessment findings?",
        options: [
          "Static stretching for hamstrings and quadriceps before every workout",
          "SMR and static stretching for hip flexors, calves, and latissimus dorsi",
          "Active isolated stretching for chest and shoulders only",
          "Dynamic stretching for all major muscle groups with no targeted approach",
        ],
        correctAnswer: 1,
        explanation:
          "SMR (self-myofascial release) followed by static stretching of the overactive muscles is the corrective flexibility strategy in Phase 1. Marcus's overhead squat showed forward lean (tight lats, hip flexors) and knee valgus (tight calves/adductors). Applying SMR and static stretching to these specific overactive muscles helps restore proper length-tension relationships before strengthening the underactive muscles.",
        category: "exercise-selection",
      },
      {
        question:
          "Which core exercise is MOST appropriate for Marcus in his initial training phase?",
        options: [
          "Barbell back squat with abdominal bracing",
          "Hanging leg raises for lower abdominal development",
          "Floor bridge (glute bridge) with drawing-in maneuver",
          "Russian twists with a medicine ball",
        ],
        correctAnswer: 2,
        explanation:
          "The floor bridge with drawing-in maneuver is ideal for Phase 1 core training. It activates the deep stabilization system (transverse abdominis, multifidus) while also addressing Marcus's anterior pelvic tilt by strengthening the glutes (which are likely underactive from prolonged sitting). The drawing-in maneuver trains local stabilizers that support the lumbar spine, directly helping his back pain.",
        category: "exercise-selection",
      },
      {
        question:
          "What resistance training approach is best for Marcus's first 4 weeks?",
        options: [
          "3 sets of 8-12 reps at 70-80% 1RM with compound lifts",
          "1-3 sets of 12-20 reps with slow tempo (4/2/1) using stability-based exercises",
          "5 sets of 5 reps with heavy loads to build a strength base quickly",
          "Circuit training with 30-second rest periods and maximal effort",
        ],
        correctAnswer: 1,
        explanation:
          "Phase 1 Stabilization Endurance uses 1-3 sets of 12-20 reps with a slow, controlled tempo (typically 4/2/1) and low loads. Exercises should incorporate unstable but controllable environments (stability ball, single-leg variations) to improve neuromuscular efficiency, joint stability, and muscular endurance. This builds the foundation Marcus needs before heavier training.",
        category: "programming",
      },
      {
        question:
          "What cardiorespiratory training recommendation is most appropriate for Marcus?",
        options: [
          "High-intensity interval training (HIIT) 5 days per week",
          "Zone 1 cardio (65-75% HRmax) for 20-30 minutes, 2-3 days per week, progressing duration before intensity",
          "No cardio until he has completed 8 weeks of resistance training",
          "60 minutes of vigorous cycling daily to maximize calorie burn",
        ],
        correctAnswer: 1,
        explanation:
          "For a deconditioned client, NASM recommends starting with Stage I cardiorespiratory training: moderate-intensity, steady-state cardio in Zone 1 (65-75% HRmax) for 20-30 minutes, 2-3 times per week. Duration should be increased before intensity. This builds an aerobic base, is sustainable, and reduces injury risk. HIIT and vigorous daily exercise are inappropriate for someone with no recent exercise history.",
        category: "programming",
      },
    ],
    relatedChapters: [6, 7, 8, 9, 13, 14],
  },

  // 2. Older Adult
  {
    id: 2,
    title: "Active Aging: The Retired Teacher",
    difficulty: "intermediate",
    client: {
      name: "Dorothy Williams",
      age: 68,
      gender: "Female",
      occupation: "Retired elementary school teacher",
      goals:
        "Improve balance to prevent falls, maintain independence, increase bone density",
      history:
        "Walks 3x/week for 20 min. Mild osteoarthritis in right knee. Osteopenia diagnosis. Takes calcium and vitamin D. No prior resistance training. Physician cleared with recommendation for weight-bearing exercise.",
      assessmentFindings:
        "Overhead squat: slight forward lean, mild knee valgus on right side. Single-leg balance: can hold 8 seconds left, 5 seconds right. Gait assessment shows reduced stride length. Mild thoracic kyphosis observed.",
    },
    steps: [
      {
        question:
          "Which assessment finding should be given the highest priority when designing Dorothy's program?",
        options: [
          "The mild thoracic kyphosis",
          "The single-leg balance deficit, especially on the right side",
          "The reduced stride length in her gait",
          "The slight forward lean in overhead squat",
        ],
        correctAnswer: 1,
        explanation:
          "The single-leg balance deficit is the highest priority because fall prevention is Dorothy's primary goal and falls are the leading cause of injury in older adults. The right-side deficit (5 seconds vs. 8 seconds) also correlates with her right knee osteoarthritis, suggesting weakness or instability on that side. Improving balance directly addresses her safety and functional independence.",
        category: "assessment",
      },
      {
        question:
          "Which OPT phase is most appropriate for Dorothy to begin in?",
        options: [
          "Phase 1: Stabilization Endurance",
          "Phase 2: Strength Endurance",
          "Phase 4: Maximal Strength",
          "A modified Phase 3 focusing on bone density",
        ],
        correctAnswer: 0,
        explanation:
          "Dorothy should begin in Phase 1 (Stabilization Endurance). As an older adult with no resistance training background, balance deficits, and joint issues, she needs to develop stabilization, improve neuromuscular control, and build connective tissue strength. NASM recommends that older adults and beginners always start in Phase 1, with particular attention to balance and proprioception training.",
        category: "phase-selection",
      },
      {
        question:
          "What flexibility approach is best for Dorothy?",
        options: [
          "Aggressive static stretching to restore full range of motion as quickly as possible",
          "SMR with gentle pressure followed by active-isolated stretching, avoiding hyperextension of the right knee",
          "Only dynamic stretching before each workout, no static stretching",
          "PNF stretching with a partner to achieve maximum flexibility gains",
        ],
        correctAnswer: 1,
        explanation:
          "SMR with gentle pressure and active-isolated stretching are appropriate for Dorothy. SMR should use lighter pressure (a softer foam roller or tennis ball) due to her age and osteopenia. Active-isolated stretching gently improves range of motion without the prolonged holds that may aggravate her arthritis. Hyperextension of her right knee must be avoided due to osteoarthritis. PNF stretching may be too aggressive for an untrained older adult.",
        category: "exercise-selection",
      },
      {
        question:
          "Which core exercise would you prescribe for Dorothy?",
        options: [
          "Plank hold on the floor for maximum duration",
          "Standing cable rotation with light resistance",
          "Floor bridge progressing to quadruped arm/opposite leg raise (bird-dog)",
          "Weighted sit-ups to build abdominal strength",
        ],
        correctAnswer: 2,
        explanation:
          "Floor bridge progressing to bird-dog is excellent for Dorothy. These exercises activate the core stabilizers (transverse abdominis, multifidus) in safe positions that do not stress the knee or spine. The bird-dog also challenges balance and coordination in a controlled environment. These are Phase 1 appropriate and can be progressed gradually. Weighted sit-ups place excessive stress on the spine and are contraindicated.",
        category: "exercise-selection",
      },
      {
        question:
          "Which resistance training approach is most appropriate for Dorothy?",
        options: [
          "Machine-based circuit at 70% 1RM to build bone density quickly",
          "1-2 sets of 12-20 reps using body weight and light resistance with balance challenges (e.g., single-leg stands, stability ball)",
          "3 sets of 6-8 reps with free weights to maximize strength gains",
          "High-repetition resistance bands only, avoiding all free weights",
        ],
        correctAnswer: 1,
        explanation:
          "Phase 1 training for older adults should use 1-2 sets of 12-20 reps with body weight or light resistance, incorporating proprioceptive challenges like single-leg stands or unstable surfaces. This improves neuromuscular control, builds connective tissue strength, and addresses her balance goals. Heavy loads (6-8 reps) are inappropriate at this stage, and machines alone miss the balance component she needs.",
        category: "programming",
      },
      {
        question:
          "What cardiorespiratory recommendation is most appropriate for Dorothy?",
        options: [
          "Continue walking 3x/week but increase to 30 minutes; add light aquatic exercise for joint-friendly cardio",
          "Replace walking with high-intensity interval running to improve bone density",
          "Reduce to 2x/week walking to allow more recovery time",
          "Stationary bike only, as walking may be too stressful for her knee",
        ],
        correctAnswer: 0,
        explanation:
          "Building on Dorothy's existing walking habit by gradually increasing duration is appropriate and sustainable. Adding aquatic exercise provides cardiovascular benefit with reduced joint stress, which is ideal for her osteoarthritis. Walking is weight-bearing (good for osteopenia), and aquatic exercise maintains fitness on recovery days. HIIT running is inappropriate given her age, joint condition, and training status.",
        category: "programming",
      },
    ],
    relatedChapters: [6, 7, 9, 10, 14, 19],
  },

  // 3. Athlete Returning from Injury
  {
    id: 3,
    title: "Back in the Game: ACL Recovery",
    difficulty: "advanced",
    client: {
      name: "Jasmine Torres",
      age: 22,
      gender: "Female",
      occupation: "College soccer player",
      goals:
        "Return to competitive soccer after ACL reconstruction (8 months post-surgery), rebuild strength and agility",
      history:
        "Left ACL reconstruction 8 months ago. Completed physical therapy and cleared for full activity by orthopedic surgeon. Was previously training 5 days/week. Currently deconditioned from extended recovery period. No other medical conditions.",
      assessmentFindings:
        "Overhead squat: left knee slight valgus, compensatory weight shift to right leg. Single-leg squat on left: moderate valgus, trunk lateral flexion. Left quadriceps visibly smaller than right. Left hip abductors test weak compared to right side.",
    },
    steps: [
      {
        question:
          "Which assessment finding is most critical for Jasmine's safe return to sport?",
        options: [
          "The visible quadriceps asymmetry",
          "Left knee valgus and compensatory weight shift during single-leg squat",
          "General deconditioning from the recovery period",
          "The trunk lateral flexion observed during single-leg squat",
        ],
        correctAnswer: 1,
        explanation:
          "The left knee valgus with compensatory weight shift during the single-leg squat is most critical because it indicates that the dynamic stabilizers of the knee (VMO, hip abductors, gluteus medius) are not adequately controlling knee position during functional movement. This is the exact mechanism that increases ACL re-injury risk. Soccer demands single-leg stability during cutting, kicking, and landing, making this the top priority.",
        category: "assessment",
      },
      {
        question:
          "Where should Jasmine start in the OPT model given her post-rehab status?",
        options: [
          "Phase 3: Muscular Development, since she was previously trained",
          "Phase 5: Power, to prepare for sport demands",
          "Phase 1: Stabilization Endurance, to rebuild neuromuscular control",
          "Phase 2: Strength Endurance, as a compromise between rehab and performance",
        ],
        correctAnswer: 2,
        explanation:
          "Despite being a trained athlete, Jasmine should start in Phase 1 (Stabilization Endurance). Post-rehab clients must rebuild neuromuscular control, proprioception, and stabilization before progressing to higher-intensity phases. Her assessment clearly shows ongoing stabilization deficits (knee valgus, weight shift, hip weakness). Skipping Phase 1 increases re-injury risk. She can progress more quickly through phases than a true beginner, but must start with stabilization.",
        category: "phase-selection",
      },
      {
        question:
          "What flexibility protocol should be prioritized for Jasmine?",
        options: [
          "Aggressive static stretching of the left hamstring to protect the ACL graft",
          "SMR for bilateral IT band, adductors, and calves; static stretching for these muscles; focus on left side",
          "Dynamic stretching only, as static stretching will reduce power output",
          "No flexibility work until she has regained full quad strength bilaterally",
        ],
        correctAnswer: 1,
        explanation:
          "SMR and static stretching of overactive muscles (IT band, adductors, calves) are appropriate for corrective flexibility in Phase 1. The knee valgus pattern indicates overactivity in the adductors and lateral structures. By releasing these overactive muscles, the underactive muscles (VMO, gluteus medius) can function more effectively. The left side needs extra attention given the surgery, but bilateral work prevents further compensation patterns.",
        category: "exercise-selection",
      },
      {
        question:
          "Which core exercise is most appropriate for Jasmine at this stage?",
        options: [
          "Heavy barbell back squat with core bracing",
          "Ball bridge with drawing-in maneuver progressing to single-leg ball bridge",
          "Hanging leg raises for hip flexor and core strength",
          "Medicine ball rotational throws for sport-specific power",
        ],
        correctAnswer: 1,
        explanation:
          "The ball bridge with drawing-in maneuver, progressing to single-leg variations, is ideal. It activates the core stabilization system while also training the glutes and hip stabilizers that are critical for her knee valgus correction. The single-leg progression specifically addresses her left-side deficit. This is a Phase 1 core exercise that directly supports her rehabilitation goals. Rotational throws and heavy squats are Phase 5 and Phase 3-4 exercises, respectively.",
        category: "exercise-selection",
      },
      {
        question:
          "What resistance training approach should Jasmine follow initially?",
        options: [
          "1-3 sets of 12-20 reps with controlled tempo emphasizing single-leg and stabilization exercises for the left side",
          "3 sets of 8 reps with bilateral compound movements at moderate-heavy loads",
          "Sport-specific agility drills and plyometrics at full intensity",
          "Isolation exercises only (leg extensions, leg curls) to rebuild quad and hamstring size",
        ],
        correctAnswer: 0,
        explanation:
          "Phase 1 parameters (1-3 sets, 12-20 reps, slow controlled tempo) with emphasis on single-leg exercises address Jasmine's bilateral asymmetry and stabilization deficits. Single-leg exercises force the left side to work independently, preventing the right leg from compensating. Stability-focused movements rebuild proprioception lost during recovery. She should progress to Phase 2 (strength endurance supersets) once stabilization is adequate.",
        category: "programming",
      },
      {
        question:
          "What cardiorespiratory training would you recommend for Jasmine?",
        options: [
          "Immediate return to full soccer training for sport-specific conditioning",
          "Stage I training (Zone 1) progressing to Stage II intervals over 4-6 weeks; use low-impact modalities initially (bike, pool)",
          "No cardio for the first 4 weeks, focusing exclusively on strength",
          "High-intensity intervals from day one to regain competition fitness quickly",
        ],
        correctAnswer: 1,
        explanation:
          "Starting with Stage I (steady-state, Zone 1) and progressing to Stage II intervals over 4-6 weeks allows Jasmine to rebuild her cardiovascular base safely. Low-impact modalities (bike, pool running) reduce stress on the reconstructed knee while building fitness. She can progress to running and sport-specific drills as conditioning improves and her movement quality confirms readiness. Rushing into high-intensity work or full sport risks re-injury.",
        category: "programming",
      },
    ],
    relatedChapters: [6, 7, 9, 10, 13, 14, 19],
  },

  // 4. Overweight Beginner
  {
    id: 4,
    title: "Fresh Start: Weight Loss Journey",
    difficulty: "beginner",
    client: {
      name: "David Robinson",
      age: 42,
      gender: "Male",
      occupation: "Delivery truck driver",
      goals:
        "Lose 50 lbs, lower cholesterol, improve overall fitness to keep up with his kids",
      history:
        "BMI 36 (obese classification). Elevated total cholesterol (240 mg/dL). Pre-diabetic (A1C 5.9%). No exercise history. On no medications. Physician clearance obtained with recommendation to start slow. Former high school football player (20+ years ago).",
      assessmentFindings:
        "Overhead squat: significant forward lean, arms fall forward, excessive knee valgus bilaterally, feet turn out. Low back rounds at bottom of squat. Cannot perform single-leg squat. Resting HR 88 bpm. Blood pressure 138/88.",
    },
    steps: [
      {
        question:
          "Which assessment finding should MOST influence David's initial program design?",
        options: [
          "His inability to perform a single-leg squat",
          "The multiple compensation patterns in the overhead squat indicating systemic muscle imbalances",
          "His resting heart rate of 88 bpm",
          "His elevated blood pressure of 138/88",
        ],
        correctAnswer: 1,
        explanation:
          "The multiple overhead squat compensations (forward lean, arms falling, knee valgus, feet turning out, low back rounding) indicate systemic muscle imbalances throughout the kinetic chain. This should most influence program design because it dictates exercise selection, regression needs, and corrective exercise priorities. While the cardiovascular markers (HR, BP) are important for monitoring intensity, the movement assessment directly guides the training program structure.",
        category: "assessment",
      },
      {
        question:
          "Which OPT phase should David begin in?",
        options: [
          "Phase 1: Stabilization Endurance",
          "Phase 2: Strength Endurance, since he has an athletic background",
          "A modified Phase 3 focused on calorie-burning compound movements",
          "Phase 1 but with Phase 2 intensity to accelerate results",
        ],
        correctAnswer: 0,
        explanation:
          "David should start in Phase 1 (Stabilization Endurance). Despite his former athletic background, he has had no exercise for 20+ years, is clinically obese, pre-diabetic, and shows severe movement compensations. Phase 1 builds the foundation he needs: joint stability, muscular endurance, corrective exercise, and neuromuscular control. His health risk factors also mandate a conservative starting point. His past athletic experience was too long ago to justify skipping Phase 1.",
        category: "phase-selection",
      },
      {
        question:
          "What flexibility strategy is most appropriate for David?",
        options: [
          "Corrective flexibility: SMR and static stretching for calves, hip flexors, adductors, latissimus dorsi, and piriformis",
          "Active flexibility using dynamic movements only",
          "No flexibility work; focus entirely on weight loss through cardio",
          "PNF stretching for all major muscle groups to maximize range of motion quickly",
        ],
        correctAnswer: 0,
        explanation:
          "Corrective flexibility (SMR + static stretching of overactive muscles) is the Phase 1 flexibility protocol. David's compensations indicate overactive calves (feet turning out), hip flexors and lats (forward lean), and adductors (knee valgus). These muscles should receive SMR and static stretching to restore length, allowing the underactive muscles (gluteus medius/maximus, core stabilizers, posterior tibialis) to activate properly during exercise.",
        category: "exercise-selection",
      },
      {
        question:
          "Which core exercise is most appropriate for David initially?",
        options: [
          "Prone iso-abs (plank) on the floor for 60 seconds",
          "Drawing-in maneuver with floor bridge, progressing to prone iso-abs on knees",
          "Bicycle crunches to target all abdominal muscles",
          "Cable rotations for functional core training",
        ],
        correctAnswer: 1,
        explanation:
          "Starting with the drawing-in maneuver and floor bridge teaches David to activate his deep core stabilizers (transverse abdominis) which are essential for spine protection. The floor bridge also strengthens his underactive glutes. Progressing to a modified plank (on knees) allows a controlled challenge. A full plank for 60 seconds may be too demanding initially given his body weight and deconditioning. Core training in Phase 1 focuses on stabilization, not movement-based exercises.",
        category: "exercise-selection",
      },
      {
        question:
          "What resistance training approach should David follow?",
        options: [
          "Total body circuit: 1-2 sets of 12-20 reps with body weight and machine-assisted stabilization exercises, controlled tempo",
          "Upper/lower split with moderate loads 4 days per week",
          "High-volume bodybuilding program to build muscle and boost metabolism",
          "Free weight compound lifts (squat, deadlift, bench) at moderate intensity",
        ],
        correctAnswer: 0,
        explanation:
          "A total body circuit using Phase 1 parameters (1-2 sets, 12-20 reps, controlled tempo) with body weight and machine assistance is ideal. Total body circuits are time-efficient and burn more calories than split routines, supporting weight loss. Machine assistance provides stability for exercises David cannot yet perform with proper form using free weights. Body weight exercises (wall sits, assisted squats) allow safe progression while he builds strength and improves movement patterns.",
        category: "programming",
      },
      {
        question:
          "What cardiorespiratory recommendation is most appropriate for David?",
        options: [
          "Running 5 days/week to maximize calorie expenditure",
          "Stage I: low-impact cardio (walking, elliptical, recumbent bike) at 60-70% HRmax for 15-20 minutes, 3x/week, gradually increasing duration",
          "No cardio until he can perform resistance exercises with proper form",
          "High-intensity interval training 3x/week for maximum fat burning",
        ],
        correctAnswer: 1,
        explanation:
          "Stage I cardio with low-impact modalities at moderate intensity is the safest starting point. David's elevated resting HR, blood pressure, body weight, and deconditioning all require a conservative approach. Low-impact options reduce joint stress at his current body weight. Starting at 15-20 minutes and gradually building duration (before intensity) follows NASM progression guidelines. His HR and BP should be monitored during exercise. HIIT is contraindicated for someone with his risk profile.",
        category: "programming",
      },
    ],
    relatedChapters: [6, 7, 8, 9, 14, 16, 19],
  },

  // 5. Pregnant Woman
  {
    id: 5,
    title: "Training Through Pregnancy",
    difficulty: "advanced",
    client: {
      name: "Sarah Kim",
      age: 30,
      gender: "Female",
      occupation: "Marketing manager",
      goals:
        "Maintain fitness during second trimester, prepare body for labor, manage gestational weight gain",
      history:
        "Regular exerciser for 5 years (3x/week strength, 2x/week running). Currently 18 weeks pregnant, uncomplicated pregnancy. OB-GYN has cleared continued exercise with modifications. No diastasis recti. No gestational diabetes or hypertension.",
      assessmentFindings:
        "Overhead squat: slight forward lean (increased from pre-pregnancy baseline), mild lumbar lordosis. Posture: increased anterior pelvic tilt typical of pregnancy. Reports mild round ligament discomfort with sudden movements. Balance slightly decreased from pre-pregnancy baseline.",
    },
    steps: [
      {
        question:
          "Which assessment finding is most important to consider for Sarah's program modifications?",
        options: [
          "The increased anterior pelvic tilt",
          "The mild round ligament discomfort with sudden movements",
          "The slight forward lean increase from baseline",
          "The decreased balance from pre-pregnancy baseline",
        ],
        correctAnswer: 1,
        explanation:
          "The round ligament discomfort with sudden movements is the most important practical finding because it directly dictates exercise modifications: avoiding rapid direction changes, ballistic movements, and exercises with quick transitions. While the postural changes (anterior tilt, forward lean) and balance changes are expected and notable, the round ligament symptom is the clearest signal that specific movements need modification to keep her comfortable and safe.",
        category: "assessment",
      },
      {
        question:
          "Which OPT phase is most appropriate for Sarah at 18 weeks pregnant?",
        options: [
          "Phase 1: Stabilization Endurance, since pregnancy is a special population",
          "Continue her pre-pregnancy Phase 2-3 training with no modifications",
          "Phase 2: Strength Endurance, maintaining intensity with appropriate pregnancy modifications",
          "Phase 4: Maximal Strength, since she was previously trained",
        ],
        correctAnswer: 2,
        explanation:
          "Sarah was a consistent exerciser before pregnancy, so she does not need to regress to Phase 1. NASM guidelines for prenatal clients state that previously active women can maintain their training level with appropriate modifications. Phase 2 (Strength Endurance) allows her to maintain fitness with moderate intensity while incorporating the stability and endurance work that supports pregnancy. Phase 3-4 loads are unnecessary and potentially risky during pregnancy.",
        category: "phase-selection",
      },
      {
        question:
          "What flexibility approach is most appropriate for Sarah during her second trimester?",
        options: [
          "Aggressive stretching to counteract the postural changes of pregnancy",
          "SMR with modified positions (avoiding prone after first trimester) and gentle static stretching; avoid overstretching due to relaxin hormone",
          "Only dynamic warm-up, no static stretching as it may cause joint instability",
          "PNF stretching to maintain her pre-pregnancy flexibility levels",
        ],
        correctAnswer: 1,
        explanation:
          "SMR with modified positions and gentle static stretching is appropriate, with the critical caveat that relaxin hormone increases joint laxity during pregnancy. Overstretching must be avoided because joints are already more mobile than usual, increasing injury risk. Prone positions should be avoided after the first trimester. Gentle stretching for comfort (hip flexors, chest, upper back) is beneficial, but the goal is maintenance, not increasing flexibility. PNF stretching is too aggressive given the relaxin effect.",
        category: "exercise-selection",
      },
      {
        question:
          "Which core exercise is most appropriate for Sarah at 18 weeks?",
        options: [
          "Traditional crunches and sit-ups with reduced range of motion",
          "Standing cable anti-rotation press (Pallof press) and side-lying exercises",
          "Prone planks held for maximum duration",
          "Heavy loaded carries for functional core stability",
        ],
        correctAnswer: 1,
        explanation:
          "Standing cable anti-rotation (Pallof press) and side-lying core exercises are ideal for second-trimester training. Supine exercises (crunches, traditional planks) should be minimized or avoided after the first trimester due to potential vena cava compression. The Pallof press trains anti-rotation core stability in a standing position, which is functional and avoids supine or prone positions. Side-lying exercises are another safe alternative that effectively target core stabilizers without compression concerns.",
        category: "exercise-selection",
      },
      {
        question:
          "What resistance training modifications should Sarah follow?",
        options: [
          "Reduce all weights by 50% and only use machines",
          "Maintain moderate loads (Phase 2: 2-4 sets, 8-12 reps); avoid supine exercises, Valsalva maneuver, and overhead pressing with heavy loads; use seated/standing positions",
          "Stop resistance training and focus only on prenatal yoga",
          "Continue her exact pre-pregnancy program with no changes",
        ],
        correctAnswer: 1,
        explanation:
          "Sarah can maintain moderate resistance training with key modifications: avoid supine positions (vena cava compression), avoid the Valsalva maneuver (increases intra-abdominal pressure), limit heavy overhead pressing (increased lumbar lordosis), and use seated or standing positions. Phase 2 parameters (2-4 sets, 8-12 reps) maintain strength without excessive intensity. She should focus on exercises that support pregnancy demands: squats, rows, hip hinges, and upper back work. Complete cessation of resistance training is not recommended for previously active women.",
        category: "programming",
      },
      {
        question:
          "What cardiorespiratory recommendation is appropriate for Sarah?",
        options: [
          "Maintain running at pre-pregnancy pace and distance",
          "Moderate-intensity cardio (RPE 5-6 out of 10 or talk test) for 20-30 minutes most days; switch from running to lower-impact options as pregnancy progresses",
          "Complete rest from cardio to protect the pregnancy",
          "Swimming only, as it is the only safe cardio during pregnancy",
        ],
        correctAnswer: 1,
        explanation:
          "ACOG and NASM recommend 150 minutes/week of moderate-intensity cardio during uncomplicated pregnancies. Using RPE or the talk test (should be able to maintain conversation) is preferred over heart rate monitoring, as pregnancy alters HR response. Transitioning from running to lower-impact activities (walking, swimming, elliptical, cycling) as the pregnancy progresses accommodates the changing center of gravity, joint laxity, and round ligament discomfort. Complete rest is not recommended for healthy pregnant women who were previously active.",
        category: "programming",
      },
    ],
    relatedChapters: [7, 8, 9, 13, 14, 19],
  },

  // 6. Youth Athlete
  {
    id: 6,
    title: "Rising Star: Youth Basketball Player",
    difficulty: "intermediate",
    client: {
      name: "Tyler Jackson",
      age: 15,
      gender: "Male",
      occupation: "High school sophomore, JV basketball team",
      goals:
        "Improve vertical jump, get faster, reduce ankle sprains (has had 2 in the past year)",
      history:
        "Plays basketball year-round (school team + AAU). No structured resistance training experience. Two right ankle sprains in past 12 months (Grade I). Growing rapidly (grew 3 inches in past year). Parental consent and physician clearance obtained.",
      assessmentFindings:
        "Overhead squat: moderate knee valgus bilaterally, feet flatten and turn out. Single-leg hop test: significant knee valgus on landing, especially right side. Right ankle dorsiflexion limited compared to left. General joint hypermobility. Tanner Stage 3-4 (mid-puberty).",
    },
    steps: [
      {
        question:
          "Which finding is most important to address given Tyler's history of ankle sprains and sport demands?",
        options: [
          "General joint hypermobility",
          "The significant knee valgus on single-leg hop landing, especially right side",
          "Limited right ankle dorsiflexion",
          "The rapid growth (3 inches in past year)",
        ],
        correctAnswer: 1,
        explanation:
          "The knee valgus on single-leg hop landing is most critical because it reveals poor dynamic neuromuscular control during the exact movement pattern (landing, cutting) that caused his ankle sprains and increases risk for future ankle and knee injuries. While limited dorsiflexion contributes to this pattern and should be addressed, the landing mechanics are the functional outcome that directly relates to his injury history and basketball performance (jumping/landing).",
        category: "assessment",
      },
      {
        question:
          "Which OPT phase should Tyler begin in?",
        options: [
          "Phase 5: Power, since he wants to improve his vertical jump",
          "Phase 1: Stabilization Endurance",
          "Phase 4: Maximal Strength, to build a strength base for jumping",
          "Phase 11: Plyometric, focused entirely on jump training",
        ],
        correctAnswer: 1,
        explanation:
          "Tyler should start in Phase 1 (Stabilization Endurance). Despite being young and active, he has no resistance training background and shows significant movement dysfunction (knee valgus, poor landing mechanics). Youth athletes especially need proper movement foundations before progressing to power and plyometric training. Phase 1 builds the neuromuscular control and joint stability he needs to eventually train for power safely. Jumping straight to plyometrics with his current movement quality would increase injury risk.",
        category: "phase-selection",
      },
      {
        question:
          "What flexibility approach is best for Tyler?",
        options: [
          "Extensive static stretching to address his hypermobility",
          "SMR for calves and IT band; active-isolated and dynamic stretching for hip flexors, calves (especially right); avoid excessive static stretching due to hypermobility",
          "No flexibility training needed since he is already hypermobile",
          "PNF stretching for all lower body muscles before basketball practice",
        ],
        correctAnswer: 1,
        explanation:
          "SMR for overactive structures (calves, IT band) combined with active-isolated and dynamic stretching is appropriate. The key consideration is Tyler's hypermobility: excessive static stretching would make already-lax joints less stable, increasing injury risk. His right ankle dorsiflexion limitation likely stems from scar tissue or muscular tightness (from repeat sprains), not joint restriction, so targeted SMR and active mobility for that area is warranted. Dynamic stretching prepares him for activity without compromising joint stability.",
        category: "exercise-selection",
      },
      {
        question:
          "Which core exercise is most appropriate for Tyler?",
        options: [
          "Weighted Russian twists for rotational power",
          "Heavy barbell deadlifts for posterior chain development",
          "Prone plank with hip extension (alternating legs) progressing to ball plank",
          "Ab wheel rollouts for advanced core strength",
        ],
        correctAnswer: 2,
        explanation:
          "The prone plank with hip extension progressing to a ball plank is appropriate Phase 1 core training for Tyler. It builds anti-extension stability, activates the glutes (addressing his knee valgus tendency), and can be progressed with instability. For a youth athlete with no resistance training background, Phase 1 core exercises should emphasize stabilization over movement. This exercise also teaches hip-core dissociation, which is important for basketball movements.",
        category: "exercise-selection",
      },
      {
        question:
          "What resistance training approach should Tyler follow?",
        options: [
          "Adult bodybuilding program modified with lighter weights",
          "Phase 1 stabilization exercises (1-3 sets, 12-20 reps, controlled tempo) emphasizing body weight and single-leg/balance exercises with focus on proper landing mechanics",
          "Olympic lift variations to develop power for jumping",
          "Machine-only program since he is still growing",
        ],
        correctAnswer: 1,
        explanation:
          "Phase 1 parameters with body weight and balance-focused exercises are ideal for Tyler. Single-leg exercises directly address his bilateral valgus and right-side weakness. Controlled tempo teaches proper movement mechanics. Landing drills at low intensity (step-downs, box drops to stabilize) begin addressing his sport-specific needs. Youth athletes benefit greatly from body weight mastery before external loading. Machine-only training misses the proprioceptive and stabilization benefits he specifically needs.",
        category: "programming",
      },
    ],
    relatedChapters: [6, 7, 9, 10, 11, 14, 19],
  },

  // 7. Person with Hypertension
  {
    id: 7,
    title: "Heart Health: Managing Hypertension",
    difficulty: "intermediate",
    client: {
      name: "Robert Martinez",
      age: 55,
      gender: "Male",
      occupation: "Bank branch manager",
      goals:
        "Lower blood pressure, reduce medication dependence, improve overall cardiovascular health, lose 15 lbs",
      history:
        "Diagnosed with Stage 1 hypertension 2 years ago. Currently on ACE inhibitor medication. Resting BP with medication: 134/86. BMI 28. Walks occasionally. No other medical conditions. Non-smoker. Moderate alcohol use (2-3 drinks/week). Physician strongly encourages exercise program.",
      assessmentFindings:
        "Overhead squat: mild forward lean, arms fall slightly forward. Posture: mild upper crossed syndrome (rounded shoulders, forward head). Resting HR 78 bpm. Push-up test: 12 reps (below average for age). Body fat estimated at 28%.",
    },
    steps: [
      {
        question:
          "Which consideration should MOST influence Robert's program design?",
        options: [
          "His upper crossed syndrome posture",
          "His Stage 1 hypertension and need to avoid exercises that excessively raise blood pressure",
          "His below-average push-up score",
          "His body fat percentage of 28%",
        ],
        correctAnswer: 1,
        explanation:
          "Robert's hypertension is the primary consideration because it directly affects exercise safety, intensity selection, and programming decisions. While his posture and fitness level matter, hypertension requires specific modifications: avoiding the Valsalva maneuver, monitoring blood pressure response to exercise, limiting isometric holds, ensuring proper breathing, and following cardiovascular guidelines for hypertensive clients. His medication (ACE inhibitor) may also affect exercise response.",
        category: "assessment",
      },
      {
        question:
          "Which OPT phase should Robert start in?",
        options: [
          "Phase 1: Stabilization Endurance",
          "Phase 2: Strength Endurance, since he has some walking experience",
          "Phase 3: Hypertrophy, to build muscle and boost metabolism",
          "A cardio-only program until his blood pressure normalizes",
        ],
        correctAnswer: 0,
        explanation:
          "Phase 1 (Stabilization Endurance) is appropriate for Robert. As a mostly sedentary client with hypertension and movement compensations, he needs to start conservatively. Phase 1 uses lower loads and higher repetitions, which creates less acute blood pressure elevation than higher-intensity phases. The controlled tempos promote continuous breathing (preventing Valsalva). A cardio-only approach misses the proven benefits of resistance training for blood pressure management.",
        category: "phase-selection",
      },
      {
        question:
          "What flexibility exercises should Robert prioritize?",
        options: [
          "SMR and static stretching for chest (pectorals), upper trapezius, levator scapulae, and latissimus dorsi to address upper crossed syndrome",
          "Lower body stretching only, focusing on hip flexors and hamstrings",
          "No stretching, as it may lower blood pressure too much",
          "Aggressive PNF stretching to maximize flexibility gains quickly",
        ],
        correctAnswer: 0,
        explanation:
          "Robert's upper crossed syndrome indicates overactive pectorals, upper trapezius, levator scapulae, and latissimus dorsi with underactive deep cervical flexors, lower trapezius, and rhomboids. SMR and static stretching of these overactive muscles is the Phase 1 corrective flexibility approach. This directly addresses his postural dysfunction. Stretching does not dangerously lower blood pressure, and gentle flexibility work can actually help with relaxation and stress management.",
        category: "exercise-selection",
      },
      {
        question:
          "Which core exercise is most appropriate for Robert?",
        options: [
          "Prone iso-abs (plank) held for maximum duration with breath holding for stability",
          "Floor bridge and drawing-in maneuver with continuous breathing emphasis",
          "Heavy loaded carries for functional core strength",
          "Medicine ball slams for cardiovascular conditioning",
        ],
        correctAnswer: 1,
        explanation:
          "Floor bridge with drawing-in maneuver and continuous breathing emphasis is ideal for Robert. The emphasis on breathing technique is critical for a hypertensive client: breath holding (Valsalva) can cause dangerous blood pressure spikes. Floor bridge is a low-intensity core exercise that teaches proper activation without requiring breath holding. The drawing-in maneuver trains the deep stabilizers at low intensity. Medicine ball slams and heavy carries create excessive blood pressure elevation.",
        category: "exercise-selection",
      },
      {
        question:
          "What resistance training guidelines should Robert follow?",
        options: [
          "Heavy loads (3-5 reps) to build maximal strength efficiently",
          "1-3 sets of 12-20 reps at low-moderate intensity; circuit format; emphasize continuous breathing; avoid isometric holds longer than 5 seconds; no Valsalva maneuver",
          "Machine-only training with maximal effort on each set",
          "Resistance bands only to minimize blood pressure response",
        ],
        correctAnswer: 1,
        explanation:
          "NASM guidelines for hypertensive clients emphasize moderate-intensity resistance training (Phase 1 parameters) with specific modifications: avoid Valsalva maneuver, limit prolonged isometric holds, ensure continuous breathing, and use circuit format (which provides cardiovascular benefit with lower peak blood pressure than traditional sets). Heavy loads and maximal effort create dangerous BP spikes in hypertensive clients. Both free weights and machines can be used with proper technique and breathing.",
        category: "programming",
      },
      {
        question:
          "What cardiorespiratory training is most appropriate for Robert?",
        options: [
          "HIIT training 4x/week for maximum cardiovascular benefit",
          "Moderate-intensity steady-state cardio (40-65% VO2R) for 30-60 minutes on most days of the week; emphasize gradual warm-up and cool-down",
          "Vigorous-intensity cardio 3x/week for 20 minutes",
          "Low-intensity walking only, 10 minutes 2x/week",
        ],
        correctAnswer: 1,
        explanation:
          "ACSM and NASM recommend moderate-intensity aerobic exercise (40-65% VO2 reserve) on most days of the week for hypertensive clients, accumulating 30-60 minutes per session. Extended warm-up and cool-down periods are important because blood pressure medication may affect heart rate and blood pressure response to exercise transitions. Moderate-intensity steady-state cardio has the strongest evidence for blood pressure reduction. HIIT may cause excessive BP spikes in hypertensive individuals.",
        category: "programming",
      },
    ],
    relatedChapters: [3, 6, 7, 8, 9, 14, 19],
  },

  // 8. Experienced Lifter with Imbalances
  {
    id: 8,
    title: "The Imbalanced Powerlifter",
    difficulty: "advanced",
    client: {
      name: "Jake Wilson",
      age: 28,
      gender: "Male",
      occupation: "Firefighter",
      goals:
        "Fix chronic right shoulder pain, correct movement imbalances, maintain strength while addressing dysfunction",
      history:
        "5 years of self-programmed powerlifting (bench, squat, deadlift). Right shoulder pain during overhead pressing for 6 months, worsening. Bench press: 285 lbs, squat: 385 lbs, deadlift: 455 lbs. No formal assessment or corrective exercise history. Physician ruled out labral tear via MRI; diagnosed with shoulder impingement secondary to muscular imbalance.",
      assessmentFindings:
        "Overhead squat: arms fall forward significantly, low back arches excessively. Pushing assessment: right shoulder elevates during pressing. Pulling assessment: right scapula wings. Significant bilateral strength: right pec major, upper traps, and anterior deltoids. Weak: lower traps, rhomboids, rotator cuff (especially right infraspinatus/teres minor), deep cervical flexors. Right shoulder internal rotation 85 degrees, external rotation 40 degrees (left: 75/60).",
    },
    steps: [
      {
        question:
          "Which assessment finding most directly explains Jake's right shoulder impingement?",
        options: [
          "His excessive low back arch during overhead squat",
          "The right scapula winging during pulling movements combined with limited right shoulder external rotation",
          "His heavy bench press numbers (285 lbs)",
          "The arms falling forward during overhead squat",
        ],
        correctAnswer: 1,
        explanation:
          "The right scapula winging (indicating weak lower trapezius/serratus anterior) combined with limited external rotation (indicating tight internal rotators and weak external rotators) directly explains the impingement mechanism. When the scapula does not properly upwardly rotate and posteriorly tilt during overhead movement (due to weak stabilizers), and the humeral head cannot externally rotate adequately, the supraspinatus tendon gets compressed in the subacromial space. This is classic shoulder impingement from the muscle imbalance pattern common in bench-press dominant lifters.",
        category: "assessment",
      },
      {
        question:
          "Where should Jake start in the OPT model despite his training experience?",
        options: [
          "Phase 4: Maximal Strength, maintaining his current training with corrective exercise added",
          "Phase 1: Stabilization Endurance, fully replacing his current program",
          "Phase 2: Strength Endurance, incorporating corrective exercise with moderate strength work",
          "Continue his current powerlifting program with shoulder prehab exercises added",
        ],
        correctAnswer: 2,
        explanation:
          "Phase 2 (Strength Endurance) is the best starting point for Jake. While he clearly needs corrective work, fully regressing an experienced lifter to Phase 1 is unnecessary and reduces compliance. Phase 2 allows him to maintain meaningful training loads through strength-endurance supersets while addressing imbalances. He should pair a strength exercise with a stabilization exercise (e.g., bench press followed by stability ball push-up). His shoulder-specific corrective exercises should be performed as part of every warm-up.",
        category: "phase-selection",
      },
      {
        question:
          "What flexibility protocol should be the priority for Jake's shoulder?",
        options: [
          "Static stretching of the rotator cuff before every training session",
          "SMR for pec major/minor, lats, and upper traps; static stretching for these muscles; prioritize right side",
          "Dynamic stretching only to maintain mobility without compromising strength",
          "No stretching of the shoulder area until the pain completely resolves",
        ],
        correctAnswer: 1,
        explanation:
          "SMR and static stretching of the overactive muscles (pec major/minor, latissimus dorsi, upper trapezius) is the corrective approach. These muscles are pulling Jake's shoulder into internal rotation and anterior tilt, creating the impingement. Releasing them allows the underactive posterior muscles (lower traps, infraspinatus, teres minor) to work effectively. The right side needs extra attention given the asymmetry. Stretching the already-weak rotator cuff would worsen the imbalance.",
        category: "exercise-selection",
      },
      {
        question:
          "Which core exercise best addresses Jake's needs?",
        options: [
          "Heavy barbell good mornings for posterior chain",
          "Cable chop/lift patterns emphasizing thoracic rotation and anti-extension",
          "Weighted decline sit-ups for abdominal hypertrophy",
          "Plank with heavy plate on back for progressive overload",
        ],
        correctAnswer: 1,
        explanation:
          "Cable chop/lift patterns address Jake's specific needs: they train anti-extension (his low back arches excessively), develop rotational control needed for his firefighting duties, and involve the scapular stabilizers through arm position. These exercises promote thoracic spine mobility while training lumbar stability, helping correct his compensatory pattern of extending through the lumbar spine instead of the thoracic spine during overhead movements.",
        category: "exercise-selection",
      },
      {
        question:
          "How should Jake's resistance training be restructured?",
        options: [
          "Phase 2 supersets pairing compound lifts with corrective/stabilization exercises (e.g., bench press + prone Y-T-W raises); reduce pressing volume; increase pulling volume 2:1 over pressing",
          "Eliminate all pressing exercises until shoulder pain resolves",
          "Continue his powerlifting program but add rotator cuff exercises at the end",
          "Switch entirely to machines to protect the shoulder",
        ],
        correctAnswer: 0,
        explanation:
          "Phase 2 supersets are ideal: they maintain training stimulus while building in corrective work. Pairing each strength exercise with a stabilization exercise (bench press + prone Y-T-W) addresses imbalances within the workout. Reducing pressing volume and increasing pulling ratio to 2:1 (or more) corrects the anterior-dominant pattern that created the impingement. Jake does not need to eliminate pressing entirely, but volume should be rebalanced. Adding corrective exercises at the end of a heavy session (option C) is far less effective than integrating them throughout.",
        category: "programming",
      },
      {
        question:
          "What cardiorespiratory recommendation is appropriate for Jake?",
        options: [
          "No cardio; it will interfere with his strength goals",
          "Stage II-III interval training 2-3x/week (rowing machine or assault bike) to support firefighting demands and cardiovascular health without impacting shoulder recovery",
          "Long-distance running 5x/week for general conditioning",
          "Swimming laps for cardio since it is easy on the shoulders",
        ],
        correctAnswer: 1,
        explanation:
          "Stage II-III interval training with appropriate modalities supports Jake's occupational demands as a firefighter, which require both aerobic and anaerobic fitness. The rowing machine strengthens the posterior chain and scapular muscles (supporting his corrective goals) while providing cardio. The assault bike is another non-overhead option. Swimming could aggravate his shoulder impingement depending on stroke selection. Running 5x/week is excessive volume that does not align with his goals.",
        category: "programming",
      },
    ],
    relatedChapters: [5, 6, 7, 9, 13, 14],
  },

  // 9. Post-Rehab Client
  {
    id: 9,
    title: "Post-Rehab: Rebuilding After Back Surgery",
    difficulty: "advanced",
    client: {
      name: "Linda Patel",
      age: 48,
      gender: "Female",
      occupation: "Registered nurse, 12-hour shifts on feet",
      goals:
        "Strengthen core to prevent future back issues, return to full work capacity, improve overall fitness",
      history:
        "L4-L5 microdiscectomy 4 months ago for herniated disc. Completed 12 weeks of physical therapy. Discharged from PT with clearance for general fitness training. Pre-injury, walked regularly but no structured exercise. Occupation requires lifting, bending, prolonged standing. Currently modified duty (no lifting over 20 lbs at work).",
      assessmentFindings:
        "Overhead squat: moderate forward lean, cannot reach full depth (stops at parallel). Slight Trendelenburg sign on left side during single-leg stance. Core endurance testing: below average on all planes. Hip hinge assessment: rounds lumbar spine at end range. Reports stiffness but no pain.",
    },
    steps: [
      {
        question:
          "Which finding is most critical to address for Linda's occupational needs and injury prevention?",
        options: [
          "The inability to reach full squat depth",
          "The lumbar spine rounding during hip hinge at end range",
          "The Trendelenburg sign on left side",
          "The below-average core endurance scores",
        ],
        correctAnswer: 1,
        explanation:
          "The lumbar spine rounding during hip hinge at end range is the most critical finding because it directly relates to her injury mechanism (disc herniation) and occupational demands (lifting and bending as a nurse). Lumbar flexion under load is the primary risk factor for re-herniation. If she cannot maintain a neutral spine during a hip hinge, she is at high risk when lifting patients, bending to reach equipment, or performing any work-related movement that involves forward bending. This must be corrected before increasing training loads.",
        category: "assessment",
      },
      {
        question:
          "Which OPT phase should Linda begin in?",
        options: [
          "Phase 1: Stabilization Endurance with emphasis on core and lumbar spine stability",
          "Phase 2: Strength Endurance, since she completed physical therapy",
          "A combination of Phases 1 and 2",
          "Phase 3: Hypertrophy, to build the muscle she lost during recovery",
        ],
        correctAnswer: 0,
        explanation:
          "Phase 1 (Stabilization Endurance) with core and lumbar stability emphasis is essential. Although Linda completed PT, she is transitioning from rehabilitation to fitness, and her assessment shows ongoing stabilization deficits (lumbar rounding, Trendelenburg, below-average core endurance). Phase 1 builds the neuromuscular control and core stability she needs before adding external resistance. The focus should be on training proper movement patterns, especially the hip hinge, in a controlled environment before progressing.",
        category: "phase-selection",
      },
      {
        question:
          "What flexibility approach is appropriate for Linda?",
        options: [
          "Aggressive hamstring stretching to improve squat depth and hip hinge",
          "SMR for hip flexors, piriformis, and thoracic spine; gentle static stretching for hip flexors and calves; avoid forced lumbar flexion stretches",
          "Full-body PNF stretching to restore pre-surgery range of motion",
          "No flexibility work to protect the surgical site",
        ],
        correctAnswer: 1,
        explanation:
          "SMR and targeted static stretching of overactive muscles (hip flexors, piriformis) is appropriate, with thoracic spine SMR to improve upper back mobility (reducing demand on the lumbar spine). Critically, forced lumbar flexion stretches must be avoided to protect the L4-L5 disc. Aggressive hamstring stretching can also pull the pelvis into posterior tilt, stressing the lumbar spine. Gentle, progressive flexibility work that respects her surgical history is the correct approach.",
        category: "exercise-selection",
      },
      {
        question:
          "Which core exercise is most appropriate for Linda initially?",
        options: [
          "Sit-ups to rebuild abdominal strength",
          "Drawing-in maneuver and bracing in supine, progressing to quadruped and then standing; emphasis on neutral spine awareness",
          "Hanging leg raises for lower abdominal activation",
          "Heavy plank holds to rebuild core endurance quickly",
        ],
        correctAnswer: 1,
        explanation:
          "Progressing from supine drawing-in maneuver and bracing through quadruped to standing teaches Linda to activate and maintain her deep core stabilizers in progressively challenging positions. Neutral spine awareness is paramount: she must learn to find, feel, and maintain a neutral lumbar position during all movements. Sit-ups involve lumbar flexion (contraindicated post-discectomy). Heavy planks may be too demanding initially and could compromise form. The progression from simple to complex positions mirrors her PT foundation.",
        category: "exercise-selection",
      },
      {
        question:
          "What resistance training approach should Linda follow?",
        options: [
          "Phase 1: 1-3 sets of 12-20 reps focusing on hip hinge pattern training (deadlift progressions with dowel), single-leg stability, and functional movements that mimic work demands; all with controlled tempo and neutral spine emphasis",
          "3 sets of 10 reps on weight machines to avoid spinal loading",
          "Body weight only for 6 months before adding any resistance",
          "A standard full-body strength program with back extensions to strengthen the erectors",
        ],
        correctAnswer: 0,
        explanation:
          "Phase 1 parameters with specific focus on hip hinge pattern retraining is ideal. Using a dowel along the spine during deadlift progressions teaches neutral spine awareness during the exact movement she struggles with. Single-leg stability addresses the Trendelenburg sign. Functional movement patterns that mimic nursing tasks (lifting, carrying, bending) prepare her for return to full duty. The controlled tempo builds proper motor patterns. Back extensions can be appropriate later but are risky initially post-discectomy.",
        category: "programming",
      },
      {
        question:
          "What cardiorespiratory recommendation is most appropriate for Linda?",
        options: [
          "Running program to build endurance for her 12-hour nursing shifts",
          "Walking program progressing from 15 to 30+ minutes at moderate intensity; add low-impact options (elliptical, stationary bike with upright posture) as tolerated; avoid prolonged seated positions",
          "No cardio until she can deadlift body weight with proper form",
          "Swimming to minimize spinal loading during cardio",
        ],
        correctAnswer: 1,
        explanation:
          "A progressive walking program is ideal because walking is functional (matches her occupational demands), low-impact, and allows gradual conditioning. Adding the elliptical and upright stationary bike provides variety while maintaining spinal-neutral positions. Prolonged seated positions (like a recumbent bike) may increase disc pressure and should be avoided initially. Swimming is generally safe but the repetitive flexion/rotation of some strokes may not be appropriate this early post-surgery. Running creates too much impact for a 4-month post-surgical client.",
        category: "programming",
      },
    ],
    relatedChapters: [6, 7, 9, 13, 14, 15, 19],
  },

  // 10. Sport-Specific Training
  {
    id: 10,
    title: "Race Day Ready: Marathon Preparation",
    difficulty: "intermediate",
    client: {
      name: "Aisha Thompson",
      age: 35,
      gender: "Female",
      occupation: "Elementary school teacher",
      goals:
        "Complete first marathon in 5 months, prevent running injuries, improve running economy",
      history:
        "Running consistently for 2 years. Completed two half-marathons (best time 2:05). Currently running 25 miles/week. No injuries but reports mild IT band tightness on long runs. No medical conditions. BMI 22. Joined gym 3 months ago but unsure how to strength train for running.",
      assessmentFindings:
        "Overhead squat: mild knee valgus at bottom of squat, feet flatten slightly. Single-leg squat: moderate hip drop (Trendelenburg) bilaterally, more pronounced on left. Hip abduction strength testing: weak bilaterally. Ankle dorsiflexion: mildly limited bilaterally. Good cardiovascular fitness (resting HR 58 bpm).",
    },
    steps: [
      {
        question:
          "Which assessment finding is most relevant to Aisha's marathon training and injury prevention?",
        options: [
          "The mildly limited ankle dorsiflexion",
          "The bilateral hip drop (Trendelenburg) with weak hip abductors during single-leg squat",
          "The mild knee valgus at the bottom of the overhead squat",
          "Her resting heart rate of 58 bpm",
        ],
        correctAnswer: 1,
        explanation:
          "The bilateral Trendelenburg sign with confirmed hip abductor weakness is most relevant because running is essentially a series of single-leg stances. Weak hip abductors allow the pelvis to drop on the swing side during each stride, creating excessive stress on the IT band (explaining her tightness), knee, and ankle. This is the most common contributor to running injuries including IT band syndrome, patellofemoral pain, and shin splints. Correcting this directly improves running economy and injury resilience.",
        category: "assessment",
      },
      {
        question:
          "Which OPT phase best supports Aisha's marathon training?",
        options: [
          "Phase 1: Stabilization Endurance, since she has no strength training experience",
          "Phase 5: Power, to improve her running speed",
          "Phase 2: Strength Endurance, combining corrective work with endurance-focused strength training",
          "Phase 3: Hypertrophy, to build muscle for injury prevention",
        ],
        correctAnswer: 2,
        explanation:
          "Phase 2 (Strength Endurance) is ideal for Aisha. While she has minimal gym experience, she is an active, fit individual whose primary training is running. Phase 2 allows her to address her stabilization deficits through supersets (pairing strength exercises with stabilization exercises) while building the muscular endurance that supports running. The superset format also keeps rest periods short, which aligns with endurance training principles. Phase 1 alone would not provide enough strength stimulus to meaningfully impact her running.",
        category: "phase-selection",
      },
      {
        question:
          "What flexibility approach should Aisha follow?",
        options: [
          "Static stretching for 30 minutes before every run to prevent injuries",
          "SMR for IT band, calves, hip flexors, and adductors; dynamic stretching before runs; static stretching after runs",
          "No stretching needed since she has good cardiovascular fitness",
          "PNF stretching for hamstrings and quadriceps daily",
        ],
        correctAnswer: 1,
        explanation:
          "A comprehensive approach is best: SMR for overactive/tight structures (IT band, calves, hip flexors, adductors), dynamic stretching before runs to prepare tissues without reducing elastic energy, and static stretching after runs when muscles are warm. Pre-run static stretching has been shown to temporarily reduce power output and does not prevent injury. The SMR specifically targets her IT band tightness complaint and the muscles contributing to her movement compensations.",
        category: "exercise-selection",
      },
      {
        question:
          "Which core exercise is most beneficial for Aisha's running goals?",
        options: [
          "Crunches and sit-ups for abdominal definition",
          "Side plank with hip abduction (clamshell variation) progressing to single-leg balance with anti-rotation",
          "Heavy barbell back squat for overall core activation",
          "Ab rollouts for anterior core strength",
        ],
        correctAnswer: 1,
        explanation:
          "Side plank with hip abduction directly targets Aisha's primary deficit (hip abductor weakness and Trendelenburg) while training frontal plane core stability, which is essential for running. Progressing to single-leg balance with anti-rotation challenges the core in a running-specific pattern (single-leg stance with rotational control). Running requires frontal and transverse plane stability more than sagittal plane strength, making these exercises more functional than crunches or sit-ups for her goals.",
        category: "exercise-selection",
      },
      {
        question:
          "What resistance training program design is best for Aisha?",
        options: [
          "Heavy lower body training 4x/week to build maximum leg strength",
          "2x/week Phase 2 supersets: hip-dominant movements (single-leg deadlifts, step-ups) paired with stabilization exercises (single-leg balance reaches); focus on hip abductors, glutes, and calf complex",
          "3x/week full body bodybuilding split to build overall muscle",
          "Leg press and leg extension machines 3x/week for quadriceps strength",
        ],
        correctAnswer: 1,
        explanation:
          "Two sessions per week of Phase 2 supersets is optimal because it provides sufficient strength stimulus without interfering with her running volume (25+ miles/week building toward marathon). Hip-dominant, single-leg exercises address her specific weaknesses (hip abductors, glutes) and mimic running mechanics. Superset format (strength + stabilization) corrects imbalances while building endurance. More than 2 strength sessions would likely compromise running recovery during marathon buildup.",
        category: "programming",
      },
      {
        question:
          "What cardiorespiratory guidance should accompany Aisha's strength program?",
        options: [
          "Replace 2 running days with cycling to reduce injury risk",
          "Maintain her current running program with gradual mileage progression (no more than 10% per week); schedule strength training on easy run days or separate from key run sessions by 6+ hours",
          "Add HIIT sessions on top of her running for maximum cardiovascular adaptation",
          "Reduce running to 15 miles/week and focus on strength until 8 weeks before the marathon",
        ],
        correctAnswer: 1,
        explanation:
          "The 10% weekly mileage increase rule is the standard guideline for marathon buildup to prevent overuse injuries. Scheduling strength on easy run days or separated from key sessions prevents interference with important running workouts (long runs, tempo runs, intervals). This integrated approach ensures strength training supports, rather than detracts from, her primary goal of marathon completion. Adding HIIT on top of marathon training risks overtraining, and reducing mileage too much compromises endurance development.",
        category: "programming",
      },
    ],
    relatedChapters: [5, 6, 7, 8, 9, 13, 14],
  },
];
