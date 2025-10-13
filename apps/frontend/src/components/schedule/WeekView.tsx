"use client";

import { format, isSameDay } from "date-fns";

interface EmployeeSchedule {
  schedule_id: string;
  work_date: string;
  actual_start_time?: string;
  actual_end_time?: string;
}

interface WeekViewProps {
  weekDays: Date[];
  timeSlots: { time: string; hour: number }[];
  schedules: EmployeeSchedule[];
  selectedDate: Date;
}

export function WeekView({ weekDays, timeSlots, schedules, selectedDate }: WeekViewProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-4">
          <div className="text-xs md:text-sm font-medium text-gray-700">Time</div>
          {weekDays.map((day, index) => (
            <div key={index} className={`text-center ${isSameDay(day, selectedDate) ? 'bg-blue-50 rounded-lg p-1 md:p-2' : ''}`}>
              <div className="text-xs md:text-sm font-medium text-gray-700">{format(day, "EEE")}</div>
              <div className={`text-xs ${isSameDay(day, selectedDate) ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>{format(day, "MMM d")}</div>
            </div>
          ))}
        </div>
        <div className="space-y-0">
          {timeSlots.map((slot) => (
            <div key={slot.hour} className="grid grid-cols-8 gap-4 items-center h-20">
              <div className="text-xs md:text-sm text-gray-700 font-medium">{slot.time}</div>
              <div className="col-span-7 h-full border-t border-gray-200">
                <div className="grid grid-cols-7 gap-4 h-full">
                  {weekDays.map((day, dayIndex) => {
                    const daySchedules = schedules.filter(s => 
                      s.work_date === format(day, "yyyy-MM-dd") && s.actual_start_time &&
                      parseInt(s.actual_start_time.split(":")[0]) === slot.hour
                    );
                    return (
                      <div key={dayIndex} className={`h-full flex items-center ${isSameDay(day, selectedDate) ? 'bg-blue-50 rounded' : ''}`}>
                        {daySchedules.map((schedule) => (
                          <div key={schedule.schedule_id} className="bg-blue-50 border border-blue-200 rounded p-2 text-xs relative w-full m-1">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l"></div>
                            <div className="ml-2">
                              <div className="font-medium text-gray-900 truncate">{schedule.schedule_id}</div>
                              <div className="text-gray-600 text-xs">{schedule.actual_start_time} - {schedule.actual_end_time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


