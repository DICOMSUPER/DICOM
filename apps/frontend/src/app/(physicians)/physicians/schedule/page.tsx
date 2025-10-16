"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, User, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { ScheduleSidebar } from "@/components/schedule/ScheduleSidebar";
import { DayView } from "@/components/schedule/DayView";
import { WeekView } from "@/components/schedule/WeekView";
import { MonthView } from "@/components/schedule/MonthView";
import { ListView } from "@/components/schedule/ListView";
import { ScheduleDetailModal } from "@/components/schedule/ScheduleDetailModal";
import { RefreshButton } from "@/components/ui/refresh-button";
import { 
  useGetMySchedulesByDateRangeQuery,
  useGetMySchedulesByDateQuery,
  useGetScheduleStatsQuery,
  useGetShiftTemplatesQuery,
  useGetAvailableRoomsQuery,
  useCreateEmployeeScheduleMutation,
  useUpdateEmployeeScheduleMutation,
  useDeleteEmployeeScheduleMutation,
  useUpdateScheduleStatusMutation,
} from "@/store/employeeScheduleApi";
import { EmployeeSchedule, ViewMode } from "@/interfaces/schedule/schedule.interface";

// Time slots for UI - Updated to match shift templates (8:00 AM - 5:00 PM)

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

// Mock data removed - using API instead

// Mock employees for now - will be replaced with API call
const mockEmployees = [
  { id: "1", firstName: "Dr. Sarah", lastName: "Johnson", role: "physician" },
  { id: "2", firstName: "Dr. Michael", lastName: "Chen", role: "physician" },
  { id: "3", firstName: "Dr. Emily", lastName: "Wilson", role: "physician" },
];

export default function PhysicianSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [notificationCount] = useState(3);
  const [selectedSchedule, setSelectedSchedule] = useState<EmployeeSchedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API calls - using /me endpoint to get current user's schedules
  const { 
    data: schedules = [], 
    isLoading: schedulesLoading, 
    error: schedulesError,
    refetch: refetchSchedules 
  } = useGetMySchedulesByDateQuery({
    date: format(selectedDate, "yyyy-MM-dd")
  });

  const { 
    data: weekSchedules = [], 
    isLoading: weekLoading,
    refetch: refetchWeekSchedules
  } = useGetMySchedulesByDateRangeQuery({
    startDate: format(startOfWeek(selectedDate), "yyyy-MM-dd"),
    endDate: format(endOfWeek(selectedDate), "yyyy-MM-dd")
  });

  const { 
    data: monthSchedules = [], 
    isLoading: monthLoading,
    refetch: refetchMonthSchedules
  } = useGetMySchedulesByDateRangeQuery({
    startDate: format(startOfMonth(selectedDate), "yyyy-MM-dd"),
    endDate: format(endOfMonth(selectedDate), "yyyy-MM-dd")
  });

  const { data: stats } = useGetScheduleStatsQuery({ role: "physician" });
  const { data: shiftTemplates = [] } = useGetShiftTemplatesQuery();
  const { data: rooms = [] } = useGetAvailableRoomsQuery({ date: format(selectedDate, "yyyy-MM-dd") });

  // Mutations
  const [createSchedule] = useCreateEmployeeScheduleMutation();
  const [updateSchedule] = useUpdateEmployeeScheduleMutation();
  const [deleteSchedule] = useDeleteEmployeeScheduleMutation();
  const [updateStatus] = useUpdateScheduleStatusMutation();

  // Get current schedules based on view mode
  const getCurrentSchedules = (): EmployeeSchedule[] => {
    switch (viewMode) {
      case "day":
        return Array.isArray(schedules) ? schedules : [];
      case "week":
        return Array.isArray(weekSchedules) ? weekSchedules : [];
      case "month":
        return Array.isArray(monthSchedules) ? monthSchedules : [];
      case "list":
        return Array.isArray(schedules) ? schedules : [];
      default:
        return Array.isArray(schedules) ? schedules : [];
    }
  };

  const currentSchedules = getCurrentSchedules();
  const isLoading = schedulesLoading || weekLoading || monthLoading;

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const getSchedulesForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return currentSchedules.filter((schedule) => schedule.work_date === dateStr);
  };

  const getScheduleForTimeSlot = (date: Date, hour: number) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return currentSchedules.find(
      (schedule) =>
        schedule.work_date === dateStr &&
        schedule.actual_start_time &&
        parseInt(schedule.actual_start_time.split(":")[0]) === hour
    );
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

  const handleScheduleClick = (schedule: EmployeeSchedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleRefresh = () => {
    // Refetch based on current view mode
    switch (viewMode) {
      case "day":
      case "list":
        refetchSchedules();
        break;
      case "week":
        refetchWeekSchedules();
        break;
      case "month":
        refetchMonthSchedules();
        break;
      default:
        refetchSchedules();
    }
  };

  const renderDayView = () => (
    <DayView
      selectedDate={selectedDate}
      timeSlots={timeSlots}
      schedules={currentSchedules}
      getScheduleForTimeSlot={getScheduleForTimeSlot}
      getStatusColor={getStatusColor}
      isLoading={isLoading}
      onScheduleClick={handleScheduleClick}
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
            <Button variant="outline" size="sm" className="text-xs xl:text-sm" onClick={() => navigateWeek("prev")}>
              <ChevronLeft className="h-3 w-3 xl:h-4 xl:w-4 mr-1" />
              <span className="hidden xl:inline">Previous Week</span>
              <span className="xl:hidden">Prev</span>
            </Button>
            <Button variant="outline" size="sm" className="text-xs xl:text-sm" onClick={() => navigateWeek("next")}>
              <span className="hidden xl:inline">Next Week</span>
              <span className="xl:hidden">Next</span>
              <ChevronRight className="h-3 w-3 xl:h-4 xl:w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          Week of {format(weekStart, "MMMM d")} - {format(weekEnd, "MMMM d, yyyy")}
        </div>

        <WeekView weekDays={weekDays} timeSlots={timeSlots} schedules={currentSchedules} selectedDate={selectedDate} isLoading={isLoading} onScheduleClick={handleScheduleClick} />
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
    const calendarDays = eachDayOfInterval({ start: firstDayOfWeek, end: lastDayOfWeek });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 xl:items-center justify-between mb-1 gap-2">
          <h2 className="text-lg xl:text-xl font-semibold text-gray-900">
            Monthly Schedule
          </h2>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" className="text-xs xl:text-sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-3 w-3 xl:h-4 xl:w-4 mr-1" />
              <span className="hidden xl:inline">Previous Month</span>
              <span className="xl:hidden">Prev</span>
            </Button>
            <Button variant="outline" size="sm" className="text-xs xl:text-sm" onClick={() => navigateMonth("next")}>
              <span className="hidden xl:inline">Next Month</span>
              <span className="xl:hidden">Next</span>
              <ChevronRight className="h-3 w-3 xl:h-4 xl:w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          {format(selectedDate, "MMMM yyyy")}
        </div>

        <MonthView calendarDays={calendarDays} schedules={currentSchedules} selectedDate={selectedDate} isLoading={isLoading} onScheduleClick={handleScheduleClick} />
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Schedules List</h2>
            <p className="text-xs lg:text-sm text-gray-600">
              Your schedules for {format(selectedDate, "MMMM d, yyyy")}
            </p>
          </div>
        </div>

      <ListView schedules={currentSchedules} getStatusColor={getStatusColor} isLoading={isLoading} onScheduleClick={handleScheduleClick} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Schedule
            </h1>
            <p className="text-sm text-gray-600">
              View and manage your clinical schedule and appointments
            </p>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <RefreshButton 
              onRefresh={handleRefresh} 
              loading={isLoading}
              variant="outline"
              size="sm"
              showText={false}
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
        <ScheduleSidebar selectedDate={selectedDate} onSelectDate={(d)=>setSelectedDate(d)} />

        {/* Right Panel - Schedule View */}
        <div className="lg:col-span-2 p-4 lg:p-6">
          {/* View Mode Tabs */}
          <div className="mb-4 lg:mb-6">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList className="bg-gray-100 w-full grid grid-cols-4">
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
              </TabsList>
            </Tabs>
          </div>

          {/* Error State */}
          {schedulesError && !isLoading && (
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
          )}

          {/* Content - Skeleton loading is handled within each view component */}
          {!schedulesError && (
            <>
              {viewMode === "day" && (
                <div>
                  <div className="mb-4 xl:mb-6">
                    <h1 className="text-xl xl:text-2xl font-bold text-gray-900">Daily Schedule</h1>
                    <p className="text-xs xl:text-sm text-gray-600">
                      Your schedule for {format(selectedDate, "MMMM d, yyyy")}
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