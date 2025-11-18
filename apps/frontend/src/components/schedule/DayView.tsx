"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomSchedule, ShiftTemplate } from "@/interfaces/schedule/schedule.interface";
import {
  TimelineSegment,
  buildTimelineSegments,
  scheduleFallsInSegment,
} from "./time-segment-utils";

interface DayViewProps {
  selectedDate: Date;
  timeSlots: { time: string; hour: number }[];
  schedules: RoomSchedule[];
  getStatusColor: (status: string) => string;
  isLoading?: boolean;
  onScheduleClick?: (schedule: RoomSchedule | RoomSchedule[]) => void;
  shiftTemplateMap?: Record<string, ShiftTemplate>;
}

const formatDuration = (segment: TimelineSegment) => {
  const minutes = segment.endMinutes - segment.startMinutes;
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  }
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  return `${minutes} min`;
};

export function DayView({
  selectedDate,
  timeSlots,
  schedules,
  getStatusColor,
  isLoading = false,
  onScheduleClick,
  shiftTemplateMap,
}: DayViewProps) {
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  const schedulesForDate = useMemo(
    () => schedules.filter((schedule) => schedule.work_date === selectedDateStr),
    [schedules, selectedDateStr]
  );

  const schedulesWithTemplates = useMemo(() => {
    if (!shiftTemplateMap || Object.keys(shiftTemplateMap).length === 0) {
      return schedulesForDate;
    }
    return schedulesForDate.map((schedule) => {
      if (schedule.shift_template || !schedule.shift_template_id) {
        return schedule;
      }
      const template = shiftTemplateMap[schedule.shift_template_id];
      return template ? { ...schedule, shift_template: template } : schedule;
    });
  }, [schedulesForDate, shiftTemplateMap]);

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

  const getSchedulesForSegment = (segment: TimelineSegment) =>
    schedulesWithTemplates.filter((schedule) =>
      scheduleFallsInSegment(schedule, segment)
    );

  const loadingSegments =
    timelineSegments.length > 0
      ? timelineSegments
      : buildTimelineSegments(timeSlots, [], referencedTemplates);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-4 text-sm font-semibold uppercase tracking-wide text-foreground">
          <div className="col-span-2">Time</div>
          <div className="col-span-10">Assignments</div>
        </div>
        <div className="space-y-0">
        {loadingSegments.map((segment) => (
          <div key={segment.id} className="grid grid-cols-12 gap-4 min-h-20">
            <div className="col-span-2 flex flex-col justify-center">
              <div
                className={`rounded-lg border px-3 py-2 ${
                  segment.type === "break"
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-muted bg-background text-foreground"
                }`}
              >
                <p className="text-sm font-semibold">{segment.label}</p>
                <p className="text-xs opacity-80">
                  {segment.type === "break"
                    ? "Break period"
                    : segment.type === "gap"
                    ? "Flexible slot"
                    : formatDuration(segment)}
                </p>
              </div>
            </div>
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 text-sm font-semibold uppercase tracking-wide text-foreground">
        <div className="col-span-2">Time</div>
        <div className="col-span-10">Assignments</div>
      </div>
      <div className="space-y-0">
      {timelineSegments.map((segment) => {
        const slotSchedules = getSchedulesForSegment(segment);
        return (
          <div key={segment.id} className="grid grid-cols-12 gap-4 min-h-20">
            <div className="col-span-2 flex flex-col justify-center">
              <div
                className={`rounded-lg border px-3 py-2 ${
                  segment.type === "break"
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-muted bg-background text-foreground"
                }`}
              >
                <p className="text-sm font-semibold">{segment.label}</p>
                <p className="text-xs opacity-80">
                  {segment.type === "break"
                    ? "Break period"
                    : segment.type === "gap"
                    ? "Flexible slot"
                    : formatDuration(segment)}
                </p>
              </div>
            </div>
            <div className="col-span-10 h-full flex items-center justify-center border-t border-gray-200">
              {slotSchedules.length > 0 ? (
                slotSchedules.length === 1 ? (
                  <div
                    className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm relative w-full m-2 my-auto cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => onScheduleClick?.(slotSchedules[0])}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                    <div className="ml-2 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-base">
                          {slotSchedules[0].employee?.firstName} {slotSchedules[0].employee?.lastName}
                        </h4>
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>
                            {slotSchedules[0].actual_start_time} - {slotSchedules[0].actual_end_time}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">
                            {slotSchedules[0].room?.roomCode || "Consultation"}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={`${getStatusColor(slotSchedules[0].schedule_status)} border border-blue-400 text-xs ml-auto`}
                      >
                        {slotSchedules[0].schedule_status.charAt(0).toUpperCase() +
                          slotSchedules[0].schedule_status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm relative w-full m-2 my-auto cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => onScheduleClick?.(slotSchedules)}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                    <div className="ml-2">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-base">
                            {slotSchedules.length} schedules
                          </h4>
                          <p className="text-xs text-gray-600">
                            {slotSchedules[0].room?.roomCode || "Room"} • {slotSchedules[0].actual_start_time}
                          </p>
                        </div>
                        <Badge className="text-xs border border-blue-400 bg-blue-100 text-blue-800">
                          View details
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-2">
                        {slotSchedules.slice(0, 2).map((schedule) => (
                          <div key={schedule.schedule_id} className="flex items-center justify-between text-xs text-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {schedule.employee?.firstName} {schedule.employee?.lastName}
                              </span>
                              <span className="text-gray-500">({schedule.schedule_status})</span>
                            </div>
                            <span className="text-gray-500">
                              {schedule.actual_start_time} - {schedule.actual_end_time}
                            </span>
                          </div>
                        ))}
                        {slotSchedules.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{slotSchedules.length - 2} more schedules
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div
                  className={`text-sm text-center italic m-2 w-full rounded-lg border px-4 py-3 ${
                    segment.type === "break"
                      ? "border-amber-200 bg-amber-50/70 text-amber-800"
                      : "border-dashed border-gray-200 text-gray-500"
                  }`}
                >
                  {segment.type === "break" ? "Scheduled break window" : "No schedules"}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
  );
}

