"use client";

import { format, isSameDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeSchedule } from "@/interfaces/schedule/schedule.interface";

interface MonthViewProps {
  calendarDays: Date[];
  schedules: EmployeeSchedule[];
  selectedDate: Date;
  isLoading?: boolean;
  onScheduleClick?: (schedule: EmployeeSchedule) => void;
}

export function MonthView({ calendarDays, schedules, selectedDate, isLoading = false, onScheduleClick }: MonthViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-1 md:p-2 text-center text-xs md:text-sm font-medium text-gray-700 bg-gray-50">{day}</div>
        ))}
        {calendarDays.map((day, index) => {
          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          return (
            <div key={index} className={`min-h-[60px] md:min-h-[100px] p-1 md:p-2 border border-gray-200 ${isSelected ? 'bg-blue-50 border-blue-200' : isCurrentMonth ? 'bg-white' : 'bg-gray-50'}`}>
              <div className={`text-xs md:text-sm font-medium ${isSelected ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>{format(day, 'd')}</div>
              <div className="mt-1 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="p-1 md:p-2 text-center text-xs md:text-sm font-medium text-gray-700 bg-gray-50">{day}</div>
      ))}
      {calendarDays.map((day, index) => {
        const daySchedules = schedules.filter(s => s.work_date === format(day, "yyyy-MM-dd"));
        const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);
        return (
          <div key={index} className={`min-h-[60px] md:min-h-[100px] p-1 md:p-2 border border-gray-200 ${isSelected ? 'bg-blue-50 border-blue-200' : isCurrentMonth ? 'bg-white' : 'bg-gray-50'}`}>
            <div className={`text-xs md:text-sm font-medium ${isSelected ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>{format(day, 'd')}</div>
            <div className="mt-1 space-y-1">
              {daySchedules.slice(0, 2).map((schedule) => (
                <div 
                  key={schedule.schedule_id} 
                  className="text-xs bg-blue-50 text-gray-900 rounded px-1 py-0.5 truncate relative border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => onScheduleClick?.(schedule)}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-l"></div>
                  <span className="ml-1">
                    {schedule.employee?.firstName} {schedule.employee?.lastName}
                  </span>
                </div>
              ))}
              {daySchedules.length > 2 && (
                <div className="text-xs text-gray-500">+{daySchedules.length - 2} more</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


