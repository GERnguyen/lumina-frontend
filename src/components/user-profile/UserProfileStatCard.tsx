import type { ProfileStat } from "@/data/user-profile";

const toneClassNames = {
  purple: "bg-[#EBEBFF] text-[#564FFD]",
  green: "bg-[#E1F7E3] text-[#23BD33]",
  orange: "bg-[#FFF2E5] text-[#FD8E1F]",
};

export function UserProfileStatCard({ stat }: { stat: ProfileStat }) {
  const Icon = stat.icon;

  return (
    <article className={`flex min-h-[108px] items-center gap-6 p-6 ${toneClassNames[stat.tone]}`}>
      <div className="flex size-16 shrink-0 items-center justify-center bg-white">
        <Icon className="size-8" strokeWidth={1.8} />
      </div>
      <div>
        <strong className="block text-2xl font-normal leading-8 text-[#1D2026]">{stat.value}</strong>
        <span className="mt-1.5 block text-sm text-[#4E5566]">{stat.label}</span>
      </div>
    </article>
  );
}
