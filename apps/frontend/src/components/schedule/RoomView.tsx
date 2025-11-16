"use client";

import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { Clock, MapPin, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoomSchedule, ShiftTemplate } from "@/interfaces/schedule/schedule.interface";
import {
  TimelineSegment,
  buildTimelineSegments,
  scheduleFallsInSegment,
} from "./time-segment-utils";
import { useGetRoomsQuery } from "@/store/roomsApi";

interface RoomViewProps {
  selectedDate: Date;
  timeSlots: { time: string; hour: number }[];
  schedules: RoomSchedule[];
  getStatusColor: (status: string) => string;
  isLoading?: boolean;
  onScheduleClick?: (schedule: RoomSchedule | RoomSchedule[]) => void;
  shiftTemplateMap?: Record<string, ShiftTemplate>;
}

const formatDuration = (segment: TimelineSegment) => {
  const minutes = segment.endMinutes - segment.startMinutes;
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  }
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  return `${minutes} min`;
};

const renderSegmentLabel = (segment: TimelineSegment) => {
  const isBreak = segment.type === "break";
  const isGap = segment.type === "gap";
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        isBreak
          ? "border-border bg-amber-50 text-amber-800"
          : isGap
          ? "border-dashed border-border bg-muted/40 text-foreground"
          : "border-border bg-background text-foreground"
      }`}
    >
      <p className="text-sm font-semibold">{segment.label}</p>
      <p className="text-xs opacity-80">
        {isBreak ? "Break period" : isGap ? "Flexible slot" : formatDuration(segment)}
      </p>
    </div>
  );
};

export function RoomView({
  selectedDate,
  timeSlots,
  schedules,
  getStatusColor,
  isLoading = false,
  onScheduleClick,
  shiftTemplateMap,
}: RoomViewProps) {
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set());
  const [selectValue, setSelectValue] = useState<string>("");

  const { data: roomsData, isLoading: roomsLoading } = useGetRoomsQuery({
    page: 1,
    limit: 1000,
    is_active: true,
  });

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  const schedulesForDate = useMemo(
    () => schedules.filter((schedule) => schedule.work_date === selectedDateStr),
    [schedules, selectedDateStr]
  );

  const schedulesWithTemplates = useMemo(() => {
    if (!shiftTemplateMap || Object.keys(shiftTemplateMap).length === 0) {
      return schedulesForDate;
    }
    return schedulesForDate.map((schedule) => {
      if (schedule.shift_template || !schedule.shift_template_id) {
        return schedule;
      }
      const template = shiftTemplateMap[schedule.shift_template_id];
      return template ? { ...schedule, shift_template: template } : schedule;
    });
  }, [schedulesForDate, shiftTemplateMap]);

  const referencedTemplates = useMemo(() => {
    if (!shiftTemplateMap) return [];
    const ids = new Set(
      schedulesWithTemplates
        .map((schedule) => schedule.shift_template_id)
        .filter((id): id is string => Boolean(id))
    );
    return Array.from(ids)
      .map((id) => shiftTemplateMap[id])
      .filter((template): template is ShiftTemplate => Boolean(template));
  }, [schedulesWithTemplates, shiftTemplateMap]);

  const timelineSegments = useMemo(
    () => buildTimelineSegments(timeSlots, schedulesWithTemplates, referencedTemplates),
    [timeSlots, schedulesWithTemplates, referencedTemplates]
  );

  const schedulesByRoom = useMemo(() => {
    const grouped: Record<string, RoomSchedule[]> = {};

    schedulesWithTemplates.forEach((schedule) => {
      const roomKey = schedule.room?.roomCode || schedule.room_id || "Unassigned";
      if (!grouped[roomKey]) {
        grouped[roomKey] = [];
      }
      grouped[roomKey].push(schedule);
    });

    return Object.entries(grouped).sort(([a], [b]) => {
      if (a === "Unassigned") return 1;
      if (b === "Unassigned") return -1;
      return a.localeCompare(b);
    });
  }, [schedulesWithTemplates]);

  // Get available rooms from schedules and rooms API
  const availableRooms = useMemo(() => {
    const roomMap = new Map<string, { roomCode: string; roomType?: string; roomId?: string }>();
    
    // Add rooms from schedules
    schedulesByRoom.forEach(([roomCode]) => {
      const schedule = schedulesByRoom.find(([code]) => code === roomCode)?.[1]?.[0];
      if (schedule?.room) {
        roomMap.set(roomCode, {
          roomCode: schedule.room.roomCode,
          roomType: schedule.room.roomType,
          roomId: schedule.room_id,
        });
      } else if (roomCode !== "Unassigned") {
        roomMap.set(roomCode, { roomCode, roomId: schedule?.room_id });
      }
    });

    // Add rooms from rooms API
    if (roomsData?.data) {
      roomsData.data.forEach((room) => {
        if (room.roomCode) {
          roomMap.set(room.roomCode, {
            roomCode: room.roomCode,
            roomType: room.roomType,
            roomId: room.id,
          });
        }
      });
    }

    return Array.from(roomMap.values()).sort((a, b) => a.roomCode.localeCompare(b.roomCode));
  }, [schedulesByRoom, roomsData]);

  // Initialize selected rooms with all available rooms on mount
  useEffect(() => {
    if (selectedRoomIds.size === 0 && availableRooms.length > 0) {
      const allRoomCodes = new Set(availableRooms.map((r) => r.roomCode));
      allRoomCodes.add("Unassigned");
      setSelectedRoomIds(allRoomCodes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableRooms.length]);

  const handleAddRoom = (roomCode: string) => {
    if (!roomCode) return;
    setSelectedRoomIds((prev) => new Set([...prev, roomCode]));
    setSelectValue("");
  };

  const handleRemoveRoom = (roomCode: string) => {
    setSelectedRoomIds((prev) => {
      const next = new Set(prev);
      next.delete(roomCode);
      return next;
    });
  };

  // Filter schedules by selected rooms
  const filteredSchedulesByRoom = useMemo(() => {
    if (selectedRoomIds.size === 0) return schedulesByRoom;
    return schedulesByRoom.filter(([roomCode]) => selectedRoomIds.has(roomCode));
  }, [schedulesByRoom, selectedRoomIds]);

  const getSchedulesForSegment = (roomSchedules: RoomSchedule[], segment: TimelineSegment) =>
    roomSchedules.filter((schedule) => scheduleFallsInSegment(schedule, segment));

  const loadingSegments =
    timelineSegments.length > 0
      ? timelineSegments
      : buildTimelineSegments(timeSlots, [], referencedTemplates);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-12 gap-4 text-sm font-semibold uppercase tracking-wide text-foreground">
          <div className="col-span-2">Room</div>
          <div className="col-span-10">Time & Assignments</div>
        </div>
        {[1, 2, 3].map((roomIndex) => (
          <div key={roomIndex} className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2 space-y-2">
                {loadingSegments.map((segment) => (
                  <div key={segment.id} className="flex flex-col justify-center min-h-20">
                    {renderSegmentLabel(segment)}
                  </div>
                ))}
              </div>
              <div className="col-span-10 space-y-2">
                {loadingSegments.map((segment) => (
                  <div key={segment.id} className="min-h-20 border-t border-border flex items-center p-2">
                    <div className="bg-gray-50 border border-border rounded-lg p-3 shadow-sm relative w-full">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (schedulesByRoom.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No room assignments</h3>
          <p className="text-sm text-gray-600">
            No schedules assigned to rooms for {format(selectedDate, "MMMM d, yyyy")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Room Selector */}
      <div className="bg-white rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">Filter by Room</h3>
          </div>
          {selectedRoomIds.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => {
                const allRoomCodes = new Set(availableRooms.map((r) => r.roomCode));
                allRoomCodes.add("Unassigned");
                setSelectedRoomIds(allRoomCodes);
              }}
            >
              Select All
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
                          <Select value={selectValue} onValueChange={handleAddRoom}>
            <SelectTrigger className="w-[200px] h-8 text-sm bg-primary text-white border-border hover:bg-primary/90">
              <SelectValue placeholder="Add room to view..." />
            </SelectTrigger>
            <SelectContent>
              {availableRooms
                .filter((room) => !selectedRoomIds.has(room.roomCode))
                .map((room) => (
                  <SelectItem key={room.roomCode} value={room.roomCode}>
                    {room.roomCode} {room.roomType ? `(${room.roomType})` : ""}
                  </SelectItem>
                ))}
              {!selectedRoomIds.has("Unassigned") && (
                <SelectItem value="Unassigned">Unassigned</SelectItem>
              )}
            </SelectContent>
          </Select>

          {Array.from(selectedRoomIds).map((roomCode) => {
            const room = availableRooms.find((r) => r.roomCode === roomCode);
            const isUnassigned = roomCode === "Unassigned";
            return (
              <Badge
                key={roomCode}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 text-xs"
              >
                <MapPin className="h-3 w-3 text-white" />
                <span className="text-white">
                  {isUnassigned ? "Unassigned" : roomCode}
                  {room?.roomType && !isUnassigned && ` (${room.roomType})`}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveRoom(roomCode)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {selectedRoomIds.size === 0 && (
            <p className="text-xs text-gray-500 italic">
              No rooms selected. Select rooms to view schedules.
            </p>
          )}
        </div>
      </div>

      {filteredSchedulesByRoom.length === 0 && selectedRoomIds.size > 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No schedules found</h3>
            <p className="text-sm text-gray-600">
              No schedules match the selected rooms for {format(selectedDate, "MMMM d, yyyy")}
            </p>
          </div>
        </div>
      )}

      {filteredSchedulesByRoom.length > 0 && (
        <>
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold uppercase tracking-wide text-foreground">
            <div className="col-span-2">Room</div>
            <div className="col-span-10">Time & Assignments</div>
          </div>

          {filteredSchedulesByRoom.map(([roomCode, roomSchedules]) => {
        const room = roomSchedules[0]?.room;
        const roomName = room?.roomCode || roomCode;

        return (
          <div key={roomCode} className="space-y-2 border-b border-border pb-6 last:border-b-0">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">{roomName}</h3>
              {room && (
                <Badge variant="outline" className="text-xs">
                  {room.roomType}
                </Badge>
              )}
              <span className="text-sm text-gray-500">
                ({roomSchedules.length} schedule{roomSchedules.length !== 1 ? "s" : ""})
              </span>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2 space-y-0">
                {timelineSegments.map((segment) => (
                  <div key={segment.id} className="flex flex-col justify-center min-h-20 border-t border-border">
                    {renderSegmentLabel(segment)}
                  </div>
                ))}
              </div>

              <div className="col-span-10 space-y-0">
                {timelineSegments.map((segment) => {
                  const segmentSchedules = getSchedulesForSegment(roomSchedules, segment);

                  return (
                    <div
                      key={segment.id}
                      className="min-h-20 border-t border-border flex items-center p-2"
                    >
                      {segmentSchedules.length > 0 ? (
                        segmentSchedules.length === 1 ? (
                          <div
                            className="bg-blue-50 border border-border rounded-lg p-3 shadow-sm relative w-full cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => onScheduleClick?.(segmentSchedules[0])}
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                            <div className="ml-2 flex items-center justify-between gap-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-base">
                                  {segmentSchedules[0].employee?.firstName}{" "}
                                  {segmentSchedules[0].employee?.lastName}
                                </h4>
                                <div className="flex items-center space-x-1 text-xs text-gray-600">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {segmentSchedules[0].actual_start_time} -{" "}
                                    {segmentSchedules[0].actual_end_time}
                                  </span>
                                  {segmentSchedules[0].shift_template?.shift_name && (
                                    <>
                                      <span className="text-gray-500">•</span>
                                      <span className="text-gray-500">
                                        {segmentSchedules[0].shift_template.shift_name}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge
                                className={`${getStatusColor(
                                  segmentSchedules[0].schedule_status
                                )} border border-border text-xs ml-auto`}
                              >
                                {segmentSchedules[0].schedule_status
                                  .charAt(0)
                                  .toUpperCase() +
                                  segmentSchedules[0].schedule_status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="bg-blue-50 border border-border rounded-lg p-4 shadow-sm relative w-full cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => onScheduleClick?.(segmentSchedules)}
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                            <div className="ml-2">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-base">
                                    {segmentSchedules.length} schedules
                                  </h4>
                                  <p className="text-xs text-gray-600">
                                    {segment.label} • {segmentSchedules[0].actual_start_time}
                                  </p>
                                </div>
                                <Badge className="text-xs border border-border bg-blue-100 text-blue-800">
                                  View details
                                </Badge>
                              </div>
                              <div className="mt-3 space-y-2">
                                {segmentSchedules.slice(0, 2).map((schedule) => (
                                  <div
                                    key={schedule.schedule_id}
                                    className="flex items-center justify-between text-xs text-gray-700"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {schedule.employee?.firstName}{" "}
                                        {schedule.employee?.lastName}
                                      </span>
                                      <span className="text-gray-500">
                                        ({schedule.schedule_status})
                                      </span>
                                    </div>
                                    <span className="text-gray-500">
                                      {schedule.actual_start_time} - {schedule.actual_end_time}
                                    </span>
                                  </div>
                                ))}
                                {segmentSchedules.length > 2 && (
                                  <p className="text-xs text-gray-500">
                                    +{segmentSchedules.length - 2} more schedules
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        <div
                          className={`text-sm text-center italic m-2 w-full rounded-lg border px-4 py-3 ${
                            segment.type === "break"
                              ? "border-border bg-amber-50/70 text-amber-800"
                              : "border-dashed border-border text-gray-500"
                          }`}
                        >
                          {segment.type === "break" ? "Break window" : "No schedules"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
        </>
      )}
    </div>
  );
}

