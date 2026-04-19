"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { muscles, type Muscle } from "@/lib/anatomy/muscle-data";

// ── Movement pattern search index ───────────────────────────
const movementPatterns: Record<string, string[]> = {
  "hip flexion": ["iliopsoas", "rectus-femoris", "tfl", "adductors"],
  "hip extension": ["gluteus-maximus", "biceps-femoris", "semimembranosus", "semitendinosus"],
  "hip abduction": ["gluteus-medius", "tfl"],
  "hip adduction": ["adductors"],
  "hip internal rotation": ["tfl", "adductors", "gluteus-medius"],
  "hip external rotation": ["gluteus-maximus", "gluteus-medius"],
  "knee extension": ["rectus-femoris", "vastus-lateralis", "vastus-medialis"],
  "knee flexion": ["biceps-femoris", "semimembranosus", "semitendinosus", "gastrocnemius"],
  "ankle plantarflexion": ["gastrocnemius", "soleus"],
  "ankle dorsiflexion": ["tibialis-anterior"],
  "trunk flexion": ["rectus-abdominis", "external-obliques", "internal-obliques"],
  "trunk extension": ["erector-spinae", "quadratus-lumborum"],
  "trunk rotation": ["internal-obliques", "external-obliques"],
  "lateral trunk flexion": ["quadratus-lumborum", "internal-obliques", "external-obliques"],
  "core stabilization": ["transverse-abdominis", "internal-obliques", "rectus-abdominis"],
  "shoulder flexion": ["anterior-deltoid", "pectoralis-major", "biceps-brachii"],
  "shoulder extension": ["latissimus-dorsi", "posterior-deltoid", "triceps-brachii"],
  "shoulder abduction": ["medial-deltoid", "supraspinatus"],
  "shoulder adduction": ["latissimus-dorsi", "pectoralis-major"],
  "shoulder internal rotation": ["subscapularis", "pectoralis-major", "latissimus-dorsi", "anterior-deltoid"],
  "shoulder external rotation": ["infraspinatus", "teres-minor", "posterior-deltoid"],
  "horizontal adduction": ["pectoralis-major", "anterior-deltoid"],
  "horizontal abduction": ["posterior-deltoid", "infraspinatus", "teres-minor", "mid-trapezius", "rhomboids"],
  "scapular retraction": ["mid-trapezius", "rhomboids"],
  "scapular protraction": ["pectoralis-minor", "pectoralis-major"],
  "scapular elevation": ["upper-trapezius", "levator-scapulae"],
  "scapular depression": ["lower-trapezius"],
  "elbow flexion": ["biceps-brachii"],
  "elbow extension": ["triceps-brachii"],
  "neck flexion": ["scm", "deep-cervical-flexors"],
  "neck extension": ["upper-trapezius", "levator-scapulae"],
};

// ── Compensation patterns for Corrective Exercise Finder ────
const compensationPatterns: {
  id: string;
  name: string;
  description: string;
  overactiveMuscles: string[];
  underactiveMuscles: string[];
  assessment: string;
}[] = [
  {
    id: "knee-valgus",
    name: "Knee Valgus (Knees Cave In)",
    description: "Knees move medially past the toes during squat or landing",
    overactiveMuscles: ["adductors", "tfl", "vastus-lateralis", "gastrocnemius", "soleus", "biceps-femoris"],
    underactiveMuscles: ["gluteus-medius", "gluteus-maximus", "vastus-medialis", "tibialis-anterior"],
    assessment: "Overhead Squat Assessment",
  },
  {
    id: "excessive-forward-lean",
    name: "Excessive Forward Lean",
    description: "Torso leans excessively forward during squat, arms fall forward",
    overactiveMuscles: ["iliopsoas", "rectus-femoris", "erector-spinae", "latissimus-dorsi", "gastrocnemius", "soleus"],
    underactiveMuscles: ["gluteus-maximus", "rectus-abdominis", "transverse-abdominis", "tibialis-anterior"],
    assessment: "Overhead Squat Assessment",
  },
  {
    id: "anterior-pelvic-tilt",
    name: "Anterior Pelvic Tilt (Lower Crossed Syndrome)",
    description: "Pelvis tilts forward, excessive lumbar lordosis",
    overactiveMuscles: ["iliopsoas", "rectus-femoris", "erector-spinae", "latissimus-dorsi"],
    underactiveMuscles: ["gluteus-maximus", "rectus-abdominis", "transverse-abdominis"],
    assessment: "Static Postural Assessment",
  },
  {
    id: "upper-crossed-syndrome",
    name: "Upper Crossed Syndrome",
    description: "Rounded shoulders, forward head posture, scapular protraction",
    overactiveMuscles: ["upper-trapezius", "levator-scapulae", "pectoralis-major", "pectoralis-minor", "scm", "latissimus-dorsi", "subscapularis"],
    underactiveMuscles: ["mid-trapezius", "lower-trapezius", "rhomboids", "deep-cervical-flexors", "infraspinatus", "teres-minor", "posterior-deltoid"],
    assessment: "Overhead Squat Assessment / Static Postural Assessment",
  },
  {
    id: "feet-turn-out",
    name: "Feet Turn Out",
    description: "Feet externally rotate during squat assessment",
    overactiveMuscles: ["soleus", "gastrocnemius", "biceps-femoris"],
    underactiveMuscles: ["tibialis-anterior", "gluteus-medius", "gluteus-maximus"],
    assessment: "Overhead Squat Assessment",
  },
  {
    id: "arms-fall-forward",
    name: "Arms Fall Forward",
    description: "Arms cannot stay in line with torso during overhead squat",
    overactiveMuscles: ["latissimus-dorsi", "pectoralis-major", "pectoralis-minor"],
    underactiveMuscles: ["mid-trapezius", "lower-trapezius", "rhomboids", "posterior-deltoid"],
    assessment: "Overhead Squat Assessment",
  },
  {
    id: "low-back-arch",
    name: "Excessive Low Back Arch",
    description: "Lumbar spine hyperextends during overhead squat or pressing",
    overactiveMuscles: ["iliopsoas", "erector-spinae", "latissimus-dorsi"],
    underactiveMuscles: ["gluteus-maximus", "rectus-abdominis", "transverse-abdominis", "internal-obliques"],
    assessment: "Overhead Squat Assessment",
  },
  {
    id: "shoulder-elevation",
    name: "Shoulder Elevation",
    description: "Shoulders elevate (shrug up) during pressing or overhead movements",
    overactiveMuscles: ["upper-trapezius", "levator-scapulae"],
    underactiveMuscles: ["lower-trapezius", "mid-trapezius"],
    assessment: "Overhead Squat Assessment / Pushing Assessment",
  },
];

// ── Muscle zone definitions for the body diagram ──────────────────────
type Zone = {
  muscleId: string;
  label: string;
  top: number;
  left: number;
  width: number;
  height: number;
  shape: "rect" | "oval";
  view: "front" | "back";
};

const zones: Zone[] = [
  // ── FRONT VIEW ──────────────────────────────────────────
  { muscleId: "scm", label: "SCM", top: 11, left: 40, width: 8, height: 4, shape: "oval", view: "front" },
  { muscleId: "scm", label: "SCM", top: 11, left: 52, width: 8, height: 4, shape: "oval", view: "front" },
  { muscleId: "deep-cervical-flexors", label: "Deep Cervical\nFlexors", top: 11, left: 45, width: 10, height: 3, shape: "oval", view: "front" },
  { muscleId: "anterior-deltoid", label: "Ant. Deltoid", top: 17, left: 27, width: 11, height: 5, shape: "oval", view: "front" },
  { muscleId: "anterior-deltoid", label: "Ant. Deltoid", top: 17, left: 62, width: 11, height: 5, shape: "oval", view: "front" },
  { muscleId: "medial-deltoid", label: "Med. Deltoid", top: 16.5, left: 24, width: 7, height: 5, shape: "oval", view: "front" },
  { muscleId: "medial-deltoid", label: "Med. Deltoid", top: 16.5, left: 69, width: 7, height: 5, shape: "oval", view: "front" },
  { muscleId: "pectoralis-major", label: "Pec Major", top: 20, left: 33, width: 14, height: 7, shape: "oval", view: "front" },
  { muscleId: "pectoralis-major", label: "Pec Major", top: 20, left: 53, width: 14, height: 7, shape: "oval", view: "front" },
  { muscleId: "pectoralis-minor", label: "Pec Minor", top: 21, left: 36, width: 8, height: 4, shape: "oval", view: "front" },
  { muscleId: "pectoralis-minor", label: "Pec Minor", top: 21, left: 56, width: 8, height: 4, shape: "oval", view: "front" },
  { muscleId: "biceps-brachii", label: "Biceps", top: 24, left: 19, width: 8, height: 8, shape: "oval", view: "front" },
  { muscleId: "biceps-brachii", label: "Biceps", top: 24, left: 73, width: 8, height: 8, shape: "oval", view: "front" },
  { muscleId: "rectus-abdominis", label: "Rectus\nAbdominis", top: 28, left: 42, width: 16, height: 10, shape: "rect", view: "front" },
  { muscleId: "transverse-abdominis", label: "TVA", top: 35, left: 40, width: 20, height: 4, shape: "oval", view: "front" },
  { muscleId: "external-obliques", label: "Ext. Obliques", top: 30, left: 33, width: 9, height: 8, shape: "oval", view: "front" },
  { muscleId: "external-obliques", label: "Ext. Obliques", top: 30, left: 58, width: 9, height: 8, shape: "oval", view: "front" },
  { muscleId: "internal-obliques", label: "Int. Obliques", top: 32, left: 35, width: 7, height: 5, shape: "oval", view: "front" },
  { muscleId: "internal-obliques", label: "Int. Obliques", top: 32, left: 58, width: 7, height: 5, shape: "oval", view: "front" },
  { muscleId: "iliopsoas", label: "Hip Flexors", top: 38, left: 37, width: 10, height: 5, shape: "oval", view: "front" },
  { muscleId: "iliopsoas", label: "Hip Flexors", top: 38, left: 53, width: 10, height: 5, shape: "oval", view: "front" },
  { muscleId: "tfl", label: "TFL", top: 40, left: 33, width: 7, height: 4, shape: "oval", view: "front" },
  { muscleId: "tfl", label: "TFL", top: 40, left: 60, width: 7, height: 4, shape: "oval", view: "front" },
  { muscleId: "rectus-femoris", label: "Rectus\nFemoris", top: 45, left: 39, width: 9, height: 12, shape: "oval", view: "front" },
  { muscleId: "rectus-femoris", label: "Rectus\nFemoris", top: 45, left: 52, width: 9, height: 12, shape: "oval", view: "front" },
  { muscleId: "vastus-lateralis", label: "Vastus\nLateralis", top: 46, left: 33, width: 8, height: 11, shape: "oval", view: "front" },
  { muscleId: "vastus-lateralis", label: "Vastus\nLateralis", top: 46, left: 59, width: 8, height: 11, shape: "oval", view: "front" },
  { muscleId: "vastus-medialis", label: "VMO", top: 52, left: 40, width: 7, height: 5, shape: "oval", view: "front" },
  { muscleId: "vastus-medialis", label: "VMO", top: 52, left: 53, width: 7, height: 5, shape: "oval", view: "front" },
  { muscleId: "adductors", label: "Adductors", top: 45, left: 43, width: 6, height: 10, shape: "oval", view: "front" },
  { muscleId: "adductors", label: "Adductors", top: 45, left: 51, width: 6, height: 10, shape: "oval", view: "front" },
  { muscleId: "tibialis-anterior", label: "Tibialis\nAnterior", top: 63, left: 37, width: 7, height: 10, shape: "oval", view: "front" },
  { muscleId: "tibialis-anterior", label: "Tibialis\nAnterior", top: 63, left: 56, width: 7, height: 10, shape: "oval", view: "front" },

  // ── BACK VIEW ───────────────────────────────────────────
  { muscleId: "upper-trapezius", label: "Upper Traps", top: 13, left: 35, width: 12, height: 5, shape: "oval", view: "back" },
  { muscleId: "upper-trapezius", label: "Upper Traps", top: 13, left: 53, width: 12, height: 5, shape: "oval", view: "back" },
  { muscleId: "levator-scapulae", label: "Levator\nScapulae", top: 11, left: 38, width: 7, height: 5, shape: "oval", view: "back" },
  { muscleId: "levator-scapulae", label: "Levator\nScapulae", top: 11, left: 55, width: 7, height: 5, shape: "oval", view: "back" },
  { muscleId: "posterior-deltoid", label: "Post. Deltoid", top: 17, left: 25, width: 10, height: 5, shape: "oval", view: "back" },
  { muscleId: "posterior-deltoid", label: "Post. Deltoid", top: 17, left: 65, width: 10, height: 5, shape: "oval", view: "back" },
  { muscleId: "supraspinatus", label: "Supra-\nspinatus", top: 16, left: 35, width: 12, height: 3, shape: "oval", view: "back" },
  { muscleId: "supraspinatus", label: "Supra-\nspinatus", top: 16, left: 53, width: 12, height: 3, shape: "oval", view: "back" },
  { muscleId: "infraspinatus", label: "Infra-\nspinatus", top: 20, left: 35, width: 12, height: 5, shape: "oval", view: "back" },
  { muscleId: "infraspinatus", label: "Infra-\nspinatus", top: 20, left: 53, width: 12, height: 5, shape: "oval", view: "back" },
  { muscleId: "teres-minor", label: "Teres\nMinor", top: 22, left: 31, width: 7, height: 3, shape: "oval", view: "back" },
  { muscleId: "teres-minor", label: "Teres\nMinor", top: 22, left: 62, width: 7, height: 3, shape: "oval", view: "back" },
  { muscleId: "subscapularis", label: "Subscap.", top: 20, left: 42, width: 8, height: 5, shape: "oval", view: "back" },
  { muscleId: "subscapularis", label: "Subscap.", top: 20, left: 50, width: 8, height: 5, shape: "oval", view: "back" },
  { muscleId: "mid-trapezius", label: "Mid Traps", top: 19, left: 40, width: 8, height: 4, shape: "oval", view: "back" },
  { muscleId: "mid-trapezius", label: "Mid Traps", top: 19, left: 52, width: 8, height: 4, shape: "oval", view: "back" },
  { muscleId: "lower-trapezius", label: "Lower Traps", top: 24, left: 40, width: 8, height: 5, shape: "oval", view: "back" },
  { muscleId: "lower-trapezius", label: "Lower Traps", top: 24, left: 52, width: 8, height: 5, shape: "oval", view: "back" },
  { muscleId: "rhomboids", label: "Rhomboids", top: 20, left: 38, width: 6, height: 7, shape: "oval", view: "back" },
  { muscleId: "rhomboids", label: "Rhomboids", top: 20, left: 56, width: 6, height: 7, shape: "oval", view: "back" },
  { muscleId: "latissimus-dorsi", label: "Lats", top: 26, left: 30, width: 14, height: 10, shape: "oval", view: "back" },
  { muscleId: "latissimus-dorsi", label: "Lats", top: 26, left: 56, width: 14, height: 10, shape: "oval", view: "back" },
  { muscleId: "triceps-brachii", label: "Triceps", top: 24, left: 19, width: 8, height: 8, shape: "oval", view: "back" },
  { muscleId: "triceps-brachii", label: "Triceps", top: 24, left: 73, width: 8, height: 8, shape: "oval", view: "back" },
  { muscleId: "erector-spinae", label: "Erector\nSpinae", top: 30, left: 43, width: 6, height: 10, shape: "rect", view: "back" },
  { muscleId: "erector-spinae", label: "Erector\nSpinae", top: 30, left: 51, width: 6, height: 10, shape: "rect", view: "back" },
  { muscleId: "quadratus-lumborum", label: "QL", top: 34, left: 38, width: 7, height: 5, shape: "oval", view: "back" },
  { muscleId: "quadratus-lumborum", label: "QL", top: 34, left: 55, width: 7, height: 5, shape: "oval", view: "back" },
  { muscleId: "gluteus-maximus", label: "Glute Max", top: 40, left: 35, width: 13, height: 8, shape: "oval", view: "back" },
  { muscleId: "gluteus-maximus", label: "Glute Max", top: 40, left: 52, width: 13, height: 8, shape: "oval", view: "back" },
  { muscleId: "gluteus-medius", label: "Glute Med", top: 38, left: 33, width: 10, height: 5, shape: "oval", view: "back" },
  { muscleId: "gluteus-medius", label: "Glute Med", top: 38, left: 57, width: 10, height: 5, shape: "oval", view: "back" },
  { muscleId: "biceps-femoris", label: "Biceps\nFemoris", top: 49, left: 33, width: 9, height: 12, shape: "oval", view: "back" },
  { muscleId: "biceps-femoris", label: "Biceps\nFemoris", top: 49, left: 58, width: 9, height: 12, shape: "oval", view: "back" },
  { muscleId: "semitendinosus", label: "Semi-T", top: 49, left: 42, width: 7, height: 12, shape: "oval", view: "back" },
  { muscleId: "semitendinosus", label: "Semi-T", top: 49, left: 51, width: 7, height: 12, shape: "oval", view: "back" },
  { muscleId: "semimembranosus", label: "Semi-M", top: 50, left: 40, width: 6, height: 10, shape: "oval", view: "back" },
  { muscleId: "semimembranosus", label: "Semi-M", top: 50, left: 54, width: 6, height: 10, shape: "oval", view: "back" },
  { muscleId: "gastrocnemius", label: "Gastroc", top: 63, left: 35, width: 10, height: 9, shape: "oval", view: "back" },
  { muscleId: "gastrocnemius", label: "Gastroc", top: 63, left: 55, width: 10, height: 9, shape: "oval", view: "back" },
  { muscleId: "soleus", label: "Soleus", top: 70, left: 36, width: 8, height: 7, shape: "oval", view: "back" },
  { muscleId: "soleus", label: "Soleus", top: 70, left: 56, width: 8, height: 7, shape: "oval", view: "back" },
];

const groupColors: Record<Muscle["group"], { bg: string; border: string; text: string }> = {
  upper: { bg: "bg-blue-500/25", border: "border-blue-400/60", text: "text-blue-300" },
  core: { bg: "bg-purple-500/25", border: "border-purple-400/60", text: "text-purple-300" },
  lower: { bg: "bg-emerald-500/25", border: "border-emerald-400/60", text: "text-emerald-300" },
};

const groupLabels: Record<Muscle["group"], string> = {
  upper: "Upper Body",
  core: "Core",
  lower: "Lower Body",
};

// ── Body silhouette SVG ──────────────────────────────────────
function BodySilhouette({ facing }: { facing: "front" | "back" }) {
  return (
    <svg
      viewBox="0 0 200 400"
      className="absolute inset-0 w-full h-full pointer-events-none"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(156 163 175 / 0.15)" />
          <stop offset="100%" stopColor="rgb(156 163 175 / 0.05)" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="28" rx="18" ry="22" fill="url(#bodyGrad)" stroke="rgb(156 163 175 / 0.4)" />
      <rect x="91" y="48" width="18" height="12" rx="4" fill="url(#bodyGrad)" stroke="rgb(156 163 175 / 0.3)" />
      <path
        d={
          facing === "front"
            ? "M62 60 Q58 60 52 68 L46 80 Q42 90 44 100 L46 130 Q47 145 50 155 L56 160 Q70 166 100 166 Q130 166 144 160 L150 155 Q153 145 154 130 L156 100 Q158 90 154 80 L148 68 Q142 60 138 60 Z"
            : "M62 60 Q58 60 52 68 L46 80 Q42 90 44 100 L46 130 Q47 145 50 155 L56 160 Q70 166 100 166 Q130 166 144 160 L150 155 Q153 145 154 130 L156 100 Q158 90 154 80 L148 68 Q142 60 138 60 Z"
        }
        fill="url(#bodyGrad)"
        stroke="rgb(156 163 175 / 0.35)"
      />
      <path d="M52 68 Q38 72 30 90 L22 120 Q18 135 20 150 L24 160" fill="none" stroke="rgb(156 163 175 / 0.3)" />
      <path d="M52 68 Q44 70 40 78" fill="none" stroke="rgb(156 163 175 / 0.2)" />
      <path d="M148 68 Q162 72 170 90 L178 120 Q182 135 180 150 L176 160" fill="none" stroke="rgb(156 163 175 / 0.3)" />
      <path d="M148 68 Q156 70 160 78" fill="none" stroke="rgb(156 163 175 / 0.2)" />
      <path d="M56 160 Q60 175 64 180 L80 182 Q100 184 120 182 L136 180 Q140 175 144 160" fill="url(#bodyGrad)" stroke="rgb(156 163 175 / 0.3)" />
      <path d="M80 182 Q76 200 74 230 L72 270 Q71 290 72 310 L74 340 Q75 360 76 380" fill="none" stroke="rgb(156 163 175 / 0.3)" />
      <path d="M64 180 Q66 200 68 230 L66 260 Q64 280 65 300 L66 340 Q66 360 64 380" fill="none" stroke="rgb(156 163 175 / 0.3)" />
      <path d="M120 182 Q124 200 126 230 L128 270 Q129 290 128 310 L126 340 Q125 360 124 380" fill="none" stroke="rgb(156 163 175 / 0.3)" />
      <path d="M136 180 Q134 200 132 230 L134 260 Q136 280 135 300 L134 340 Q134 360 136 380" fill="none" stroke="rgb(156 163 175 / 0.3)" />
    </svg>
  );
}

// ── Corrective Step Component ─────────────────────────────
function CorrectiveStep({ step, number, color, label }: { step: string; number: number; color: string; label: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0 text-xs font-bold`}>
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function AnatomyPage() {
  const [view, setView] = useState<"front" | "back">("front");
  const [selectedMuscle, setSelectedMuscle] = useState<Muscle | null>(null);
  const [groupFilter, setGroupFilter] = useState<"all" | Muscle["group"]>("all");
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);
  const [mode, setMode] = useState<"atlas" | "corrective">("atlas");
  const [selectedCompensation, setSelectedCompensation] = useState<string | null>(null);

  const muscleMap = useMemo(() => {
    const map = new Map<string, Muscle>();
    for (const m of muscles) map.set(m.id, m);
    return map;
  }, []);

  // Movement pattern search: find muscles that match a movement pattern query
  const movementMatchIds = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase().trim();
    const matchedIds = new Set<string>();

    // Check movement patterns
    for (const [pattern, muscleIds] of Object.entries(movementPatterns)) {
      if (pattern.includes(q) || q.includes(pattern)) {
        for (const id of muscleIds) matchedIds.add(id);
      }
    }

    return matchedIds.size > 0 ? matchedIds : null;
  }, [search]);

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (z.view !== view) return false;
      const m = muscleMap.get(z.muscleId);
      if (!m) return false;
      if (groupFilter !== "all" && m.group !== groupFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
        const actionMatch = m.action.toLowerCase().includes(q);
        const movementMatch = movementMatchIds?.has(m.id);
        if (!nameMatch && !actionMatch && !movementMatch) return false;
      }
      return true;
    });
  }, [view, groupFilter, search, muscleMap, movementMatchIds]);

  const filteredMuscles = useMemo(() => {
    return muscles.filter((m) => {
      if (groupFilter !== "all" && m.group !== groupFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
        const actionMatch = m.action.toLowerCase().includes(q);
        const movementMatch = movementMatchIds?.has(m.id);
        if (!nameMatch && !actionMatch && !movementMatch) return false;
      }
      return true;
    });
  }, [groupFilter, search, movementMatchIds]);

  const uniqueVisibleIds = useMemo(() => {
    const ids = new Set<string>();
    for (const z of filteredZones) ids.add(z.muscleId);
    return ids;
  }, [filteredZones]);

  const selectedPattern = useMemo(() => {
    return compensationPatterns.find((p) => p.id === selectedCompensation) ?? null;
  }, [selectedCompensation]);

  function handleZoneClick(muscleId: string) {
    const m = muscleMap.get(muscleId) ?? null;
    setSelectedMuscle(m);
    setShowList(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800 px-4 pt-3 pb-2">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold tracking-tight">Anatomy Explorer</h1>
            <Link
              href="/dashboard"
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Back
            </Link>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-800 mb-2">
            <button
              onClick={() => { setMode("atlas"); setSelectedCompensation(null); }}
              className={`flex-1 py-2 text-sm font-medium transition-all ${
                mode === "atlas"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-900 text-gray-500 hover:text-gray-300"
              }`}
            >
              Muscle Atlas
            </button>
            <button
              onClick={() => { setMode("corrective"); setSelectedMuscle(null); }}
              className={`flex-1 py-2 text-sm font-medium transition-all ${
                mode === "corrective"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-900 text-gray-500 hover:text-gray-300"
              }`}
            >
              Corrective Finder
            </button>
          </div>

          {mode === "atlas" && (
            <>
              {/* Search */}
              <div className="relative mb-2">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search muscles or movements (e.g. 'hip flexion')..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowList(true)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); setShowList(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Movement pattern suggestions */}
              {search && movementMatchIds && movementMatchIds.size > 0 && (
                <div className="mb-2 px-1">
                  <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mb-1">Movement pattern match</p>
                  <p className="text-xs text-gray-400">{movementMatchIds.size} muscle{movementMatchIds.size !== 1 ? "s" : ""} involved in this movement</p>
                </div>
              )}

              {/* Filters */}
              <div className="flex gap-2 mb-2">
                {(["all", "upper", "core", "lower"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setGroupFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      groupFilter === f
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                    }`}
                  >
                    {f === "all" ? "All" : f === "upper" ? "Upper" : f === "core" ? "Core" : "Lower"}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className="flex rounded-xl overflow-hidden border border-gray-800">
                <button
                  onClick={() => setView("front")}
                  className={`flex-1 py-2 text-sm font-medium transition-all ${
                    view === "front" ? "bg-gray-800 text-white" : "bg-gray-900 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Front View
                </button>
                <button
                  onClick={() => setView("back")}
                  className={`flex-1 py-2 text-sm font-medium transition-all ${
                    view === "back" ? "bg-gray-800 text-white" : "bg-gray-900 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Back View
                </button>
              </div>

              {/* Legend */}
              <div className="flex gap-3 mt-2 text-[10px] text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/40 border border-blue-400/60" /> Upper
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-500/40 border border-purple-400/60" /> Core
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-400/60" /> Lower
                </span>
                <span className="ml-auto text-gray-600">{uniqueVisibleIds.size} muscles shown</span>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative overflow-hidden">
        {mode === "corrective" ? (
          /* Corrective Exercise Finder Mode */
          <div className="max-w-lg mx-auto px-4 py-4 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
            <p className="text-sm text-gray-400 mb-3">Select a compensation pattern to see the overactive/underactive muscles and full corrective protocol.</p>

            {/* Compensation pattern selector */}
            <div className="space-y-2 mb-4">
              {compensationPatterns.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => setSelectedCompensation(selectedCompensation === pattern.id ? null : pattern.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    selectedCompensation === pattern.id
                      ? "bg-amber-500/15 border-amber-500/50 ring-2 ring-amber-500/20"
                      : "bg-gray-900 border-gray-800 hover:border-gray-600"
                  }`}
                >
                  <p className={`font-semibold text-sm ${selectedCompensation === pattern.id ? "text-amber-300" : "text-white"}`}>
                    {pattern.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{pattern.description}</p>
                </button>
              ))}
            </div>

            {/* Selected compensation details */}
            {selectedPattern && (
              <div className="space-y-4 pb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Assessment</p>
                  <p className="text-sm text-gray-300">{selectedPattern.assessment}</p>
                </div>

                {/* Overactive muscles */}
                <div>
                  <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Overactive (Shorten) - Inhibit & Lengthen
                  </h3>
                  <div className="space-y-2">
                    {selectedPattern.overactiveMuscles.map((id) => {
                      const m = muscleMap.get(id);
                      if (!m) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => { setSelectedMuscle(m); }}
                          className="w-full text-left bg-red-500/10 border border-red-500/30 rounded-xl p-3 hover:brightness-125 transition-all"
                        >
                          <p className="font-semibold text-sm text-red-300">{m.name}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-400"><span className="text-red-400 font-medium">Inhibit:</span> {m.correctiveExercise.inhibit}</p>
                            <p className="text-xs text-gray-400"><span className="text-red-400 font-medium">Lengthen:</span> {m.correctiveExercise.lengthen}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Underactive muscles */}
                <div>
                  <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Underactive (Lengthened) - Activate & Integrate
                  </h3>
                  <div className="space-y-2">
                    {selectedPattern.underactiveMuscles.map((id) => {
                      const m = muscleMap.get(id);
                      if (!m) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => { setSelectedMuscle(m); }}
                          className="w-full text-left bg-green-500/10 border border-green-500/30 rounded-xl p-3 hover:brightness-125 transition-all"
                        >
                          <p className="font-semibold text-sm text-green-300">{m.name}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-400"><span className="text-green-400 font-medium">Activate:</span> {m.correctiveExercise.activate}</p>
                            <p className="text-xs text-gray-400"><span className="text-green-400 font-medium">Integrate:</span> {m.correctiveExercise.integrate}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Full corrective protocol summary */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Full Corrective Protocol</h3>
                  <div className="space-y-3">
                    <CorrectiveStep
                      number={1}
                      label="Step 1: Inhibit (SMR)"
                      color="bg-red-500/20 text-red-400"
                      step={selectedPattern.overactiveMuscles
                        .map((id) => muscleMap.get(id)?.correctiveExercise.inhibit)
                        .filter(Boolean)
                        .slice(0, 3)
                        .join(" | ")}
                    />
                    <CorrectiveStep
                      number={2}
                      label="Step 2: Lengthen (Stretch)"
                      color="bg-orange-500/20 text-orange-400"
                      step={selectedPattern.overactiveMuscles
                        .map((id) => muscleMap.get(id)?.correctiveExercise.lengthen)
                        .filter(Boolean)
                        .slice(0, 3)
                        .join(" | ")}
                    />
                    <CorrectiveStep
                      number={3}
                      label="Step 3: Activate (Isolate)"
                      color="bg-green-500/20 text-green-400"
                      step={selectedPattern.underactiveMuscles
                        .map((id) => muscleMap.get(id)?.correctiveExercise.activate)
                        .filter(Boolean)
                        .slice(0, 3)
                        .join(" | ")}
                    />
                    <CorrectiveStep
                      number={4}
                      label="Step 4: Integrate (Compound)"
                      color="bg-blue-500/20 text-blue-400"
                      step={selectedPattern.underactiveMuscles
                        .map((id) => muscleMap.get(id)?.correctiveExercise.integrate)
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(" | ")}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : showList && search ? (
          /* Search results list */
          <div className="max-w-lg mx-auto px-4 py-3 space-y-2 overflow-y-auto max-h-[60vh]">
            {filteredMuscles.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No muscles found for &ldquo;{search}&rdquo;</p>
            )}
            {filteredMuscles.map((m) => {
              const colors = groupColors[m.group];
              return (
                <button
                  key={m.id}
                  onClick={() => { setSelectedMuscle(m); setShowList(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl border ${colors.border} ${colors.bg} hover:brightness-125 transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`font-semibold text-sm ${colors.text}`}>{m.name}</span>
                      <span className="block text-xs text-gray-400 mt-0.5">{m.location}</span>
                    </div>
                    <div className="flex gap-1">
                      {m.typicallyOveractive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">OA</span>
                      )}
                      {m.typicallyUnderactive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">UA</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Body diagram */
          <div className="max-w-lg mx-auto relative w-full" style={{ aspectRatio: "1 / 2" }}>
            <BodySilhouette facing={view} />

            {filteredZones.map((zone, i) => {
              const m = muscleMap.get(zone.muscleId)!;
              const colors = groupColors[m.group];
              const isSelected = selectedMuscle?.id === zone.muscleId;

              return (
                <button
                  key={`${zone.muscleId}-${zone.view}-${i}`}
                  onClick={() => handleZoneClick(zone.muscleId)}
                  title={m.name}
                  className={`absolute flex items-center justify-center text-center transition-all duration-150
                    ${zone.shape === "oval" ? "rounded-full" : "rounded-lg"}
                    ${colors.bg} border ${colors.border}
                    hover:brightness-150 hover:scale-105 active:scale-95
                    ${isSelected ? "ring-2 ring-white/60 brightness-150 z-20" : "z-10"}
                    min-w-[48px] min-h-[48px]
                  `}
                  style={{
                    top: `${zone.top}%`,
                    left: `${zone.left}%`,
                    width: `${Math.max(zone.width, 8)}%`,
                    height: `${Math.max(zone.height, 4)}%`,
                  }}
                  aria-label={m.name}
                >
                  <span className={`text-[9px] leading-tight font-medium pointer-events-none ${colors.text} whitespace-pre-line drop-shadow-sm`}>
                    {zone.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail panel */}
      {selectedMuscle && (
        <div
          className="fixed inset-x-0 bottom-0 z-40"
          style={{ animation: "slideUp 0.25s ease-out forwards" }}
        >
          <div
            className="absolute inset-0 -top-[100vh] bg-black/40"
            onClick={() => setSelectedMuscle(null)}
          />

          <div className="relative bg-gray-900 border-t border-gray-700 rounded-t-2xl max-h-[80vh] overflow-y-auto pb-20">
            {/* Handle */}
            <div className="sticky top-0 bg-gray-900 rounded-t-2xl pt-3 pb-2 px-5 z-10">
              <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-3" />
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold">{selectedMuscle.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${groupColors[selectedMuscle.group].bg} ${groupColors[selectedMuscle.group].text} border ${groupColors[selectedMuscle.group].border}`}>
                      {groupLabels[selectedMuscle.group]}
                    </span>
                    {selectedMuscle.typicallyOveractive && (
                      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        Typically Overactive
                      </span>
                    )}
                    {selectedMuscle.typicallyUnderactive && (
                      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                        Typically Underactive
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMuscle(null)}
                  className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Close panel"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-5 space-y-4 pb-4">
              {/* Location */}
              <Section title="Location" content={selectedMuscle.location} />

              {/* Actions: Concentric, Eccentric, Isometric */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 space-y-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Muscle Actions</h3>
                <div>
                  <p className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Concentric</p>
                  <p className="text-sm text-gray-300">{selectedMuscle.concentricAction}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Eccentric</p>
                  <p className="text-sm text-gray-300">{selectedMuscle.eccentricAction}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Isometric Example</p>
                  <p className="text-sm text-gray-300">{selectedMuscle.isometricExample}</p>
                </div>
              </div>

              {/* Origin & Insertion */}
              <div className="grid grid-cols-2 gap-3">
                <Section title="Origin" content={selectedMuscle.origin} />
                <Section title="Insertion" content={selectedMuscle.insertion} />
              </div>

              {/* Corrective Exercise Protocol (4-step visual) */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-3">NASM Corrective Protocol</h3>
                <div className="space-y-3">
                  <CorrectiveStep number={1} label="Inhibit (SMR)" color="bg-red-500/20 text-red-400" step={selectedMuscle.correctiveExercise.inhibit} />
                  <CorrectiveStep number={2} label="Lengthen (Stretch)" color="bg-orange-500/20 text-orange-400" step={selectedMuscle.correctiveExercise.lengthen} />
                  <CorrectiveStep number={3} label="Activate (Isolate)" color="bg-green-500/20 text-green-400" step={selectedMuscle.correctiveExercise.activate} />
                  <CorrectiveStep number={4} label="Integrate (Compound)" color="bg-blue-500/20 text-blue-400" step={selectedMuscle.correctiveExercise.integrate} />
                </div>
              </div>

              {/* Assessment Link */}
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
                <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-1">Revealed by Assessment</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedMuscle.assessmentLink}</p>
              </div>

              {/* Common Imbalance */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">Common Imbalance</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedMuscle.commonImbalance}</p>
              </div>

              {/* Exercises */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Exercises</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMuscle.exercises.map((ex) => (
                    <span key={ex} className="px-3 py-1.5 bg-gray-800 rounded-lg text-sm text-gray-300 border border-gray-700">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>

              {/* NASM Tip */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">NASM Exam Tip</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedMuscle.nasmTip}</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Link
                  href={`/coach?chapter=2&topic=${encodeURIComponent(selectedMuscle.name)}`}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Study with AI
                </Link>
                <Link
                  href="/quiz"
                  className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold text-center border border-gray-700 transition-colors"
                >
                  Quiz Me
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</h3>
      <p className="text-sm text-gray-300 leading-relaxed">{content}</p>
    </div>
  );
}
