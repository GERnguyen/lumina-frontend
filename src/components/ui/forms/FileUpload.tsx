import { cn } from "@/lib/utils";
import React, { InputHTMLAttributes } from "react";

interface FileUploadProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id?: string;
  className?: string;
  buttonText?: string;
  helperText?: React.ReactNode;
  contentType: "document" | "image" | "video";
}

const FileUpload = ({
  label,
  id,
  className,
  buttonText = "Upload file",
  helperText,
  contentType,
  ...props
}: FileUploadProps) => {
  const guides = () => {
    switch (contentType) {
      case "document":
        return ["Upload your CV here.", "Supported format: .pdf"];
      case "image":
        return [
          "Upload your image here.",
          "Supported format: .jpg, .jpeg, .png",
        ];
      case "video":
        return ["Upload your video here.", "Supported format: .mp4"];
    }
  };

  return (
    <div className={cn("flex flex-col gap-4 items-start w-full", className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <div className="flex flex-col sm:flex-row gap-6 items-start w-full">
        <div className="bg-gray-50 flex items-center justify-center p-8 shrink-0 w-full sm:w-auto sm:min-w-[200px] sm:h-[180px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-300"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>

        <div className="flex flex-col gap-5 items-start w-full">
          <p className="text-sm text-muted-foreground-1 leading-relaxed max-w-[344px]">
            {helperText || (
              <>
                {guides()[0]}{" "}
                <span className="font-medium text-foreground">
                  {guides()[1]}
                </span>
              </>
            )}
          </p>

          {/* Upload Button */}
          <div className="relative">
            <input
              type="file"
              id={id}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              {...props}
            />
            <div className="bg-primary-100 text-primary-500 hover:bg-primary-200 transition-colors flex gap-3 items-center justify-center px-6 py-3 relative z-0">
              <span className="font-semibold text-base whitespace-nowrap">
                {buttonText}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
