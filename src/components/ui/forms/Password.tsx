"use client";

import React, { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordProps extends InputHTMLAttributes<HTMLInputElement> {
  purpose: "login" | "register";
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secondValue?: string;
  secondOnChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Password = ({
  error,
  className,
  id,
  purpose,
  secondValue,
  secondOnChange,
  ...props
}: PasswordProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const inputId = id || "password";
  const confirmInputId = `${inputId}-confirm`;
  const inputType = isVisible ? "text" : "password";

  return (
    <div className={cn("space-y-5", className)}>
      <div className="max-w-3xl w-full">
        <label htmlFor={inputId} className="block mb-2 text-sm text-foreground">
          Password
        </label>
        <div className="relative">
          <input
            id={inputId}
            type={inputType}
            className="py-2.5 sm:py-3 ps-4 pe-10 block w-full bg-layer border border-gray-200 rounded-lg sm:text-sm text-foreground placeholder:text-muted-foreground-1 focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none"
            placeholder="Enter your password"
            {...props}
          />
          <button
            type="button"
            aria-label={isVisible ? "Hide password" : "Show password"}
            onClick={() => setIsVisible((current) => !current)}
            className="absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-muted-foreground rounded-e-md focus:outline-hidden focus:text-primary-focus"
          >
            {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
      </div>

      {purpose === "register" && (
        <div className="max-w-3xl">
          <label
            htmlFor={confirmInputId}
            className="block mb-2 text-sm text-foreground"
          >
            Confirm your password
          </label>
          <div className="relative">
            <input
              id={confirmInputId}
              name={`${props.name || inputId}Confirmation`}
              type={inputType}
              className="py-2.5 sm:py-3 ps-4 pe-10 block w-full bg-layer border border-gray-200 rounded-lg sm:text-sm text-foreground placeholder:text-muted-foreground-1 focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none"
              value={secondValue}
              onChange={secondOnChange}
              required={props.required}
              autoComplete={props.autoComplete}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              aria-label={isVisible ? "Hide password" : "Show password"}
              onClick={() => setIsVisible((current) => !current)}
              className="absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-muted-foreground rounded-e-md focus:outline-hidden focus:text-primary-focus"
            >
              {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Password;
