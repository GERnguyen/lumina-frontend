"use client";

import Hls from "hls.js";
import Image from "next/image";
import { AlertCircle, CheckCircle2, Loader2, Plus, PlayCircle, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { VideoLessonResponse, VideoQuestionResponse } from "@/types/course";
import type { VideoNoteDto } from "@/types/learning";
import { API_BASE_URL } from "@/lib/api-base";
import { createVideoNoteAction, deleteVideoNoteAction, getVideoNotesByLessonAction, markItemAsCompleteAction, updateVideoNoteAction } from "@/services/actions/learning";
import { cn } from "@/lib/utils";

type LearningVideoLessonProps = {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  poster?: string;
  video?: VideoLessonResponse;
  resumePosition?: number;
  onComplete: (lessonId: string) => void;
};

export function LearningVideoLesson({
  courseId,
  lessonId,
  lessonTitle,
  poster,
  video,
  resumePosition,
  onComplete,
}: LearningVideoLessonProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTrackedSecond = useRef(0);
  const [error, setError] = useState<string>();
  const [questions, setQuestions] = useState<VideoQuestionResponse[]>([]);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());
  const [activeQuestion, setActiveQuestion] = useState<VideoQuestionResponse>();
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [questionMessage, setQuestionMessage] = useState<string>();
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [notes, setNotes] = useState<VideoNoteDto[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string>();
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [createdNoteId, setCreatedNoteId] = useState<string>();
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  useEffect(() => {
    const player = videoRef.current;
    const source = video?.videoUrl;

    if (!player || !source) return undefined;

    if (player.canPlayType("application/vnd.apple.mpegurl")) {
      player.src = source;
      return undefined;
    }

    if (!Hls.isSupported()) return undefined;

    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(source);
    hls.attachMedia(player);
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) setError("We could not load this video stream.");
    });

    return () => hls.destroy();
  }, [video?.videoUrl]);

  useEffect(() => {
    let cancelled = false;

    async function loadVideoLearningData() {
      const [questionsResponse, submissionsResponse, notesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/lessons/${lessonId}/videos/questions`, { credentials: "include" }).catch(() => undefined),
        fetch(`${API_BASE_URL}/api/v1/learning/courses/${courseId}/lessons/${lessonId}/video-tracking/submissions`, { credentials: "include" }).catch(() => undefined),
        getVideoNotesByLessonAction(courseId, lessonId),
      ]);

      if (cancelled) return;

      if (questionsResponse?.ok) {
        const payload = await questionsResponse.json().catch(() => undefined);
        setQuestions((payload?.data || []).sort((a: VideoQuestionResponse, b: VideoQuestionResponse) => (a.timestampSeconds || 0) - (b.timestampSeconds || 0)));
      }
      if (submissionsResponse?.ok) {
        const payload = await submissionsResponse.json().catch(() => undefined);
        setAnsweredQuestionIds(new Set((payload?.data || []).map((item: { videoAssessmentId?: string }) => item.videoAssessmentId).filter(Boolean)));
      }
      if (notesResponse?.success) {
        setNotes(notesResponse.data || []);
      }
    }

    loadVideoLearningData();
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId]);

  useEffect(() => {
    const player = videoRef.current;
    if (!player || !resumePosition || resumePosition <= 0) return;

    const handleLoaded = () => {
      player.currentTime = resumePosition;
    };

    player.addEventListener("loadedmetadata", handleLoaded, { once: true });
    return () => player.removeEventListener("loadedmetadata", handleLoaded);
  }, [resumePosition]);

  function trackProgress() {
    const player = videoRef.current;
    if (!player) return;

    const currentPosition = Math.floor(player.currentTime);
    if (player.paused || currentPosition < 1 || currentPosition - lastTrackedSecond.current < 10) return;

    lastTrackedSecond.current = currentPosition;
    fetch(`${API_BASE_URL}/api/v1/learning/courses/${courseId}/lessons/${lessonId}/video-tracking`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPosition }),
      keepalive: true,
    }).catch(() => undefined);
  }

  function handleTimeUpdate() {
    trackProgress();
    const player = videoRef.current;
    if (!player || activeQuestion) return;

    const currentPosition = Math.floor(player.currentTime);
    const nextQuestion = questions.find((question) => {
      const timestamp = question.timestampSeconds ?? -1;
      return question.id && timestamp >= 0 && currentPosition >= timestamp && !answeredQuestionIds.has(question.id);
    });

    if (!nextQuestion) return;
    player.pause();
    setActiveQuestion(nextQuestion);
    setSelectedAnswers([]);
    setQuestionMessage(undefined);
  }

  function toggleVideoAnswer(optionId: string) {
    const type = activeQuestion?.questionType || "SINGLE_CHOICE";
    setSelectedAnswers((current) => {
      if (type === "SINGLE_CHOICE") return [optionId];
      return current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
    });
  }

  function encodeVideoAnswer() {
    return `[${[...selectedAnswers].sort().join(", ")}]`;
  }

  async function submitVideoAnswer() {
    if (!activeQuestion?.id || selectedAnswers.length === 0) return;
    setIsSubmittingAnswer(true);
    setQuestionMessage(undefined);

    const response = await fetch(`${API_BASE_URL}/api/v1/learning/courses/${courseId}/lessons/${lessonId}/video-tracking/questions/submit`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoAssessmentId: activeQuestion.id, userAnswer: encodeVideoAnswer() }),
    }).catch(() => undefined);

    setIsSubmittingAnswer(false);
    if (!response?.ok) {
      setQuestionMessage("That answer is not correct yet. Try again to continue.");
      return;
    }

    setAnsweredQuestionIds((current) => new Set(current).add(activeQuestion.id!));
    setActiveQuestion(undefined);
    setSelectedAnswers([]);
    videoRef.current?.play().catch(() => undefined);
  }

  async function createNote() {
    const content = noteContent.trim();
    const player = videoRef.current;
    if (!content || !player) return;

    setIsCreatingNote(true);
    const res = await createVideoNoteAction(courseId, lessonId, { content, videoTimestamp: Math.floor(player.currentTime) });
    setIsCreatingNote(false);
    if (!res.success || !res.data) return;
    setNotes((current) => [res.data!, ...current]);
    setCreatedNoteId(res.data.id);
    setNoteContent("");
    window.setTimeout(() => setCreatedNoteId(undefined), 700);
  }

  async function deleteNote(noteId?: string) {
    if (!noteId) return;
    setNotes((current) => current.filter((note) => note.id !== noteId));
    await deleteVideoNoteAction(noteId);
  }

  async function updateNote(note: VideoNoteDto) {
    if (!note.id || !editingNoteContent.trim()) return;
    const res = await updateVideoNoteAction(note.id, { content: editingNoteContent.trim(), videoTimestamp: note.videoTimestamp || 0 });
    if (!res.success) return;
    setNotes((current) => current.map((item) => (item.id === note.id ? res.data || { ...item, content: editingNoteContent.trim() } : item)));
    setEditingNoteId(undefined);
    setEditingNoteContent("");
  }

  async function handleEnded() {
    onComplete(lessonId);
    await markItemAsCompleteAction(lessonId);
  }

  return (
    <div className="overflow-hidden rounded-[18px] bg-[#111827] shadow-[0_24px_70px_rgba(29,32,38,0.16)]">
      {video?.videoUrl ? (
        <video
          ref={videoRef}
          className="aspect-video w-full bg-black object-contain"
          controls
          playsInline
          preload="metadata"
          poster={poster}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        >
          {video.subtitles
            ?.filter((track) => track.fileUrl && track.status === "READY")
            .map((track) => (
              <track
                key={`${track.languageCode}-${track.fileUrl}`}
                kind="subtitles"
                src={track.fileUrl}
                srcLang={track.languageCode || "en"}
                label={track.displayName || track.languageCode || "Subtitle"}
                default={track.isDefault}
              />
            ))}
        </video>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden">
          {poster ? <Image src={poster} alt={lessonTitle} fill sizes="(min-width: 1024px) 960px, 100vw" className="object-cover opacity-70" /> : null}
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white">
            <PlayCircle className="size-14 text-white/90" />
            <p className="text-lg font-bold">Video is not available yet</p>
            <p className="max-w-md text-sm font-medium text-white/75">This lesson exists in the curriculum, but the stream has not been processed.</p>
          </div>
        </div>
      )}

      {error ? (
        <div className="flex items-center gap-2 bg-[#FFF4E5] px-5 py-3 text-sm font-semibold text-[#9A5B00]">
          <AlertCircle className="size-4" />
          {error}
        </div>
      ) : null}

      {activeQuestion ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111033]/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[560px] rounded-[28px] bg-white p-7 shadow-[0_28px_90px_rgba(17,16,51,0.28)]">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#7872FD]">Video checkpoint</p>
            <h3 className="mt-3 text-2xl font-black text-[#1D2026]">{activeQuestion.questionText || "Answer to continue"}</h3>
            <div className="mt-6 grid gap-3">
              {(activeQuestion.options || []).map((option) => {
                const optionId = option.id || option.optionText || "";
                const selected = selectedAnswers.includes(optionId);
                return (
                  <button
                    key={optionId}
                    type="button"
                    onClick={() => toggleVideoAnswer(optionId)}
                    className={cn(
                      "flex items-center gap-3 rounded-[18px] border px-4 py-3 text-left text-sm font-semibold transition",
                      selected ? "border-[#7872FD] bg-[#EBEBFF] text-[#1D2026]" : "border-[#E9EAF0] text-[#4E5566] hover:border-[#D8D6FF]",
                    )}
                  >
                    <span className={cn("flex size-6 items-center justify-center rounded-full border", selected ? "border-[#7872FD] bg-[#7872FD] text-white" : "border-[#CED1D9]")}>
                      {selected ? <CheckCircle2 className="size-4" /> : null}
                    </span>
                    {option.optionText || optionId}
                  </button>
                );
              })}
            </div>
            {questionMessage ? <p className="mt-4 rounded-[14px] bg-[#FFF4E5] px-4 py-3 text-sm font-semibold text-[#9A5B00]">{questionMessage}</p> : null}
            <button
              type="button"
              onClick={submitVideoAnswer}
              disabled={isSubmittingAnswer || selectedAnswers.length === 0}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#7872FD] px-6 text-sm font-bold text-white transition hover:bg-[#635BFF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmittingAnswer ? <Loader2 className="size-4 animate-spin" /> : null}
              Submit answer
            </button>
          </div>
        </div>
      ) : null}

      <div className="border-t border-white/10 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={noteContent}
            onChange={(event) => setNoteContent(event.target.value)}
            className="h-12 min-w-0 flex-1 rounded-[16px] border border-[#E9EAF0] px-4 text-sm font-medium text-[#1D2026] outline-none transition focus:border-[#7872FD]"
            placeholder="Add a note at the current video time"
          />
          <button
            type="button"
            onClick={createNote}
            disabled={isCreatingNote || !noteContent.trim()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#7872FD] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#635BFF] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreatingNote ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Add note
          </button>
        </div>
        {notes.length ? (
          <div className="mt-4 grid gap-3">
            {notes.slice(0, 5).map((note) => (
              <div key={note.id} className={cn("flex items-start justify-between gap-3 rounded-[16px] bg-[#F5F7FA] p-4", createdNoteId === note.id && "animate-note-pop ring-2 ring-[#D8D6FF]")}>
                <div>
                  <p className="text-xs font-bold text-[#7872FD]">{Math.floor((note.videoTimestamp || 0) / 60)}:{String((note.videoTimestamp || 0) % 60).padStart(2, "0")}</p>
                  {editingNoteId === note.id ? (
                    <input
                      value={editingNoteContent}
                      onChange={(event) => setEditingNoteContent(event.target.value)}
                      className="mt-2 h-10 w-full rounded-[12px] border border-[#D8D6FF] bg-white px-3 text-sm font-medium text-[#1D2026] outline-none"
                    />
                  ) : (
                    <p className="mt-1 text-sm font-medium text-[#1D2026]">{note.content}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  {editingNoteId === note.id ? (
                    <button type="button" onClick={() => updateNote(note)} className="rounded-full px-3 py-2 text-xs font-bold text-[#7872FD] transition hover:bg-white">
                      Save
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setEditingNoteContent(note.content || "");
                      }}
                      className="rounded-full px-3 py-2 text-xs font-bold text-[#7872FD] transition hover:bg-white"
                    >
                      Edit
                    </button>
                  )}
                  <button type="button" onClick={() => deleteNote(note.id)} className="rounded-full p-2 text-[#A1A5B3] transition hover:bg-white hover:text-[#E34444]" aria-label="Delete note">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
