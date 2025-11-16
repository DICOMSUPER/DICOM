"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Users, Clock, CalendarDays, DoorOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";

import { RoomSchedule } from "@/interfaces/schedule/schedule.interface";
import { AssignmentWithMeta } from "./types";
import { formatRole } from "@/utils/role-formatter";

interface ScheduleAssignmentListProps {
  schedules: RoomSchedule[];
  selectedScheduleId?: string;
  onSelectSchedule: (scheduleId: string) => void;
  scheduleSearch: string;
  onScheduleSearchChange: (value: string) => void;
  optimisticAssignments: Record<string, AssignmentWithMeta[]>;
  isLoading?: boolean;
  onScheduleDetails?: (schedule: RoomSchedule | RoomSchedule[]) => void;
}

const formatDate = (value?: string) => {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM dd, yyyy");
  } catch {
    return value;
  }
};

const initials = (first?: string | null, last?: string | null) => {
  const firstInitial = first?.[0] ?? "";
  const lastInitial = last?.[0] ?? "";
  const combined = `${firstInitial}${lastInitial}`;
  return combined || "NA";
};

const statusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "scheduled":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "confirmed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "completed":
      return "bg-green-100 text-green-700 border-green-200";
    case "cancelled":
    case "canceled":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "no_show":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-muted text-foreground border-border";
  }
};

export function ScheduleAssignmentList({
  schedules,
  selectedScheduleId,
  onSelectSchedule,
  scheduleSearch,
  onScheduleSearchChange,
  optimisticAssignments,
  isLoading,
  onScheduleDetails,
}: ScheduleAssignmentListProps) {
  const filteredSchedules = useMemo(() => {
    if (!scheduleSearch) return schedules;
    const needle = scheduleSearch.toLowerCase();

    return schedules.filter((schedule) => {
      const roomCode =
        (schedule.room?.roomCode ?? schedule.room?.roomType ?? "").toLowerCase();
      const notes = (schedule.notes ?? "").toLowerCase();
      const shiftName =
        (schedule.shift_template?.shift_name ?? "").toLowerCase();

      return (
        roomCode.includes(needle) ||
        notes.includes(needle) ||
        shiftName.includes(needle)
      );
    });
  }, [scheduleSearch, schedules]);

  const renderAssignments = (
    schedule: RoomSchedule
  ): AssignmentWithMeta[] => {
    const optimistic =
      optimisticAssignments[schedule.schedule_id] ?? [];
    const base = schedule.employeeRoomAssignments ?? [];

    const merged = [...base];
    optimistic.forEach((incoming) => {
      if (!merged.some((item) => item.id === incoming.id)) {
        merged.push(incoming);
      }
    });

    return merged as AssignmentWithMeta[];
  };

  const renderSkeletons = () =>
    Array.from({ length: 3 }).map((_, idx) => (
      <Card key={`skeleton-${idx}`} className="border border-dashed">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 2 }).map((__, innerIdx) => (
              <div
                key={`inner-${innerIdx}`}
                className="flex items-center gap-2 border rounded-md px-3 py-2 w-full"
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1 w-full">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-2 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Input
            value={scheduleSearch}
            onChange={(event) => onScheduleSearchChange(event.target.value)}
            placeholder="Search schedules by room, notes, or shift"
            className="flex-1"
          />
          <Badge variant="outline" className="whitespace-nowrap">
            {filteredSchedules.length} schedules
          </Badge>
        </div>
        <p className="text-sm text-foreground">
          Select a schedule to review existing assignments and add more staff.
          Each card highlights the room, date, shift window, and current team.
        </p>
      </div>

      <ScrollArea className="h-[75vh] p-4 rounded-lg border border-border shadow-sm">
        <div className="space-y-3">
          {isLoading
            ? renderSkeletons()
            : filteredSchedules.map((schedule) => {
                const assignments = renderAssignments(schedule);
                const isSelected = schedule.schedule_id === selectedScheduleId;
                const meta = [
                  {
                    label: schedule.room?.roomCode ?? "Room TBD",
                    icon: DoorOpen,
                  },
                  {
                    label: formatDate(schedule.work_date),
                    icon: CalendarDays,
                  },
                  {
                    label: `${schedule.actual_start_time ?? "--:--"} → ${
                      schedule.actual_end_time ?? "--:--"
                    }`,
                    icon: Clock,
                  },
                ];

                return (
                  <Card
                    key={schedule.schedule_id}
                    onClick={() => onSelectSchedule(schedule.schedule_id)}
                    className={cn(
                      "transition border border-border hover:shadow-lg cursor-pointer hover:border-primary/60",
                      isSelected &&
                        "border-primary shadow-lg shadow-primary/20 bg-primary/5"
                    )}
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-lg font-bold text-foreground mb-3">
                              {schedule.shift_template?.shift_name ?? "Shift"}
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              {meta.map(({ label, icon: Icon }) => (
                                <div
                                  key={label}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-border"
                                >
                                  <Icon className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            <Badge
                              variant="outline"
                              className={cn(
                                "uppercase font-semibold border-border",
                                statusBadgeClass(schedule.schedule_status ?? "")
                              )}
                            >
                              {schedule.schedule_status}
                            </Badge>
                            <Badge className="bg-gray-800 text-white border-border text-xs font-semibold flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{assignments.length} assigned</span>
                            </Badge>
                          </div>
                          {onScheduleDetails && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 border-border hover:bg-gray-50"
                              onClick={(event) => {
                                event.stopPropagation();
                                onScheduleDetails(schedule);
                              }}
                            >
                              View details
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {assignments.length === 0 && (
                          <div className="w-full px-3 py-2 bg-gray-100 rounded-lg border border-border">
                            <p className="text-sm text-gray-600">
                              No employees assigned yet. Select this schedule to add one.
                            </p>
                          </div>
                        )}

                        {assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className={cn(
                              "flex items-center gap-3 border border-border bg-gray-100 rounded-lg px-3 py-2 min-w-[240px]",
                              assignment.__optimistic &&
                                "opacity-70 border-dashed border-primary bg-primary/5"
                            )}
                          >
                            <div className="h-9 w-9 rounded-lg bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-xs">
                              {initials(
                                assignment.employee?.firstName,
                                assignment.employee?.lastName
                              )}
                            </div>
                            <div className="flex-1 text-sm">
                              <p className="font-bold text-gray-900 leading-tight">
                                {assignment.employee
                                  ? `${assignment.employee.firstName} ${assignment.employee.lastName}`
                                  : assignment.employeeId}
                              </p>
                              <p className="text-xs text-gray-600">
                                {formatRole(assignment.employee?.role)}
                              </p>
                            </div>
                            {assignment.__optimistic && (
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase border-border"
                              >
                                syncing
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

          {!isLoading && filteredSchedules.length === 0 && (
            <Card className="border-dashed border border-border">
              <CardContent className="p-6 text-center text-sm text-foreground">
                No schedules match your search. Try adjusting the filters or
                refresh the data.
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

