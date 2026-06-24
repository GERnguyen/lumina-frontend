import { cn } from "@/lib/utils";

interface DataTableToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableToolbar({ children, className }: DataTableToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 border-b border-gray-100 bg-white p-4 sm:p-5", className)}>
      {children}
    </div>
  );
}
