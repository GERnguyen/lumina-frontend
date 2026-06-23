"use client";

import React, { useState, useEffect } from "react";
import { ArticleLessonApi } from "@/services/api/course-api";
import { uploadFileWithPresignedUrl } from "@/lib/presigned-upload";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import { FileText, Loader2, UploadCloud, Trash2, ExternalLink } from "lucide-react";
import type { ArticleLessonResponse } from "@/types";

interface ArticleLessonEditorProps {
  courseId: string;
  lessonId: string;
}

export default function ArticleLessonEditor({ courseId, lessonId }: ArticleLessonEditorProps) {
  const [articleData, setArticleData] = useState<ArticleLessonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticleDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ArticleLessonApi.getArticleByLessonId(courseId, lessonId);
      if (res?.data) {
        setArticleData(res.data);
      } else {
        setArticleData(null);
      }
    } catch (err: any) {
      console.error("Failed to load article details:", err);
      // Backend may return 404 if no article configured yet, which is expected
      setArticleData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticleDetails();
  }, [courseId, lessonId]);

  // Upload File handler
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Upload to S3
      const fileKey = await uploadFileWithPresignedUrl(file, {
        prepareError: "Could not prepare file upload.",
        uploadError: "Failed to upload document to S3.",
      });

      // 2. Link S3 metadata to article
      const payload = {
        fileKey,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      };

      if (articleData?.articleUrl) {
        await ArticleLessonApi.updateArticleLesson(courseId, lessonId, payload);
      } else {
        await ArticleLessonApi.createArticleLesson(courseId, lessonId, payload);
      }

      await fetchArticleDetails();
    } catch (err: any) {
      console.error("Failed to link article lesson:", err);
      setError(err?.message || "Could not link document resource.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 flex-col items-center justify-center space-y-2">
        <Loader2 className="size-6 animate-spin text-primary-600" />
        <span className="text-[11px] text-gray-400 font-bold">Fetching article data...</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white space-y-5">
      <div>
        <h3 className="text-base font-bold text-gray-900">Article Content Resource</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload document readings (e.g. PDF guides, curriculum handouts, cheatsheets) for this unit.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 text-red-600 p-4 text-xs font-semibold border border-red-100">
          {error}
        </div>
      )}

      {articleData?.articleUrl ? (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center space-x-4 truncate">
            <div className="size-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-500 shrink-0">
              <FileText className="size-5" />
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-gray-800 truncate">{articleData.fileName || "handout.pdf"}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Size: {articleData.fileSize ? `${(articleData.fileSize / (1024 * 1024)).toFixed(2)} MB` : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <a
              href={articleData.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors select-none hover:bg-gray-100/50"
            >
              <span>View</span>
              <ExternalLink className="size-4" />
            </a>

            <div className="relative group">
              <input
                type="file"
                id="reupload-file"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={handleUploadFile}
                disabled={uploading}
              />
              <InstructorButton size="md" variant="outline" disabled={uploading} className="px-3 py-2.5 text-sm font-medium">
                {uploading ? <Loader2 className="size-3.5 animate-spin" /> : "Replace file"}
              </InstructorButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 p-28 rounded-lg bg-gray-50/20 text-center relative group">
          <input
            type="file"
            id="upload-file"
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleUploadFile}
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="size-10 animate-spin text-primary-600" />
              <span className="text-sm text-primary-600 font-bold">Uploading document resource...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="size-12 bg-primary-50 text-primary-600 flex items-center justify-center rounded-lg group-hover:scale-105 transition-transform">
                <UploadCloud className="size-6" />
              </div>
              <p className="text-sm font-semibold text-gray-800">
                Select a document to upload, or <span className="text-primary-600 underline">browse</span>
              </p>
              <p className="text-sm text-gray-500 font-medium">Supports PDF, DOCX, ZIP, TXT (Max 50MB)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
