"use client";

import { useRouter } from "next/navigation";
import RadarChart from "@/components/radar-chart";
import { domainLabels } from "@/lib/design-system";

interface DomainScore {
  domain: string;
  label: string;
  score: number;
  color: string;
}

interface RadarWrapperProps {
  domainScores: DomainScore[];
}

// Map domain keys to study routes
const domainRoutes: Record<string, string> = {
  optModel: "/quiz?chapter=13",
  anatomy: "/quiz?chapter=1",
  assessment: "/quiz?chapter=4",
  flexibility: "/quiz?chapter=6",
  resistance: "/quiz?chapter=8",
  nutrition: "/quiz?chapter=14",
  specialPops: "/quiz?chapter=17",
  programDesign: "/quiz?chapter=16",
};

export default function RadarWrapper({ domainScores }: RadarWrapperProps) {
  const router = useRouter();

  const chartData = domainScores.map((d) => ({
    label: d.label,
    value: d.score,
    color: d.color,
  }));

  function handleDomainClick(label: string) {
    // Find the domain key from the label
    const entry = Object.entries(domainLabels).find(([, v]) => v === label);
    if (entry) {
      const route = domainRoutes[entry[0]] || "/quiz";
      router.push(route);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <RadarChart
        data={chartData}
        size={350}
        onDomainClick={handleDomainClick}
      />
    </div>
  );
}
