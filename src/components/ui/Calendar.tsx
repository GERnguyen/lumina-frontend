import * as React from "react";
import { DayFlag, DayPicker, SelectionState, UI } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1 text-sm", className)}
      classNames={{
        [UI.Months]: "flex flex-col gap-4",
        [UI.Month]: "space-y-3",
        [UI.MonthCaption]: "flex justify-center pt-1 relative items-center text-sm font-semibold",
        [UI.Nav]: "flex items-center gap-1",
        [UI.PreviousMonthButton]: "absolute left-1 size-8 rounded-md flex items-center justify-center text-zinc-650 hover:bg-zinc-100/80 transition-colors",
        [UI.NextMonthButton]: "absolute right-1 size-8 rounded-md flex items-center justify-center text-zinc-650 hover:bg-zinc-100/80 transition-colors",
        [UI.MonthGrid]: "w-full border-collapse space-y-1",
        [UI.Weekdays]: "flex",
        [UI.Weekday]: "w-9 rounded-md text-[11px] font-semibold text-gray-400",
        [UI.Week]: "mt-1 flex w-full",
        [UI.Day]: "size-9 rounded-md p-0 text-center text-sm",
        [UI.DayButton]: "size-9 rounded-md hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
        [SelectionState.selected]: "bg-primary-600 text-white hover:bg-primary-600 hover:text-white",
        [DayFlag.today]: "bg-gray-100 text-gray-900",
        [DayFlag.outside]: "text-gray-300",
        [DayFlag.disabled]: "text-gray-300 opacity-50",
        ...classNames,
      }}
      {...props}
    />
  );
}
