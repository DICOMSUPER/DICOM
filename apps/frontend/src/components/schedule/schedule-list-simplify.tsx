import type { EmployeeRoomAssignment } from "@/common/interfaces/user/employee-room-assignment.interface";
import {
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import ScheduleCard from "./schedule-card";

export default function ScheduleList({
  schedule,
  isLoading,
  error,
}: {
  schedule: EmployeeRoomAssignment[] | undefined;
  isLoading: boolean;
  error: unknown;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading schedules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3 p-6 bg-red-50 border border-red-200 rounded-lg max-w-sm">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-red-700 font-medium">Error loading schedules</p>
          <p className="text-sm text-red-600">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!schedule || schedule.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3 p-6">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-medium">No schedules available</p>
          <p className="text-sm text-gray-400">
            Select another date to view schedules
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Daily Schedule</h3>
        <span className="text-sm text-gray-500">
          {schedule.length} shift{schedule.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-3">
        {schedule.map((item: EmployeeRoomAssignment) => (
          <ScheduleCard assignment={item} key={item.id} />
        ))}
      </div>
    </div>
  );
}
