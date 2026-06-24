import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardCheck, PenLine } from "lucide-react";
import type { AssignmentSubmissionResponse } from "@/types";
import { UserApi } from "@/services/api/user-api";
import { InstructorCard } from "@/components/ui/shared/InstructorCard";
import { InstructorDialog } from "@/components/ui/shared/InstructorDialog";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import { Button } from "@/components/ui/Button";
import { Input, DataTable, DataTableEmptyState } from "@/components/ui/shared";

type AssignmentSubmissionWithTitle = AssignmentSubmissionResponse & {
  assignmentTitle?: string;
};

interface AssignmentsTabProps {
  courseId?: string;
  assignments: AssignmentSubmissionWithTitle[];
}

export function AssignmentsTab({ courseId, assignments }: AssignmentsTabProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<AssignmentSubmissionWithTitle | null>(null);
  const [score, setScore] = useState("");
  const [saving, setSaving] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Record<string, { name: string; email?: string }>>({});

  useEffect(() => {
    async function hydrateUsers() {
      const studentIds = Array.from(new Set(assignments.map((a) => a.userId).filter(Boolean))) as string[];
      if (!studentIds.length) return;

      const missingIds = studentIds.filter((id) => !userProfiles[id]);
      if (!missingIds.length) return;

      try {
        const res = await UserApi.getUsersByIds(missingIds.join(",")).catch(() => undefined);
        const users = res?.data || [];
        const newEntries = users.reduce((acc, user) => {
          if (user.userId) {
            acc[user.userId] = {
              name: user.name || "Cinx learner",
              email: user.email,
            };
          }
          return acc;
        }, {} as Record<string, { name: string; email?: string }>);

        // Fallback for any IDs that weren't returned by the API
        missingIds.forEach((id) => {
          if (!newEntries[id]) {
            newEntries[id] = {
              name: "Cinx learner",
              email: undefined,
            };
          }
        });

        setUserProfiles((current) => ({ ...current, ...newEntries }));
      } catch (err) {
        console.error("Failed to fetch student profiles in assignments tab:", err);
      }
    }

    hydrateUsers();
  }, [assignments]);

  const submitScore = async () => {
    if (!courseId || !selected?.id) return;
    setSaving(true);
    try {
      await fetch(`/api/instructor/courses/${courseId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: selected.id, score: Number(score) }),
      });
      setSelected(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to submit assignment score:", err);
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnDef<AssignmentSubmissionWithTitle>[]>(
    () => [
      { accessorKey: "assignmentTitle", header: "Bài tập" },
      {
        id: "student",
        header: "Học viên",
        cell: ({ row }) => {
          const userId = row.original.userId;
          const profile = userId ? userProfiles[userId] : undefined;
          return (
            <div>
              <p className="text-sm font-bold text-zinc-950">{profile?.name || userId || "--"}</p>
              {profile?.email && <p className="text-[10px] text-zinc-400 font-medium">{profile.email}</p>}
            </div>
          );
        },
      },
      {
        id: "submitted",
        header: "Nộp lúc",
        cell: ({ row }) => (
          <span className="text-sm text-zinc-550">
            {row.original.submissionTime ? new Date(row.original.submissionTime).toLocaleDateString("vi-VN") : "--"}
          </span>
        ),
      },
      {
        id: "score",
        header: "Điểm",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${typeof row.original.score === "number"
                ? "bg-emerald-50 text-emerald-700 border-emerald-250/50"
                : "bg-amber-50 text-amber-700 border-amber-250/50"
              }`}
          >
            {typeof row.original.score === "number" ? row.original.score : "Chưa chấm"}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Hành động</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelected(row.original);
                setScore(typeof row.original.score === "number" ? String(row.original.score) : "");
              }}
              className="text-xs font-bold text-zinc-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg animate-in"
            >
              <PenLine className="size-4 mr-1 shrink-0" />
              Chấm điểm
            </Button>
          </div>
        ),
      },
    ],
    [userProfiles]
  );

  return (
    <>
      <InstructorCard
        title="Bài tập đã nộp"
        subtitle="Chấm điểm và xem file đính kèm của học viên"
        bodyClassName="p-0"
        className="border-zinc-200/50 shadow-xs"
      >
        {assignments.length === 0 ? (
          <DataTableEmptyState
            icon={ClipboardCheck}
            title="Chưa có bài nộp"
            description="Bài nộp assignment sẽ xuất hiện tại đây."
          />
        ) : (
          <DataTable columns={columns} data={assignments} minWidth={800} />
        )}
      </InstructorCard>

      <InstructorDialog
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.assignmentTitle || "Chấm bài tập"}
        description={selected?.userId ? (userProfiles[selected.userId]?.name || selected.userId) : undefined}
        className="border-zinc-200 shadow-2xl rounded-xl"
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-150 bg-zinc-50/50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nội dung nộp</p>
            <p className="mt-2.5 whitespace-pre-wrap text-sm text-zinc-700 leading-relaxed font-medium">
              {selected?.content || "Không có nội dung text."}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">File đính kèm (Attachment)</p>
            {(selected?.attachments || []).length === 0 ? (
              <p className="text-xs text-zinc-400 font-medium italic">Không có file đính kèm.</p>
            ) : (
              selected?.attachments?.map((attachment, idx) => (
                <a
                  key={attachment.id || attachment.attachmentUrl || idx}
                  href={attachment.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs font-semibold text-primary-600 hover:bg-primary-50 hover:border-primary-200 transition-all shadow-2xs"
                >
                  {attachment.fileName || "File đính kèm"}
                </a>
              ))
            )}
          </div>
          <Input
            type="number"
            label="Điểm bài làm"
            value={score}
            onChange={(event) => setScore(event.target.value)}
            placeholder="Nhập số điểm (e.g. 8)"
            className="border-zinc-200"
          />
          <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
            <InstructorButton variant="ghost" onClick={() => setSelected(null)} className="rounded-lg text-zinc-500">
              Hủy
            </InstructorButton>
            <InstructorButton loading={saving} onClick={submitScore} className="rounded-lg shadow-sm">
              Lưu điểm
            </InstructorButton>
          </div>
        </div>
      </InstructorDialog>
    </>
  );
}
