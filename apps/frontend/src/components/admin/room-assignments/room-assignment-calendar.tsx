"use client";

import { useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DayView } from "@/components/schedule/DayView";
import { WeekView } from "@/components/schedule/WeekView";
import { MonthView } from "@/components/schedule/MonthView";
import { RoomView } from "@/components/schedule/RoomView";
import type { RoomSchedule } from "@/interfaces/schedule/schedule.interface";
import { cn } from "@/lib/utils";
import { useShiftTemplatesDictionary } from "@/hooks/useShiftTemplatesDictionary";

interface RoomAssignmentCalendarProps {
  schedules: RoomSchedule[];
  selectedDate: Date;
  viewMode: "day" | "week" | "month" | "room";
  onViewModeChange: (mode: "day" | "week" | "month" | "room") => void;
  isLoading?: boolean;
  onScheduleSelect: (scheduleId: string) => void;
  onScheduleDetails: (schedule: RoomSchedule | RoomSchedule[]) => void;
}

const timeSlots = [
  { time: "07:00", hour: 7 },
  { time: "08:00", hour: 8 },
  { time: "09:00", hour: 9 },
  { time: "10:00", hour: 10 },
  { time: "11:00", hour: 11 },
  { time: "12:00", hour: 12 },
  { time: "13:00", hour: 13 },
  { time: "14:00", hour: 14 },
  { time: "15:00", hour: 15 },
  { time: "16:00", hour: 16 },
  { time: "17:00", hour: 17 },
  { time: "18:00", hour: 18 },
];

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export function RoomAssignmentCalendar({
  schedules,
  selectedDate,
  viewMode,
  onViewModeChange,
  isLoading,
  onScheduleSelect,
  onScheduleDetails,
}: RoomAssignmentCalendarProps) {
  const { shiftTemplateMap } = useShiftTemplatesDictionary();
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [selectedDate]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [selectedDate]);

  const handleScheduleClick = (schedule: RoomSchedule | RoomSchedule[]) => {
    if (Array.isArray(schedule)) {
      const firstSchedule = schedule[0];
      if (firstSchedule) {
        onScheduleSelect(firstSchedule.schedule_id);
      }
      onScheduleDetails(schedule);
      return;
    }
    onScheduleSelect(schedule.schedule_id);
    onScheduleDetails(schedule);
  };

  return (
    <div className="space-y-4">
      <Tabs
        value={viewMode}
        onValueChange={(value) => {
          if (value === "day" || value === "week" || value === "month" || value === "room") {
            onViewModeChange(value);
          }
        }}
      >
        <TabsList className="grid grid-cols-4 w-full bg-muted">
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="room">Room</TabsTrigger>
        </TabsList>
      </Tabs>

      {viewMode === "day" && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {format(selectedDate, "EEEE, MMM d")}
          </h2>
          <DayView
            selectedDate={selectedDate}
            timeSlots={timeSlots}
            schedules={schedules}
            getStatusColor={(status) =>
              cn("border", statusColors[status] ?? "bg-muted text-foreground")
            }
            isLoading={isLoading}
            onScheduleClick={handleScheduleClick}
            shiftTemplateMap={shiftTemplateMap}
          />
        </div>
      )}

      {viewMode === "week" && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            Week of {format(weekDays[0], "MMM d")} –{" "}
            {format(weekDays[6], "MMM d, yyyy")}
          </h2>
          <WeekView
            weekDays={weekDays}
            timeSlots={timeSlots}
            schedules={schedules}
            selectedDate={selectedDate}
            isLoading={isLoading}
            onScheduleClick={handleScheduleClick}
            onCellGroupClick={(group) => handleScheduleClick(group)}
            shiftTemplateMap={shiftTemplateMap}
          />
        </div>
      )}

      {viewMode === "month" && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {format(selectedDate, "MMMM yyyy")}
          </h2>
          <MonthView
            calendarDays={calendarDays}
            schedules={schedules}
            selectedDate={selectedDate}
            isLoading={isLoading}
            onScheduleClick={handleScheduleClick}
            onCellGroupClick={(group) => handleScheduleClick(group)}
          />
        </div>
      )}

      {viewMode === "room" && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            Room Schedule - {format(selectedDate, "EEEE, MMM d")}
          </h2>
          <RoomView
            selectedDate={selectedDate}
            timeSlots={timeSlots}
            schedules={schedules}
            getStatusColor={(status) =>
              cn("border", statusColors[status] ?? "bg-muted text-foreground")
            }
            isLoading={isLoading}
            onScheduleClick={handleScheduleClick}
            shiftTemplateMap={shiftTemplateMap}
          />
        </div>
      )}
    </div>
  );
}

