export type Muscle = {
  id: string;
  name: string;
  group: "upper" | "core" | "lower";
  location: string;
  action: string;
  origin: string;
  insertion: string;
  commonImbalance: string;
  exercises: string[];
  nasmTip: string;
};

export const muscles: Muscle[] = [
  // ── LOWER BODY ──────────────────────────────────────────
  {
    id: "gluteus-maximus",
    name: "Gluteus Maximus",
    group: "lower",
    location: "Largest muscle of the buttocks, posterior hip",
    action: "Hip extension, external rotation of the hip",
    origin: "Posterior gluteal line of ilium, sacrum, coccyx",
    insertion: "IT band and gluteal tuberosity of femur",
    commonImbalance:
      "Often underactive. Compensated by hamstrings and erector spinae during hip extension (Lower Crossed Syndrome).",
    exercises: [
      "Barbell hip thrust",
      "Cable pull-through",
      "Step-ups",
      "Glute bridge",
    ],
    nasmTip:
      "Key underactive muscle in Lower Crossed Syndrome. Needs activation before squat patterns. Inhibited by prolonged sitting.",
  },
  {
    id: "gluteus-medius",
    name: "Gluteus Medius",
    group: "lower",
    location: "Upper lateral buttock, beneath the iliac crest",
    action: "Hip abduction, internal/external rotation of the hip",
    origin: "Outer surface of the ilium",
    insertion: "Greater trochanter of the femur",
    commonImbalance:
      "Often underactive. Leads to knee valgus during squats and Trendelenburg gait.",
    exercises: [
      "Side-lying hip abduction",
      "Lateral band walks",
      "Single-leg squat",
      "Clamshells",
    ],
    nasmTip:
      "Weakness causes knee valgus (knees caving in) during overhead squat assessment. Critical for frontal plane stabilization.",
  },
  {
    id: "iliopsoas",
    name: "Iliopsoas (Hip Flexors)",
    group: "lower",
    location: "Deep anterior hip, connecting spine to femur",
    action: "Hip flexion, assists lumbar spine stabilization",
    origin: "Iliac fossa (iliacus), T12-L5 vertebral bodies (psoas major)",
    insertion: "Lesser trochanter of the femur",
    commonImbalance:
      "Often overactive and shortened from prolonged sitting. Creates anterior pelvic tilt and inhibits glute max.",
    exercises: [
      "Standing hip flexor stretch",
      "Half-kneeling hip flexor stretch",
      "Supine leg raises (controlled)",
      "Mountain climbers",
    ],
    nasmTip:
      "Primary overactive muscle in Lower Crossed Syndrome. Tight hip flexors = anterior pelvic tilt = low back pain. Lengthen before strengthening glutes.",
  },
  {
    id: "rectus-femoris",
    name: "Rectus Femoris",
    group: "lower",
    location: "Anterior thigh, center of the quadriceps group",
    action: "Knee extension and hip flexion (only quad that crosses the hip)",
    origin: "Anterior inferior iliac spine (AIIS)",
    insertion: "Tibial tuberosity via patellar tendon",
    commonImbalance:
      "Often overactive as a hip flexor. Can contribute to anterior pelvic tilt when tight.",
    exercises: [
      "Leg extension",
      "Front squat",
      "Lunges",
      "Sissy squat",
    ],
    nasmTip:
      "The only quadriceps muscle that crosses both the hip and knee joints. Often overactive with hip flexor dominance.",
  },
  {
    id: "vastus-lateralis",
    name: "Vastus Lateralis",
    group: "lower",
    location: "Outer (lateral) anterior thigh",
    action: "Knee extension",
    origin: "Greater trochanter and linea aspera of femur",
    insertion: "Tibial tuberosity via patellar tendon",
    commonImbalance:
      "Often overactive relative to VMO, pulling patella laterally and contributing to knee pain.",
    exercises: [
      "Barbell squat",
      "Leg press",
      "Leg extension",
      "Walking lunges",
    ],
    nasmTip:
      "Lateral dominance over the VMO can cause lateral patellar tracking. Foam rolling the VL can help restore balance.",
  },
  {
    id: "vastus-medialis",
    name: "Vastus Medialis (VMO)",
    group: "lower",
    location: "Inner (medial) anterior thigh, teardrop shape near knee",
    action: "Knee extension, stabilizes patella medially",
    origin: "Linea aspera and intertrochanteric line of femur",
    insertion: "Tibial tuberosity via patellar tendon",
    commonImbalance:
      "Often underactive relative to vastus lateralis, contributing to lateral patellar tracking.",
    exercises: [
      "Terminal knee extensions",
      "Single-leg press",
      "Wall sits",
      "Step-downs",
    ],
    nasmTip:
      "Critical for medial patellar stabilization. Weakness here plus overactive VL = patellofemoral pain syndrome.",
  },
  {
    id: "biceps-femoris",
    name: "Biceps Femoris",
    group: "lower",
    location: "Posterior thigh, lateral hamstring",
    action: "Knee flexion, hip extension, external rotation of tibia",
    origin:
      "Long head: ischial tuberosity. Short head: linea aspera of femur",
    insertion: "Head of fibula",
    commonImbalance:
      "Often overactive, compensating for underactive glute max during hip extension.",
    exercises: [
      "Romanian deadlift",
      "Lying leg curl",
      "Nordic hamstring curl",
      "Kettlebell swing",
    ],
    nasmTip:
      "Part of the synergistic dominance pattern: hamstrings take over for weak glutes. Often overactive in Lower Crossed Syndrome.",
  },
  {
    id: "semimembranosus",
    name: "Semimembranosus",
    group: "lower",
    location: "Posterior thigh, deep medial hamstring",
    action: "Knee flexion, hip extension, internal rotation of tibia",
    origin: "Ischial tuberosity",
    insertion: "Posterior medial condyle of tibia",
    commonImbalance:
      "Often overactive with other hamstrings when glutes are inhibited.",
    exercises: [
      "Romanian deadlift",
      "Seated leg curl",
      "Glute-ham raise",
      "Single-leg deadlift",
    ],
    nasmTip:
      "Medial hamstring — assists with internal tibial rotation. Along with other hamstrings, often compensates for weak glutes.",
  },
  {
    id: "semitendinosus",
    name: "Semitendinosus",
    group: "lower",
    location: "Posterior thigh, superficial medial hamstring",
    action: "Knee flexion, hip extension, internal rotation of tibia",
    origin: "Ischial tuberosity",
    insertion:
      "Proximal medial tibia (pes anserinus with gracilis and sartorius)",
    commonImbalance:
      "Often overactive with other hamstrings when glutes are inhibited.",
    exercises: [
      "Stiff-leg deadlift",
      "Lying leg curl",
      "Swiss ball hamstring curl",
      "Good mornings",
    ],
    nasmTip:
      "Inserts at the pes anserinus. Remember: the three hamstrings share an origin at the ischial tuberosity (except short head of biceps femoris).",
  },
  {
    id: "gastrocnemius",
    name: "Gastrocnemius",
    group: "lower",
    location: "Superficial posterior calf, two heads",
    action: "Plantarflexion of ankle, assists knee flexion",
    origin: "Medial and lateral condyles of the femur",
    insertion: "Calcaneus via Achilles tendon",
    commonImbalance:
      "Often overactive, contributing to feet turning out and ankle restriction in squats.",
    exercises: [
      "Standing calf raise",
      "Donkey calf raise",
      "Jump rope",
      "Box jumps",
    ],
    nasmTip:
      "Crosses both the knee and ankle joints. If tight, it limits ankle dorsiflexion, causing compensations up the kinetic chain during squats.",
  },
  {
    id: "soleus",
    name: "Soleus",
    group: "lower",
    location: "Deep posterior calf, beneath the gastrocnemius",
    action: "Plantarflexion of ankle (primary postural calf muscle)",
    origin: "Posterior tibia and fibula",
    insertion: "Calcaneus via Achilles tendon",
    commonImbalance:
      "Often overactive. Tightness limits ankle dorsiflexion during squat assessment.",
    exercises: [
      "Seated calf raise",
      "Single-leg calf raise (knee bent)",
      "Wall ankle mobilization",
      "Sled push",
    ],
    nasmTip:
      "Only crosses the ankle joint (unlike gastroc). Tested with bent-knee calf stretch. Key contributor to ankle restriction.",
  },
  {
    id: "tibialis-anterior",
    name: "Tibialis Anterior",
    group: "lower",
    location: "Anterior (front) lower leg, along the shin",
    action: "Dorsiflexion and inversion of the foot",
    origin: "Lateral condyle and proximal lateral tibia",
    insertion: "Medial cuneiform and base of first metatarsal",
    commonImbalance:
      "Often underactive when calves are overactive. Weakness contributes to excessive pronation.",
    exercises: [
      "Toe raises (dorsiflexion)",
      "Resistance band dorsiflexion",
      "Heel walks",
      "Eccentric tibialis raises",
    ],
    nasmTip:
      "Underactive tibialis anterior = poor ankle dorsiflexion control. Strengthen to combat pronation distortion syndrome.",
  },
  {
    id: "adductors",
    name: "Adductor Complex",
    group: "lower",
    location: "Inner thigh (adductor longus, brevis, magnus, gracilis, pectineus)",
    action: "Hip adduction, assists hip flexion and rotation",
    origin: "Pubic ramus and ischium",
    insertion: "Linea aspera and medial tibia (gracilis)",
    commonImbalance:
      "Often overactive, contributing to knee valgus during squat assessment.",
    exercises: [
      "Copenhagen adduction",
      "Sumo squat",
      "Cable hip adduction",
      "Side lunges",
    ],
    nasmTip:
      "Overactive adductors + underactive glute medius = knee valgus. Foam roll adductors and activate glute medius to correct.",
  },
  {
    id: "tfl",
    name: "Tensor Fasciae Latae (TFL)",
    group: "lower",
    location: "Lateral hip, anterior to the greater trochanter",
    action: "Hip abduction, flexion, and internal rotation",
    origin: "Anterior iliac crest and ASIS",
    insertion: "IT band to lateral tibial condyle",
    commonImbalance:
      "Often overactive, compensating for weak glute medius. Contributes to IT band syndrome.",
    exercises: [
      "Foam roll TFL/IT band",
      "Side-lying clamshells",
      "Lateral band walks",
      "Hip hikes",
    ],
    nasmTip:
      "TFL being overactive for glute medius is a classic NASM compensation pattern. Inhibit TFL, then activate glute medius.",
  },

  // ── CORE ────────────────────────────────────────────────
  {
    id: "quadratus-lumborum",
    name: "Quadratus Lumborum",
    group: "core",
    location: "Deep posterior abdominal wall, lateral low back",
    action: "Lateral flexion of the trunk, hip hiking, assists trunk extension",
    origin: "Posterior iliac crest",
    insertion: "12th rib and L1-L4 transverse processes",
    commonImbalance:
      "Often overactive on one side, contributing to lateral pelvic tilt and low back pain.",
    exercises: [
      "Side plank",
      "Suitcase carry",
      "Lateral ball toss",
      "Pallof press",
    ],
    nasmTip:
      "Unilateral tightness causes lateral pelvic tilt. Often involved in low-back pain patterns.",
  },
  {
    id: "erector-spinae",
    name: "Erector Spinae",
    group: "core",
    location: "Runs along the spine from sacrum to skull (iliocostalis, longissimus, spinalis)",
    action: "Extension and lateral flexion of the spine",
    origin: "Sacrum, iliac crest, spinous processes",
    insertion: "Ribs, transverse and spinous processes, mastoid process",
    commonImbalance:
      "Often overactive in Lower Crossed Syndrome, compensating for weak glute max and core.",
    exercises: [
      "Back extension (Roman chair)",
      "Bird dog",
      "Deadlift",
      "Superman hold",
    ],
    nasmTip:
      "Overactive erector spinae = excessive lumbar extension during overhead squat. Part of Lower Crossed Syndrome overactive pattern.",
  },
  {
    id: "rectus-abdominis",
    name: "Rectus Abdominis",
    group: "core",
    location: "Anterior abdomen, the 'six-pack' muscle",
    action: "Trunk flexion, posterior pelvic tilt",
    origin: "Pubic crest and symphysis",
    insertion: "Xiphoid process and costal cartilages 5-7",
    commonImbalance:
      "Often underactive in Lower Crossed Syndrome, allowing excessive anterior pelvic tilt.",
    exercises: [
      "Crunch",
      "Reverse crunch",
      "Hanging leg raise",
      "Cable crunch",
    ],
    nasmTip:
      "Underactive in Lower Crossed Syndrome. Works with glutes to produce posterior pelvic tilt, counteracting excessive lordosis.",
  },
  {
    id: "transverse-abdominis",
    name: "Transverse Abdominis (TVA)",
    group: "core",
    location: "Deepest abdominal layer, wraps around the trunk like a corset",
    action:
      "Compresses abdomen, stabilizes lumbar spine and pelvis (drawing-in maneuver)",
    origin: "Thoracolumbar fascia, iliac crest, inguinal ligament, costal cartilages 7-12",
    insertion: "Linea alba and pubic crest",
    commonImbalance:
      "Often underactive. Poor TVA activation = poor core stabilization = compensations throughout the kinetic chain.",
    exercises: [
      "Drawing-in maneuver",
      "Dead bug",
      "Plank",
      "Stability ball rollout",
    ],
    nasmTip:
      "NASM emphasizes the drawing-in maneuver (pulling navel toward spine) to activate TVA. Foundation of core stabilization training.",
  },
  {
    id: "internal-obliques",
    name: "Internal Obliques",
    group: "core",
    location: "Deep lateral abdomen, fibers run upward and medially",
    action:
      "Ipsilateral trunk rotation, lateral flexion, assists trunk flexion and compression",
    origin: "Thoracolumbar fascia, iliac crest, inguinal ligament",
    insertion: "Lower ribs (10-12), linea alba, pubic crest",
    commonImbalance:
      "Weakness contributes to poor rotational control and core instability.",
    exercises: [
      "Pallof press",
      "Woodchop (low to high)",
      "Side plank with rotation",
      "Cable rotation",
    ],
    nasmTip:
      "Works with contralateral external oblique for trunk rotation. Part of the local stabilization system with the TVA.",
  },
  {
    id: "external-obliques",
    name: "External Obliques",
    group: "core",
    location: "Superficial lateral abdomen, fibers run downward and medially",
    action:
      "Contralateral trunk rotation, lateral flexion, trunk flexion, posterior pelvic tilt",
    origin: "External surfaces of ribs 5-12",
    insertion: "Linea alba, pubic tubercle, iliac crest",
    commonImbalance:
      "Weakness contributes to lateral trunk instability and difficulty controlling rotation.",
    exercises: [
      "Bicycle crunch",
      "Cable woodchop (high to low)",
      "Russian twist",
      "Hanging oblique raise",
    ],
    nasmTip:
      "Right external oblique + left internal oblique = left trunk rotation. Know the force-couple for rotation questions.",
  },

  // ── UPPER BODY ──────────────────────────────────────────
  {
    id: "latissimus-dorsi",
    name: "Latissimus Dorsi",
    group: "upper",
    location: "Broad muscle of the mid/lower back",
    action:
      "Shoulder extension, adduction, internal rotation, assists trunk extension",
    origin: "Spinous processes T7-L5, thoracolumbar fascia, iliac crest, lower ribs",
    insertion: "Intertubercular groove (bicipital groove) of the humerus",
    commonImbalance:
      "Often overactive, causing shoulders to round forward and limiting overhead reach.",
    exercises: [
      "Lat pulldown",
      "Pull-up",
      "Barbell row",
      "Single-arm dumbbell row",
    ],
    nasmTip:
      "Overactive lats can limit overhead arm raise during assessment. Often needs to be lengthened in Upper Crossed Syndrome.",
  },
  {
    id: "upper-trapezius",
    name: "Upper Trapezius",
    group: "upper",
    location: "Upper back/neck region, from skull base to lateral clavicle",
    action: "Scapular elevation, upward rotation, neck extension",
    origin: "External occipital protuberance, nuchal ligament, C1-C7 spinous processes",
    insertion: "Lateral third of the clavicle",
    commonImbalance:
      "Often overactive in Upper Crossed Syndrome, causing elevated shoulders and neck tension.",
    exercises: [
      "Barbell shrug",
      "Farmer's carry",
      "Foam roll upper traps",
      "Upper trap stretch",
    ],
    nasmTip:
      "Classic overactive muscle in Upper Crossed Syndrome. Compensates for weak lower/mid traps and deep cervical flexors.",
  },
  {
    id: "mid-trapezius",
    name: "Middle Trapezius",
    group: "upper",
    location: "Middle back between the scapulae",
    action: "Scapular retraction (pulling shoulder blades together)",
    origin: "Spinous processes C7-T3",
    insertion: "Medial border of the acromion and spine of scapula",
    commonImbalance:
      "Often underactive in Upper Crossed Syndrome, allowing scapulae to protract.",
    exercises: [
      "Prone Y raise",
      "Face pull",
      "Seated cable row",
      "Band pull-apart",
    ],
    nasmTip:
      "Underactive in Upper Crossed Syndrome. Strengthen with scapular retraction exercises to improve posture.",
  },
  {
    id: "lower-trapezius",
    name: "Lower Trapezius",
    group: "upper",
    location: "Lower back between the shoulder blades",
    action: "Scapular depression and upward rotation",
    origin: "Spinous processes T4-T12",
    insertion: "Spine of the scapula (medial end)",
    commonImbalance:
      "Often underactive. Weakness allows scapular elevation and winging.",
    exercises: [
      "Prone T raise",
      "Low trap raise (Y at 120 deg)",
      "Scapular wall slides",
      "Cable face pull with external rotation",
    ],
    nasmTip:
      "Key underactive muscle in Upper Crossed Syndrome. Pairs with serratus anterior for proper upward scapular rotation.",
  },
  {
    id: "rhomboids",
    name: "Rhomboids (Major & Minor)",
    group: "upper",
    location: "Between the spine and medial scapular border",
    action: "Scapular retraction and downward rotation",
    origin:
      "Spinous processes C7-T1 (minor), T2-T5 (major)",
    insertion: "Medial border of the scapula",
    commonImbalance:
      "Often underactive in Upper Crossed Syndrome, allowing scapular protraction and rounded shoulders.",
    exercises: [
      "Dumbbell row with scapular squeeze",
      "Band pull-apart",
      "Prone reverse fly",
      "TRX row",
    ],
    nasmTip:
      "Underactive in Upper Crossed Syndrome. Work with mid traps to retract scapulae and combat rounded shoulder posture.",
  },
  {
    id: "pectoralis-major",
    name: "Pectoralis Major",
    group: "upper",
    location: "Large fan-shaped chest muscle",
    action:
      "Shoulder flexion, horizontal adduction, internal rotation",
    origin:
      "Clavicular head: medial clavicle. Sternal head: sternum, ribs 1-6",
    insertion: "Lateral lip of intertubercular groove of humerus",
    commonImbalance:
      "Often overactive in Upper Crossed Syndrome, pulling shoulders forward into protracted/internally rotated position.",
    exercises: [
      "Bench press",
      "Push-up",
      "Dumbbell flye",
      "Cable crossover",
    ],
    nasmTip:
      "Major overactive muscle in Upper Crossed Syndrome. Needs to be inhibited/lengthened before activating mid/lower traps.",
  },
  {
    id: "pectoralis-minor",
    name: "Pectoralis Minor",
    group: "upper",
    location: "Deep chest, beneath the pectoralis major",
    action: "Scapular protraction, depression, and downward rotation",
    origin: "Ribs 3-5 (anterior surface)",
    insertion: "Coracoid process of the scapula",
    commonImbalance:
      "Often overactive and shortened, tilting the scapula anteriorly and causing impingement risk.",
    exercises: [
      "Doorway pec minor stretch",
      "Corner stretch",
      "Foam roll pecs",
      "Supine pec minor stretch on roller",
    ],
    nasmTip:
      "Tight pec minor = anterior scapular tilt = shoulder impingement. Always assess and lengthen in Upper Crossed Syndrome.",
  },
  {
    id: "anterior-deltoid",
    name: "Anterior Deltoid",
    group: "upper",
    location: "Front of the shoulder",
    action: "Shoulder flexion, horizontal adduction, internal rotation",
    origin: "Lateral third of the clavicle",
    insertion: "Deltoid tuberosity of the humerus",
    commonImbalance:
      "Often overactive, contributing to forward shoulder posture when posterior deltoid is weak.",
    exercises: [
      "Front raise",
      "Overhead press",
      "Arnold press",
      "Incline bench press",
    ],
    nasmTip:
      "Overactive anterior deltoid can cause forward shoulder movement during pushing exercises. Balance with posterior deltoid work.",
  },
  {
    id: "medial-deltoid",
    name: "Medial (Lateral) Deltoid",
    group: "upper",
    location: "Lateral shoulder, gives shoulder its rounded shape",
    action: "Shoulder abduction",
    origin: "Acromion process of the scapula",
    insertion: "Deltoid tuberosity of the humerus",
    commonImbalance:
      "Less commonly imbalanced but can be overactive in upper trap-dominant shoulder abduction patterns.",
    exercises: [
      "Lateral raise",
      "Cable lateral raise",
      "Dumbbell overhead press",
      "Upright row",
    ],
    nasmTip:
      "Works with supraspinatus for the first 90 degrees of shoulder abduction. Upper trap compensates when deltoid is weak.",
  },
  {
    id: "posterior-deltoid",
    name: "Posterior Deltoid",
    group: "upper",
    location: "Back of the shoulder",
    action: "Shoulder extension, horizontal abduction, external rotation",
    origin: "Spine of the scapula",
    insertion: "Deltoid tuberosity of the humerus",
    commonImbalance:
      "Often underactive, allowing anterior deltoid/pec dominance and forward shoulder posture.",
    exercises: [
      "Reverse flye",
      "Face pull",
      "Bent-over dumbbell raise",
      "Cable reverse flye",
    ],
    nasmTip:
      "Strengthen posterior deltoid to balance anterior dominance. Important for shoulder health and posture correction.",
  },
  {
    id: "biceps-brachii",
    name: "Biceps Brachii",
    group: "upper",
    location: "Anterior upper arm, two heads",
    action: "Elbow flexion, forearm supination, assists shoulder flexion",
    origin:
      "Long head: supraglenoid tubercle. Short head: coracoid process",
    insertion: "Radial tuberosity and bicipital aponeurosis",
    commonImbalance:
      "Can become overactive when lat function is poor, compensating during pulling movements.",
    exercises: [
      "Barbell curl",
      "Dumbbell curl",
      "Hammer curl",
      "Chin-up",
    ],
    nasmTip:
      "Long head crosses the shoulder joint. Biceps tendon is a common site of impingement. Know both heads' origins.",
  },
  {
    id: "triceps-brachii",
    name: "Triceps Brachii",
    group: "upper",
    location: "Posterior upper arm, three heads",
    action: "Elbow extension, assists shoulder extension (long head)",
    origin:
      "Long head: infraglenoid tubercle. Lateral head: posterior humerus. Medial head: posterior humerus (distal)",
    insertion: "Olecranon process of the ulna",
    commonImbalance:
      "Relatively balanced but long head can be underactive when lats dominate shoulder extension.",
    exercises: [
      "Triceps pushdown",
      "Overhead triceps extension",
      "Close-grip bench press",
      "Dips",
    ],
    nasmTip:
      "Long head crosses the shoulder joint (origin at infraglenoid tubercle). Three heads but one common insertion on the olecranon.",
  },
  {
    id: "supraspinatus",
    name: "Supraspinatus",
    group: "upper",
    location: "Superior posterior scapula, above the spine of scapula",
    action:
      "Initiates shoulder abduction (first 15 degrees), stabilizes humeral head in glenoid",
    origin: "Supraspinous fossa of the scapula",
    insertion: "Greater tubercle of the humerus (superior facet)",
    commonImbalance:
      "Prone to impingement and tears. Often underactive due to compression under the acromion.",
    exercises: [
      "Empty can raise (with caution)",
      "Full can raise",
      "Band external rotation",
      "Side-lying external rotation",
    ],
    nasmTip:
      "Most commonly injured rotator cuff muscle. Initiates abduction before deltoid takes over. Remember: SITS (Supraspinatus, Infraspinatus, Teres minor, Subscapularis).",
  },
  {
    id: "infraspinatus",
    name: "Infraspinatus",
    group: "upper",
    location: "Posterior scapula, below the spine of scapula",
    action: "External rotation of the shoulder, stabilizes humeral head",
    origin: "Infraspinous fossa of the scapula",
    insertion: "Greater tubercle of the humerus (middle facet)",
    commonImbalance:
      "Often underactive and lengthened when internal rotators (pec major, lats, subscapularis) are overactive.",
    exercises: [
      "Side-lying external rotation",
      "Cable external rotation",
      "Band pull-apart",
      "Prone external rotation",
    ],
    nasmTip:
      "Key external rotator of the shoulder. Weakness allows internal rotation dominance and increases impingement risk.",
  },
  {
    id: "teres-minor",
    name: "Teres Minor",
    group: "upper",
    location: "Posterior scapula, lateral border below infraspinatus",
    action: "External rotation of the shoulder, stabilizes humeral head",
    origin: "Lateral border of the scapula (upper 2/3)",
    insertion: "Greater tubercle of the humerus (inferior facet)",
    commonImbalance:
      "Often underactive along with infraspinatus. Weakness contributes to poor shoulder stability.",
    exercises: [
      "Side-lying external rotation",
      "Cable external rotation at 90 deg abduction",
      "Prone horizontal abduction with external rotation",
      "Band external rotation",
    ],
    nasmTip:
      "Works with infraspinatus for external rotation. Part of SITS. Smaller but critical for glenohumeral stability.",
  },
  {
    id: "subscapularis",
    name: "Subscapularis",
    group: "upper",
    location: "Anterior surface of the scapula (between scapula and ribs)",
    action: "Internal rotation of the shoulder, stabilizes humeral head",
    origin: "Subscapular fossa (anterior scapula)",
    insertion: "Lesser tubercle of the humerus",
    commonImbalance:
      "Often overactive and shortened, contributing to internal rotation dominance and impingement.",
    exercises: [
      "Subscapularis stretch (sleeper stretch)",
      "Internal rotation with band",
      "Balanced rotator cuff program",
      "Cross-body stretch",
    ],
    nasmTip:
      "Only rotator cuff muscle that internally rotates. Inserts on the lesser tubercle (other 3 SITS muscles insert on greater tubercle).",
  },
  {
    id: "levator-scapulae",
    name: "Levator Scapulae",
    group: "upper",
    location: "Posterior neck to superior angle of scapula",
    action: "Scapular elevation, downward rotation, cervical lateral flexion",
    origin: "Transverse processes of C1-C4",
    insertion: "Superior angle and medial border of scapula (above spine)",
    commonImbalance:
      "Often overactive and tight, contributing to elevated shoulders, neck pain, and headaches.",
    exercises: [
      "Levator scapulae stretch (look down, rotate away)",
      "Foam roll upper back",
      "Neck lateral flexion stretch",
      "Self-myofascial release with lacrosse ball",
    ],
    nasmTip:
      "Overactive in Upper Crossed Syndrome along with upper traps. Chronically tight from desk work and stress.",
  },
  {
    id: "scm",
    name: "Sternocleidomastoid (SCM)",
    group: "upper",
    location: "Lateral neck, prominent diagonal muscle",
    action:
      "Unilateral: ipsilateral lateral flexion, contralateral rotation. Bilateral: neck flexion, assists head extension",
    origin: "Sternal head: manubrium. Clavicular head: medial clavicle",
    insertion: "Mastoid process of the temporal bone",
    commonImbalance:
      "Often overactive in Upper Crossed Syndrome, creating forward head posture.",
    exercises: [
      "SCM stretch (look up and rotate)",
      "Chin tucks",
      "Cervical retraction exercises",
      "Self-myofascial release",
    ],
    nasmTip:
      "Forward head posture = overactive SCM/upper traps + underactive deep cervical flexors. Key for Upper Crossed Syndrome.",
  },
  {
    id: "deep-cervical-flexors",
    name: "Deep Cervical Flexors",
    group: "upper",
    location: "Deep anterior neck (longus capitis, longus colli)",
    action:
      "Cervical flexion, stabilization of the cervical spine, chin tuck",
    origin: "Anterior vertebral bodies and transverse processes C1-T3",
    insertion: "Basilar part of occipital bone (longus capitis), C1 anterior tubercle (longus colli)",
    commonImbalance:
      "Often underactive in Upper Crossed Syndrome, allowing forward head posture.",
    exercises: [
      "Chin tucks",
      "Supine chin tuck with head lift",
      "Deep neck flexor endurance hold",
      "Cervical retraction against band",
    ],
    nasmTip:
      "Key underactive muscle in Upper Crossed Syndrome. Chin tucks are the primary corrective exercise. Think: opposite of forward head posture.",
  },
];
