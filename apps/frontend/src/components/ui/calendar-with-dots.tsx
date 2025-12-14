import { useState, useEffect } from "react";
import { cn } from "@/common/lib/utils";

// Calendar Day Button Component with Dots
export function CalendarDayWithDots({
  day,
  date,
  isToday,
  isSelected,
  activityCount,
  onClick,
  isOutside = false,
}: {
  day: number;
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  activityCount: number;
  onClick?: (date: Date) => void;
  isOutside?: boolean;
}) {
  return (
    <button
      onClick={() => onClick?.(date)}
      className={cn(
        "aspect-square flex flex-col items-center justify-center gap-1 rounded-lg",
        "hover:bg-slate-100 transition-colors relative",
        isToday && !isSelected && "bg-slate-800 text-white hover:bg-slate-700",
        isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
        !isToday && !isSelected && "text-slate-900",
        isOutside && "opacity-50"
      )}
    >
      <span className="text-sm font-medium">{day}</span>
      {activityCount > 0 && (
        <ActivityDots
          count={activityCount}
          isToday={isToday}
          isSelected={isSelected}
        />
      )}
    </button>
  );
}

// Activity Dots Component
export function ActivityDots({
  count,
  isToday,
  isSelected,
}: {
  count: number;
  isToday: boolean;
  isSelected: boolean;
}) {
  const displayCount = Math.min(count, 4);

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: displayCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 h-1 rounded-full",
            isToday || isSelected ? "bg-white" : "bg-blue-500"
          )}
        />
      ))}
    </div>
  );
}

// Calendar Header Component with Dropdown Support
export function CalendarHeader({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onMonthChange,
  onYearChange,
  captionLayout = "buttons",
  fromYear = 1900,
  toYear = 2100,
}: {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMonthChange?: (month: number) => void;
  onYearChange?: (year: number) => void;
  captionLayout?: "buttons" | "dropdown";
  fromYear?: number;
  toYear?: number;
}) {
  const monthNames = [
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

  const monthNamesShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();
  const years = Array.from(
    { length: toYear - fromYear + 1 },
    (_, i) => fromYear + i
  );

  if (captionLayout === "dropdown") {
    return (
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrevMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <select
            value={currentMonthIndex}
            onChange={(e) => onMonthChange?.(parseInt(e.target.value))}
            className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            aria-label="Select month"
          >
            {monthNamesShort.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={currentYear}
            onChange={(e) => onYearChange?.(parseInt(e.target.value))}
            className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            aria-label="Select year"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onNextMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onPrevMonth}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Previous month"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <h2 className="text-lg font-semibold">
        {monthNames[currentMonthIndex]} {currentYear}
      </h2>

      <button
        onClick={onNextMonth}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Next month"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}

// Calendar Grid Component
export function CalendarGrid({
  currentMonth,
  activityData,
  selectedDate,
  onDayClick,
  showOutsideDays = true,
}: {
  currentMonth: Date;
  activityData: Record<string, number>;
  selectedDate?: Date | null;
  onDayClick?: (date: Date) => void;
  showOutsideDays?: boolean;
}) {
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Calculate days from previous month if showOutsideDays is true
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
    const prevMonthDays = showOutsideDays
      ? Array.from({ length: startingDayOfWeek }, (_, i) => ({
          day: prevMonthLastDay - startingDayOfWeek + i + 1,
          month: prevMonth,
          year: prevYear,
          isOutside: true,
        }))
      : [];

    // Calculate days from next month if showOutsideDays is true
    const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;
    const nextMonthDaysCount = totalCells - startingDayOfWeek - daysInMonth;
    const nextMonthDays = showOutsideDays
      ? Array.from({ length: nextMonthDaysCount }, (_, i) => ({
          day: i + 1,
          month: month === 11 ? 0 : month + 1,
          year: month === 11 ? year + 1 : year,
          isOutside: true,
        }))
      : [];

    return {
      daysInMonth,
      startingDayOfWeek,
      year,
      month,
      prevMonthDays,
      nextMonthDays,
    };
  };

  const { daysInMonth, year, month, prevMonthDays, nextMonthDays } =
    getDaysInMonth(currentMonth);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const formatDateKey = (
    day: number,
    monthOverride?: number,
    yearOverride?: number
  ) => {
    const m = monthOverride !== undefined ? monthOverride : month;
    const y = yearOverride !== undefined ? yearOverride : year;
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  };

  const getActivityCount = (
    day: number,
    monthOverride?: number,
    yearOverride?: number
  ) => {
    const dateKey = formatDateKey(day, monthOverride, yearOverride);
    return activityData[dateKey] || 0;
  };

  const isToday = (
    day: number,
    monthOverride?: number,
    yearOverride?: number
  ) => {
    const today = new Date();
    const m = monthOverride !== undefined ? monthOverride : month;
    const y = yearOverride !== undefined ? yearOverride : year;
    return (
      today.getDate() === day &&
      today.getMonth() === m &&
      today.getFullYear() === y
    );
  };

  const isSelected = (
    day: number,
    monthOverride?: number,
    yearOverride?: number
  ) => {
    if (!selectedDate) return false;
    const m = monthOverride !== undefined ? monthOverride : month;
    const y = yearOverride !== undefined ? yearOverride : year;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === m &&
      selectedDate.getFullYear() === y
    );
  };

  const getDateForDay = (
    day: number,
    monthOverride?: number,
    yearOverride?: number
  ) => {
    const m = monthOverride !== undefined ? monthOverride : month;
    const y = yearOverride !== undefined ? yearOverride : year;
    return new Date(y, m, day);
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day) => (
        <div
          key={day}
          className="text-center text-sm font-bold text-slate-600 py-2"
        >
          {day}
        </div>
      ))}

      {prevMonthDays.map(({ day, month: m, year: y }, i) => {
        const date = getDateForDay(day, m, y);
        return (
          <CalendarDayWithDots
            key={`prev-${i}`}
            day={day}
            date={date}
            isToday={isToday(day, m, y)}
            isSelected={isSelected(day, m, y)}
            activityCount={getActivityCount(day, m, y)}
            onClick={onDayClick}
            isOutside={true}
          />
        );
      })}

      {days.map((day) => {
        const date = getDateForDay(day);
        return (
          <CalendarDayWithDots
            key={day}
            day={day}
            date={date}
            isToday={isToday(day)}
            isSelected={isSelected(day)}
            activityCount={getActivityCount(day)}
            onClick={onDayClick}
          />
        );
      })}

      {nextMonthDays.map(({ day, month: m, year: y }, i) => {
        const date = getDateForDay(day, m, y);
        return (
          <CalendarDayWithDots
            key={`next-${i}`}
            day={day}
            date={date}
            isToday={isToday(day, m, y)}
            isSelected={isSelected(day, m, y)}
            activityCount={getActivityCount(day, m, y)}
            onClick={onDayClick}
            isOutside={true}
          />
        );
      })}
    </div>
  );
}

// Calendar Legend Component
export function CalendarLegend() {
  return (
    <div className="mt-6 pt-4 border-t border-slate-200">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <div className="flex gap-0.5">
          <div className="w-1 h-1 rounded-full bg-blue-500" />
        </div>
        <span>= Activity indicator (max 4 dots shown)</span>
      </div>
    </div>
  );
}

// Main Calendar with Dots Component
export function CalendarWithDots({
  activityData,
  selectedDate,
  onDayClick,
  defaultMonth,
  className,
  captionLayout = "dropdown",
  showOutsideDays = true,
  fromYear = 1900,
  toYear = 2100,
  onMonthChange,
}: {
  activityData?: Record<string, number>;
  selectedDate?: Date | null;
  onDayClick?: (date: Date) => void;
  defaultMonth?: Date;
  className?: string;
  captionLayout?: "buttons" | "dropdown";
  showOutsideDays?: boolean;
  fromYear?: number;
  toYear?: number;
  onMonthChange?: (month: Date) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // If selectedDate is provided, use its month/year, otherwise use today or defaultMonth
    if (selectedDate) {
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }
    if (defaultMonth) {
      return new Date(defaultMonth.getFullYear(), defaultMonth.getMonth(), 1);
    }
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Update currentMonth when selectedDate changes to a different month
  useEffect(() => {
    if (selectedDate) {
      const selectedMonth = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      );
      setCurrentMonth((prevMonth) => {
        const prevMonthKey = `${prevMonth.getFullYear()}-${prevMonth.getMonth()}`;
        const selectedMonthKey = `${selectedMonth.getFullYear()}-${selectedMonth.getMonth()}`;
        if (prevMonthKey !== selectedMonthKey) {
          return selectedMonth;
        }
        return prevMonth;
      });
    }
  }, [selectedDate]);

  const handlePrevMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const newMonth = new Date(year, month - 1, 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleNextMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const newMonth = new Date(year, month + 1, 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleMonthChange = (month: number) => {
    const year = currentMonth.getFullYear();
    const newMonth = new Date(year, month, 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleYearChange = (year: number) => {
    const month = currentMonth.getMonth();
    const newMonth = new Date(year, month, 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  return (
    <div className={cn("bg-white rounded-lg p-3 w-full", className)}>
      <CalendarHeader
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
        captionLayout={captionLayout}
        fromYear={fromYear}
        toYear={toYear}
      />

      <CalendarGrid
        currentMonth={currentMonth}
        activityData={activityData || {}}
        selectedDate={selectedDate}
        onDayClick={onDayClick}
        showOutsideDays={showOutsideDays}
      />

      <CalendarLegend />
    </div>
  );
}
