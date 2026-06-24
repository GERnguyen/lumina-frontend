import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, Eye, Users } from "lucide-react";
import type { CourseResponse } from "@/types";
import { getCourseImage, money } from "@/lib/format";
import { InstructorBadge } from "@/components/ui/shared/InstructorBadge";
import { Button } from "@/components/ui/Button";

const fallbackCourseImage = "/courses/course-01.png";

export const getCourseColumns = (): ColumnDef<CourseResponse>[] => [
  {
    id: "course",
    header: "Khóa học",
    cell: ({ row }) => {
      const course = row.original;
      const image = getCourseImage(course, row.index) || fallbackCourseImage;
      const updatedAtStr = course.updatedAt
        ? new Date(course.updatedAt).toLocaleDateString("vi-VN")
        : "Chưa cập nhật";

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
              className="max-w-[280px] truncate text-sm font-bold text-zinc-950 transition-colors group-hover:text-primary-600"
              title={course.title}
            >
              {course.title}
            </p>
            <p className="mt-1 text-xs text-zinc-400 font-medium">Cập nhật {updatedAtStr}</p>
          </div>
        </div>
      );
    },
  },
  {
    id: "category",
    header: "Danh mục",
    cell: ({ row }) => (
      <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-650 border border-zinc-200/50">
        {row.original.category?.name || "Chưa phân loại"}
      </span>
    ),
  },
  {
    id: "price",
    header: "Giá tiền",
    cell: ({ row }) => {
      const course = row.original;

      return (
        <div className="font-general">
          <span className="text-sm font-bold text-zinc-950">
            {money(course.discountedPrice ?? course.price)}
          </span>
          {course.discountedPrice && course.price && course.discountedPrice < course.price ? (
            <p className="mt-0.5 text-[11px] text-zinc-400 line-through">{money(course.price)}</p>
          ) : null}
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
      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 font-general">
        <Users className="size-4 text-zinc-400" />
        <span>{(row.original.enrollmentCount ?? 0).toLocaleString("vi-VN")}</span>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Hành động</div>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-1.5">
        <Button asChild variant="ghost" size="icon" className="size-8 rounded-lg text-zinc-450 hover:text-primary-600 hover:bg-primary-50">
          <Link href={`/instructor/courses/${row.original.id}`} title="Xem / quản lý khóa học">
            <Eye className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="icon" className="size-8 rounded-lg text-zinc-450 hover:text-primary-600 hover:bg-primary-50">
          <Link href={`/instructor/courses/edit/${row.original.id}`} title="Chỉnh sửa khóa học">
            <Edit2 className="size-4" />
          </Link>
        </Button>
      </div>
    ),
  },
];
