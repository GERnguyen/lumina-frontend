"use client";

import Hls from "hls.js";
import Image from "next/image";
import { AlertCircle, Loader2, Maximize2, Minimize2, Pause, Play, PlayCircle, Plus, Subtitles, Trash2, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { VideoLessonResponse, VideoQuestionResponse } from "@/types/course";
import type { VideoNoteDto } from "@/types/learning";
import {
  createVideoNoteAction,
  deleteVideoNoteAction,
  getVideoNotesByLessonAction,
  getVideoQuestionsAction,
  getVideoQuestionSubmissionsAction,
  submitVideoQuestionAnswerAction,
  trackVideoProgressAction,
  updateVideoNoteAction,
} from "@/services/actions/learning";
import { cn } from "@/lib/utils";

type HlsQualityLevel = {
  index: number;
  label: string;
  height: number;
};

function formatVideoTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";
  const totalSeconds = Math.floor(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

type LearningVideoLessonProps = {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  poster?: string;
  video?: VideoLessonResponse;
  resumePosition?: number;
  onComplete: (lessonId: string) => Promise<void> | void;
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
  const playerShellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTrackedSecond = useRef(0);
  const passedQuestionIdsThisRunRef = useRef<Set<string>>(new Set());
  const hasMarkedNearCompleteRef = useRef(false);
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
  const [qualityLevels, setQualityLevels] = useState<HlsQualityLevel[]>([]);
  const [selectedQuality, setSelectedQuality] = useState("-1");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hlsRef = useRef<Hls | null>(null);
  const [activeSubtitleLang, setActiveSubtitleLang] = useState<string | null>(null);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const subtitleMenuRef = useRef<HTMLDivElement>(null);

  const readySubtitles = video?.subtitles?.filter((track) => track.fileUrl && track.status === "READY") || [];

  // Set initial subtitle preference
  useEffect(() => {
    if (typeof window !== "undefined" && readySubtitles.length > 0) {
      const stored = localStorage.getItem("lumina:preferred-subtitle-language");
      if (stored && readySubtitles.some((s) => s.languageCode === stored)) {
        setActiveSubtitleLang(stored);
      } else {
        const defaultTrack = readySubtitles.find((s) => s.isDefault);
        if (defaultTrack) {
          setActiveSubtitleLang(defaultTrack.languageCode || null);
        } else {
          setActiveSubtitleLang(null);
        }
      }
    } else {
      setActiveSubtitleLang(null);
    }
  }, [lessonId, readySubtitles.length]);

  // Sync selected subtitle track with the video's actual text tracks
  useEffect(() => {
    const player = videoRef.current;
    if (!player) return;
    const tracks = player.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (activeSubtitleLang && track.language === activeSubtitleLang) {
        track.mode = "showing";
      } else {
        track.mode = "disabled";
      }
    }
  }, [activeSubtitleLang, readySubtitles.length]);

  // Handle clicking outside to close subtitles menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (subtitleMenuRef.current && !subtitleMenuRef.current.contains(event.target as Node)) {
        setShowSubtitleMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectSubtitle = (langCode: string | null) => {
    setActiveSubtitleLang(langCode);
    if (langCode) {
      localStorage.setItem("lumina:preferred-subtitle-language", langCode);
    } else {
      localStorage.removeItem("lumina:preferred-subtitle-language");
    }
    setShowSubtitleMenu(false);
  };

  useEffect(() => {
    const player = videoRef.current;
    const source = video?.videoUrl;

    hlsRef.current?.destroy();
    hlsRef.current = null;

    if (!player || !source) return undefined;

    if (player.canPlayType("application/vnd.apple.mpegurl")) {
      player.src = source;
      return undefined;
    }

    if (!Hls.isSupported()) return undefined;

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 30,
      maxBufferLength: 30,
      maxMaxBufferLength: 90,
      startLevel: -1,
      capLevelToPlayerSize: true,
    });
    hlsRef.current = hls;
    hls.loadSource(source);
    hls.attachMedia(player);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setSelectedQuality("-1");
      const levels = hls.levels
        .map((level, index) => ({
          index,
          height: level.height || 0,
          label: level.height ? `${level.height}p` : `${Math.round((level.bitrate || 0) / 1000)} kbps`,
        }))
        .filter((level, levelIndex, list) => level.label && list.findIndex((item) => item.label === level.label) === levelIndex)
        .sort((a, b) => b.height - a.height);
      setQualityLevels(levels);
    });
    hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
      if (hls.autoLevelEnabled) {
        setSelectedQuality("-1");
        return;
      }
      setSelectedQuality(String(data.level));
    });
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) setError("We could not load this video stream.");
    });

    return () => {
      hls.destroy();
      if (hlsRef.current === hls) hlsRef.current = null;
    };
  }, [video?.videoUrl]);

  function changeQuality(value: string) {
    setSelectedQuality(value);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = Number(value);
    }
  }

  function syncVideoDuration() {
    const player = videoRef.current;
    if (!player || !Number.isFinite(player.duration)) return;
    setDuration(player.duration);
    setCurrentTime(player.currentTime || 0);
  }

  useEffect(() => {
    let cancelled = false;
    passedQuestionIdsThisRunRef.current = new Set();
    hasMarkedNearCompleteRef.current = false;
    lastTrackedSecond.current = 0;

    async function loadVideoLearningData() {
      const [questionsResponse, submissionsResponse, notesResponse] = await Promise.all([
        getVideoQuestionsAction(courseId, lessonId),
        getVideoQuestionSubmissionsAction(courseId, lessonId),
        getVideoNotesByLessonAction(courseId, lessonId),
      ]);

      if (cancelled) return;

      if (questionsResponse?.success) {
        setQuestions((questionsResponse.data || []).sort((a: VideoQuestionResponse, b: VideoQuestionResponse) => (a.timestampSeconds || 0) - (b.timestampSeconds || 0)));
      }
      if (submissionsResponse?.success) {
        setAnsweredQuestionIds(new Set((submissionsResponse.data || []).map((item) => item.videoAssessmentId).filter((id): id is string => Boolean(id))));
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
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === playerShellRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const player = videoRef.current;
    let initialPosition = resumePosition || 0;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`lumina:video-progress:${courseId}:${lessonId}`);
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed > 0) {
            initialPosition = parsed;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (!player || initialPosition <= 0) return;

    const handleLoaded = () => {
      player.currentTime = initialPosition;
      setCurrentTime(initialPosition);
      lastTrackedSecond.current = initialPosition;
    };

    if (player.readyState >= 1) {
      handleLoaded();
      return;
    }

    player.addEventListener("loadedmetadata", handleLoaded, { once: true });
    return () => player.removeEventListener("loadedmetadata", handleLoaded);
  }, [courseId, lessonId, resumePosition]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        trackProgress(true);
      }
    };

    window.addEventListener("pagehide", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [courseId, lessonId]);

  async function trackProgress(force = false) {
    const player = videoRef.current;
    if (!player) return;

    const currentPosition = Math.floor(player.currentTime);
    if (currentPosition < 1) return;
    if (!force && (player.paused || currentPosition - lastTrackedSecond.current < 10)) return;

    lastTrackedSecond.current = currentPosition;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`lumina:video-progress:${courseId}:${lessonId}`, String(currentPosition));
      } catch (e) {
        console.error(e);
      }
    }
    await trackVideoProgressAction(courseId, lessonId, { currentPosition });
  }

  function handleTimeUpdate() {
    const player = videoRef.current;
    if (player) setCurrentTime(player.currentTime);
    trackProgress();
    if (!player || activeQuestion) return;

    const currentPosition = Math.floor(player.currentTime);
    if (!hasMarkedNearCompleteRef.current && duration > 0 && currentPosition >= Math.floor(duration * 0.95)) {
      hasMarkedNearCompleteRef.current = true;
      trackProgress(true).then(() => {
        onComplete(lessonId);
      });
    }

    const passedIds = passedQuestionIdsThisRunRef.current;
    let changedPassedIds = false;
    questions.forEach((question) => {
      if (!question.id || typeof question.timestampSeconds !== "number") return;
      if (currentPosition <= question.timestampSeconds - 1 && passedIds.delete(question.id)) {
        changedPassedIds = true;
      }
    });
    if (changedPassedIds) {
      passedQuestionIdsThisRunRef.current = new Set(passedIds);
    }

    const nextQuestion = questions.find((question) => {
      const timestamp = question.timestampSeconds ?? -1;
      return question.id && timestamp >= 0 && currentPosition >= timestamp && !passedQuestionIdsThisRunRef.current.has(question.id);
    });

    if (!nextQuestion) return;
    player.pause();
    setActiveQuestion(nextQuestion);
    setSelectedAnswers([]);
    setQuestionMessage(undefined);
  }

  function handleSeeked() {
    const player = videoRef.current;
    if (!player) return;
    setCurrentTime(player.currentTime);
    trackProgress(true);
    handleTimeUpdate();
  }

  function jumpToCheckpoint(timestamp?: number) {
    const player = videoRef.current;
    if (!player || typeof timestamp !== "number") return;
    player.currentTime = Math.max(0, timestamp - 1);
    player.play().catch(() => undefined);
  }

  function seekFromPointer(event: React.PointerEvent<HTMLDivElement>) {
    const player = videoRef.current;
    if (!player || duration <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    player.currentTime = ratio * duration;
    setCurrentTime(player.currentTime);
  }

  function seekBy(deltaSeconds: number) {
    const player = videoRef.current;
    if (!player || activeQuestion) return;
    player.currentTime = Math.min(duration || Number.MAX_SAFE_INTEGER, Math.max(0, player.currentTime + deltaSeconds));
    setCurrentTime(player.currentTime);
    handleTimeUpdate();
  }

  function togglePlayback() {
    const player = videoRef.current;
    if (!player || activeQuestion) return;
    if (player.paused) {
      player.play().catch(() => undefined);
    } else {
      player.pause();
    }
  }

  function toggleMute() {
    const player = videoRef.current;
    if (!player) return;
    player.muted = !player.muted;
    setIsMuted(player.muted);
  }

  function changeVolume(value: number) {
    const player = videoRef.current;
    if (!player) return;
    player.volume = value;
    player.muted = value === 0;
    setVolume(value);
    setIsMuted(player.muted);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => undefined);
      return;
    }

    playerShellRef.current?.requestFullscreen?.().catch(() => undefined);
  }

  function handlePlayerKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    if (target && ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)) return;
    if (activeQuestion) return;

    if (event.code === "Space" || event.key === "k" || event.key === "K") {
      event.preventDefault();
      togglePlayback();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      seekBy(-10);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      seekBy(10);
      return;
    }

    if (event.key === "m" || event.key === "M") {
      event.preventDefault();
      toggleMute();
      return;
    }

    if (event.key === "f" || event.key === "F") {
      event.preventDefault();
      toggleFullscreen();
    }
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

    const response = await submitVideoQuestionAnswerAction(courseId, lessonId, {
      videoAssessmentId: activeQuestion.id,
      userAnswer: encodeVideoAnswer(),
    });

    setIsSubmittingAnswer(false);
    if (!response.success) {
      setQuestionMessage(response.error || "That answer is not correct yet. Try again to continue.");
      return;
    }

    setAnsweredQuestionIds((current) => new Set(current).add(activeQuestion.id!));
    passedQuestionIdsThisRunRef.current = new Set(passedQuestionIdsThisRunRef.current).add(activeQuestion.id!);
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
    await trackProgress(true);
    onComplete(lessonId);
  }

  return (
    <div className="overflow-hidden rounded-[18px] bg-[#111827] shadow-[0_24px_70px_rgba(29,32,38,0.16)]">
      {video?.videoUrl ? (
        <div
          ref={playerShellRef}
          tabIndex={0}
          onKeyDown={handlePlayerKeyDown}
          onPointerDown={(event) => {
            const target = event.target as HTMLElement | null;
            if (target && ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)) return;
            playerShellRef.current?.focus();
          }}
          className="relative bg-black outline-none"
          aria-label="Video player"
        >
          <video
            ref={videoRef}
            className="aspect-video w-full bg-black object-contain"
            playsInline
            preload="metadata"
            poster={poster}
            onLoadedMetadata={syncVideoDuration}
            onDurationChange={syncVideoDuration}
            onTimeUpdate={handleTimeUpdate}
            onSeeked={handleSeeked}
            onPlay={() => setIsPlaying(true)}
            onPause={() => {
              setIsPlaying(false);
              trackProgress(true);
            }}
            onClick={togglePlayback}
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
          {qualityLevels.length > 1 ? (
            <label className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur">
              Quality
              <select
                value={selectedQuality}
                onChange={(event) => changeQuality(event.target.value)}
                className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-xs font-bold text-white outline-none"
              >
                <option value="-1" className="text-[#1D2026]">Auto</option>
                {qualityLevels.map((level) => (
                  <option key={level.index} value={level.index} className="text-[#1D2026]">
                    {level.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-5 pb-4 pt-12">
            <div
              role="slider"
              aria-label="Video progress"
              aria-valuemin={0}
              aria-valuemax={Math.floor(duration || 0)}
              aria-valuenow={Math.floor(currentTime || 0)}
              tabIndex={0}
              onPointerDown={seekFromPointer}
              className="relative h-5 cursor-pointer touch-none"
            >
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/25">
                <div className="h-full rounded-full bg-[#7872FD]" style={{ width: `${duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0}%` }} />
              </div>
              {duration > 0 && questions.length ? questions
                .filter((question) => typeof question.timestampSeconds === "number")
                .map((question, index) => {
                  const timestamp = Math.max(0, question.timestampSeconds || 0);
                  const left = Math.min(100, Math.max(0, (timestamp / duration) * 100));
                  const isAnswered = question.id ? answeredQuestionIds.has(question.id) : false;
                  return (
                    <button
                      key={question.id || `${timestamp}-${index}`}
                      type="button"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => jumpToCheckpoint(timestamp)}
                      aria-label={`Jump to quiz checkpoint at ${formatVideoTime(timestamp)}`}
                      title={`${question.questionText || "Video quiz"} - ${formatVideoTime(timestamp)}`}
                      className={cn(
                        "absolute top-1/2 flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-[0_8px_18px_rgba(0,0,0,0.32)] transition hover:scale-125",
                        isAnswered ? "bg-[#22C55E]" : "bg-[#7872FD]",
                      )}
                      style={{ left: `${left}%` }}
                    >
                      <span className="size-1.5 rounded-full bg-white" />
                    </button>
                  );
                }) : null}
            </div>

            <div className="mt-2 flex items-center gap-3 text-white">
              <button type="button" onClick={togglePlayback} className="flex size-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25" aria-label={isPlaying ? "Pause video" : "Play video"}>
                {isPlaying ? <Pause className="size-4 fill-white" /> : <Play className="size-4 fill-white" />}
              </button>
              <span className="min-w-[92px] text-xs font-bold tabular-nums text-white/90">
                {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <button type="button" onClick={toggleMute} className="flex size-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25" aria-label={isMuted ? "Unmute video" : "Mute video"}>
                  {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(event) => changeVolume(Number(event.target.value))}
                  className="hidden h-1 w-20 accent-[#7872FD] sm:block"
                  aria-label="Volume"
                />
                {readySubtitles.length > 0 ? (
                  <div className="relative" ref={subtitleMenuRef}>
                    <button
                      type="button"
                      onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full transition hover:bg-white/25",
                        activeSubtitleLang ? "bg-[#7872FD] text-white" : "bg-white/15 text-white"
                      )}
                      aria-label="Subtitles"
                      title="Subtitles/CC"
                    >
                      <Subtitles className="size-4" />
                    </button>
                    {showSubtitleMenu ? (
                      <div className="absolute bottom-11 right-0 z-[70] min-w-[140px] rounded-xl border border-white/10 bg-[#1D2026]/95 p-1.5 shadow-xl backdrop-blur">
                        <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => handleSelectSubtitle(null)}
                            className={cn(
                              "w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition hover:bg-white/10",
                              activeSubtitleLang === null ? "text-[#7872FD]" : "text-white/80"
                            )}
                          >
                            Off
                          </button>
                          {readySubtitles.map((track) => (
                            <button
                              key={track.id || track.languageCode}
                              type="button"
                              onClick={() => handleSelectSubtitle(track.languageCode || null)}
                              className={cn(
                                "w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition hover:bg-white/10",
                                activeSubtitleLang === track.languageCode ? "text-[#7872FD]" : "text-white/80"
                              )}
                            >
                              {track.displayName || track.languageCode}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <button type="button" onClick={toggleFullscreen} className="flex size-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                  {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </button>
              </div>
            </div>
          </div>
          {activeQuestion ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#111033]/60 px-4 backdrop-blur-sm">
              <div className="w-full max-w-[560px] rounded-[28px] bg-white p-7 shadow-[0_28px_90px_rgba(17,16,51,0.28)]">
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#7872FD]">Video checkpoint</p>
                <h3 className="mt-3 text-2xl font-black text-[#1D2026]">{activeQuestion.questionText || "Answer to continue"}</h3>
                <div className="mt-6 grid gap-3">
                  {(activeQuestion.options || []).map((option) => {
                    const optionId = option.id || option.optionText || "";
                    const selected = selectedAnswers.includes(optionId);
                    const isMultiple = activeQuestion.questionType === "MULTI_CHOICE";
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
                        <span
                          className={cn(
                            "flex size-6 items-center justify-center border transition",
                            isMultiple ? "rounded-[7px]" : "rounded-full",
                            selected ? "border-[#7872FD] bg-[#7872FD] text-white" : "border-[#CED1D9] bg-white",
                          )}
                        >
                          {selected ? <span className={cn("bg-white", isMultiple ? "h-3 w-3 rounded-[3px]" : "size-2.5 rounded-full")} /> : null}
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
        </div>
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
