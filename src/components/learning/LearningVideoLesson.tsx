"use client";

import Hls from "hls.js";
import Image from "next/image";
import { AlertCircle, PlayCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { VideoLessonResponse } from "@/types/course";
import { API_BASE_URL } from "@/lib/api-base";
import { markItemAsCompleteAction } from "@/services/actions/learning";

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
    if (currentPosition < 1 || currentPosition - lastTrackedSecond.current < 15) return;

    lastTrackedSecond.current = currentPosition;
    fetch(`${API_BASE_URL}/api/v1/learning/courses/${courseId}/lessons/${lessonId}/video-tracking`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPosition }),
      keepalive: true,
    }).catch(() => undefined);
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
          onTimeUpdate={trackProgress}
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
    </div>
  );
}
