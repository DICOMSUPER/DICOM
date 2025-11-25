"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RoomSchedule } from "@/interfaces/schedule/schedule.interface";
import { useDeleteRoomScheduleMutation } from "@/store/roomScheduleApi";
import { formatTimeRange } from "@/utils/schedule-helpers";

interface DeleteScheduleModalProps {
  schedule: RoomSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteScheduleModal({
  schedule,
  isOpen,
  onClose,
  onDeleted,
}: DeleteScheduleModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSchedule] = useDeleteRoomScheduleMutation();

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

  const handleDelete = async () => {
    if (!schedule) return;

    if (!isDateInAdvance) {
      toast.error("Cannot delete schedules for today or in the past. Only future schedules can be deleted.");
      return;
    }

    if (!confirmDelete) {
      toast.warning("Please confirm the deletion by checking the confirmation box");
      return;
    }

    setIsDeleting(true);

    try {
      await deleteSchedule(schedule.schedule_id).unwrap();
      toast.success("Schedule deleted successfully");
      onDeleted?.();
      onClose();
    } catch (error) {
      const apiError = error as { data?: { message?: string }; message?: string };
      toast.error(apiError?.data?.message || apiError?.message || "Failed to delete schedule");
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!schedule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Schedule
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isDateInAdvance && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <p className="font-medium">⚠️ Cannot delete this schedule</p>
              <p className="mt-1">
                Only schedules scheduled at least 1 day in advance can be deleted.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-foreground">
              Are you sure you want to delete this schedule? This action cannot be undone.
            </p>
            <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
              <p className="font-medium">Schedule Details:</p>
              <p>Room: {schedule.room?.roomCode || schedule.room_id}</p>
              <p>Date: {new Date(schedule.work_date).toLocaleDateString()}</p>
              <p>
                Time: {formatTimeRange(schedule.actual_start_time, schedule.actual_end_time)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm-delete"
              checked={confirmDelete}
              onCheckedChange={(checked) => setConfirmDelete(checked === true)}
              disabled={!isDateInAdvance}
            />
            <label
              htmlFor="confirm-delete"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I confirm that I want to delete this schedule
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || !isDateInAdvance || !confirmDelete}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Schedule
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

