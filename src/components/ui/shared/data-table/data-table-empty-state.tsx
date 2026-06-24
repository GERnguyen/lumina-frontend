import type { LucideIcon } from "lucide-react";

interface DataTableEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export function DataTableEmptyState({ icon: Icon, title, description }: DataTableEmptyStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
      {Icon ? <Icon className="mb-3 size-12 text-gray-300 stroke-1.5" /> : null}
      <div className="max-w-md space-y-1">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {description ? <p className="text-xs leading-relaxed text-gray-500">{description}</p> : null}
      </div>
    </div>
  );
}
