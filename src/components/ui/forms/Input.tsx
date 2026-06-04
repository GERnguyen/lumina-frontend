import React, { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = ({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) => {
  return (
    <div className="max-w-3xl w-full space-y-3">
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "py-2.5 sm:py-3 px-4 rounded-lg block w-full bg-layer border border-gray-200 sm:text-sm text-foreground placeholder:text-muted-foreground-1 focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none",
          error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500",
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-danger-600">{error}</p>}
    </div>
  );
};

export default Input;
