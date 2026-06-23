"use client";

import Hls from "hls.js";
import Image from "next/image";
import { AlertCircle, Play, Subtitles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { WatchCourseData } from "@/data/watch-course";
import { API_BASE_URL } from "@/lib/api-base";
import { markItemAsCompleteAction } from "@/services/actions/learning";

type WatchVideoPlayerProps = {
  course: WatchCourseData;
  onLessonComplete?: (lessonId: string) => void;
};

export function WatchVideoPlayer({ course, onLessonComplete }: WatchVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTrackedSecond = useRef(0);
  const [error, setError] = useState<string>();
  const [activeSubtitleLang, setActiveSubtitleLang] = useState<string | null>(null);

  // Set initial subtitle preference
  useEffect(() => {
    if (course.subtitles && course.subtitles.length > 0) {
      const defaultTrack = course.subtitles.find((t) => t.default);
      if (defaultTrack) {
        setActiveSubtitleLang(defaultTrack.srcLang);
      } else {
        setActiveSubtitleLang(course.subtitles[0].srcLang);
      }
    } else {
      setActiveSubtitleLang(null);
    }
  }, [course.subtitles]);

  // Sync selected subtitle track with the video's actual text tracks
  useEffect(() => {
    const player = videoRef.current;
    if (!player) return;

    const syncTracks = () => {
      const tracks = player.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (activeSubtitleLang && track.language === activeSubtitleLang) {
          track.mode = "showing";
        } else {
          track.mode = "disabled";
        }
      }
    };

    syncTracks();

    const tracksList = player.textTracks;
    tracksList.addEventListener("change", syncTracks);
    tracksList.addEventListener("addtrack", syncTracks);

    return () => {
      tracksList.removeEventListener("change", syncTracks);
      tracksList.removeEventListener("addtrack", syncTracks);
    };
  }, [activeSubtitleLang, course.subtitles]);

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

  async function handleEnded() {
    if (!course.lessonId) return;

    // Trigger instant client state update
    if (onLessonComplete) {
      onLessonComplete(course.lessonId);
    }

    // Persist to database in background
    try {
      await markItemAsCompleteAction(course.lessonId);
    } catch (err) {
      console.error("Failed to mark lesson as complete:", err);
    }
  }

  return (
    <div className="relative aspect-[1528/690] overflow-hidden bg-[#1D2026]">
      {course.videoUrl ? (
        <>
          <video
            ref={videoRef}
            className="size-full object-cover"
            controls
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            poster={course.poster}
            onTimeUpdate={trackProgress}
            onEnded={handleEnded}
          >
            {course.subtitles?.map((track) => (
              <track key={`${track.srcLang}-${track.src}`} kind="subtitles" src={track.src} srcLang={track.srcLang} label={track.label} default={track.default} />
            ))}
          </video>

          {/* Subtitle Selector Overlay */}
          {course.subtitles && course.subtitles.length > 0 && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur transition-opacity opacity-90 hover:opacity-100">
              <Subtitles className="size-3.5 text-white/90" />
              <span className="text-[11px] font-bold mr-1">CC:</span>
              <select
                value={activeSubtitleLang || ""}
                onChange={(e) => setActiveSubtitleLang(e.target.value || null)}
                className="border-none bg-transparent py-0.5 pr-6 pl-0 text-xs font-bold text-white outline-none cursor-pointer focus:ring-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0 center',
                  backgroundSize: '1.25em 1.25em',
                  backgroundRepeat: 'no-repeat',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                }}
              >
                <option value="" className="text-gray-900 bg-white">Off</option>
                {course.subtitles.map((track) => (
                  <option key={track.srcLang} value={track.srcLang} className="text-gray-900 bg-white">
                    {track.label || track.srcLang}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
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
