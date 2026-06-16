import { Star } from "lucide-react";
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

export function InstructorProfileViewsPanel({ profileViews }: { profileViews: InstructorDashboardData["profileViews"] }) {
  return (
    <Panel title="Profile View" action="Today" className="min-h-[310px]">
      <div className="flex h-[256px] items-end gap-2 px-5 pb-6 pt-5">
        {profileViews.bars.map((bar, index) => (
          <div key={`${bar}-${index}`} className="flex min-w-0 flex-1 flex-col justify-end gap-2">
            <div className="relative h-[176px] bg-[#EAF7EE]">
              <div className="absolute inset-x-0 bottom-0 bg-[#23BD33]" style={{ height: `${Math.max(8, Math.min(100, bar))}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-[#F0F1F5] px-5 py-4">
        <strong className="block text-lg font-semibold text-[#1D2026]">{profileViews.value}</strong>
        <span className="text-xs text-[#8C94A3]">Revenue-linked profile activity.</span>
      </div>
    </Panel>
  );
}

export function InstructorCourseOverviewPanel({ series }: { series: InstructorDashboardData["courseSeries"] }) {
  const createdPath = pathFromSeries(series.map((item) => item.created), 680, 260, 28);
  const enrollmentPath = pathFromSeries(series.map((item) => item.enrollments), 680, 260, 28);

  return (
    <Panel title="Course Overview" action="This week" className="min-h-[360px] xl:col-span-2">
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

function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex">
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className={`size-4 ${index < count ? "fill-[#FD8E1F] text-[#FD8E1F]" : "fill-[#E9EAF0] text-[#C6CAD1]"}`} />
      ))}
    </span>
  );
}

export function InstructorRatingPanel({ rating }: { rating: InstructorDashboardData["rating"] }) {
  return (
    <Panel title="Overall Course Rating" action="This week" className="min-h-[360px]">
      <div className="p-5">
        <div className="flex gap-5">
          <div className="flex h-[136px] w-[150px] shrink-0 flex-col items-center justify-center bg-[#EBEBFF]">
            <strong className="text-4xl font-semibold text-[#1D2026]">{rating.average ? rating.average.toFixed(1) : "0.0"}</strong>
            <Stars count={Math.round(rating.average)} />
            <span className="mt-1 text-xs font-medium text-[#1D2026]">Overall Rating</span>
          </div>
          <div className="flex min-w-0 flex-1 items-center">
            <svg viewBox="0 0 260 120" className="h-[120px] w-full">
              <path d="M0 82 C 30 28, 54 104, 82 56 S 142 42, 170 70 S 222 18, 260 54" fill="none" stroke="#564FFD" strokeWidth="3" />
            </svg>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {rating.breakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-3">
              <div className="flex w-[92px] items-center gap-1 text-sm text-[#4E5566]">
                <Stars count={row.stars} />
              </div>
              <span className="w-12 text-sm text-[#4E5566]">{row.stars} Star</span>
              <div className="h-2 flex-1 bg-[#E9EAF0]">
                <div className="h-full bg-[#564FFD]" style={{ width: `${row.percent}%` }} />
              </div>
              <span className="w-10 text-right text-sm font-medium text-[#1D2026]">{row.percent ? `${row.percent}%` : "0%"}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
