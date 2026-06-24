import { API_BASE_URL } from "./api-base";

type CourseLike = {
  images?: Array<{ imageUrl?: string }>;
  category?: { name?: string };
  instructor?: { name?: string };
};

type UserLike = {
  avatarUrl?: string;
  name?: string;
};

type CourseProgressLike = {
  totalItems?: number;
  completedItems?: number;
};

export function money(value?: number): string {
  if (typeof value !== "number" || value === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function moneyWithCurrency(value?: number): string {
  if (typeof value !== "number" || value === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMoney(value?: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function compactNumber(value?: number): string {
  if (!value) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function fullNumber(value?: number): string {
  if (!value) return "0";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDuration(minutes?: number): string {
  if (!minutes) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

export function formatShortDate(value?: string): string {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function roundedRating(value = 0): number {
  return Math.round(value);
}

export function formatCourseLength(minutes?: number): string {
  if (!minutes) return "Self-paced";
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours} hours`;
}

export function splitDescription(description?: string): string[] {
  const text = description?.trim();
  if (!text) return [];
  return text
    .split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function getCourseImage(course?: CourseLike, index: number = 0): string {
  const image = course?.images?.find((img) => img.imageUrl)?.imageUrl ||
    course?.images?.[0]?.imageUrl ||
    `/courses/course-0${(index % 8) + 1}.png`;
  return image;
}

export function getCourseCategory(course?: CourseLike): string {
  return course?.category?.name || "Software Dev";
}

export function getCourseRating(rating?: number): string {
  return typeof rating === "number" && rating > 0 ? rating.toFixed(1) : "No reviews yet";
}

export function getCourseInstructorName(course?: CourseLike): string {
  const instructor = course?.instructor;
  const name = instructor?.name?.trim?.();
  if (name) return name;

  return "Course Instructor";
}

export function getProfileAvatar(user?: UserLike, fallbackName = "Cinx Learner"): string {
  const avatar = user?.avatarUrl?.trim();
  if (avatar) {
    if (/^(https?:|data:|blob:)/.test(avatar) || avatar.startsWith("/")) return avatar;
    return new URL(avatar, API_BASE_URL).toString();
  }

  const name = user?.name || fallbackName;
  const params = new URLSearchParams({
    name,
    background: "EBEBFF",
    color: "564FFD",
    bold: "true",
  });

  return `https://ui-avatars.com/api/?${params.toString()}`;
}

export function formatPurchaseDate(value?: string): string {
  if (!value) return "Recent purchase";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function paymentMethodLabel(method?: string): string {
  if (method === "MOMO") return "MoMo";
  if (method === "STRIPE") return "Stripe";
  return "Payment provider";
}

export function maskedPaymentAccount(paymentInfo?: string): string {
  if (!paymentInfo) return "Payment details unavailable";
  const trimmed = paymentInfo.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length >= 4) {
    return `**** **** **** ${digits.slice(-4)}`;
  }

  return trimmed;
}

export function getCourseProgressPercentage(progress?: CourseProgressLike): number {
  if (!progress?.totalItems) return 0;
  return Math.round(((progress.completedItems || 0) / progress.totalItems) * 100);
}
