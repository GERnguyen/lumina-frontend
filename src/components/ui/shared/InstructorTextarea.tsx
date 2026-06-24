import React, { TextareaHTMLAttributes } from "react";
import { Textarea } from "../Textarea";

interface InstructorTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function InstructorTextarea({
  label,
  error,
  className,
  id,
  rows = 4,
  ...props
}: InstructorTextareaProps) {
  return (
    <Textarea id={id} rows={rows} label={label} error={error} className={className} {...props} />
  );
}
