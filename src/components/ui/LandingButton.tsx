import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type LandingButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "light";
  size?: "sm" | "md" | "lg";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function LandingButton({
  href,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: LandingButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066FF]",
        {
          "bg-[#0066FF] text-white shadow-[0_18px_45px_rgba(0,102,255,0.28)] hover:bg-[#0057D9]":
            variant === "primary",
          "border border-[#D9E4F7] bg-white text-[#002B6B] hover:border-[#0066FF] hover:text-[#0066FF]":
            variant === "secondary",
          "text-white/86 hover:text-white": variant === "ghost",
          "bg-white text-[#002B6B] shadow-[0_16px_40px_rgba(0,43,107,0.14)] hover:bg-[#F5F9FF]":
            variant === "light",
          "h-10 px-4 text-sm": size === "sm",
          "h-12 px-6 text-sm": size === "md",
          "h-14 px-8 text-base": size === "lg",
        },
        className,
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}
