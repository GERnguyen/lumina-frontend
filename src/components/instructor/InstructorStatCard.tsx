"use client";

import {
  CheckSquare,
  CreditCard,
  FileText,
  Layers,
  PlayCircle,
  Trophy,
  UserCircle,
  Users,
} from "lucide-react";
import type { InstructorDashboardData } from "@/services/instructor-dashboard-service";

type Stat = InstructorDashboardData["stats"][number];

const iconMap = {
  play: PlayCircle,
  check: CheckSquare,
  users: Users,
  trophy: Trophy,
  student: UserCircle,
  notepad: FileText,
  card: CreditCard,
  stack: Layers,
};

const toneMap: Record<Stat["tone"], string> = {
  purple: "bg-[#EBEBFF] text-[#564FFD]",
  orange: "bg-[#FFF2E5] text-[#FD8E1F]",
  green: "bg-[#E1F7E3] text-[#23BD33]",
  red: "bg-[#FFF0F0] text-[#E34444]",
  blue: "bg-[#E6F0FF] text-[#0066FF]",
  gray: "bg-[#F5F7FA] text-[#4E5566]",
};

export function InstructorStatCard({ stat }: { stat: Stat }) {
  const Icon = iconMap[stat.icon];

  return (
    <article className="flex min-h-[116px] items-center gap-5 rounded-[18px] bg-white p-6">
      <div className={`flex size-[60px] shrink-0 items-center justify-center ${toneMap[stat.tone]}`}>
        <Icon className="size-8" />
      </div>
      <div className="min-w-0">
        <strong className="block truncate text-2xl font-normal leading-8 text-[#1D2026]">{stat.value}</strong>
        <span className="mt-1 block truncate text-sm tracking-[-0.14px] text-[#4E5566]">{stat.label}</span>
      </div>
    </article>
  );
}
