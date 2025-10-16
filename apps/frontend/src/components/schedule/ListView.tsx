"use client";

import { Clock, User, CalendarOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeSchedule } from "@/interfaces/schedule/schedule.interface";

interface ListViewProps {
  schedules: EmployeeSchedule[];
  getStatusColor: (status: string) => string;
  isLoading?: boolean;
  onScheduleClick?: (schedule: EmployeeSchedule) => void;
}

export function ListView({ schedules, getStatusColor, isLoading = false, onScheduleClick }: ListViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 lg:p-4 shadow-sm relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300 rounded-l-lg"></div>
            <div className="ml-2 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <div className="flex items-center space-x-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <Skeleton className="w-6 h-6 md:w-8 md:h-8 rounded-full" />
                <Skeleton className="h-3 w-24 hidden md:block" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <CalendarOff className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schedules Found</h3>
        <p className="text-sm text-gray-600 text-center max-w-md">
          There are no schedules available for the selected date. Check back later or select a different date.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule) => (
        <div 
          key={schedule.schedule_id} 
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 shadow-sm relative cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => onScheduleClick?.(schedule)}
        >
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


