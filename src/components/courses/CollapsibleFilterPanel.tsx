"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type CollapsibleFilterPanelProps = {
  title: string;
  children: ReactNode;
};

export function CollapsibleFilterPanel({ title, children }: CollapsibleFilterPanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <section className="border border-[#E9EAF0] bg-white">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between border-b border-[#E9EAF0] p-5 text-left text-lg font-medium uppercase text-[#1D2026] transition hover:text-[#7872FD]"
        aria-expanded={open}
      >
        {title}
        <ChevronDown className={cn("size-6 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-all duration-300 ease-out", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="p-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
