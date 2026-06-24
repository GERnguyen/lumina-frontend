"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Loader2,
  Plus,
  Edit2,
  AlertCircle,
} from "lucide-react";
import type { LearningPathProposalResponse, CourseResponse } from "@/types";
import { getCourseCategory } from "@/lib/format";

interface RoadmapEditorProps {
  activeProposal: LearningPathProposalResponse;
  candidateCourses: CourseResponse[];
  isProposalPending: boolean;
  proposalError: string | null;
  onMutate: (operation: any) => void;
  onCommit: () => void;
}

export function RoadmapEditor({
  activeProposal,
  candidateCourses,
  isProposalPending,
  proposalError,
  onMutate,
  onCommit,
}: RoadmapEditorProps) {
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaTitle, setMetaTitle] = useState(activeProposal.title);
  const [metaDesc, setMetaDesc] = useState(activeProposal.description);

  useEffect(() => {
    setMetaTitle(activeProposal.title);
    setMetaDesc(activeProposal.description);
    setIsEditingMeta(false);
  }, [activeProposal]);

  const handleSaveMeta = () => {
    onMutate({
      operation: "UPDATE_METADATA",
      title: metaTitle,
      description: metaDesc,
    });
  };

  return (
    <aside className="w-[480px] shrink-0 flex flex-col rounded-[24px] border border-[#E9EAF0] bg-white shadow-sm overflow-hidden animate-note-pop">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E9EAF0] px-6 py-4 bg-[#F8F9FD]">
        <div className="flex items-center gap-2.5">
          <Sparkles className="size-5 text-[#FD8E1F]" />
          <h3 className="text-sm font-semibold text-[#1D2026]">Roadmap Proposal Editor</h3>
        </div>
        <span className="rounded-full bg-[#EBEBFF] px-2.5 py-1 text-[11px] font-semibold text-[#564FFD]">
          v{activeProposal.version}
        </span>
      </div>

      {/* Proposal Details View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {proposalError && (
          <div className="flex items-center gap-2 rounded-[14px] bg-[#FEEFF0] border border-[#FECACA] p-3 text-xs text-[#EB5757]">
            <AlertCircle className="size-4 shrink-0" />
            <p>{proposalError}</p>
          </div>
        )}

        {/* Title / Description info block */}
        <div className="bg-[#F8F8FF] border border-[#EBEBFF] rounded-[18px] p-4 relative group">
          {isEditingMeta ? (
            <div className="space-y-3">
              <input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full text-base font-semibold text-[#1D2026] border-b border-[#D8D6FF] pb-1 focus:outline-none focus:border-[#7872FD] bg-transparent"
                placeholder="Roadmap title"
              />
              <textarea
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                rows={3}
                className="w-full text-xs text-[#6E7485] leading-relaxed border-b border-[#D8D6FF] focus:outline-none focus:border-[#7872FD] bg-transparent resize-none"
                placeholder="Roadmap description"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button
                  onClick={() => {
                    setIsEditingMeta(false);
                    setMetaTitle(activeProposal.title);
                    setMetaDesc(activeProposal.description);
                  }}
                  className="h-8 rounded-lg px-3 text-xs font-semibold text-[#6E7485] hover:bg-[#E9EAF0]"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveMeta}
                  className="h-8 rounded-lg bg-[#7872FD] px-3 text-xs font-semibold text-white hover:bg-[#5F58F0]"
                >
                  Lưu
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsEditingMeta(true)}
                className="absolute right-3 top-3 inline-flex size-7 items-center justify-center rounded-full bg-white text-[#8C94A3] hover:text-[#7872FD] border border-[#E9EAF0] shadow-sm"
                title="Chỉnh sửa tiêu đề"
              >
                <Edit2 className="size-3.5" />
              </button>
              <h4 className="text-base font-semibold text-[#1D2026] pr-8">
                {activeProposal.title}
              </h4>
              <p className="mt-2 text-xs text-[#6E7485] leading-relaxed">
                {activeProposal.description}
              </p>
            </>
          )}
        </div>

        {/* List of learning path items */}
        <div className="space-y-4">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-[#8C94A3]">
            Nội dung lộ trình ({activeProposal.items?.length || 0} bài học)
          </h5>

          {activeProposal.items && activeProposal.items.length > 0 ? (
            <div className="space-y-3">
              {activeProposal.items.map((item, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === activeProposal.items.length - 1;

                return (
                  <div
                    key={`${item.lessonId}-${idx}`}
                    className="flex items-center gap-3 border border-[#E9EAF0] bg-white p-3 rounded-[14px] hover:border-[#D8D6FF] transition group relative"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#EBEBFF] text-[10px] font-semibold text-[#564FFD]">
                      {idx + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h6 className="text-xs font-semibold text-[#1D2026] truncate">
                        {item.lessonTitle}
                      </h6>
                      <p className="text-[10px] text-[#8C94A3] truncate mt-0.5">
                        {item.courseTitle}
                      </p>
                    </div>

                    {/* Reordering and removal controls */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          onMutate({
                            operation: "MOVE_LESSON",
                            lessonId: item.lessonId,
                            orderIndex: idx - 1,
                          })
                        }
                        disabled={isFirst || isProposalPending}
                        className="inline-flex size-6 items-center justify-center rounded-md text-[#8C94A3] hover:text-[#564FFD] hover:bg-[#F4F4FF] disabled:opacity-30"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          onMutate({
                            operation: "MOVE_LESSON",
                            lessonId: item.lessonId,
                            orderIndex: idx + 1,
                          })
                        }
                        disabled={isLast || isProposalPending}
                        className="inline-flex size-6 items-center justify-center rounded-md text-[#8C94A3] hover:text-[#564FFD] hover:bg-[#F4F4FF] disabled:opacity-30"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          onMutate({
                            operation: "REMOVE_LESSON",
                            lessonId: item.lessonId,
                          })
                        }
                        disabled={isProposalPending}
                        className="inline-flex size-6 items-center justify-center rounded-md text-[#8C94A3] hover:text-[#EB5757] hover:bg-[#FEEFF0]"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[#8C94A3] border border-dashed border-[#C6CAD1] rounded-[14px] bg-[#FAFAFD]">
              Chưa có bài học nào. Hãy hỏi assistant để thêm nội dung.
            </div>
          )}
        </div>

        {/* Candidate suggested courses addition */}
        {candidateCourses.length > 0 && (
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#8C94A3]">
              Khóa học liên quan gợi ý thêm
            </h5>
            <div className="space-y-2.5">
              {candidateCourses.map((course) => {
                const isAlreadyIn = activeProposal.items?.some(
                  (item) => item.courseId === course.id
                );
                if (isAlreadyIn) return null;

                return (
                  <div
                    key={course.id}
                    className="flex items-center justify-between gap-3 border border-dashed border-[#D2D6FF] bg-[#FAFAFF] p-3 rounded-[14px]"
                  >
                    <div className="min-w-0 flex-1">
                      <h6 className="text-xs font-semibold text-[#1D2026] truncate">
                        {course.title}
                      </h6>
                      <p className="text-[10px] text-[#6E7485] mt-0.5">
                        {getCourseCategory(course)}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onMutate({
                          operation: "ADD_COURSE",
                          courseId: course.id,
                        })
                      }
                      disabled={isProposalPending}
                      className="h-8 rounded-lg bg-[#EBEBFF] px-2.5 text-xs font-semibold text-[#564FFD] hover:bg-[#7872FD] hover:text-white transition inline-flex items-center gap-1 shrink-0"
                    >
                      <Plus className="size-3.5" /> Thêm
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="border-t border-[#E9EAF0] p-4 bg-[#F8F9FD] space-y-2">
        <button
          onClick={onCommit}
          disabled={isProposalPending || activeProposal.items?.length === 0}
          className="w-full h-12 rounded-[16px] bg-[#564FFD] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition shadow-[0_4px_12px_rgba(86,79,253,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProposalPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          Confirm & Create Learning Path
        </button>
        <p className="text-[10px] text-center text-[#8C94A3]">
          Lưu ý: Xác nhận sẽ tạo lộ trình học tập chính thức trong tài khoản của bạn.
        </p>
      </div>
    </aside>
  );
}
