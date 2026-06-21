"use client";

import { ExternalLink, FileText } from "lucide-react";
import type { ArticleLessonResponse } from "@/types/course";
import { markItemAsCompleteAction } from "@/services/actions/learning";

type LearningArticleLessonProps = {
  lessonId: string;
  article?: ArticleLessonResponse;
  onComplete: (lessonId: string) => void;
};

export function LearningArticleLesson({ lessonId, article, onComplete }: LearningArticleLessonProps) {
  async function completeArticle() {
    onComplete(lessonId);
    await markItemAsCompleteAction(lessonId);
  }

  return (
    <section className="rounded-[18px] border border-[#E9EAF0] bg-white p-6 shadow-[0_18px_48px_rgba(29,32,38,0.06)] lg:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex size-12 items-center justify-center rounded-[16px] bg-[#EBEBFF] text-[#564FFD]">
            <FileText className="size-6" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-[#1D2026]">Article lesson</h2>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#6E7485]">
            Read the lesson material, then mark it complete when you are done.
          </p>
        </div>
      </div>

      {article?.articleUrl ? (
        <div className="mt-6 overflow-hidden rounded-[18px] border border-[#E9EAF0]">
          <div className="flex items-center justify-between border-b border-[#E9EAF0] bg-[#F9FAFB] px-5 py-4">
            <div>
              <p className="text-sm font-bold text-[#1D2026]">{article.fileName || "Article material"}</p>
              <p className="mt-1 text-xs font-medium text-[#8C94A3]">{article.fileType || "Learning document"}</p>
            </div>
            <a href={article.articleUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#EBEBFF] px-4 py-2 text-sm font-bold text-[#564FFD] transition hover:bg-[#DEDCFF]">
              Open
              <ExternalLink className="size-4" />
            </a>
          </div>
          <iframe title="Article lesson" src={article.articleUrl} className="h-[640px] w-full bg-white" />
        </div>
      ) : (
        <div className="mt-6 rounded-[18px] border border-dashed border-[#CED1D9] bg-[#F9FAFB] p-8 text-center">
          <p className="text-base font-bold text-[#1D2026]">No article content yet</p>
          <p className="mt-2 text-sm font-medium text-[#6E7485]">The instructor has not attached a readable file for this lesson.</p>
        </div>
      )}

      <button
        type="button"
        onClick={completeArticle}
        className="mt-6 rounded-full bg-[#564FFD] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-[0_12px_28px_rgba(86,79,253,0.28)]"
      >
        Mark as complete
      </button>
    </section>
  );
}
