import Image from "next/image";
import { Captions, Expand, Pause, Play, Settings, SkipBack, SkipForward, Volume2 } from "lucide-react";
import type { WatchCourseData } from "@/data/watch-course";

export function WatchVideoPlayer({ course }: { course: WatchCourseData }) {
  return (
    <div className="relative aspect-[1528/690] overflow-hidden bg-[#1D2026]">
      <Image src={course.poster} alt={course.currentLesson} fill priority sizes="(min-width: 1280px) 1528px, 100vw" className="object-cover" />
      <div className="absolute inset-x-0 bottom-0 h-[130px] bg-gradient-to-b from-transparent to-black/55" />
      <div className="absolute inset-x-6 bottom-[66px] h-1 bg-white/50">
        <div className="h-full w-[50%] bg-white" />
        <div className="-mt-1 h-full w-[33%] bg-[#7872FD]" />
      </div>
      <div className="absolute inset-x-5 bottom-5 flex items-center justify-between text-white">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 drop-shadow">
            <SkipBack className="size-5 fill-current" />
            <Pause className="size-5 fill-current" />
            <SkipForward className="size-5 fill-current" />
          </div>
          <span className="text-sm">1:25 / 9:15</span>
        </div>
        <div className="flex items-center gap-4 drop-shadow">
          <Volume2 className="size-5" />
          <Captions className="size-5" />
          <Settings className="size-5" />
          <Expand className="size-5" />
        </div>
      </div>
      <button type="button" className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#7872FD] shadow-[0_0_32px_rgba(0,0,0,0.2)]" aria-label="Play lesson">
        <Play className="ml-1 size-7 fill-current" />
      </button>
    </div>
  );
}
