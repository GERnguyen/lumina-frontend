"use client";

import Link from "next/link";
import { ArrowUpRight, BarChart3, GraduationCap, Layers, Users } from "lucide-react";
import type { InstructorEarningData } from "@/services/instructor-earning-service";

type RevenueSeriesPoint = InstructorEarningData["revenueSeries"][number];
type EnrollmentSeriesPoint = InstructorEarningData["enrollmentSeries"][number];

const rangeTabs: Array<{ label: string; value: InstructorEarningData["activeRange"] }> = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "12 months", value: "12m" },
];

const statIcons = {
  revenue: BarChart3,
  gross: Layers,
  enrollments: GraduationCap,
  learners: Users,
};

const statTones = {
  purple: "bg-[#EBEBFF] text-[#564FFD]",
  green: "bg-[#E1F7E3] text-[#23BD33]",
  orange: "bg-[#FFF2E5] text-[#FD8E1F]",
  blue: "bg-[#E6F0FF] text-[#0066FF]",
};

function pathFromSeries(points: number[], width: number, height: number, padding = 28) {
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

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function compact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function Panel({ title, action, children, className = "" }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-[18px] bg-white ${className}`}>
      <div className="flex min-h-[54px] items-center justify-between border-b border-[#E9EAF0] px-5 py-4">
        <h2 className="text-base font-medium text-[#1D2026]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function InstructorEarningRangeTabs({ activeRange }: { activeRange: InstructorEarningData["activeRange"] }) {
  return (
    <div className="inline-flex rounded-[18px] bg-white p-1 shadow-[inset_0_0_0_1px_#E9EAF0]">
      {rangeTabs.map((tab) => (
        <Link
          key={tab.value}
          href={`/instructor/earning?range=${tab.value}`}
          className={`inline-flex h-10 items-center rounded-[14px] px-4 text-sm font-medium transition ${
            activeRange === tab.value ? "bg-[#564FFD] text-white shadow-[0_10px_24px_rgba(86,79,253,0.22)]" : "text-[#6E7485] hover:text-[#1D2026]"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export function InstructorEarningStatGrid({ summary }: { summary: InstructorEarningData["summary"] }) {
  return (
    <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
      {summary.map((stat) => {
        const Icon = statIcons[stat.icon];
        return (
          <article key={stat.label} className="flex min-h-[136px] items-center gap-5 rounded-[18px] bg-white p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(29,32,38,0.08)]">
            <div className={`flex size-[60px] shrink-0 items-center justify-center ${statTones[stat.tone]}`}>
              <Icon className="size-8" />
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-2xl font-normal leading-8 text-[#1D2026]">{stat.value}</strong>
              <span className="mt-1 block truncate text-sm tracking-[-0.14px] text-[#4E5566]">{stat.label}</span>
              <span className="mt-1 block truncate text-xs text-[#8C94A3]">{stat.helper}</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export function InstructorRevenueTrendPanel({ series }: { series: RevenueSeriesPoint[] }) {
  const netValues = series.map((item) => item.netRevenue);
  const grossValues = series.map((item) => item.grossRevenue);
  const netPath = pathFromSeries(netValues, 760, 300);
  const grossPath = pathFromSeries(grossValues, 760, 300);
  const maxValue = Math.max(...netValues, ...grossValues, 1);

  return (
    <Panel
      title="Revenue Statistic"
      action={<span className="text-sm text-[#6E7485]">Net vs gross</span>}
      className="min-h-[420px]"
    >
      <div className="p-5">
        {series.length ? (
          <>
            <svg viewBox="0 0 760 300" className="h-[300px] w-full overflow-visible">
              {[0, 1, 2, 3, 4].map((line) => (
                <line key={line} x1="28" x2="732" y1={36 + line * 48} y2={36 + line * 48} stroke="#F0F1F5" strokeWidth="1" />
              ))}
              <text x="28" y="24" className="fill-[#A1A5B3] text-[11px]">{compact(maxValue)}</text>
              <path d={`${netPath} L 732 272 L 28 272 Z`} fill="rgba(86,79,253,0.08)" />
              <path d={grossPath} fill="none" stroke="#23BD33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d={netPath} fill="none" stroke="#564FFD" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {series.map((item, index) => (
                <text key={`${item.label}-${index}`} x={28 + (index / Math.max(1, series.length - 1)) * 704} y="294" textAnchor="middle" className="fill-[#A1A5B3] text-[11px]">
                  {item.label}
                </text>
              ))}
            </svg>
            <div className="mt-4 flex flex-wrap gap-5 text-sm text-[#6E7485]">
              <span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-[#564FFD]" />Net revenue</span>
              <span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-[#23BD33]" />Gross revenue</span>
            </div>
          </>
        ) : (
          <EmptyState title="No revenue data yet" description="Published course sales will appear in this chart after learners complete paid orders." />
        )}
      </div>
    </Panel>
  );
}

export function InstructorEarningTodayCard({ value }: { value: string }) {
  return (
    <section className="relative overflow-hidden rounded-[18px] bg-[#111033] p-6 text-white">
      <div className="absolute right-[-64px] top-[-72px] size-[190px] rounded-full bg-[#564FFD]/40 blur-2xl" />
      <div className="relative">
        <div className="flex size-12 items-center justify-center rounded-[18px] bg-white/12">
          <ArrowUpRight className="size-6" />
        </div>
        <p className="mt-10 text-sm text-white/65">Today Net Revenue</p>
        <strong className="mt-2 block text-3xl font-semibold tracking-[-0.3px]">{value}</strong>
        <p className="mt-4 text-sm leading-6 text-white/65">
          Calculated from today&apos;s paid enrollments. Payout-only metrics are intentionally hidden until backend supports them.
        </p>
      </div>
    </section>
  );
}

export function InstructorEnrollmentTrendPanel({ series }: { series: EnrollmentSeriesPoint[] }) {
  const values = series.map((item) => item.enrollments);
  const path = pathFromSeries(values, 760, 260);

  return (
    <Panel title="Enrollment Trend" action={<span className="text-sm text-[#6E7485]">Paid enrollments</span>} className="min-h-[360px]">
      <div className="p-5">
        {series.length ? (
          <>
            <svg viewBox="0 0 760 260" className="h-[260px] w-full overflow-visible">
              {[0, 1, 2, 3, 4].map((line) => (
                <line key={line} x1="28" x2="732" y1={34 + line * 42} y2={34 + line * 42} stroke="#F0F1F5" strokeWidth="1" />
              ))}
              <path d={`${path} L 732 232 L 28 232 Z`} fill="rgba(253,142,31,0.08)" />
              <path d={path} fill="none" stroke="#FD8E1F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {series.map((item, index) => (
                <text key={`${item.label}-${index}`} x={28 + (index / Math.max(1, series.length - 1)) * 704} y="254" textAnchor="middle" className="fill-[#A1A5B3] text-[11px]">
                  {item.label}
                </text>
              ))}
            </svg>
          </>
        ) : (
          <EmptyState title="No enrollment data yet" description="Enrollment trends will be available after paid orders are created." />
        )}
      </div>
    </Panel>
  );
}

export function InstructorTopRevenueCourses({ courses }: { courses: InstructorEarningData["topRevenueCourses"] }) {
  return (
    <Panel title="Top Revenue Courses" action={<Link href="/instructor/courses" className="text-sm font-medium text-[#564FFD]">View all</Link>} className="min-h-[360px]">
      <div className="divide-y divide-[#E9EAF0]">
        {courses.length ? courses.map((course, index) => (
          <article key={`${course.id}-${index}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#F8F8FF]">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EBEBFF] text-sm font-semibold text-[#564FFD]">
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-[#1D2026]">{course.title}</h3>
                <p className="mt-1 text-xs text-[#8C94A3]">{compact(course.enrollments)} enrollments</p>
              </div>
            </div>
            <strong className="shrink-0 text-sm font-semibold text-[#1D2026]">{money(course.revenue)}</strong>
          </article>
        )) : (
          <EmptyState title="No revenue ranking yet" description="Course revenue rankings will appear when paid enrollment data is available." />
        )}
      </div>
    </Panel>
  );
}

export function InstructorTopEnrollmentCourses({ courses }: { courses: InstructorEarningData["topEnrollmentCourses"] }) {
  return (
    <Panel title="Top Enrolled Courses" action={<span className="text-sm text-[#6E7485]">Backend ranking</span>}>
      {courses.length ? (
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course, index) => (
            <article key={`${course.id}-${index}`} className="rounded-[18px] border border-[#E9EAF0] bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#D8D6FF] hover:shadow-[0_16px_34px_rgba(29,32,38,0.08)]">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8C94A3]">Rank {index + 1}</span>
              <h3 className="mt-3 line-clamp-2 min-h-11 text-base font-medium leading-[22px] text-[#1D2026]">{course.title}</h3>
              <p className="mt-4 text-sm text-[#6E7485]">
                <strong className="text-xl font-semibold text-[#564FFD]">{compact(course.enrollments)}</strong> paid enrollments
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No enrollment ranking yet" description="Top enrolled courses will appear after learners purchase your courses." />
      )}
    </Panel>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-[#EBEBFF] text-[#564FFD]">
        <BarChart3 className="size-6" />
      </div>
      <p className="mt-4 text-sm font-medium text-[#1D2026]">{title}</p>
      <p className="mt-2 max-w-[420px] text-sm leading-6 text-[#6E7485]">{description}</p>
    </div>
  );
}
