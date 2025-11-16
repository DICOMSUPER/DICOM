"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CalendarClock,
  Clock,
  DoorOpen,
  FileText,
  MapPin,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoomSchedule } from "@/interfaces/schedule/schedule.interface";

interface ScheduleDetailModalProps {
  schedule: RoomSchedule | RoomSchedule[] | null;
  isOpen: boolean;
  onClose: () => void;
  getStatusColor: (status: string) => string;
}

export function ScheduleDetailModal({
  schedule: schedulePayload,
  isOpen,
  onClose,
  getStatusColor,
}: ScheduleDetailModalProps) {
  const scheduleList = useMemo(
    () =>
      Array.isArray(schedulePayload)
        ? schedulePayload
        : schedulePayload
        ? [schedulePayload]
        : [],
    [schedulePayload]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [isOpen, scheduleList.length]);

  const activeSchedule = scheduleList[activeIndex];

  if (!activeSchedule) return null;
  const schedule: RoomSchedule = activeSchedule;
  const totalSchedules = scheduleList.length;
  const hasMultipleSchedules = totalSchedules > 1;
  const disablePrev = activeIndex === 0;
  const disableNext = activeIndex === totalSchedules - 1;

  const handleNavigate = (direction: "prev" | "next") => {
    setActiveIndex((prev) => {
      if (direction === "prev") {
        return Math.max(prev - 1, 0);
      }
      return Math.min(prev + 1, totalSchedules - 1);
    });
  };

  const formatChipLabel = (item: RoomSchedule) => {
    const dateLabel = new Date(item.work_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${dateLabel} • ${item.actual_start_time ?? "--:--"}`;
  };

  const formatTime = (time?: string) => {
    if (!time) return "Not set";
    return time;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateValue?: string | Date | null) => {
    if (!dateValue) return "—";
    const date =
      typeof dateValue === "string" || dateValue instanceof Date
        ? new Date(dateValue)
        : null;
    if (!date || Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getInitials = (first?: string | null, last?: string | null) => {
    const firstInitial = first?.[0] ?? "";
    const lastInitial = last?.[0] ?? "";
    return (firstInitial + lastInitial || "NA").toUpperCase();
  };

  const assignments = schedule.employeeRoomAssignments ?? [];
  const primaryEmployee =
    assignments.find((assignment) => assignment.isActive && assignment.employee)?.employee ??
    assignments.find((assignment) => assignment.employee)?.employee ??
    schedule.employee;

  const statusLabel = schedule.schedule_status
    ? schedule.schedule_status.replace(/_/g, " ")
    : "status";
  const formattedStatus = statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1);
  const notes = schedule.notes?.trim();

  const summaryStats = [
    {
      label: "Room",
      value: schedule.room?.roomCode ?? "Unassigned",
      caption: schedule.room?.roomType ?? "Room pending",
      icon: DoorOpen,
    },
    {
      label: "Assigned Staff",
      value: assignments.length > 0 ? `${assignments.length} member${assignments.length === 1 ? "" : "s"}` : "No team yet",
      caption: assignments.length > 0 ? "Active coverage" : "Add coverage",
      icon: Users,
    },
    {
      label: "Shift Window",
      value: `${formatTime(schedule.actual_start_time)} – ${formatTime(schedule.actual_end_time)}`,
      caption: schedule.shift_template?.shift_name ?? "Custom shift",
      icon: CalendarClock,
    },
  ];

  const overviewItems = [
    {
      label: "Work Date",
      value: formatDate(schedule.work_date),
      icon: Calendar,
    },
    {
      label: "Actual Time",
      value: `${formatTime(schedule.actual_start_time)} – ${formatTime(schedule.actual_end_time)}`,
      icon: Clock,
    },
    {
      label: "Overtime Hours",
      value: `${schedule.overtime_hours ?? 0} hrs`,
      icon: CalendarClock,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">Schedule Details</DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          <div className="space-y-8 pr-4 pb-2">
            {hasMultipleSchedules && (
              <section className="rounded-2xl border border-dashed border-primary/30 bg-card/70 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-primary">Multiple schedules selected</p>
                    <p className="text-sm text-foreground">
                      Showing schedule {activeIndex + 1} of {totalSchedules}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleNavigate("prev")}
                      disabled={disablePrev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleNavigate("next")}
                      disabled={disableNext}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {scheduleList.map((item, index) => (
                    <button
                      key={item.schedule_id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`rounded-full px-3 py-1 text-xs font-medium border ${
                        index === activeIndex
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background/70 text-foreground border-border/60 hover:text-foreground"
                      }`}
                    >
                      {formatChipLabel(item)}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                    <DoorOpen className="h-3.5 w-3.5" />
                    {schedule.room?.roomCode ?? "Room schedule"}
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground leading-tight">
                      {schedule.shift_template?.shift_name ?? "Room assignment"}
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-foreground">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(schedule.work_date)}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatTime(schedule.actual_start_time)} – {formatTime(schedule.actual_end_time)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <Badge className={`${getStatusColor(schedule.schedule_status)} px-4 py-1 text-xs font-semibold shadow-sm`}>
                    {formattedStatus}
                  </Badge>
                  {primaryEmployee && (
                    <div className="rounded-2xl bg-background/70 px-4 py-3 text-sm text-foreground shadow">
                      <p className="uppercase text-xs tracking-wide">Lead contact</p>
                      <p className="text-base font-semibold text-foreground">
                        {primaryEmployee.firstName} {primaryEmployee.lastName}
                      </p>
                      <p className="capitalize">
                        {primaryEmployee.role?.replace('_', ' ') ?? "Staff"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {summaryStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40"
                    >
                      <div className="rounded-xl bg-primary/10 p-3 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-foreground">
                          {stat.label}
                        </p>
                        <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                        <p className="text-xs text-foreground">{stat.caption}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 space-y-6">
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Calendar className="h-5 w-5" />
                    Schedule Overview
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {overviewItems.map((item) => {
                      const Icon = item.icon;
                      return (
                    <div key={item.label} className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </div>
                          <p className="text-base font-semibold text-foreground">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {schedule.room && (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <MapPin className="h-5 w-5" />
                      Room Details
                    </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Room code</p>
                        <p className="text-base font-semibold text-foreground">{schedule.room.roomCode}</p>
                      </div>
                        <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Room type</p>
                        <p className="text-base font-semibold text-foreground">{schedule.room.roomType}</p>
                      </div>
                        <div className="md:col-span-2 rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Description</p>
                        <p className="text-base text-foreground">
                          {schedule.room.description || "No description provided"}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {schedule.shift_template && (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Clock className="h-5 w-5" />
                      Shift Template
                    </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Shift name</p>
                        <p className="text-base font-semibold text-foreground">{schedule.shift_template.shift_name}</p>
                      </div>
                        <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Shift type</p>
                        <p className="text-base font-semibold text-foreground">{schedule.shift_template.shift_type?.charAt(0).toUpperCase() + schedule.shift_template.shift_type?.slice(1)}</p>
                      </div>
                        <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Scheduled time</p>
                        <p className="text-base font-semibold text-foreground">
                          {schedule.shift_template.start_time} – {schedule.shift_template.end_time}
                        </p>
                      </div>
                      {schedule.shift_template.break_start_time && schedule.shift_template.break_end_time && (
                        <div className="md:col-span-3 rounded-2xl bg-amber-50/50 border border-amber-200 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-amber-200/30">
                          <p className="text-sm font-semibold text-amber-900">Break Period</p>
                          <p className="text-base font-semibold text-amber-800">
                            {schedule.shift_template.break_start_time} – {schedule.shift_template.break_end_time}
                          </p>
                          {schedule.shift_template.description && (
                            <p className="text-xs text-amber-700 mt-2">
                              {schedule.shift_template.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>

              <div className="space-y-6">
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Users className="h-5 w-5" />
                      Assignment Team
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {assignments.length} member{assignments.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  {assignments.length === 0 ? (
                    <p className="text-sm text-foreground">
                      No employees assigned to this schedule yet. Use the assignment panel to add staff.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-primary/10 px-3 py-3 shadow-sm ring-1 ring-border/10"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {getInitials(
                                  assignment.employee?.firstName,
                                  assignment.employee?.lastName
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-foreground leading-tight">
                                {assignment.employee
                                  ? `${assignment.employee.firstName} ${assignment.employee.lastName}`
                                  : assignment.employeeId}
                              </p>
                              <p className="text-xs text-foreground capitalize">
                                {assignment.employee?.role?.replace('_', ' ') ?? "Staff member"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge variant={assignment.isActive ? "default" : "outline"} className="text-[10px] uppercase tracking-wide">
                              {assignment.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <p className="text-[10px] text-foreground">
                              Added {formatDateTime((assignment as any)?.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {notes && (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-3">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <FileText className="h-5 w-5" />
                      Notes
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-primary/10 p-4 rounded-2xl shadow-sm">
                      {notes}
                    </p>
                  </section>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="default">
            Edit Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
