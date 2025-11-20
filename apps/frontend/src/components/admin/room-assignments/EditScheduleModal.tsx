"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, Clock, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RoomSchedule, ShiftTemplate } from "@/interfaces/schedule/schedule.interface";
import { useUpdateRoomScheduleMutation, useGetRoomSchedulesQuery } from "@/store/roomScheduleApi";
import { useGetShiftTemplatesQuery } from "@/store/scheduleApi";
import { cn } from "@/lib/utils";
import { extractApiData } from "@/utils/api";

interface EditScheduleModalProps {
  schedule: RoomSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditScheduleModal({
  schedule,
  isOpen,
  onClose,
  onUpdated,
}: EditScheduleModalProps) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [shiftTemplateId, setShiftTemplateId] = useState<string>("");
  const [useTemplate, setUseTemplate] = useState(true);
  const [confirmEdit, setConfirmEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: shiftTemplatesData } = useGetShiftTemplatesQuery({});
  const shiftTemplates = extractApiData<ShiftTemplate>(shiftTemplatesData);
  const [updateSchedule] = useUpdateRoomScheduleMutation();
  const { data: allSchedules = [] } = useGetRoomSchedulesQuery({});

  useEffect(() => {
    if (schedule && isOpen) {
      setStartTime(schedule.actual_start_time || "");
      setEndTime(schedule.actual_end_time || "");
      setShiftTemplateId(schedule.shift_template_id || "");
      setUseTemplate(!!schedule.shift_template_id);
      setConfirmEdit(false);
      setIsSubmitting(false);
    }
  }, [schedule, isOpen]);

  useEffect(() => {
    if (useTemplate && shiftTemplateId) {
      const selectedTemplate = shiftTemplates.find(
        (t) => t.shift_template_id === shiftTemplateId
      );
      if (selectedTemplate) {
        setStartTime(selectedTemplate.start_time);
        setEndTime(selectedTemplate.end_time);
      }
    }
  }, [shiftTemplateId, useTemplate, shiftTemplates]);

  const isDateInAdvance = useMemo(() => {
    if (!schedule?.work_date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduleDate = new Date(schedule.work_date);
    scheduleDate.setHours(0, 0, 0, 0);
    const diffTime = scheduleDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 1;
  }, [schedule]);

  const hasConflict = useMemo(() => {
    if (!schedule || !isDateInAdvance) return false;
    if (useTemplate && (!shiftTemplateId || shiftTemplateId === "__none__")) return false;
    if (!useTemplate && (!startTime || !endTime)) return false;

    let scheduleStart: string;
    let scheduleEnd: string;

    if (useTemplate && shiftTemplateId && shiftTemplateId !== "__none__") {
      const selectedTemplate = shiftTemplates.find((t) => t.shift_template_id === shiftTemplateId);
      if (!selectedTemplate) return false;
      scheduleStart = selectedTemplate.start_time;
      scheduleEnd = selectedTemplate.end_time;
    } else {
      if (!startTime || !endTime) return false;
      scheduleStart = startTime;
      scheduleEnd = endTime;
    }

    const otherSchedules = allSchedules.filter(
      (s) =>
        s.schedule_id !== schedule.schedule_id &&
        s.room_id === schedule.room_id &&
        s.work_date === schedule.work_date
    );

    for (const otherSchedule of otherSchedules) {
      if (!otherSchedule.actual_start_time || !otherSchedule.actual_end_time) continue;

      const otherStart = otherSchedule.actual_start_time;
      const otherEnd = otherSchedule.actual_end_time;

      if (
        (scheduleStart >= otherStart && scheduleStart < otherEnd) ||
        (scheduleEnd > otherStart && scheduleEnd <= otherEnd) ||
        (scheduleStart <= otherStart && scheduleEnd >= otherEnd)
      ) {
        return true;
      }
    }

    return false;
  }, [schedule, allSchedules, startTime, endTime, shiftTemplateId, useTemplate, shiftTemplates, isDateInAdvance]);

  const areTimesValid = useMemo(() => {
    if (useTemplate && shiftTemplateId && shiftTemplateId !== "__none__") return true;
    if (!useTemplate && (!startTime || !endTime)) return false;
    if (!useTemplate && startTime && endTime) return startTime !== endTime;
    return false;
  }, [useTemplate, shiftTemplateId, startTime, endTime]);

  const handleSubmit = async () => {
    if (!schedule) return;

    if (!isDateInAdvance) {
      toast.error("Cannot edit schedules for today or in the past. Only future schedules can be edited.");
      return;
    }

    if (!confirmEdit) {
      toast.warning("Please confirm the edit by checking the confirmation box");
      return;
    }

    if (!areTimesValid) {
      toast.error(
        useTemplate && !shiftTemplateId
          ? "Please select a shift template or switch to manual time entry"
          : "Start time and end time cannot be the same"
      );
      return;
    }

    if (hasConflict) {
      toast.error("This schedule conflicts with another schedule for the same room and date");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: any = {};

      if (useTemplate && shiftTemplateId && shiftTemplateId !== "__none__") {
        const selectedTemplate = shiftTemplates.find(
          (t) => t.shift_template_id === shiftTemplateId
        );
        if (selectedTemplate) {
          updateData.shift_template_id = shiftTemplateId;
          updateData.actual_start_time = selectedTemplate.start_time;
          updateData.actual_end_time = selectedTemplate.end_time;
        }
      } else {
        updateData.shift_template_id = null;
        updateData.actual_start_time = startTime;
        updateData.actual_end_time = endTime;
      }

      await updateSchedule({
        id: schedule.schedule_id,
        data: updateData,
      }).unwrap();

      toast.success("Schedule updated successfully");
      onUpdated?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Failed to update schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!schedule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Schedule</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!isDateInAdvance && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <p className="font-medium">⚠️ Cannot edit this schedule</p>
              <p className="mt-1">
                Only schedules scheduled at least 1 day in advance can be edited.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Use Shift Template</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="use-template"
                  checked={useTemplate}
                  onCheckedChange={(checked) => {
                    setUseTemplate(checked === true);
                    if (checked === false) {
                      setShiftTemplateId("");
                    }
                  }}
                  disabled={!isDateInAdvance}
                />
                <label
                  htmlFor="use-template"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use shift template
                </label>
              </div>
            </div>

            {useTemplate ? (
              <div>
                <Label htmlFor="shift-template" className="text-sm font-medium">
                  Shift Template
                </Label>
                <Select
                  value={shiftTemplateId || "__none__"}
                  onValueChange={(value) => {
                    if (value === "__none__") {
                      setShiftTemplateId("");
                      setUseTemplate(false);
                    } else {
                      setShiftTemplateId(value);
                    }
                  }}
                  disabled={!isDateInAdvance}
                >
                  <SelectTrigger id="shift-template" className="mt-2">
                    <SelectValue placeholder="Select a shift template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None (set times manually)</SelectItem>
                    {shiftTemplates.map((template) => (
                      <SelectItem key={template.shift_template_id} value={template.shift_template_id}>
                        {template.shift_name} ({template.start_time} - {template.end_time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {shiftTemplateId && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Times will be automatically set from the template
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="start-time" className="text-sm font-medium">
                    Start Time
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-2"
                    disabled={!isDateInAdvance}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time" className="text-sm font-medium">
                    End Time
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-2"
                    disabled={!isDateInAdvance}
                  />
                </div>
              </div>
            )}

            {hasConflict && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                ⚠️ This schedule conflicts with another schedule for the same room and date
              </div>
            )}

            {!areTimesValid && (startTime || endTime || (shiftTemplateId && shiftTemplateId !== "__none__")) && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                ⚠️ {useTemplate && (!shiftTemplateId || shiftTemplateId === "__none__")
                  ? "Please select a shift template or switch to manual time entry"
                  : "Start time and end time cannot be the same"}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirm-edit"
                checked={confirmEdit}
                onCheckedChange={(checked) => setConfirmEdit(checked === true)}
                disabled={!isDateInAdvance}
              />
              <label
                htmlFor="confirm-edit"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I confirm that I want to edit this schedule
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !isDateInAdvance ||
              !confirmEdit ||
              !areTimesValid ||
              hasConflict
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Schedule"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

