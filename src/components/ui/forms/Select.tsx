import { cn } from "@/lib/utils";
import React from "react";

interface SelectProps {
  options: Array<string | { label: string; value: string }>;
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

const Select = ({
  options,
  label,
  id,
  value,
  onChange,
  className,
}: SelectProps) => {
  return (
    <div className={cn("max-w-3xl w-full space-y-3", className)}>
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="py-3 px-4 pe-9 block w-full bg-layer border-layer-line border-gray-200 rounded-lg text-sm text-foreground focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none"
      >
        <option value="" disabled defaultValue="">
          {label}
        </option>
        {options.map((opt) => {
          const option =
            typeof opt === "string" ? { label: opt, value: opt } : opt;

          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Select;
