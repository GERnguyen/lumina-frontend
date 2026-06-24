import React from "react";
import { cn } from "@/lib/utils";

interface InstructorCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
}

export function InstructorCard({
  title,
  subtitle,
  headerAction,
  footer,
  children,
  className = "",
  bodyClassName = "",
  headerClassName = "",
  footerClassName = "",
}: InstructorCardProps) {
  const hasHeader = title || subtitle || headerAction;

  return (
    <div
      className={cn(
        "flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200/70 bg-white shadow-sm transition-all duration-300 hover:shadow-md/5",
        className
      )}
    >
      {/* Header */}
      {hasHeader && (
        <div
          className={cn(
            "flex items-center justify-between gap-4 border-b border-zinc-100 px-6 py-4.5",
            headerClassName
          )}
        >
          <div>
            {title && (
              <h3 className="text-base font-bold tracking-tight text-zinc-900 sm:text-lg">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-xs font-medium text-zinc-400">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      {/* Body */}
      <div className={cn("flex-1 p-6", bodyClassName)}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div
          className={cn(
            "flex items-center justify-between border-t border-zinc-100 px-6 py-4 text-xs font-semibold text-zinc-500",
            footerClassName
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
