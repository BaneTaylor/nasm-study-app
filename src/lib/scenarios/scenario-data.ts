export type Scenario = {
  id: number;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  domain: string;
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
    relatedChapter?: number;
  }[];
  relatedChapters: number[];
};

export const scenarios: Scenario[] = [
  // 1. Sedentary Office Worker
  {
    id: 1,
    title: "The Desk-Bound Developer",
    difficulty: "beginner",
    domain: "Program Design",
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
        relatedChapter: 6,
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
        relatedChapter: 14,
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
        relatedChapter: 7,
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
        relatedChapter: 9,
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
        relatedChapter: 13,
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
        relatedChapter: 8,
      },
    ],
    relatedChapters: [6, 7, 8, 9, 13, 14],
  },

  // 2. Older Adult
  {
    id: 2,
    title: "Active Aging: The Retired Teacher",
    difficulty: "intermediate",
    domain: "Special Populations",
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
        relatedChapter: 6,
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
        relatedChapter: 14,
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
        relatedChapter: 7,
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
        relatedChapter: 9,
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
        relatedChapter: 13,
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
        relatedChapter: 8,
      },
    ],
    relatedChapters: [6, 7, 9, 10, 14, 19],
  },

  // 3. Athlete Returning from Injury
  {
    id: 3,
    title: "Back in the Game: ACL Recovery",
    difficulty: "advanced",
    domain: "Exercise Science",
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
        relatedChapter: 6,
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
        relatedChapter: 14,
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
        relatedChapter: 7,
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
        relatedChapter: 9,
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
        relatedChapter: 13,
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
        relatedChapter: 8,
      },
    ],
    relatedChapters: [6, 7, 9, 10, 13, 14, 19],
  },

  // 4. Overweight Beginner
  {
    id: 4,
    title: "Fresh Start: Weight Loss Journey",
    difficulty: "beginner",
    domain: "Nutrition & Lifestyle",
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
        relatedChapter: 6,
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
        relatedChapter: 14,
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
        relatedChapter: 7,
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
        relatedChapter: 9,
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
        relatedChapter: 13,
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
        relatedChapter: 8,
      },
    ],
    relatedChapters: [6, 7, 8, 9, 14, 16, 19],
  },

  // 5. Pregnant Woman
  {
    id: 5,
    title: "Training Through Pregnancy",
    difficulty: "advanced",
    domain: "Special Populations",
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
        relatedChapter: 6,
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
        relatedChapter: 14,
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
        relatedChapter: 7,
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
        relatedChapter: 9,
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
        relatedChapter: 13,
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
        relatedChapter: 8,
      },
    ],
    relatedChapters: [7, 8, 9, 13, 14, 19],
  },

  // 6. Youth Athlete
  {
    id: 6,
    title: "Rising Star: Youth Basketball Player",
    difficulty: "intermediate",
    domain: "Assessment",
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
        relatedChapter: 6,
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
        relatedChapter: 14,
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
        relatedChapter: 7,
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
        relatedChapter: 9,
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
        relatedChapter: 13,
      },
    ],
    relatedChapters: [6, 7, 9, 10, 11, 14, 19],
  },

  // 7. Person with Hypertension
  {
    id: 7,
    title: "Heart Health: Managing Hypertension",
    difficulty: "intermediate",
    domain: "Cardiorespiratory Fitness",
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
        relatedChapter: 6,
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
        relatedChapter: 14,
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
        relatedChapter: 7,
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
        relatedChapter: 9,
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
        relatedChapter: 13,
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
        relatedChapter: 8,
      },
    ],
    relatedChapters: [3, 6, 7, 8, 9, 14, 19],
  },

  // 8. Experienced Lifter with Imbalances
  {
    id: 8,
    title: "The Imbalanced Powerlifter",
    difficulty: "advanced",
    domain: "Exercise Science",
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
        relatedChapter: 6,
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
        relatedChapter: 14,
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
        relatedChapter: 7,
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
        relatedChapter: 9,
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
        relatedChapter: 13,
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
        relatedChapter: 8,
      },
    ],
    relatedChapters: [5, 6, 7, 9, 13, 14],
  },

  // 9. Post-Rehab Client
  {
    id: 9,
    title: "Post-Rehab: Rebuilding After Back Surgery",
    difficulty: "advanced",
    domain: "Program Design",
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
        relatedChapter: 6,
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
        relatedChapter: 14,
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
        relatedChapter: 7,
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
        relatedChapter: 9,
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
        relatedChapter: 13,
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
        relatedChapter: 8,
      },
    ],
    relatedChapters: [6, 7, 9, 13, 14, 15, 19],
  },

  // 10. Sport-Specific Training
  {
    id: 10,
    title: "Race Day Ready: Marathon Preparation",
    difficulty: "intermediate",
    domain: "Cardiorespiratory Fitness",
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
        relatedChapter: 6,
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
        relatedChapter: 14,
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
        relatedChapter: 7,
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
        relatedChapter: 9,
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
        relatedChapter: 13,
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
        relatedChapter: 8,
      },
    ],
    relatedChapters: [5, 6, 7, 8, 9, 13, 14],
  },

  // ═══════════════════════════════════════════════════════════
  // NEW SCENARIOS (11-15)
  // ═══════════════════════════════════════════════════════════

  // 11. Teenager with Scoliosis
  {
    id: 11,
    title: "The Curved Spine: Adolescent Scoliosis",
    difficulty: "advanced",
    domain: "Special Populations",
    client: {
      name: "Emma Nguyen",
      age: 16,
      gender: "Female",
      occupation: "High school junior, competitive swimmer (200m butterfly)",
      goals:
        "Improve swim performance, reduce back discomfort during long practices, strengthen core to support spine",
      history:
        "Diagnosed with mild-moderate right thoracic scoliosis (22-degree Cobb angle) at age 13. Wears a corrective brace 18 hours/day (not during swimming or exercise). No surgical recommendation at this time. Orthopedist and parents approve exercise program with modifications. Has been swimming competitively since age 10. Reports fatigue and mild aching in mid-back after practices over 90 minutes. No neurological symptoms. Parental consent obtained.",
      assessmentFindings:
        "Overhead squat: visible right thoracic curve with left shoulder lower than right, mild trunk rotation to right, slight lateral shift. Single-leg squat: right side shows more hip drop than left. Standing posture: right rib prominence, left hip appears higher, head tilts slightly left. Trunk rotation: limited to the left compared to right. Core endurance testing: below average, especially lateral endurance on left side.",
    },
    steps: [
      {
        question:
          "When interpreting Emma's overhead squat assessment, which finding is MOST directly related to her scoliosis and should be the primary focus?",
        options: [
          "The mild trunk rotation to the right",
          "The asymmetric lateral trunk endurance and visible thoracic curve with compensatory patterns",
          "Her head tilting slightly left",
          "The hip drop on the right side during single-leg squat",
        ],
        correctAnswer: 1,
        explanation:
          "The asymmetric lateral trunk endurance combined with the visible thoracic curve and compensatory patterns is the most clinically relevant finding. In scoliosis, muscles on the convex side of the curve become lengthened and weak, while muscles on the concave side become shortened. Emma's weaker left lateral endurance aligns with the convex side of her right thoracic curve. Addressing this asymmetry through targeted strengthening is the primary exercise-based intervention for scoliosis management. The other findings are secondary compensations of the primary curve.",
        category: "assessment",
        relatedChapter: 6,
      },
      {
        question:
          "Which OPT phase is most appropriate for Emma, and what special considerations apply?",
        options: [
          "Phase 3: Hypertrophy, to build muscle bulk around the spine for support",
          "Phase 1: Stabilization Endurance with emphasis on asymmetric core training addressing the convex/concave muscle imbalances",
          "Phase 5: Power, since she is a competitive athlete",
          "Phase 2: Strength Endurance with no scoliosis-specific modifications",
        ],
        correctAnswer: 1,
        explanation:
          "Phase 1 with scoliosis-specific modifications is appropriate. Despite being a trained athlete, Emma's assessment reveals significant stabilization deficits and asymmetries specific to her scoliosis. Phase 1 allows focus on core stabilization, which is the primary exercise intervention for scoliosis. Asymmetric training is critical: strengthening the convex-side muscles (left lateral trunk) more than the concave side. She can progress through phases faster than a sedentary beginner, but Phase 1 addresses her most critical needs. Her swim training provides adequate cardiovascular and strength stimulation.",
        category: "phase-selection",
        relatedChapter: 14,
      },
      {
        question:
          "What flexibility approach is most appropriate given Emma's scoliosis?",
        options: [
          "Aggressive bilateral static stretching to increase overall flexibility",
          "SMR and static stretching focused on the concave (shortened) side muscles; gentle mobilization for the thoracic spine; avoid overstretching the convex (lengthened) side",
          "No flexibility work, as stretching could worsen the curve",
          "PNF stretching for bilateral symmetry",
        ],
        correctAnswer: 1,
        explanation:
          "Asymmetric flexibility work is essential for scoliosis. The muscles on the concave side (right side of her thoracic curve) are shortened and need lengthening through SMR and static stretching. The convex side muscles (left thoracic) are already lengthened and should NOT be aggressively stretched, as this would worsen the imbalance. Thoracic spine mobilization can help with rotation limitations. This asymmetric approach follows the corrective exercise continuum applied specifically to scoliotic patterns.",
        category: "exercise-selection",
        relatedChapter: 7,
      },
      {
        question:
          "Which core exercise is most appropriate for Emma's scoliosis management?",
        options: [
          "Heavy bilateral deadlifts to strengthen the entire posterior chain",
          "Side plank with emphasis on the convex side (left), progressing to asymmetric bird-dog variations targeting the lengthened/weak muscles",
          "Bilateral crunches and sit-ups for abdominal strength",
          "Russian twists with a medicine ball for rotational power",
        ],
        correctAnswer: 1,
        explanation:
          "Side plank on the convex side (left) targets the lengthened, weakened lateral stabilizers that need strengthening. Research supports side plank exercise specifically for scoliosis, with emphasis on the convex side. Asymmetric bird-dog variations can target the weakened muscles on the convex side while training core stabilization. Bilateral exercises alone miss the critical asymmetric training component. Russian twists involve spinal rotation under load, which is inappropriate for a scoliotic spine.",
        category: "exercise-selection",
        relatedChapter: 9,
      },
      {
        question:
          "What resistance training approach should Emma follow?",
        options: [
          "Standard bilateral Phase 1 program with no modifications",
          "Phase 1 stabilization exercises with asymmetric loading: unilateral exercises emphasizing the convex-side muscles, controlled tempo, and neutral spine awareness; 1-3 sets of 12-20 reps",
          "Heavy bilateral compound lifts to build overall strength for swimming",
          "Machine-only training to avoid spinal loading",
        ],
        correctAnswer: 1,
        explanation:
          "Phase 1 with asymmetric emphasis is ideal. Unilateral exercises allow targeted strengthening of the weaker convex-side muscles without equally loading both sides. Controlled tempo promotes neuromuscular control and proper spine positioning. Neutral spine awareness is critical to prevent worsening the curve during loaded exercises. The scoliosis-specific modifications within Phase 1 parameters address her unique needs while building the stability foundation needed for her athletic career.",
        category: "programming",
        relatedChapter: 13,
      },
      {
        question:
          "How should Emma's cardio training be managed alongside her swim training?",
        options: [
          "Add running 4x/week to her swim schedule for cross-training",
          "Her competitive swim training provides adequate cardiovascular conditioning; focus gym sessions on corrective exercise and stabilization rather than additional cardio",
          "Replace swim training with cycling to reduce spinal loading",
          "Add HIIT training on non-swim days for maximum fitness",
        ],
        correctAnswer: 1,
        explanation:
          "Emma already trains swimming at a competitive level, providing substantial cardiovascular conditioning. Adding significant cardio on top of swim practices risks overtraining and reduces recovery time needed for her corrective exercise program. Her gym sessions should prioritize the corrective and stabilization work that swimming alone cannot address. Swimming is actually beneficial for scoliosis (low-impact, promotes spinal mobility), so maintaining her swim training while using gym time for targeted corrective work is the optimal approach.",
        category: "programming",
        relatedChapter: 8,
      },
      {
        question:
          "Emma's mother asks about progression criteria. When should Emma advance from Phase 1 to Phase 2?",
        options: [
          "After exactly 4 weeks regardless of progress",
          "When she can demonstrate symmetric lateral trunk endurance (within 10% bilateral), maintain neutral spine during all Phase 1 exercises, and show improved single-leg squat symmetry",
          "When she reports no back discomfort",
          "She should stay in Phase 1 permanently due to her scoliosis",
        ],
        correctAnswer: 1,
        explanation:
          "Progression should be based on objective criteria: improved lateral trunk endurance symmetry (measured during reassessment), demonstrated ability to maintain neutral spine under Phase 1 loads, and improved movement quality (single-leg squat symmetry). Time-based progression ignores individual readiness. Pain is subjective and not a reliable sole criterion. Emma can absolutely progress beyond Phase 1 as her stabilization improves, but the scoliosis-specific modifications (asymmetric emphasis) should continue throughout all phases.",
        category: "programming",
        relatedChapter: 14,
      },
      {
        question:
          "How should you communicate with Emma and her parents about realistic expectations?",
        options: [
          "Promise that exercise will correct her scoliosis curve",
          "Explain that exercise cannot reverse the structural curve but can strengthen supporting muscles, reduce discomfort, improve function, and potentially slow progression; emphasize the importance of continuing brace wear as prescribed by her orthopedist",
          "Tell them exercise is not beneficial for scoliosis and she should focus only on swimming",
          "Recommend they seek a second surgical opinion before starting any exercise program",
        ],
        correctAnswer: 1,
        explanation:
          "Honest, evidence-based communication is essential. Exercise cannot reverse a structural scoliotic curve, but it can strengthen the muscles that support the spine, reduce pain and fatigue, improve functional capacity, and potentially slow curve progression. The trainer's role complements (does not replace) the orthopedist's treatment plan, including brace wear. Setting realistic expectations builds trust and ensures the family understands the value of exercise within the broader treatment context. This aligns with NASM's scope of practice.",
        category: "client-communication",
        relatedChapter: 18,
      },
    ],
    relatedChapters: [6, 7, 9, 13, 14, 18, 19],
  },

  // 12. Post-Cardiac Rehab Client
  {
    id: 12,
    title: "Second Chance: Post-Cardiac Rehab",
    difficulty: "advanced",
    domain: "Cardiorespiratory Fitness",
    client: {
      name: "Frank Kowalski",
      age: 62,
      gender: "Male",
      occupation: "Retired construction foreman",
      goals:
        "Build enough fitness to play with grandchildren, reduce risk of second cardiac event, regain confidence in physical activity",
      history:
        "Myocardial infarction (heart attack) 9 months ago with two stents placed. Completed 12-week Phase III cardiac rehabilitation program. Currently on beta-blocker (metoprolol), statin (atorvastatin), aspirin, and ACE inhibitor. Resting HR 58 bpm (medication-controlled). BMI 27. Former smoker (quit after MI). Cardiologist clearance for independent exercise with HR and symptom monitoring. Functional capacity: 7 METs on last stress test.",
      assessmentFindings:
        "Overhead squat: moderate forward lean, arms fall forward slightly, mild knee valgus. Posture: mild thoracic kyphosis, forward head. Submaximal cardio assessment (bike): achieved target HR of 105 bpm at 75 watts (RPE 5/10). Upper body strength: significantly below average. Reports occasional anxiety about exerting himself.",
    },
    steps: [
      {
        question:
          "Which factor is MOST important to consider when designing Frank's initial program?",
        options: [
          "His mild thoracic kyphosis and forward head posture",
          "His beta-blocker medication (metoprolol) and its effect on heart rate response to exercise",
          "His below-average upper body strength",
          "His BMI of 27",
        ],
        correctAnswer: 1,
        explanation:
          "The beta-blocker is the most critical consideration because it directly affects how to prescribe and monitor exercise intensity. Beta-blockers blunt the heart rate response to exercise, meaning traditional HR-based intensity zones are unreliable. Frank's resting HR of 58 is medication-controlled, not a sign of high fitness. RPE (Rating of Perceived Exertion) and the talk test become the primary intensity monitoring tools. Using standard HR zones could result in either unsafe overexertion or insufficient training stimulus.",
        category: "assessment",
        relatedChapter: 3,
      },
      {
        question:
          "How should exercise intensity be monitored for Frank given his medications?",
        options: [
          "Standard heart rate zones based on 220-age formula",
          "Rating of Perceived Exertion (RPE) as the primary method, supplemented by talk test; target RPE 3-5 out of 10 initially; use HR from his cardiac stress test as a secondary reference",
          "Heart rate variability (HRV) monitoring only",
          "Blood pressure monitoring only, not heart rate",
        ],
        correctAnswer: 1,
        explanation:
          "RPE is the gold standard for intensity monitoring in clients on beta-blockers because the medication attenuates the heart rate response. The talk test provides a practical adjunct (should be able to speak in full sentences at moderate intensity). The HR data from his cardiac stress test provides a medication-adjusted reference point, but RPE should drive day-to-day intensity decisions. Starting at RPE 3-5 (moderate, comfortable) is appropriate for a post-cardiac rehab client building confidence and fitness.",
        category: "assessment",
        relatedChapter: 8,
      },
      {
        question:
          "Which OPT phase should Frank begin in?",
        options: [
          "Phase 1: Stabilization Endurance with cardiac-specific modifications",
          "Phase 2: Strength Endurance to accelerate his strength gains",
          "A cardio-only program for the first 3 months",
          "Phase 3: Hypertrophy to rebuild muscle mass quickly",
        ],
        correctAnswer: 0,
        explanation:
          "Phase 1 with cardiac modifications is the appropriate starting point. This means: lower overall volume, circuit format with adequate rest, continuous breathing emphasis (no Valsalva), blood pressure and symptom awareness, and progressive overload guided by RPE rather than arbitrary load increases. Phase 1 parameters (high reps, low loads, controlled tempo) naturally align with cardiac safety guidelines. A cardio-only approach misses the proven benefits of resistance training for cardiac patients (improved glucose metabolism, blood pressure, functional capacity).",
        category: "phase-selection",
        relatedChapter: 14,
      },
      {
        question:
          "What flexibility approach is appropriate for Frank?",
        options: [
          "No flexibility work to avoid blood pressure fluctuations",
          "SMR with moderate pressure for thoracic spine, pecs, and lats; gentle static stretching for chest and hip flexors; avoid positions that cause dizziness or strain",
          "Aggressive PNF stretching to restore full range of motion",
          "Hot yoga classes for flexibility and stress reduction",
        ],
        correctAnswer: 1,
        explanation:
          "SMR and gentle static stretching targeting his postural imbalances (kyphosis, forward head) are appropriate. The thoracic spine, pecs, and lats need attention based on his posture assessment. Positions that cause dizziness should be avoided (rapid position changes, extreme head-down positions) as his medications can cause orthostatic hypotension. PNF stretching involves isometric contractions that can spike blood pressure. Hot environments (hot yoga) can cause vasodilation that compounds medication effects.",
        category: "exercise-selection",
        relatedChapter: 7,
      },
      {
        question:
          "Which core exercise is best for Frank?",
        options: [
          "Heavy plank holds for 60+ seconds to build endurance",
          "Drawing-in maneuver with floor bridge, emphasizing continuous breathing throughout; progress to standing balance exercises",
          "Hanging leg raises for abdominal development",
          "Barbell good mornings for posterior chain integration",
        ],
        correctAnswer: 1,
        explanation:
          "Floor bridge with drawing-in maneuver and continuous breathing emphasis is ideal. The breathing component is critical: cardiac patients must never hold their breath during exercise (Valsalva maneuver increases cardiac afterload). Progressing to standing balance exercises adds functional challenge while maintaining safety. This exercise activates core stabilizers and glutes at appropriate intensity. Heavy planks risk breath-holding, and hanging exercises create excessive cardiovascular demand for this population.",
        category: "exercise-selection",
        relatedChapter: 9,
      },
      {
        question:
          "What resistance training parameters should Frank follow?",
        options: [
          "1-2 sets of 12-20 reps at 40-60% estimated 1RM; circuit format; continuous breathing; avoid exercises above shoulder height initially; monitor RPE (stay at 3-5/10); stop if chest pain, dizziness, or unusual shortness of breath",
          "3 sets of 6-8 reps to build maximal strength quickly",
          "Machines only, 4 sets of 15 reps with minimal rest",
          "Free weights only to improve balance and coordination",
        ],
        correctAnswer: 0,
        explanation:
          "Phase 1 parameters (1-2 sets, 12-20 reps) with cardiac-specific modifications are appropriate. The 40-60% estimated 1RM keeps intensity moderate. Circuit format provides cardiovascular conditioning benefit with lower peak cardiac demand than traditional sets. Continuous breathing prevents Valsalva. Avoiding exercises above shoulder height initially reduces cardiac demand (arms overhead increases systolic blood pressure). Clear stopping criteria (chest pain, dizziness, unusual dyspnea) are essential for safety.",
        category: "programming",
        relatedChapter: 13,
      },
      {
        question:
          "What cardiorespiratory training is most appropriate for Frank?",
        options: [
          "HIIT training 3x/week for maximum cardiovascular adaptation",
          "Moderate-intensity continuous training (RPE 3-5/10, talk test positive) for 20-30 minutes, 3-5 days/week; gradual progression of duration before intensity; include 5-minute warm-up and cool-down; low-impact modalities (walking, cycling, elliptical)",
          "Running 3 miles every day to rebuild cardiovascular fitness",
          "Only the walking he does in daily life; no structured cardio",
        ],
        correctAnswer: 1,
        explanation:
          "Moderate-intensity continuous training using RPE and talk test (not HR) is the standard recommendation for post-cardiac rehab clients. The 20-30 minute duration at 3-5 days/week aligns with cardiac rehabilitation guidelines. Extended warm-up and cool-down are important because his medications affect cardiovascular response to exercise transitions. Low-impact modalities reduce orthopedic stress. Duration should increase before intensity. His functional capacity of 7 METs supports moderate-intensity exercise, but HIIT is premature at this stage.",
        category: "programming",
        relatedChapter: 8,
      },
      {
        question:
          "Frank expresses anxiety about pushing himself. How should you address this?",
        options: [
          "Tell him to push through the anxiety, as the doctor cleared him for exercise",
          "Acknowledge his fear as normal and valid; teach him the RPE scale and talk test so he has objective tools to gauge safety; establish clear stopping criteria; start very conservatively and build confidence through gradual progression; suggest he discuss persistent anxiety with his physician",
          "Recommend he see a psychologist before starting exercise",
          "Have him sign an extensive liability waiver and proceed with the planned program",
        ],
        correctAnswer: 1,
        explanation:
          "Exercise anxiety after a cardiac event is extremely common and should be addressed with empathy and practical tools. Teaching the RPE scale and talk test gives Frank concrete, reliable ways to monitor his own safety, which builds autonomy and reduces fear. Clear stopping criteria (symptoms that require stopping exercise and seeking medical attention) provide a safety framework. Conservative initial progression demonstrates that exercise is safe and manageable. If anxiety persists, his physician may recommend cardiac psychology or cardiac support groups.",
        category: "client-communication",
        relatedChapter: 18,
      },
      {
        question:
          "What are the criteria for progressing Frank to Phase 2?",
        options: [
          "After 4 weeks of consistent attendance",
          "When he can complete Phase 1 exercises at RPE 4-5 without symptoms for 3-4 consecutive weeks; demonstrates proper breathing throughout; shows improved submaximal cardio test results; and reports reduced exercise anxiety",
          "When his cardiologist gives specific Phase 2 clearance",
          "When his resting heart rate drops below 55 bpm",
        ],
        correctAnswer: 1,
        explanation:
          "Progression criteria should include: symptom-free exercise at appropriate RPE for multiple consecutive weeks (demonstrating cardiovascular tolerance), consistent proper breathing technique (critical for cardiac safety), improved objective fitness markers (submaximal test improvement), and psychological readiness (reduced anxiety). While cardiologist communication is important, waiting for specific phase clearance is impractical. His resting HR is medication-controlled and will not meaningfully change with fitness improvements due to the beta-blocker.",
        category: "programming",
        relatedChapter: 14,
      },
    ],
    relatedChapters: [3, 6, 7, 8, 9, 13, 14, 18, 19],
  },

  // 13. Type 1 Diabetic Athlete
  {
    id: 13,
    title: "The Diabetic Athlete: Triathlon Prep",
    difficulty: "advanced",
    domain: "Exercise Metabolism",
    client: {
      name: "Ryan Okafor",
      age: 29,
      gender: "Male",
      occupation: "Software engineer, trains before work",
      goals:
        "Complete first Olympic-distance triathlon (1.5K swim, 40K bike, 10K run) in 6 months, maintain optimal blood glucose during training",
      history:
        "Type 1 diabetes mellitus since age 12. Uses insulin pump (continuous subcutaneous infusion). Current A1C: 6.8% (well-controlled). Self-manages blood glucose effectively. Exercises regularly: runs 3x/week (30 min), swims 2x/week, occasional cycling. Has experienced 3 mild hypoglycemic episodes during exercise in past 6 months. Endocrinologist fully supports triathlon goal with exercise prescription guidance. No diabetic complications. Carries glucose tablets during all exercise.",
      assessmentFindings:
        "Overhead squat: good overall form, minor forward lean at bottom position. Single-leg squat: adequate bilateral. Posture: slight forward head from desk work. VO2max estimated: 42 mL/kg/min (above average). Resting HR: 62 bpm. Reports blood glucose drops most during long steady-state efforts over 60 minutes and during high-intensity intervals. Notes difficulty with morning workouts before eating.",
    },
    steps: [
      {
        question:
          "Which exercise-related factor poses the GREATEST risk to Ryan's safety during training?",
        options: [
          "His slight forward head posture from desk work",
          "Exercise-induced hypoglycemia, particularly during prolonged steady-state cardio and high-intensity intervals",
          "His estimated VO2max of 42 mL/kg/min",
          "The minor forward lean at the bottom of his overhead squat",
        ],
        correctAnswer: 1,
        explanation:
          "Exercise-induced hypoglycemia is the primary safety concern for any client with Type 1 diabetes. Both prolonged steady-state exercise (which depletes glycogen stores) and high-intensity intervals (which can cause delayed hypoglycemia) pose risk. Ryan has already experienced 3 hypoglycemic episodes during exercise. For a triathlon involving 2+ hours of continuous activity across three disciplines, blood glucose management strategies must be integrated into every aspect of his training plan. His movement quality is actually good and is not the limiting factor.",
        category: "assessment",
        relatedChapter: 4,
      },
      {
        question:
          "What blood glucose management protocol should be established before every training session?",
        options: [
          "No special protocol needed since his A1C is well-controlled",
          "Check blood glucose before exercise; if below 100 mg/dL, consume 15-30g carbohydrate and recheck in 15 minutes; if 100-250 mg/dL, proceed with exercise; if above 250 mg/dL with ketones, do NOT exercise; have fast-acting glucose available; check during and after long sessions",
          "Take extra insulin before exercise to prevent blood sugar from rising",
          "Skip insulin on training days entirely",
        ],
        correctAnswer: 1,
        explanation:
          "This is the standard pre-exercise blood glucose management protocol for Type 1 diabetes. Starting exercise below 100 mg/dL significantly increases hypoglycemia risk. The 100-250 mg/dL range is the safe exercise window. Above 250 mg/dL with ketones indicates insulin deficiency, and exercise would worsen the situation (increasing ketone production). Having fast-acting glucose (tablets, gel, juice) available at all times is essential. Monitoring during and after exercise catches delayed hypoglycemia, which is common with the prolonged exercise triathlon training requires.",
        category: "assessment",
        relatedChapter: 19,
      },
      {
        question:
          "Which OPT phase is most appropriate for Ryan?",
        options: [
          "Phase 1: Stabilization Endurance, due to his diabetes",
          "Phase 2-3: Periodized between Strength Endurance and Hypertrophy, supporting his triathlon-specific training with sport-appropriate resistance work",
          "Phase 5: Power, since he is an experienced exerciser",
          "No resistance training; focus entirely on swim/bike/run",
        ],
        correctAnswer: 1,
        explanation:
          "Ryan is already fit and moving well. Phase 2 (Strength Endurance) with periodic Phase 3 (Hypertrophy) blocks supports triathlon demands: Phase 2 supersets build muscular endurance for sustained multi-sport performance, while Phase 3 blocks develop the strength base needed for cycling power and running economy. His diabetes does not require regression to Phase 1 when his movement quality and fitness are adequate. Skipping resistance training would miss the performance and injury-prevention benefits that strength work provides for endurance athletes.",
        category: "phase-selection",
        relatedChapter: 14,
      },
      {
        question:
          "What flexibility approach should Ryan follow?",
        options: [
          "No flexibility work; focus only on sport-specific training",
          "SMR for calves, hip flexors, and thoracic spine; dynamic stretching before swim/bike/run; static stretching after workouts for calves, hip flexors, pecs, and upper traps",
          "Static stretching for 30 minutes before every training session",
          "PNF stretching exclusively for maximum flexibility gains",
        ],
        correctAnswer: 1,
        explanation:
          "A comprehensive flexibility program targeting triathlon-specific areas is appropriate. SMR for calves and hip flexors addresses the tightness common in runners and cyclists. Thoracic spine mobility supports swim stroke efficiency. Dynamic stretching before activities prepares tissues without reducing elastic energy storage (important for running economy). Post-workout static stretching maintains range of motion in muscles that tighten from repetitive endurance activity. His forward head posture from desk work also benefits from upper trap and pec flexibility work.",
        category: "exercise-selection",
        relatedChapter: 7,
      },
      {
        question:
          "Which core exercise best supports Ryan's triathlon goals?",
        options: [
          "Heavy deadlifts for posterior chain strength",
          "Prone plank with alternating arm reach (swim simulation), progressing to stability ball rollouts and single-leg stance with anti-rotation",
          "Weighted sit-ups for abdominal strength",
          "Machine-based abdominal exercises only",
        ],
        correctAnswer: 1,
        explanation:
          "The prone plank with alternating arm reach simulates the rotational demands of swimming while training anti-extension stability needed for cycling and running. Progressing to rollouts increases the anti-extension challenge (critical for maintaining aerodynamic cycling position), and single-leg stance with anti-rotation trains the running-specific pattern. These exercises are sport-specific while building the core stability needed across all three triathlon disciplines.",
        category: "exercise-selection",
        relatedChapter: 9,
      },
      {
        question:
          "How should Ryan's resistance training sessions be timed relative to blood glucose management?",
        options: [
          "Always train first thing in the morning before eating for maximum fat burning",
          "Train 1-2 hours after a meal with known carbohydrate content; reduce insulin bolus by 25-50% for the pre-workout meal (per endocrinologist guidance); check blood glucose before, during (if over 60 min), and after session; keep fast-acting carbs within reach",
          "Take double insulin before resistance training to prevent blood sugar spikes",
          "Training timing does not matter if his A1C is controlled",
        ],
        correctAnswer: 1,
        explanation:
          "Training after a meal with known carbohydrate content provides fuel and predictable blood glucose levels. Reducing the pre-workout insulin bolus (per endocrinologist guidance) prevents exercise-induced hypoglycemia, as exercise increases insulin sensitivity and glucose uptake independent of insulin. Morning fasted training is particularly dangerous for Type 1 diabetics due to dawn phenomenon and counterregulatory hormone complexities. Blood glucose monitoring before, during, and after ensures safety. The insulin adjustment specifics should be determined with his endocrinologist.",
        category: "programming",
        relatedChapter: 4,
      },
      {
        question:
          "What resistance training program design is optimal for Ryan?",
        options: [
          "Heavy powerlifting program 4x/week to build maximal strength",
          "2x/week Phase 2 supersets: sport-specific single-leg and unilateral exercises (single-leg squats, single-arm rows, step-ups, lateral lunges) with core integration; 2-4 sets of 8-12 reps; schedule on easy training days",
          "Daily machine-only circuit for high calorie burn",
          "3x/week full-body bodybuilding program",
        ],
        correctAnswer: 1,
        explanation:
          "Two sessions per week of Phase 2 supersets prevents interference with his substantial swim/bike/run training volume. Sport-specific exercises (single-leg work for running, unilateral upper body for swimming stroke balance, lateral movements for injury prevention) directly support triathlon performance. Scheduling on easy training days preserves recovery for key sport sessions. Phase 2 supersets provide adequate strength stimulus with the muscular endurance benefit relevant to triathlon. More than 2 resistance sessions risks overtraining given his total training load.",
        category: "programming",
        relatedChapter: 13,
      },
      {
        question:
          "What specific cardio training considerations apply to Ryan's triathlon preparation related to his diabetes?",
        options: [
          "Train at maximum intensity to improve speed regardless of blood glucose",
          "Build to race-duration training gradually; practice blood glucose management during progressively longer sessions; carry carbohydrate supplements (30-60g/hour for sessions over 60 min); develop a race-day nutrition and insulin plan; simulate race-day conditions in training to test glucose management strategy",
          "Only do short intervals to avoid hypoglycemia risk",
          "Avoid training in all three sports in the same week to reduce complexity",
        ],
        correctAnswer: 1,
        explanation:
          "The key for Type 1 diabetic endurance athletes is practicing blood glucose management under increasingly race-like conditions. An Olympic triathlon takes 2-3+ hours, requiring fueling with 30-60g carbohydrate per hour. Blood glucose management during prolonged exercise must be rehearsed, not improvised on race day. This includes testing carbohydrate types, timing, insulin pump settings, and monitoring frequency. Developing and testing a race-day plan during training is essential because glucose response varies with exercise duration, intensity, temperature, stress, and nutrition.",
        category: "programming",
        relatedChapter: 8,
      },
      {
        question:
          "Ryan experiences a blood glucose reading of 72 mg/dL twenty minutes into a moderate-intensity cycling session. What is the correct response?",
        options: [
          "Continue exercising at reduced intensity and monitor",
          "Stop exercise immediately; consume 15-20g fast-acting carbohydrate; recheck in 15 minutes; do not resume until blood glucose is above 100 mg/dL and stable",
          "Take extra insulin to correct the imbalance",
          "Switch to a different exercise modality",
        ],
        correctAnswer: 1,
        explanation:
          "72 mg/dL during exercise is below the safe threshold and indicates developing hypoglycemia. The correct response follows the 15-15 rule: stop exercise, consume 15-20g fast-acting carbohydrate (glucose tablets, gel, or juice), wait 15 minutes, and recheck. Exercise should only resume when blood glucose is above 100 mg/dL and stable (not dropping). Taking extra insulin would worsen hypoglycemia. Continuing exercise, even at lower intensity, further drops blood glucose. This is a fundamental safety protocol for exercising with Type 1 diabetes.",
        category: "assessment",
        relatedChapter: 19,
      },
    ],
    relatedChapters: [3, 4, 6, 7, 8, 9, 13, 14, 19],
  },

  // 14. Desk Worker with Chronic Neck Pain
  {
    id: 14,
    title: "Pain in the Neck: The Remote Worker",
    difficulty: "intermediate",
    domain: "Flexibility & Corrective Exercise",
    client: {
      name: "Priya Sharma",
      age: 38,
      gender: "Female",
      occupation: "Financial analyst, works from home, 8-10 hours/day at computer",
      goals:
        "Eliminate chronic neck pain and tension headaches, improve posture, reduce stress, get stronger overall",
      history:
        "Chronic neck pain and tension headaches for 2+ years, worsening since transitioning to remote work. Visits massage therapist monthly for temporary relief. Primary care physician diagnosed tension-type headaches and muscular neck pain; no structural pathology on imaging. Takes ibuprofen 3-4 times/week for headaches. Walks 20 minutes daily with her dog. No other exercise. No other medical conditions. Physician recommends exercise as primary intervention.",
      assessmentFindings:
        "Overhead squat: arms fall forward significantly, pronounced forward head posture, shoulders elevated bilaterally. Standing posture: 2+ inch forward head position, rounded shoulders, increased thoracic kyphosis, mild anterior pelvic tilt. Cervical ROM: limited extension and left rotation. Palpation (within scope): upper trapezius and levator scapulae tender bilaterally (trigger points). Deep cervical flexion endurance test: 5 seconds (normative: 30+ seconds). Shoulder elevation during overhead squat bilateral.",
    },
    steps: [
      {
        question:
          "Which assessment finding most directly explains Priya's chronic neck pain and tension headaches?",
        options: [
          "The mild anterior pelvic tilt",
          "The 2+ inch forward head posture with significantly deficient deep cervical flexor endurance (5 seconds vs. 30+ second norm) and bilateral upper trapezius/levator scapulae trigger points",
          "The limited cervical left rotation",
          "The arms falling forward during overhead squat",
        ],
        correctAnswer: 1,
        explanation:
          "The combination of forward head posture, severely weak deep cervical flexors, and overactive upper trapezius/levator scapulae trigger points is the classic Upper Crossed Syndrome pattern that directly causes tension headaches and neck pain. Forward head posture increases cervical spine loading by approximately 10 lbs for every inch forward. The deep cervical flexors (at 5 seconds vs. 30+ norm) cannot properly support the cervical spine, so the upper trapezius and levator scapulae chronically compensate, developing trigger points that refer pain to the head.",
        category: "assessment",
        relatedChapter: 6,
      },
      {
        question:
          "Which muscles are overactive and which are underactive in Priya's Upper Crossed Syndrome?",
        options: [
          "Overactive: lower trapezius, rhomboids. Underactive: pectoralis major, upper trapezius",
          "Overactive: upper trapezius, levator scapulae, SCM, pec major/minor, subscapularis. Underactive: deep cervical flexors, lower/mid trapezius, rhomboids, infraspinatus, posterior deltoid",
          "Overactive: rectus abdominis, gluteus maximus. Underactive: erector spinae, hip flexors",
          "All muscles are equally affected in Upper Crossed Syndrome",
        ],
        correctAnswer: 1,
        explanation:
          "Upper Crossed Syndrome involves a predictable pattern: overactive (tight/short) muscles include upper trapezius, levator scapulae, SCM (posterior cervical), and pectoralis major/minor, subscapularis (anterior shoulder). Underactive (weak/lengthened) muscles include deep cervical flexors (anterior neck), lower/mid trapezius, rhomboids (posterior scapular), infraspinatus, and posterior deltoid. This X-pattern of overactive/underactive muscles creates the forward head, rounded shoulder posture. Understanding this pattern is fundamental to NASM corrective exercise and appears frequently on the exam.",
        category: "assessment",
        relatedChapter: 5,
      },
      {
        question:
          "Which OPT phase is most appropriate for Priya?",
        options: [
          "Phase 1: Stabilization Endurance with heavy emphasis on corrective exercise for Upper Crossed Syndrome",
          "Phase 2: Strength Endurance to build strength quickly and address her posture",
          "A flexibility-only program until her pain resolves",
          "Phase 3: Hypertrophy to build postural muscles",
        ],
        correctAnswer: 0,
        explanation:
          "Phase 1 with strong corrective exercise emphasis is essential. Priya's primary issue is a deeply ingrained postural dysfunction causing pain. Phase 1 corrective exercise (inhibit, lengthen, activate, integrate) specifically targets the Upper Crossed Syndrome pattern. The stabilization component builds the neuromuscular control needed to maintain improved posture. A flexibility-only program would miss the critical activation and integration phases. Strength phases are premature until her movement dysfunctions are substantially corrected.",
        category: "phase-selection",
        relatedChapter: 14,
      },
      {
        question:
          "What is the correct corrective exercise sequence for Priya's overactive upper trapezius?",
        options: [
          "Strengthen upper traps first, then stretch them",
          "Inhibit (SMR upper traps, 30 sec each side) -> Lengthen (upper trap stretch, 30 sec hold) -> Activate (prone Y raise for lower trap, 2x15) -> Integrate (squat to row, 2x15)",
          "Static stretching only, 3x daily for 60 seconds",
          "Deep tissue massage followed by heavy shrugs",
        ],
        correctAnswer: 1,
        explanation:
          "The NASM corrective exercise continuum is: Inhibit (SMR), Lengthen (stretch), Activate (isolate the underactive muscle), Integrate (compound movement using the corrected pattern). For the upper trapezius: SMR reduces overactivity and trigger points, stretching restores length, prone Y raises activate the underactive lower trapezius (the muscle that should be working instead), and squat to row integrates the corrected pattern into a functional movement. This sequence must be followed in order for maximum effectiveness.",
        category: "exercise-selection",
        relatedChapter: 7,
      },
      {
        question:
          "Which core exercise is most appropriate for Priya?",
        options: [
          "Crunches to strengthen the rectus abdominis",
          "Floor bridge with chin tuck (cervical retraction) and drawing-in maneuver; progress to quadruped chin tuck with arm raise",
          "Heavy planks for 60 seconds to build endurance",
          "Hanging leg raises for core and grip strength",
        ],
        correctAnswer: 1,
        explanation:
          "The floor bridge with chin tuck combines core stabilization (drawing-in maneuver targeting TVA) with deep cervical flexor activation (chin tuck). This dual-purpose exercise directly addresses both Priya's core weakness and her cervical dysfunction. Progressing to quadruped chin tuck with arm raise adds scapular stability challenge while maintaining the cervical retraction component. Crunches promote the forward-flexed posture she already exhibits. Heavy planks may encourage compensatory neck tension.",
        category: "exercise-selection",
        relatedChapter: 9,
      },
      {
        question:
          "What resistance training program should Priya follow?",
        options: [
          "Upper body-only focus, 4x/week heavy pressing",
          "Phase 1: 1-3 sets of 12-20 reps with corrective warm-up (inhibit/lengthen overactive muscles, activate underactive muscles); emphasize pulling movements (rows, face pulls) over pressing; integrate cervical retraction cues into all exercises; 3x/week total body",
          "Machine-only circuit with no free weights",
          "2x/week lower body only, letting the corrective exercises handle upper body",
        ],
        correctAnswer: 1,
        explanation:
          "Phase 1 with a corrective warm-up and pulling emphasis directly addresses Priya's needs. The corrective warm-up (SMR and stretching overactive muscles, activating underactive muscles) prepares her for proper movement. Emphasizing pulling (2:1 pull-to-push ratio) strengthens the weak posterior chain that combats her forward posture. Cervical retraction cues during all exercises train postural awareness that transfers to her work environment. Total body training 3x/week provides adequate stimulus while allowing recovery.",
        category: "programming",
        relatedChapter: 13,
      },
      {
        question:
          "What cardiorespiratory training would benefit Priya?",
        options: [
          "Running 5 days/week for stress relief",
          "Moderate-intensity walking (building from her current 20 min to 30-40 min) most days; add rowing machine 2x/week (promotes thoracic extension and scapular retraction); incorporate mind-body activities (yoga or tai chi) 1-2x/week for stress management and postural awareness",
          "No cardio, as it may worsen her neck pain",
          "HIIT training 4x/week for maximum calorie burn",
        ],
        correctAnswer: 1,
        explanation:
          "Building on her existing walking habit is practical and sustainable. The rowing machine is uniquely beneficial for Upper Crossed Syndrome: it trains thoracic extension and scapular retraction (the exact movements she needs) while providing cardiovascular conditioning. Mind-body activities (yoga, tai chi) address her stress component (tension headaches are often stress-related), improve body awareness, and reinforce postural correction. This multi-modal approach addresses the physical, psychological, and lifestyle contributors to her condition.",
        category: "programming",
        relatedChapter: 8,
      },
      {
        question:
          "What lifestyle recommendations should accompany Priya's exercise program?",
        options: [
          "No lifestyle modifications needed beyond the exercise program",
          "Ergonomic workstation assessment (monitor at eye level, elbows at 90 degrees); movement breaks every 30-45 minutes (chin tucks, chest stretch, scapular squeezes); consider standing desk intervals; hydration and stress management strategies; sleep position assessment (avoid stomach sleeping)",
          "Quit her job to reduce screen time",
          "Take stronger pain medication to manage symptoms while exercising",
        ],
        correctAnswer: 1,
        explanation:
          "Exercise alone cannot overcome 8-10 hours/day of poor postural habits. Ergonomic modifications reduce the sustained postural load that creates the dysfunction. Movement breaks interrupt the sustained static posture that triggers pain. Standing desk intervals change spinal loading patterns. Hydration and stress management address headache triggers. Sleep position (stomach sleeping forces cervical rotation) can perpetuate symptoms. This integrated approach addresses the root cause (sustained desk posture), not just the symptoms. NASM emphasizes lifestyle modification as part of comprehensive program design.",
        category: "client-communication",
        relatedChapter: 18,
      },
    ],
    relatedChapters: [5, 6, 7, 8, 9, 13, 14, 18],
  },

  // 15. Military Veteran with PTSD/Anxiety
  {
    id: 15,
    title: "Strength Within: The Veteran",
    difficulty: "intermediate",
    domain: "Behavioral Coaching",
    client: {
      name: "Marcus Rivera",
      age: 33,
      gender: "Male",
      occupation: "Former Army infantry, currently a college student (Criminal Justice) using GI Bill",
      goals:
        "Rebuild physical fitness lost since leaving the military, manage PTSD-related anxiety through exercise, improve sleep quality, feel strong and capable again",
      history:
        "8 years active duty Army, deployed twice. Honorably discharged 18 months ago. Diagnosed with PTSD (receives VA treatment: therapy + low-dose SSRI medication). Reports disrupted sleep (5-6 hours/night), hypervigilance in crowded/loud environments, and periodic anxiety episodes. Previously very fit (scored 290+ on Army PFT). Has not exercised consistently for 18 months due to transition challenges. BMI 26. No physical injuries. Physician and therapist both recommend exercise as adjunct therapy. Prefers training alone or with one other person. Avoids crowded gyms.",
      assessmentFindings:
        "Overhead squat: mild forward lean, slight arm drift forward. Posture: mild upper crossed syndrome from increased computer use in school. Push-up test: 32 reps (still above average, but well below his previous military standard). 1.5-mile run: 13:15 (previously under 11:00). Reports muscle tension in shoulders and jaw (stress-related bruxism). Self-described fitness frustration: 'I used to be so much stronger.'",
    },
    steps: [
      {
        question:
          "Which factor should MOST influence how Marcus's training environment and program are structured?",
        options: [
          "His mild upper crossed syndrome",
          "His PTSD-related hypervigilance, anxiety, and environmental preferences (avoidance of crowded, loud spaces)",
          "His push-up test score being below his military standard",
          "His 1.5-mile run time decrease",
        ],
        correctAnswer: 1,
        explanation:
          "Marcus's PTSD-related symptoms are the most important factor for program STRUCTURE (not just exercise selection). Hypervigilance in crowded, loud environments means a busy gym may trigger anxiety or hyperarousal, making the training environment itself a barrier. His preference for training alone or with one person should be honored. Programming should include predictable routines (reducing anxiety triggers), controlled environments, and activities that enhance feelings of safety and control. His fitness decrements are addressable but secondary to creating a psychologically safe training experience.",
        category: "assessment",
        relatedChapter: 18,
      },
      {
        question:
          "Which OPT phase is most appropriate for Marcus?",
        options: [
          "Phase 4: Maximal Strength, since he was previously very fit",
          "Phase 1: Stabilization Endurance, treating him as a complete beginner",
          "Phase 2: Strength Endurance, acknowledging his fitness base while addressing deconditioning and providing the structure and progressive challenge he needs",
          "Phase 5: Power, to quickly return him to military fitness levels",
        ],
        correctAnswer: 2,
        explanation:
          "Phase 2 (Strength Endurance) is the right balance for Marcus. He is not a true beginner (still scores above average on push-up test), so Phase 1 may feel unchallenging and frustrating given his military background. Phase 2 provides meaningful physical challenge through supersets while incorporating corrective elements. His fitness base supports this level. Jumping to Phase 4-5 risks injury after 18 months of deconditioning and could trigger frustration if he cannot perform at previous levels. Phase 2 also provides the structured progression that can parallel his therapeutic goals.",
        category: "phase-selection",
        relatedChapter: 14,
      },
      {
        question:
          "What flexibility approach should prioritize Marcus's needs?",
        options: [
          "No flexibility work; focus only on strength",
          "SMR for upper trapezius, levator scapulae, and pectorals (addressing postural dysfunction AND stress-related muscle tension); breathing-focused stretching (diaphragmatic breathing during static holds); consider yoga-based cool-down for parasympathetic activation",
          "Aggressive stretching to restore his military-level flexibility",
          "Dynamic stretching only, mimicking military warm-up protocols",
        ],
        correctAnswer: 1,
        explanation:
          "The flexibility approach should serve dual purposes: corrective (addressing upper crossed syndrome from computer use) AND therapeutic (reducing stress-related muscle tension, promoting parasympathetic activation). SMR for his overactive, tense upper body muscles provides both benefits. Integrating diaphragmatic breathing into static stretches teaches a stress management skill that transfers outside the gym. Yoga-based cool-down movements promote the parasympathetic (rest-and-digest) response that can help with his sleep and anxiety. This integrated approach maximizes the mental health benefits of training.",
        category: "exercise-selection",
        relatedChapter: 7,
      },
      {
        question:
          "Which core exercise is most appropriate for Marcus?",
        options: [
          "Military-style flutter kicks and sit-ups to rebuild his PFT scores",
          "Cable chop/lift patterns providing controlled challenge with anti-rotation and anti-extension; progress to Turkish get-ups for whole-body integration and focus",
          "Heavy deadlifts for posterior chain and core strength",
          "Machine-based abdominal exercises only",
        ],
        correctAnswer: 1,
        explanation:
          "Cable chop/lift patterns provide controlled, progressive core challenge that addresses his mild postural issues while building strength. Turkish get-ups are particularly valuable for this client: they require intense focus and present-moment awareness (similar to mindfulness), build whole-body coordination and strength, and provide a measurable, progressive challenge that can rebuild his sense of physical capability. Military-style exercises may trigger negative associations or frustration about performance decline. The focus-intensive nature of these exercises also provides a productive mental health benefit.",
        category: "exercise-selection",
        relatedChapter: 9,
      },
      {
        question:
          "What resistance training program should Marcus follow?",
        options: [
          "A military-style PT program to rebuild his fitness quickly",
          "Phase 2 supersets, 3-4x/week; predictable routine with built-in progression; training journal to track improvements; emphasize exercises that build feelings of competence and control; train at off-peak gym hours or home/garage gym",
          "Machine-only circuit at a busy commercial gym",
          "Random workout-of-the-day style programming for variety",
        ],
        correctAnswer: 1,
        explanation:
          "Phase 2 supersets provide the progressive challenge Marcus needs while incorporating corrective elements. The predictable routine is important for someone with PTSD: unpredictability can trigger anxiety, while consistent structure provides a sense of control. A training journal creates visible evidence of progress, combating his frustration about fitness decline. Emphasizing exercises where he can feel competent and progressively stronger supports his psychological recovery. Off-peak hours or private training space respects his environmental needs. Random programming would undermine the sense of control and predictability he needs.",
        category: "programming",
        relatedChapter: 13,
      },
      {
        question:
          "What cardio training recommendation is best for Marcus?",
        options: [
          "Running 5 miles daily to match military standards",
          "Moderate-intensity steady-state cardio (RPE 5-6) building from 20 to 40 minutes; outdoor options (trail running, hiking) when possible for nature exposure benefits; avoid headphones that block environmental awareness if it triggers hypervigilance; consider rucking as a familiar, meditative activity",
          "Only indoor cardio to control the environment",
          "HIIT training 5x/week to maximize fitness gains quickly",
        ],
        correctAnswer: 1,
        explanation:
          "Building from moderate-intensity steady-state is appropriate given his deconditioning. Outdoor exercise (nature exposure) has evidence-based benefits for PTSD and anxiety, including reduced cortisol, improved mood, and decreased rumination. Rucking (weighted walking/hiking) may be a positive connection to his military experience that provides familiar, meditative movement. Awareness of environmental triggers (such as blocked hearing from headphones potentially increasing hypervigilance) shows understanding of his psychological needs. The goal is progressive fitness building with mental health co-benefits.",
        category: "programming",
        relatedChapter: 8,
      },
      {
        question:
          "Marcus says, 'I used to bench 315 and run a sub-11 minute mile and a half. Now I can barely do a pull-up. What is wrong with me?' How should you respond?",
        options: [
          "Tell him to work harder and he will get back to those numbers in no time",
          "Acknowledge his frustration, normalize the fitness changes after a major life transition, reframe his current fitness as a starting point (not a failure), set incremental goals that build confidence, and emphasize that the discipline that made him excellent before is the same quality that will rebuild his fitness",
          "Suggest he see a sports psychologist instead of a trainer",
          "Show him research about age-related fitness decline",
        ],
        correctAnswer: 1,
        explanation:
          "This response demonstrates the behavioral coaching competencies NASM expects. Acknowledging his frustration validates his feelings (essential for therapeutic alliance with PTSD clients). Normalizing fitness changes after transition removes shame. Reframing as a starting point rather than a failure shifts his mindset from loss to potential. Incremental goals provide small wins that rebuild confidence. Connecting his military discipline to his current goals leverages his existing strengths. This approach aligns with motivational interviewing and the transtheoretical model of behavior change that NASM covers.",
        category: "client-communication",
        relatedChapter: 18,
      },
      {
        question:
          "What signs should you watch for that would indicate Marcus needs to be referred back to his therapist or physician?",
        options: [
          "Normal exercise-related fatigue and muscle soreness",
          "Increased frequency or severity of anxiety episodes, avoidance of training sessions, expressions of hopelessness, significant sleep deterioration, social withdrawal, or any mention of self-harm; exercise becoming a compulsive coping mechanism (excessive training despite injury/illness)",
          "Slow fitness progress compared to his military baseline",
          "Occasional frustration with workout difficulty",
        ],
        correctAnswer: 1,
        explanation:
          "Personal trainers must recognize when a client's mental health needs exceed their scope of practice. Warning signs include: escalating anxiety (not improving with exercise as expected), avoidance patterns, hopelessness or despair, worsening sleep (a key PTSD symptom), social withdrawal, any self-harm ideation, or exercise becoming a compulsive behavior. These indicate that his mental health treatment may need adjustment. Slow fitness progress and normal frustration are expected and within scope. NASM emphasizes knowing when to refer to allied health professionals as a core professional responsibility.",
        category: "client-communication",
        relatedChapter: 20,
      },
      {
        question:
          "After 8 weeks, Marcus reports improved sleep (7 hours/night), reduced daily anxiety, and wants to train more intensely. How should you progress his program?",
        options: [
          "Jump directly to Phase 4 Maximal Strength since he is responding well",
          "Progress to Phase 3 (Hypertrophy) with gradual intensity increases; maintain predictable routine structure; add training volume before intensity; continue flexibility and breathing components; celebrate his progress and the role of consistent effort",
          "Keep him in Phase 2 indefinitely to avoid triggering anxiety",
          "Switch to a completely new program to keep things interesting",
        ],
        correctAnswer: 1,
        explanation:
          "Progression to Phase 3 is appropriate based on his positive response and readiness. Adding volume before intensity follows safe progression principles. Maintaining routine structure respects his psychological needs while progressing the physical challenge. Continuing the flexibility/breathing components preserves the mental health benefits that are contributing to his sleep and anxiety improvements. Celebrating progress reinforces the connection between effort and outcome, building self-efficacy. Jumping to Phase 4 skips the hypertrophy adaptation that will support future strength gains, and maintaining Phase 2 indefinitely would limit his growth.",
        category: "programming",
        relatedChapter: 14,
      },
    ],
    relatedChapters: [6, 7, 8, 9, 13, 14, 18, 20],
  },
];
