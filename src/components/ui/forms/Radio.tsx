import React from "react";
import { cn } from "@/lib/utils";

interface RadioProps {
  label?: string;
  name: string;
  value: string | number;
  checked: boolean;
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Radio = ({ label, name, value, checked, onChange, id }: RadioProps) => {
  return (
    <div className={cn("w-full", checked && "border-primary-500")}>
      <label
        htmlFor={id}
        className="flex items-center p-3 w-full bg-layer border border-gray-200 rounded-lg text-sm focus:border-primary-focus focus:ring-primary-focus cursor-pointer"
      >
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="shrink-0 size-4 bg-transparent border-line-3 rounded-full shadow-2xs text-primary focus:ring-0 focus:ring-offset-0 checked:bg-primary-500 checked:border-primary-500 disabled:opacity-50 disabled:pointer-events-none"
          id={id}
        />
        <span
          className={cn(
            "text-sm ms-3 text-muted-foreground-1",
            checked && "text-foreground font-semibold",
          )}
        >
          {label}
        </span>
      </label>
    </div>
  );
};

export default Radio;
