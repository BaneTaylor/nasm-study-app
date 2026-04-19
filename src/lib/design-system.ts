export const colors = {
  domains: {
    optModel: { bg: "bg-rose-500", text: "text-rose-400", gradient: "from-rose-500 to-pink-500" },
    anatomy: { bg: "bg-blue-500", text: "text-blue-400", gradient: "from-blue-500 to-cyan-500" },
    assessment: { bg: "bg-green-500", text: "text-green-400", gradient: "from-green-500 to-emerald-500" },
    flexibility: { bg: "bg-purple-500", text: "text-purple-400", gradient: "from-purple-500 to-violet-500" },
    resistance: { bg: "bg-amber-500", text: "text-amber-400", gradient: "from-amber-500 to-orange-500" },
    nutrition: { bg: "bg-teal-500", text: "text-teal-400", gradient: "from-teal-500 to-cyan-500" },
    specialPops: { bg: "bg-indigo-500", text: "text-indigo-400", gradient: "from-indigo-500 to-blue-500" },
    programDesign: { bg: "bg-fuchsia-500", text: "text-fuchsia-400", gradient: "from-fuchsia-500 to-pink-500" },
  },
};

// Map chapters to domains
export const chapterDomains: Record<number, string> = {
  1: "anatomy", 2: "anatomy", 3: "anatomy",
  4: "assessment", 5: "assessment",
  6: "flexibility", 7: "flexibility",
  8: "resistance", 9: "resistance", 10: "resistance", 11: "resistance", 12: "resistance",
  13: "optModel",
  14: "nutrition", 15: "nutrition",
  16: "programDesign",
  17: "specialPops", 18: "specialPops",
  19: "programDesign", 20: "programDesign",
};

export const domainLabels: Record<string, string> = {
  optModel: "OPT Model",
  anatomy: "Anatomy & Physiology",
  assessment: "Assessment",
  flexibility: "Flexibility & Cardio",
  resistance: "Resistance Training",
  nutrition: "Nutrition",
  specialPops: "Special Populations",
  programDesign: "Program Design",
};
