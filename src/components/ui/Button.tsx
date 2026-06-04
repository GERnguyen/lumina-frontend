import React from "react";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  content?: string; // Để optional vì đôi khi chỉ dùng icon hoặc children
  children?: ReactNode;
  // Nên có children để linh hoạt hơn content
}

const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  content,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: "bg-indigo-500 text-white hover:bg-indigo-600",
    secondary: "bg-secondary-500 text-white hover:bg-secondary-600",
    success: "bg-success text-white hover:bg-success/90",
    warning: "bg-warning text-white hover:bg-warning/90",
    danger: "bg-danger text-white hover:bg-danger/90",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
    icon: "p-2",
  };

  return (
    <button
      // Dùng hàm cn để gộp class mặc định, class theo variant/size và class từ props truyền vào
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-colors cursor-pointer focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Hiển thị Icon Loading nếu đang xử lý */}
      {isLoading && (
        <span className="mr-2 animate-spin">
          <LoaderCircle className="size-4" />
        </span>
      )}

      {/* Hiển thị Icon bên trái nếu có và không đang loading */}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}

      {/* Render content hoặc children */}
      {content || children}

      {/* Hiển thị Icon bên phải nếu có */}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
