"use client";

import React, { useState, useEffect, useRef } from "react";
import { SubtitleTrackApi } from "@/services/api/course-api";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import { Input, Checkbox } from "@/components/ui/shared";
import {
  Subtitles,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Sparkles,
  Globe,
  Languages,
} from "lucide-react";
import type { SubtitleTrackResponse, SubtitleJobResponse } from "@/types";
import { cn } from "@/lib/utils";
import { useConfirmStore } from "@/stores/confirm-store";

interface VideoSubtitleEditorProps {
  courseId: string;
  lessonId: string;
  subtitles?: SubtitleTrackResponse[];
  onRefresh: () => void | Promise<void>;
}

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "vi", name: "Vietnamese" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
];

export default function VideoSubtitleEditor({
  courseId,
  lessonId,
  subtitles = [],
  onRefresh,
}: VideoSubtitleEditorProps) {
  const confirm = useConfirmStore((state) => state.confirm);
  // Upload states
  const [uploadLanguageCode, setUploadLanguageCode] = useState("en");
  const [uploadDisplayName, setUploadDisplayName] = useState("English");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadIsDefault, setUploadIsDefault] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // AI states
  const [aiGenerateLang, setAiGenerateLang] = useState("auto");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const [aiSourceSubtitleId, setAiSourceSubtitleId] = useState("");
  const [aiTargetLang, setAiTargetLang] = useState("vi");
  const [isTranslatingAi, setIsTranslatingAi] = useState(false);

  // Filter target languages that are not already present in the subtitles
  const existingLangCodes = subtitles.map((sub) => sub.languageCode);
  const availableTargetLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => !existingLangCodes.includes(lang.code)
  );

  useEffect(() => {
    if (availableTargetLanguages.length > 0) {
      if (!availableTargetLanguages.some((l) => l.code === aiTargetLang)) {
        setAiTargetLang(availableTargetLanguages[0].code);
      }
    } else {
      setAiTargetLang("");
    }
  }, [subtitles]);

  // General loading & jobs tracking
  const [jobs, setJobs] = useState<SubtitleJobResponse[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync upload display name when language code changes
  const handleLanguageCodeChange = (code: string) => {
    setUploadLanguageCode(code);
    const matched = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
    if (matched) {
      setUploadDisplayName(matched.name);
    }
  };

  // Poll jobs if there are active jobs in progress
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let active = true;

    const checkJobs = async () => {
      try {
        const res = await SubtitleTrackApi.getSubtitleJobs(courseId, lessonId);
        if (!active) return;

        if (res.success && res.data) {
          setJobs(res.data);
          const hasActiveJobs = res.data.some(
            (job) => job.status === "QUEUED" || job.status === "PROCESSING"
          );

          if (hasActiveJobs) {
            if (!intervalId) {
              intervalId = setInterval(checkJobs, 5000);
            }
          } else {
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
              onRefresh(); // Refresh track list since jobs finished
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch subtitle jobs:", err);
      }
    };

    checkJobs();

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [courseId, lessonId, isGeneratingAi, isTranslatingAi]);

  // Set message helper
  const triggerMessage = (type: "success" | "error", text: string) => {
    setActionError(null);
    setActionSuccess(null);
    if (type === "success") {
      setActionSuccess(text);
      setTimeout(() => setActionSuccess(null), 5000);
    } else {
      setActionError(text);
      setTimeout(() => setActionError(null), 5000);
    }
  };

  // Handle subtitle upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      triggerMessage("error", "Please select a subtitle file (.vtt or .srt) first.");
      return;
    }

    setIsUploading(true);
    setActionError(null);

    try {
      // 1. Get presigned upload URL
      const presignedRes = await SubtitleTrackApi.getSubtitlePresignedUrl(
        courseId,
        lessonId,
        {
          fileName: uploadFile.name,
          contentType: uploadFile.type || "text/vtt",
          languageCode: uploadLanguageCode,
        }
      );

      if (!presignedRes.success || !presignedRes.data?.presignedUrl || !presignedRes.data?.fileKey) {
        throw new Error(presignedRes.message || "Could not prepare subtitle upload slot.");
      }

      // 2. Upload file via PUT to presigned S3 url
      const uploadRes = await fetch(presignedRes.data.presignedUrl, {
        method: "PUT",
        body: uploadFile,
        headers: {
          "Content-Type": uploadFile.type || "text/vtt",
          "x-amz-acl": "public-read",
        },
      });

      if (!uploadRes.ok) {
        throw new Error(`Failed to upload file to storage: ${uploadRes.statusText}`);
      }

      // 3. Register subtitle track in database
      const createRes = await SubtitleTrackApi.createSubtitle(courseId, lessonId, {
        languageCode: uploadLanguageCode,
        displayName: uploadDisplayName,
        fileKey: presignedRes.data.fileKey,
        fileName: uploadFile.name,
        fileType: uploadFile.type || "text/vtt",
        fileSize: uploadFile.size,
        isDefault: uploadIsDefault,
      });

      if (!createRes.success) {
        throw new Error(createRes.message || "Could not save subtitle track details.");
      }

      // Reset state
      setUploadFile(null);
      setUploadIsDefault(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      triggerMessage("success", `Uploaded ${uploadDisplayName} subtitle successfully!`);
      onRefresh();
    } catch (err: any) {
      console.error("Subtitle upload failed:", err);
      triggerMessage("error", err?.message || "Failed to upload subtitle track.");
    } finally {
      setIsUploading(false);
    }
  };

  // Generate Default Subtitles (AI)
  const handleAiGenerate = async () => {
    setIsGeneratingAi(true);
    setActionError(null);
    try {
      const isAuto = aiGenerateLang === "auto";
      const matched = SUPPORTED_LANGUAGES.find((lang) => lang.code === aiGenerateLang);
      const res = await SubtitleTrackApi.createDefaultSubtitleJob(courseId, lessonId, {
        languageCode: isAuto ? undefined : aiGenerateLang,
        displayName: isAuto ? undefined : (matched?.name || aiGenerateLang.toUpperCase()),
      });

      if (!res.success) {
        throw new Error(res.message || "AI transcription job could not be started.");
      }

      triggerMessage("success", "AI subtitle generation job queued! It will update once finished.");
      // Instantly reload jobs list
      const jobsRes = await SubtitleTrackApi.getSubtitleJobs(courseId, lessonId);
      if (jobsRes.success && jobsRes.data) setJobs(jobsRes.data);
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      triggerMessage("error", err?.message || "Failed to start AI generation.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Translate Subtitles (AI)
  const handleAiTranslate = async () => {
    if (!aiSourceSubtitleId) {
      triggerMessage("error", "Please select a source subtitle track first.");
      return;
    }

    setIsTranslatingAi(true);
    setActionError(null);
    try {
      const res = await SubtitleTrackApi.createTranslationJobs(courseId, lessonId, {
        sourceSubtitleId: aiSourceSubtitleId,
        targetLanguageCodes: [aiTargetLang],
      });

      if (!res.success) {
        throw new Error(res.message || "AI translation job could not be started.");
      }

      triggerMessage("success", "AI translation job queued successfully!");
      // Instantly reload jobs list
      const jobsRes = await SubtitleTrackApi.getSubtitleJobs(courseId, lessonId);
      if (jobsRes.success && jobsRes.data) setJobs(jobsRes.data);
    } catch (err: any) {
      console.error("AI Translation failed:", err);
      triggerMessage("error", err?.message || "Failed to start AI translation.");
    } finally {
      setIsTranslatingAi(false);
    }
  };

  // Set default subtitle track
  const handleSetDefault = async (subtitleId: string) => {
    setActionError(null);
    try {
      const res = await SubtitleTrackApi.updateSubtitle(courseId, lessonId, subtitleId, {
        isDefault: true,
      });
      if (!res.success) throw new Error(res.message || "Could not set default subtitle.");
      triggerMessage("success", "Default subtitle track updated.");
      onRefresh();
    } catch (err: any) {
      console.error("Set default failed:", err);
      triggerMessage("error", err?.message || "Failed to update default track.");
    }
  };

  // Delete subtitle track
  const handleDelete = async (subtitleId: string, displayName?: string) => {
    const confirmed = await confirm({
      title: "Delete Subtitle Track",
      message: `Are you sure you want to delete the ${displayName || "selected"} subtitle track?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });
    if (!confirmed) return;

    setActionError(null);
    try {
      const res = await SubtitleTrackApi.deleteSubtitle(courseId, lessonId, subtitleId);
      if (!res.success) throw new Error(res.message || "Could not delete subtitle track.");
      triggerMessage("success", "Subtitle track deleted successfully.");
      onRefresh();
    } catch (err: any) {
      console.error("Delete subtitle failed:", err);
      triggerMessage("error", err?.message || "Failed to delete track.");
    }
  };

  // Get active jobs list
  const activeJobs = jobs.filter(
    (job) => job.status === "QUEUED" || job.status === "PROCESSING"
  );

  // Get ready source subtitles for translation dropdown
  const readySources = subtitles.filter((sub) => sub.status === "READY");

  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white space-y-6">
      <div className="flex items-center space-x-2">
        <Subtitles className="size-5 text-primary-600" />
        <h3 className="text-base font-bold text-gray-900">Video Subtitles</h3>
      </div>

      {actionSuccess && (
        <div className="rounded-lg bg-green-50 text-green-600 p-3.5 text-xs font-semibold border border-green-100 flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="rounded-lg bg-red-50 text-red-600 p-3.5 text-xs font-semibold border border-red-100 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Subtitles List */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-800">Uploaded Subtitle Tracks</h4>
        {subtitles.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs font-bold uppercase">
                  <th className="p-3">Language</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Default</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-gray-700 font-medium">
                {subtitles.map((track) => (
                  <tr key={track.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-semibold">
                      {track.displayName} ({track.languageCode})
                    </td>
                    <td className="p-3 text-xs">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        {track.source?.replace("AI_", "AI ") || "MANUAL"}
                      </span>
                    </td>
                    <td className="p-3 text-xs">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase",
                          track.status === "READY" && "bg-green-50 text-green-600 border border-green-200",
                          track.status === "PROCESSING" && "bg-blue-50 text-blue-600 border border-blue-200",
                          track.status === "FAILED" && "bg-red-50 text-red-600 border border-red-200"
                        )}
                      >
                        {track.status || "READY"}
                      </span>
                    </td>
                    <td className="p-3">
                      {track.isDefault ? (
                        <span className="bg-primary-50 text-primary-600 text-xs px-2.5 py-0.5 rounded-full font-bold border border-primary-200">
                          Default
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => track.id && handleSetDefault(track.id)}
                          className="text-xs text-gray-400 hover:text-primary-600 hover:underline cursor-pointer"
                        >
                          Make Default
                        </button>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => track.id && handleDelete(track.id, track.displayName)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Delete Subtitle Track"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-gray-400 text-xs font-bold bg-gray-50/50 border border-dashed border-gray-200 rounded-lg">
            No subtitle tracks uploaded or generated yet.
          </div>
        )}
      </div>

      {/* Active Jobs Progress Bar */}
      {activeJobs.length > 0 && (
        <div className="rounded-xl border border-blue-150 bg-blue-50/50 p-4 space-y-3">
          <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
            <Loader2 className="size-3.5 animate-spin" />
            AI Subtitle Jobs Running
          </h4>
          <div className="space-y-2">
            {activeJobs.map((job) => (
              <div key={job.id} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-gray-700">
                  <span>
                    {job.jobType === "GENERATE_DEFAULT"
                      ? `Transcribing video (${job.targetLanguageCode})`
                      : `Translating subtitle (${job.sourceLanguageCode} ➜ ${job.targetLanguageCode})`}
                  </span>
                  <span>{job.progressPercent || 0}%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary-600 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${job.progressPercent || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload and AI Panel Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Upload Subtitles File */}
        <form onSubmit={handleUpload} className="space-y-4 rounded-lg border border-gray-150 p-5 bg-gray-50/30">
          <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <UploadCloud className="size-4 text-gray-500" />
            Upload Subtitle Track
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Language</label>
              <select
                value={uploadLanguageCode}
                onChange={(e) => handleLanguageCodeChange(e.target.value)}
                className="w-full h-[40px] rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Display Label</label>
              <Input
                value={uploadDisplayName}
                onChange={(e) => setUploadDisplayName(e.target.value)}
                placeholder="e.g. English"
                className="h-[40px] text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Subtitle File (.vtt or .srt)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".vtt,.srt"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="upload-default"
              checked={uploadIsDefault}
              onCheckedChange={(checked) => setUploadIsDefault(checked === true)}
            />
            <label htmlFor="upload-default" className="text-xs font-semibold text-gray-700 select-none cursor-pointer">
              Set as default language for lesson
            </label>
          </div>

          <div className="flex justify-end pt-1">
            <InstructorButton
              type="submit"
              size="md"
              loading={isUploading}
              className="text-xs font-semibold px-4"
              disabled={!uploadFile}
            >
              Upload Track
            </InstructorButton>
          </div>
        </form>

        {/* AI Options Box */}
        <div className="space-y-5 rounded-lg border border-gray-150 p-5 bg-gray-50/30 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary-500" />
              AI Subtitle Automation
            </h4>             {/* AI Generate Subtitles */}
            <div className="space-y-2 pb-4 border-b border-gray-150">
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                Transcribe the video audio to generate subtitles automatically in the selected language.
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={aiGenerateLang}
                  onChange={(e) => setAiGenerateLang(e.target.value)}
                  className="h-[38px] flex-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold outline-none focus:border-primary-500"
                >
                  <option value="auto">Auto Detect Language</option>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isGeneratingAi || activeJobs.length > 0}
                  className="h-[38px] px-3.5 rounded-lg bg-primary-600 text-white font-bold text-xs hover:bg-primary-700 transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm shrink-0"
                >
                  {isGeneratingAi ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                  Transcribe (AI)
                </button>
              </div>
            </div>
            {/* AI Translate Subtitles */}
            <div className="space-y-2">
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                Translate existing subtitles into other languages. Requires at least one ready subtitle track.
              </p>
              {readySources.length > 0 ? (
                availableTargetLanguages.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Source</label>
                        <select
                          value={aiSourceSubtitleId}
                          onChange={(e) => setAiSourceSubtitleId(e.target.value)}
                          className="w-full h-[36px] rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold outline-none focus:border-primary-500"
                        >
                          <option value="">Select source...</option>
                          {readySources.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.displayName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Translate to</label>
                        <select
                          value={aiTargetLang}
                          onChange={(e) => setAiTargetLang(e.target.value)}
                          className="w-full h-[36px] rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold outline-none focus:border-primary-500"
                        >
                          {availableTargetLanguages.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAiTranslate}
                        disabled={isTranslatingAi || !aiSourceSubtitleId || activeJobs.length > 0}
                        className="h-[38px] px-3.5 rounded-lg border border-primary-200 bg-primary-50 text-primary-600 font-bold text-xs hover:bg-primary-100 transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs shrink-0"
                      >
                        {isTranslatingAi ? <Loader2 className="size-3.5 animate-spin" /> : <Languages className="size-3.5" />}
                        Translate (AI)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-center border border-dashed border-gray-200 text-[11px] text-gray-400 font-bold rounded-lg bg-white/40">
                    All supported languages already have subtitles.
                  </div>
                )
              ) : (
                <div className="p-3 text-center border border-dashed border-gray-200 text-[11px] text-gray-400 font-bold rounded-lg bg-white/40">
                  Ready subtitle track required to translate.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
