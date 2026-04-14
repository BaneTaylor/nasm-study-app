export type ChapterData = {
  number: number;
  title: string;
  summary: string;
  keyTerms: { term: string; definition: string }[];
  keyConcepts: string[];
};

export const chapters: ChapterData[] = [
  {
    number: 1,
    title: "The Scientific Rationale for Integrated Training",
    summary:
      "This chapter introduces the evidence-based approach to personal training and the NASM Optimum Performance Training (OPT) model. It covers the importance of using scientific research to guide program design, the evolution of the fitness industry from a purely aesthetic focus to one centered on functional movement and injury prevention. The OPT model is a systematic, progressive training system divided into three main levels: Stabilization, Strength, and Power, with five total phases. This model allows trainers to design safe and effective programs for any fitness level by progressing clients through increasingly challenging training adaptations.",
    keyTerms: [
      {
        term: "Optimum Performance Training (OPT) Model",
        definition:
          "NASM's systematic approach to program design that uses three levels (Stabilization, Strength, Power) and five phases to progress clients safely and effectively.",
      },
      {
        term: "Evidence-based practice",
        definition:
          "Using current best research evidence, combined with clinical expertise and client values, to guide training decisions.",
      },
      {
        term: "Integrated training",
        definition:
          "A comprehensive approach that incorporates all forms of training (flexibility, cardiorespiratory, core, balance, plyometric, SAQ, and resistance) into a progressive system.",
      },
      {
        term: "Periodization",
        definition:
          "The systematic planning of athletic or physical training, involving progressive cycling of various aspects of a training program during a specific period.",
      },
    ],
    keyConcepts: [
      "The OPT model has 5 phases: Stabilization Endurance, Strength Endurance, Hypertrophy, Maximal Strength, and Power.",
      "Integrated training addresses all components of the kinetic chain to improve overall movement quality.",
      "Evidence-based practice ensures training programs are grounded in scientific research rather than trends.",
      "The OPT model is designed to systematically progress any client regardless of their starting fitness level.",
      "Proper program design reduces injury risk while maximizing training adaptations.",
    ],
  },
  {
    number: 2,
    title: "Basic Exercise Science",
    summary:
      "This chapter covers the foundational sciences of human movement, including the muscular, skeletal, and nervous systems. It explains how muscles produce force, the types of muscle fibers (Type I slow-twitch and Type II fast-twitch), and the sliding filament theory of muscle contraction. The skeletal system provides the structural framework, and joints are classified by their structure and movement capabilities. The nervous system controls all movement through motor neurons and sensory feedback. Understanding these systems is critical for designing programs that target specific adaptations.",
    keyTerms: [
      {
        term: "Motor unit",
        definition:
          "A motor neuron and all the muscle fibers it innervates. The functional unit of the neuromuscular system.",
      },
      {
        term: "Type I muscle fibers",
        definition:
          "Slow-twitch fibers that are smaller, produce less force, but are highly resistant to fatigue. Used for endurance activities.",
      },
      {
        term: "Type II muscle fibers",
        definition:
          "Fast-twitch fibers that are larger, produce more force, but fatigue quickly. Subdivided into Type IIa and Type IIx.",
      },
      {
        term: "Sliding filament theory",
        definition:
          "The theory that muscle contraction occurs when actin and myosin filaments slide past each other, shortening the sarcomere.",
      },
      {
        term: "Neuromuscular junction",
        definition:
          "The site where a motor neuron communicates with a muscle fiber to initiate contraction via acetylcholine release.",
      },
    ],
    keyConcepts: [
      "Muscles produce force through concentric (shortening), eccentric (lengthening), and isometric (no change in length) contractions.",
      "Type I fibers are recruited first during low-intensity activities; Type II fibers are recruited as intensity increases (size principle).",
      "The skeletal system includes 206 bones and provides leverage, protection, and mineral storage.",
      "Joints are classified as synovial (freely movable), amphiarthrodial (slightly movable), or synarthrodial (immovable).",
      "The nervous system is divided into the central nervous system (brain and spinal cord) and peripheral nervous system.",
    ],
  },
  {
    number: 3,
    title: "The Cardiorespiratory System",
    summary:
      "This chapter examines the cardiovascular and respiratory systems, including the structure and function of the heart, blood vessels, and lungs. It covers how the body delivers oxygen to working muscles and removes metabolic waste during exercise. Key topics include cardiac output, stroke volume, heart rate, blood pressure regulation, and the oxygen transport system. The chapter also discusses cardiorespiratory training zones and how to prescribe appropriate intensities using methods like heart rate reserve (Karvonen formula), VO2 max, and ratings of perceived exertion.",
    keyTerms: [
      {
        term: "Cardiac output",
        definition:
          "The volume of blood pumped by the heart per minute, calculated as heart rate multiplied by stroke volume (Q = HR x SV).",
      },
      {
        term: "Stroke volume",
        definition:
          "The amount of blood pumped out of the left ventricle with each heartbeat.",
      },
      {
        term: "VO2 max",
        definition:
          "The maximum rate of oxygen consumption during maximal exercise; considered the gold standard measure of cardiorespiratory fitness.",
      },
      {
        term: "Karvonen formula",
        definition:
          "A method to calculate target heart rate using heart rate reserve: THR = ((HRmax - HRrest) x %intensity) + HRrest.",
      },
      {
        term: "Ventilatory threshold",
        definition:
          "The point during exercise at which ventilation increases disproportionately to oxygen consumption, indicating a shift toward anaerobic metabolism.",
      },
    ],
    keyConcepts: [
      "The heart has four chambers: two atria (receiving) and two ventricles (pumping).",
      "Blood pressure is regulated by cardiac output, peripheral resistance, and blood volume.",
      "VO2 max is the best indicator of cardiorespiratory fitness and is measured in mL/kg/min.",
      "The three energy systems are the ATP-PC system (immediate), glycolysis (short-term), and oxidative system (long-term).",
      "Heart rate training zones (Zones 1-3) help prescribe appropriate cardiorespiratory training intensities.",
    ],
  },
  {
    number: 4,
    title: "Exercise Metabolism and Bioenergetics",
    summary:
      "This chapter explains how the body converts food into usable energy (ATP) for exercise. It covers the three primary energy systems: the phosphagen (ATP-PC) system for immediate high-intensity efforts, anaerobic glycolysis for short-duration intense activities, and the oxidative (aerobic) system for sustained lower-intensity exercise. The chapter details the metabolic pathways, substrate utilization (carbohydrates, fats, proteins), and how training intensity and duration determine which energy system predominates. Understanding bioenergetics helps trainers design programs that target specific energy systems.",
    keyTerms: [
      {
        term: "Adenosine triphosphate (ATP)",
        definition:
          "The primary energy currency of cells; provides immediate energy for all cellular functions including muscle contraction.",
      },
      {
        term: "ATP-PC system (phosphagen system)",
        definition:
          "The energy system that provides immediate ATP from stored creatine phosphate for high-intensity efforts lasting up to about 10-15 seconds.",
      },
      {
        term: "Glycolysis",
        definition:
          "The metabolic pathway that breaks down glucose into pyruvate, producing ATP without requiring oxygen (anaerobic) for activities lasting 30 seconds to 2 minutes.",
      },
      {
        term: "Oxidative system",
        definition:
          "The aerobic energy system that produces large amounts of ATP through the Krebs cycle and electron transport chain using carbohydrates, fats, and proteins.",
      },
      {
        term: "Excess post-exercise oxygen consumption (EPOC)",
        definition:
          "The elevated oxygen consumption that occurs after exercise as the body restores itself to pre-exercise conditions. Also known as the 'afterburn effect.'",
      },
    ],
    keyConcepts: [
      "All three energy systems are always active, but the predominant system depends on exercise intensity and duration.",
      "The ATP-PC system is dominant for explosive movements lasting 0-15 seconds.",
      "Anaerobic glycolysis dominates for intense activities lasting 30 seconds to 2 minutes and produces lactate.",
      "The oxidative system is the primary energy source for activities lasting longer than 2-3 minutes.",
      "Fats provide the most ATP per molecule but require oxygen and are metabolized more slowly than carbohydrates.",
      "EPOC is greater following high-intensity exercise, contributing to post-workout calorie expenditure.",
    ],
  },
  {
    number: 5,
    title: "Human Movement Science",
    summary:
      "This chapter covers biomechanics and functional anatomy as they relate to human movement. It introduces the kinetic chain concept, which views the body as an interconnected system where the nervous, muscular, and skeletal systems work together. Key topics include muscle actions (agonists, antagonists, synergists, stabilizers), types of motion (sagittal, frontal, transverse planes), length-tension relationships, and force-couple relationships. The chapter emphasizes that dysfunction in one area of the kinetic chain creates compensations elsewhere, which is foundational to the NASM corrective exercise approach.",
    keyTerms: [
      {
        term: "Kinetic chain",
        definition:
          "The concept that the human body is a linked system of interdependent segments (nervous, muscular, skeletal), where movement at one joint affects movement at other joints.",
      },
      {
        term: "Agonist",
        definition:
          "The prime mover; the muscle primarily responsible for producing a specific movement.",
      },
      {
        term: "Antagonist",
        definition:
          "The muscle that opposes the action of the agonist, typically on the opposite side of the joint.",
      },
      {
        term: "Synergist",
        definition:
          "A muscle that assists the agonist in producing a desired movement.",
      },
      {
        term: "Force-couple",
        definition:
          "Muscles working together to produce movement around a joint. For example, the muscles of the core working together to stabilize the lumbo-pelvic-hip complex.",
      },
      {
        term: "Length-tension relationship",
        definition:
          "The resting length of a muscle and its ability to produce force. A muscle produces maximum force at its optimal resting length.",
      },
    ],
    keyConcepts: [
      "The three planes of motion are sagittal (flexion/extension), frontal (abduction/adduction), and transverse (rotation).",
      "Muscle imbalances alter the length-tension and force-couple relationships, leading to dysfunctional movement.",
      "The kinetic chain operates as an integrated system - dysfunction at one link affects the entire chain.",
      "Arthrokinematics refers to joint surface movements (roll, slide, spin) during motion.",
      "Proper joint mechanics require appropriate mobility and stability throughout the kinetic chain.",
    ],
  },
  {
    number: 6,
    title: "Fitness Assessment",
    summary:
      "This chapter details the comprehensive assessment process used to identify movement compensations, evaluate fitness levels, and establish baselines. It covers subjective assessments (PAR-Q, health history, lifestyle questionnaires) and objective assessments including body composition testing, cardiorespiratory assessments (YMCA step test, Rockport walk test), and performance assessments (push-up test, Davies test, shark skill test). The overhead squat assessment (OHSA) and single-leg squat assessment are presented as key movement screens to identify kinetic chain dysfunctions.",
    keyTerms: [
      {
        term: "Overhead squat assessment (OHSA)",
        definition:
          "A transitional movement assessment used to evaluate dynamic flexibility, core strength, balance, and overall neuromuscular control.",
      },
      {
        term: "PAR-Q",
        definition:
          "Physical Activity Readiness Questionnaire; a screening tool used to determine if medical clearance is needed before starting an exercise program.",
      },
      {
        term: "Compensation",
        definition:
          "A movement pattern deviation from the ideal, often caused by muscle imbalances or joint dysfunction.",
      },
      {
        term: "Body composition",
        definition:
          "The relative proportions of fat mass and lean body mass. Can be measured using skinfold calipers, bioelectrical impedance, or other methods.",
      },
      {
        term: "Gait assessment",
        definition:
          "Observation of a client's walking pattern to identify potential movement compensations and kinetic chain dysfunction.",
      },
    ],
    keyConcepts: [
      "The overhead squat assessment observes from anterior, lateral, and posterior views to identify compensations at the feet, knees, LPHC, shoulders, and head.",
      "Common OHSA compensations include feet turning out, knees moving inward (valgus), excessive forward lean, and arms falling forward.",
      "Subjective assessments (questionnaires, interviews) should be completed before objective physical assessments.",
      "Body composition assessments include skinfold measurements, bioelectrical impedance, and circumference measurements.",
      "Reassessment should occur every 4 weeks to track progress and adjust programming.",
    ],
  },
  {
    number: 7,
    title: "Flexibility Training Concepts",
    summary:
      "This chapter covers the science and application of flexibility training, including the types of flexibility (static, dynamic, functional), and the three forms of stretching in the OPT model: self-myofascial release (foam rolling), static stretching, and dynamic stretching. It explains the neuromuscular mechanisms behind stretching, including the muscle spindle, Golgi tendon organ, and autogenic and reciprocal inhibition. Flexibility training is integrated into the OPT model at each phase and is essential for correcting muscle imbalances identified during assessments.",
    keyTerms: [
      {
        term: "Self-myofascial release (SMR)",
        definition:
          "A flexibility technique using devices like foam rollers to apply pressure to tight muscles, activating the Golgi tendon organ and reducing muscle tension (autogenic inhibition).",
      },
      {
        term: "Autogenic inhibition",
        definition:
          "The process by which stimulation of the Golgi tendon organ causes the muscle to relax, allowing it to lengthen.",
      },
      {
        term: "Reciprocal inhibition",
        definition:
          "The process by which activation of a muscle on one side of a joint causes the opposing muscle to relax and lengthen.",
      },
      {
        term: "Muscle spindle",
        definition:
          "A sensory receptor within muscle that detects changes in muscle length and rate of length change, triggering the stretch reflex.",
      },
      {
        term: "Golgi tendon organ (GTO)",
        definition:
          "A sensory receptor in the musculotendinous junction that senses changes in muscular tension and triggers autogenic inhibition when stimulated.",
      },
    ],
    keyConcepts: [
      "The OPT model uses corrective flexibility (SMR + static stretching) in Phase 1 to address imbalances.",
      "Active flexibility (SMR + dynamic stretching) is used in Phases 2-4 of the OPT model.",
      "Functional flexibility (SMR + dynamic stretching with integrated movements) is used in Phase 5.",
      "SMR should be applied to overactive muscles for 30-90 seconds per area before stretching.",
      "Static stretches should be held for 30 seconds to activate the GTO and achieve muscle relaxation.",
      "Foam rolling works through the principle of autogenic inhibition via the Golgi tendon organ.",
    ],
  },
  {
    number: 8,
    title: "Cardiorespiratory Fitness Training",
    summary:
      "This chapter provides guidelines for designing cardiorespiratory training programs within the OPT model. It covers the three stages of cardiorespiratory training: Stage I (base training using Zone 1 heart rates), Stage II (fitness improvement using Zones 1 and 2), and Stage III (performance training using all three zones). NASM's stage training system progressively increases intensity through intervals and threshold work. The chapter covers methods to monitor intensity including heart rate, talk test, and RPE, and discusses programming variables such as frequency, intensity, time, type, enjoyment, and overload (FITTE-VP).",
    keyTerms: [
      {
        term: "Stage I cardiorespiratory training",
        definition:
          "Base conditioning using Zone 1 heart rates (65-75% HRmax) to build an aerobic foundation. Appropriate for sedentary or deconditioned clients.",
      },
      {
        term: "Stage II cardiorespiratory training",
        definition:
          "Aerobic efficiency training alternating between Zone 1 and Zone 2 (76-85% HRmax) intensities to improve cardiorespiratory fitness.",
      },
      {
        term: "Stage III cardiorespiratory training",
        definition:
          "Anaerobic training incorporating Zone 3 (86-95% HRmax) intervals for advanced clients seeking peak performance.",
      },
      {
        term: "Rating of perceived exertion (RPE)",
        definition:
          "A subjective measure of exercise intensity based on how hard the individual feels they are working, typically on a scale of 1-10.",
      },
      {
        term: "FITTE-VP",
        definition:
          "Frequency, Intensity, Time, Type, Enjoyment, Volume, and Progression - the variables used to design cardiorespiratory training programs.",
      },
    ],
    keyConcepts: [
      "Zone 1 is 65-75% HRmax (comfortable pace), Zone 2 is 76-85% HRmax (challenging), Zone 3 is 86-95% HRmax (very hard).",
      "Deconditioned clients should begin with Stage I training and progress based on adaptation.",
      "The general recommendation is 150 minutes per week of moderate-intensity or 75 minutes of vigorous-intensity cardiorespiratory exercise.",
      "High-intensity interval training (HIIT) is appropriate for Stage II and III but not for beginners.",
      "The talk test is a simple way to estimate intensity: able to talk comfortably = Zone 1, short sentences = Zone 2, unable to talk = Zone 3.",
    ],
  },
  {
    number: 9,
    title: "Core Training Concepts",
    summary:
      "This chapter covers the anatomy and function of the core, which NASM defines as the lumbo-pelvic-hip complex (LPHC), the thoracic spine, and the cervical spine. The core functions as the center of all movement and is responsible for stabilization, force production, and force reduction. Core training in the OPT model progresses through core stabilization (Phase 1), core strength (Phases 2-4), and core power (Phase 5). Proper core function is essential for maintaining posture, preventing injury, and transmitting forces efficiently through the kinetic chain.",
    keyTerms: [
      {
        term: "Lumbo-pelvic-hip complex (LPHC)",
        definition:
          "The anatomical region comprising the lumbar spine, pelvis, and hip joints. It is the center of the body's kinetic chain and must be stable for efficient movement.",
      },
      {
        term: "Drawing-in maneuver",
        definition:
          "The activation of the deep stabilizing muscles (transverse abdominis, multifidus, pelvic floor) by drawing the navel toward the spine. Used to improve core stabilization.",
      },
      {
        term: "Bracing",
        definition:
          "Co-contraction of the global core muscles (rectus abdominis, external obliques) to provide stability during heavy lifting and high-force activities.",
      },
      {
        term: "Local stabilization system",
        definition:
          "The deep core muscles (transverse abdominis, multifidus, internal obliques, pelvic floor) responsible for intervertebral stability.",
      },
      {
        term: "Global stabilization system",
        definition:
          "Core muscles that attach from the pelvis to the spine (quadratus lumborum, hip adductors, hip abductors) providing stability of the LPHC.",
      },
    ],
    keyConcepts: [
      "Core stabilization exercises (Phase 1) involve little to no movement through the spine and pelvis (e.g., planks, bridges).",
      "Core strength exercises (Phases 2-4) involve more dynamic movements with the full range of motion (e.g., ball crunches, cable rotations).",
      "Core power exercises (Phase 5) involve explosive movements to develop rate of force production (e.g., medicine ball throws).",
      "The drawing-in maneuver should be used during all exercises to activate the local stabilization system.",
      "A weak or dysfunctional core leads to compensatory movement patterns, low back pain, and reduced force output.",
    ],
  },
  {
    number: 10,
    title: "Balance Training Concepts",
    summary:
      "This chapter explains the importance of balance training for all populations, not just older adults or rehabilitation patients. Balance is the ability to maintain the body's center of gravity over its base of support and requires the integration of the visual, vestibular, and somatosensory systems. The OPT model progresses balance training from stabilization balance (Phase 1), to strength balance (Phases 2-4), to power balance (Phase 5). Balance training improves proprioception, joint stability, and neuromuscular efficiency, reducing the risk of falls and injuries.",
    keyTerms: [
      {
        term: "Balance",
        definition:
          "The ability to maintain the body's center of gravity within its base of support, achieved through the integration of sensory and motor systems.",
      },
      {
        term: "Proprioception",
        definition:
          "The body's ability to sense its position, movement, and orientation in space through sensory receptors in muscles, tendons, and joints.",
      },
      {
        term: "Center of gravity",
        definition:
          "The point at which the body's mass is equally distributed in all directions; roughly at the level of the second sacral vertebra.",
      },
      {
        term: "Base of support",
        definition:
          "The area beneath and between the points of contact with the ground. A wider base provides greater stability.",
      },
    ],
    keyConcepts: [
      "Balance stabilization (Phase 1): minimal joint motion, holding static positions on unstable surfaces (e.g., single-leg balance).",
      "Balance strength (Phases 2-4): dynamic movements through full range of motion on stable or unstable surfaces (e.g., single-leg squat).",
      "Balance power (Phase 5): explosive movements with controlled landings (e.g., hop to stabilization).",
      "Three sensory systems contribute to balance: visual, vestibular (inner ear), and somatosensory (proprioceptors).",
      "Balance training should be progressed by reducing the base of support, changing surfaces, and removing visual input.",
    ],
  },
  {
    number: 11,
    title: "Plyometric (Reactive) Training Concepts",
    summary:
      "This chapter covers plyometric training, which uses the stretch-shortening cycle to produce powerful, explosive movements. The stretch-shortening cycle has three phases: eccentric (loading), amortization (transition), and concentric (unloading). A shorter amortization phase results in more powerful movement. The OPT model progresses plyometric training from stabilization reactive (controlled, hold landings), to strength reactive (repeated jumps), to power reactive (maximal speed and force). Plyometric training improves rate of force production, neuromuscular efficiency, and athletic performance.",
    keyTerms: [
      {
        term: "Stretch-shortening cycle",
        definition:
          "The mechanism by which a rapid eccentric muscle action immediately followed by a concentric action produces more force than a concentric action alone. Foundation of plyometric training.",
      },
      {
        term: "Amortization phase",
        definition:
          "The transition period between the eccentric and concentric phases of a plyometric exercise. A shorter amortization phase produces more power.",
      },
      {
        term: "Rate of force production",
        definition:
          "The speed at which a muscle can produce force; critical for explosive athletic movements.",
      },
      {
        term: "Reactive training",
        definition:
          "NASM's term for plyometric training; exercises that use quick, powerful movements involving the stretch-shortening cycle.",
      },
    ],
    keyConcepts: [
      "The stretch-shortening cycle consists of eccentric (loading), amortization (transition), and concentric (unloading) phases.",
      "Stabilization reactive exercises (Phase 1) involve holding landings for 3-5 seconds to develop landing mechanics and stabilization.",
      "Strength reactive exercises (Phases 2-4) involve repeated jumps without extended holds, progressing to more dynamic movements.",
      "Power reactive exercises (Phase 5) focus on maximal force and velocity for peak power output.",
      "Plyometric training should progress from low-intensity, controlled drills to high-intensity, dynamic movements.",
      "Proper landing mechanics (soft knees, neutral spine, no knee valgus) must be established before progressing intensity.",
    ],
  },
  {
    number: 12,
    title: "Speed, Agility, and Quickness Training",
    summary:
      "This chapter addresses speed, agility, and quickness (SAQ) training, which develops the ability to accelerate, decelerate, stabilize, and change direction rapidly. Speed is the ability to move the body quickly, agility is the ability to change direction with speed, and quickness is the ability to react and change body position rapidly. SAQ training follows the OPT model progression with drills increasing in complexity and speed. Proper deceleration and change-of-direction mechanics are emphasized to reduce injury risk, particularly ACL injuries.",
    keyTerms: [
      {
        term: "Speed",
        definition:
          "The ability to move the body in one intended direction as fast as possible. Determined by stride rate and stride length.",
      },
      {
        term: "Agility",
        definition:
          "The ability to accelerate, decelerate, stabilize, and change direction quickly while maintaining proper posture and body control.",
      },
      {
        term: "Quickness",
        definition:
          "The ability to react and change body position with maximum rate of force production in all planes of motion.",
      },
      {
        term: "Stride rate",
        definition:
          "The number of strides taken per unit of time during running. Combined with stride length, determines running speed.",
      },
      {
        term: "Stride length",
        definition:
          "The distance covered with each stride during running.",
      },
    ],
    keyConcepts: [
      "SAQ training in Phase 1 involves performing drills at a controlled pace with extended rest to develop proper mechanics.",
      "SAQ training in Phases 2-4 progressively increases speed and complexity with moderate rest intervals.",
      "SAQ training in Phase 5 involves maximal speed and effort with sport-specific movement patterns.",
      "Proper deceleration mechanics (eccentric strength, lowering center of gravity) are critical for injury prevention.",
      "Ladder drills, cone drills, and shuttle runs are common SAQ training tools.",
      "SAQ training is appropriate for all populations when properly progressed, not just athletes.",
    ],
  },
  {
    number: 13,
    title: "Resistance Training Concepts",
    summary:
      "This chapter covers the principles and programming variables of resistance training across all five phases of the OPT model. It explains mechanical and metabolic adaptations to resistance training, including the SAID principle (Specific Adaptation to Imposed Demands), the General Adaptation Syndrome (GAS), and progressive overload. The chapter details the acute training variables (sets, reps, tempo, rest, intensity, volume, frequency) and how they change across the OPT phases. Resistance training methods include supersets, circuit training, drop sets, and peripheral heart action training.",
    keyTerms: [
      {
        term: "SAID principle",
        definition:
          "Specific Adaptation to Imposed Demands: the body will specifically adapt to the type of demand placed on it.",
      },
      {
        term: "General Adaptation Syndrome (GAS)",
        definition:
          "Selye's model describing three stages of the body's response to stress: alarm, resistance, and exhaustion.",
      },
      {
        term: "Progressive overload",
        definition:
          "The gradual and systematic increase in training demands (volume, intensity, frequency) to continue making adaptations.",
      },
      {
        term: "Tempo",
        definition:
          "The speed at which a repetition is performed, described as eccentric/isometric/concentric (e.g., 4/2/1 for stabilization training).",
      },
      {
        term: "Training volume",
        definition:
          "The total amount of work performed, calculated as sets x reps x weight.",
      },
    ],
    keyConcepts: [
      "Phase 1 (Stabilization Endurance): 12-20 reps, 1-3 sets, 4/2/1 tempo, 0-90 sec rest, low intensity.",
      "Phase 2 (Strength Endurance): 8-12 reps, 2-4 sets, superset format pairing stable and unstable exercises.",
      "Phase 3 (Hypertrophy): 6-12 reps, 3-5 sets, 2/0/2 tempo, 0-60 sec rest, 75-85% 1RM.",
      "Phase 4 (Maximal Strength): 1-5 reps, 4-6 sets, explosive tempo, 3-5 min rest, 85-100% 1RM.",
      "Phase 5 (Power): 1-5 reps for strength, 8-10 reps for power exercises, superset format.",
      "GAS explains why periodization is necessary - the body progresses through alarm, resistance, and (if overreached) exhaustion.",
    ],
  },
  {
    number: 14,
    title: "Exercise Technique and Spotting",
    summary:
      "This chapter provides detailed exercise technique guidelines for all major movement patterns. It covers the primary resistance training exercises organized by body region (chest, back, shoulders, arms, legs) and by movement pattern (pushing, pulling, squatting, lunging, hinging). Proper exercise technique reduces injury risk and ensures the target muscles are effectively trained. The chapter also covers spotting techniques for free-weight exercises, including proper spotter positioning, communication, and when a spotter is necessary. Machine, cable, and bodyweight exercises are also detailed.",
    keyTerms: [
      {
        term: "Spotting",
        definition:
          "Actively assisting or standing by to assist a person performing an exercise to ensure safety and proper form.",
      },
      {
        term: "Valsalva maneuver",
        definition:
          "Holding one's breath during exertion while bearing down, which temporarily increases blood pressure. Generally discouraged for most populations.",
      },
      {
        term: "Compound exercise",
        definition:
          "An exercise that involves movement at two or more joints (e.g., squat, bench press, deadlift).",
      },
      {
        term: "Isolation exercise",
        definition:
          "An exercise that involves movement at only one joint (e.g., bicep curl, leg extension).",
      },
    ],
    keyConcepts: [
      "The five primary movement patterns are squat, hinge, push, pull, and rotation.",
      "A spotter should always be present for barbell bench press, barbell squat, and overhead press with heavy loads.",
      "Proper breathing: exhale during the concentric phase (exertion) and inhale during the eccentric phase.",
      "Exercise selection should match the client's current OPT phase and assessment results.",
      "Machines provide more stability and are appropriate for beginners; free weights require more stabilization.",
      "Multi-joint exercises should generally be performed before single-joint exercises in a training session.",
    ],
  },
  {
    number: 15,
    title: "Program Design Concepts",
    summary:
      "This chapter brings together all the training concepts into a systematic approach for designing comprehensive training programs. It details how to apply the OPT model to create individualized programs by manipulating acute variables (reps, sets, intensity, rest, volume, tempo, frequency) across each phase. The chapter covers training splits, periodization strategies (linear, undulating, block), workout templates for each OPT phase, and how to sequence exercises within a training session (warm-up, core, balance, reactive, resistance, cool-down). Program progression timelines and guidelines for modifying programs based on client needs are also covered.",
    keyTerms: [
      {
        term: "Linear periodization",
        definition:
          "A training approach that progressively increases intensity and decreases volume over time in a systematic, sequential manner.",
      },
      {
        term: "Undulating periodization",
        definition:
          "A periodization strategy that varies intensity and volume within a week or training cycle rather than linearly over time.",
      },
      {
        term: "Acute variables",
        definition:
          "The fundamental components of a resistance training program: sets, reps, intensity, tempo, rest intervals, volume, frequency, and exercise selection.",
      },
      {
        term: "Training split",
        definition:
          "The organization of a training program over a week, such as total body, upper/lower, or push/pull/legs.",
      },
    ],
    keyConcepts: [
      "A single training session follows this sequence: SMR, stretching, core, balance, reactive/plyometric, SAQ, resistance training, cool-down.",
      "Clients should spend approximately 4 weeks in each OPT phase before progressing.",
      "Total body training splits are recommended for beginners and in Phase 1.",
      "Intensity should be calculated using percentages of estimated 1RM or repetition max testing.",
      "Program design must account for assessment findings, client goals, training experience, and available time/equipment.",
      "Undulating periodization may produce better results for trained individuals compared to linear periodization.",
    ],
  },
  {
    number: 16,
    title: "Nutrition",
    summary:
      "This chapter covers essential nutrition concepts for personal trainers, including macronutrients (carbohydrates, proteins, fats), micronutrients (vitamins and minerals), hydration, and energy balance. It explains how to calculate daily caloric needs using resting metabolic rate (RMR) and activity factors, macronutrient distribution recommendations, and the timing of nutrients around exercise. The chapter emphasizes that personal trainers should provide general nutrition guidance within their scope of practice and refer clients to registered dietitians for specific medical nutrition therapy or meal planning.",
    keyTerms: [
      {
        term: "Resting metabolic rate (RMR)",
        definition:
          "The number of calories the body burns at rest to maintain basic physiological functions. Accounts for approximately 70% of total daily energy expenditure.",
      },
      {
        term: "Macronutrients",
        definition:
          "Nutrients needed in large amounts: carbohydrates (4 cal/g), proteins (4 cal/g), and fats (9 cal/g). They provide energy and building materials for the body.",
      },
      {
        term: "Glycemic index (GI)",
        definition:
          "A scale that ranks carbohydrate-containing foods by how much they raise blood glucose levels compared to a reference food.",
      },
      {
        term: "Essential amino acids",
        definition:
          "The nine amino acids that the body cannot synthesize and must be obtained through diet. Critical for muscle protein synthesis.",
      },
      {
        term: "Energy balance",
        definition:
          "The relationship between energy intake (calories consumed) and energy expenditure (calories burned). Determines weight gain, loss, or maintenance.",
      },
    ],
    keyConcepts: [
      "Protein recommendations for active individuals: 1.2-2.0 g/kg body weight per day.",
      "Carbohydrates are the primary fuel source for moderate to high-intensity exercise.",
      "Fats are essential for hormone production, cell membranes, and absorption of fat-soluble vitamins (A, D, E, K).",
      "Hydration: drink approximately 14-22 oz of water 2 hours before exercise and 6-12 oz every 15-20 minutes during exercise.",
      "Trainers should stay within their scope of practice and not prescribe specific diets or supplements for medical conditions.",
      "A caloric deficit of approximately 500 calories per day leads to about 1 pound of fat loss per week.",
    ],
  },
  {
    number: 17,
    title: "Supplementation",
    summary:
      "This chapter reviews common dietary supplements, their proposed mechanisms of action, and the current evidence regarding their efficacy and safety. It covers performance supplements (creatine, caffeine, beta-alanine, protein powders), health supplements (fish oil, vitamin D, multivitamins), and weight management supplements. The chapter emphasizes critical evaluation of supplement claims, understanding FDA regulation (supplements are not held to the same standards as drugs), and the importance of third-party testing certifications (NSF, Informed Sport). Trainers must understand scope of practice regarding supplement recommendations.",
    keyTerms: [
      {
        term: "Creatine monohydrate",
        definition:
          "One of the most well-researched supplements; shown to increase phosphocreatine stores, improve high-intensity exercise performance, and support muscle growth.",
      },
      {
        term: "Dietary Supplement Health and Education Act (DSHEA)",
        definition:
          "The 1994 law that classifies supplements as foods rather than drugs, meaning they do not require FDA approval before being sold.",
      },
      {
        term: "Third-party testing",
        definition:
          "Independent verification by organizations (NSF International, Informed Sport) that a supplement contains what its label claims and is free from banned substances.",
      },
      {
        term: "Ergogenic aid",
        definition:
          "Any substance, technique, or device used to enhance physical performance.",
      },
    ],
    keyConcepts: [
      "Supplements are regulated as food products, not drugs, under DSHEA. They do not require FDA pre-approval.",
      "Creatine monohydrate is one of the most effective and well-studied performance supplements.",
      "Caffeine can improve endurance performance and reduce perceived exertion at doses of 3-6 mg/kg body weight.",
      "Protein supplementation can help meet daily protein needs but is not superior to whole food protein sources.",
      "Personal trainers should recommend only evidence-based supplements and always stay within scope of practice.",
      "Third-party certifications (NSF Certified for Sport, Informed Sport) help ensure supplement quality and safety.",
    ],
  },
  {
    number: 18,
    title: "Lifestyle Modification and Behavioral Coaching",
    summary:
      "This chapter covers the psychological and behavioral aspects of helping clients adopt and maintain healthy lifestyle changes. It introduces key behavioral change models including the Transtheoretical Model (Stages of Change), Social Cognitive Theory, and Health Belief Model. Effective coaching strategies include motivational interviewing, SMART goal setting, building self-efficacy, managing barriers, and creating supportive environments. The chapter emphasizes that sustainable behavior change requires addressing psychological and social factors, not just providing exercise prescriptions.",
    keyTerms: [
      {
        term: "Transtheoretical Model (Stages of Change)",
        definition:
          "A model describing five stages of behavior change: precontemplation, contemplation, preparation, action, and maintenance.",
      },
      {
        term: "Self-efficacy",
        definition:
          "An individual's belief in their ability to succeed in specific situations or accomplish a task. A key predictor of behavior change.",
      },
      {
        term: "SMART goals",
        definition:
          "Goals that are Specific, Measurable, Attainable, Realistic, and Time-bound.",
      },
      {
        term: "Motivational interviewing",
        definition:
          "A client-centered counseling approach that helps explore and resolve ambivalence about behavior change through open-ended questions and reflective listening.",
      },
      {
        term: "Locus of control",
        definition:
          "The degree to which individuals believe they have control over the outcome of events in their lives. Internal locus = within my control; external locus = outside my control.",
      },
    ],
    keyConcepts: [
      "The five Stages of Change: precontemplation (not considering change), contemplation (thinking about it), preparation (ready to act), action (making the change), maintenance (sustaining it).",
      "Self-efficacy can be improved through mastery experiences, modeling, social persuasion, and managing emotional states.",
      "SMART goals provide clear, achievable targets that increase motivation and accountability.",
      "Motivational interviewing uses open-ended questions, affirmations, reflective listening, and summarizing (OARS).",
      "Relapse is a normal part of behavior change, not a failure. Trainers should help clients develop relapse prevention strategies.",
      "The trainer-client relationship and communication skills are as important as technical exercise knowledge.",
    ],
  },
  {
    number: 19,
    title: "Special Populations",
    summary:
      "This chapter addresses exercise programming considerations for clients with specific health conditions or characteristics. Populations covered include youth, older adults, pregnant women, clients with obesity, diabetes (Type 1 and Type 2), hypertension, coronary heart disease, osteoporosis, arthritis, and chronic low back pain. For each population, the chapter provides guidelines for exercise modifications, contraindications, recommended intensities, and safety considerations. Understanding these populations is essential for trainers to provide safe, effective, and appropriate programming.",
    keyTerms: [
      {
        term: "Hypertension",
        definition:
          "Chronically elevated blood pressure (systolic >= 130 mmHg and/or diastolic >= 80 mmHg). Exercise can help lower resting blood pressure.",
      },
      {
        term: "Type 2 diabetes",
        definition:
          "A metabolic disorder characterized by insulin resistance and elevated blood glucose. Exercise improves insulin sensitivity and glucose management.",
      },
      {
        term: "Osteoporosis",
        definition:
          "A condition of decreased bone mineral density that increases fracture risk. Weight-bearing and resistance exercises help improve bone density.",
      },
      {
        term: "Sarcopenia",
        definition:
          "The age-related loss of skeletal muscle mass, strength, and function. Resistance training is the most effective intervention.",
      },
      {
        term: "Gestational diabetes",
        definition:
          "Diabetes that develops during pregnancy. Regular moderate exercise can help manage blood glucose levels.",
      },
    ],
    keyConcepts: [
      "Youth training should emphasize movement quality, bodyweight exercises, and fun. Avoid maximal lifting until physical maturity.",
      "Older adults benefit significantly from resistance and balance training to combat sarcopenia and reduce fall risk.",
      "Clients with hypertension should avoid heavy isometric exercises and the Valsalva maneuver. Moderate cardio is highly beneficial.",
      "For clients with diabetes, monitor blood glucose before, during, and after exercise. Avoid exercise if glucose is above 250 mg/dL with ketones present.",
      "Pregnant clients should avoid supine exercises after the first trimester, avoid overheating, and maintain moderate intensity.",
      "Clients with osteoporosis should perform weight-bearing exercises but avoid high-impact activities and excessive spinal flexion.",
    ],
  },
  {
    number: 20,
    title: "Professional Development and Responsibility",
    summary:
      "This chapter covers the business, legal, and ethical aspects of being a personal trainer. Topics include defining your scope of practice, professional liability and obtaining insurance, business models (independent contractor vs. employee), marketing and sales strategies, client retention, legal considerations, and maintaining professional boundaries. The chapter also addresses continuing education requirements, career development paths, and ethical responsibilities. Understanding these professional elements is essential for building a sustainable and successful personal training career.",
    keyTerms: [
      {
        term: "Scope of practice",
        definition:
          "The legal and professional boundaries within which a personal trainer is qualified to operate. Trainers should not diagnose conditions, prescribe diets, or provide therapy.",
      },
      {
        term: "Professional liability insurance",
        definition:
          "Insurance that protects a personal trainer from financial loss resulting from claims of negligence, injury, or property damage.",
      },
      {
        term: "Independent contractor",
        definition:
          "A self-employed professional who controls how and when they work, responsible for their own taxes, insurance, and business expenses.",
      },
      {
        term: "Informed consent",
        definition:
          "A document that explains the potential risks and benefits of an exercise program, which clients must sign before beginning training.",
      },
      {
        term: "Negligence",
        definition:
          "A failure to act with the degree of care that a reasonably prudent personal trainer would exercise under similar circumstances.",
      },
    ],
    keyConcepts: [
      "Personal trainers must not diagnose medical conditions, prescribe specific diets, recommend supplements for medical conditions, or provide psychological counseling.",
      "Professional liability insurance is essential for all personal trainers regardless of employment setting.",
      "An informed consent form and health history questionnaire should be completed before training any new client.",
      "Continuing education is required to maintain NASM certification and stay current with industry standards.",
      "Developing strong communication, sales, and business skills is critical for career longevity in personal training.",
      "Trainers must maintain professional boundaries, document all sessions and incidents, and follow emergency action plans.",
    ],
  },
];

export function getChapter(number: number): ChapterData | undefined {
  return chapters.find((ch) => ch.number === number);
}
