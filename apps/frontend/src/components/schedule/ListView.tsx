"use client";

import { Clock, CalendarOff, MapPin, DoorOpen, CalendarClock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomSchedule } from "@/interfaces/schedule/schedule.interface";
import { format } from "date-fns";
import { formatRole } from "@/utils/role-formatter";

interface ListViewProps {
  schedules: RoomSchedule[];
  getStatusColor: (status: string) => string;
  isLoading?: boolean;
  onScheduleClick?: (schedule: RoomSchedule) => void;
}

export function ListView({ schedules, getStatusColor, isLoading = false, onScheduleClick }: ListViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl border border-border p-5 lg:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-16" />
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
      <div className="flex flex-col items-center justify-center py-16 px-4">
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

  // Helper function to get primary employee from room assignments
  const getPrimaryEmployee = (schedule: RoomSchedule) => {
    if (!schedule.employeeRoomAssignments || schedule.employeeRoomAssignments.length === 0) {
      return null;
    }
    // Get the first active assignment with an employee
    const activeAssignment = schedule.employeeRoomAssignments.find(a => a.isActive && a.employee);
    return activeAssignment?.employee || null;
  };

  // Helper function to get all employee names
  const getEmployeeNames = (schedule: RoomSchedule): string => {
    if (!schedule.employeeRoomAssignments || schedule.employeeRoomAssignments.length === 0) {
      return 'Unassigned';
    }
    
    const activeAssignments = schedule.employeeRoomAssignments
      .filter(a => a.isActive && a.employee);
    
    if (activeAssignments.length === 0) {
      return 'Unassigned';
    }
    
    const names = activeAssignments
      .map(a => `${a.employee?.firstName || ''} ${a.employee?.lastName || ''}`.trim())
      .filter(Boolean);
    
    return names.join(', ');
  };

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => {
        const employee = getPrimaryEmployee(schedule);
        const room = schedule.room;
        const shiftTemplate = schedule.shift_template;
        const workDate = schedule.work_date ? format(new Date(schedule.work_date), "EEEE, MMM d, yyyy") : "N/A";

        const assignedCount = schedule.employeeRoomAssignments?.filter(a => a.isActive && a.employee).length || 0;

        return (
          <div 
            key={schedule.schedule_id} 
            className="bg-gray-50 rounded-2xl border border-border p-5 lg:p-6 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                {/* Header with Shift Name */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {shiftTemplate?.shift_name || "Schedule"}
                  </h3>
                  
                  {/* Schedule Details in Rounded Containers */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-border">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {room?.roomCode || schedule.room_id || "Unassigned"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-border">
                      <CalendarClock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {format(new Date(schedule.work_date), "MMM d, yyyy")}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-border">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {schedule.actual_start_time || "--:--"} - {schedule.actual_end_time || "--:--"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assigned Person Section */}
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 rounded-lg border border-border">
                  <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm">
                    {employee?.firstName?.[0] || "U"}{employee?.lastName?.[0] || ""}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm">
                      {getEmployeeNames(schedule)}
                    </h4>
                    {employee && (
                      <p className="text-xs text-gray-600 lowercase">
                        {formatRole(employee?.role)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Badges and Button */}
              <div className="flex flex-col items-end gap-3">
                <Badge 
                  className={`${getStatusColor(schedule.schedule_status)} border-border text-xs font-semibold uppercase`}
                >
                  {schedule.schedule_status.replace(/_/g, ' ')}
                </Badge>
                <Badge className="bg-gray-800 text-white border-border text-xs font-semibold flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{assignedCount} assigned</span>
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-border hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onScheduleClick?.(schedule);
                  }}
                >
                  View details
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


