"use client";

import type { InstructorDashboardData } from "@/services/instructor-dashboard-service";

type SeriesPoint = {
  label: string;
  value: number;
};

function pathFromSeries(points: number[], width: number, height: number, padding = 12) {
  if (!points.length) return "";
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const span = Math.max(1, max - min);
  return points
    .map((value, index) => {
      const x = padding + (index / Math.max(1, points.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / span) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function Panel({ title, action, children, className = "" }: { title: string; action?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-[18px] bg-white ${className}`}>
      <div className="flex h-[54px] items-center justify-between border-b border-[#E9EAF0] px-5">
        <h2 className="text-base font-medium text-[#1D2026]">{title}</h2>
        {action ? <span className="text-sm tracking-[-0.14px] text-[#6E7485]">{action}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function InstructorRevenuePanel({ series }: { series: SeriesPoint[] }) {
  const values = series.map((item) => item.value);
  const path = pathFromSeries(values, 520, 220, 24);
  const total = values.reduce((sum, value) => sum + value, 0);

  return (
    <Panel title="Revenue" action="This month" className="min-h-[310px] xl:col-span-2">
      <div className="p-5">
        <svg viewBox="0 0 520 220" className="h-[220px] w-full overflow-visible">
          {[0, 1, 2, 3].map((line) => (
            <line key={line} x1="24" x2="500" y1={30 + line * 45} y2={30 + line * 45} stroke="#F0F1F5" strokeWidth="1" />
          ))}
          <path d={`${path} L 500 208 L 24 208 Z`} fill="rgba(86,79,253,0.08)" />
          <path d={path} fill="none" stroke="#564FFD" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {series.map((item, index) => (
            <text key={item.label} x={24 + (index / Math.max(1, series.length - 1)) * 476} y="218" textAnchor="middle" className="fill-[#A1A5B3] text-[11px]">
              {item.label}
            </text>
          ))}
        </svg>
        <p className="mt-3 text-sm text-[#6E7485]">
          Net revenue in selected range: <strong className="font-semibold text-[#1D2026]">{new Intl.NumberFormat("en-US").format(total)} VND</strong>
        </p>
      </div>
    </Panel>
  );
}

export function InstructorCourseOverviewPanel({ series }: { series: InstructorDashboardData["courseSeries"] }) {
  const createdPath = pathFromSeries(series.map((item) => item.created), 680, 260, 28);
  const enrollmentPath = pathFromSeries(series.map((item) => item.enrollments), 680, 260, 28);

  return (
    <Panel title="Course Overview" action="This week" className="min-h-[360px]">
      <div className="p-5">
        <svg viewBox="0 0 680 260" className="h-[260px] w-full overflow-visible">
          {[0, 1, 2, 3, 4].map((line) => (
            <line key={line} x1="28" x2="650" y1={34 + line * 42} y2={34 + line * 42} stroke="#F0F1F5" strokeWidth="1" />
          ))}
          <path d={createdPath} fill="none" stroke="#FF6636" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={enrollmentPath} fill="none" stroke="#564FFD" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {series.map((item, index) => (
            <text key={`${item.label}-${index}`} x={28 + (index / Math.max(1, series.length - 1)) * 622} y="252" textAnchor="middle" className="fill-[#A1A5B3] text-[11px]">
              {item.label}
            </text>
          ))}
        </svg>
        <div className="mt-2 flex gap-5 text-sm text-[#6E7485]">
          <span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-[#FF6636]" />Created courses</span>
          <span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-[#564FFD]" />Enrollments</span>
        </div>
      </div>
    </Panel>
  );
}
