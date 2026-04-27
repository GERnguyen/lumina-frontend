import React, { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

const Input = ({ label, error, leftIcon, className, id, ...props }: InputProps) => {
  return (
    <div className="w-full space-y-1.5">
      {/* Label dùng font-general cho sang */}
      {label && (
        <label htmlFor={id} className="block text-sm font-general font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Render Icon nếu có (dùng cho icon Email/Lock) */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          id={id}
          className={cn(
            "w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition-all outline-none",
            "font-sans text-gray-900 placeholder:text-gray-400",
            // Trạng thái bình thường
            "border-gray-200 focus:border-primary-500",
            // Trạng thái khi có lỗi (màu danger từ Figma)
            error && "border-danger-500 focus:border-danger-500 focus:ring-danger-100",
            // Có icon thì padding bên trái rộng ra
            leftIcon && "pl-10",
            className
          )}
          {...props}
        />
      </div>

      {/* Hiển thị câu thông báo lỗi */}
      {error && (
        <p className="text-xs font-medium text-danger-500 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;