"use client";

import * as React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Calendar, CalendarProps } from "./Calendar";
import { Label } from "./Label";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  disabledDays?: CalendarProps["disabled"];
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Chọn ngày",
  error,
  className,
  triggerClassName,
  disabled,
  disabledDays,
}: DatePickerProps) {
  const id = React.useId();

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-semibold text-zinc-800 border-zinc-200 bg-white hover:bg-zinc-50/50 hover:border-zinc-300 focus:ring-primary-500/10 focus:border-primary-500",
              !value && "text-zinc-400",
              error && "border-red-500",
              triggerClassName
            )}
          >
            <CalendarIcon className="size-4 mr-2 shrink-0 text-zinc-450" />
            {value ? format(value, "dd/MM/yyyy", { locale: vi }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <Calendar mode="single" selected={value} onSelect={onChange} disabled={disabledDays} />
        </PopoverContent>
      </Popover>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
