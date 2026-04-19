"use client";

import { useEffect, useState, useCallback } from "react";

interface RadarDataPoint {
  label: string;
  value: number;
  color: string;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  onDomainClick?: (domain: string) => void;
}

export default function RadarChart({ data, size = 300, onDomainClick }: RadarChartProps) {
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 800;

    function animate(timestamp: number) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(eased);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, []);

  const center = size / 2;
  const radius = size * 0.35;
  const labelRadius = size * 0.47;
  const sides = data.length;

  const getPoint = useCallback(
    (index: number, value: number): [number, number] => {
      const angle = (Math.PI * 2 * index) / sides - Math.PI / 2;
      const r = (value / 100) * radius;
      return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
    },
    [center, radius, sides]
  );

  const getLabelPosition = useCallback(
    (index: number): [number, number] => {
      const angle = (Math.PI * 2 * index) / sides - Math.PI / 2;
      return [center + labelRadius * Math.cos(angle), center + labelRadius * Math.sin(angle)];
    },
    [center, labelRadius, sides]
  );

  // Grid polygons at 25%, 50%, 75%, 100%
  const gridLevels = [25, 50, 75, 100];

  const getPolygonPoints = (level: number, scale: number = 1) => {
    return Array.from({ length: sides }, (_, i) => {
      const [x, y] = getPoint(i, level * scale);
      return `${x},${y}`;
    }).join(" ");
  };

  // Data polygon
  const dataPoints = data.map((d, i) => {
    const [x, y] = getPoint(i, d.value * animationProgress);
    return `${x},${y}`;
  }).join(" ");

  // Average color from data for fill
  const fillColor = data.length > 0 ? data[0].color : "#3b82f6";

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
      className="max-w-full"
      style={{ aspectRatio: "1 / 1" }}
    >
      {/* Grid lines */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={getPolygonPoints(level)}
          fill="none"
          stroke="rgb(55, 65, 81)"
          strokeWidth={level === 100 ? 1.5 : 0.75}
          opacity={level === 100 ? 0.6 : 0.3}
        />
      ))}

      {/* Axis lines */}
      {Array.from({ length: sides }, (_, i) => {
        const [x, y] = getPoint(i, 100);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="rgb(55, 65, 81)"
            strokeWidth={0.75}
            opacity={0.3}
          />
        );
      })}

      {/* Data polygon fill */}
      <polygon
        points={dataPoints}
        fill={fillColor}
        fillOpacity={0.15}
        stroke={fillColor}
        strokeWidth={2}
        strokeOpacity={0.8}
      />

      {/* Data points */}
      {data.map((d, i) => {
        const [x, y] = getPoint(i, d.value * animationProgress);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3.5}
            fill={d.color}
            stroke="rgb(17, 24, 39)"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Labels */}
      {data.map((d, i) => {
        const [lx, ly] = getLabelPosition(i);
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
        const isLeft = Math.cos(angle) < -0.1;
        const isRight = Math.cos(angle) > 0.1;
        const textAnchor = isLeft ? "end" : isRight ? "start" : "middle";

        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={textAnchor}
            dominantBaseline="central"
            className="cursor-pointer select-none"
            fill="rgb(209, 213, 219)"
            fontSize={size * 0.035}
            fontWeight={500}
            onClick={() => onDomainClick?.(d.label)}
          >
            {d.label}
          </text>
        );
      })}

      {/* Percentage labels on grid */}
      {gridLevels.map((level) => {
        const [, y] = getPoint(0, level);
        return (
          <text
            key={level}
            x={center + 4}
            y={y - 4}
            fill="rgb(107, 114, 128)"
            fontSize={size * 0.028}
            textAnchor="start"
          >
            {level}%
          </text>
        );
      })}
    </svg>
  );
}
