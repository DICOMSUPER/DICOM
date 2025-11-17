"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, ShieldQuestion, CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { RoomSchedule, Employee, Room, ShiftTemplate } from "@/interfaces/schedule/schedule.interface";
import { cn } from "@/lib/utils";
import { formatRole } from "@/utils/role-formatter";
import * as SelectPrimitive from "@radix-ui/react-select";

interface AssignEmployeeFormProps {
  schedule?: RoomSchedule;
  employees: Employee[];
  loadingEmployees: boolean;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedEmployeeId: string;
  onSelectedEmployeeChange: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  // New props for room selection
  rooms?: Room[];
  loadingRooms?: boolean;
  shiftTemplates?: ShiftTemplate[];
  loadingShiftTemplates?: boolean;
  selectedDate?: Date;
  onDateChange?: (date: Date | undefined) => void;
  selectedRoomId?: string;
  onRoomChange?: (roomId: string) => void;
  selectedShiftId?: string;
  onShiftChange?: (shiftId: string) => void;
  selectedStartTime?: string;
  onStartTimeChange?: (time: string) => void;
  selectedEndTime?: string;
  onEndTimeChange?: (time: string) => void;
  availableSchedules?: RoomSchedule[];
  onScheduleSelect?: (scheduleId: string) => void;
}

const formatDate = (value?: string) => {
  if (!value) return "—";
  try {
    return format(new Date(value), "PPP");
  } catch {
    return value;
  }
};

const statusBadgeClass = (status?: string) => {
  if (!status) return "bg-muted text-foreground border-border";
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

export function AssignEmployeeForm({
  schedule,
  employees,
  loadingEmployees,
  roleFilter,
  onRoleFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  searchTerm,
  onSearchTermChange,
  selectedEmployeeId,
  onSelectedEmployeeChange,
  onSubmit,
  submitting,
  rooms = [],
  loadingRooms = false,
  shiftTemplates = [],
  loadingShiftTemplates = false,
  selectedDate,
  onDateChange,
  selectedRoomId,
  onRoomChange,
  selectedShiftId,
  onShiftChange,
  selectedStartTime,
  onStartTimeChange,
  selectedEndTime,
  onEndTimeChange,
  availableSchedules = [],
  onScheduleSelect,
}: AssignEmployeeFormProps) {
  const handleSubmit = (e?: React.MouseEvent) => {
    // Prevent double submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!schedule && (!selectedDate || !selectedRoomId)) {
      toast.error("Please select a date and room, or select an existing schedule");
      return;
    }

    if (!selectedEmployeeId) {
      toast.warning("Pick an employee from the list to continue");
      return;
    }

    onSubmit();
  };

  // Always show room selection UI when callbacks are provided
  const showRoomSelection = !!(onDateChange || onRoomChange);

  const roleOptions = Array.from(
    new Set(employees.map((employee) => employee.role).filter(Boolean))
  ) as string[];
  const departmentOptions = Array.from(
    new Set(employees.map((employee) => employee.departmentId).filter(Boolean))
  ) as string[];

  // Filter schedules for selected room and date
  const filteredSchedules = selectedDate && selectedRoomId
    ? availableSchedules.filter((s) => {
        const scheduleDate = s.work_date ? new Date(s.work_date).toDateString() : null;
        const selectedDateStr = selectedDate.toDateString();
        return scheduleDate === selectedDateStr && s.room_id === selectedRoomId;
      })
    : [];

  return (
    <Card className="border border-border overflow-auto">
      <CardHeader>
        <CardTitle className="text-xl">Assign Employee</CardTitle>
        <p className="text-sm text-foreground">
          {schedule
            ? `Add another team member to ${schedule.room?.roomCode ?? "a room"} on ${formatDate(schedule.work_date)}.`
            : "Select a room and date to assign an employee."}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {showRoomSelection ? (
          <>
            {/* Show selected schedule info if available */}
            {schedule && (
              <div className="grid gap-2 rounded-md border border-border p-4 bg-muted/50 text-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-xs uppercase text-foreground">
                      Selected Schedule
                    </p>
                    <p className="font-semibold">
                      {schedule.room?.roomCode ?? "Unassigned room"} — {formatDate(schedule.work_date)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "uppercase",
                      statusBadgeClass(schedule.schedule_status)
                    )}
                  >
                    {schedule.schedule_status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-xs uppercase text-foreground">
                      Shift
                    </p>
                    <p className="font-semibold">
                      {schedule.shift_template?.shift_name ?? "No shift template"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-foreground">
                      Time
                    </p>
                    <p className="font-semibold">
                      {schedule.actual_start_time ?? "--:--"} —{" "}
                      {schedule.actual_end_time ?? "--:--"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <p className="text-sm font-medium mb-2 text-foreground">
                Select Date
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      onDateChange?.(date);
                      // Clear schedule selection when date changes
                      if (date && onScheduleSelect) {
                        onScheduleSelect('');
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Room Selection */}
            <div>
              <p className="text-sm font-medium mb-2 text-foreground">
                Select Room
              </p>
              <Select
                value={selectedRoomId}
                onValueChange={(value) => {
                  onRoomChange?.(value);
                  // Clear schedule selection when room changes
                  if (onScheduleSelect) {
                    onScheduleSelect('');
                  }
                }}
                disabled={loadingRooms}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => {
                    const details: string[] = [];
                    if (room.roomType) details.push(`Type: ${room.roomType}`);
                    if (room.department) {
                      const deptName = typeof room.department === 'string' 
                        ? room.department 
                        : (room.department as any)?.departmentName || (room.department as any)?.departmentCode || 'N/A';
                      details.push(`Dept: ${deptName}`);
                    }
                    if (room.floor !== undefined && room.floor !== null) details.push(`Floor: ${room.floor}`);
                    if (room.status) details.push(`Status: ${room.status}`);
                    if (room.capacity) details.push(`Capacity: ${room.capacity}`);
                    
                    return (
                      <SelectPrimitive.Item
                        key={room.id}
                        value={room.id}
                        textValue={room.roomCode}
                        className="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-start gap-2 rounded-sm py-2 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      >
                        <span className="absolute right-2 top-2 flex size-3.5 items-center justify-center">
                          <SelectPrimitive.ItemIndicator>
                            <svg className="size-4" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                          </SelectPrimitive.ItemIndicator>
                        </span>
                        <div className="flex flex-col gap-1 flex-1 min-w-0 pr-2">
                        <SelectPrimitive.ItemText className="sr-only">
                          {room.roomCode}
                        </SelectPrimitive.ItemText>
                        <div className="min-w-0">
                          {details.length > 0 && (
                            <span className="text-xs text-foreground leading-relaxed font-normal">
                              {details.join(' • ')}
                            </span>
                          )}
                        </div>
                        </div>
                      </SelectPrimitive.Item>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Existing Schedules for Selected Room/Date */}
            {selectedDate && selectedRoomId && filteredSchedules.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 text-foreground">
                  Existing Schedules
                </p>
                <Select
                  value={schedule ? (schedule as RoomSchedule).schedule_id : ''}
                  onValueChange={(value) => onScheduleSelect?.(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an existing schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSchedules.map((s) => (
                      <SelectItem key={s.schedule_id} value={s.schedule_id}>
                        {s.shift_template?.shift_name ?? "No shift"} —{" "}
                        {s.actual_start_time ?? "--:--"} to {s.actual_end_time ?? "--:--"}
                        {s.employee && ` (${s.employee.firstName} ${s.employee.lastName})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Shift Template Selection (for new schedules) */}
            {selectedDate && selectedRoomId && !schedule && (
              <>
                <div>
                  <p className="text-sm font-medium mb-2 text-foreground">
                    Select Shift Template (Optional)
                  </p>
                  <Select
                    value={selectedShiftId || undefined}
                    onValueChange={onShiftChange}
                    disabled={loadingShiftTemplates}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a shift template (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {shiftTemplates.map((shift) => (
                        <SelectItem key={shift.shift_template_id} value={shift.shift_template_id}>
                          {shift.shift_name} ({shift.start_time} - {shift.end_time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Manual Time Entry */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium mb-2 text-foreground">
                      Start Time
                    </p>
                    <Input
                      type="time"
                      value={selectedStartTime}
                      onChange={(e) => onStartTimeChange?.(e.target.value)}
                      placeholder="HH:MM"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 text-foreground">
                      End Time
                    </p>
                    <Input
                      type="time"
                      value={selectedEndTime}
                      onChange={(e) => onEndTimeChange?.(e.target.value)}
                      placeholder="HH:MM"
                    />
                  </div>
                </div>
              </>
            )}
          </>
        ) : schedule ? (
          <div className="grid gap-2 rounded-md border border-border p-4 bg-muted/50 text-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-xs uppercase text-foreground">
                  Room
                </p>
                <p className="font-semibold">
                  {schedule.room?.roomCode ?? "Unassigned room"}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "uppercase",
                  statusBadgeClass(schedule.schedule_status)
                )}
              >
                {schedule.schedule_status}
              </Badge>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-xs uppercase text-foreground">
                  Shift
                </p>
                <p className="font-semibold">
                  {schedule.shift_template?.shift_name ?? "No shift template"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-foreground">
                  Time
                </p>
                <p className="font-semibold">
                  {schedule.actual_start_time ?? "--:--"} —{" "}
                  {schedule.actual_end_time ?? "--:--"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-foreground/70">
            Select a schedule on the left or choose a date and room above.
          </div>
        )}

        <div className="grid gap-3">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium mb-2 text-foreground">
                Filter by role
              </p>
              <Select
                value={roleFilter}
                onValueChange={onRoleFilterChange}
                disabled={loadingEmployees}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role ?? "unknown"}>
                      {formatRole(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-foreground">
                Filter by department
              </p>
              <Select
                value={departmentFilter}
                onValueChange={onDepartmentFilterChange}
                disabled={loadingEmployees}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departmentOptions.map((departmentId) => (
                    <SelectItem key={departmentId} value={departmentId ?? "unknown"}>
                      {departmentId ?? "Unknown dept."}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2 text-foreground">
              Search employees
            </p>
            <Input
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              disabled={loadingEmployees}
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-2 text-foreground">
              Matching employees ({employees.length})
            </p>
            {loadingEmployees && (
              <div className="flex items-center gap-2 text-xs text-foreground/80 mb-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading available employees...
              </div>
            )}
            <Select
              value={selectedEmployeeId}
              onValueChange={onSelectedEmployeeChange}
              disabled={loadingEmployees || employees.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} —{" "}
                    {formatRole(employee.role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {employees.length === 0 && (
              <Alert variant="destructive" className="mt-2">
                <AlertTitle>No employees available</AlertTitle>
                <AlertDescription>
                  Try widening your filters or pick a different role/department.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={
            submitting ||
            loadingEmployees ||
            !selectedEmployeeId ||
            employees.length === 0
          }
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Assigning...
            </>
          ) : (
            "Assign Employee"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

