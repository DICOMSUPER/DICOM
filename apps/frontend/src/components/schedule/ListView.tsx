"use client";

import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmployeeSchedule {
  schedule_id: string;
  actual_start_time?: string;
  actual_end_time?: string;
  employee: { firstName: string; lastName: string };
  room?: { roomCode: string };
  schedule_status: string;
}

interface ListViewProps {
  schedules: EmployeeSchedule[];
  getStatusColor: (status: string) => string;
}

export function ListView({ schedules, getStatusColor }: ListViewProps) {
  return (
    <div className="space-y-3">
      {schedules.map((schedule) => (
        <div key={schedule.schedule_id} className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 shadow-sm relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
          <div className="ml-2 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm lg:text-base">
                  {schedule.employee.firstName} {schedule.employee.lastName}
                </h4>
                <div className="flex items-center space-x-1 text-xs lg:text-sm text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>{schedule.actual_start_time} - {schedule.actual_end_time}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">{schedule.room?.roomCode || 'Consultation'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
              </div>
              <span className="text-xs md:text-sm text-gray-900 hidden md:block">
                Dr. {schedule.employee.firstName} {schedule.employee.lastName}
              </span>
              <Badge className={`${getStatusColor(schedule.schedule_status)} border border-blue-400 ml-auto`}>
                {schedule.schedule_status.charAt(0).toUpperCase() + schedule.schedule_status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


