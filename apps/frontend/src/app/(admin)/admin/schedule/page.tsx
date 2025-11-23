"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ScheduleSidebar } from "@/components/schedule/ScheduleSidebar";
import { DayView } from "@/components/schedule/DayView";
import { WeekView } from "@/components/schedule/WeekView";
import { MonthView } from "@/components/schedule/MonthView";
import { ListView } from "@/components/schedule/ListView";
import { RoomView } from "@/components/schedule/RoomView";
import { ScheduleDetailModal } from "@/components/schedule/ScheduleDetailModal";
import { ScheduleListFilters, ScheduleListFilters as FiltersType } from "@/components/schedule/ScheduleListFilters";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useGetRoomSchedulesQuery } from "@/store/roomScheduleApi";
import { useGetAllUsersQuery } from "@/store/userApi";
import { useGetRoomsQuery } from "@/store/roomsApi";
import { RoomSchedule, ViewMode, RoomScheduleSearchFilters } from "@/interfaces/schedule/schedule.interface";
import { useShiftTemplatesDictionary } from "@/hooks/useShiftTemplatesDictionary";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Roles } from "@/enums/user.enum";
import { extractApiData } from "@/utils/api";
import { User } from "@/interfaces/user/user.interface";

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

export default function AdminSchedulePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === Roles.SYSTEM_ADMIN;
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedSchedule, setSelectedSchedule] = useState<RoomSchedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listFilters, setListFilters] = useState<FiltersType>({
    sortBy: "date_desc", // Default: latest first
  });

  const queryFilters = useMemo(() => {
    const baseFilters: RoomScheduleSearchFilters = {
      work_date_from: format(startOfMonth(selectedDate), "yyyy-MM-dd"),
      work_date_to: format(endOfMonth(selectedDate), "yyyy-MM-dd"),
    };

    if (viewMode === "list") {
      if (listFilters.employeeId) {
        baseFilters.employee_id = listFilters.employeeId;
      }
      if (listFilters.roomId) {
        baseFilters.room_id = listFilters.roomId;
      }
      if (listFilters.startTime) {
        baseFilters.start_time = listFilters.startTime;
      }
      if (listFilters.endTime) {
        baseFilters.end_time = listFilters.endTime;
      }
      if (listFilters.dateFrom) {
        baseFilters.work_date_from = listFilters.dateFrom;
      }
      if (listFilters.dateTo) {
        baseFilters.work_date_to = listFilters.dateTo;
      }
      if (listFilters.sortBy) {
        if (listFilters.sortBy === "date_asc" || listFilters.sortBy === "date_desc") {
          baseFilters.sort_by = "work_date";
          baseFilters.sort_order = listFilters.sortBy === "date_asc" ? "ASC" : "DESC";
        }
      }
    }

    return baseFilters;
  }, [selectedDate, viewMode, listFilters]);

  const { 
    data: allSchedulesData = [], 
    isLoading: schedulesLoading, 
    isFetching: schedulesFetching,
    error: schedulesError,
    refetch: refetchSchedules 
  } = useGetRoomSchedulesQuery(queryFilters);

  const allSchedules = useMemo(() => {
    return Array.isArray(allSchedulesData) ? allSchedulesData : [];
  }, [allSchedulesData]);

  const { data: usersData } = useGetAllUsersQuery({ 
    page: 1, 
    limit: 1000, 
    isActive: true,
    excludeRole: Roles.SYSTEM_ADMIN
  });

  const employees = useMemo(() => {
    if (!usersData) return [];
    return extractApiData<User>(usersData);
  }, [usersData]);

  const { data: roomsData } = useGetRoomsQuery({
    page: 1,
    limit: 1000,
    is_active: true,
  });

  const rooms = useMemo(() => roomsData?.data || [], [roomsData]);

  const getFilteredSchedules = (): RoomSchedule[] => {
    let filtered: RoomSchedule[] = [];
    
    switch (viewMode) {
      case "day": {
        const dayStr = format(selectedDate, "yyyy-MM-dd");
        filtered = allSchedules.filter((s) => s.work_date === dayStr);
        break;
      }
      case "week": {
        const weekStart = format(startOfWeek(selectedDate, { weekStartsOn: 0 }), "yyyy-MM-dd");
        const weekEnd = format(endOfWeek(selectedDate, { weekStartsOn: 0 }), "yyyy-MM-dd");
        filtered = allSchedules.filter((s) => s.work_date >= weekStart && s.work_date <= weekEnd);
        break;
      }
      case "month":
      case "list": {
        filtered = allSchedules;
        break;
      }
      default:
        filtered = allSchedules;
    }

    return filtered;
  };

  const currentSchedules = getFilteredSchedules();
  const isLoading = schedulesLoading || schedulesFetching;
  const { shiftTemplateMap } = useShiftTemplatesDictionary();

  const getSchedulesForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return currentSchedules.filter((schedule) => schedule.work_date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show":
        return "bg-yellow-100 text-yellow-800";
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

  const handleRefresh = async () => {
    const result = await refetchSchedules();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Update selectedSchedule with fresh data
    if (selectedSchedule) {
      const scheduleId = selectedSchedule.schedule_id;
      if (scheduleId) {
        const updatedSchedules = Array.isArray(result.data) ? result.data : [];
        const updatedSchedule = updatedSchedules.find(s => s.schedule_id === scheduleId);
        if (updatedSchedule) {
          setSelectedSchedule(updatedSchedule);
        }
      }
    }
  };

  const handleListFiltersChange = (filters: FiltersType) => {
    setListFilters(filters);
  };

  const handleListFiltersReset = () => {
    setListFilters({ sortBy: "date_desc" });
  };

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const start = startOfWeek(monthStart, { weekStartsOn: 0 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  // Generate week days for week view
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
  }, [selectedDate]);

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

  const renderWeekView = () => (
    <WeekView
      weekDays={weekDays}
      timeSlots={timeSlots}
      schedules={currentSchedules}
      selectedDate={selectedDate}
      isLoading={isLoading}
      onScheduleClick={handleScheduleClick}
      shiftTemplateMap={shiftTemplateMap}
    />
  );

  const renderMonthView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Monthly Schedule</h2>
          <p className="text-xs lg:text-sm text-gray-600">
            {format(selectedDate, "MMMM yyyy")}
          </p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
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

  const renderListView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Schedules List</h2>
          <p className="text-xs lg:text-sm text-gray-600">
            All schedules for {format(selectedDate, "MMMM yyyy")}
          </p>
        </div>
      </div>

      <ScheduleListFilters
        isAdmin={isAdmin}
        employees={employees}
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
            <h1 className="text-2xl font-bold text-gray-900">
              Schedule Management
            </h1>
            <p className="text-sm text-gray-600">
              View and manage all room schedules
            </p>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <RefreshButton 
              onRefresh={handleRefresh} 
              loading={isLoading}
            />
            <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center text-gray-900">
              {format(selectedDate, "MMMM d, yyyy")}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Left Panel - Calendar and Filters */}
        <ScheduleSidebar selectedDate={selectedDate} onSelectDate={(d) => setSelectedDate(d)} />

        {/* Right Panel - Schedule View */}
        <div className="lg:col-span-2 p-4 lg:p-6">
          <div className="mb-4 lg:mb-6">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <TabsList className="bg-gray-100 w-full grid grid-cols-5">
                <TabsTrigger value="day" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs lg:text-sm">
                  Day
                </TabsTrigger>
                <TabsTrigger value="week" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs lg:text-sm">
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs lg:text-sm">
                  Month
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs lg:text-sm">
                  List
                </TabsTrigger>
                <TabsTrigger value="room" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs lg:text-sm">
                  Room
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {!schedulesError && (
            <>
              {viewMode === "day" && (
                <div>
                  <div className="mb-4 xl:mb-6">
                    <h1 className="text-xl xl:text-2xl font-bold text-gray-900">Daily Schedule</h1>
                    <p className="text-xs xl:text-sm text-gray-600">
                      Schedule for {format(selectedDate, "MMMM d, yyyy")}
                    </p>
                  </div>
                  {renderDayView()}
                </div>
              )}

              {viewMode === "week" && (
                <div>
                  {renderWeekView()}
                </div>
              )}

              {viewMode === "month" && (
                <div>
                  {renderMonthView()}
                </div>
              )}

              {viewMode === "list" && (
                <div>
                  {renderListView()}
                </div>
              )}

              {viewMode === "room" && (
                <div>
                  <div className="mb-4 xl:mb-6">
                    <h1 className="text-xl xl:text-2xl font-bold text-gray-900">Room Schedule</h1>
                    <p className="text-xs xl:text-sm text-gray-600">
                      Schedules grouped by room for {format(selectedDate, "MMMM d, yyyy")}
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
        onScheduleUpdated={handleRefresh}
      />
    </div>
  );
}
