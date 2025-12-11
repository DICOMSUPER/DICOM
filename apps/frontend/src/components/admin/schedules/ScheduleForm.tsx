"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  useCreateRoomScheduleMutation, 
  useUpdateRoomScheduleMutation 
} from "@/store/scheduleApi";
import { toast } from "sonner";
import { ROLE_OPTIONS } from "@/enums/role.enum";

// Schema validation
const scheduleSchema = z.object({
  employee_id: z.string().min(1, "Please select an employee"),
  work_date: z.string().min(1, "Please select a work date"),
  actual_start_time: z.string().optional(),
  actual_end_time: z.string().optional(),
  room_id: z.string().optional(),
  shift_template_id: z.string().optional(),
  schedule_status: z
    .enum(["scheduled", "in_progress", "completed", "cancelled"])
    .optional(),
  notes: z.string().optional(),
  overtime_hours: z.number().min(0).optional(),
}).refine(
  (data) => {
    // If both start time and end time exist, end time must be after start time
    if (data.actual_start_time && data.actual_end_time) {
      return data.actual_start_time < data.actual_end_time;
    }
    return true;
  },
  {
    message: "End time must be after start time",
    path: ["actual_end_time"],
  }
);

interface ScheduleFormProps {
  schedule?: any;
  users: any[];
  rooms: any[];
  shiftTemplates: any[];
  onSuccess: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ScheduleForm({
  schedule,
  users,
  rooms,
  shiftTemplates,
  onSuccess,
  onCancel,
  isLoading: usersLoading = false,
}: ScheduleFormProps) {
  const isEdit = !!schedule;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    schedule?.work_date ? new Date(schedule.work_date) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Debug users data
  console.log('ScheduleForm Users Debug:', {
    users,
    usersLength: users.length,
    firstUser: users[0],
    isEdit,
    schedule: schedule?.schedule_id,
    employee_id: schedule?.employee_id,
    usersStructure: users.map((u: any) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role
    }))
  });

  // Debug logging
  console.log('ScheduleForm Debug:', {
    users,
    usersLength: users.length,
    ROLE_OPTIONS
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      employee_id: schedule?.employee_id || "",
      work_date: schedule?.work_date || "",
      actual_start_time: schedule?.actual_start_time || "",
      actual_end_time: schedule?.actual_end_time || "",
      room_id: (schedule?.room_id && schedule.room_id !== "") ? schedule.room_id : "none",
      shift_template_id: (schedule?.shift_template_id && schedule.shift_template_id !== "") ? schedule.shift_template_id : "none",
      schedule_status: schedule?.schedule_status || "scheduled",
      notes: schedule?.notes || "",
      overtime_hours: schedule?.overtime_hours || 0,
    },
  });

  const [createSchedule, { isLoading: isCreating }] = useCreateRoomScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] = useUpdateRoomScheduleMutation();

  const selectedShiftTemplateId = watch("shift_template_id");
  const watchedWorkDate = watch("work_date");

  const workDateObj = watchedWorkDate ? new Date(watchedWorkDate) : undefined;
  if (workDateObj) {
    workDateObj.setHours(0, 0, 0, 0);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = workDateObj
    ? Math.ceil((workDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const canCancel =
    isEdit &&
    schedule?.schedule_status === "scheduled" &&
    diffDays >= 1;
  const isLocked =
    schedule?.schedule_status === "completed" ||
    schedule?.schedule_status === "cancelled";

  // Reset form when schedule prop changes (for edit mode)
  useEffect(() => {
    if (schedule) {
      reset({
        employee_id: schedule.employee_id || "",
        work_date: schedule.work_date || "",
        actual_start_time: schedule.actual_start_time || "",
        actual_end_time: schedule.actual_end_time || "",
        room_id: (schedule.room_id && schedule.room_id !== "") ? schedule.room_id : "none",
        shift_template_id: (schedule.shift_template_id && schedule.shift_template_id !== "") ? schedule.shift_template_id : "none",
        schedule_status: schedule.schedule_status || "scheduled",
        notes: schedule.notes || "",
        overtime_hours: schedule.overtime_hours || 0,
      });
    }
  }, [schedule, reset]);

  // Auto-fill times when shift template is selected
  useEffect(() => {
    if (selectedShiftTemplateId && selectedShiftTemplateId !== "none" && shiftTemplates.length > 0) {
      const template = shiftTemplates.find((t: any) => t.shift_template_id === selectedShiftTemplateId);
      if (template) {
        setValue("actual_start_time", template.start_time);
        setValue("actual_end_time", template.end_time);
      }
    }
  }, [selectedShiftTemplateId, shiftTemplates, setValue]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    // Block submits if schedule is locked
    if (isLocked) {
      toast.error("Completed or cancelled schedules cannot be edited.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Convert "none" and empty string values to undefined for optional fields
      // Add default values for optional fields
      const processedData = {
        ...data,
        room_id: (data.room_id === "none" || data.room_id === "") ? undefined : data.room_id,
        shift_template_id: (data.shift_template_id === "none" || data.shift_template_id === "") ? undefined : data.shift_template_id,
        // Enforce status rules: create always scheduled; edit only allowed transition scheduled -> cancelled
        schedule_status: isEdit
          ? data.schedule_status || schedule?.schedule_status || "scheduled"
          : "scheduled",
        overtime_hours: data.overtime_hours || 0,
      };

      console.log('Form submission debug:', {
        originalData: data,
        processedData,
        isEdit,
        scheduleId: schedule?.schedule_id
      });

      if (isEdit) {
        await updateSchedule({
          id: schedule.schedule_id,
          updates: processedData,
        }).unwrap();
        toast.success("Schedule updated successfully");
      } else {
        await createSchedule(processedData).unwrap();
        toast.success("Schedule created successfully");
      }
      onSuccess();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isCreating || isUpdating || isSubmitting;
  const isFormDisabled = isLoading || isLocked;

  // Show loading state if users data is not loaded yet
  if (users.length === 0 || usersLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-4 h-4" />
            </div>
            <p className="text-sm text-foreground">
              {usersLoading ? "Loading employees..." : "No employees found"}
            </p>
            {users.length === 0 && !usersLoading && (
              <p className="text-xs text-foreground mt-2">
                Please check if the users API is working correctly
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Employee Selection */}
      <div className="space-y-2">
        <Label htmlFor="employee_id">
          Employee <span className="text-red-500">*</span>
        </Label>
        <Select
          value={watch("employee_id")}
          onValueChange={(value) => setValue("employee_id", value)}
          disabled={isLoading}
        >
          <SelectTrigger id="employee_id" className="h-16 min-h-16">
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent className="border-border shadow-lg max-h-80">
            {users.map((user: any) => (
              <SelectItem 
                key={user.id} 
                value={user.id}
                className="py-4 px-4 cursor-pointer hover:bg-accent/50 focus:bg-accent min-h-16"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <span className="font-medium text-foreground">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground ml-8">
                    <span className="flex-1 min-w-0">{user.email}</span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs whitespace-nowrap">
                      {user.role?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || "N/A"}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.employee_id && (
          <p className="text-sm text-red-500">{errors.employee_id.message}</p>
        )}
      </div>

      {/* Work Date */}
      <div className="space-y-2">
        <Label htmlFor="work_date">
          Work Date <span className="text-red-500">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-foreground"
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "MM/dd/yyyy")
              ) : (
                <span>Select date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                if (date) {
                  setValue("work_date", format(date, "yyyy-MM-dd"));
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.work_date && (
          <p className="text-sm text-red-500">{errors.work_date.message}</p>
        )}
      </div>

      {/* Shift Template */}
      <div className="space-y-2">
        <Label htmlFor="shift_template_id">Shift</Label>
        <Select
          value={watch("shift_template_id")}
          onValueChange={(value) => setValue("shift_template_id", value)}
          disabled={isLoading}
        >
          <SelectTrigger id="shift_template_id">
            <SelectValue placeholder="Select shift" />
          </SelectTrigger>
          <SelectContent className="border-border">
            <SelectItem value="none">None</SelectItem>
            {shiftTemplates.map((template: any) => (
              <SelectItem key={template.shift_template_id} value={template.shift_template_id}>
                {template.shift_name} ({template.start_time} - {template.end_time})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time Range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="actual_start_time">Start Time</Label>
          <Input
            id="actual_start_time"
            type="time"
            {...register("actual_start_time")}
            disabled={isLoading}
          />
          {errors.actual_start_time && (
            <p className="text-sm text-red-500">{errors.actual_start_time.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="actual_end_time">End Time</Label>
          <Input
            id="actual_end_time"
            type="time"
            {...register("actual_end_time")}
            disabled={isLoading}
          />
          {errors.actual_end_time && (
            <p className="text-sm text-red-500">{errors.actual_end_time.message}</p>
          )}
        </div>
      </div>

      {/* Room Selection */}
      <div className="space-y-2">
        <Label htmlFor="room_id">Room</Label>
        <Select
          value={watch("room_id")}
          onValueChange={(value) => {
            console.log('Room selected:', { value, rooms: rooms.length, roomData: rooms.find(r => r.id === value) });
            setValue("room_id", value);
          }}
          disabled={isLoading}
        >
          <SelectTrigger id="room_id">
            <SelectValue placeholder="Select room" />
          </SelectTrigger>
          <SelectContent className="border-border">
            <SelectItem value="none">None</SelectItem>
            {rooms.map((room: any) => (
              <SelectItem key={room.id} value={room.id}>
                {room.roomCode} - {room.description || room.roomType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="schedule_status">
          Status <span className="text-red-500">*</span>
        </Label>
        <Select
          value={watch("schedule_status")}
          onValueChange={(value: any) => {
            if (!canCancel) return; // block forbidden transitions on the client
            setValue("schedule_status", value);
          }}
          disabled={isLoading || isLocked || !isEdit || !canCancel}
        >
          <SelectTrigger id="schedule_status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="border-border">
            <SelectItem value="scheduled" disabled>Scheduled (default)</SelectItem>
            {canCancel && (
              <SelectItem value="cancelled">
                Cancelled (only when scheduled & ≥1 day before)
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Overtime Hours */}
      <div className="space-y-2">
        <Label htmlFor="overtime_hours">Overtime Hours</Label>
        <Input
          id="overtime_hours"
          type="number"
          step="0.5"
          min="0"
          {...register("overtime_hours", { valueAsNumber: true })}
          disabled={isLoading}
        />
        {errors.overtime_hours && (
          <p className="text-sm text-red-500">{errors.overtime_hours.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Add notes about the schedule..."
          disabled={isLoading}
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEdit ? "Update" : "Create"}</>
          )}
        </Button>
      </div>
    </form>
  );
}

