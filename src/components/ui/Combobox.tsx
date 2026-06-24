"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command } from "cmdk";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Label } from "./Label";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  label,
  placeholder = "Chọn",
  searchPlaceholder = "Tìm kiếm...",
  emptyText = "Không có kết quả.",
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label ? <Label>{label}</Label> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            <span className={cn("truncate", !selected && "text-gray-400")}>
              {selected ? selected.label : placeholder}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command className="overflow-hidden rounded-lg bg-white">
            <Command.Input
              placeholder={searchPlaceholder}
              className="h-10 w-full border-b border-gray-100 px-3 text-sm outline-none placeholder:text-gray-400"
            />
            <Command.List className="max-h-64 overflow-y-auto p-1">
              <Command.Empty className="px-3 py-6 text-center text-sm text-gray-500">{emptyText}</Command.Empty>
              {options.map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange?.(option.value);
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm outline-none aria-selected:bg-primary-50 aria-selected:text-primary-700"
                >
                  <Check className={cn("mr-2 size-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  {option.label}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
