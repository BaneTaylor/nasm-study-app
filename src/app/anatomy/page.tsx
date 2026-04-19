"use client";

import { useState, useMemo, useCallback } from "react";
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

// ── Color system ────────────────────────────────────────────
const groupFills: Record<Muscle["group"], { base: string; hover: string; selected: string; glow: string }> = {
  upper: {
    base: "rgba(59, 130, 246, 0.25)",
    hover: "rgba(59, 130, 246, 0.45)",
    selected: "rgba(59, 130, 246, 0.6)",
    glow: "rgba(59, 130, 246, 0.8)",
  },
  core: {
    base: "rgba(168, 85, 247, 0.25)",
    hover: "rgba(168, 85, 247, 0.45)",
    selected: "rgba(168, 85, 247, 0.6)",
    glow: "rgba(168, 85, 247, 0.8)",
  },
  lower: {
    base: "rgba(34, 197, 94, 0.25)",
    hover: "rgba(34, 197, 94, 0.45)",
    selected: "rgba(34, 197, 94, 0.6)",
    glow: "rgba(34, 197, 94, 0.8)",
  },
};

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

// ── SVG Muscle region paths ─────────────────────────────────
// Each region maps a muscle ID to SVG path data for each view
// Viewbox: 0 0 300 700 for front/back, 0 0 200 700 for side
type MuscleRegion = {
  muscleId: string;
  label: string;
  paths: string[];
  view: "front" | "back" | "side";
  labelPos: { x: number; y: number };
};

const muscleRegions: MuscleRegion[] = [
  // ══════════════════════════════════════════════════════════
  // FRONT VIEW — viewBox 0 0 300 700
  // ══════════════════════════════════════════════════════════

  // -- Anterior Deltoids (shoulder cap front) --
  {
    muscleId: "anterior-deltoid",
    label: "Ant.\nDeltoid",
    view: "front",
    labelPos: { x: 88, y: 172 },
    paths: [
      // Left deltoid
      "M104,155 C96,155 88,160 84,168 C80,176 82,185 86,190 C92,186 100,182 108,180 C112,175 112,165 108,158 C106,156 105,155 104,155 Z",
      // Right deltoid
      "M196,155 C204,155 212,160 216,168 C220,176 218,185 214,190 C208,186 200,182 192,180 C188,175 188,165 192,158 C194,156 195,155 196,155 Z",
    ],
  },

  // -- Pectoralis Major (chest) --
  {
    muscleId: "pectoralis-major",
    label: "Pectoralis\nMajor",
    view: "front",
    labelPos: { x: 150, y: 195 },
    paths: [
      // Left pec
      "M108,178 C100,182 90,188 86,192 C90,200 96,210 104,216 C112,222 122,224 132,222 C138,220 142,214 144,208 C144,200 140,192 134,184 C128,178 118,176 108,178 Z",
      // Right pec
      "M192,178 C200,182 210,188 214,192 C210,200 204,210 196,216 C188,222 178,224 168,222 C162,220 158,214 156,208 C156,200 160,192 166,184 C172,178 182,176 192,178 Z",
    ],
  },

  // -- Biceps (front upper arm) --
  {
    muscleId: "biceps-brachii",
    label: "Biceps",
    view: "front",
    labelPos: { x: 72, y: 228 },
    paths: [
      // Left bicep
      "M82,194 C76,198 72,206 70,216 C68,228 68,240 70,250 C72,256 76,260 80,258 C84,254 86,244 86,234 C86,224 86,214 88,204 C88,198 86,194 82,194 Z",
      // Right bicep
      "M218,194 C224,198 228,206 230,216 C232,228 232,240 230,250 C228,256 224,260 220,258 C216,254 214,244 214,234 C214,224 214,214 212,204 C212,198 214,194 218,194 Z",
    ],
  },

  // -- Rectus Abdominis (6-pack) --
  {
    muscleId: "rectus-abdominis",
    label: "Rectus\nAbdominis",
    view: "front",
    labelPos: { x: 150, y: 262 },
    paths: [
      "M134,224 C132,226 130,228 130,232 L128,260 C128,272 128,284 130,296 C132,302 136,306 142,306 L158,306 C164,306 168,302 170,296 C172,284 172,272 172,260 L170,232 C170,228 168,226 166,224 C162,222 156,220 150,220 C144,220 138,222 134,224 Z",
    ],
  },

  // -- External Obliques (side waist) --
  {
    muscleId: "external-obliques",
    label: "Obliques",
    view: "front",
    labelPos: { x: 115, y: 260 },
    paths: [
      // Left oblique
      "M128,230 C122,234 116,240 112,250 C108,262 106,276 108,290 C110,298 114,304 120,306 C126,304 130,298 130,290 L130,250 C130,242 130,236 128,230 Z",
      // Right oblique
      "M172,230 C178,234 184,240 188,250 C192,262 194,276 192,290 C190,298 186,304 180,306 C174,304 170,298 170,290 L170,250 C170,242 170,236 172,230 Z",
    ],
  },

  // -- Hip Flexors (front hip crease) --
  {
    muscleId: "iliopsoas",
    label: "Hip\nFlexors",
    view: "front",
    labelPos: { x: 126, y: 318 },
    paths: [
      // Left hip flexor
      "M126,306 C120,310 116,316 114,324 C112,330 114,336 118,338 C124,338 130,334 132,328 C134,320 134,312 132,306 C130,306 128,306 126,306 Z",
      // Right hip flexor
      "M174,306 C180,310 184,316 186,324 C188,330 186,336 182,338 C176,338 170,334 168,328 C166,320 166,312 168,306 C170,306 172,306 174,306 Z",
    ],
  },

  // -- TFL --
  {
    muscleId: "tfl",
    label: "TFL",
    view: "front",
    labelPos: { x: 108, y: 336 },
    paths: [
      // Left TFL
      "M110,320 C106,324 104,332 104,340 C104,348 106,354 110,356 C114,354 116,348 116,340 C116,332 114,326 110,320 Z",
      // Right TFL
      "M190,320 C194,324 196,332 196,340 C196,348 194,354 190,356 C186,354 184,348 184,340 C184,332 186,326 190,320 Z",
    ],
  },

  // -- Rectus Femoris (front center thigh) --
  {
    muscleId: "rectus-femoris",
    label: "Rectus\nFemoris",
    view: "front",
    labelPos: { x: 128, y: 400 },
    paths: [
      // Left rectus femoris
      "M130,340 C126,348 122,360 120,376 C118,392 118,410 120,426 C122,436 126,442 132,444 C138,442 140,436 140,426 C140,410 140,392 138,376 C136,360 134,348 130,340 Z",
      // Right rectus femoris
      "M170,340 C174,348 178,360 180,376 C182,392 182,410 180,426 C178,436 174,442 168,444 C162,442 160,436 160,426 C160,410 160,392 162,376 C164,360 166,348 170,340 Z",
    ],
  },

  // -- Vastus Lateralis (outer thigh front) --
  {
    muscleId: "vastus-lateralis",
    label: "V.\nLat.",
    view: "front",
    labelPos: { x: 108, y: 400 },
    paths: [
      // Left VL
      "M116,342 C110,350 106,362 104,378 C102,396 102,414 104,430 C106,438 110,442 116,440 C120,436 122,426 122,414 C122,396 122,378 120,362 C118,350 118,344 116,342 Z",
      // Right VL
      "M184,342 C190,350 194,362 196,378 C198,396 198,414 196,430 C194,438 190,442 184,440 C180,436 178,426 178,414 C178,396 178,378 180,362 C182,350 182,344 184,342 Z",
    ],
  },

  // -- Vastus Medialis (inner thigh near knee) --
  {
    muscleId: "vastus-medialis",
    label: "VMO",
    view: "front",
    labelPos: { x: 140, y: 432 },
    paths: [
      // Left VMO
      "M134,420 C130,424 128,430 128,438 C128,444 130,448 134,450 C140,450 144,446 144,440 C144,432 142,426 138,422 C136,420 134,420 134,420 Z",
      // Right VMO
      "M166,420 C170,424 172,430 172,438 C172,444 170,448 166,450 C160,450 156,446 156,440 C156,432 158,426 162,422 C164,420 166,420 166,420 Z",
    ],
  },

  // -- Adductors (inner thigh) --
  {
    muscleId: "adductors",
    label: "Adductors",
    view: "front",
    labelPos: { x: 142, y: 380 },
    paths: [
      // Left adductors
      "M140,338 C136,346 132,358 130,374 C128,390 128,406 130,418 C132,424 136,426 140,424 C142,418 142,406 142,390 C142,374 142,358 140,338 Z",
      // Right adductors
      "M160,338 C164,346 168,358 170,374 C172,390 172,406 170,418 C168,424 164,426 160,424 C158,418 158,406 158,390 C158,374 158,358 160,338 Z",
    ],
  },

  // -- Tibialis Anterior (front shin) --
  {
    muscleId: "tibialis-anterior",
    label: "Tibialis\nAnterior",
    view: "front",
    labelPos: { x: 124, y: 510 },
    paths: [
      // Left tib ant
      "M124,460 C120,468 118,480 116,496 C114,512 114,528 116,540 C118,548 122,552 126,550 C128,544 128,532 128,516 C128,500 128,484 126,470 C126,464 126,460 124,460 Z",
      // Right tib ant
      "M176,460 C180,468 182,480 184,496 C186,512 186,528 184,540 C182,548 178,552 174,550 C172,544 172,532 172,516 C172,500 172,484 174,470 C174,464 174,460 176,460 Z",
    ],
  },

  // ══════════════════════════════════════════════════════════
  // BACK VIEW — viewBox 0 0 300 700
  // ══════════════════════════════════════════════════════════

  // -- Upper Trapezius --
  {
    muscleId: "upper-trapezius",
    label: "Upper\nTraps",
    view: "back",
    labelPos: { x: 120, y: 150 },
    paths: [
      // Left upper trap
      "M148,120 C140,122 130,128 120,136 C112,142 106,150 104,156 C108,160 114,162 120,160 C130,156 140,148 148,140 C150,136 150,128 148,120 Z",
      // Right upper trap
      "M152,120 C160,122 170,128 180,136 C188,142 194,150 196,156 C192,160 186,162 180,160 C170,156 160,148 152,140 C150,136 150,128 152,120 Z",
    ],
  },

  // -- Rhomboids (between shoulder blades) --
  {
    muscleId: "rhomboids",
    label: "Rhomboids",
    view: "back",
    labelPos: { x: 128, y: 195 },
    paths: [
      // Left rhomboid
      "M144,172 C138,174 132,180 128,188 C124,196 124,204 128,208 C132,210 138,208 142,202 C146,196 148,188 148,180 C148,174 146,172 144,172 Z",
      // Right rhomboid
      "M156,172 C162,174 168,180 172,188 C176,196 176,204 172,208 C168,210 162,208 158,202 C154,196 152,188 152,180 C152,174 154,172 156,172 Z",
    ],
  },

  // -- Latissimus Dorsi (wide back) --
  {
    muscleId: "latissimus-dorsi",
    label: "Latissimus\nDorsi",
    view: "back",
    labelPos: { x: 110, y: 230 },
    paths: [
      // Left lat
      "M126,200 C116,206 106,216 100,230 C96,242 96,256 100,268 C104,276 112,280 120,278 C128,274 132,266 132,256 C132,244 132,232 130,220 C130,210 128,204 126,200 Z",
      // Right lat
      "M174,200 C184,206 194,216 200,230 C204,242 204,256 200,268 C196,276 188,280 180,278 C172,274 168,266 168,256 C168,244 168,232 170,220 C170,210 172,204 174,200 Z",
    ],
  },

  // -- Posterior Deltoids --
  {
    muscleId: "posterior-deltoid",
    label: "Post.\nDeltoid",
    view: "back",
    labelPos: { x: 84, y: 172 },
    paths: [
      // Left post delt
      "M104,155 C96,155 88,160 84,168 C80,176 82,185 86,190 C92,186 100,182 108,180 C112,175 112,165 108,158 C106,156 105,155 104,155 Z",
      // Right post delt
      "M196,155 C204,155 212,160 216,168 C220,176 218,185 214,190 C208,186 200,182 192,180 C188,175 188,165 192,158 C194,156 195,155 196,155 Z",
    ],
  },

  // -- Triceps (back upper arm) --
  {
    muscleId: "triceps-brachii",
    label: "Triceps",
    view: "back",
    labelPos: { x: 72, y: 228 },
    paths: [
      // Left tricep
      "M80,194 C74,200 70,210 68,222 C66,236 66,250 68,260 C70,266 74,268 78,264 C82,258 84,248 84,236 C84,224 84,212 86,202 C86,198 84,194 80,194 Z",
      // Right tricep
      "M220,194 C226,200 230,210 232,222 C234,236 234,250 232,260 C230,266 226,268 222,264 C218,258 216,248 216,236 C216,224 216,212 214,202 C214,198 216,194 220,194 Z",
    ],
  },

  // -- Erector Spinae (along spine) --
  {
    muscleId: "erector-spinae",
    label: "Erector\nSpinae",
    view: "back",
    labelPos: { x: 150, y: 260 },
    paths: [
      // Left erector
      "M144,200 C140,208 138,220 138,236 C138,256 138,276 140,294 C142,302 144,306 148,304 C150,298 150,284 150,266 C150,248 150,230 150,214 C150,206 148,200 144,200 Z",
      // Right erector
      "M156,200 C160,208 162,220 162,236 C162,256 162,276 160,294 C158,302 156,306 152,304 C150,298 150,284 150,266 C150,248 150,230 150,214 C150,206 152,200 156,200 Z",
    ],
  },

  // -- Gluteus Maximus --
  {
    muscleId: "gluteus-maximus",
    label: "Gluteus\nMaximus",
    view: "back",
    labelPos: { x: 128, y: 340 },
    paths: [
      // Left glute max
      "M148,310 C138,314 126,322 118,334 C112,344 110,356 114,364 C118,370 126,372 134,368 C142,362 148,354 150,344 C150,336 150,326 148,316 C148,312 148,310 148,310 Z",
      // Right glute max
      "M152,310 C162,314 174,322 182,334 C188,344 190,356 186,364 C182,370 174,372 166,368 C158,362 152,354 150,344 C150,336 150,326 152,316 C152,312 152,310 152,310 Z",
    ],
  },

  // -- Gluteus Medius (side hip) --
  {
    muscleId: "gluteus-medius",
    label: "Glute\nMed",
    view: "back",
    labelPos: { x: 106, y: 318 },
    paths: [
      // Left glute med
      "M118,304 C110,308 104,316 102,326 C100,334 104,340 110,340 C116,338 122,332 126,324 C128,316 128,310 124,306 C122,304 120,304 118,304 Z",
      // Right glute med
      "M182,304 C190,308 196,316 198,326 C200,334 196,340 190,340 C184,338 178,332 174,324 C172,316 172,310 176,306 C178,304 180,304 182,304 Z",
    ],
  },

  // -- Hamstrings (biceps femoris as representative) --
  {
    muscleId: "biceps-femoris",
    label: "Biceps\nFemoris",
    view: "back",
    labelPos: { x: 112, y: 410 },
    paths: [
      // Left hamstring outer
      "M118,370 C112,380 108,396 106,414 C104,432 106,446 110,454 C114,458 118,456 120,450 C122,438 122,422 122,406 C122,392 120,380 118,370 Z",
      // Right hamstring outer
      "M182,370 C188,380 192,396 194,414 C196,432 194,446 190,454 C186,458 182,456 180,450 C178,438 178,422 178,406 C178,392 180,380 182,370 Z",
    ],
  },

  // -- Semitendinosus --
  {
    muscleId: "semitendinosus",
    label: "Semi-T",
    view: "back",
    labelPos: { x: 136, y: 410 },
    paths: [
      // Left semi-t
      "M134,372 C130,382 128,396 126,412 C124,428 126,442 130,450 C134,454 138,450 138,442 C138,428 138,412 138,396 C138,384 136,376 134,372 Z",
      // Right semi-t
      "M166,372 C170,382 172,396 174,412 C176,428 174,442 170,450 C166,454 162,450 162,442 C162,428 162,412 162,396 C162,384 164,376 166,372 Z",
    ],
  },

  // -- Gastrocnemius (calf) --
  {
    muscleId: "gastrocnemius",
    label: "Gastroc",
    view: "back",
    labelPos: { x: 122, y: 490 },
    paths: [
      // Left gastroc
      "M126,460 C120,466 116,476 114,490 C112,504 114,516 118,524 C122,528 126,526 128,520 C130,510 130,498 130,486 C130,476 128,468 126,460 Z",
      // Right gastroc
      "M174,460 C180,466 184,476 186,490 C188,504 186,516 182,524 C178,528 174,526 172,520 C170,510 170,498 170,486 C170,476 172,468 174,460 Z",
    ],
  },

  // -- Soleus (lower calf) --
  {
    muscleId: "soleus",
    label: "Soleus",
    view: "back",
    labelPos: { x: 122, y: 540 },
    paths: [
      // Left soleus
      "M120,524 C116,530 114,540 114,552 C114,562 116,570 120,574 C124,576 128,572 128,564 C128,554 128,542 126,532 C124,526 122,524 120,524 Z",
      // Right soleus
      "M180,524 C184,530 186,540 186,552 C186,562 184,570 180,574 C176,576 172,572 172,564 C172,554 172,542 174,532 C176,526 178,524 180,524 Z",
    ],
  },

  // ══════════════════════════════════════════════════════════
  // SIDE VIEW — viewBox 0 0 220 700
  // ══════════════════════════════════════════════════════════

  // -- SCM (side of neck) --
  {
    muscleId: "scm",
    label: "SCM",
    view: "side",
    labelPos: { x: 108, y: 128 },
    paths: [
      "M102,110 C98,114 94,122 92,132 C90,140 92,148 96,152 C100,150 104,144 106,136 C108,128 108,120 106,114 C104,112 102,110 102,110 Z",
    ],
  },

  // -- Medial Deltoid (shoulder cap side) --
  {
    muscleId: "medial-deltoid",
    label: "Deltoid",
    view: "side",
    labelPos: { x: 68, y: 168 },
    paths: [
      "M80,152 C70,156 62,164 58,174 C56,182 58,190 64,194 C70,192 78,186 84,178 C88,172 88,164 86,158 C84,154 82,152 80,152 Z",
    ],
  },

  // -- TFL (side hip) --
  {
    muscleId: "tfl",
    label: "TFL",
    view: "side",
    labelPos: { x: 82, y: 330 },
    paths: [
      "M86,316 C80,320 76,330 76,342 C76,352 80,360 86,362 C92,358 94,348 94,338 C94,328 92,322 88,318 C88,316 86,316 86,316 Z",
    ],
  },

  // -- IT Band area (side thigh) --
  {
    muscleId: "vastus-lateralis",
    label: "IT Band\nArea",
    view: "side",
    labelPos: { x: 80, y: 400 },
    paths: [
      "M86,360 C80,370 76,388 74,408 C72,428 74,446 78,458 C82,462 86,458 88,448 C90,432 90,412 90,394 C90,378 88,368 86,360 Z",
    ],
  },

  // -- Quadratus Lumborum (side lower back) --
  {
    muscleId: "quadratus-lumborum",
    label: "QL",
    view: "side",
    labelPos: { x: 118, y: 282 },
    paths: [
      "M112,264 C108,270 106,280 106,292 C106,302 108,310 114,312 C118,310 122,302 122,292 C122,280 120,270 116,266 C114,264 112,264 112,264 Z",
    ],
  },
];

// ── Body outline paths ──────────────────────────────────────
const bodyOutlineFront = `
  M150,18 C164,18 176,30 176,50 C176,66 168,78 158,84
  L162,90 C162,90 164,94 166,96
  C178,100 196,110 210,130
  C222,148 228,168 226,188
  L222,210 C220,230 218,250 216,264
  C214,272 212,276 210,278
  L210,280
  C210,284 208,288 206,290
  L204,296
  C200,300 198,306 196,312
  C194,324 192,334 190,342
  L188,358
  C186,370 186,380 186,392
  C186,410 186,430 184,450
  C182,470 178,488 176,500
  C174,516 172,530 172,544
  C172,558 172,570 174,580
  L176,600
  C178,612 178,620 176,628
  L172,648
  C170,656 168,662 166,666
  C164,672 160,676 156,678
  L150,680
  L144,678
  C140,676 136,672 134,666
  C132,662 130,656 128,648
  L124,628
  C122,620 122,612 124,600
  L126,580
  C128,570 128,558 128,544
  C128,530 126,516 124,500
  C122,488 118,470 116,450
  C114,430 114,410 114,392
  C114,380 114,370 112,358
  L110,342
  C108,334 106,324 104,312
  C102,306 100,300 96,296
  L94,290
  C92,288 90,284 90,280
  L90,278
  C88,276 86,272 84,264
  C82,250 80,230 78,210
  L74,188
  C72,168 78,148 90,130
  C104,110 122,100 134,96
  C136,94 138,90 138,90
  L142,84
  C132,78 124,66 124,50
  C124,30 136,18 150,18 Z
`;

const bodyOutlineBack = `
  M150,18 C164,18 176,30 176,50 C176,66 168,78 158,84
  L162,90 C162,90 164,94 166,96
  C178,100 196,110 210,130
  C222,148 228,168 226,188
  L222,210 C220,230 218,250 216,264
  C214,272 212,276 210,278
  L210,280
  C210,284 208,288 206,290
  L204,296
  C200,300 198,306 196,312
  C194,324 192,334 190,342
  L188,358
  C186,370 186,380 186,392
  C186,410 186,430 184,450
  C182,470 178,488 176,500
  C174,516 172,530 172,544
  C172,558 172,570 174,580
  L176,600
  C178,612 178,620 176,628
  L172,648
  C170,656 168,662 166,666
  C164,672 160,676 156,678
  L150,680
  L144,678
  C140,676 136,672 134,666
  C132,662 130,656 128,648
  L124,628
  C122,620 122,612 124,600
  L126,580
  C128,570 128,558 128,544
  C128,530 126,516 124,500
  C122,488 118,470 116,450
  C114,430 114,410 114,392
  C114,380 114,370 112,358
  L110,342
  C108,334 106,324 104,312
  C102,306 100,300 96,296
  L94,290
  C92,288 90,284 90,280
  L90,278
  C88,276 86,272 84,264
  C82,250 80,230 78,210
  L74,188
  C72,168 78,148 90,130
  C104,110 122,100 134,96
  C136,94 138,90 138,90
  L142,84
  C132,78 124,66 124,50
  C124,30 136,18 150,18 Z
`;

const bodyOutlineSide = `
  M110,22 C122,22 130,34 130,52 C130,66 124,76 116,82
  L118,88
  C120,92 122,96 124,100
  C132,106 140,118 144,134
  C148,150 148,168 144,186
  L140,210
  C138,230 136,250 134,268
  C132,280 130,290 128,298
  L126,312
  C124,324 122,336 120,348
  L118,366
  C116,380 114,396 112,414
  C110,436 108,456 108,472
  C108,490 108,510 110,528
  C112,544 114,558 114,570
  L116,590
  C118,604 118,614 116,624
  L112,650
  C110,660 108,666 106,670
  C104,676 100,680 96,680
  L90,680
  C86,680 82,676 80,670
  C78,666 76,660 74,650
  L70,624
  C68,614 68,604 70,590
  L72,570
  C72,558 72,544 72,528
  C70,510 66,490 64,472
  C62,456 62,436 64,414
  C66,396 66,380 66,366
  L64,348
  C62,336 60,324 58,312
  L56,298
  C54,290 52,280 50,268
  C48,250 46,230 44,210
  L40,186
  C36,168 36,150 40,134
  C44,118 52,106 60,100
  C62,96 64,92 66,88
  L68,82
  C60,76 54,66 54,52
  C54,34 62,22 74,22
  L110,22 Z
`;

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

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</h3>
      <p className="text-sm text-gray-300 leading-relaxed">{content}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function AnatomyPage() {
  const [view, setView] = useState<"front" | "back" | "side">("front");
  const [selectedMuscle, setSelectedMuscle] = useState<Muscle | null>(null);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
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

  const movementMatchIds = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase().trim();
    const matchedIds = new Set<string>();
    for (const [pattern, muscleIds] of Object.entries(movementPatterns)) {
      if (pattern.includes(q) || q.includes(pattern)) {
        for (const id of muscleIds) matchedIds.add(id);
      }
    }
    return matchedIds.size > 0 ? matchedIds : null;
  }, [search]);

  const filteredRegions = useMemo(() => {
    return muscleRegions.filter((r) => {
      if (r.view !== view) return false;
      const m = muscleMap.get(r.muscleId);
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
    for (const r of filteredRegions) ids.add(r.muscleId);
    return ids;
  }, [filteredRegions]);

  const selectedPattern = useMemo(() => {
    return compensationPatterns.find((p) => p.id === selectedCompensation) ?? null;
  }, [selectedCompensation]);

  const handleMuscleClick = useCallback((muscleId: string) => {
    const m = muscleMap.get(muscleId) ?? null;
    setSelectedMuscle(m);
    setShowList(false);
  }, [muscleMap]);

  const viewBox = view === "side" ? "0 0 220 700" : "0 0 300 700";

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

              {/* View toggle — now 3 views */}
              <div className="flex rounded-xl overflow-hidden border border-gray-800">
                {(["front", "back", "side"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`flex-1 py-2 text-sm font-medium transition-all ${
                      view === v ? "bg-gray-800 text-white" : "bg-gray-900 text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {v === "front" ? "Front" : v === "back" ? "Back" : "Side"}
                  </button>
                ))}
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
      <main className="flex-1 relative overflow-auto">
        {mode === "corrective" ? (
          /* Corrective Exercise Finder Mode */
          <div className="max-w-lg mx-auto px-4 py-4 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
            <p className="text-sm text-gray-400 mb-3">Select a compensation pattern to see the overactive/underactive muscles and full corrective protocol.</p>

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

            {selectedPattern && (
              <div className="space-y-4 pb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Assessment</p>
                  <p className="text-sm text-gray-300">{selectedPattern.assessment}</p>
                </div>

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
          /* SVG Body Diagram */
          <div className="max-w-lg mx-auto w-full flex items-start justify-center px-4 py-4">
            <svg
              viewBox={viewBox}
              className="w-full max-h-[calc(100vh-280px)]"
              style={{ minHeight: 400 }}
              role="img"
              aria-label={`${view} view of human body with muscle regions`}
            >
              <defs>
                {/* Glow filters for each group */}
                <filter id="glow-upper" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feFlood floodColor="rgba(59, 130, 246, 0.6)" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="shadow" />
                  <feMerge>
                    <feMergeNode in="shadow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-core" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feFlood floodColor="rgba(168, 85, 247, 0.6)" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="shadow" />
                  <feMerge>
                    <feMergeNode in="shadow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-lower" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feFlood floodColor="rgba(34, 197, 94, 0.6)" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="shadow" />
                  <feMerge>
                    <feMergeNode in="shadow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Subtle inner shadow for body outline */}
                <filter id="body-shadow" x="-5%" y="-5%" width="110%" height="110%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                  <feOffset dx="0" dy="2" result="offset" />
                  <feFlood floodColor="rgba(0,0,0,0.3)" result="color" />
                  <feComposite in="color" in2="offset" operator="in" result="shadow" />
                  <feMerge>
                    <feMergeNode in="shadow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Gradient for body fill */}
                <linearGradient id="bodyFillGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(30, 30, 40, 0.4)" />
                  <stop offset="100%" stopColor="rgba(20, 20, 30, 0.2)" />
                </linearGradient>

                {/* Center line for anatomical reference */}
                <linearGradient id="centerLineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(75, 85, 99, 0)" />
                  <stop offset="20%" stopColor="rgba(75, 85, 99, 0.15)" />
                  <stop offset="80%" stopColor="rgba(75, 85, 99, 0.15)" />
                  <stop offset="100%" stopColor="rgba(75, 85, 99, 0)" />
                </linearGradient>
              </defs>

              {/* Center line (anatomical reference) */}
              {view !== "side" && (
                <line
                  x1="150" y1="50" x2="150" y2="660"
                  stroke="url(#centerLineGrad)"
                  strokeWidth="0.5"
                  strokeDasharray="4,8"
                />
              )}

              {/* Body outline */}
              <path
                d={view === "side" ? bodyOutlineSide : view === "front" ? bodyOutlineFront : bodyOutlineBack}
                fill="url(#bodyFillGrad)"
                stroke="#4B5563"
                strokeWidth="1.5"
                strokeLinejoin="round"
                filter="url(#body-shadow)"
              />

              {/* Internal anatomical lines for front/back */}
              {view === "front" && (
                <g stroke="rgba(75, 85, 99, 0.2)" strokeWidth="0.5" fill="none">
                  {/* Clavicle line */}
                  <path d="M104,156 C120,150 130,148 150,148 C170,148 180,150 196,156" />
                  {/* Rib suggestions */}
                  <path d="M120,200 C130,196 140,194 150,194 C160,194 170,196 180,200" />
                  <path d="M118,216 C130,212 140,210 150,210 C160,210 170,212 182,216" />
                  {/* Pelvis line */}
                  <path d="M110,308 C120,316 135,320 150,320 C165,320 180,316 190,308" />
                  {/* Knee lines */}
                  <path d="M116,452 C120,456 126,458 132,458" />
                  <path d="M184,452 C180,456 174,458 168,458" />
                </g>
              )}

              {view === "back" && (
                <g stroke="rgba(75, 85, 99, 0.2)" strokeWidth="0.5" fill="none">
                  {/* Scapula outlines */}
                  <path d="M120,170 C116,180 116,200 122,210 C128,216 136,214 140,206 C142,198 142,186 138,176 C134,170 126,168 120,170" />
                  <path d="M180,170 C184,180 184,200 178,210 C172,216 164,214 160,206 C158,198 158,186 162,176 C166,170 174,168 180,170" />
                  {/* Spine suggestion */}
                  <path d="M150,90 L150,310" strokeDasharray="2,6" />
                  {/* Pelvis */}
                  <path d="M110,308 C120,316 135,320 150,320 C165,320 180,316 190,308" />
                </g>
              )}

              {/* Muscle regions */}
              {filteredRegions.map((region) => {
                const muscle = muscleMap.get(region.muscleId);
                if (!muscle) return null;

                const isSelected = selectedMuscle?.id === region.muscleId;
                const isHovered = hoveredMuscle === region.muscleId;
                const fills = groupFills[muscle.group];
                const currentFill = isSelected ? fills.selected : isHovered ? fills.hover : fills.base;
                const currentStroke = isSelected ? fills.glow : isHovered ? fills.selected : "rgba(255,255,255,0.1)";
                const filterAttr = isSelected ? `url(#glow-${muscle.group})` : undefined;

                return (
                  <g
                    key={`${region.muscleId}-${region.view}`}
                    data-muscle-id={region.muscleId}
                    onClick={() => handleMuscleClick(region.muscleId)}
                    onMouseEnter={() => setHoveredMuscle(region.muscleId)}
                    onMouseLeave={() => setHoveredMuscle(null)}
                    onTouchStart={() => setHoveredMuscle(region.muscleId)}
                    className="cursor-pointer"
                    style={{ transition: "all 0.2s ease" }}
                    filter={filterAttr}
                  >
                    {region.paths.map((pathD, pi) => (
                      <path
                        key={pi}
                        d={pathD}
                        fill={currentFill}
                        stroke={currentStroke}
                        strokeWidth={isSelected ? 1.5 : isHovered ? 1 : 0.5}
                        style={{
                          transition: "fill 0.2s ease, stroke 0.2s ease, stroke-width 0.15s ease",
                        }}
                      />
                    ))}
                    {/* Label */}
                    <text
                      x={region.labelPos.x}
                      y={region.labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isSelected || isHovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)"}
                      fontSize="8"
                      fontWeight={isSelected ? "700" : "500"}
                      style={{
                        pointerEvents: "none",
                        transition: "fill 0.2s ease",
                        textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                      }}
                    >
                      {region.label.split("\n").map((line, li) => (
                        <tspan key={li} x={region.labelPos.x} dy={li === 0 ? 0 : 10}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                );
              })}
            </svg>
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
              <Section title="Location" content={selectedMuscle.location} />

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

              <div className="grid grid-cols-2 gap-3">
                <Section title="Origin" content={selectedMuscle.origin} />
                <Section title="Insertion" content={selectedMuscle.insertion} />
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-3">NASM Corrective Protocol</h3>
                <div className="space-y-3">
                  <CorrectiveStep number={1} label="Inhibit (SMR)" color="bg-red-500/20 text-red-400" step={selectedMuscle.correctiveExercise.inhibit} />
                  <CorrectiveStep number={2} label="Lengthen (Stretch)" color="bg-orange-500/20 text-orange-400" step={selectedMuscle.correctiveExercise.lengthen} />
                  <CorrectiveStep number={3} label="Activate (Isolate)" color="bg-green-500/20 text-green-400" step={selectedMuscle.correctiveExercise.activate} />
                  <CorrectiveStep number={4} label="Integrate (Compound)" color="bg-blue-500/20 text-blue-400" step={selectedMuscle.correctiveExercise.integrate} />
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
                <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-1">Revealed by Assessment</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedMuscle.assessmentLink}</p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">Common Imbalance</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedMuscle.commonImbalance}</p>
              </div>

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

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">NASM Exam Tip</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedMuscle.nasmTip}</p>
              </div>

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
