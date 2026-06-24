import React from "react";
import { cn } from "@/lib/utils";

interface TabOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface InstructorTabsProps {
  tabs: TabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function InstructorTabs({
  tabs,
  value,
  onChange,
  className,
}: InstructorTabsProps) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100/70 p-1 text-zinc-500 border border-zinc-200/50",
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-bold transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-50",
              isActive
                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/20"
                : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/30"
            )}
          >
            {Icon && <Icon className="mr-1.5 size-3.5 shrink-0" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
