import { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/utils";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  // Nên có children để linh hoạt hơn content
}

const CheckBox = ({
  label,
  errorMessage,
  className,
  id,
  ...props
}: CheckboxProps) => {
  const checkboxId = id || `checkbox-${label}`;

  return (
    <div className="max-w-sm w-full space-y-3">
      <div className="flex items-center">
        <input
          type="checkbox"
          className={cn(
            "shrink-0 size-4 bg-transparent border-line-3 rounded-sm shadow-2xs text-primary focus:ring-0 focus:ring-offset-0 checked:bg-primary-500 checked:border-primary-500 disabled:opacity-50 disabled:pointer-events-none",
            className,
          )}
          id={checkboxId}
          {...props}
        />
        <label
          htmlFor={checkboxId}
          className="text-sm ms-3 text-muted-foreground-1"
        >
          {label}
        </label>
      </div>
      {errorMessage && <p className="text-sm text-danger-600">{errorMessage}</p>}
    </div>
  );
};
export default CheckBox;
