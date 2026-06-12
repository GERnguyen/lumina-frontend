import {
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Copy,
  FileDown,
  Globe,
  Languages,
  RotateCcw,
  Share2,
  Smartphone,
  Users,
} from "lucide-react";
import type { CourseDetail } from "@/data/course-detail";
import { CoursePurchaseActions } from "./CoursePurchaseActions";

const factIcons = [Clock, BarChart3, Users, Globe, Languages];
const includeIcons = [Clock, RotateCcw, FileDown, Award, Smartphone, Languages, CheckCircle2];
const shareItems = [
  { label: "Copy link", icon: Copy },
  { label: "Facebook", text: "f" },
  { label: "Twitter", text: "x" },
  { label: "Email", icon: Share2 },
  { label: "WhatsApp", text: "w" },
];

export function CoursePurchaseCard({ course }: { course: CourseDetail }) {
  return (
    <aside className="sticky top-6 border border-[#E9EAF0] bg-white shadow-[0_10px_30px_rgba(29,32,38,0.08)]">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl font-semibold text-[#1D2026]">{course.price}</strong>
            {course.originalPrice ? <span className="text-sm text-[#8C94A3] line-through">{course.originalPrice}</span> : null}
          </div>
          <span className="rounded-[18px] bg-[#EBEBFF] px-3 py-1 text-xs font-semibold text-[#7872FD]">{course.discount}</span>
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#E34444]">
          <Clock className="size-4" />
          {course.urgency}
        </p>
      </div>

      <div className="border-y border-[#E9EAF0] px-6 py-4">
        <ul className="space-y-4">
          {course.facts.map((fact, index) => {
            const Icon = factIcons[index] ?? CheckCircle2;
            return (
              <li key={fact.label} className="flex items-center justify-between gap-4 text-sm">
                <span className="inline-flex items-center gap-2 text-[#4E5566]">
                  <Icon className="size-4 text-[#8C94A3]" />
                  {fact.label}
                </span>
                <strong className="text-right text-xs font-medium text-[#1D2026]">{fact.value}</strong>
              </li>
            );
          })}
        </ul>
      </div>

      <CoursePurchaseActions
        courseId={course.id}
        isAuthenticated={course.isAuthenticated}
        isEnrolled={course.isEnrolled}
        isInCart={course.isInCart}
        isWishlisted={course.isWishlisted}
        cartItemId={course.cartItemId}
      />

      <div className="border-t border-[#E9EAF0] p-6">
        <h3 className="text-base font-semibold text-[#1D2026]">This course includes:</h3>
        <ul className="mt-4 space-y-3">
          {course.includes.map((item, index) => {
            const Icon = includeIcons[index] ?? CheckCircle2;
            return (
              <li key={item} className="flex gap-2 text-sm text-[#4E5566]">
                <Icon className="mt-0.5 size-4 shrink-0 text-[#7872FD]" />
                <span>{item}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-[#E9EAF0] p-6">
        <h3 className="text-base font-semibold text-[#1D2026]">Share this course:</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {shareItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                className="flex h-10 min-w-10 items-center justify-center rounded-[18px] bg-[#F5F5FF] px-3 text-xs font-semibold text-[#4E5566] transition hover:bg-[#EBEBFF] hover:text-[#7872FD]"
                aria-label={item.label}
              >
                {Icon ? <Icon className="size-4" /> : item.text}
                {item.label === "Copy link" ? <span className="ml-2">Copy link</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
