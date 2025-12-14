"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RoomSchedule } from "@/common/interfaces/schedule/schedule.interface";
import { useDeleteEmployeeRoomAssignmentMutation } from "@/store/employeeRoomAssignmentApi";

interface DeleteAssignmentModalProps {
  assignmentId: string;
  schedule: RoomSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: (assignmentId: string) => void;
}

export function DeleteAssignmentModal({
  assignmentId,
  schedule,
  isOpen,
  onClose,
  onDeleted,
}: DeleteAssignmentModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteAssignment] = useDeleteEmployeeRoomAssignmentMutation();

  const assignment = useMemo(() => {
    if (!schedule?.employeeRoomAssignments) return null;
    return schedule.employeeRoomAssignments.find((a) => a.id === assignmentId);
  }, [schedule, assignmentId]);

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
    if (!assignment || !schedule) return;

    if (!isDateInAdvance) {
      toast.error("Cannot delete assignments for today or in the past. Only future assignments can be deleted.");
      return;
    }

    if (!confirmDelete) {
      toast.warning("Please confirm the deletion by checking the confirmation box");
      return;
    }

    setIsDeleting(true);

    try {
      await deleteAssignment(assignmentId).unwrap();
      toast.success("Assignment deleted successfully");
      onDeleted?.(assignmentId);
      onClose();
    } catch (error) {
      const apiError = error as { data?: { message?: string }; message?: string };
      toast.error(apiError?.data?.message || apiError?.message || "Failed to delete assignment");
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!assignment || !schedule) return null;

  const employeeName = assignment.employee
    ? `${assignment.employee.firstName} ${assignment.employee.lastName}`
    : assignment.employeeId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Assignment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isDateInAdvance && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <p className="font-medium flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Cannot delete this assignment</span>
              </p>
              <p className="mt-1">
                Only assignments for schedules at least 1 day in advance can be deleted.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-foreground">
              Are you sure you want to remove this employee from the schedule? This action cannot be undone.
            </p>
            <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
              <p className="font-medium">Assignment Details:</p>
              <p>Employee: {employeeName}</p>
              <p>Room: {schedule.room?.roomCode || schedule.room_id}</p>
              <p>Date: {new Date(schedule.work_date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm-delete-assignment"
              checked={confirmDelete}
              onCheckedChange={(checked) => setConfirmDelete(checked === true)}
              disabled={!isDateInAdvance}
            />
            <label
              htmlFor="confirm-delete-assignment"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I confirm that I want to remove this employee from the schedule
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
                Delete Assignment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

