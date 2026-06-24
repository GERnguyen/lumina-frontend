import React, { useState, useMemo } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartDataPoint {
  label: string;
  value: number;
}

interface DashboardChartProps {
  data: ChartDataPoint[];
  valueSuffix?: string;
  lineColor?: string;
  gradientId?: string;
  yAxisFormatter?: (val: number) => string;
  tooltipFormatter?: (val: number) => string;
}

export function DashboardChart({
  data,
  valueSuffix = "lượt",
  lineColor = "#4A4CD9",
  gradientId = "chartGradientBlue",
  yAxisFormatter,
  tooltipFormatter,
}: DashboardChartProps) {
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
    const left = 55; // Slightly wider left margin to prevent currency label overflow
    const right = 30;

    const chartW = width - left - right;
    const chartH = height - top - bottom;

    const values = data.map((d) => d.value);
    const maxVal = Math.max(...values, 5) * 1.1; // Add 10% spacing, min scale of 5

    const points = data.map((d, i) => {
      const x = left + (i * chartW) / Math.max(data.length - 1, 1);
      const y = top + chartH - (d.value / maxVal) * chartH;
      return { x, y, label: d.label, value: d.value, index: i };
    });

    // Spline curve path
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

    // Gradient path closed to bottom bounds
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
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-400 bg-zinc-50/20 border border-dashed border-zinc-250/70 rounded-xl min-h-[260px] select-none">
        <Calendar className="size-10 opacity-30 mb-2" />
        <p className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Chưa có dữ liệu thống kê</p>
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
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const lineY = svgConfig.top + svgConfig.chartH * ratio;
          const displayVal = Math.round(svgConfig.maxVal * (1 - ratio));
          const formattedAxisVal = yAxisFormatter ? yAxisFormatter(displayVal) : String(displayVal);

          return (
            <g key={idx}>
              <text
                x={svgConfig.left - 12}
                y={lineY + 3.5}
                textAnchor="end"
                className="text-[10px] font-extrabold fill-zinc-400 font-general"
              >
                {formattedAxisVal}
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

        {/* Fill area */}
        {svgConfig.fillPath && (
          <path d={svgConfig.fillPath} fill={`url(#${gradientId})`} />
        )}

        {/* Trend Spline curve */}
        {svgConfig.curvePath && (
          <path
            d={svgConfig.curvePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="3"
            strokeLinecap="round"
            className="drop-shadow-xs"
          />
        )}

        {/* Hover elements and circles */}
        {svgConfig.points.map((p, idx) => {
          const isHovered = hoveredPoint && hoveredPoint.index === p.index;
          return (
            <g key={idx}>
              {/* X Axis label tick */}
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

              {/* Vertical line indicator */}
              {isHovered && (
                <line
                  x1={p.x}
                  y1={svgConfig.top}
                  x2={p.x}
                  y2={svgConfig.top + svgConfig.chartH}
                  stroke={lineColor}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.4"
                />
              )}

              {/* Data points */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5 : 3}
                fill={isHovered ? lineColor : "#ffffff"}
                stroke={lineColor}
                strokeWidth="2"
                className="transition-all duration-200 ease-out"
              />

              {/* Expanded hover catch target */}
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

      {/* Popover tooltip details */}
      {hoveredPoint && (
        <div
          className="pointer-events-none absolute z-15 flex flex-col items-center gap-0.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-bold text-white shadow-xl transition-all duration-150 animate-in fade-in zoom-in-95"
          style={{
            left: `${(hoveredPoint.x / svgConfig.width) * 100}%`,
            top: `${(hoveredPoint.y / svgConfig.height) * 100 - 14}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <span className="text-[10px] text-zinc-400 font-semibold">{hoveredPoint.label}</span>
          <span className="text-white font-general text-[11px]">
            {tooltipFormatter ? tooltipFormatter(hoveredPoint.value) : `${hoveredPoint.value} ${valueSuffix}`}
          </span>
        </div>
      )}
    </div>
  );
}
