"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../Button";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  totalElements,
  itemLabel = "bản ghi",
  onPageChange,
}: DataTablePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-semibold text-gray-500">
        Trang {currentPage} / {totalPages}
        {totalElements !== undefined ? ` (Tổng ${totalElements} ${itemLabel})` : null}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="size-4" />
          Trước
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Sau
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
