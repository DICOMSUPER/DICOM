"use client";

import { format, isSameDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomSchedule } from "@/interfaces/schedule/schedule.interface";

interface WeekViewProps {
  weekDays: Date[];
  timeSlots: { time: string; hour: number }[];
  schedules: RoomSchedule[];
  selectedDate: Date;
  isLoading?: boolean;
  onScheduleClick?: (schedule: RoomSchedule) => void;
}

export function WeekView({ weekDays, timeSlots, schedules, selectedDate, isLoading = false, onScheduleClick }: WeekViewProps) {
  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header */}
          <div className="grid grid-cols-8 gap-0 border-b border-gray-200">
            <div className="text-xs md:text-sm font-medium text-gray-700 p-3 border-r border-gray-200">Time</div>
            {weekDays.map((day, index) => (
              <div key={index} className={`text-center p-3 border-r border-gray-200 last:border-r-0 ${isSameDay(day, selectedDate) ? 'bg-blue-50' : ''}`}>
                <div className="text-xs md:text-sm font-medium text-gray-700">{format(day, "EEE")}</div>
                <div className={`text-xs ${isSameDay(day, selectedDate) ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>{format(day, "MMM d")}</div>
              </div>
            ))}
          </div>
          
          {/* Skeleton Time slots */}
          <div className="space-y-0">
            {timeSlots.map((slot) => (
              <div key={slot.hour} className="grid grid-cols-8 gap-0 h-24 border-b border-gray-100">
                <div className="text-xs md:text-sm text-gray-700 font-medium p-3 border-r border-gray-200 flex items-center">{slot.time}</div>
                <div className="col-span-7 h-full">
                  <div className="grid grid-cols-7 h-full">
                    {weekDays.map((day, dayIndex) => (
                      <div 
                        key={dayIndex} 
                        className={`h-full p-2 border-r border-gray-100 last:border-r-0 ${isSameDay(day, selectedDate) ? 'bg-blue-50' : ''}`}
                      >
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs relative w-full">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300 rounded-l-lg"></div>
                          <div className="ml-2">
                            <Skeleton className="h-3 w-16 mb-1" />
                            <Skeleton className="h-2 w-12" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Header */}
        <div className="grid grid-cols-8 gap-0 border-b border-gray-200">
          <div className="text-xs md:text-sm font-medium text-gray-700 p-3 border-r border-gray-200">Time</div>
          {weekDays.map((day, index) => (
            <div key={index} className={`text-center p-3 border-r border-gray-200 last:border-r-0 ${isSameDay(day, selectedDate) ? 'bg-blue-50' : ''}`}>
              <div className="text-xs md:text-sm font-medium text-gray-700">{format(day, "EEE")}</div>
              <div className={`text-xs ${isSameDay(day, selectedDate) ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>{format(day, "MMM d")}</div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="space-y-0">
          {timeSlots.map((slot) => (
            <div key={slot.hour} className="grid grid-cols-8 gap-0 h-24 border-b border-gray-100">
              <div className="text-xs md:text-sm text-gray-700 font-medium p-3 border-r border-gray-200 flex items-center">{slot.time}</div>
              <div className="col-span-7 h-full">
                <div className="grid grid-cols-7 h-full">
                  {weekDays.map((day, dayIndex) => {
                    const daySchedules = schedules.filter(s => 
                      s.work_date === format(day, "yyyy-MM-dd") && s.actual_start_time &&
                      parseInt(s.actual_start_time.split(":")[0]) === slot.hour
                    );
                    return (
                      <div 
                        key={dayIndex} 
                        className={`h-full p-2 border-r border-gray-100 last:border-r-0 ${isSameDay(day, selectedDate) ? 'bg-blue-50' : ''}`}
                      >
                        {daySchedules.map((schedule) => (
                          <div 
                            key={schedule.schedule_id} 
                            className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs relative w-full cursor-pointer hover:bg-blue-100 transition-colors mb-1"
                            onClick={() => onScheduleClick?.(schedule)}
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                            <div className="ml-2">
                              <div className="font-medium text-gray-900 truncate">
                                {schedule.employee?.firstName} {schedule.employee?.lastName}
                              </div>
                              <div className="text-gray-600 text-xs">{schedule.actual_start_time} - {schedule.actual_end_time}</div>
                            </div>
                          </div>
                        ))}
                        {daySchedules.length === 0 && (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-gray-400 text-xs">-</div>
                          </div>
                        )}
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


