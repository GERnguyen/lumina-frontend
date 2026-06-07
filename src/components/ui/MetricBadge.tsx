import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MetricBadgeProps = {
  value: string;
  label: string;
  icon?: ReactNode;
  className?: string;
};

export function MetricBadge({ value, label, icon, className }: MetricBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-[20px] border border-white/70 bg-white/90 px-4 py-3 shadow-[0_22px_60px_rgba(0,43,107,0.16)] backdrop-blur",
        className,
      )}
    >
      {icon ? (
        <span className="flex size-10 items-center justify-center rounded-full bg-[#EAF2FF] text-[#0066FF]">
          {icon}
        </span>
      ) : null}
      <span>
        <strong className="block text-xl font-bold leading-none text-[#002B6B]">
          {value}
        </strong>
        <span className="text-xs font-semibold text-[#697589]">{label}</span>
      </span>
    </div>
  );
}
