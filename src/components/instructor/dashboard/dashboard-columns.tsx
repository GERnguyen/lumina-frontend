import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, Users } from "lucide-react";
import type { CourseResponse } from "@/types";
import { InstructorBadge } from "@/components/ui/shared/InstructorBadge";
import { Button } from "@/components/ui/Button";

const fallbackCourseImage = "/courses/course-01.png";

export const getDashboardColumns = (): ColumnDef<CourseResponse>[] => [
  {
    id: "course",
    header: "Khóa học",
    cell: ({ row }) => {
      const course = row.original;
      const image = course.images?.[0]?.imageUrl || fallbackCourseImage;
      const updatedAtStr = course.updatedAt
        ? new Date(course.updatedAt).toLocaleDateString("vi-VN")
        : "Chưa cập nhật";
      const categoryName = course.category?.name || "Chưa phân loại";

      return (
        <div className="flex items-center gap-4 group">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 shadow-xs">
            <Image
              src={image}
              alt={course.title || "Course thumbnail"}
              fill
              sizes="56px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0">
            <p
              className="max-w-[340px] truncate text-sm font-bold text-zinc-955 transition-colors group-hover:text-primary-600"
              title={course.title}
            >
              {course.title}
            </p>
            <p className="mt-1 text-xs text-zinc-400 font-medium">
              {categoryName} • Cập nhật {updatedAtStr}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-1.5">
        <InstructorBadge type="status" value={row.original.status || ""} />
        {row.original.status !== "DRAFT" ? (
          <InstructorBadge type="publishStatus" value={row.original.publishStatus || ""} />
        ) : null}
      </div>
    ),
  },
  {
    id: "students",
    header: "Học viên",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-650 font-general">
        <Users className="size-4 text-zinc-400" />
        <span>{(row.original.enrollmentCount ?? 0).toLocaleString("vi-VN")}</span>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Hành động</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Button asChild variant="ghost" size="icon" className="size-8 rounded-lg text-zinc-450 hover:text-primary-600 hover:bg-primary-50">
          <Link href={`/instructor/courses/edit/${row.original.id}`} title="Chỉnh sửa khóa học">
            <Edit2 className="size-4" />
          </Link>
        </Button>
      </div>
    ),
  },
];
