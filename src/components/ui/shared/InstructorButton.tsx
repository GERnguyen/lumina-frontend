import React from "react";
import { Button } from "../Button";

interface InstructorButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
}

export function InstructorButton({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  iconPosition = "left",
  className = "",
  disabled,
  children,
  type = "button",
  ...props
}: InstructorButtonProps) {
  const variantMap = {
    primary: "default",
    secondary: "secondary",
    outline: "outline",
    ghost: "ghost",
    danger: "destructive",
  } as const;

  return (
    <Button
      type={type}
      disabled={disabled}
      loading={loading}
      variant={variantMap[variant]}
      size={size}
      className={className}
      {...props}
    >
      {!loading && Icon && iconPosition === "left" && <Icon className="size-4 shrink-0" />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === "right" && <Icon className="size-4 shrink-0" />}
    </Button>
  );
}
