import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white shadow-xs hover:bg-primary-700",
        primary: "bg-primary-600 text-white shadow-xs hover:bg-primary-700",
        secondary: "bg-primary-50 text-primary-700 hover:bg-primary-100",
        outline: "border border-gray-200 bg-white text-gray-700 shadow-xs hover:bg-gray-50",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        destructive: "border border-red-100 bg-red-50 text-red-600 hover:bg-red-100",
      },
      size: {
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-11 rounded-lg px-5 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "content">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  content?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, disabled, children, content, ...props }, ref) => {
    const contentToRender = children || content;

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          aria-disabled={disabled || loading || undefined}
          {...props}
        >
          {contentToRender}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="size-4 shrink-0 animate-spin" /> : null}
        {contentToRender}
      </button>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
