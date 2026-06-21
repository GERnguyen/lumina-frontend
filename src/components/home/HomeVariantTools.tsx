"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { DailyGoalResponse } from "@/types";
import { cn } from "@/lib/utils";
import { setDailyGoalAction, editDailyGoalAction, getDailyGoalsInMonthAction, getIncompleteEnrolledLessonsAction } from "@/services/actions/learning";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type GoalType = NonNullable<DailyGoalResponse["goalType"]>;

function goalLabel(type?: DailyGoalResponse["goalType"]) {
  const labels: Record<NonNullable<DailyGoalResponse["goalType"]>, string> = {
    XP: "Earn XP",
    LEARNING_ITEMS_COMPLETED: "Complete learning items",
    VIDEOS_COMPLETED: "Finish videos",
    QUIZZES_PASSED: "Pass quizzes",
    ASSIGNMENTS_SUBMITTED: "Submit assignments",
    SPECIFIC_LESSON_COMPLETED: "Complete a specific lesson",
  };

  return type ? labels[type] : "Learning goal";
}

export function GoalCalendar({ goals }: { goals: DailyGoalResponse[] }) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [visibleGoals, setVisibleGoals] = useState<DailyGoalResponse[]>(goals);
  const [loadedMonthKey, setLoadedMonthKey] = useState(`${today.getFullYear()}-${today.getMonth() + 1}`);
  const selectedMonthKey = `${year}-${month}`;
  const isLoading = loadedMonthKey !== selectedMonthKey;
  const yearOptions = Array.from({ length: 5 }, (_, index) => today.getFullYear() - 2 + index);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOffset = new Date(year, month - 1, 1).getDay();
  const goalByDay = new Set(visibleGoals.filter((goal) => goal.goalDate).map((goal) => Number(goal.goalDate?.slice(-2))));
  const completedByDay = new Set(visibleGoals.filter((goal) => goal.isCompleted && goal.goalDate).map((goal) => Number(goal.goalDate?.slice(-2))));
  const selectedDate = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  const selectedGoal = visibleGoals.find((goal) => goal.goalDate === selectedDate);

  useEffect(() => {
    let active = true;

    getDailyGoalsInMonthAction(year, month)
      .then((res: any) => {
        if (!active) return;
        if (res.success) {
          setVisibleGoals(res.data || []);
        } else {
          setVisibleGoals([]);
        }
        setLoadedMonthKey(`${year}-${month}`);
      });

    return () => {
      active = false;
    };
  }, [month, year]);

  function handleSaved(goal: DailyGoalResponse) {
    setVisibleGoals((current) => {
      const exists = current.some((item) => item.goalDate === goal.goalDate && item.goalType === goal.goalType);
      if (exists) {
        return current.map((item) => (item.goalDate === goal.goalDate && item.goalType === goal.goalType ? goal : item));
      }
      return [...current, goal];
    });
  }

  function handleMonthChange(nextMonth: number) {
    setMonth(nextMonth);
    setSelectedDay((current) => Math.min(current, new Date(year, nextMonth, 0).getDate()));
  }

  function handleYearChange(nextYear: number) {
    setYear(nextYear);
    setSelectedDay((current) => Math.min(current, new Date(nextYear, month, 0).getDate()));
  }

  return (
    <div className="rounded-[18px] border border-[#E9EAF0] bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#1D2026]">Learning calendar</h3>
          <p className="mt-1 text-xs text-[#6E7485]">Goal days connect into streaks when they sit next to each other.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(event) => handleMonthChange(Number(event.target.value))}
            className="h-10 rounded-[12px] border-[#E9EAF0] text-sm focus:border-[#7872FD] focus:ring-[#7872FD]"
            aria-label="Select month"
          >
            {months.map((item, index) => (
              <option key={item} value={index + 1}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(event) => handleYearChange(Number(event.target.value))}
            className="h-10 rounded-[12px] border-[#E9EAF0] text-sm focus:border-[#7872FD] focus:ring-[#7872FD]"
            aria-label="Select year"
          >
            {yearOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-y-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day} className="text-center text-[11px] font-semibold uppercase text-[#8C94A3]">
            {day}
          </span>
        ))}
        {Array.from({ length: firstDayOffset }).map((_, index) => (
          <span key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const hasGoal = goalByDay.has(day);
          const hasPreviousGoal = goalByDay.has(day - 1);
          const hasNextGoal = goalByDay.has(day + 1);
          const isCompleted = completedByDay.has(day);
          const isSelected = day === selectedDay;
          const isToday = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
          return (
            <button
              type="button"
              key={day}
              onClick={() => setSelectedDay(day)}
              className="relative grid aspect-square min-h-10 place-items-center rounded-[12px]"
              aria-label={`Select ${months[month - 1]} ${day}, ${year}`}
            >
              {hasGoal && hasPreviousGoal ? <span className="absolute left-0 top-1/2 h-2 w-1/2 -translate-y-1/2 bg-[#D8D6FF]" /> : null}
              {hasGoal && hasNextGoal ? <span className="absolute right-0 top-1/2 h-2 w-1/2 -translate-y-1/2 bg-[#D8D6FF]" /> : null}
              <span
                className={cn(
                  "relative z-10 grid size-9 place-items-center rounded-full text-xs font-semibold transition",
                  isCompleted && "bg-[#23BD33] text-white shadow-[0_8px_18px_rgba(35,189,51,0.22)]",
                  hasGoal && !isCompleted && "bg-[#7872FD] text-white shadow-[0_8px_18px_rgba(120,114,253,0.24)]",
                  !hasGoal && "bg-[#F5F7FA] text-[#8C94A3]",
                  isToday && "ring-2 ring-[#1D2026] ring-offset-2",
                  isSelected && "outline outline-2 outline-offset-4 outline-[#7872FD]",
                )}
              >
                {day}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-[#6E7485]">
        <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-[#7872FD]" /> Goal set</span>
        <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-[#23BD33]" /> Completed</span>
        <span className="flex items-center gap-2"><span className="size-5 rounded-full border-2 border-[#1D2026]" /> Today</span>
        {isLoading ? <span className="text-[#7872FD]">Loading goals...</span> : null}
      </div>

      <CalendarGoalForm key={`${selectedDate}-${selectedGoal?.id || "new"}`} date={selectedDate} existingGoal={selectedGoal} onSaved={handleSaved} />
    </div>
  );
}

function CalendarGoalForm({
  date,
  existingGoal,
  onSaved,
}: {
  date: string;
  existingGoal?: DailyGoalResponse;
  onSaved: (goal: DailyGoalResponse) => void;
}) {
  const [goalType, setGoalType] = useState<GoalType>((existingGoal?.goalType as GoalType) || "XP");
  const [targetValue, setTargetValue] = useState(String(existingGoal?.targetValue || 30));
  const [targetItemId, setTargetItemId] = useState(existingGoal?.targetItemId || "");
  const [lessonOptions, setLessonOptions] = useState<Array<{ id: string; title: string; lessons: Array<{ id: string; title: string; type: string; sectionTitle: string }> }>>([]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (goalType !== "SPECIFIC_LESSON_COMPLETED") return;
    getIncompleteEnrolledLessonsAction().then((res) => {
      if (res.success && res.data) {
        setLessonOptions(res.data);
        if (!targetItemId) setTargetItemId(res.data[0]?.lessons[0]?.id || "");
      }
    });
  }, [goalType, targetItemId]);

  function submitGoal() {
    setMessage("");
    startTransition(async () => {
      const payload = {
        goalType,
        targetValue: goalType === "SPECIFIC_LESSON_COMPLETED" ? 1 : Number(targetValue),
        goalDate: date,
        targetItemId: goalType === "SPECIFIC_LESSON_COMPLETED" ? targetItemId : undefined,
      };

      const res = existingGoal
        ? await editDailyGoalAction(payload)
        : await setDailyGoalAction(payload);

      if (!res.success || !res.data) {
        setMessage(res.error || "Could not save this goal. Please try again.");
        return;
      }

      onSaved(res.data);
      setMessage("Goal saved.");
    });
  }

  return (
    <div className="mt-5 border-t border-[#E9EAF0] pt-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-[#1D2026]">{existingGoal ? "Update goal" : "Set goal"}</h4>
          <p className="mt-1 text-xs text-[#6E7485]">{date}</p>
        </div>
        {existingGoal?.isCompleted ? <CheckCircle2 className="size-5 text-[#23BD33]" /> : null}
      </div>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-2 text-sm font-medium text-[#4E5566]">
          Goal type
          <select
            value={goalType}
            onChange={(event) => setGoalType(event.target.value as GoalType)}
            className="h-11 rounded-[12px] border-[#E9EAF0] text-sm focus:border-[#7872FD] focus:ring-[#7872FD]"
          >
            {(["XP", "LEARNING_ITEMS_COMPLETED", "VIDEOS_COMPLETED", "QUIZZES_PASSED", "ASSIGNMENTS_SUBMITTED", "SPECIFIC_LESSON_COMPLETED"] as const).map((type) => (
              <option key={type} value={type}>
                {goalLabel(type)}
              </option>
            ))}
          </select>
        </label>
        {goalType === "SPECIFIC_LESSON_COMPLETED" ? (
          <label className="grid gap-2 text-sm font-medium text-[#4E5566]">
            Lesson
            <select
              value={targetItemId}
              onChange={(event) => setTargetItemId(event.target.value)}
              className="h-11 rounded-[12px] border-[#E9EAF0] text-sm focus:border-[#7872FD] focus:ring-[#7872FD]"
            >
              {lessonOptions.flatMap((course) =>
                course.lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {course.title} - {lesson.title}
                  </option>
                )),
              )}
            </select>
          </label>
        ) : (
          <label className="grid gap-2 text-sm font-medium text-[#4E5566]">
            Target
            <input
              type="number"
              min="1"
              value={targetValue}
              onChange={(event) => setTargetValue(event.target.value)}
              className="h-11 rounded-[12px] border-[#E9EAF0] text-sm focus:border-[#7872FD] focus:ring-[#7872FD]"
            />
          </label>
        )}
      </div>
      <button
        type="button"
        onClick={submitGoal}
        disabled={isPending || (goalType === "SPECIFIC_LESSON_COMPLETED" ? !targetItemId : Number(targetValue) < 1)}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#7872FD] text-sm font-semibold text-white transition hover:bg-[#5F58F0] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {existingGoal ? "Update goal" : "Set goal"}
      </button>
      {message ? <p className="mt-3 text-sm text-[#6E7485]">{message}</p> : null}
    </div>
  );
}
