import React, { useState, useMemo, useCallback, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Users, Eye, BookOpen } from "lucide-react";
import type {
  InstructorLearnerProgress,
} from "@/services/actions/instructor";
import type { LearningItemProgressResponse, CourseCurriculumResponse } from "@/types";

import { getCourseProgressPercentage } from "@/lib/format";
import { InstructorCard } from "@/components/ui/shared/InstructorCard";
import { InstructorDialog } from "@/components/ui/shared/InstructorDialog";
import { Button } from "@/components/ui/Button";
import { Input, DataTable, DataTableEmptyState } from "@/components/ui/shared";

interface LearnersTabProps {
  courseId?: string;
  learners: InstructorLearnerProgress[];
  curriculum?: CourseCurriculumResponse | null;
}


function ProgressBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 border border-zinc-200/40">
      <div className="h-full rounded-full bg-primary-600 transition-all duration-300" style={{ width: `${width}%` }} />
    </div>
  );
}

export function LearnersTab({ courseId, learners, curriculum }: LearnersTabProps) {
  const [searchVal, setSearchVal] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchVal);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchVal]);

  const [selected, setSelected] = useState<InstructorLearnerProgress | null>(null);
  const [items, setItems] = useState<LearningItemProgressResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const lessonMap = useMemo(() => {
    const map: Record<string, string> = {};
    curriculum?.sections?.forEach((section) => {
      section.lessons?.forEach((lesson) => {
        if (lesson.id && lesson.title) {
          map[lesson.id] = lesson.title;
        }
      });
    });
    return map;
  }, [curriculum]);


  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return learners;
    return learners.filter((learner) => {
      const user = learner.user;
      return [user?.name, user?.email, learner.progress.userId].some((value) =>
        value?.toLowerCase().includes(term)
      );
    });
  }, [learners, query]);

  const openDetails = useCallback(
    async (learner: InstructorLearnerProgress) => {
      setSelected(learner);
      setItems([]);
      if (!courseId || !learner.progress.userId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/instructor/courses/${courseId}/learners/${learner.progress.userId}/progress`);
        setItems(await res.json());
      } catch (err) {
        console.error("Failed to load student item progress details:", err);
      } finally {
        setLoading(false);
      }
    },
    [courseId]
  );

  const columns = useMemo<ColumnDef<InstructorLearnerProgress>[]>(
    () => [
      {
        id: "learner",
        header: "Học viên",
        cell: ({ row }) => {
          const user = row.original.user;
          return (
            <div>
              <p className="font-bold text-zinc-950">{user?.name || row.original.progress.userId || "Unknown learner"}</p>
              <p className="mt-1 text-xs text-zinc-400 font-medium">{user?.email || row.original.progress.userId || "--"}</p>
            </div>
          );
        },
      },
      {
        id: "progress",
        header: "Tiến độ",
        cell: ({ row }) => {
          const progress = getCourseProgressPercentage(row.original.progress);
          return (
            <div className="min-w-40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-600 font-general">
                <span>{progress}%</span>
                <span>
                  {row.original.progress.completedItems || 0}/{row.original.progress.totalItems || 0}
                </span>
              </div>
              <ProgressBar value={progress} />
            </div>
          );
        },
      },
      {
        id: "score",
        header: "Điểm TB",
        cell: ({ row }) => (
          <span className="text-sm font-bold text-zinc-900 font-general">{row.original.progress.avgScore ?? "--"}</span>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5 select-none">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                row.original.progress.isCompleted
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                  : "bg-zinc-100 text-zinc-500 border-zinc-200"
              }`}
            >
              {row.original.progress.isCompleted ? "Hoàn thành" : "Đang học"}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                row.original.progress.isPassed
                  ? "bg-primary-50 text-primary-700 border-primary-200/50"
                  : "bg-amber-50 text-amber-700 border-amber-200/50"
              }`}
            >
              {row.original.progress.isPassed ? "Passed" : "Chưa pass"}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Chi tiết</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openDetails(row.original)}
              className="text-xs font-bold text-zinc-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              <Eye className="size-4 mr-1 shrink-0" />
              Xem
            </Button>
          </div>
        ),
      },
    ],
    [openDetails]
  );

  return (
    <>
      <InstructorCard
        title="Học viên và tiến độ"
        subtitle={`${learners.length} học viên có dữ liệu tiến độ`}
        className="border-zinc-200/50 shadow-xs"
        headerAction={
          <Input
            value={searchVal}
            onChange={(event) => setSearchVal(event.target.value)}
            placeholder="Tìm học viên..."
            className="w-64 text-sm bg-zinc-50/50 border-zinc-200"
          />
        }
        bodyClassName="p-0"
      >
        {filtered.length === 0 ? (
          <DataTableEmptyState
            icon={Users}
            title="Chưa có dữ liệu học viên"
            description="Danh sách tiến độ sẽ xuất hiện khi học viên bắt đầu học."
          />
        ) : (
          <DataTable columns={columns} data={filtered} minWidth={820} />
        )}
      </InstructorCard>

      {/* Progress detail dialog */}
      <InstructorDialog
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.user?.name || selected?.progress.userId || "Chi tiết tiến độ"}
        description="Tiến độ từng learning item trong khóa học"
        className="border-zinc-200 shadow-2xl rounded-xl"
      >
        {loading ? (
          <p className="py-6 text-sm font-bold text-zinc-400 text-center animate-pulse">Đang tải tiến độ...</p>
        ) : items.length === 0 ? (
          <DataTableEmptyState
            icon={BookOpen}
            title="Chưa có item progress"
            description="Backend chưa trả dữ liệu chi tiết cho học viên này."
          />
        ) : (
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={item.itemId || idx} className="rounded-xl border border-zinc-150 p-4 bg-zinc-50/50 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-zinc-800 truncate" title={lessonMap[item.itemId || ""] || item.itemId || "Unknown item"}>
                    {lessonMap[item.itemId || ""] || item.itemId || "Unknown item"}
                  </p>

                  <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 border border-zinc-250 rounded-md font-general">
                    {item.score ?? "--"} điểm
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span className={item.isCompleted ? "text-emerald-600" : "text-zinc-400"}>
                    {item.isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"}
                  </span>
                  <span className={item.isPassed ? "text-primary-600" : "text-amber-600"}>
                    {item.isPassed ? "Passed" : "Chưa pass"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </InstructorDialog>
    </>
  );
}
