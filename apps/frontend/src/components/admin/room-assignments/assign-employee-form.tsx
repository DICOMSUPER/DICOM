"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Loader2,
  CalendarIcon,
  Search,
  Users,
  Building2,
  UserCheck,
  Wifi,
  Tv,
  Droplets,
  Phone,
  Stethoscope,
  Thermometer,
  Bell,
  Monitor,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { Checkbox } from "@/components/ui/checkbox";

import {
  RoomSchedule,
  Employee,
  Room,
  ShiftTemplate,
} from "@/common/interfaces/schedule/schedule.interface";
import { ModalityMachine } from "@/common/interfaces/image-dicom/modality-machine.interface";
import { cn } from "@/common/lib/utils";
import { formatRole } from "@/common/utils/role-formatter";
import * as SelectPrimitive from "@radix-ui/react-select";
import { StepIndicator } from "@/components/ui/step-indicator";

// API imports
import {
  useGetAvailableEmployeesQuery,
  useGetRoomSchedulesQuery,
} from "@/store/roomScheduleApi";
import { useGetRoomsQuery } from "@/store/roomsApi";
import {
  useGetShiftTemplatesQuery,
  useCreateRoomScheduleMutation,
} from "@/store/scheduleApi";
import {
  useCreateEmployeeRoomAssignmentMutation,
  useBulkCreateEmployeeRoomAssignmentsMutation,
} from "@/store/employeeRoomAssignmentApi";
import { useGetModalitiesInRoomQuery } from "@/store/modalityMachineApi";
import { extractApiData } from "@/common/utils/api";
import { formatTimeRange } from "@/common/utils/schedule-helpers";
import { formatStatus } from "@/common/utils/format-status";

interface AssignEmployeeFormProps {
  initialScheduleId?: string;
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

export function AssignEmployeeForm({
  initialScheduleId,
}: AssignEmployeeFormProps) {
  const router = useRouter();

  // State
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
    initialScheduleId || ""
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };
  const [formDate, setFormDate] = useState<Date | undefined>(getTomorrow());
  const [formRoomId, setFormRoomId] = useState<string>("");
  const [formShiftId, setFormShiftId] = useState<string>("");
  const [formStartTime, setFormStartTime] = useState<string>("");
  const [formEndTime, setFormEndTime] = useState<string>("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [activeSearch, setActiveSearch] = useState("");
  const [activeRoleFilter, setActiveRoleFilter] = useState<string>("");
  const [activeDepartmentFilter, setActiveDepartmentFilter] =
    useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAssign, setConfirmAssign] = useState(false);

  const { data: allSchedulesData } = useGetRoomSchedulesQuery({});
  const schedules = allSchedulesData ?? [];

  const { data: roomsData, isLoading: loadingRooms } = useGetRoomsQuery({
    page: 1,
    limit: 1000,
  });
  const rooms = roomsData?.data ?? [];

  const { data: shiftTemplatesData, isLoading: loadingShiftTemplates } =
    useGetShiftTemplatesQuery({});
  const shiftTemplates: ShiftTemplate[] = Array.isArray(shiftTemplatesData)
    ? shiftTemplatesData
    : shiftTemplatesData?.data ?? [];

  const selectedSchedule = useMemo(
    () => schedules.find((s) => s.schedule_id === selectedScheduleId),
    [schedules, selectedScheduleId]
  );

  const selectedRoomId = useMemo(() => {
    if (selectedSchedule?.room?.id) return selectedSchedule.room.id;
    if (formRoomId) return formRoomId;
    return "";
  }, [selectedSchedule, formRoomId]);

  const { data: modalitiesData, isLoading: isLoadingModalities } =
    useGetModalitiesInRoomQuery(selectedRoomId, {
      skip: !selectedRoomId,
      refetchOnMountOrArgChange: true,
    });

  const modalities = useMemo(() => {
    if (!modalitiesData) return [];
    return extractApiData<ModalityMachine>(modalitiesData);
  }, [modalitiesData]);

  const employeeQueryDate = selectedSchedule?.work_date
    ? selectedSchedule.work_date
    : formDate
    ? format(formDate, "yyyy-MM-dd")
    : "";
  const employeeQueryStartTime = selectedSchedule?.actual_start_time?.trim()
    ? selectedSchedule.actual_start_time.trim()
    : formStartTime || undefined;
  const employeeQueryEndTime = selectedSchedule?.actual_end_time?.trim()
    ? selectedSchedule.actual_end_time.trim()
    : formEndTime || undefined;

  const {
    data: availableEmployeesData,
    isFetching: availableEmployeesLoading,
    refetch: refetchAvailableEmployees,
  } = useGetAvailableEmployeesQuery(
    {
      date: employeeQueryDate,
      startTime: employeeQueryStartTime,
      endTime: employeeQueryEndTime,
      search: activeSearch || undefined,
      role: activeRoleFilter || undefined,
      departmentId: activeDepartmentFilter || undefined,
    },
    {
      skip: !employeeQueryDate,
    }
  );

  const availableEmployees = useMemo(
    () => extractApiData<Employee>(availableEmployeesData),
    [availableEmployeesData]
  );

  const [createAssignment, { isLoading: isCreatingAssignment }] =
    useCreateEmployeeRoomAssignmentMutation();
  const [bulkCreateAssignments, { isLoading: isBulkCreating }] =
    useBulkCreateEmployeeRoomAssignmentsMutation();
  const [createSchedule, { isLoading: isCreatingSchedule }] =
    useCreateRoomScheduleMutation();

  useEffect(() => {
    if (selectedSchedule) {
      if (selectedSchedule.work_date) {
        const scheduleDate = new Date(selectedSchedule.work_date);
        if (
          !formDate ||
          scheduleDate.toDateString() !== formDate.toDateString()
        ) {
          setFormDate(scheduleDate);
        }
      }
      if (selectedSchedule.room_id && selectedSchedule.room_id !== formRoomId) {
        setFormRoomId(selectedSchedule.room_id);
      }
      if (
        selectedSchedule.shift_template_id &&
        selectedSchedule.shift_template_id !== formShiftId
      ) {
        setFormShiftId(selectedSchedule.shift_template_id);
      }
      if (
        selectedSchedule.actual_start_time &&
        selectedSchedule.actual_start_time !== formStartTime
      ) {
        setFormStartTime(selectedSchedule.actual_start_time);
      }
      if (
        selectedSchedule.actual_end_time &&
        selectedSchedule.actual_end_time !== formEndTime
      ) {
        setFormEndTime(selectedSchedule.actual_end_time);
      }
    }
  }, [selectedSchedule]);

  useEffect(() => {
    if (formShiftId && shiftTemplates.length > 0 && !selectedSchedule) {
      const selectedShift = shiftTemplates.find(
        (s) => s.shift_template_id === formShiftId
      );
      if (selectedShift) {
        setFormStartTime(selectedShift.start_time);
        setFormEndTime(selectedShift.end_time);
      }
    }
  }, [formShiftId, shiftTemplates, selectedSchedule]);

  const handleSearch = () => {
    setActiveSearch(employeeSearch);
    setActiveRoleFilter(roleFilter);
    setActiveDepartmentFilter(departmentFilter);
  };

  useEffect(() => {
    if (employeeQueryDate) {
      setActiveSearch(employeeSearch);
      setActiveRoleFilter(roleFilter);
      setActiveDepartmentFilter(departmentFilter);
    }
  }, [employeeQueryDate, employeeQueryStartTime, employeeQueryEndTime]);

  const handleSubmit = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (
      isSubmitting ||
      isCreatingAssignment ||
      isBulkCreating ||
      isCreatingSchedule
    )
      return;

    if (!selectedSchedule && (!formDate || !formRoomId)) {
      toast.error(
        "Please select a date and room, or select an existing schedule"
      );
      return;
    }

    const isBulk = selectedEmployeeIds.length > 1;
    const employeeId =
      selectedEmployeeIds.length === 1
        ? selectedEmployeeIds[0]
        : selectedEmployeeIds.length === 0
        ? selectedEmployeeId
        : null;
    const employeeCount =
      selectedEmployeeIds.length > 0
        ? selectedEmployeeIds.length
        : selectedEmployeeId
        ? 1
        : 0;

    if (employeeCount === 0 || (!isBulk && !employeeId)) {
      toast.warning("Please select at least one employee");
      return;
    }

    if (!confirmAssign) {
      toast.warning(
        "Please confirm the assignment by checking the confirmation box"
      );
      return;
    }

    if (!isDateValid) {
      toast.error(
        "Schedule must be created at least 1 day in advance. Cannot schedule for today or in the past."
      );
      return;
    }

    if (!selectedSchedule && !areTimesValid) {
      if (!formStartTime || !formEndTime) {
        toast.error(
          "Start time and end time are required when creating a new schedule"
        );
      } else {
        const errorMsg =
          getTimeValidationError || "End time must be after start time";
        toast.error(errorMsg);
      }
      return;
    }

    if (wouldExceedCapacity) {
      const baseOccupancy = selectedSchedule
        ? selectedSchedule.employeeRoomAssignments?.length || 0
        : currentOccupancy;
      toast.error(
        `Room capacity exceeded. Max capacity: ${
          selectedRoom?.capacity || "N/A"
        }, current: ${baseOccupancy}, trying to add: ${employeeCount}`
      );
      return;
    }

    setIsSubmitting(true);
    let targetSchedule = selectedSchedule;
    let scheduleCreated = false;

    if (!targetSchedule && formDate && formRoomId) {
      try {
        const selectedShift = formShiftId
          ? shiftTemplates.find((s) => s.shift_template_id === formShiftId)
          : null;
        const startTime = formStartTime || selectedShift?.start_time;
        const endTime = formEndTime || selectedShift?.end_time;

        if (!startTime || !endTime) {
          toast.error("Start time and end time are required");
          setIsSubmitting(false);
          return;
        }

        const scheduleResponse = await createSchedule({
          room_id: formRoomId,
          shift_template_id: formShiftId || undefined,
          work_date: format(formDate, "yyyy-MM-dd"),
          actual_start_time: startTime,
          actual_end_time: endTime,
          schedule_status: "scheduled" as const,
        }).unwrap();

        targetSchedule = scheduleResponse as RoomSchedule;
        if (!targetSchedule?.schedule_id) {
          toast.error(
            "Failed to create schedule: Invalid schedule ID returned"
          );
          setIsSubmitting(false);
          return;
        }
        setSelectedScheduleId(targetSchedule.schedule_id);
        scheduleCreated = true;
      } catch (error) {
        const apiError = error as {
          data?: { message?: string };
          message?: string;
        };
        toast.error(
          apiError?.data?.message ||
            apiError?.message ||
            "Failed to create schedule"
        );
        setIsSubmitting(false);
        return;
      }
    }

    if (!targetSchedule?.schedule_id) {
      toast.error("Please select or create a schedule");
      setIsSubmitting(false);
      return;
    }

    try {
      if (isBulk) {
        const result = await bulkCreateAssignments({
          roomScheduleId: targetSchedule.schedule_id,
          employeeIds: selectedEmployeeIds,
          isActive: true,
        }).unwrap();

        const resultData = result as {
          data?: { count?: number } | unknown[];
          count?: number;
        };
        const successCount =
          (typeof resultData?.data === "object" &&
          resultData.data !== null &&
          "count" in resultData.data
            ? (resultData.data as { count: number }).count
            : undefined) ??
          resultData?.count ??
          (Array.isArray(resultData?.data)
            ? resultData.data.length
            : selectedEmployeeIds.length);
        toast.success(`Successfully assigned ${successCount} employee(s)`);
        setSelectedEmployeeIds([]);
        setSelectedEmployeeId("");
      } else {
        await createAssignment({
          roomScheduleId: targetSchedule.schedule_id,
          employeeId: employeeId!,
          isActive: true,
        }).unwrap();

        toast.success("Employee assigned successfully");
        setSelectedEmployeeIds([]);
        setSelectedEmployeeId("");
        setConfirmAssign(false);
      }

      if (scheduleCreated) {
        setFormDate(getTomorrow());
        setFormRoomId("");
        setFormShiftId("");
        setFormStartTime("");
        setFormEndTime("");
        setSelectedScheduleId("");
      }

      await refetchAvailableEmployees();

      await new Promise((resolve) => setTimeout(resolve, 100));

      router.push("/admin/room-assignments");
    } catch (error) {
      const errorMsg = isBulk
        ? "Failed to assign employees"
        : "Failed to assign employee";
      const apiError = error as {
        data?: { message?: string };
        message?: string;
      };
      toast.error(apiError?.data?.message || apiError?.message || errorMsg);
      if (scheduleCreated) {
        toast.warning(
          "Schedule was created but assignment failed. You may need to delete the schedule if you want to try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSchedules =
    formDate && formRoomId
      ? schedules.filter((s) => {
          const scheduleDate = s.work_date
            ? new Date(s.work_date).toDateString()
            : null;
          const selectedDateStr = formDate.toDateString();
          return scheduleDate === selectedDateStr && s.room_id === formRoomId;
        })
      : [];

  const selectedRoom = useMemo(() => {
    if (selectedSchedule?.room) return selectedSchedule.room;
    if (formRoomId) return rooms.find((r) => r.id === formRoomId);
    return undefined;
  }, [selectedSchedule, formRoomId, rooms]);

  const currentOccupancy = useMemo(() => {
    if (!selectedRoom || !formDate) return 0;
    const roomSchedules = schedules.filter(
      (s) =>
        s.room_id === selectedRoom.id &&
        s.work_date &&
        new Date(s.work_date).toDateString() === formDate.toDateString()
    );
    return roomSchedules.reduce((count, schedule) => {
      return count + (schedule.employeeRoomAssignments?.length || 0);
    }, 0);
  }, [selectedRoom, formDate, schedules]);

  const wouldExceedCapacity = useMemo(() => {
    if (!selectedRoom?.capacity) return false;
    const newAssignments =
      selectedEmployeeIds.length > 0
        ? selectedEmployeeIds.length
        : selectedEmployeeId
        ? 1
        : 0;
    const targetScheduleOccupancy = selectedSchedule
      ? selectedSchedule.employeeRoomAssignments?.length || 0
      : 0;
    const baseOccupancy = selectedSchedule
      ? targetScheduleOccupancy
      : currentOccupancy;
    return baseOccupancy + newAssignments > selectedRoom.capacity;
  }, [
    selectedRoom,
    currentOccupancy,
    selectedEmployeeId,
    selectedEmployeeIds,
    selectedSchedule,
  ]);

  const isAtCapacity = useMemo(() => {
    if (!selectedRoom?.capacity) return false;
    const targetScheduleOccupancy = selectedSchedule
      ? selectedSchedule.employeeRoomAssignments?.length || 0
      : 0;
    const baseOccupancy = selectedSchedule
      ? targetScheduleOccupancy
      : currentOccupancy;
    return baseOccupancy >= selectedRoom.capacity;
  }, [selectedRoom, currentOccupancy, selectedSchedule]);

  const roomEquipment = useMemo(() => {
    if (!selectedRoom) return [];
    const equipment: Array<{ name: string; icon: React.ReactNode }> = [];
    if (selectedRoom.hasTV)
      equipment.push({ name: "TV", icon: <Tv className="h-3 w-3" /> });
    if (selectedRoom.hasAirConditioning)
      equipment.push({
        name: "Air Conditioning",
        icon: <Thermometer className="h-3 w-3" />,
      });
    if (selectedRoom.hasWiFi)
      equipment.push({ name: "WiFi", icon: <Wifi className="h-3 w-3" /> });
    if (selectedRoom.hasTelephone)
      equipment.push({
        name: "Telephone",
        icon: <Phone className="h-3 w-3" />,
      });
    if (selectedRoom.hasAttachedBathroom)
      equipment.push({
        name: "Attached Bathroom",
        icon: <Droplets className="h-3 w-3" />,
      });
    if (selectedRoom.isWheelchairAccessible)
      equipment.push({
        name: "Wheelchair Accessible",
        icon: <Users className="h-3 w-3" />,
      });
    if (selectedRoom.hasOxygenSupply)
      equipment.push({
        name: "Oxygen Supply",
        icon: <Stethoscope className="h-3 w-3" />,
      });
    if (selectedRoom.hasNurseCallButton)
      equipment.push({
        name: "Nurse Call Button",
        icon: <Bell className="h-3 w-3" />,
      });
    return equipment;
  }, [selectedRoom]);

  const roomServices = useMemo(() => {
    if (!selectedRoom?.serviceRooms) return [];
    return selectedRoom.serviceRooms
      .filter((sr) => sr.isActive && sr.service)
      .map(
        (sr) =>
          sr.service?.serviceName ||
          sr.service?.serviceCode ||
          "Unknown Service"
      );
  }, [selectedRoom]);

  const roleOptions = useMemo(() => {
    return Array.from(
      new Set(availableEmployees.map((e) => e.role).filter(Boolean))
    ) as string[];
  }, [availableEmployees]);

  const departmentOptions = useMemo(() => {
    const deptMap = new Map<string, { id: string; name: string }>();
    availableEmployees.forEach((employee) => {
      if (employee.departmentId) {
        let deptName = employee.departmentId;
        if (employee.department) {
          if (typeof employee.department === "string") {
            deptName = employee.department;
          } else {
            deptName =
              employee.department.departmentName ||
              employee.department.departmentCode ||
              employee.departmentId;
          }
        }
        deptMap.set(employee.departmentId, {
          id: employee.departmentId,
          name: deptName,
        });
      }
    });
    return Array.from(deptMap.values());
  }, [availableEmployees]);

  const employeeColumns = useMemo(
    () => [
      {
        header: "Select",
        cell: (employee: Employee) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                selectedEmployeeIds.includes(employee.id) ||
                selectedEmployeeId === employee.id
              }
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedEmployeeIds([...selectedEmployeeIds, employee.id]);
                  setSelectedEmployeeId(employee.id);
                } else {
                  setSelectedEmployeeIds(
                    selectedEmployeeIds.filter((id) => id !== employee.id)
                  );
                  if (selectedEmployeeId === employee.id) {
                    setSelectedEmployeeId("");
                  }
                }
              }}
            />
          </div>
        ),
        className: "w-12 text-center",
        headerClassName: "text-center",
      },
      {
        header: "Name",
        cell: (employee: Employee) => (
          <Link
            href={`/admin/profile/${employee.id}`}
            onClick={(e) => e.stopPropagation()}
            className="block transition-all hover:text-primary group"
          >
            <div className="font-medium group-hover:underline">
              {employee.firstName} {employee.lastName}
            </div>
            {employee.email && (
              <div className="text-sm text-foreground">{employee.email}</div>
            )}
          </Link>
        ),
      },
      {
        header: "Role",
        cell: (employee: Employee) => (
          <Badge variant="outline">{formatRole(employee.role)}</Badge>
        ),
      },
      {
        header: "Department",
        cell: (employee: Employee) => {
          let departmentDisplay = "—";
          if (employee.department) {
            if (typeof employee.department === "string") {
              departmentDisplay = employee.department;
            } else {
              departmentDisplay =
                employee.department.departmentName ||
                employee.department.departmentCode ||
                employee.departmentId ||
                "—";
            }
          } else if (employee.departmentId) {
            departmentDisplay = employee.departmentId;
          }
          return <span className="text-sm">{departmentDisplay}</span>;
        },
      },
    ],
    [selectedEmployeeId, selectedEmployeeIds]
  );

  const isDateValid = useMemo(() => {
    if (selectedSchedule?.work_date) return true;
    if (!formDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduleDate = new Date(formDate);
    scheduleDate.setHours(0, 0, 0, 0);

    const diffTime = scheduleDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 1;
  }, [formDate, selectedSchedule]);

  // Helper function to parse time string to minutes
  const parseTime = (timeStr: string) => {
    const parts = timeStr.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1] || "0");
  };

  const areTimesValid = useMemo(() => {
    if (selectedSchedule) return true;

    if (formShiftId) return true;

    if (!formStartTime || !formEndTime) return false;

    const startMinutes = parseTime(formStartTime);
    const endMinutes = parseTime(formEndTime);

    // End time must be after start time
    return endMinutes > startMinutes;
  }, [formStartTime, formEndTime, formShiftId, selectedSchedule]);

  // Get time validation error message
  const getTimeValidationError = useMemo(() => {
    if (!formStartTime || !formEndTime) return null;
    if (formShiftId) return null;

    const startMinutes = parseTime(formStartTime);
    const endMinutes = parseTime(formEndTime);

    if (endMinutes <= startMinutes) {
      return "End time must be after start time";
    }
    return null;
  }, [formStartTime, formEndTime, formShiftId]);

  const hasDate = !!(selectedSchedule?.work_date || formDate);
  const hasRoom = !!(selectedSchedule?.room_id || formRoomId);
  const hasTimes = selectedSchedule
    ? true
    : formShiftId
    ? true
    : !!(formStartTime && formEndTime);
  const hasSelectedEmployee = !!(
    selectedEmployeeId || selectedEmployeeIds.length > 0
  );
  const submitting =
    isSubmitting ||
    isCreatingAssignment ||
    isBulkCreating ||
    isCreatingSchedule;

  return (
    <Card className="border border-border overflow-auto">
      <CardHeader>
        <CardTitle className="text-xl">Assign Employee</CardTitle>
        <p className="text-sm text-foreground">
          {selectedSchedule
            ? `Add another team member to ${
                selectedSchedule.room?.roomCode ?? "a room"
              } on ${formatDate(selectedSchedule.work_date)}.`
            : "Select a room and date to assign an employee."}
        </p>
      </CardHeader>
      <CardContent className="space-y-5 relative">
        {/* Step indicator */}
        <StepIndicator
          steps={[
            { completed: hasDate && isDateValid, label: "Date" },
            { completed: hasRoom, label: "Room" },
            { completed: hasTimes && areTimesValid, label: "Time" },
            { completed: hasSelectedEmployee, label: "Employee" },
          ]}
        />
        {/* Show selected schedule info if available */}
        {selectedSchedule && (
          <div className="grid gap-2 rounded-md border border-border p-4 bg-muted/50 text-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-xs uppercase text-foreground">
                  Selected Schedule
                </p>
                <p className="font-semibold">
                  {selectedSchedule.room?.roomCode ?? "Unassigned room"} —{" "}
                  {formatDate(selectedSchedule.work_date)}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "uppercase",
                  statusBadgeClass(selectedSchedule.schedule_status)
                )}
              >
                {selectedSchedule.schedule_status}
              </Badge>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-xs uppercase text-foreground">Shift</p>
                <p className="font-semibold">
                  {selectedSchedule.shift_template?.shift_name ??
                    "No shift template"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-foreground">Time</p>
                <p className="font-semibold">
                  {selectedSchedule.actual_start_time ?? "--:--"} —{" "}
                  {selectedSchedule.actual_end_time ?? "--:--"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Date Selection */}
        <div>
          <label className="text-sm font-medium mb-2 text-foreground flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
              1
            </span>
            Select Date
          </label>
          {formDate && !isDateValid && (
            <p className="text-xs text-red-600 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>
                Schedule must be created at least 1 day in advance. Cannot
                schedule for today or in the past.
              </span>
            </p>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formDate && "text-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formDate ? format(formDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={formDate}
                onSelect={(date) => {
                  setFormDate(date);
                  if (date) {
                    setSelectedScheduleId("");
                  }
                }}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const checkDate = new Date(date);
                  checkDate.setHours(0, 0, 0, 0);
                  return checkDate <= today;
                }}
                fromYear={new Date().getFullYear()}
                toYear={new Date().getFullYear() + 1}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Room Selection */}
        <div>
          <label className="text-sm font-medium mb-2 text-foreground flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
              2
            </span>
            Select Room
          </label>
          <Select
            value={formRoomId}
            onValueChange={(value) => {
              setFormRoomId(value);
              setSelectedScheduleId("");
            }}
            disabled={loadingRooms}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => {
                const roomOccupancy = formDate
                  ? schedules
                      .filter(
                        (s) =>
                          s.room_id === room.id &&
                          s.work_date &&
                          new Date(s.work_date).toDateString() ===
                            formDate.toDateString()
                      )
                      .reduce(
                        (count, schedule) =>
                          count +
                          (schedule.employeeRoomAssignments?.length || 0),
                        0
                      )
                  : 0;

                const isRoomAtCapacity = room.capacity
                  ? roomOccupancy >= room.capacity
                  : false;
                const isRoomOverCapacity = room.capacity
                  ? roomOccupancy > room.capacity
                  : false;

                const details: string[] = [];
                if (room.roomType) details.push(`Type: ${room.roomType}`);
                if (room.department) {
                  const deptName =
                    typeof room.department === "string"
                      ? room.department
                      : room.department.departmentName ||
                        room.department.departmentCode ||
                        "N/A";
                  details.push(`Dept: ${deptName}`);
                }
                if (room.floor !== undefined && room.floor !== null)
                  details.push(`Floor: ${room.floor}`);
                if (room.capacity) {
                  details.push(
                    `Capacity: ${roomOccupancy}/${room.capacity}${
                      isRoomAtCapacity ? " (FULL)" : ""
                    }${isRoomOverCapacity ? " (OVER)" : ""}`
                  );
                }
                if (room.serviceRooms && room.serviceRooms.length > 0) {
                  const activeServices = room.serviceRooms.filter(
                    (sr) => sr.isActive && sr.service
                  ).length;
                  if (activeServices > 0) {
                    details.push(`Services: ${activeServices}`);
                  }
                }

                return (
                  <SelectPrimitive.Item
                    key={room.id}
                    value={room.id}
                    textValue={room.roomCode}
                    disabled={isRoomAtCapacity || isRoomOverCapacity}
                    className={cn(
                      "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-start gap-2 rounded-sm py-2 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                      (isRoomAtCapacity || isRoomOverCapacity) && "opacity-60",
                      isRoomOverCapacity && "bg-red-50"
                    )}
                  >
                    <span className="absolute right-2 top-2 flex size-3.5 items-center justify-center">
                      <SelectPrimitive.ItemIndicator>
                        <svg
                          className="size-4"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
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
                            {details.join(" • ")}
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

        {/* Room Details Card */}
        {selectedRoom && (
          <Card
            className={cn(
              "border-border bg-muted/30",
              isAtCapacity && "border-amber-500 bg-amber-50/50",
              wouldExceedCapacity && "border-red-500 bg-red-50/50"
            )}
          >
            <CardHeader>
              <CardTitle
                className={cn(
                  "text-base flex items-center gap-2",
                  isAtCapacity && "text-amber-700",
                  wouldExceedCapacity && "text-red-700"
                )}
              >
                <Building2 className="h-4 w-4" />
                Room Details: {selectedRoom.roomCode}
                {isAtCapacity && (
                  <Badge
                    variant="outline"
                    className="ml-auto border-amber-500 text-amber-700"
                  >
                    At Capacity
                  </Badge>
                )}
                {wouldExceedCapacity && (
                  <Badge
                    variant="outline"
                    className="ml-auto border-red-500 text-red-700"
                  >
                    Capacity Exceeded
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Capacity & Occupancy */}
                <div className="space-y-1">
                  <p className="text-xs text-foreground font-medium">
                    Capacity
                  </p>
                  <p
                    className={cn(
                      "text-sm font-semibold flex items-center gap-1",
                      isAtCapacity && "text-amber-700",
                      wouldExceedCapacity && "text-red-700"
                    )}
                  >
                    <Users
                      className={cn(
                        "h-4 w-4",
                        isAtCapacity && "text-amber-600",
                        wouldExceedCapacity && "text-red-600",
                        !isAtCapacity && !wouldExceedCapacity && "text-primary"
                      )}
                    />
                    {selectedSchedule
                      ? selectedSchedule.employeeRoomAssignments?.length || 0
                      : currentOccupancy}{" "}
                    / {selectedRoom.capacity || "N/A"}
                    {selectedEmployeeIds.length > 0 && (
                      <span className="text-xs text-foreground">
                        (+{selectedEmployeeIds.length} selected)
                      </span>
                    )}
                    {selectedEmployeeId && selectedEmployeeIds.length === 0 && (
                      <span className="text-xs text-foreground">
                        (+1 selected)
                      </span>
                    )}
                  </p>
                  {selectedRoom.capacity &&
                    (() => {
                      const baseOccupancy = selectedSchedule
                        ? selectedSchedule.employeeRoomAssignments?.length || 0
                        : currentOccupancy;
                      const newAssignments =
                        selectedEmployeeIds.length > 0
                          ? selectedEmployeeIds.length
                          : selectedEmployeeId
                          ? 1
                          : 0;
                      const totalOccupancy = baseOccupancy + newAssignments;
                      const percentage = Math.min(
                        (totalOccupancy / selectedRoom.capacity) * 100,
                        100
                      );

                      return (
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
                              wouldExceedCapacity && "bg-red-500",
                              isAtCapacity && "bg-amber-500",
                              !isAtCapacity &&
                                !wouldExceedCapacity &&
                                "bg-primary"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      );
                    })()}
                  {wouldExceedCapacity && (
                    <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1.5">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span>Cannot assign: would exceed capacity</span>
                    </p>
                  )}
                  {isAtCapacity && !wouldExceedCapacity && (
                    <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1.5">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span>Room is at full capacity</span>
                    </p>
                  )}
                </div>

                {/* Room Type */}
                {selectedRoom.roomType && (
                  <div className="space-y-1">
                    <p className="text-xs text-foreground font-medium">Type</p>
                    <p className="text-sm font-semibold">
                      {selectedRoom.roomType}
                    </p>
                  </div>
                )}

                {/* Department */}
                {selectedRoom.department && (
                  <div className="space-y-1">
                    <p className="text-xs text-foreground font-medium">
                      Department
                    </p>
                    <p className="text-sm font-semibold">
                      {typeof selectedRoom.department === "string"
                        ? selectedRoom.department
                        : selectedRoom.department.departmentName ||
                          selectedRoom.department.departmentCode ||
                          "N/A"}
                    </p>
                  </div>
                )}

                {/* Floor */}
                {selectedRoom.floor !== undefined &&
                  selectedRoom.floor !== null && (
                    <div className="space-y-1">
                      <p className="text-xs text-foreground font-medium">
                        Floor
                      </p>
                      <p className="text-sm font-semibold">
                        {selectedRoom.floor}
                      </p>
                    </div>
                  )}

                {/* Status */}
                {selectedRoom.status && (
                  <div className="space-y-1">
                    <p className="text-xs text-foreground font-medium">
                      Status
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {formatStatus(selectedRoom.status)}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Services */}
              {roomServices.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground font-medium">
                    Available Services
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {roomServices.map((service, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs text-white"
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment */}
              {roomEquipment.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground font-medium">
                    Equipment & Amenities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {roomEquipment.map((eq, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs flex items-center gap-1"
                      >
                        {eq.icon}
                        {eq.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Modalities */}
              {isLoadingModalities ? (
                <div className="space-y-2">
                  <p className="text-xs text-foreground font-medium">
                    Modalities
                  </p>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-foreground" />
                    <span className="text-xs text-foreground">
                      Loading modalities...
                    </span>
                  </div>
                </div>
              ) : modalities.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-foreground font-medium">
                    Available Modalities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {modalities.map((modality) => (
                      <Badge
                        key={modality.id}
                        variant="outline"
                        className="text-xs flex items-center gap-1"
                      >
                        <Monitor className="h-3 w-3" />
                        {modality.name}
                        {modality.modality && (
                          <span className="text-[10px] text-foreground">
                            (
                            {modality.modality.modalityCode ||
                              modality.modality.modalityName}
                            )
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-foreground font-medium">
                    Modalities
                  </p>
                  <p className="text-xs text-foreground/70 italic">
                    No modality machines available in this room
                  </p>
                </div>
              )}

              {/* Description */}
              {selectedRoom.description && (
                <div className="space-y-1">
                  <p className="text-xs text-foreground font-medium">
                    Description
                  </p>
                  <p className="text-sm text-foreground">
                    {selectedRoom.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Existing Schedules for Selected Room/Date */}
        {formDate && formRoomId && filteredSchedules.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 text-foreground block">
              Use Existing Schedule (Optional)
            </label>
            <p className="text-xs text-foreground mb-2">
              If there's already a schedule for this room and date, select it to
              add more employees to it. Otherwise, leave as "Create new" to
              create a new schedule.
            </p>
            <Select
              value={selectedScheduleId || "__none__"}
              onValueChange={(value) => {
                const scheduleId = value === "__none__" ? "" : value;
                setSelectedScheduleId(scheduleId);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an existing schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Create new schedule</SelectItem>
                {filteredSchedules.map((s) => (
                  <SelectItem key={s.schedule_id} value={s.schedule_id}>
                    {s.shift_template?.shift_name ?? "No shift"} —{" "}
                    {formatTimeRange(
                      s.actual_start_time,
                      s.actual_end_time,
                      " to "
                    )}
                    {s.employeeRoomAssignments &&
                      s.employeeRoomAssignments.length > 0 &&
                      ` (${s.employeeRoomAssignments.length} employee${
                        s.employeeRoomAssignments.length > 1 ? "s" : ""
                      } assigned)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Shift Template Selection (for new schedules) */}
        {formDate && formRoomId && !selectedSchedule && (
          <>
            <div>
              <label className="text-sm font-medium mb-2 text-foreground block">
                Shift Template (Optional)
              </label>
              <p className="text-xs text-foreground mb-2">
                Select a shift template to automatically fill start and end
                times.
              </p>
              <Select
                value={formShiftId || "__none__"}
                onValueChange={(value) => {
                  setFormShiftId(value === "__none__" ? "" : value);
                }}
                disabled={loadingShiftTemplates}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a shift template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    None (set times manually)
                  </SelectItem>
                  {shiftTemplates.map((shift) => (
                    <SelectItem
                      key={shift.shift_template_id}
                      value={shift.shift_template_id}
                    >
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
                  Start Time{" "}
                  {!formShiftId && <span className="text-red-600">*</span>}
                </p>
                <TimePicker
                  value={formStartTime}
                  onChange={(value) => setFormStartTime(value)}
                  placeholder="HH:MM"
                  disabled={!!formShiftId}
                  error={
                    (!areTimesValid || getTimeValidationError) &&
                    !formShiftId &&
                    formStartTime
                      ? true
                      : false
                  }
                />
                {getTimeValidationError && !formShiftId && (
                  <p className="text-xs text-red-600 mt-1">
                    {getTimeValidationError}
                  </p>
                )}
                {!areTimesValid &&
                  !formShiftId &&
                  (!formStartTime || !formEndTime) &&
                  !getTimeValidationError && (
                    <p className="text-xs text-red-600 mt-1">
                      Both start and end times are required
                    </p>
                  )}
              </div>
              <div>
                <p className="text-sm font-medium mb-2 text-foreground">
                  End Time{" "}
                  {!formShiftId && <span className="text-red-600">*</span>}
                </p>
                <TimePicker
                  value={formEndTime}
                  onChange={(value) => setFormEndTime(value)}
                  placeholder="HH:MM"
                  disabled={!!formShiftId}
                  error={
                    (!areTimesValid || getTimeValidationError) &&
                    !formShiftId &&
                    formEndTime
                      ? true
                      : false
                  }
                />
                {getTimeValidationError && !formShiftId && (
                  <p className="text-xs text-red-600 mt-1">
                    {getTimeValidationError}
                  </p>
                )}
                {!areTimesValid &&
                  !formShiftId &&
                  (!formStartTime || !formEndTime) &&
                  !getTimeValidationError && (
                    <p className="text-xs text-red-600 mt-1">
                      Both start and end times are required
                    </p>
                  )}
              </div>
            </div>
          </>
        )}

        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium mb-3 text-foreground flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                3
              </span>
              Available employees ({availableEmployees.length})
            </label>

            {/* Search and Filter Controls */}
            <div className="grid gap-3 mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    className="pl-9"
                    disabled={availableEmployeesLoading}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={availableEmployeesLoading}
                  type="button"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <div>
                  <Select
                    value={roleFilter || "all"}
                    onValueChange={(value) =>
                      setRoleFilter(value === "all" ? "" : value)
                    }
                    disabled={availableEmployeesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>
                          {formatRole(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={departmentFilter || "all"}
                    onValueChange={(value) =>
                      setDepartmentFilter(value === "all" ? "" : value)
                    }
                    disabled={availableEmployeesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      {departmentOptions.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Employee Data Table */}
            <DataTable
              columns={employeeColumns}
              data={availableEmployees}
              isLoading={availableEmployeesLoading}
              emptyStateIcon={<Users className="h-8 w-8 text-foreground" />}
              emptyStateTitle="No employees available"
              emptyStateDescription={
                employeeSearch || roleFilter || departmentFilter
                  ? "No employees match your search criteria. Try adjusting your filters."
                  : "No employees are available for the selected date and time."
              }
              rowKey={(employee) => employee.id}
              rowClassName={(employee) => {
                const isSelected =
                  selectedEmployeeIds.includes(employee.id) ||
                  selectedEmployeeId === employee.id;
                return isSelected
                  ? "bg-primary/10 hover:bg-primary/15 border-l-2 border-l-primary"
                  : undefined;
              }}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50 border border-border">
            <Checkbox
              id="confirm-assign"
              checked={confirmAssign}
              onCheckedChange={(checked) => setConfirmAssign(checked === true)}
              className="mt-0.5"
            />
            <label
              htmlFor="confirm-assign"
              className="text-sm font-medium leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I confirm that I want to assign the selected employee(s) to this
              schedule
            </label>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={
              submitting ||
              availableEmployeesLoading ||
              (!selectedEmployeeId && selectedEmployeeIds.length === 0) ||
              availableEmployees.length === 0 ||
              wouldExceedCapacity ||
              !confirmAssign
            }
            variant={
              (selectedEmployeeId || selectedEmployeeIds.length > 0) &&
              !wouldExceedCapacity
                ? "default"
                : "outline"
            }
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : selectedEmployeeIds.length > 0 ? (
              `Assign ${selectedEmployeeIds.length} Employee${
                selectedEmployeeIds.length > 1 ? "s" : ""
              }`
            ) : selectedEmployeeId ? (
              "Assign Employee"
            ) : (
              "Assign"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
