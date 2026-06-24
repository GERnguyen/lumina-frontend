import React from "react";
import { cn } from "@/lib/utils";

type BadgeType = "status" | "publishStatus";

interface InstructorBadgeProps {
  type: BadgeType;
  value: string;
  className?: string;
}

export function InstructorBadge({ type, value, className = "" }: InstructorBadgeProps) {
  const normalizedValue = value.toUpperCase();

  if (type === "status") {
    if (normalizedValue === "PUBLISHED") {
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full border border-emerald-250 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 transition-colors shadow-xs select-none",
            className
          )}
        >
          Đã xuất bản
        </span>
      );
    }
    if (normalizedValue === "DRAFT") {
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full border border-amber-250 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 transition-colors shadow-xs select-none",
            className
          )}
        >
          Bản nháp
        </span>
      );
    }
    if (normalizedValue === "ARCHIVED") {
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full border border-zinc-250 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-650 transition-colors shadow-xs select-none",
            className
          )}
        >
          Lưu trữ
        </span>
      );
    }
  } else if (type === "publishStatus") {
    if (normalizedValue === "WAITING_APPROVAL" || normalizedValue === "PENDING") {
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full border border-blue-250 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 transition-colors shadow-xs select-none",
            className
          )}
        >
          Chờ duyệt
        </span>
      );
    }
    if (normalizedValue === "REJECTED") {
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full border border-red-250 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-750 transition-colors shadow-xs select-none",
            className
          )}
        >
          Bị từ chối
        </span>
      );
    }
    if (normalizedValue === "PUBLISHED" || normalizedValue === "APPROVED") {
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full border border-emerald-250 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 transition-colors shadow-xs select-none",
            className
          )}
        >
          Đã duyệt
        </span>
      );
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 transition-colors select-none",
        className
      )}
    >
      {value}
    </span>
  );
}
