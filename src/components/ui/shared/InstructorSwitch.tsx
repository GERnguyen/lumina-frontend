import React from "react";
import { cn } from "@/lib/utils";

interface InstructorSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function InstructorSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: InstructorSwitchProps) {
  return (
    <div className="flex items-start space-x-3 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary-600" : "bg-zinc-200"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
            checked ? "translate-x-4.5" : "translate-x-0.5"
          )}
        />
      </button>
      {(label || description) && (
        <div className="grid gap-1 leading-none">
          {label && (
            <span
              onClick={() => !disabled && onChange(!checked)}
              className="text-sm font-semibold text-zinc-700 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 hover:text-zinc-900 transition-colors"
            >
              {label}
            </span>
          )}
          {description && (
            <p className="text-xs font-medium leading-normal text-zinc-400">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
