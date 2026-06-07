"use client";

import Hls from "hls.js";
import Image from "next/image";
import { AlertCircle, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { WatchCourseData } from "@/data/watch-course";
import { API_BASE_URL } from "@/lib/api-base";

export function WatchVideoPlayer({ course }: { course: WatchCourseData }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTrackedSecond = useRef(0);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const video = videoRef.current;
    const source = course.videoUrl;

    if (!video || !source) return undefined;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return undefined;
    }

    if (!Hls.isSupported()) {
      return undefined;
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        setError("We could not load this lesson stream.");
      }
    });

    return () => {
      hls.destroy();
    };
  }, [course.videoUrl]);

  function trackProgress() {
    const video = videoRef.current;

    if (!video || !course.lessonId) return;

    const currentPosition = Math.floor(video.currentTime);
    if (currentPosition < 1 || currentPosition - lastTrackedSecond.current < 15) return;

    lastTrackedSecond.current = currentPosition;

    fetch(`${API_BASE_URL}/api/v1/learning/courses/${course.courseId}/lessons/${course.lessonId}/video-tracking`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPosition }),
      keepalive: true,
    }).catch(() => undefined);
  }

  return (
    <div className="relative aspect-[1528/690] overflow-hidden bg-[#1D2026]">
      {course.videoUrl ? (
        <video
          ref={videoRef}
          className="size-full object-cover"
          controls
          playsInline
          preload="metadata"
          poster={course.poster}
          onTimeUpdate={trackProgress}
        >
          {course.subtitles?.map((track) => (
            <track key={`${track.srcLang}-${track.src}`} kind="subtitles" src={track.src} srcLang={track.srcLang} label={track.label} default={track.default} />
          ))}
        </video>
      ) : (
        <>
          <Image src={course.poster} alt={course.currentLesson} fill priority sizes="(min-width: 1280px) 1528px, 100vw" className="object-cover opacity-90" />
          <div className="absolute inset-0 bg-black/15" />
          <div className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#7872FD] shadow-[0_0_32px_rgba(0,0,0,0.2)]">
            <Play className="ml-1 size-7 fill-current" />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-black/70 p-6 text-sm font-medium text-white">
            Lesson video is not available yet.
          </div>
        </>
      )}

      {error ? (
        <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white">
          <AlertCircle className="size-4 text-[#FFB84D]" />
          {error}
        </div>
      ) : null}
    </div>
  );
}
