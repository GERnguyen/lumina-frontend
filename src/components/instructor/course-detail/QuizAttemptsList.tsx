"use client";

import React, { useState } from "react";
import { Eye, HelpCircle, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import type { QuizSessionResponse } from "@/types";
import { Button } from "@/components/ui/Button";
import { QuizSessionDetailDialog } from "./QuizSessionDetailDialog";

interface QuizAttemptsListProps {
  sessions: QuizSessionResponse[];
  userProfiles: Record<string, { name: string; email?: string }>;
  onGradeSuccess?: () => void;
}

function formatDateTime(dateStr?: string) {
  if (!dateStr) return "--";
  try {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function QuizAttemptsList({ sessions, userProfiles, onGradeSuccess }: QuizAttemptsListProps) {
  const [selectedSession, setSelectedSession] = useState<QuizSessionResponse | null>(null);

  // Filter out any sessions that don't have a submission/userId (in progress attempts might not have user info yet)
  const submittedAttempts = sessions.filter(
    (s) => s.status === "SUBMITTED" || s.status === "GRADED" || s.status === "PENDING_GRADE"
  );

  const selectedUserId = selectedSession ? (selectedSession.userId || selectedSession.quizSessionSubmission?.userId || "") : "";
  const studentName = selectedUserId ? (userProfiles[selectedUserId]?.name || selectedUserId) : "Ẩn danh";
  const studentEmail = selectedUserId ? userProfiles[selectedUserId]?.email : undefined;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between border-b border-zinc-150 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-450">Danh sách học viên làm bài</p>
        <span className="text-xs font-bold text-zinc-450 font-general">
          {submittedAttempts.length} lượt đã nộp bài
        </span>
      </div>

      {submittedAttempts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center">
          <HelpCircle className="size-6.5 mx-auto text-zinc-300" />
          <p className="mt-1.5 text-xs text-zinc-400 font-medium">Chưa có học viên nào nộp bài quiz này.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead>
                <tr className="border-b border-zinc-150 bg-zinc-50/50 text-[10px] font-bold uppercase tracking-wider text-zinc-450 select-none">
                  <th className="px-4 py-3">Học viên</th>
                  <th className="px-4 py-3">Nộp lúc</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Điểm số</th>
                  <th className="px-4 py-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150">
                {submittedAttempts.map((session, idx) => {
                  const userId = session.userId || session.quizSessionSubmission?.userId || "";
                  const profile = userProfiles[userId];
                  const score = session.quizSessionSubmission?.score;
                  const isPassed = typeof score === "number" ? score >= 5.0 : false;

                  return (
                    <tr key={session.id || idx} className="hover:bg-zinc-50/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-zinc-900">{profile?.name || userId || "Ẩn danh"}</p>
                        {profile?.email && (
                          <p className="mt-0.5 text-[10px] text-zinc-400 font-medium">{profile.email}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-zinc-500">
                        {formatDateTime(session.endTime || session.startTime)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${
                            session.status === "GRADED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                              : session.status === "SUBMITTED"
                                ? "bg-primary-50 text-primary-700 border-primary-200/50"
                                : session.status === "PENDING_GRADE"
                                  ? "bg-amber-50 text-amber-700 border-amber-200/50 animate-pulse"
                                  : "bg-zinc-100 text-zinc-500 border-zinc-200"
                          }`}
                        >
                          {session.status === "GRADED"
                            ? "Đã chấm"
                            : session.status === "SUBMITTED"
                              ? "Đã nộp"
                              : session.status === "PENDING_GRADE"
                                ? "Cần chấm"
                                : "Đang làm"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {typeof score === "number" ? (
                          <span className={`font-bold font-general text-sm ${isPassed ? "text-emerald-600" : "text-amber-600"}`}>
                            {score.toFixed(1)}/10
                          </span>
                        ) : (
                          <span className="font-bold text-zinc-400 font-general">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSession(session)}
                          className="h-7 text-[10px] font-bold text-zinc-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        >
                          <Eye className="size-3.5 mr-1" />
                          Xem bài
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Attempt Review Dialog */}
      {selectedSession && (
        <QuizSessionDetailDialog
          isOpen={Boolean(selectedSession)}
          onClose={() => setSelectedSession(null)}
          session={selectedSession}
          studentName={studentName}
          studentEmail={studentEmail}
          onGradeSuccess={onGradeSuccess}
        />
      )}
    </div>
  );
}
