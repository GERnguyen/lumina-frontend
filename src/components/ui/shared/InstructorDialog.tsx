import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstructorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function InstructorDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: InstructorDialogProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Content wrapper */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-lg border border-gray-200 bg-white p-5 shadow-2xl transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 sm:p-6",
          className
        )}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-gray-500 font-medium leading-relaxed">{description}</p>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>,
    document.body
  );
}
