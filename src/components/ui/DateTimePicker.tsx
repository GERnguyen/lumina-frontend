"use client";

import * as React from "react";
import { DatePicker } from "./DatePicker";
import { Input } from "./Input";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export function DateTimePicker({ value, onChange, label, error, disabled }: DateTimePickerProps) {
  const timeValue = value
    ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
    : "";

  function updateDate(nextDate: Date | undefined) {
    if (!nextDate) {
      onChange?.(undefined);
      return;
    }
    const current = value || new Date();
    nextDate.setHours(current.getHours(), current.getMinutes(), 0, 0);
    onChange?.(nextDate);
  }

  function updateTime(nextTime: string) {
    const [hours, minutes] = nextTime.split(":").map(Number);
    const nextDate = value ? new Date(value) : new Date();
    nextDate.setHours(hours || 0, minutes || 0, 0, 0);
    onChange?.(nextDate);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
      <DatePicker value={value} onChange={updateDate} label={label} error={error} disabled={disabled} />
      <Input
        type="time"
        label={label ? "Giờ" : undefined}
        value={timeValue}
        onChange={(event) => updateTime(event.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
