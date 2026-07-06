"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useConfirmStore } from "@/stores/confirm-store";
import { Button } from "../Button";

export function ConfirmModal() {
  const { isOpen, options, onConfirm, onCancel } = useConfirmStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onCancel();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onCancel]);

  if (!mounted || !isOpen || !options) return null;

  const {
    title,
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    type = "info",
  } = options;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertCircle className="size-6 text-red-600" />;
      case "warning":
        return <AlertTriangle className="size-6 text-amber-500" />;
      default:
        return <Info className="size-6 text-primary-600" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case "danger":
        return "bg-red-50 border border-red-100";
      case "warning":
        return "bg-amber-50 border border-amber-100";
      default:
        return "bg-primary-50 border border-primary-100";
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case "danger":
        return "destructive";
      default:
        return "primary";
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onCancel}
      />

      {/* Content Wrapper */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-2xl transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 sm:p-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="size-4" />
        </button>

        {/* Modal Header & Icon */}
        <div className="flex gap-4 items-start pr-6">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${getIconBg()}`}>
            {getIcon()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h2>
            <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed whitespace-pre-line">{message}</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={getConfirmButtonVariant()} size="sm" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
