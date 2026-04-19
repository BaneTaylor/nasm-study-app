export type ClientProfile = {
  id: number;
  name: string;
  age: number;
  gender: string;
  occupation: string;
  fitnessLevel: "sedentary" | "beginner" | "intermediate" | "advanced";
  goals: string;
  medicalHistory: string;
  assessmentFindings: {
    overheadSquat: string[];
    posturalObservations: string[];
    movementCompensations: string[];
  };
  correctPhase: number; // 1-5
  phaseRationale: string;
  difficulty: "beginner" | "intermediate" | "advanced";
};

export const clientProfiles: ClientProfile[] = [
  {
    id: 1,
    name: "Karen Mitchell",
    age: 42,
    gender: "Female",
    occupation: "Office Manager — sits 8+ hours/day",
    fitnessLevel: "sedentary",
    goals: "Lose 20 lbs, reduce back pain, improve energy for daily tasks",
    medicalHistory: "No major conditions. Mild low back pain for 2 years. BMI 31.",
    assessmentFindings: {
      overheadSquat: [
        "Excessive forward lean",
        "Arms fall forward",
        "Knees move inward (valgus)",
      ],
      posturalObservations: [
        "Forward head posture",
        "Rounded shoulders",
        "Anterior pelvic tilt",
      ],
      movementCompensations: [
        "Hip flexor tightness limiting hip extension",
        "Weak glutes — hip drops during single-leg stance",
        "Upper trap dominance during overhead movements",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Sedentary client with multiple movement compensations and no training history. Must establish stability, correct imbalances, and build a movement foundation before progressing. Phase 1 (Stabilization Endurance) addresses all identified compensations with low-intensity stabilization exercises.",
    difficulty: "beginner",
  },
  {
    id: 2,
    name: "Margaret Chen",
    age: 72,
    gender: "Female",
    occupation: "Retired teacher",
    fitnessLevel: "beginner",
    goals: "Improve balance, prevent falls, maintain bone density",
    medicalHistory:
      "Diagnosed with osteoporosis (T-score -2.8). History of one wrist fracture. Mild arthritis in both knees. Takes calcium and vitamin D supplements.",
    assessmentFindings: {
      overheadSquat: [
        "Cannot perform full overhead squat — modified to wall sit assessment",
        "Limited ankle dorsiflexion",
        "Significant forward lean",
      ],
      posturalObservations: [
        "Increased thoracic kyphosis",
        "Forward head posture",
        "Slight lateral shift to the right",
      ],
      movementCompensations: [
        "Poor single-leg balance (< 5 seconds)",
        "Difficulty rising from chair without arm support",
        "Reduced shoulder flexion range of motion",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Elderly client with osteoporosis requires Phase 1 (Stabilization Endurance) with special population modifications. Focus on balance training, proprioception, and low-impact stabilization. Avoid spinal flexion exercises, heavy loading, and high-impact activities. Progress slowly with emphasis on fall prevention.",
    difficulty: "intermediate",
  },
  {
    id: 3,
    name: "Sarah Rodriguez",
    age: 31,
    gender: "Female",
    occupation: "Marketing Director",
    fitnessLevel: "intermediate",
    goals: "Maintain fitness during pregnancy, prepare body for labor, manage weight gain",
    medicalHistory:
      "24 weeks pregnant, second trimester. No complications. Previously active — ran 3x/week and did yoga. Doctor has cleared her for exercise.",
    assessmentFindings: {
      overheadSquat: [
        "Mild forward lean (expected with pregnancy center of gravity shift)",
        "Slight knee valgus",
      ],
      posturalObservations: [
        "Increased lumbar lordosis",
        "Widened stance for balance",
        "Mild upper crossed posture",
      ],
      movementCompensations: [
        "Decreased core stability due to abdominal stretch",
        "Hip adductor tightness",
        "Slight lateral trunk lean during single-leg movements",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Pregnant client should train in Phase 1 (Stabilization Endurance) with prenatal modifications. Focus on stabilization, pelvic floor engagement, and controlled movements. Avoid supine exercises after first trimester, heavy Valsalva, and high-impact activities. Keep heart rate moderate per ACOG guidelines.",
    difficulty: "intermediate",
  },
  {
    id: 4,
    name: "David Thompson",
    age: 38,
    gender: "Male",
    occupation: "Accountant",
    fitnessLevel: "sedentary",
    goals: "Lose 60 lbs, lower blood pressure, build basic strength",
    medicalHistory:
      "Obese (BMI 38). Pre-hypertension (138/88). Prediabetic (A1C 6.2%). No prior exercise program. Family history of heart disease.",
    assessmentFindings: {
      overheadSquat: [
        "Excessive forward lean",
        "Feet turn out",
        "Knees move inward",
        "Cannot raise arms overhead — arms fall forward significantly",
      ],
      posturalObservations: [
        "Rounded shoulders",
        "Protracted scapulae",
        "Anterior pelvic tilt",
        "Pronated feet",
      ],
      movementCompensations: [
        "Cannot perform single-leg squat — loses balance immediately",
        "Significant hip flexor and calf tightness",
        "Very limited thoracic spine mobility",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Obese, sedentary client with multiple cardiometabolic risk factors and severe movement compensations. Must begin with Phase 1 (Stabilization Endurance). Use circuit-style training with short rest for caloric expenditure. Monitor blood pressure. Avoid overhead pressing initially. Progress volume before intensity.",
    difficulty: "beginner",
  },
  {
    id: 5,
    name: "Tyler Washington",
    age: 16,
    gender: "Male",
    occupation: "High school sophomore — plays basketball and runs track",
    fitnessLevel: "intermediate",
    goals: "Increase vertical jump, get faster for basketball, build overall athleticism",
    medicalHistory:
      "No injuries. Growth plates still open. Has been doing bodyweight exercises and team conditioning for 2 years.",
    assessmentFindings: {
      overheadSquat: [
        "Slight knee valgus on descent",
        "Mild asymmetric weight shift to left",
      ],
      posturalObservations: [
        "Generally good posture",
        "Slight forward head from phone use",
      ],
      movementCompensations: [
        "Mild lateral trunk lean on single-leg squat (right side)",
        "Slight hip drop during single-leg movements",
        "Landing mechanics need improvement — knees collapse on jump landing",
      ],
    },
    correctPhase: 2,
    phaseRationale:
      "Youth athlete with 2 years of training base and minor compensations. Start in Phase 2 (Strength Endurance) to build muscular endurance and improve landing mechanics before introducing power training. Address knee valgus during landing. Avoid maximal loading due to open growth plates. Can progress to Phase 5 (Power) once movement quality is solid.",
    difficulty: "intermediate",
  },
  {
    id: 6,
    name: "Lisa Nakamura",
    age: 34,
    gender: "Female",
    occupation: "Software engineer — marathon runner (5 marathons completed)",
    fitnessLevel: "advanced",
    goals: "Qualify for Boston Marathon (sub 3:35), reduce recurring IT band issues, improve running economy",
    medicalHistory:
      "History of IT band syndrome (right side). Mild plantar fasciitis 1 year ago (resolved). No surgeries.",
    assessmentFindings: {
      overheadSquat: [
        "Feet turn out slightly",
        "Knees track over toes well",
        "Mild forward lean",
      ],
      posturalObservations: [
        "Slight anterior pelvic tilt",
        "Mild genu varum (bow-legged)",
      ],
      movementCompensations: [
        "Hip drop on right side during single-leg stance (Trendelenburg sign)",
        "Limited hip internal rotation bilaterally",
        "TFL dominance over gluteus medius during hip abduction",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Despite being an advanced runner, this client has recurring overuse injuries indicating underlying muscle imbalances. Start in Phase 1 (Stabilization Endurance) to address hip stability, correct TFL/IT band dominance, and strengthen the gluteus medius. Short Phase 1 period (2-3 weeks) before progressing to Phase 2 with running-specific strength work.",
    difficulty: "advanced",
  },
  {
    id: 7,
    name: "James Kowalski",
    age: 28,
    gender: "Male",
    occupation: "Former college football player — ACL reconstruction 6 months ago",
    fitnessLevel: "intermediate",
    goals: "Return to recreational sports, rebuild leg strength, prevent re-injury",
    medicalHistory:
      "Left ACL reconstruction (patellar tendon graft) 6 months ago. Cleared by orthopedic surgeon for full weight-bearing exercise. Completed physical therapy protocol.",
    assessmentFindings: {
      overheadSquat: [
        "Asymmetric weight shift away from surgical leg",
        "Reduced depth on left side",
        "Mild knee valgus on left leg",
      ],
      posturalObservations: [
        "Visible left quadriceps atrophy compared to right",
        "Slight antalgic gait pattern (favoring right leg)",
      ],
      movementCompensations: [
        "Left quad weakness — cannot perform single-leg squat to 60 degrees",
        "Reduced left hip and ankle mobility from deconditioning",
        "Apprehension during lateral movements on left side",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Post-surgical client cleared for exercise but with significant asymmetries and residual compensation patterns. Phase 1 (Stabilization Endurance) to rebuild proprioception, neuromuscular control, and confidence in the surgical leg. Focus on single-leg stabilization progressions. Must correct asymmetries before loading with strength or power training.",
    difficulty: "intermediate",
  },
  {
    id: 8,
    name: "Derek Simmons",
    age: 35,
    gender: "Male",
    occupation: "Gym enthusiast — has been lifting 4x/week for 8 years",
    fitnessLevel: "advanced",
    goals: "Fix shoulder impingement, improve posture, transition to more functional training",
    medicalHistory:
      "Right shoulder impingement diagnosed 3 months ago. No surgery needed per orthopedist. Takes ibuprofen occasionally. History of bench press focus with less posterior chain work.",
    assessmentFindings: {
      overheadSquat: [
        "Arms fall forward significantly",
        "Asymmetric arm position — right arm lower than left",
        "Low back arches excessively",
      ],
      posturalObservations: [
        "Pronounced upper crossed syndrome",
        "Internally rotated shoulders bilaterally (right worse)",
        "Elevated right shoulder",
      ],
      movementCompensations: [
        "Scapular winging during push-up",
        "Upper trap dominance during any overhead movement",
        "Cannot achieve full shoulder flexion without lumbar compensation",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Despite being an experienced lifter, severe upper body imbalances and shoulder impingement require Phase 1 (Stabilization Endurance) corrective approach. Must inhibit overactive pecs, upper traps, and lats while activating lower traps, rhomboids, and rotator cuff. This client may resist Phase 1 intensity — coach the importance of corrective work before resuming heavy training.",
    difficulty: "advanced",
  },
  {
    id: 9,
    name: "Patricia Evans",
    age: 55,
    gender: "Female",
    occupation: "School principal",
    fitnessLevel: "beginner",
    goals: "Manage blood pressure through exercise, lose weight, improve heart health",
    medicalHistory:
      "Hypertension (Stage 1, controlled with medication — lisinopril). Resting BP: 132/84 on meds. BMI 29. No other conditions. Doctor recommends regular exercise.",
    assessmentFindings: {
      overheadSquat: [
        "Moderate forward lean",
        "Arms fall forward",
        "Feet turn out",
      ],
      posturalObservations: [
        "Rounded shoulders",
        "Mild thoracic kyphosis",
        "Pronated feet",
      ],
      movementCompensations: [
        "Limited ankle dorsiflexion",
        "Weak core — cannot hold plank for 15 seconds",
        "Difficulty with balance on single leg",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Beginner client with controlled hypertension. Phase 1 (Stabilization Endurance) is appropriate due to fitness level and medical considerations. Avoid Valsalva maneuver and isometric holds > 10 seconds. Monitor RPE (keep below 7/10). Circuit training format for cardiovascular benefit. Avoid overhead pressing initially to prevent blood pressure spikes.",
    difficulty: "beginner",
  },
  {
    id: 10,
    name: "Aiden Park",
    age: 13,
    gender: "Male",
    occupation: "Middle school student — wants to try out for soccer team",
    fitnessLevel: "beginner",
    goals: "Build coordination, get stronger for soccer tryouts, have fun with exercise",
    medicalHistory:
      "No medical conditions. Growth plates open. No prior structured exercise. Parents signed consent form.",
    assessmentFindings: {
      overheadSquat: [
        "Excessive forward lean",
        "Knees cave inward",
        "Cannot keep arms overhead",
      ],
      posturalObservations: [
        "Forward head posture (gaming/phone use)",
        "Slight thoracic kyphosis",
        "Otherwise normal development",
      ],
      movementCompensations: [
        "Poor hip hinge mechanics",
        "Inconsistent balance",
        "Lacks body awareness during complex movements",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Youth client with no training experience. Phase 1 (Stabilization Endurance) to develop fundamental movement patterns, body awareness, and neuromuscular control. Keep training fun and varied. Use bodyweight and light resistance only. Avoid maximal lifting due to skeletal immaturity. Focus on movement quality over load.",
    difficulty: "beginner",
  },
  {
    id: 11,
    name: "Robert Garcia",
    age: 48,
    gender: "Male",
    occupation: "Sales representative — travels frequently",
    fitnessLevel: "beginner",
    goals: "Control blood sugar, lose belly fat, build a sustainable exercise habit",
    medicalHistory:
      "Type 2 diabetes diagnosed 2 years ago. Currently on metformin. A1C: 7.1%. Peripheral neuropathy in feet (mild). BMI 33.",
    assessmentFindings: {
      overheadSquat: [
        "Excessive forward lean",
        "Arms fall forward",
        "Reduced range of motion overall",
      ],
      posturalObservations: [
        "Protruding abdomen",
        "Rounded shoulders",
        "Mild pronation bilaterally",
      ],
      movementCompensations: [
        "Reduced proprioception in feet due to neuropathy",
        "Weak core stability",
        "Limited hip mobility",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Diabetic client with peripheral neuropathy needs Phase 1 (Stabilization Endurance). Extra attention to foot care and proprioception due to neuropathy. Monitor blood sugar before and after exercise. Avoid barefoot training. Circuit format for glucose management. Schedule sessions consistently to support blood sugar control. Carry fast-acting carbohydrate source.",
    difficulty: "intermediate",
  },
  {
    id: 12,
    name: "Brian Foster",
    age: 33,
    gender: "Male",
    occupation: "Web developer — 10+ hours/day at computer",
    fitnessLevel: "sedentary",
    goals: "Fix neck and shoulder pain, improve posture, start exercising regularly",
    medicalHistory:
      "Chronic neck tension and headaches (2-3x/week). Diagnosed with upper crossed syndrome by chiropractor. No surgeries or major conditions.",
    assessmentFindings: {
      overheadSquat: [
        "Arms fall forward significantly",
        "Excessive forward lean",
        "Head juts forward during squat",
      ],
      posturalObservations: [
        "Pronounced forward head posture",
        "Rounded shoulders",
        "Protracted scapulae",
        "Increased cervical lordosis",
      ],
      movementCompensations: [
        "Upper trapezius and levator scapulae dominance",
        "Weak deep cervical flexors",
        "Scapulae do not retract properly during rowing motion",
        "Pectoralis minor visibly shortened",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Classic upper crossed syndrome presentation. Phase 1 (Stabilization Endurance) with heavy emphasis on corrective exercise. Inhibit: upper traps, levator scapulae, SCM, pec major/minor. Lengthen same muscles via static stretching. Activate: deep cervical flexors, lower traps, rhomboids, serratus anterior. Integrate with cable/band exercises emphasizing scapular retraction and cervical positioning.",
    difficulty: "beginner",
  },
  {
    id: 13,
    name: "Miguel Santos",
    age: 45,
    gender: "Male",
    occupation: "Construction foreman — heavy manual labor daily",
    fitnessLevel: "intermediate",
    goals: "Reduce chronic low back pain, build core strength, prevent work injuries",
    medicalHistory:
      "Chronic low back pain for 5 years. Two episodes of acute spasm requiring time off work. MRI shows mild disc bulge L4-L5. No surgical recommendation. Takes naproxen as needed.",
    assessmentFindings: {
      overheadSquat: [
        "Excessive forward lean",
        "Low back rounds at bottom of squat",
        "Feet turn out",
      ],
      posturalObservations: [
        "Pronounced anterior pelvic tilt",
        "Visible lumbar hyperlordosis",
        "Bilateral pronation",
      ],
      movementCompensations: [
        "Hip flexor tightness restricting hip extension",
        "Weak transverse abdominis — cannot perform drawing-in maneuver properly",
        "Erector spinae dominance over glutes during hip extension",
        "Limited hamstring flexibility",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Client with lower crossed syndrome and chronic LBP. Phase 1 (Stabilization Endurance) to correct pelvic tilt and restore core function. Inhibit: hip flexors, erector spinae, TFL. Lengthen: hip flexors, lats, erector spinae. Activate: glutes, TVA, internal obliques. Avoid heavy axial loading initially. Progress with drawing-in maneuver during all exercises.",
    difficulty: "intermediate",
  },
  {
    id: 14,
    name: "Jake Morrison",
    age: 30,
    gender: "Male",
    occupation: "Firefighter — needs to pass annual physical fitness test",
    fitnessLevel: "intermediate",
    goals: "Improve occupational fitness, increase strength-to-weight ratio, better endurance in gear",
    medicalHistory:
      "No major conditions. History of mild rotator cuff strain (resolved). Exercises 3x/week — mostly running and basic weight machines.",
    assessmentFindings: {
      overheadSquat: [
        "Good depth and form overall",
        "Slight arms-fall-forward",
        "Mild asymmetric weight shift",
      ],
      posturalObservations: [
        "Slight forward head posture",
        "Mild rounded shoulders",
        "Otherwise good structural alignment",
      ],
      movementCompensations: [
        "Mild scapular winging on push-up (left side)",
        "Slight hip rotation during pushing movements",
        "Good lower body mechanics overall",
      ],
    },
    correctPhase: 2,
    phaseRationale:
      "Active client with established fitness base and only minor compensations. Phase 2 (Strength Endurance) with superset format (stabilization exercise + strength exercise) to build occupational fitness. Short Phase 1 corrective work for scapular stabilizers can be incorporated into warm-up. Functional exercises mimicking occupational demands: carries, drags, climbs.",
    difficulty: "intermediate",
  },
  {
    id: 15,
    name: "Amanda Lewis",
    age: 29,
    gender: "Female",
    occupation: "Stay-at-home mom — baby is 4 months old",
    fitnessLevel: "beginner",
    goals: "Rebuild core strength, lose baby weight, regain pre-pregnancy fitness",
    medicalHistory:
      "Vaginal delivery 4 months ago (uncomplicated). Mild diastasis recti (2-finger width). Cleared for exercise by OB-GYN at 8-week checkup. Was moderately active before pregnancy.",
    assessmentFindings: {
      overheadSquat: [
        "Moderate forward lean",
        "Mild knee valgus",
        "Arms fall forward slightly",
      ],
      posturalObservations: [
        "Increased lumbar lordosis (residual from pregnancy)",
        "Rounded shoulders (from breastfeeding posture)",
        "Mild upper crossed pattern",
      ],
      movementCompensations: [
        "Weak core — doming visible during crunch attempt",
        "Hip flexor tightness",
        "Reduced pelvic floor activation awareness",
        "Difficulty with single-leg balance",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Postpartum client with diastasis recti. Phase 1 (Stabilization Endurance) with focus on rebuilding core from the inside out. Begin with diaphragmatic breathing, pelvic floor engagement, and TVA activation (drawing-in maneuver). Avoid traditional crunches/sit-ups which worsen diastasis. Progress to integrated stabilization exercises. Address breastfeeding posture with upper back strengthening.",
    difficulty: "intermediate",
  },
  {
    id: 16,
    name: "Frank DeLuca",
    age: 68,
    gender: "Male",
    occupation: "Retired accountant",
    fitnessLevel: "beginner",
    goals: "Regain mobility after surgery, walk without a limp, return to golfing",
    medicalHistory:
      "Right total knee replacement 4 months ago. Completed outpatient physical therapy. Mild osteoarthritis in left knee. Mild hypertension (controlled). Takes aspirin and blood pressure medication.",
    assessmentFindings: {
      overheadSquat: [
        "Modified assessment — limited squat depth due to knee replacement",
        "Compensatory lean away from right leg",
        "Feet turn out bilaterally",
      ],
      posturalObservations: [
        "Antalgic gait — shortened stride on right side",
        "Slight lateral trunk lean during walking",
        "Mild thoracic kyphosis",
      ],
      movementCompensations: [
        "Right quadriceps weakness (atrophy visible)",
        "Limited right knee flexion ROM (95 degrees)",
        "Reduced balance — cannot single-leg stand > 8 seconds on right",
        "Compensatory hip hiking during gait",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Post-total knee replacement client. Phase 1 (Stabilization Endurance) to rebuild strength and proprioception around the prosthetic joint. Follow orthopedic surgeon guidelines for ROM limitations. Focus on quad strengthening, balance, gait normalization. Avoid deep squats, high-impact activities, and excessive knee flexion beyond cleared ROM. Slowly progress ROM as tolerated.",
    difficulty: "advanced",
  },
  {
    id: 17,
    name: "Marcus Williams",
    age: 26,
    gender: "Male",
    occupation: "Competitive bodybuilder transitioning to functional training",
    fitnessLevel: "advanced",
    goals: "Improve athletic performance, increase mobility, train for obstacle course racing",
    medicalHistory:
      "No major injuries. History of bodybuilding for 6 years. Previous PED use (discontinued 1 year ago). Bloodwork now normal. Very strong but inflexible.",
    assessmentFindings: {
      overheadSquat: [
        "Cannot achieve full overhead position — lats and shoulders too tight",
        "Good squat depth with arms in front",
        "Feet turn out 15+ degrees",
      ],
      posturalObservations: [
        "Hypertrophied upper traps and pecs pulling shoulders forward",
        "Internally rotated shoulders",
        "Limited thoracic extension",
      ],
      movementCompensations: [
        "Cannot perform a bodyweight pull-up with full ROM (lat tightness limits shoulder flexion)",
        "Poor single-leg stability despite bilateral strength",
        "Excessive lumbar extension during overhead movements",
        "Very limited hip internal rotation",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Despite high strength levels, this client has significant mobility restrictions and poor stabilization. Phase 1 (Stabilization Endurance) to build unilateral stability, restore mobility, and develop movement quality. This client will need coaching on why stabilization matters and why heavy loading must wait. Emphasize single-leg and single-arm variations. Heavy corrective flexibility work needed.",
    difficulty: "advanced",
  },
  {
    id: 18,
    name: "Sandra Novak",
    age: 50,
    gender: "Female",
    occupation: "Real estate agent — on feet and driving all day",
    fitnessLevel: "beginner",
    goals: "Reduce shoulder pain, improve overhead mobility, get back to swimming",
    medicalHistory:
      "Chronic left shoulder impingement and biceps tendinopathy. Completed 8 weeks of PT with partial improvement. No surgical recommendation. Takes OTC anti-inflammatories.",
    assessmentFindings: {
      overheadSquat: [
        "Left arm cannot reach overhead position",
        "Right arm compensates by overreaching",
        "Moderate forward lean",
      ],
      posturalObservations: [
        "Left shoulder sits lower and more forward than right",
        "Rounded shoulders bilaterally",
        "Mild thoracic kyphosis",
      ],
      movementCompensations: [
        "Left scapula does not upwardly rotate properly",
        "Painful arc between 70-120 degrees of shoulder abduction (left)",
        "Compensatory trunk lean when reaching overhead with left arm",
        "Upper trap dominance on left side",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Client with chronic shoulder pathology. Phase 1 (Stabilization Endurance) with corrective exercise focus on shoulder complex. Inhibit: upper traps, pec minor, latissimus dorsi (left side emphasis). Activate: lower traps, serratus anterior, rotator cuff (infraspinatus, teres minor). Avoid movements in painful arc. Progress ROM gradually. Coordinate with PT if symptoms worsen.",
    difficulty: "intermediate",
  },
  {
    id: 19,
    name: "Richard Palmer",
    age: 52,
    gender: "Male",
    occupation: "Avid golfer — plays 3-4 rounds per week",
    fitnessLevel: "intermediate",
    goals: "Add 15 yards to drive distance, improve rotational power, prevent golf-related injuries",
    medicalHistory:
      "Mild golfer's elbow (medial epicondylitis, right side). Occasional low back stiffness after playing. Walks the course — good baseline cardio. Has been doing machine-based gym work 2x/week for 3 years.",
    assessmentFindings: {
      overheadSquat: [
        "Slight forward lean",
        "Mild asymmetric rotation through torso",
        "Good overall form",
      ],
      posturalObservations: [
        "Slight thoracic rotation to the right (golf adaptation)",
        "Mild anterior pelvic tilt",
        "Generally good posture",
      ],
      movementCompensations: [
        "Limited thoracic rotation to the left (non-dominant direction)",
        "Mild hip mobility asymmetry — right tighter than left",
        "Core rotational strength deficit vs. extension strength",
        "Grip strength imbalance (right > left)",
      ],
    },
    correctPhase: 5,
    phaseRationale:
      "Active client with established training base and sport-specific goals. Minimal compensations that can be addressed in warm-up corrective work. Phase 5 (Power) to develop rotational power for golf performance. Use medicine ball rotational throws, cable chops/lifts, and plyometric movements. Address thoracic mobility asymmetry in warm-up. Periodize around golf season.",
    difficulty: "advanced",
  },
  {
    id: 20,
    name: "Chris Bennett",
    age: 40,
    gender: "Male",
    occupation: "Weekend warrior — plays flag football and basketball recreationally",
    fitnessLevel: "intermediate",
    goals: "Stop getting injured every season, improve agility, maintain fitness year-round",
    medicalHistory:
      "History of recurring hamstring strains (3 in past 2 years). Mild ankle sprain last year (left). Exercises inconsistently — bursts of activity followed by weeks off.",
    assessmentFindings: {
      overheadSquat: [
        "Good depth",
        "Mild knee valgus",
        "Slight asymmetric shift to right",
      ],
      posturalObservations: [
        "Generally good posture",
        "Mild anterior pelvic tilt",
        "Slight internal rotation of right foot",
      ],
      movementCompensations: [
        "Hamstring tightness bilaterally (right worse)",
        "Quad-dominant movement pattern — poor posterior chain activation",
        "Ankle dorsiflexion limited on left (post-sprain)",
        "Reduced deceleration control during change of direction",
      ],
    },
    correctPhase: 2,
    phaseRationale:
      "Client with recurring injuries from inconsistent training and poor deceleration mechanics. Phase 2 (Strength Endurance) to build injury resilience. Superset format pairing stabilization exercises with strength movements. Emphasize eccentric hamstring training, ankle proprioception on left side, and deceleration drills. Must establish consistent training habit to prevent the boom-bust injury cycle.",
    difficulty: "intermediate",
  },
  {
    id: 21,
    name: "Jennifer Wu",
    age: 36,
    gender: "Female",
    occupation: "Competitive CrossFit athlete for 4 years",
    fitnessLevel: "advanced",
    goals: "Peak for upcoming competition, improve Olympic lift numbers, enhance work capacity",
    medicalHistory:
      "No current injuries. History of minor low back strain 1 year ago (resolved). Excellent cardiovascular fitness. Training 5-6 days/week.",
    assessmentFindings: {
      overheadSquat: [
        "Excellent depth and form",
        "Full overhead position maintained",
        "No visible compensations",
      ],
      posturalObservations: [
        "Good spinal alignment",
        "Well-balanced musculature",
        "No significant asymmetries",
      ],
      movementCompensations: [
        "Minor hip shift during very heavy loads only",
        "Slight grip strength discrepancy under fatigue",
        "Good overall movement quality",
      ],
    },
    correctPhase: 5,
    phaseRationale:
      "Advanced athlete with excellent movement quality and well-established training base. Phase 5 (Power) for competition peaking. Program should include Olympic lift progressions, plyometrics, and sport-specific metabolic conditioning. Periodize with deload weeks to manage cumulative training stress. Minor corrective work in warm-up for hip shift under load.",
    difficulty: "advanced",
  },
  {
    id: 22,
    name: "Tom Bradley",
    age: 58,
    gender: "Male",
    occupation: "Attorney — high stress job, minimal physical activity",
    fitnessLevel: "beginner",
    goals: "General fitness after health scare, doctor told him to exercise, wants to play with grandkids",
    medicalHistory:
      "Recent cardiac event (mild MI, 3 months ago). Completed cardiac rehabilitation program. Cleared for independent exercise by cardiologist. On statin, beta-blocker, and aspirin. Resting HR: 58 (beta-blocker effect).",
    assessmentFindings: {
      overheadSquat: [
        "Significant forward lean",
        "Arms fall forward",
        "Very limited depth",
      ],
      posturalObservations: [
        "Rounded shoulders",
        "Forward head posture",
        "General deconditioning visible",
      ],
      movementCompensations: [
        "Very poor balance — cannot single-leg stand > 3 seconds",
        "Generalized weakness throughout",
        "Very limited hip and ankle mobility",
      ],
    },
    correctPhase: 1,
    phaseRationale:
      "Post-cardiac event client cleared from rehab. Phase 1 (Stabilization Endurance) with strict cardiorespiratory monitoring. Beta-blocker makes heart rate unreliable for intensity monitoring — use RPE (talk test) instead. Keep intensity low-moderate. Avoid Valsalva. Progress very gradually. Have emergency action plan in place. Coordinate programming with cardiologist recommendations.",
    difficulty: "advanced",
  },
];

// Common assessment findings for the custom client builder
export const commonCompensations = {
  overheadSquat: [
    { id: "forward-lean", label: "Excessive forward lean", overactive: ["Soleus", "Gastrocnemius", "Hip flexors"], underactive: ["Anterior tibialis", "Gluteus maximus", "Erector spinae"] },
    { id: "arms-fall-forward", label: "Arms fall forward", overactive: ["Latissimus dorsi", "Pectoralis major/minor", "Teres major"], underactive: ["Mid/lower trapezius", "Rhomboids", "Rotator cuff"] },
    { id: "knee-valgus", label: "Knees move inward (valgus)", overactive: ["Adductors", "TFL/IT band", "Biceps femoris (short head)"], underactive: ["Gluteus medius/maximus", "VMO", "Anterior/posterior tibialis"] },
    { id: "feet-turn-out", label: "Feet turn out", overactive: ["Soleus", "Lateral gastrocnemius", "Biceps femoris (short head)"], underactive: ["Medial gastrocnemius", "Medial hamstring", "Gracilis", "Sartorius", "Popliteus"] },
    { id: "feet-flatten", label: "Feet flatten (pronation)", overactive: ["Peroneals", "Lateral gastrocnemius", "Biceps femoris (short head)"], underactive: ["Anterior tibialis", "Posterior tibialis", "Gluteus medius"] },
    { id: "low-back-arch", label: "Excessive low back arch", overactive: ["Hip flexors", "Erector spinae", "Latissimus dorsi"], underactive: ["Gluteus maximus", "Hamstrings", "Intrinsic core stabilizers"] },
    { id: "head-forward", label: "Head migrates forward", overactive: ["Upper trapezius", "Levator scapulae", "SCM"], underactive: ["Deep cervical flexors", "Lower trapezius"] },
  ],
  posturalObservations: [
    { id: "forward-head", label: "Forward head posture" },
    { id: "rounded-shoulders", label: "Rounded shoulders" },
    { id: "anterior-pelvic-tilt", label: "Anterior pelvic tilt" },
    { id: "posterior-pelvic-tilt", label: "Posterior pelvic tilt" },
    { id: "thoracic-kyphosis", label: "Increased thoracic kyphosis" },
    { id: "lumbar-lordosis", label: "Excessive lumbar lordosis" },
    { id: "pronated-feet", label: "Pronated feet" },
    { id: "genu-valgum", label: "Genu valgum (knock knees)" },
    { id: "genu-varum", label: "Genu varum (bow legs)" },
    { id: "protracted-scapulae", label: "Protracted scapulae" },
    { id: "elevated-shoulder", label: "Elevated shoulder (unilateral)" },
    { id: "lateral-shift", label: "Lateral pelvic shift" },
  ],
};

// OPT Model phase data for the simulator
export const optPhases = [
  {
    phase: 1,
    name: "Stabilization Endurance",
    description: "Build muscular endurance and stability through proprioceptively enriched activities with controlled, unstable exercises.",
    acuteVariables: { sets: "1-3", reps: "12-20", intensity: "50-70% 1RM", tempo: "4/2/1 (slow)", rest: "0-90 seconds", frequency: "2-4x/week" },
    exerciseTypes: ["Stability ball exercises", "Single-leg movements", "Balance progressions", "Core stabilization", "Light resistance with slow tempo"],
  },
  {
    phase: 2,
    name: "Strength Endurance",
    description: "Increase stabilization endurance and prime mover strength via superset format (stabilization + strength exercise).",
    acuteVariables: { sets: "2-4", reps: "8-12", intensity: "70-80% 1RM", tempo: "2/0/2 (moderate)", rest: "0-60 seconds", frequency: "3-4x/week" },
    exerciseTypes: ["Supersets (stability + strength)", "Moderate loads", "Compound movements", "Controlled tempo", "Circuit-style options"],
  },
  {
    phase: 3,
    name: "Muscular Development (Hypertrophy)",
    description: "Achieve optimal levels of muscular hypertrophy through high volume, moderate-to-high loads.",
    acuteVariables: { sets: "3-5", reps: "6-12", intensity: "75-85% 1RM", tempo: "2/0/2 (moderate)", rest: "0-60 seconds", frequency: "4-6x/week" },
    exerciseTypes: ["Moderate to heavy loads", "Higher volume", "Isolation and compound", "Controlled tempo", "Split routines common"],
  },
  {
    phase: 4,
    name: "Maximal Strength",
    description: "Increase maximal prime mover strength by lifting heavy loads with longer rest periods.",
    acuteVariables: { sets: "4-6", reps: "1-5", intensity: "85-100% 1RM", tempo: "X/X/X (explosive or controlled)", rest: "3-5 minutes", frequency: "3-5x/week" },
    exerciseTypes: ["Heavy compound lifts", "Low rep, high load", "Full recovery between sets", "Barbell-dominant", "Strength peaking protocols"],
  },
  {
    phase: 5,
    name: "Power",
    description: "Develop speed and power through superset of strength and power exercises. Enhance rate of force production.",
    acuteVariables: { sets: "3-5", reps: "1-5 (strength) / 8-10 (power)", intensity: "85-100% (strength) / 30-45% or BW (power)", tempo: "X/X/X (explosive)", rest: "3-5 minutes", frequency: "3-5x/week" },
    exerciseTypes: ["Superset (strength + power)", "Plyometrics", "Olympic lifts", "Medicine ball throws", "Explosive movements"],
  },
];

// Exercise database for exercise selection step
export const exerciseDatabase = [
  // Phase 1 appropriate
  { name: "Stability Ball Squat", phase: [1], category: "Lower Body", description: "Squat with stability ball against wall for proprioceptive demand" },
  { name: "Single-Leg Balance Reach", phase: [1], category: "Balance", description: "Single-leg stance with multi-directional reaches" },
  { name: "Floor Bridge", phase: [1, 2], category: "Lower Body", description: "Glute bridge on floor emphasizing hip extension and core control" },
  { name: "Prone Cobra", phase: [1], category: "Core/Back", description: "Prone position with scapular retraction and external rotation" },
  { name: "Side Plank", phase: [1, 2], category: "Core", description: "Lateral core stabilization in side-lying position" },
  { name: "Ball Dumbbell Chest Press", phase: [1], category: "Upper Body Push", description: "DB chest press on stability ball for core engagement" },
  { name: "Single-Leg Romanian Deadlift", phase: [1, 2], category: "Lower Body", description: "Unilateral hip hinge with balance demand" },
  { name: "Standing Cable Row", phase: [1, 2], category: "Upper Body Pull", description: "Cable row with stance variation for stability" },

  // Phase 2 appropriate
  { name: "Step-Up to Balance with Curl", phase: [2], category: "Lower Body + Arms", description: "Step-up with balance hold at top paired with bicep curl" },
  { name: "Squat to Cable Row", phase: [2], category: "Total Body", description: "Combination movement pairing squat with rowing pattern" },
  { name: "Lunge to Overhead Press", phase: [2], category: "Total Body", description: "Forward lunge with DB overhead press at bottom position" },
  { name: "Bench Press + Stability Ball Push-Up Superset", phase: [2], category: "Upper Push", description: "Superset format: bench press followed by unstable push-up" },

  // Phase 3 appropriate
  { name: "Barbell Back Squat", phase: [3, 4], category: "Lower Body", description: "Traditional back squat with barbell for hypertrophy/strength" },
  { name: "Dumbbell Bench Press", phase: [2, 3], category: "Upper Body Push", description: "Flat bench DB press for chest development" },
  { name: "Lat Pulldown", phase: [2, 3], category: "Upper Body Pull", description: "Cable lat pulldown for back hypertrophy" },
  { name: "Leg Press", phase: [3, 4], category: "Lower Body", description: "Machine-based lower body pressing for load progression" },
  { name: "Seated Shoulder Press", phase: [3], category: "Upper Body Push", description: "Seated DB or barbell overhead press" },
  { name: "Romanian Deadlift", phase: [3, 4], category: "Lower Body", description: "Bilateral hip hinge with moderate to heavy load" },

  // Phase 4 appropriate
  { name: "Barbell Deadlift", phase: [4], category: "Total Body", description: "Heavy conventional or sumo deadlift for maximal strength" },
  { name: "Back Squat (Heavy)", phase: [4], category: "Lower Body", description: "Heavy back squat for 1-5 rep max effort" },
  { name: "Barbell Bench Press (Heavy)", phase: [4], category: "Upper Body Push", description: "Heavy barbell bench press for strength" },
  { name: "Weighted Pull-Up", phase: [4], category: "Upper Body Pull", description: "Pull-ups with added load for maximal upper back strength" },

  // Phase 5 appropriate
  { name: "Box Jump", phase: [5], category: "Power - Lower", description: "Plyometric jump onto box for lower body power" },
  { name: "Medicine Ball Chest Pass", phase: [5], category: "Power - Upper", description: "Explosive chest pass for upper body power" },
  { name: "Squat Jump", phase: [5], category: "Power - Lower", description: "Loaded or bodyweight jump squat for reactive power" },
  { name: "Rotational Medicine Ball Throw", phase: [5], category: "Power - Rotational", description: "Rotational throw for transverse plane power" },
  { name: "Power Clean", phase: [5], category: "Power - Total Body", description: "Olympic lift variation for total body power development" },
  { name: "Ice Skater Hops", phase: [5], category: "Power - Lower", description: "Lateral plyometric hops for frontal plane power" },
];
