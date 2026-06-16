import type { ReactNode } from "react";

type Point = {
  label: string;
  value: number;
};

function pathFromSeries(points: number[], width: number, height: number, padding = 24) {
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

function Panel({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-[18px] bg-white ${className}`}>
      <div className="flex h-[58px] items-center justify-between border-b border-[#E9EAF0] px-5">
        <h2 className="text-base font-medium text-[#1D2026]">{title}</h2>
        {action ? <div className="text-sm tracking-[-0.14px] text-[#6E7485]">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function InstructorCourseRevenueChart({ series }: { series: Point[] }) {
  const values = series.map((point) => point.value);
  const path = pathFromSeries(values, 520, 340, 34);
  const max = Math.max(...values, 0);

  return (
    <Panel title="Revenue" action="This month" className="min-h-[480px]">
      <div className="p-5">
        <svg viewBox="0 0 520 360" className="h-[360px] w-full overflow-visible">
          {[0, 1, 2, 3, 4, 5].map((line) => (
            <line key={line} x1="34" x2="496" y1={42 + line * 52} y2={42 + line * 52} stroke="#F0F1F5" />
          ))}
          <path d={`${path} L 496 326 L 34 326 Z`} fill="rgba(35,189,51,0.08)" />
          <path d={path} fill="none" stroke="#23BD33" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {series.map((point, index) => (
            <text key={`${point.label}-${index}`} x={34 + (index / Math.max(1, series.length - 1)) * 462} y="352" textAnchor="middle" className="fill-[#A1A5B3] text-[11px]">
              {point.label}
            </text>
          ))}
          <text x="4" y="46" className="fill-[#A1A5B3] text-[11px]">{max ? new Intl.NumberFormat("en-US", { notation: "compact" }).format(max) : "0"}</text>
          <text x="4" y="326" className="fill-[#A1A5B3] text-[11px]">0</text>
        </svg>
      </div>
    </Panel>
  );
}

export function InstructorCourseOverviewChart({
  comments,
  views,
}: {
  comments: Point[];
  views: Point[];
}) {
  const commentPath = pathFromSeries(comments.map((point) => point.value), 760, 340, 40);
  const viewPath = pathFromSeries(views.map((point) => point.value), 760, 340, 40);

  return (
    <Panel
      title="Course Overview"
      action={(
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-[#564FFD]" />Comments</span>
          <span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-[#7872FD]" />View</span>
          <span>This month</span>
        </div>
      )}
      className="min-h-[480px] xl:col-span-2"
    >
      <div className="p-5">
        <svg viewBox="0 0 760 360" className="h-[360px] w-full overflow-visible">
          {[0, 1, 2, 3, 4, 5].map((line) => (
            <line key={line} x1="40" x2="732" y1={42 + line * 52} y2={42 + line * 52} stroke="#F0F1F5" />
          ))}
          <path d={`${commentPath} L 732 326 L 40 326 Z`} fill="rgba(86,79,253,0.08)" />
          <path d={commentPath} fill="none" stroke="#564FFD" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={viewPath} fill="none" stroke="#7872FD" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {comments.map((point, index) => (
            <text key={`${point.label}-${index}`} x={40 + (index / Math.max(1, comments.length - 1)) * 692} y="352" textAnchor="middle" className="fill-[#A1A5B3] text-[11px]">
              {point.label}
            </text>
          ))}
          <text x="6" y="46" className="fill-[#A1A5B3] text-[11px]">High</text>
          <text x="6" y="326" className="fill-[#A1A5B3] text-[11px]">0</text>
        </svg>
      </div>
    </Panel>
  );
}
