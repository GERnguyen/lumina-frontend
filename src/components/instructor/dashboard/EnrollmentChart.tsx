import React, { useState, useMemo } from "react";
import { Calendar } from "lucide-react";

interface ChartDataPoint {
  label: string;
  enrollmentCount: number;
}

interface EnrollmentChartProps {
  activeChartData: ChartDataPoint[];
}

export function EnrollmentChart({ activeChartData }: EnrollmentChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);

  const svgConfig = useMemo(() => {
    const width = 1000;
    const height = 300;
    const top = 30;
    const bottom = 40;
    const left = 50;
    const right = 30;

    const chartW = width - left - right;
    const chartH = height - top - bottom;

    const values = activeChartData.map((d) => d.enrollmentCount);
    const maxVal = Math.max(...values, 10) * 1.1; // Add 10% spacing at top, minimum scale of 10

    const points = activeChartData.map((d, i) => {
      const x = left + (i * chartW) / Math.max(activeChartData.length - 1, 1);
      const y = top + chartH - (d.enrollmentCount / maxVal) * chartH;
      return { x, y, label: d.label, value: d.enrollmentCount, index: i };
    });

    // Spline curve generator (cubic bezier)
    let curvePath = "";
    if (points.length > 0) {
      curvePath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 3;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (2 * (p1.x - p0.x)) / 3;
        const cpY2 = p1.y;
        curvePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
    }

    // Gradient fill path closed to bottom
    const fillPath = points.length > 0
      ? `${curvePath} L ${points[points.length - 1].x} ${top + chartH} L ${points[0].x} ${top + chartH} Z`
      : "";

    return {
      width,
      height,
      top,
      bottom,
      left,
      right,
      chartW,
      chartH,
      maxVal,
      points,
      curvePath,
      fillPath,
    };
  }, [activeChartData]);

  if (activeChartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-400 bg-zinc-50/20 border border-dashed border-zinc-200 rounded-xl min-h-[300px]">
        <Calendar className="size-10 opacity-30 mb-2" />
        <p className="text-sm font-semibold text-zinc-500">Chưa có dữ liệu thống kê ghi danh</p>
      </div>
    );
  }

  return (
    <div className="w-full relative select-none">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgConfig.width} ${svgConfig.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4A4CD9" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4A4CD9" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const lineY = svgConfig.top + svgConfig.chartH * ratio;
          const displayVal = Math.round(svgConfig.maxVal * (1 - ratio));
          return (
            <g key={idx}>
              <text
                x="35"
                y={lineY + 4}
                textAnchor="end"
                className="text-[10px] font-bold fill-zinc-400 font-general"
              >
                {displayVal}
              </text>
              <line
                x1={svgConfig.left}
                y1={lineY}
                x2={svgConfig.left + svgConfig.chartW}
                y2={lineY}
                stroke="#F4F4F5"
                strokeWidth="1.2"
                strokeDasharray={idx === 4 ? "0" : "4 4"}
              />
            </g>
          );
        })}

        {/* Area fill path */}
        {svgConfig.fillPath && (
          <path d={svgConfig.fillPath} fill="url(#chartGradient)" />
        )}

        {/* Spline line path */}
        {svgConfig.curvePath && (
          <path
            d={svgConfig.curvePath}
            fill="none"
            stroke="#4A4CD9"
            strokeWidth="3.2"
            strokeLinecap="round"
            className="drop-shadow-[0_2px_4px_rgba(74,76,217,0.15)]"
          />
        )}

        {/* Interactive dots and vertical hover helpers */}
        {svgConfig.points.map((p, idx) => {
          const isHovered = hoveredPoint && hoveredPoint.index === p.index;
          return (
            <g key={idx}>
              {/* X Axis Labels */}
              {idx % Math.ceil(svgConfig.points.length / 8) === 0 && (
                <text
                  x={p.x}
                  y={svgConfig.height - 12}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-zinc-400 font-general"
                >
                  {p.label}
                </text>
              )}

              {/* Interactive vertical hover indicator line */}
              {isHovered && (
                <line
                  x1={p.x}
                  y1={svgConfig.top}
                  x2={p.x}
                  y2={svgConfig.top + svgConfig.chartH}
                  stroke="#4A4CD9"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
              )}

              {/* Point Circles */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5.5 : 3.5}
                fill={isHovered ? "#4A4CD9" : "#ffffff"}
                stroke="#4A4CD9"
                strokeWidth="2"
                className="transition-all duration-200 ease-out"
              />

              {/* Transparent overlay for easy hover capture */}
              <circle
                cx={p.x}
                cy={p.y}
                r="18"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({
                    index: p.index,
                    x: p.x,
                    y: p.y,
                    label: p.label,
                    value: p.value,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating CSS Tooltip relative to hovered point */}
      {hoveredPoint && (
        <div
          className="pointer-events-none absolute z-10 flex flex-col items-center gap-0.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-bold text-white shadow-xl transition-all duration-150 animate-in fade-in zoom-in-95"
          style={{
            left: `${(hoveredPoint.x / svgConfig.width) * 100}%`,
            top: `${(hoveredPoint.y / svgConfig.height) * 100 - 14}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <span className="text-[10px] text-zinc-400 font-semibold">{hoveredPoint.label}</span>
          <span className="text-primary-300 font-general">{hoveredPoint.value} ghi danh</span>
        </div>
      )}
    </div>
  );
}
