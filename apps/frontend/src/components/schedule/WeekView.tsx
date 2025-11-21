"use client";

import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomSchedule, ShiftTemplate } from "@/interfaces/schedule/schedule.interface";
import {
  TimelineSegment,
  buildTimelineSegments,
  scheduleFallsInSegment,
} from "@/utils/time-segment-utils";

// Helper function to get employee names from room assignments
const getEmployeeNames = (schedule: RoomSchedule, maxNames: number = 2): string => {
  if (!schedule.employeeRoomAssignments || schedule.employeeRoomAssignments.length === 0) {
    return 'Unassigned';
  }
  
  const activeAssignments = schedule.employeeRoomAssignments
    .filter(a => a.isActive && a.employee)
    .slice(0, maxNames);
  
  if (activeAssignments.length === 0) {
    return 'Unassigned';
  }
  
  const names = activeAssignments
    .map(a => `${a.employee?.firstName || ''} ${a.employee?.lastName || ''}`.trim())
    .filter(Boolean);
  
  const totalCount = schedule.employeeRoomAssignments.filter(a => a.isActive && a.employee).length;
  const displayNames = names.join(', ');
  
  // If there are more employees than we're showing, add a count
  if (totalCount > maxNames) {
    return `${displayNames} +${totalCount - maxNames}`;
  }
  
  return displayNames;
};

interface WeekViewProps {
  weekDays: Date[];
  timeSlots: { time: string; hour: number }[];
  schedules: RoomSchedule[];
  selectedDate: Date;
  isLoading?: boolean;
  onScheduleClick?: (schedule: RoomSchedule) => void;
  onCellGroupClick?: (schedules: RoomSchedule[]) => void;
  shiftTemplateMap?: Record<string, ShiftTemplate>;
}

const renderSegmentLabel = (segment: TimelineSegment) => {
  const isBreak = segment.type === "break";
  const isGap = segment.type === "gap";
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        isBreak
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : isGap
          ? "border-dashed border-muted bg-muted/40 text-foreground"
          : "border-muted bg-background text-foreground"
      }`}
    >
      <p className="text-sm font-semibold">{segment.label}</p>
      <p className="text-xs opacity-80">
        {isBreak ? "Break period" : isGap ? "Flexible slot" : "Work window"}
      </p>
    </div>
  );
};

export function WeekView({
  weekDays,
  timeSlots,
  schedules,
  selectedDate,
  isLoading = false,
  onScheduleClick,
  onCellGroupClick,
  shiftTemplateMap,
}: WeekViewProps) {
  const schedulesWithTemplates = useMemo(() => {
    if (!shiftTemplateMap || Object.keys(shiftTemplateMap).length === 0) {
      return schedules;
    }
    return schedules.map((schedule) => {
      if (schedule.shift_template || !schedule.shift_template_id) {
        return schedule;
      }
      const template = shiftTemplateMap[schedule.shift_template_id];
      return template ? { ...schedule, shift_template: template } : schedule;
    });
  }, [schedules, shiftTemplateMap]);

  const referencedTemplates = useMemo(() => {
    if (!shiftTemplateMap) return [];
    const ids = new Set(
      schedulesWithTemplates
        .map((schedule) => schedule.shift_template_id)
        .filter((id): id is string => Boolean(id))
    );
    return Array.from(ids)
      .map((id) => shiftTemplateMap[id])
      .filter((template): template is ShiftTemplate => Boolean(template));
  }, [schedulesWithTemplates, shiftTemplateMap]);

  const timelineSegments = useMemo(
    () => buildTimelineSegments(timeSlots, schedulesWithTemplates, referencedTemplates),
    [timeSlots, schedulesWithTemplates, referencedTemplates]
  );

  const loadingSegments =
    timelineSegments.length > 0
      ? timelineSegments
      : buildTimelineSegments(timeSlots, [], referencedTemplates);

  const getSchedulesForSegment = (day: Date, segment: TimelineSegment) => {
    const dayKey = format(day, "yyyy-MM-dd");
    return schedulesWithTemplates.filter(
      (schedule) =>
        schedule.work_date === dayKey && scheduleFallsInSegment(schedule, segment)
    );
  };

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
            {loadingSegments.map((segment) => (
              <div key={segment.id} className="grid grid-cols-8 gap-0 min-h-22 border-b border-gray-100">
                <div className="text-xs md:text-sm text-gray-700 font-medium p-3 border-r border-gray-200 flex items-center">
                  {renderSegmentLabel(segment)}
                </div>
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
          {timelineSegments.map((segment) => (
            <div key={segment.id} className="grid grid-cols-8 gap-0 min-h-22 border-b border-gray-100">
              <div className="text-xs md:text-sm text-gray-700 font-medium p-3 border-r border-gray-200 flex items-center">
                {renderSegmentLabel(segment)}
              </div>
              <div className="col-span-7 h-full">
                <div className="grid grid-cols-7 h-full">
                  {weekDays.map((day, dayIndex) => {
                    const daySchedules = getSchedulesForSegment(day, segment);
                    return (
                      <div 
                        key={dayIndex} 
                        className={`h-full p-2 border-r border-gray-100 last:border-r-0 ${
                          isSameDay(day, selectedDate) ? "bg-blue-50" : ""
                        } ${segment.type === "break" ? "bg-amber-50/40" : ""}`}
                      >
                        {segment.type === "break" && daySchedules.length === 0 && (
                          <div className="h-full flex items-center justify-center text-[11px] font-semibold text-amber-700 border border-dashed border-amber-200 rounded-md bg-amber-50/60">
                            Break window
                          </div>
                        )}
                        {daySchedules.map((schedule) => (
                          <div
                            key={schedule.schedule_id}
                            className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs relative w-full cursor-pointer hover:bg-blue-100 transition-colors mb-1"
                            onClick={() => onScheduleClick?.(schedule)}
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                            <div className="ml-2">
                              <div className="font-medium text-gray-900 truncate">
                                {getEmployeeNames(schedule, 2)}
                              </div>
                              <div className="text-gray-600 text-xs">
                                {schedule.actual_start_time} - {schedule.actual_end_time}
                              </div>
                            </div>
                          </div>
                        ))}
                        {daySchedules.length === 0 && segment.type !== "break" && (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-gray-400 text-xs">—</div>
                          </div>
                        )}
                        {daySchedules.length > 1 && (
                          <button
                            type="button"
                            className="mt-1 w-full rounded-md border border-dashed border-blue-200 bg-blue-50/60 text-[10px] uppercase tracking-wide text-blue-700 py-1"
                            onClick={() => onCellGroupClick?.(daySchedules)}
                          >
                            View all {daySchedules.length}
                          </button>
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


