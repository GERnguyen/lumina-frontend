"use client";

import React, { useState, useEffect, useRef } from "react";
import { VideoLessonApi, VideoQuestionApi } from "@/services/api/course-api";
import { uploadFileWithPresignedUrl } from "@/lib/presigned-upload";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import { Checkbox, Input } from "@/components/ui/shared";
import { InstructorSwitch } from "@/components/ui/shared/InstructorSwitch";
import { Video, Trash2, Plus, Play, Pause, Save, Loader2, FileVideo } from "lucide-react";
import type { VideoLessonResponse, VideoQuestionResponse, CreateVideoOptionRequest } from "@/types";
import VideoSubtitleEditor from "./VideoSubtitleEditor";

interface VideoLessonEditorProps {
  courseId: string;
  lessonId: string;
}

export default function VideoLessonEditor({ courseId, lessonId }: VideoLessonEditorProps) {
  const [videoData, setVideoData] = useState<VideoLessonResponse | null>(null);
  const [questions, setQuestions] = useState<VideoQuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for interactive question
  const [newQuestionText, setNewQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"SINGLE_CHOICE" | "MULTI_CHOICE">("SINGLE_CHOICE");
  const [timestamp, setTimestamp] = useState(0);
  const [options, setOptions] = useState<CreateVideoOptionRequest[]>([
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchVideoDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [videoRes, questionsRes] = await Promise.all([
        VideoLessonApi.getVideoByLessonId(courseId, lessonId).catch(() => ({ data: undefined })),
        VideoQuestionApi.getQuestionsByLessonId(courseId, lessonId).catch(() => ({ data: [] })),
      ]);

      if (videoRes?.data) {
        setVideoData(videoRes.data);
      } else {
        setVideoData(null);
      }

      if (questionsRes?.data) {
        setQuestions(questionsRes.data);
      }
    } catch (err: any) {
      console.error("Failed to load video details:", err);
      setError("Failed to fetch video configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoDetails();
  }, [courseId, lessonId]);

  // Handle Video Upload
  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file (MP4, MOV, WebM).");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. Upload raw file to S3
      const fileKey = await uploadFileWithPresignedUrl(file, {
        prepareError: "Could not prepare video upload slot.",
        uploadError: "Failed to upload video stream to storage.",
      });

      // 2. Link file key to video lesson (determine if we create or update)
      const payload = {
        fileKey,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        duration: 0, // Backend will recalculate or update later
      };

      if (videoData?.videoUrl) {
        await VideoLessonApi.updateVideoLesson(courseId, lessonId, payload);
      } else {
        await VideoLessonApi.createVideoLesson(courseId, lessonId, payload);
      }

      await fetchVideoDetails();
    } catch (err: any) {
      console.error("Failed to link video lesson:", err);
      setError(err?.message || "Could not link uploaded video stream.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Add Question option row
  const addOptionRow = () => {
    setOptions([...options, { optionText: "", isCorrect: false }]);
  };

  // Remove option row
  const removeOptionRow = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  // Edit option details
  const updateOption = (index: number, field: keyof CreateVideoOptionRequest, val: any) => {
    const updated = [...options];
    if (field === "isCorrect" && questionType === "SINGLE_CHOICE") {
      // Ensure only one is correct
      updated.forEach((opt, idx) => {
        opt.isCorrect = idx === index ? val : false;
      });
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    setOptions(updated);
  };

  // Save Interactive Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || options.some((o) => !o.optionText.trim())) return;

    if (!options.some((o) => o.isCorrect)) {
      alert("At least one option must be marked as correct.");
      return;
    }

    setSavingQuestion(true);
    try {
      await VideoQuestionApi.createQuestion(courseId, lessonId, {
        questionText: newQuestionText,
        questionType,
        timestampSeconds: Math.floor(timestamp),
        options,
      });

      // Clear question form
      setNewQuestionText("");
      setOptions([
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ]);
      setTimestamp(0);

      // Refresh list
      const res = await VideoQuestionApi.getQuestionsByLessonId(courseId, lessonId);
      if (res?.data) {
        setQuestions(res.data);
      }
    } catch (err: any) {
      console.error("Failed to save interactive question:", err);
      alert(err?.message || "Could not save question.");
    } finally {
      setSavingQuestion(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this interactive question marker?")) return;

    try {
      await VideoQuestionApi.deleteQuestion(courseId, lessonId, questionId);
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (err: any) {
      console.error("Failed to delete question:", err);
      alert("Could not delete question marker.");
    }
  };

  // Capture current timestamp from video player
  const captureTimestamp = () => {
    if (videoRef.current) {
      setTimestamp(videoRef.current.currentTime);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <div className="flex h-48 flex-col items-center justify-center space-y-2">
        <Loader2 className="size-6 animate-spin text-primary-600" />
        <span className="text-[11px] text-gray-400 font-bold">Fetching video data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Video Resource Box */}
      <div className="rounded-lg border border-gray-200 p-6 bg-white space-y-5">
        <h3 className="text-base font-bold text-gray-900">Video Lesson Media</h3>

        {error && (
          <div className="rounded-lg bg-red-50 text-red-600 p-4 text-xs font-semibold border border-red-100">
            {error}
          </div>
        )}

        {videoData?.videoUrl ? (
          <div className="space-y-5">
            {/* Custom Video Preview */}
            <div className="rounded-lg overflow-hidden bg-black aspect-video relative max-w-full shadow-lg border border-gray-200">
              <video
                ref={videoRef}
                src={videoData.videoUrl}
                controls
                className="w-full h-full"
                onTimeUpdate={captureTimestamp}
              />
            </div>

            <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-200 rounded-lg max-w-full">
              <div className="flex items-center space-x-4 truncate">
                <FileVideo className="size-8 text-primary-600 shrink-0" />
                <div className="truncate">
                  <p className="text-sm font-semibold text-gray-800 truncate">{videoData.fileName || "video_lesson.mp4"}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Size: {videoData.fileSize ? `${(videoData.fileSize / (1024 * 1024)).toFixed(2)} MB` : "N/A"}
                  </p>
                </div>
              </div>

              <div className="relative group">
                <input
                  type="file"
                  id="reupload-video"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  accept="video/*"
                  onChange={handleUploadVideo}
                  disabled={uploading}
                />
                <InstructorButton size="md" variant="outline" disabled={uploading} className="px-3 py-2.5 text-sm font-medium">
                  {uploading ? <Loader2 className="size-3.5 animate-spin" /> : "Re-upload"}
                </InstructorButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 p-28 rounded-lg bg-gray-50/20 text-center relative group">
            <input
              type="file"
              id="upload-video"
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={handleUploadVideo}
              disabled={uploading}
            />
            {uploading ? (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="size-10 animate-spin text-primary-600" />
                <span className="text-sm text-primary-600 font-bold">Uploading video stream...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="size-12 bg-primary-50 text-primary-600 flex items-center justify-center rounded-lg group-hover:scale-105 transition-transform">
                  <Video className="size-6" />
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  Select a video file to upload, or <span className="text-primary-600 underline">browse</span>
                </p>
                <p className="text-sm text-gray-500 mt-1 font-medium">MP4 format recommended (Max 200MB)</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Subtitles Box */}
      {videoData?.videoUrl && (
        <VideoSubtitleEditor
          courseId={courseId}
          lessonId={lessonId}
          subtitles={videoData.subtitles}
          onRefresh={fetchVideoDetails}
        />
      )}

      {/* Interactive Questions Box */}
      {videoData?.videoUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question Maker */}
          <div className="rounded-lg border border-gray-200 p-6 bg-white space-y-5">
            <h4 className="text-base font-bold text-gray-900">Insert Mid-Video Question</h4>
            <p className="text-xs text-muted-foreground">
              Create single/multi choice questions that popup at a specific timestamp during playback.
            </p>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Input
                    id="timestamp"
                    type="number"
                    label="Trigger Timestamp (seconds)"
                    value={Math.floor(timestamp)}
                    onChange={(e) => setTimestamp(Number(e.target.value))}
                    min="0"
                    className="text-sm font-medium"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={captureTimestamp}
                  className="h-[48px] rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                  title="Capture current time from video player"
                >
                  Get Player Time
                </button>
              </div>

              <Input
                id="questionText"
                label="Question Prompt"
                placeholder="What is the output of this function?"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="text-sm font-medium"
                required
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">Question Options</label>
                <div className="space-y-2.5">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-2.5">
                      <Checkbox
                        checked={opt.isCorrect}
                        onCheckedChange={(checked) => updateOption(idx, "isCorrect", checked === true)}
                      />
                      <Input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt.optionText}
                        onChange={(e) => updateOption(idx, "optionText", e.target.value)}
                        required
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOptionRow(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addOptionRow}
                  className="mt-2 flex items-center space-x-1 text-sm font-medium text-primary-600 cursor-pointer hover:underline"
                >
                  <Plus className="size-3.5" />
                  <span>Add Option</span>
                </button>
              </div>

              <div className="flex items-center justify-end pt-2">
                <InstructorButton
                  type="submit"
                  size="md"
                  loading={savingQuestion}
                  icon={Save}
                  className="px-3 py-2.5 text-sm font-medium"
                >
                  Insert Marker
                </InstructorButton>
              </div>
            </form>
          </div>

          {/* Markers List */}
          <div className="rounded-lg border border-gray-200 p-6 bg-white space-y-5">
            <h4 className="text-base font-bold text-gray-900">Active Video Markers</h4>
            <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
              {questions.length > 0 ? (
                questions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-start justify-between rounded-lg border border-gray-200 p-3 transition-all hover:bg-gray-50/50"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-black text-white bg-primary-600 px-2.5 py-0.5 rounded-md select-none">
                          {formatTime(q.timestampSeconds || 0)}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                          {q.questionText}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-1.5 pl-6 list-disc text-sm text-gray-500 font-medium">
                        {q.options?.map((opt: any) => (
                          <li key={opt.id} className={opt.isCorrect ? "text-primary-600 font-bold" : ""}>
                            {opt.optionText} {opt.isCorrect && "✓"}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => q.id && handleDeleteQuestion(q.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-400 text-sm font-bold select-none bg-gray-50/20 border border-dashed border-gray-200 rounded-lg">
                  No interactive question markers inserted yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
