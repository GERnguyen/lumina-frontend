import { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/utils";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  // Nên có children để linh hoạt hơn content
}

const InputCheckBox = ({
  label,
  errorMessage,
  className,
  id,
  ...props
}: CheckboxProps) => {
  const checkboxId = id || `checkbox-${label}`; // Đảm bảo có ID để click vào label là ăn vào input

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label 
        htmlFor={checkboxId}
        className="group flex items-start gap-3 cursor-pointer w-fit"
      >
        <div className="relative flex items-center h-5"> {/* h-5 khớp với w-5 của input để căn giữa dọc */}
          <input
            id={checkboxId}
            type="checkbox"
            className="
              peer
              w-5 h-5
              appearance-none
              bg-white
              border-2 border-gray-300
              rounded-md
              translate-y-[1.5px]
              checked:bg-primary-500
              checked:border-primary-500
              transition-all duration-200
              cursor-pointer
              focus:ring-2 focus:ring-primary-100
              disabled:bg-gray-100 disabled:border-gray-200
            "
            {...props}
          />
          
          {/* Dấu tích SVG: Chỉ hiện khi input được checked nhờ peer-checked:opacity-100 */}
          <svg
            className="
              absolute 
              left-1/2 top-1/2 
              top-[calc(50%+1.5px)]
              -translate-x-1/2 -translate-y-1/2
              w-3.5 h-3.5 
              text-white 
              pointer-events-none 
              opacity-0 
              peer-checked:opacity-100 
              transition-opacity duration-200
            "
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        {/* Label text: Dùng text-gray-700 từ bảng màu của em cho rõ nét */}
        {label && (
          <span className={cn(
            "text-sm font-medium select-none pt-0.5", // pt-0.5 giúp text ngang hàng hoàn hảo với box
            errorMessage ? "text-danger-500" : "text-gray-700"
          )}>
            {label}
          </span>
        )}
      </label>

      {errorMessage && (
        <p className="text-xs font-medium text-danger-500 ml-8">{errorMessage}</p>
      )}
    </div>
  );
};
export default InputCheckBox;