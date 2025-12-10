"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Users, Clock, CalendarDays, DoorOpen, User, Building2, Wifi, Tv, Droplets, Phone, Stethoscope, Thermometer, Bell, Search } from "lucide-react";
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
  onSearch?: () => void;
  isSearching?: boolean;
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
  return combined || "N/A";
};

const statusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "scheduled":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "in_progress":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "completed":
      return "bg-green-100 text-green-700 border-green-200";
    case "cancelled":
    case "canceled":
      return "bg-rose-100 text-rose-700 border-rose-200";
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
  onSearch,
  isSearching = false,
  optimisticAssignments,
  isLoading,
  onScheduleDetails,
}: ScheduleAssignmentListProps) {
  const filteredSchedules = useMemo(() => {
    return schedules;
  }, [schedules]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

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
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
              <Input
                value={scheduleSearch}
                onChange={(event) => onScheduleSearchChange(event.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search schedules by room, notes, or shift"
                className="pl-10"
              />
            </div>
            {onSearch && (
              <Button 
                onClick={onSearch} 
                disabled={isSearching}
                className="h-9 px-4"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            )}
          </div>
          <Badge variant="outline" className="whitespace-nowrap">
            {filteredSchedules.length} schedules
          </Badge>
        </div>
        <p className="text-sm text-foreground">
          Select a schedule to review existing assignments and add more staff.
          Each card highlights the room, date, shift window, and current team.
        </p>
      </div>

      <ScrollArea className="p-4 rounded-lg border border-border shadow-sm">
        <div className="space-y-3">
          {isLoading
            ? renderSkeletons()
            : filteredSchedules.map((schedule) => {
                const assignments = renderAssignments(schedule);
                const isSelected = schedule.schedule_id === selectedScheduleId;
                const room = schedule.room;
                const occupancy = assignments.length;
                const capacity = room?.capacity || 0;
                
                const meta = [
                  {
                    label: room?.roomCode ?? "Room TBD",
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

                // Get room equipment
                type EquipmentItem = { name: string; icon: React.ReactNode };
                const roomEquipment: EquipmentItem[] = room ? ([] as (EquipmentItem | null)[]).concat(
                  room.hasTV ? { name: 'TV', icon: <Tv className="h-3 w-3" /> } : null,
                  room.hasAirConditioning ? { name: 'AC', icon: <Thermometer className="h-3 w-3" /> } : null,
                  room.hasWiFi ? { name: 'WiFi', icon: <Wifi className="h-3 w-3" /> } : null,
                  room.hasTelephone ? { name: 'Phone', icon: <Phone className="h-3 w-3" /> } : null,
                  room.hasAttachedBathroom ? { name: 'Bathroom', icon: <Droplets className="h-3 w-3" /> } : null,
                  room.isWheelchairAccessible ? { name: 'Wheelchair', icon: <Users className="h-3 w-3" /> } : null,
                  room.hasOxygenSupply ? { name: 'Oxygen', icon: <Stethoscope className="h-3 w-3" /> } : null,
                  room.hasNurseCallButton ? { name: 'Nurse Call', icon: <Bell className="h-3 w-3" /> } : null,
                ).filter((item): item is EquipmentItem => item !== null) : [];

                // Get room services
                const roomServices = room?.serviceRooms?.filter(sr => sr.isActive && sr.service).map(sr => 
                  sr.service?.serviceName || sr.service?.serviceCode || 'Unknown'
                ) || [];

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
                    <CardContent className="space-y-4">
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

                          {/* Room Details Section */}
                          {room && (
                            <div className="space-y-2 pt-2 border-t border-border">
                              <div className="flex items-center gap-2 mb-2">
                                <Building2 className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-semibold text-gray-900">Room Details</span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                {/* Capacity & Occupancy */}
                                {capacity > 0 && (
                                  <div className="flex items-center gap-2">
                                    <Users className="h-3 w-3 text-gray-500" />
                                    <span className="text-gray-700">
                                      <span className="font-semibold">{occupancy}</span> / {capacity} assigned
                                    </span>
                                  </div>
                                )}

                                {/* Room Type */}
                                {room.roomType && (
                                  <div className="text-gray-700">
                                    <span className="font-semibold">Type:</span> {room.roomType}
                                  </div>
                                )}

                                {/* Department */}
                                {room.department && (
                                  <div className="text-gray-700">
                                    <span className="font-semibold">Dept:</span>{' '}
                                    {typeof room.department === 'string' 
                                      ? room.department 
                                      : (room.department.departmentName || room.department.departmentCode || 'N/A')}
                                  </div>
                                )}

                                {/* Floor */}
                                {room.floor !== undefined && room.floor !== null && (
                                  <div className="text-gray-700">
                                    <span className="font-semibold">Floor:</span> {room.floor}
                                  </div>
                                )}
                              </div>

                              {/* Services */}
                              {roomServices.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {roomServices.slice(0, 5).map((service, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-[10px] text-white px-1.5 py-0.5">
                                      {service}
                                    </Badge>
                                  ))}
                                  {roomServices.length > 5 && (
                                    <Badge variant="secondary" className="text-[10px] text-white px-1.5 py-0.5">
                                      +{roomServices.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Equipment */}
                              {roomEquipment.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {roomEquipment.slice(0, 6).map((eq, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0.5 flex items-center gap-1">
                                      {eq.icon}
                                      {eq.name}
                                    </Badge>
                                  ))}
                                  {roomEquipment.length > 6 && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                                      +{roomEquipment.length - 6} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
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
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                        <div className="flex flex-wrap gap-2 flex-1">
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
                                {assignment.employee?.id ? (
                                  <Link
                                    href={`/profile/${assignment.employee.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="block transition-all hover:text-primary group"
                                  >
                                    <p className="font-bold text-gray-900 leading-tight group-hover:underline">
                                      {assignment.employee.firstName} {assignment.employee.lastName}
                                    </p>
                                  </Link>
                                ) : (
                                  <p className="font-bold text-gray-900 leading-tight">
                                    {assignment.employeeId}
                                  </p>
                                )}
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
                        {onScheduleDetails && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 border-border hover:bg-gray-50 shrink-0"
                            onClick={(event) => {
                              event.stopPropagation();
                              onScheduleDetails(schedule);
                            }}
                          >
                            View details
                          </Button>
                        )}
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

