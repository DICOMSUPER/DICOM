"use client";

import { Clock, User, MapPin, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RoomSchedule } from "@/interfaces/schedule/schedule.interface";

interface ScheduleDetailModalProps {
  schedule: RoomSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  getStatusColor: (status: string) => string;
}

export function ScheduleDetailModal({ schedule, isOpen, onClose, getStatusColor }: ScheduleDetailModalProps) {
  if (!schedule) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col border-0 p-0">
        {/* Fixed Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">Schedule Details</DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="space-y-6 overflow-y-auto flex-1 px-6 py-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <Badge className={`${getStatusColor(schedule.schedule_status)} border`}>
              {schedule.schedule_status.charAt(0).toUpperCase() + schedule.schedule_status.slice(1)}
            </Badge>
          </div>

          {/* Employee Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Employee Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Name</span>
                <p className="text-sm text-gray-900">
                  {schedule.employee.firstName} {schedule.employee.lastName}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Role</span>
                <p className="text-sm text-gray-900 capitalize">
                  {schedule.employee.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Schedule Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Date</span>
                <p className="text-sm text-gray-900">{formatDate(schedule.work_date)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Time</span>
                <p className="text-sm text-gray-900 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTime(schedule.actual_start_time)} - {formatTime(schedule.actual_end_time)}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Overtime Hours</span>
                <p className="text-sm text-gray-900">{schedule.overtime_hours} hours</p>
              </div>
            </div>
          </div>

          {/* Room Information */}
          {schedule.room && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Room Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Room Code</span>
                  <p className="text-sm text-gray-900">{schedule.room.roomCode}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Room Type</span>
                  <p className="text-sm text-gray-900">{schedule.room.roomType}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Description</span>
                  <p className="text-sm text-gray-900">{schedule.room.description || 'No description available'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Shift Template */}
          {schedule.shift_template && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">Shift Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Shift Name</span>
                  <p className="text-sm text-gray-900">{schedule.shift_template.shift_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Shift Type</span>
                  <p className="text-sm text-gray-900">{schedule.shift_template.shift_type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Scheduled Time</span>
                  <p className="text-sm text-gray-900">
                    {schedule.shift_template.start_time} - {schedule.shift_template.end_time}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {schedule.notes && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Notes
              </h3>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {schedule.notes}
              </p>
            </div>
          )}
        </div>

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
