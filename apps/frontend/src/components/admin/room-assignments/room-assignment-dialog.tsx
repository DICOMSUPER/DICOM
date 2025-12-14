'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { RoomSchedule } from '@/common/interfaces/schedule/schedule.interface';
import { User } from '@/common/interfaces/user/user.interface';

export type RoomAssignmentFormState = {
  roomScheduleId: string;
  employeeId: string;
  isActive: boolean;
};

interface RoomAssignmentDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: RoomAssignmentFormState;
  onChange: (data: RoomAssignmentFormState) => void;
  onSubmit: () => void;
  schedules: RoomSchedule[];
  users: User[];
  isSubmitting: boolean;
}

export function RoomAssignmentDialog({
  mode,
  open,
  onOpenChange,
  formData,
  onChange,
  onSubmit,
  schedules,
  users,
  isSubmitting,
}: RoomAssignmentDialogProps) {
  const title = mode === 'create' ? 'Assign Employee to Room' : 'Edit Assignment';
  const cta = mode === 'create' ? 'Create Assignment' : 'Update Assignment';

  const scheduleOptions = useMemo(() => schedules ?? [], [schedules]);
  const userOptions = useMemo(() => users ?? [], [users]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Select a room schedule and employee to {mode === 'create' ? 'create' : 'update'} an assignment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Room Schedule
            </label>
            <Select
              value={formData.roomScheduleId}
              onValueChange={(value) =>
                onChange({ ...formData, roomScheduleId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room schedule" />
              </SelectTrigger>
              <SelectContent>
                {scheduleOptions.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">No schedules available</div>
                ) : (
                  scheduleOptions.map((schedule) => {
                    const roomCode = schedule.room?.roomCode || 'Room';
                    const shiftName = schedule.shift_template?.shift_name || '';
                    return (
                      <SelectItem
                        key={schedule.schedule_id}
                        value={schedule.schedule_id}
                      >
                        {roomCode} -{' '}
                        {schedule.work_date
                          ? format(new Date(schedule.work_date), 'MM/dd/yyyy')
                          : 'N/A'}
                        {shiftName ? ` (${shiftName})` : ''}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Employee
            </label>
            <Select
              value={formData.employeeId}
              onValueChange={(value) =>
                onChange({ ...formData, employeeId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {userOptions.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">No employees available</div>
                ) : (
                  userOptions.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} {user.email ? `(${user.email})` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="assignment-active"
              checked={formData.isActive}
              onChange={(e) =>
                onChange({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="assignment-active" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              isSubmitting ||
              !formData.roomScheduleId ||
              !formData.employeeId
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              cta
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

