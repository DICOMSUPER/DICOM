"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomSchedule } from "@/interfaces/schedule/schedule.interface";

interface DayViewProps {
  selectedDate: Date;
  timeSlots: { time: string; hour: number }[];
  schedules: RoomSchedule[];
  getScheduleForTimeSlot: (date: Date, hour: number) => RoomSchedule | undefined;
  getStatusColor: (status: string) => string;
  isLoading?: boolean;
  onScheduleClick?: (schedule: RoomSchedule) => void;
}

export function DayView({ selectedDate, timeSlots, schedules, getScheduleForTimeSlot, getStatusColor, isLoading = false, onScheduleClick }: DayViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-0">
        {timeSlots.map((slot) => (
          <div key={slot.hour} className="grid grid-cols-12 gap-4 h-20">
            <div className="col-span-2 text-sm font-medium my-auto text-gray-700">{slot.time}</div>
            <div className="col-span-10 h-full flex items-center justify-center border-t border-gray-200">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm relative w-full m-2 my-auto">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300 rounded-l-lg"></div>
                <div className="ml-2 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <div className="flex items-center space-x-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {timeSlots.map((slot) => {
        const schedule = getScheduleForTimeSlot(selectedDate, slot.hour);
        return (
          <div key={slot.hour} className="grid grid-cols-12 gap-4 h-20">
            <div className="col-span-2 text-sm font-medium my-auto text-gray-700">{slot.time}</div>
            <div className="col-span-10 h-full flex items-center justify-center border-t border-gray-200">
              {schedule ? (
                <div 
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm relative w-full m-2 my-auto cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => onScheduleClick?.(schedule)}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                  <div className="ml-2 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-base">
                        {schedule.employee.firstName} {schedule.employee.lastName}
                      </h4>
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>{schedule.actual_start_time} - {schedule.actual_end_time}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">{schedule.room?.roomCode || 'Consultation'}</span>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(schedule.schedule_status)} border border-blue-400 text-xs ml-auto`}>
                      {schedule.schedule_status.charAt(0).toUpperCase() + schedule.schedule_status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-center text-gray-500 italic m-2 w-full">No schedules</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


