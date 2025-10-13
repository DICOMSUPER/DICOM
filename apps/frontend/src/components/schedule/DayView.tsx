"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmployeeSchedule {
  schedule_id: string;
  work_date: string;
  actual_start_time?: string;
  actual_end_time?: string;
  employee: { firstName: string; lastName: string };
  room?: { roomCode: string };
  schedule_status: string;
}

interface DayViewProps {
  selectedDate: Date;
  timeSlots: { time: string; hour: number }[];
  schedules: EmployeeSchedule[];
  getScheduleForTimeSlot: (date: Date, hour: number) => EmployeeSchedule | undefined;
  getStatusColor: (status: string) => string;
}

export function DayView({ selectedDate, timeSlots, schedules, getScheduleForTimeSlot, getStatusColor }: DayViewProps) {
  return (
    <div className="space-y-0">
      {timeSlots.map((slot) => {
        const schedule = getScheduleForTimeSlot(selectedDate, slot.hour);
        return (
          <div key={slot.hour} className="grid grid-cols-12 gap-4 h-20">
            <div className="col-span-2 text-sm font-medium my-auto text-gray-700">{slot.time}</div>
            <div className="col-span-10 h-full flex items-center justify-center border-t border-gray-200">
              {schedule ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm relative w-full m-2 my-auto">
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
                <div className="text-sm text-gray-500 italic m-2 w-full">No schedules</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


