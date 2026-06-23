import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./Label";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full space-y-2">
        {label ? <Label htmlFor={textareaId}>{label}</Label> : null}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            "flex min-h-24 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
        {!error && helperText ? <p className="text-xs text-gray-500">{helperText}</p> : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
