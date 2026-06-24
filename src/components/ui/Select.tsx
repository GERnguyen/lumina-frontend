"use client";

import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: Array<string | SelectOption>;
  label?: string;
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onValueChange?: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  placeholder?: string;
}

const Select = ({
  options,
  label,
  id,
  value,
  onChange,
  onValueChange,
  className,
  triggerClassName,
  placeholder,
}: SelectProps) => {
  const [open, setOpen] = useState(false);

  // Normalize options to object format
  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  // Determine active displayed text
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const selectedOptionLabel = selectedOption
    ? selectedOption.label
    : placeholder || label || "Chọn...";

  const handleSelect = (val: string) => {
    setOpen(false);

    if (onValueChange) {
      onValueChange(val);
    }

    if (onChange) {
      // Mock standard HTML ChangeEvent for backwards compatibility
      const mockEvent = {
        target: {
          value: val,
          name: id || "",
        },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(mockEvent);
    }
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label ? (
        <label
          onClick={() => setOpen(true)}
          className="block text-xs font-bold uppercase tracking-wider text-zinc-450 cursor-pointer select-none"
        >
          {label}
        </label>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-800 shadow-2xs transition-all hover:bg-zinc-50/50 hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 cursor-pointer text-left select-none",
              open && "border-primary-500 ring-2 ring-primary-500/10 shadow-xs",
              triggerClassName
            )}
          >
            <span className="truncate">{selectedOptionLabel}</span>
            <ChevronDown
              className="size-4 shrink-0 text-zinc-400 transition-transform duration-200"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[200px] bg-white border border-zinc-150 p-1.5 shadow-lg rounded-xl animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
            {normalizedOptions.map((option, idx) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value || idx}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-xs font-semibold transition-all cursor-pointer text-left select-none",
                    isSelected
                      ? "bg-primary-600 text-white shadow-xs"
                      : "text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="size-3.5 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Select;
