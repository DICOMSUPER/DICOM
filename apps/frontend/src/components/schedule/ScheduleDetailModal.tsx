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
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Roles } from "@/common/enums/user.enum";

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
import { RoomSchedule } from "@/common/interfaces/schedule/schedule.interface";
import { EditScheduleModal } from "@/components/admin/room-assignments/EditScheduleModal";
import { DeleteScheduleModal } from "@/components/admin/room-assignments/DeleteScheduleModal";
import { DeleteAssignmentModal } from "@/components/admin/room-assignments/DeleteAssignmentModal";
import { useGetModalitiesInRoomQuery } from "@/store/modalityMachineApi";
import { extractApiData } from "@/common/utils/api";
import { formatTimeRange } from "@/common/utils/schedule-helpers";
import { Monitor, Stethoscope, Loader2 } from "lucide-react";
import { ModalityMachine } from "@/common/interfaces/image-dicom/modality-machine.interface";
import { ServiceRoom } from "@/common/interfaces/user/service-room.interface";
import { formatStatus, modalStyles } from '@/common/utils/format-status';

interface ScheduleDetailModalProps {
  schedule: RoomSchedule | RoomSchedule[] | null;
  isOpen: boolean;
  onClose: () => void;
  getStatusColor: (status: string) => string;
  onScheduleUpdated?: () => void;
}

export function ScheduleDetailModal({
  schedule: schedulePayload,
  isOpen,
  onClose,
  getStatusColor,
  onScheduleUpdated,
}: ScheduleDetailModalProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === Roles.SYSTEM_ADMIN;
  
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAssignmentModalOpen, setIsDeleteAssignmentModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    if (!isOpen) {
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);
      setIsDeleteAssignmentModalOpen(false);
      setAssignmentToDelete(null);
    }
  }, [isOpen, scheduleList.length]);

  const activeSchedule = scheduleList[activeIndex];
  const roomId = activeSchedule?.room?.id ?? "";

  const { data: modalitiesData, isLoading: isLoadingModalities } = useGetModalitiesInRoomQuery(
    roomId,
    { 
      skip: !roomId || !isOpen,
      refetchOnMountOrArgChange: false 
    }
  );
  const modalities = useMemo(() => {
    if (!modalitiesData) return [];
    return extractApiData<ModalityMachine>(modalitiesData);
  }, [modalitiesData]);

  const roomServices = useMemo(() => {
    if (!activeSchedule?.room?.serviceRooms) return [];
    return activeSchedule.room.serviceRooms.filter((sr) => sr.isActive && sr.service);
  }, [activeSchedule]);

  const assignments = useMemo(() => activeSchedule?.employeeRoomAssignments ?? [], [activeSchedule]);
  const primaryEmployee = useMemo(() => {
    const assignmentList = activeSchedule?.employeeRoomAssignments ?? [];
    return (
      assignmentList.find((assignment) => assignment.isActive && assignment.employee)?.employee ??
      assignmentList.find((assignment) => assignment.employee)?.employee ??
      null
    );
  }, [activeSchedule]);

  const isDateInAdvance = useMemo(() => {
    if (!activeSchedule?.work_date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduleDate = new Date(activeSchedule.work_date);
    scheduleDate.setHours(0, 0, 0, 0);
    const diffTime = scheduleDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 1;
  }, [activeSchedule]);

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
    return (firstInitial + lastInitial || "N/A").toUpperCase();
  };

  const getStatusBadgeClass = (status: string | boolean | undefined, type: 'schedule' | 'machine' | 'service' | 'assignment' = 'schedule'): string => {
    if (type === 'assignment') {
      const isActive = status === true || status === 'true' || status === 'ACTIVE';
      return isActive 
        ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
        : 'bg-gray-100 text-gray-700 border-gray-200';
    }

    if (type === 'service') {
      const isActive = status === true || status === 'true' || status === 'ACTIVE';
      return isActive 
        ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
        : 'bg-gray-100 text-gray-700 border-gray-200';
    }

    if (type === 'machine') {
      const statusStr = String(status || '').toUpperCase();
      if (statusStr === 'ACTIVE' || statusStr === 'AVAILABLE') {
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      } else if (statusStr === 'INACTIVE' || statusStr === 'UNAVAILABLE') {
        return 'bg-gray-100 text-gray-700 border-gray-200';
      } else if (statusStr === 'MAINTENANCE') {
        return 'bg-amber-100 text-amber-700 border-amber-200';
      }
      return 'bg-gray-100 text-gray-700 border-gray-200';
    }

    return getStatusColor(String(status || ''));
  };

  const getStatusLabel = (status: string | boolean | undefined, type: 'schedule' | 'machine' | 'service' | 'assignment' = 'schedule'): string => {
    if (type === 'assignment' || type === 'service') {
      const isActive = status === true || status === 'true' || status === 'ACTIVE';
      return isActive ? 'Active' : 'Inactive';
    }

    return formatStatus(String(status || 'Unknown'));
  };

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
      value: formatTimeRange(schedule.actual_start_time, schedule.actual_end_time),
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
      value: formatTimeRange(schedule.actual_start_time, schedule.actual_end_time),
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
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden bg-slate-50">
        {/* Fixed Header */}
        <DialogHeader className={modalStyles.dialogHeader}>
          <DialogTitle className={modalStyles.dialogTitle}>Schedule Details</DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0 h-full px-6 py-4">
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

            <section className={modalStyles.heroSection}>
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className={modalStyles.heroLabel}>
                    <DoorOpen className="h-3.5 w-3.5" />
                    {schedule.room?.roomCode ?? "Room schedule"}
                  </div>
                  <div>
                    <p className={modalStyles.heroTitle}>
                      {schedule.shift_template?.shift_name ?? "Room assignment"}
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-foreground">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(schedule.work_date)}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatTimeRange(schedule.actual_start_time, schedule.actual_end_time)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <Badge className={`${getStatusBadgeClass(schedule.schedule_status, 'schedule')} px-4 py-1 text-xs font-medium shadow-sm border`}>
                    {getStatusLabel(schedule.schedule_status, 'schedule')}
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

            <div className="grid gap-6 xl:grid-cols-2">
              
                <section className={`xl:col-span-1 ${modalStyles.section}`}>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Calendar className="h-5 w-5" />
                    Schedule Overview
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {overviewItems.map((item) => {
                      const Icon = item.icon;
                      return (
                    <div key={item.label} className={modalStyles.infoCard}>
                          <div className={modalStyles.infoCardLabel}>
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </div>
                          <p className={modalStyles.infoCardValue}>{item.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
                <section className={`xl:col-span-1 ${modalStyles.section}`}>
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
                          className={`flex items-center justify-between gap-3 ${modalStyles.infoCard}`}
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
                          <div className="flex items-center gap-2">
                            <div className="text-right space-y-1">
                              <Badge className={`${getStatusBadgeClass(assignment.isActive, 'assignment')} text-xs font-medium border`}>
                                {getStatusLabel(assignment.isActive, 'assignment')}
                              </Badge>
                              <p className="text-[10px] text-foreground">
                                Added {formatDateTime((assignment as any)?.createdAt)}
                              </p>
                            </div>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  setAssignmentToDelete(assignment.id);
                                  setIsDeleteAssignmentModalOpen(true);
                                }}
                                disabled={!isDateInAdvance}
                                title={!isDateInAdvance ? "Cannot delete assignments for today or in the past. Only future assignments can be deleted." : undefined}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                {schedule.room && (
                  <section className={`xl:col-span-2 ${modalStyles.section}`}>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <MapPin className="h-5 w-5" />
                      Room Details
                    </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className={modalStyles.infoCard}>
                        <p className={modalStyles.infoCardLabel}>Room code</p>
                        <p className={modalStyles.infoCardValue}>{schedule.room.roomCode}</p>
                      </div>
                        <div className={modalStyles.infoCard}>
                        <p className={modalStyles.infoCardLabel}>Room type</p>
                        <p className={modalStyles.infoCardValue}>{schedule.room.roomType}</p>
                      </div>
                        {schedule.room.capacity && (
                          <div className={modalStyles.infoCard}>
                            <p className={modalStyles.infoCardLabel}>Capacity</p>
                            <p className={modalStyles.infoCardValue}>{schedule.room.capacity}</p>
                          </div>
                        )}
                        <div className={`md:col-span-3 ${modalStyles.infoCard}`}>
                        <p className={modalStyles.infoCardLabel}>Description</p>
                        <p className={modalStyles.infoCardValue}>
                          {schedule.room.description || "No description provided"}
                        </p>
                      </div>
                    </div>

                    {isLoadingModalities ? (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2 text-base font-semibold">
                          <Monitor className="h-4 w-4" />
                          Modality Machines
                        </div>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                          <span className="text-sm text-foreground">Loading modalities...</span>
                        </div>
                      </div>
                    ) : modalities.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2 text-base font-semibold">
                          <Monitor className="h-4 w-4" />
                          Modality Machines ({modalities.length})
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {modalities.map((machine: ModalityMachine) => {
                            const displayName = machine.name || 
                              machine.modality?.modalityName || 
                              `${machine.manufacturer || ''} ${machine.model || ''}`.trim() ||
                              "Unnamed Machine";
                            
                            return (
                              <div
                                key={machine.id}
                                className={modalStyles.infoCard}
                              >
                                <p className="text-sm font-semibold text-foreground">
                                  {displayName}
                                </p>
                                {machine.modality?.modalityName && machine.name && (
                                  <p className="text-xs text-foreground">Type: {machine.modality.modalityName}</p>
                                )}
                                {machine.model && (
                                  <p className="text-xs text-foreground">Model: {machine.model}</p>
                                )}
                                {machine.manufacturer && (
                                  <p className="text-xs text-foreground">Manufacturer: {machine.manufacturer}</p>
                                )}
                                {machine.status && (
                                  <Badge
                                    className={`${getStatusBadgeClass(machine.status, 'machine')} text-xs font-medium mt-1 border`}
                                  >
                                    {getStatusLabel(machine.status, 'machine')}
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2 text-base font-semibold">
                          <Monitor className="h-4 w-4" />
                          Modality Machines
                        </div>
                        <p className="text-sm text-foreground/70 italic">No modality machines available in this room</p>
                      </div>
                    )}

                    {roomServices.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2 text-base font-semibold">
                          <Stethoscope className="h-4 w-4" />
                          Room Services ({roomServices.length})
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {roomServices
                            .filter((sr: ServiceRoom) => sr.isActive && sr.service)
                            .map((sr: ServiceRoom) => (
                              <div
                                key={sr.id}
                                className={modalStyles.infoCard}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-foreground">
                                      {sr.service?.serviceName || "Unknown Service"}
                                    </p>
                                    {sr.service?.serviceCode && (
                                      <p className="text-xs text-foreground/70 mt-0.5">
                                        Code: {sr.service.serviceCode}
                                      </p>
                                    )}
                                  </div>
                                  <Badge className={`${getStatusBadgeClass(sr.isActive, 'service')} text-xs font-medium shrink-0 border`}>
                                    {getStatusLabel(sr.isActive, 'service')}
                                  </Badge>
                                </div>
                                {sr.service?.description && (
                                  <p className="text-xs text-foreground/80 line-clamp-2 mt-1">
                                    {sr.service.description}
                                  </p>
                                )}
                                {sr.notes && (
                                  <div className="mt-2 pt-2 border-t border-border/20">
                                    <p className="text-xs font-medium text-foreground/70">Notes:</p>
                                    <p className="text-xs text-foreground/80 mt-0.5">{sr.notes}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {schedule.shift_template && (
                  <section className={`xl:col-span-1 ${modalStyles.section}`}>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Clock className="h-5 w-5" />
                      Shift Template
                    </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className={modalStyles.infoCard}>
                        <p className={modalStyles.infoCardLabel}>Shift name</p>
                        <p className={modalStyles.infoCardValue}>{schedule.shift_template.shift_name}</p>
                      </div>
                        <div className={modalStyles.infoCard}>
                        <p className={modalStyles.infoCardLabel}>Shift type</p>
                        <p className={modalStyles.infoCardValue}>{schedule.shift_template.shift_type?.charAt(0).toUpperCase() + schedule.shift_template.shift_type?.slice(1)}</p>
                      </div>
                        <div className={modalStyles.infoCard}>
                        <p className={modalStyles.infoCardLabel}>Scheduled time</p>
                        <p className={modalStyles.infoCardValue}>
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
                        
                

                
                  <section className={`xl:col-span-1 ${modalStyles.section}`}>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <FileText className="h-5 w-5" />
                      Notes
                    </div>
                    <p className={`${modalStyles.infoCardValue} whitespace-pre-wrap`}>
                      {notes || "No notes provided"}
                    </p>
                  </section>
                
              </div>
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <DialogFooter className={modalStyles.dialogFooter}>
          <Button variant="outline" onClick={onClose} className={modalStyles.secondaryButton}>
            Close
          </Button>
          {isAdmin && (
            <>
              <Button
                className={modalStyles.dangerButton}
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={!isDateInAdvance}
                title={!isDateInAdvance ? "Cannot delete schedules for today or in the past. Only future schedules can be deleted." : undefined}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Schedule
              </Button>
              <Button
                variant="default"
                onClick={() => setIsEditModalOpen(true)}
                disabled={!isDateInAdvance}
                title={!isDateInAdvance ? "Cannot edit schedules for today or in the past. Only future schedules can be edited." : undefined}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Schedule
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>

      <EditScheduleModal
        schedule={activeSchedule}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={() => {
          onScheduleUpdated?.();
        }}
      />

      <DeleteScheduleModal
        schedule={activeSchedule}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleted={() => {
          setIsDeleteModalOpen(false);
          onScheduleUpdated?.();
          onClose();
        }}
      />

      {assignmentToDelete && (
        <DeleteAssignmentModal
          assignmentId={assignmentToDelete}
          schedule={activeSchedule}
          isOpen={isDeleteAssignmentModalOpen}
          onClose={() => {
            setIsDeleteAssignmentModalOpen(false);
            setAssignmentToDelete(null);
          }}
          onDeleted={(deletedAssignmentId) => {
            setIsDeleteAssignmentModalOpen(false);
            setAssignmentToDelete(null);
            onScheduleUpdated?.();
          }}
        />
      )}
    </Dialog>
  );
}
