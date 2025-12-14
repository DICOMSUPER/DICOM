"use client";

import { Clock, MapPin, Calendar, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmployeeRoomAssignment } from "@/common/interfaces/user/employee-room-assignment.interface";

export default function ScheduleCard({
  assignment,
}: {
  assignment: EmployeeRoomAssignment;
}) {
  const formatTime = (time: string | undefined) => {
    if (!time) return "";
    return time.slice(0, 5);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toISOString().split("T")[0];
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const status = assignment?.roomSchedule?.schedule_status as
    | string
    | undefined;
  const startTime = formatTime(
    assignment?.roomSchedule?.actual_start_time as string | undefined
  );
  const endTime = formatTime(
    assignment?.roomSchedule?.actual_end_time as string | undefined
  );
  const roomCode = assignment?.roomSchedule?.room?.roomCode as
    | string
    | undefined;
  const floor = assignment?.roomSchedule?.room?.floor as string | undefined;
  const workDate = formatDate(assignment?.roomSchedule?.work_date);
  const notes = assignment?.roomSchedule?.notes as string | undefined;

  return (
    <Card className="p-4 bg-white border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-gray-900">
                {startTime} - {endTime}
              </span>
            </div>
            <Badge
              variant="outline"
              className={`${getStatusColor(
                status
              )} text-xs px-2 py-0.5 rounded-full border`}
            >
              {status
                ? status.charAt(0).toUpperCase() + status.slice(1)
                : "Scheduled"}
            </Badge>
          </div>

          <div className="space-y-2 text-sm mb-3">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="font-medium text-gray-900">
                {roomCode || "N/A"}
              </span>
              {floor && (
                <span className="text-xs text-gray-500">• Floor {floor}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="font-mono text-xs text-gray-900">
                {workDate}
              </span>
            </div>
          </div>

          <div className="p-2 rounded bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-700 font-medium mb-1">Notes</p>
            <p className="text-xs text-gray-600 min-h-[1rem]">{notes || ""}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-gray-600 h-8 w-8"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
