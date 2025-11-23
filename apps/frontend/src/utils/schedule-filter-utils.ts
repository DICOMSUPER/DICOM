import { RoomSchedule } from "@/interfaces/schedule/schedule.interface";
import { ScheduleListFilters } from "@/components/schedule/ScheduleListFilters";

/**
 * Converts time string (HH:MM) to minutes for comparison
 */
const timeToMinutes = (time?: string | null): number | null => {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

/**
 * Filters and sorts schedules based on the provided filters
 * Note: This is client-side filtering. For better performance, use backend filters when possible.
 */
export function filterAndSortSchedules(
  schedules: RoomSchedule[],
  filters: ScheduleListFilters
): RoomSchedule[] {
  let filtered = [...schedules];

  // Filter by employee
  if (filters.employeeId) {
    filtered = filtered.filter((schedule) => {
      return schedule.employeeRoomAssignments?.some(
        (assignment) =>
          assignment.employeeId === filters.employeeId &&
          assignment.isActive &&
          assignment.employee
      );
    });
  }

  // Filter by room
  if (filters.roomId) {
    filtered = filtered.filter(
      (schedule) => schedule.room_id === filters.roomId || schedule.room?.id === filters.roomId
    );
  }

  // Filter by start time
  if (filters.startTime) {
    const startMinutes = timeToMinutes(filters.startTime);
    if (startMinutes !== null) {
      filtered = filtered.filter((schedule) => {
        const scheduleStart = timeToMinutes(schedule.actual_start_time);
        return scheduleStart !== null && scheduleStart >= startMinutes;
      });
    }
  }

  // Filter by end time
  if (filters.endTime) {
    const endMinutes = timeToMinutes(filters.endTime);
    if (endMinutes !== null) {
      filtered = filtered.filter((schedule) => {
        const scheduleEnd = timeToMinutes(schedule.actual_end_time);
        return scheduleEnd !== null && scheduleEnd <= endMinutes;
      });
    }
  }

  // Filter by date range
  if (filters.dateFrom) {
    filtered = filtered.filter(
      (schedule) => schedule.work_date >= filters.dateFrom!
    );
  }

  if (filters.dateTo) {
    filtered = filtered.filter(
      (schedule) => schedule.work_date <= filters.dateTo!
    );
  }

  // Sort by date
  const sortBy = filters.sortBy || "date_desc"; // Default to latest first
  filtered.sort((a, b) => {
    const dateA = new Date(a.work_date).getTime();
    const dateB = new Date(b.work_date).getTime();
    
    if (sortBy === "date_asc") {
      // Oldest first
      return dateA - dateB;
    } else {
      // Latest first (descending) - default
      return dateB - dateA;
    }
  });

  return filtered;
}

