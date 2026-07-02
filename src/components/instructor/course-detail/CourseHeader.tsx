import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Edit2, Eye, Star, Users, BookOpen } from "lucide-react";
import type { CourseResponse } from "@/types";
import { getCourseImage, compactNumber, formatDuration } from "@/lib/format";
import { InstructorBadge } from "@/components/ui/shared/InstructorBadge";
import { InstructorCard } from "@/components/ui/shared/InstructorCard";
import { Button } from "@/components/ui/Button";
import { CourseApi } from "@/services/api/course-api";
import { useEffect, useState } from "react";


interface CourseHeaderProps {
  course: CourseResponse | null;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  const image = getCourseImage(course || undefined);
  const [rejectData, setRejectData] = useState<{ reason?: string; rejectedAt?: string } | null>(null);

  useEffect(() => {
    if (course?.id && course.publishStatus === "REJECTED") {
      CourseApi.getRejectReason(course.id)
        .then((res) => {
          if (res?.data) {
            setRejectData(res.data);
          }
        })
        .catch((err) => {
          console.error("Failed to load reject reason in header:", err);
        });
    } else {
      setRejectData(null);
    }
  }, [course?.id, course?.publishStatus]);


  return (
    <InstructorCard bodyClassName="p-0" className="border-zinc-200/50 shadow-xs">
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        {/* Cover Image thumbnail */}
        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-55 sm:h-28 sm:w-44 shadow-xs">
          <Image
            src={image}
            alt={course?.title || "Course thumbnail"}
            fill
            sizes="176px"
            className="object-cover"
          />
        </div>

        {/* Course Info metadata */}
        <div className="min-w-0 flex-1">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <InstructorBadge type="status" value={course?.status || ""} />
            {course?.status !== "DRAFT" ? (
              <InstructorBadge type="publishStatus" value={course?.publishStatus || ""} />
            ) : null}
            <span className="inline-flex rounded-full bg-zinc-100 px-3 py-0.5 text-xs font-semibold text-zinc-600 border border-zinc-200/50">
              {course?.category?.name || "Chưa phân loại"}
            </span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
            {course?.title || "Không tìm thấy khóa học"}
          </h1>
          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-relaxed text-zinc-500 font-medium">
            {course?.description || "Chưa có mô tả khóa học."}
          </p>

          {/* Icon summary counts */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-500 font-general">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4 text-zinc-400" />
              {compactNumber(course?.enrollmentCount)} học viên
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-4 text-amber-500 fill-amber-500" />
              {typeof course?.rating === "number" ? course.rating.toFixed(1) : "--"} đánh giá
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="size-4 text-zinc-400" />
              {formatDuration(course?.duration)}
            </span>
          </div>
        </div>

        {/* Right side links */}
        <div className="flex shrink-0 flex-wrap gap-2.5 sm:flex-col">
          <Button asChild variant="outline" size="sm" className="h-9 px-4 rounded-lg text-zinc-700 border-zinc-200 hover:bg-zinc-50 transition-all font-bold">
            <Link href={`/courses/${course?.id || ""}`}>
              <Eye className="size-4" />
              Xem public
            </Link>
          </Button>
          <Button asChild variant="default" size="sm" className="h-9 px-4 rounded-lg shadow-sm font-bold">
            <Link href={`/instructor/courses/edit/${course?.id || ""}`}>
              <Edit2 className="size-4" />
              Chỉnh sửa
            </Link>
          </Button>
        </div>
      </div>
      {rejectData?.reason && (
        <div className="border-t border-red-100 bg-red-50/50 px-6 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider">Rejection Reason</h4>
                {rejectData.rejectedAt && (
                  <span className="text-[10px] text-red-650 font-bold">
                    ({new Date(rejectData.rejectedAt).toLocaleDateString("vi-VN")})
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-red-700 leading-relaxed font-semibold">
                {rejectData.reason}
              </p>
            </div>
          </div>
        </div>
      )}
    </InstructorCard>
  );
}

