"use client";

import { format, isSameDay } from "date-fns";

interface EmployeeSchedule { schedule_id: string; work_date: string; }

interface MonthViewProps {
  calendarDays: Date[];
  schedules: EmployeeSchedule[];
  selectedDate: Date;
}

export function MonthView({ calendarDays, schedules, selectedDate }: MonthViewProps) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="p-1 md:p-2 text-center text-xs md:text-sm font-medium text-gray-700 bg-gray-50">{day}</div>
      ))}
      {calendarDays.map((day, index) => {
        const daySchedules = schedules.filter(s => s.work_date === format(day, "yyyy-MM-dd"));
        const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
        const isToday = isSameDay(day, new Date());
        return (
          <div key={index} className={`min-h-[60px] md:min-h-[100px] p-1 md:p-2 border border-gray-200 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}>
            <div className={`text-xs md:text-sm font-medium ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${isToday ? 'text-blue-600' : ''}`}>{format(day, 'd')}</div>
            <div className="mt-1 space-y-1">
              {daySchedules.slice(0, 2).map((schedule) => (
                <div key={schedule.schedule_id} className="text-xs bg-blue-50 text-gray-900 rounded px-1 py-0.5 truncate relative border border-blue-200">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-l"></div>
                  <span className="ml-1">{schedule.schedule_id}</span>
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


