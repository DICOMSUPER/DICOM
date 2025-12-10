"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { ScheduleSidebar } from "@/components/schedule/ScheduleSidebar";
import { DayView } from "@/components/schedule/DayView";
import { WeekView } from "@/components/schedule/WeekView";
import { MonthView } from "@/components/schedule/MonthView";
import { ListView } from "@/components/schedule/ListView";
import { RoomView } from "@/components/schedule/RoomView";
import { ScheduleDetailModal } from "@/components/schedule/ScheduleDetailModal";
import {
  ScheduleListFilters,
  ScheduleListFilters as FiltersType,
} from "@/components/schedule/ScheduleListFilters";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useGetMySchedulesByDateRangeQuery } from "@/store/roomScheduleApi";
import { useGetRoomsQuery } from "@/store/roomsApi";
import {
  RoomSchedule,
  ViewMode,
} from "@/interfaces/schedule/schedule.interface";
import { useShiftTemplatesDictionary } from "@/hooks/useShiftTemplatesDictionary";
import { filterAndSortSchedules } from "@/utils/schedule-filter-utils";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  useGetEmployeeRoomAssignmentStatsOverTimeQuery,
  useGetEmployeeRoomAssignmentStatsQuery,
} from "@/store/employeeRoomAssignmentApi";
import { formatDateLocal } from "@/utils/schedule/utils";

const timeSlots = [
  { time: "8:00 AM", hour: 8 },
  { time: "9:00 AM", hour: 9 },
  { time: "10:00 AM", hour: 10 },
  { time: "11:00 AM", hour: 11 },
  { time: "12:00 PM", hour: 12 },
  { time: "1:00 PM", hour: 13 },
  { time: "2:00 PM", hour: 14 },
  { time: "3:00 PM", hour: 15 },
  { time: "4:00 PM", hour: 16 },
  { time: "5:00 PM", hour: 17 },
];

export default function ReceptionSchedulePage() {
  const userId = useSelector((state: RootState) => state.auth.user?.id) || null;
  const [viewedMonth, setViewedMonth] = useState<Date>(new Date());

  // Update viewedMonth when selectedDate changes to a different month

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

  const { data: scheduleData } = useGetEmployeeRoomAssignmentStatsOverTimeQuery(
    {
      id: userId!,
      startDate,
      endDate,
    },
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedSchedule, setSelectedSchedule] = useState<RoomSchedule | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listFilters, setListFilters] = useState<FiltersType>({
    sortBy: "date_desc", // Default: latest first
  });

  // Fetch schedules for entire month (single query)
  const {
    data: allSchedules = [],
    isLoading: schedulesLoading,
    isFetching: schedulesFetching,
    error: schedulesError,
    refetch: refetchSchedules,
  } = useGetMySchedulesByDateRangeQuery({
    startDate: format(startOfMonth(selectedDate), "yyyy-MM-dd"),
    endDate: format(endOfMonth(selectedDate), "yyyy-MM-dd"),
  });

  // Fetch rooms for filter
  const { data: roomsData } = useGetRoomsQuery({
    page: 1,
    limit: 1000,
    is_active: true,
  });

  const rooms = useMemo(() => roomsData?.data || [], [roomsData]);

  // Filter schedules based on current view mode and selected date
  const getFilteredSchedules = (): RoomSchedule[] => {
    const scheduleArray = Array.isArray(allSchedules) ? allSchedules : [];

    let filtered: RoomSchedule[] = [];

    switch (viewMode) {
      case "day": {
        const dayStr = format(selectedDate, "yyyy-MM-dd");
        filtered = scheduleArray.filter((s) => s.work_date === dayStr);
        break;
      }
      case "week": {
        const weekStart = format(
          startOfWeek(selectedDate, { weekStartsOn: 0 }),
          "yyyy-MM-dd"
        );
        const weekEnd = format(
          endOfWeek(selectedDate, { weekStartsOn: 0 }),
          "yyyy-MM-dd"
        );
        filtered = scheduleArray.filter(
          (s) => s.work_date >= weekStart && s.work_date <= weekEnd
        );
        break;
      }
      case "month":
      case "list": {
        // Return all schedules for the month
        filtered = scheduleArray;
        break;
      }
      default:
        filtered = scheduleArray;
    }

    // Apply list view filters and sorting when in list mode
    if (viewMode === "list") {
      filtered = filterAndSortSchedules(filtered, listFilters);
    }

    return filtered;
  };

  const currentSchedules = getFilteredSchedules();
  const isLoading = schedulesLoading || schedulesFetching;
  const isRefreshing = schedulesFetching;
  const { shiftTemplateMap } = useShiftTemplatesDictionary();

  const getSchedulesForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return currentSchedules.filter(
      (schedule) => schedule.work_date === dateStr
    );
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedDate(subDays(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedDate(subWeeks(selectedDate, 1));
    } else {
      setSelectedDate(addWeeks(selectedDate, 1));
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedDate(subMonths(selectedDate, 1));
    } else {
      setSelectedDate(addMonths(selectedDate, 1));
    }
  };

  const handleScheduleClick = (schedule: RoomSchedule | RoomSchedule[]) => {
    const target = Array.isArray(schedule) ? schedule[0] : schedule;
    if (!target) return;
    setSelectedSchedule(target);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleRefresh = () => {
    // Refetch schedules for the entire month
    refetchSchedules();
  };

  const renderDayView = () => (
    <DayView
      selectedDate={selectedDate}
      timeSlots={timeSlots}
      schedules={currentSchedules}
      getStatusColor={getStatusColor}
      isLoading={isLoading}
      onScheduleClick={handleScheduleClick}
      shiftTemplateMap={shiftTemplateMap}
    />
  );

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekDays: Date[] = [];

    for (let i = 0; i < 7; i++) {
      weekDays.push(addDays(weekStart, i));
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 xl:items-center justify-between mb-1 gap-2">
          <h2 className="text-lg xl:text-xl font-semibold text-gray-900">
            Weekly Schedule
          </h2>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs xl:text-sm"
              onClick={() => navigateWeek("prev")}
            >
              <ChevronLeft className="h-3 w-3 xl:h-4 xl:w-4 mr-1" />
              <span className="hidden xl:inline">Previous Week</span>
              <span className="xl:hidden">Prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs xl:text-sm"
              onClick={() => navigateWeek("next")}
            >
              <span className="hidden xl:inline">Next Week</span>
              <span className="xl:hidden">Next</span>
              <ChevronRight className="h-3 w-3 xl:h-4 xl:w-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Week of {format(weekStart, "MMMM d")} -{" "}
          {format(weekEnd, "MMMM d, yyyy")}
        </div>

        <WeekView
          weekDays={weekDays}
          timeSlots={timeSlots}
          schedules={currentSchedules}
          selectedDate={selectedDate}
          isLoading={isLoading}
          onScheduleClick={handleScheduleClick}
          shiftTemplateMap={shiftTemplateMap}
        />
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get first day of week for the month
    const firstDayOfWeek = startOfWeek(monthStart, { weekStartsOn: 0 });
    const lastDayOfWeek = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const calendarDays = eachDayOfInterval({
      start: firstDayOfWeek,
      end: lastDayOfWeek,
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 xl:items-center justify-between mb-1 gap-2">
          <h2 className="text-lg xl:text-xl font-semibold text-gray-900">
            Monthly Schedule
          </h2>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs xl:text-sm"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-3 w-3 xl:h-4 xl:w-4 mr-1" />
              <span className="hidden xl:inline">Previous Month</span>
              <span className="xl:hidden">Prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs xl:text-sm"
              onClick={() => navigateMonth("next")}
            >
              <span className="hidden xl:inline">Next Month</span>
              <span className="xl:hidden">Next</span>
              <ChevronRight className="h-3 w-3 xl:h-4 xl:w-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          {format(selectedDate, "MMMM yyyy")}
        </div>

        <MonthView
          calendarDays={calendarDays}
          schedules={currentSchedules}
          selectedDate={selectedDate}
          isLoading={isLoading}
          onScheduleClick={handleScheduleClick}
        />
      </div>
    );
  };

  const handleListFiltersChange = (filters: FiltersType) => {
    setListFilters(filters);
  };

  const handleListFiltersReset = () => {
    setListFilters({ sortBy: "date_desc" });
  };

  const renderListView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
            Schedules List
          </h2>
          <p className="text-xs lg:text-sm text-gray-600">
            Your schedules for {format(selectedDate, "MMMM yyyy")}
          </p>
        </div>
      </div>

      <ScheduleListFilters
        isAdmin={false}
        rooms={rooms}
        filters={listFilters}
        onFiltersChange={handleListFiltersChange}
        onReset={handleListFiltersReset}
      />

      <ListView
        schedules={currentSchedules}
        getStatusColor={getStatusColor}
        isLoading={isLoading}
        onScheduleClick={handleScheduleClick}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-sm text-gray-600">
              View and manage your work schedule
            </p>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <RefreshButton onRefresh={handleRefresh} loading={isRefreshing} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center text-gray-900">
              {format(selectedDate, "MMMM d, yyyy")}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Left Panel - Calendar and Filters */}
        <ScheduleSidebar
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
          scheduleStats={scheduleData?.data || {}}
          onMonthChange={setViewedMonth}
        />

        {/* Right Panel - Schedule View */}
        <div className="lg:col-span-2 p-4 lg:p-6">
          <div className="mb-4 lg:mb-6">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as ViewMode)}
            >
              <TabsList className="bg-gray-100 w-full grid grid-cols-5">
                <TabsTrigger
                  value="day"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs lg:text-sm"
                >
                  Day
                </TabsTrigger>
                <TabsTrigger
                  value="week"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs lg:text-sm"
                >
                  Week
                </TabsTrigger>
                <TabsTrigger
                  value="month"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs lg:text-sm"
                >
                  Month
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs lg:text-sm"
                >
                  List
                </TabsTrigger>
                <TabsTrigger
                  value="room"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs lg:text-sm"
                >
                  Room
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* {schedulesError && !isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center max-w-md mx-auto">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-red-50 rounded-full">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load schedules</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    We couldn't load your schedule data. Please check your connection and try again.
                  </p>
                  <Button 
                    onClick={() => handleRefresh()} 
                    variant="outline" 
                    size="sm"
                    className="inline-flex items-center gap-2"
                  >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          )} */}

          {/* Content - Skeleton loading is handled within each view component */}
          {!schedulesError && (
            <>
              {viewMode === "day" && (
                <div>
                  <div className="mb-4 xl:mb-6">
                    <h1 className="text-xl xl:text-2xl font-bold text-gray-900">
                      Daily Schedule
                    </h1>
                    <p className="text-xs xl:text-sm text-gray-600">
                      Your schedule for {format(selectedDate, "MMMM d, yyyy")}
                    </p>
                  </div>
                  {renderDayView()}
                </div>
              )}

              {viewMode === "week" && <div>{renderWeekView()}</div>}

              {viewMode === "month" && <div>{renderMonthView()}</div>}

              {viewMode === "list" && <div>{renderListView()}</div>}

              {viewMode === "room" && (
                <div>
                  <div className="mb-4 xl:mb-6">
                    <h1 className="text-xl xl:text-2xl font-bold text-gray-900">
                      Room Schedule
                    </h1>
                    <p className="text-xs xl:text-sm text-gray-600">
                      Your schedules grouped by room for{" "}
                      {format(selectedDate, "MMMM d, yyyy")}
                    </p>
                  </div>
                  <RoomView
                    selectedDate={selectedDate}
                    timeSlots={timeSlots}
                    schedules={currentSchedules}
                    getStatusColor={getStatusColor}
                    isLoading={isLoading}
                    onScheduleClick={handleScheduleClick}
                    shiftTemplateMap={shiftTemplateMap}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Schedule Detail Modal */}
      <ScheduleDetailModal
        schedule={selectedSchedule}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        getStatusColor={getStatusColor}
      />
    </div>
  );
}
