"use client";
import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import {
  useGetEmployeeRoomAssignmentInWorkDateQuery,
  useGetEmployeeRoomAssignmentStatsQuery,
} from "@/store/employeeRoomAssignmentApi";
import { CustomScheduleSidebar } from "../schedule/custom-schedule-sidebar";
import ScheduleList from "../schedule/schedule-list-simplify";

// Helper function to format date as YYYY-MM-DD in local timezone
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ScheduleWrapper() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewedMonth, setViewedMonth] = useState<Date>(new Date());

  useEffect(() => {
    const userString = Cookies.get("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserId(user?.id || null);
      } catch (error) {
        console.error("Error parsing user cookie:", error);
        setUserId(null);
      }
    }
  }, []);

  // Update viewedMonth when selectedDate changes to a different month
  useEffect(() => {
    const selectedMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );
    const viewedMonthKey = `${viewedMonth.getFullYear()}-${viewedMonth.getMonth()}`;
    const selectedMonthKey = `${selectedMonth.getFullYear()}-${selectedMonth.getMonth()}`;
    if (viewedMonthKey !== selectedMonthKey) {
      setViewedMonth(selectedMonth);
    }
  }, [selectedDate, viewedMonth]);

  const { startDate, endDate } = useMemo(() => {
    const year = viewedMonth.getFullYear();
    const month = viewedMonth.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    return {
      startDate: formatDateLocal(start),
      endDate: formatDateLocal(end),
    };
  }, [viewedMonth]);

  const { data: scheduleData } = useGetEmployeeRoomAssignmentStatsQuery(
    {
      id: userId || "",
      startDate,
      endDate,
    },
    { skip: !userId }
  );

  const {
    data: InDateAssignmentData,
    isLoading: isLoadingAssignment,
    error: errorAssignment,
  } = useGetEmployeeRoomAssignmentInWorkDateQuery(
    selectedDate ? formatDateLocal(selectedDate) : "",
    { skip: !selectedDate }
  );

  return (
    <div className="flex bg-white min-h-screen">
      <CustomScheduleSidebar
        scheduleStats={scheduleData?.data || {}}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
        onMonthChange={setViewedMonth}
      />
      {/* Schedule list updates when date is clicked on calendar */}
      <div className="flex-1 overflow-y-auto">
        <ScheduleList
          schedule={InDateAssignmentData?.data || []}
          isLoading={isLoadingAssignment}
          error={errorAssignment}
        />
      </div>
    </div>
  );
}
