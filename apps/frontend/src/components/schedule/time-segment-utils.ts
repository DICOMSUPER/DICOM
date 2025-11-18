import { RoomSchedule, ShiftTemplate } from "@/interfaces/schedule/schedule.interface";

export interface TimelineSegment {
  id: string;
  label: string;
  startMinutes: number;
  endMinutes: number;
  type: "work" | "break" | "gap";
}

const MINUTES_IN_DAY = 24 * 60;

export const timeStringToMinutes = (time?: string | null) => {
  if (!time) return null;
  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }
  return hour * 60 + minute;
};

const minutesToLabel = (minutes: number) => {
  const clamped = Math.max(0, Math.min(minutes, MINUTES_IN_DAY));
  const hour24 = Math.floor(clamped / 60);
  const minute = clamped % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
};

const getScheduleInterval = (schedule: RoomSchedule) => {
  const start =
    timeStringToMinutes(schedule.actual_start_time) ??
    timeStringToMinutes(schedule.shift_template?.start_time);
  const endRaw =
    timeStringToMinutes(schedule.actual_end_time) ??
    timeStringToMinutes(schedule.shift_template?.end_time);

  if (start === null || endRaw === null) {
    return null;
  }

  const end =
    endRaw <= start ? Math.min(endRaw + MINUTES_IN_DAY, MINUTES_IN_DAY) : endRaw;

  if (end <= start) {
    return null;
  }

  return { startMinutes: start, endMinutes: end };
};

const createGapSegment = (start: number, end: number): TimelineSegment => ({
  id: `gap-${start}-${end}`,
  label: `${minutesToLabel(start)} – ${minutesToLabel(end)}`,
  startMinutes: start,
  endMinutes: end,
  type: "gap",
});

export const buildTimelineSegments = (
  timeSlots: { time: string; hour: number }[],
  schedules: RoomSchedule[],
  shiftTemplates?: ShiftTemplate[]
): TimelineSegment[] => {
  const scheduleIntervals = schedules
    .map(getScheduleInterval)
    .filter(
      (interval): interval is { startMinutes: number; endMinutes: number } =>
        Boolean(interval)
    );

  const scheduleBreakIntervals = schedules
    .map((schedule) => {
      const template = schedule.shift_template;
      if (!template) return null;
      const start = timeStringToMinutes(template.break_start_time);
      const end = timeStringToMinutes(template.break_end_time);
      if (start === null || end === null || end <= start) {
        return null;
      }
      return { startMinutes: start, endMinutes: end };
    })
    .filter(
      (interval): interval is { startMinutes: number; endMinutes: number } =>
        Boolean(interval)
    );

  const templateBreakIntervals = (shiftTemplates ?? [])
    .map((template) => {
      const start = timeStringToMinutes(template.break_start_time);
      const end = timeStringToMinutes(template.break_end_time);
      if (start === null || end === null || end <= start) {
        return null;
      }
      return { startMinutes: start, endMinutes: end };
    })
    .filter(
      (interval): interval is { startMinutes: number; endMinutes: number } =>
        Boolean(interval)
    );

  // Merge break intervals from both sources and deduplicate
  const allBreakIntervals = [...scheduleBreakIntervals, ...templateBreakIntervals];
  const uniqueBreakIntervals = Array.from(
    new Map(
      allBreakIntervals.map((interval) => [
        `${interval.startMinutes}-${interval.endMinutes}`,
        interval,
      ])
    ).values()
  );

  const breakIntervals = uniqueBreakIntervals;

  const markers = new Set<number>();
  scheduleIntervals.forEach(({ startMinutes, endMinutes }) => {
    markers.add(startMinutes);
    markers.add(endMinutes);
  });
  breakIntervals.forEach(({ startMinutes, endMinutes }) => {
    markers.add(startMinutes);
    markers.add(endMinutes);
  });

  const fallbackStart = timeSlots?.[0]?.hour
    ? Math.max(0, timeSlots[0].hour * 60)
    : 8 * 60;
  const fallbackEnd = timeSlots?.[timeSlots.length - 1]?.hour
    ? Math.min((timeSlots[timeSlots.length - 1].hour + 1) * 60, MINUTES_IN_DAY)
    : fallbackStart + 60;

  if (markers.size === 0) {
    markers.add(fallbackStart);
    markers.add(fallbackEnd);
  } else {
    markers.add(Math.min(fallbackStart, Math.min(...markers)));
    markers.add(Math.max(fallbackEnd, Math.max(...markers)));
  }

  const sortedMarkers = Array.from(markers).sort((a, b) => a - b);

  if (sortedMarkers.length < 2) {
    return [createGapSegment(fallbackStart, fallbackEnd)];
  }

  const segments: TimelineSegment[] = [];

  for (let i = 0; i < sortedMarkers.length - 1; i++) {
    const start = sortedMarkers[i];
    const end = sortedMarkers[i + 1];
    if (start === end) continue;

    const isBreak = breakIntervals.some(
      (interval) => start >= interval.startMinutes && end <= interval.endMinutes
    );

    const hasScheduleCoverage = scheduleIntervals.some(
      (interval) => start < interval.endMinutes && end > interval.startMinutes
    );

    const type: TimelineSegment["type"] = isBreak
      ? "break"
      : hasScheduleCoverage
      ? "work"
      : "gap";

    segments.push({
      id: `${start}-${end}-${type}`,
      label: `${minutesToLabel(start)} – ${minutesToLabel(end)}`,
      startMinutes: start,
      endMinutes: end,
      type,
    });
  }

  if (segments.length === 0) {
    return [createGapSegment(fallbackStart, fallbackEnd)];
  }

  return segments;
};

export const scheduleFallsInSegment = (
  schedule: RoomSchedule,
  segment: TimelineSegment
) => {
  // Don't show schedules in break periods
  if (segment.type === "break") {
    return false;
  }

  const interval = getScheduleInterval(schedule);
  if (!interval) return false;

  return (
    interval.startMinutes < segment.endMinutes &&
    interval.endMinutes > segment.startMinutes
  );
};

