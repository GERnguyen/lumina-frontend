import { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  errorMessage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckedChange?: (checked: boolean) => void;
}

const CheckBox = ({
  label,
  errorMessage,
  className,
  id,
  checked,
  onChange,
  onCheckedChange,
  ...props
}: CheckboxProps) => {
  const checkboxId = id || `checkbox-${label}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <div className="max-w-sm w-full space-y-3">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className={cn(
            "shrink-0 size-4 bg-transparent border-line-3 rounded-sm shadow-2xs text-primary focus:ring-0 focus:ring-offset-0 checked:bg-primary-500 checked:border-primary-500 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
            className,
          )}
          id={checkboxId}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm ms-3 text-muted-foreground-1 cursor-pointer font-medium select-none"
          >
            {label}
          </label>
        )}
      </div>
      {errorMessage && <p className="text-sm text-danger-600">{errorMessage}</p>}
    </div>
  );
};
export default CheckBox;
