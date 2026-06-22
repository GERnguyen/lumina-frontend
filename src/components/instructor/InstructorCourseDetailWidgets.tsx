"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Clock,
  FileText,
  Languages,
  MessageCircle,
  MoreHorizontal,
  PlayCircle,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import type { InstructorCourseDetailData } from "@/services/instructor-course-detail-service";
import { cn } from "@/lib/utils";

type Course = InstructorCourseDetailData["course"];
type Fact = InstructorCourseDetailData["facts"][number];

const iconMap = {
  play: PlayCircle,
  users: Users,
  notepad: MessageCircle,
  level: BarChart3,
  language: Languages,
  file: FileText,
  clock: Clock,
  views: Trophy,
};

const toneMap: Record<Fact["tone"], string> = {
  purple: "bg-[#EBEBFF] text-[#564FFD]",
  green: "bg-[#E1F7E3] text-[#23BD33]",
  gray: "bg-[#F5F7FA] text-[#4E5566]",
};

function formatDate(value?: string) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function money(value?: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function Stars({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            size === "md" ? "size-6" : "size-5",
            index < rounded ? "fill-[#564FFD] text-[#564FFD]" : "fill-[#E9EAF0] text-[#C6CAD1]",
          )}
        />
      ))}
    </span>
  );
}

export function InstructorCourseBreadcrumb({ course }: { course: Course }) {
  return (
    <nav className="flex flex-wrap gap-2 text-sm tracking-[-0.14px]" aria-label="Breadcrumb">
      <Link href="/instructor/courses" className="text-[#6E7485] transition hover:text-[#564FFD]">
        Course
      </Link>
      <span className="text-[#6E7485]">/</span>
      <Link href="/instructor/courses" className="text-[#6E7485] transition hover:text-[#564FFD]">
        My Courses
      </Link>
      <span className="text-[#6E7485]">/</span>
      <span className="text-[#6E7485]">{course.category}</span>
      <span className="text-[#6E7485]">/</span>
      <span className="max-w-[720px] truncate text-[#1D2026]">{course.title}</span>
    </nav>
  );
}

export function InstructorCourseHero({ course }: { course: Course }) {
  return (
    <section className="flex flex-col gap-6 rounded-[18px] bg-white p-6 xl:flex-row">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[8px] bg-[#F5F7FA] xl:h-[264px] xl:w-[352px]">
        <Image src={course.image} alt={course.title} fill sizes="352px" className="object-cover" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4 text-xs leading-4">
            <span className="text-[#8C94A3]">
              Uploaded: <strong className="font-normal text-[#4E5566]">{formatDate(course.createdAt)}</strong>
            </span>
            <span className="text-[#8C94A3]">
              Last Updated: <strong className="font-normal text-[#4E5566]">{formatDate(course.updatedAt)}</strong>
            </span>
            {course.status ? (
              <span className="rounded-full bg-[#EBEBFF] px-2 py-0.5 text-[#564FFD]">{course.status}</span>
            ) : null}
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-semibold leading-[26px] text-[#1D2026]">{course.title}</h1>
            <p className="line-clamp-2 text-sm leading-[22px] tracking-[-0.14px] text-[#6E7485]">{course.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative size-[50px] overflow-hidden rounded-full bg-[#EBEBFF]">
              <Image
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructorName)}&background=EBEBFF&color=564FFD&bold=true`}
                alt={course.instructorName}
                fill
                sizes="50px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm tracking-[-0.14px] text-[#6E7485]">Created by:</p>
              <p className="mt-1 text-base font-medium text-[#1D2026]">{course.instructorName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Stars value={course.rating} />
            <span className="text-base font-medium text-[#1D2026]">{course.rating ? course.rating.toFixed(1) : "No rating"}</span>
            <span className="text-sm tracking-[-0.14px] text-[#6E7485]">
              ({new Intl.NumberFormat("en-US").format(course.reviewCount)} ratings)
            </span>
          </div>
        </div>

        <div className="h-px bg-[#E9EAF0]" />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-8">
            <div>
              <p className="text-xl leading-8 text-[#1D2026]">{money(course.price)}</p>
              <p className="text-sm tracking-[-0.14px] text-[#6E7485]">Course price</p>
            </div>
            <div className="h-10 w-px bg-[#E9EAF0]" />
            <div>
              <p className="text-xl leading-8 text-[#1D2026]">{money(course.revenue)}</p>
              <p className="text-sm tracking-[-0.14px] text-[#6E7485]">Total revenue</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/instructor/courses/${course.id}/assignments`}
              className="inline-flex h-12 items-center justify-center rounded-[18px] bg-[#EBEBFF] px-6 text-base font-semibold capitalize tracking-[-0.128px] text-[#564FFD] transition hover:bg-[#DEDFFF]"
            >
              Grade assignments
            </Link>
            <Link
              href={`/instructor/courses/${course.id}/earning`}
              className="inline-flex h-12 items-center justify-center rounded-[18px] bg-[#564FFD] px-6 text-base font-semibold capitalize tracking-[-0.128px] text-white transition hover:bg-[#453FCA]"
            >
              View earnings
            </Link>
            <button type="button" aria-label="More course actions" className="flex size-12 items-center justify-center rounded-[18px] bg-[#F5F7FA] text-[#4E5566] transition hover:bg-[#EBEBFF] hover:text-[#564FFD]">
              <MoreHorizontal className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function InstructorCourseFacts({ facts }: { facts: InstructorCourseDetailData["facts"] }) {
  return (
    <section className="grid gap-5 sm:grid-cols-2">
      {facts.map((fact) => {
        const Icon = iconMap[fact.icon];
        return (
          <article key={fact.label} className="flex min-h-[96px] items-center gap-6 rounded-[18px] bg-white p-6">
            <div className={cn("flex size-14 shrink-0 items-center justify-center", toneMap[fact.tone])}>
              <Icon className="size-8" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-2xl leading-8 text-[#1D2026]">{fact.value}</p>
              <p className="mt-1 text-sm tracking-[-0.14px] text-[#4E5566]">
                {fact.label} {fact.helper ? <span className="text-[#8C94A3]">({fact.helper})</span> : null}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export function InstructorCourseRatingPanel({ data }: { data: InstructorCourseDetailData }) {
  return (
    <section className="overflow-hidden rounded-[18px] bg-white">
      <div className="flex h-[58px] items-center justify-between border-b border-[#E9EAF0] px-5">
        <h2 className="text-base font-medium text-[#1D2026]">Overall Course Rating</h2>
        <span className="text-sm tracking-[-0.14px] text-[#6E7485]">This week</span>
      </div>

      <div className="p-5">
        <div className="flex gap-5">
          <div className="flex h-[150px] w-[150px] shrink-0 flex-col items-center justify-center rounded-[10px] bg-[#EBEBFF]">
            <strong className="text-4xl font-semibold text-[#1D2026]">{data.course.rating ? data.course.rating.toFixed(1) : "0.0"}</strong>
            <Stars value={data.course.rating} size="sm" />
            <span className="mt-1 text-xs font-medium text-[#1D2026]">Course Rating</span>
          </div>
          <svg viewBox="0 0 420 150" className="h-[150px] min-w-0 flex-1">
            <path d="M0 78 C28 120, 48 8, 74 68 S126 85, 152 60 S210 112, 238 62 S294 34, 320 78 S356 36, 384 58 S402 82, 420 62" fill="none" stroke="#564FFD" strokeWidth="3" />
            <path d="M0 98 C28 132, 48 24, 74 88 S126 105, 152 80 S210 132, 238 82 S294 54, 320 98 S356 56, 384 78 S402 102, 420 82 L420 150 L0 150 Z" fill="rgba(86,79,253,0.08)" />
          </svg>
        </div>

        <div className="mt-7 space-y-4">
          {data.ratingBreakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-3">
              <div className="flex w-[96px] items-center gap-1">
                <Stars value={row.stars} size="sm" />
              </div>
              <span className="w-12 text-sm tracking-[-0.14px] text-[#4E5566]">{row.stars} Star</span>
              <div className="h-2 flex-1 bg-[#E9EAF0]">
                <div className="h-full bg-[#564FFD]" style={{ width: `${row.percent}%` }} />
              </div>
              <span className="w-10 text-right text-sm font-medium tracking-[-0.14px] text-[#1D2026]">
                {row.percent ? `${row.percent}%` : "0%"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
