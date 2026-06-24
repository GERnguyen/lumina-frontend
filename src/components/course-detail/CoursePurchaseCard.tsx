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
import type { CourseResponse } from "@/types";
import { CoursePurchaseActions } from "./CoursePurchaseActions";
import { money, formatCourseLength, fullNumber } from "@/lib/format";

const factIcons = [Clock, BarChart3, Users, Globe, Languages];
const includeIcons = [Clock, RotateCcw, FileDown, Award, Smartphone, Languages, CheckCircle2];
const shareItems = [
  { label: "Copy link", icon: Copy },
  { label: "Facebook", text: "f" },
  { label: "Twitter", text: "x" },
  { label: "Email", icon: Share2 },
  { label: "WhatsApp", text: "w" },
];

type CoursePurchaseCardProps = {
  course: CourseResponse;
  isEnrolled: boolean;
  isInCart: boolean;
  isWishlisted: boolean;
  cartItemId?: string;
  isAuthenticated: boolean;
};

export function CoursePurchaseCard({
  course,
  isEnrolled,
  isInCart,
  isWishlisted,
  cartItemId,
  isAuthenticated,
}: CoursePurchaseCardProps) {
  const price = course.discountedPrice ?? course.price ?? 0;
  const original = course.discountedPrice && course.price && course.discountedPrice < course.price ? money(course.price) : undefined;
  const priceLabel = money(price);

  const discountRate = course.discountRate || 0;
  const discount = original && discountRate ? `${Math.round(discountRate)}% OFF` : original ? "On sale" : "Best value";
  const urgency = course.isInSubscription ? "Included in Cinx subscription" : "Enroll anytime and learn at your pace";

  const facts = [
    { label: "Course Duration", value: formatCourseLength(course.duration) },
    { label: "Course Level", value: "All levels" },
    { label: "Students Enrolled", value: fullNumber(course.enrollmentCount) },
    { label: "Language", value: "English" },
    { label: "Subtitle Language", value: "English" },
  ];

  const includes = [
    "Lifetime access",
    "Structured lessons and practice tasks",
    course.hasCertificate ? course.certificateTitle || "Shareable certificate of completion" : "Progress tracking",
    "Access on desktop, tablet and mobile",
    "100% online course",
  ];

  return (
    <aside className="sticky top-6 overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-white shadow-[0_10px_30px_rgba(29,32,38,0.08)]">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl font-semibold text-[#1D2026]">{priceLabel}</strong>
            {original ? <span className="text-sm text-[#8C94A3] line-through">{original}</span> : null}
          </div>
          <span className="rounded-[18px] bg-[#EBEBFF] px-3 py-1 text-xs font-semibold text-[#7872FD]">{discount}</span>
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#C83333]">
          <Clock className="size-4" />
          {urgency}
        </p>
      </div>

      <div className="border-y border-[#E9EAF0] px-6 py-4">
        <ul className="space-y-4">
          {facts.map((fact, index) => {
            const Icon = factIcons[index] ?? CheckCircle2;
            return (
              <li key={fact.label} className="flex items-center justify-between gap-4 text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-[#363B47]">
                  <Icon className="size-4 text-[#6E7485]" />
                  {fact.label}
                </span>
                <strong className="text-right text-xs font-medium text-[#1D2026]">{fact.value}</strong>
              </li>
            );
          })}
        </ul>
      </div>

      <CoursePurchaseActions
        courseId={course.id || ""}
        isAuthenticated={isAuthenticated}
        isEnrolled={isEnrolled}
        isInCart={isInCart}
        isWishlisted={isWishlisted}
        cartItemId={cartItemId}
      />

      <div className="border-t border-[#E9EAF0] p-6">
        <h3 className="text-base font-semibold text-[#1D2026]">This course includes:</h3>
        <ul className="mt-4 space-y-3">
          {includes.map((item, index) => {
            const Icon = includeIcons[index] ?? CheckCircle2;
            return (
              <li key={item} className="flex gap-2 text-sm font-medium text-[#363B47]">
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
