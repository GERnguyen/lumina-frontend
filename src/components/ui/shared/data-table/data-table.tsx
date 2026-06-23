"use client";

import {
  flexRender,
  type ColumnDef,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useInstructorDataTable } from "./use-instructor-data-table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  table?: TanStackTable<TData>;
  minWidth?: number;
  className?: string;
  rowClassName?: (row: TData, index: number) => string | undefined;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  table: controlledTable,
  minWidth = 800,
  className,
  rowClassName,
}: DataTableProps<TData, TValue>) {
  const internalTable = useInstructorDataTable({ data, columns });
  const table = controlledTable || internalTable;

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-left" style={{ minWidth }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-gray-100 bg-gray-50/70 text-xs font-bold uppercase tracking-wide text-gray-500"
            >
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-5 py-3.5 align-middle">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-100">
          {table.getRowModel().rows.map((row, index) => (
            <tr
              key={row.id}
              className={cn("group transition-colors hover:bg-gray-50/80", rowClassName?.(row.original, index))}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-5 py-4 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
