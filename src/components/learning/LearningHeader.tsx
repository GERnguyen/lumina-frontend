import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { LearningPageData } from "@/types/learning-page";

type LearningHeaderProps = {
  data: LearningPageData;
};

export function LearningHeader({ data }: LearningHeaderProps) {
  return (
    <header className="border-b border-[#E9EAF0] bg-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <Link href={`/courses/${data.courseId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#564FFD] transition hover:text-[#4338CA]">
            <ArrowLeft className="size-4" />
            Back to course detail
          </Link>
          <h1 className="mt-3 truncate text-2xl font-bold text-[#1D2026] lg:text-[28px]">
            {data.courseTitle}
          </h1>
          <p className="mt-1 text-sm font-medium text-[#6E7485]">
            Learning with {data.instructorName || "Lumina Instructor"}
          </p>
        </div>

        <div className="w-full rounded-[18px] border border-[#E9EAF0] bg-[#F9FAFB] p-4 lg:w-[420px]">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-[#1D2026]">
              <CheckCircle2 className="size-4 text-[#23BD33]" />
              Your progress
            </span>
            <span className="font-bold text-[#564FFD]">{data.progressPercent}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E4E7EC]">
            <div className="h-full rounded-full bg-[#564FFD] transition-all duration-500" style={{ width: `${data.progressPercent}%` }} />
          </div>
          <p className="mt-2 text-xs font-medium text-[#6E7485]">
            {data.completedItems}/{data.totalItems} lessons completed
          </p>
        </div>
      </div>
    </header>
  );
}
