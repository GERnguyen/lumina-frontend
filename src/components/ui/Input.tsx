import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./Label";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-2">
        {label ? <Label htmlFor={inputId}>{label}</Label> : null}
        <div className="relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-gray-400">
              {leftIcon}
            </span>
          ) : null}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            {...props}
          />
          {rightIcon ? (
            <span className="absolute right-3 top-1/2 flex -translate-y-1/2 text-gray-400">
              {rightIcon}
            </span>
          ) : null}
        </div>
        {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
        {!error && helperText ? <p className="text-xs text-gray-500">{helperText}</p> : null}
      </div>
    );
  }
);
Input.displayName = "Input";
