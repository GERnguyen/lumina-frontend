"use client";

import React from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore, Toast } from "@/stores/toast-store";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  const getToastStyles = (type: string) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-emerald-50/95 border-emerald-200 text-emerald-900",
          icon: <CheckCircle className="size-5 text-emerald-500 shrink-0" />,
        };
      case "error":
        return {
          bg: "bg-rose-50/95 border-rose-200 text-rose-900",
          icon: <AlertCircle className="size-5 text-rose-500 shrink-0" />,
        };
      case "warning":
        return {
          bg: "bg-amber-50/95 border-amber-200 text-amber-900",
          icon: <AlertTriangle className="size-5 text-amber-500 shrink-0" />,
        };
      case "info":
      default:
        return {
          bg: "bg-blue-50/95 border-blue-200 text-blue-900",
          icon: <Info className="size-5 text-blue-500 shrink-0" />,
        };
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm sm:max-w-md pointer-events-none">
      {toasts.map((toast) => {
        const styles = getToastStyles(toast.type);
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 shadow-lg pointer-events-auto backdrop-blur-xs select-none transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in",
              styles.bg
            )}
            role="alert"
          >
            {styles.icon}
            <div className="flex-1 text-sm min-w-0">
              {toast.title && (
                <p className="font-bold text-gray-900 mb-0.5 leading-normal truncate">
                  {toast.title}
                </p>
              )}
              <p className="font-medium leading-relaxed break-words">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 cursor-pointer rounded-md hover:bg-black/5 shrink-0"
              aria-label="Close notification"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
