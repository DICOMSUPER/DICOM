"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, User, Trash2, Edit, Search, Filter, AlertCircle, RefreshCw, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { ScheduleSidebar } from "@/components/schedule/ScheduleSidebar";
import { DayView } from "@/components/schedule/DayView";
import { WeekView } from "@/components/schedule/WeekView";
import { MonthView } from "@/components/schedule/MonthView";
import { ListView } from "@/components/schedule/ListView";
import { 
  useGetRoomSchedulesQuery, 
  useDeleteRoomScheduleMutation,
  useGetShiftTemplatesQuery,
  useGetRoomsQuery,
  useGetScheduleStatsQuery,
} from "@/store/scheduleApi";
import { useGetAllUsersQuery } from "@/store/userApi";
import { toast } from "sonner";
import { ScheduleForm } from "@/components/admin/schedules/ScheduleForm";
import { ScheduleStatsCards } from "@/components/admin/schedules/ScheduleStatsCards";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { ViewMode } from "@/interfaces/schedule/schedule.interface";

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-yellow-100 text-yellow-800",
};

const statusLabels = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

interface PageProps {
  params?: Promise<any>;
  searchParams?: Promise<any>;
}
export default function ScheduleManagementPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "list">("day");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);

  // Get current month range (fetch once per month)
  const getCurrentMonthRange = () => {
    return {
      work_date_from: format(startOfMonth(selectedDate), "yyyy-MM-dd"),
      work_date_to: format(endOfMonth(selectedDate), "yyyy-MM-dd"),
    };
  };

  // Fetch data for entire month
  const { 
    data: schedulesData, 
    isLoading: schedulesLoading, 
    isFetching: schedulesFetching,
    error: schedulesError,
    refetch: refetchSchedules 
  } = useGetRoomSchedulesQuery({
    page: 1,
    limit: 1000, // Fetch all schedules for the month
    search: search || undefined,
    schedule_status: statusFilter !== "all" ? statusFilter : undefined,
    employee_id: employeeFilter !== "all" ? employeeFilter : undefined,
    ...getCurrentMonthRange(),
  });

  const { data: usersData, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useGetAllUsersQuery({ 
    page: 1, 
    limit: 100, 
    isActive: true 
  });

  // Debug logging for users data
  console.log('Users API Debug:', {
    usersData,
    usersLoading,
    usersError,
    usersArray: usersData?.data,
    usersLength: usersData?.data?.length,
    usersDataType: typeof usersData?.data,
    isArray: Array.isArray(usersData?.data),
    fullStructure: JSON.stringify(usersData, null, 2)
  });

  const { data: shiftTemplatesData } = useGetShiftTemplatesQuery({
    page: 1,
    limit: 100,
    is_active: true,
  });

  const { data: roomsData } = useGetRoomsQuery({
    page: 1,
    limit: 100,
    is_active: true,
  });

  const { 
    data: scheduleStats, 
    isLoading: statsLoading, 
    isFetching: statsFetching,
    refetch: refetchStats 
  } = useGetScheduleStatsQuery({
    employee_id: employeeFilter !== "all" ? employeeFilter : undefined,
  });

  const [deleteSchedule, { isLoading: isDeleting }] = useDeleteRoomScheduleMutation();

  const allSchedules = schedulesData?.data || [];
  const total = schedulesData?.total || 0;
  const totalPages = schedulesData?.totalPages || 1;

  // Filter schedules based on current view mode and selected date
  const getFilteredSchedules = () => {
    switch (viewMode) {
      case "day": {
        const dayStr = format(selectedDate, "yyyy-MM-dd");
        return allSchedules.filter((s: any) => s.work_date === dayStr);
      }
      case "week": {
        const weekStart = format(startOfWeek(selectedDate, { weekStartsOn: 0 }), "yyyy-MM-dd");
        const weekEnd = format(endOfWeek(selectedDate, { weekStartsOn: 0 }), "yyyy-MM-dd");
        return allSchedules.filter((s: any) => s.work_date >= weekStart && s.work_date <= weekEnd);
      }
      case "month": {
        // Already fetched for the month, return all
        return allSchedules;
      }
      case "list": {
        // For list view, use all schedules in the month
        return allSchedules;
      }
      default:
        return allSchedules;
    }
  };

  const schedules = getFilteredSchedules();

  // Debug logging
  console.log('Admin Schedule Debug:', {
    schedulesData,
    allSchedulesLength: allSchedules.length,
    filteredSchedulesLength: schedules.length,
    schedulesLoading,
    schedulesError,
    viewMode,
    selectedDate: format(selectedDate, "yyyy-MM-dd"),
    firstSchedule: schedules[0],
  });

  // Extract data arrays from paginated responses with fallback handling
  const users = Array.isArray(usersData?.data) ? usersData.data : 
                Array.isArray(usersData) ? usersData : [];
  const shiftTemplates = Array.isArray(shiftTemplatesData?.data) ? shiftTemplatesData.data : 
                        Array.isArray(shiftTemplatesData) ? shiftTemplatesData : [];
  const rooms = Array.isArray(roomsData?.data) ? roomsData.data : 
                Array.isArray(roomsData) ? roomsData : [];

  // Debug extracted data
  console.log('Extracted Data Debug:', {
    usersLength: users.length,
    shiftTemplatesLength: shiftTemplates.length,
    roomsLength: rooms.length,
    usersFirstItem: users[0],
    usersLoading,
    usersError,
    usersDataStructure: usersData,
    shiftTemplatesDataStructure: shiftTemplatesData,
    roomsDataStructure: roomsData
  });

  // Compute loading state
  const isLoading = schedulesLoading || schedulesFetching;

  const handleDelete = async () => {
    if (!selectedSchedule) return;

    try {
      await deleteSchedule(selectedSchedule.schedule_id).unwrap();
      toast.success("Schedule deleted successfully");
      setIsDeleteOpen(false);
      setSelectedSchedule(null);
      refetchSchedules();
      refetchStats();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete schedule");
    }
  };

  const handleEdit = async (schedule: any) => {
    console.log('Edit button clicked:', { usersLength: users.length, usersLoading, usersData, schedule });
    setSelectedSchedule(schedule);
    
    // Only open modal if users data is loaded
    if (users.length > 0) {
      setIsEditOpen(true);
    } else if (usersLoading) {
      toast.error("Please wait for employees to load...");
    } else {
      // Try to refetch users data
      try {
        console.log('Refetching users data...');
        await refetchUsers();
        // Wait a bit for the data to be processed
        setTimeout(() => {
          if (users.length > 0) {
            setIsEditOpen(true);
          } else {
            toast.error("Failed to load employees. Please try again.");
          }
        }, 100);
      } catch (error) {
        console.error('Error refetching users:', error);
        toast.error("Failed to load employees. Please try again.");
      }
    }
  };

  const handleDeleteClick = (schedule: any) => {
    setSelectedSchedule(schedule);
    setIsDeleteOpen(true);
  };

  const handleCreateClick = async () => {
    console.log('Create button clicked:', { usersLength: users.length, usersLoading, usersData });
    
    // Only open modal if users data is loaded
    if (users.length > 0) {
      setIsCreateOpen(true);
    } else if (usersLoading) {
      toast.error("Please wait for employees to load...");
    } else {
      // Try to refetch users data
      try {
        console.log('Refetching users data...');
        await refetchUsers();
        // Wait a bit for the data to be processed
        setTimeout(() => {
          if (users.length > 0) {
            setIsCreateOpen(true);
          } else {
            toast.error("Failed to load employees. Please try again.");
          }
        }, 100);
      } catch (error) {
        console.error('Error refetching users:', error);
        toast.error("Failed to load employees. Please try again.");
      }
    }
  };

  const handleFormSuccess = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setSelectedSchedule(null);
    refetchSchedules();
    refetchStats();
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

  const handleRefresh = () => {
    // Refetch schedules and stats
    refetchSchedules();
    refetchStats();
  };

  const getSchedulesForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return schedules.filter((schedule: any) => schedule.work_date === dateStr);
  };

  const getScheduleForTimeSlot = (date: Date, hour: number): any => {
    const dateStr = format(date, "yyyy-MM-dd");
    return schedules.find(
      (schedule: any) =>
        schedule.work_date === dateStr &&
        schedule.actual_start_time &&
        parseInt(schedule.actual_start_time.split(":")[0]) === hour
    );
  };

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const timeSlots = [
    { time: "9:00 AM", hour: 9 },
    { time: "10:00 AM", hour: 10 },
    { time: "11:00 AM", hour: 11 },
    { time: "12:00 PM", hour: 12 },
    { time: "13:00 1 PM", hour: 13 },
    { time: "14:00 2 PM", hour: 14 },
    { time: "15:00 3 PM", hour: 15 },
    { time: "16:00 4 PM", hour: 16 },
  ];

  const renderDayView = () => (
    <DayView
      selectedDate={selectedDate}
      timeSlots={timeSlots}
      schedules={schedules as any}
      getScheduleForTimeSlot={getScheduleForTimeSlot}
      getStatusColor={getStatusColor}
      isLoading={isLoading}
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

        <WeekView weekDays={weekDays} timeSlots={timeSlots} schedules={schedules as any} selectedDate={selectedDate} isLoading={isLoading} />
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    
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

        <MonthView calendarDays={calendarDays} schedules={schedules as any} selectedDate={selectedDate} isLoading={isLoading} />
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by employee name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All employees</SelectItem>
              {users.map((user: any) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule List</h2>
        {isLoading ? (
          <div className="space-y-4">
            {/* Table Header Skeleton */}
            <div className="rounded-md border border-border">
              <div className="border-b border-border bg-gray-50 px-6 py-3">
                <div className="grid grid-cols-7 gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              {/* Table Rows Skeleton */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border-b border-border px-6 py-4">
                  <div className="grid grid-cols-7 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : schedules.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-12 w-12 text-gray-400" />}
            title="No schedules found"
            description="No schedules match your current filters. Try adjusting your search criteria or create a new schedule."
          />
        ) : (
            <>
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border">
                      <TableHead className="border-r border-border">Employee</TableHead>
                      <TableHead className="border-r border-border">Work Date</TableHead>
                      <TableHead className="border-r border-border">Work Hours</TableHead>
                      <TableHead className="border-r border-border">Room</TableHead>
                      <TableHead className="border-r border-border">Shift</TableHead>
                      <TableHead className="border-r border-border">Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule: any) => (
                      <TableRow key={schedule.schedule_id} className="border-b border-border">
                        <TableCell className="border-r border-border">
                          <div className="font-medium">
                            {schedule.employee?.firstName} {schedule.employee?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {schedule.employee?.role?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="border-r border-border">
                          {schedule.work_date ? 
                            format(new Date(schedule.work_date), "MM/dd/yyyy") 
                            : "N/A"}
                        </TableCell>
                        <TableCell className="border-r border-border">
                          {schedule.actual_start_time && schedule.actual_end_time ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{schedule.actual_start_time} - {schedule.actual_end_time}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell className="border-r border-border">
                          {schedule.room?.room_code || "N/A"}
                        </TableCell>
                        <TableCell className="border-r border-border">
                          {schedule.shift_template?.shift_name || "N/A"}
                        </TableCell>
                        <TableCell className="border-r border-border">
                          <Badge 
                            className={statusColors[schedule.schedule_status as keyof typeof statusColors]}
                            variant="secondary"
                          >
                            {statusLabels[schedule.schedule_status as keyof typeof statusLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(schedule)}
                              disabled={usersLoading}
                              title={usersLoading ? "Loading employees..." : "Edit schedule"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(schedule)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Page {page} / {totalPages} (Total: {total} schedules)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Employee Schedule Management
            </h1>
            <p className="text-sm text-gray-600">
              View and manage employee schedules
            </p>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <Button onClick={handleCreateClick} disabled={usersLoading}>
              <Plus className="h-4 w-4 mr-2" />
              {usersLoading ? "Loading..." : "Create Schedule"}
            </Button>
            <RefreshButton 
              onRefresh={handleRefresh} 
              loading={isLoading}
              showText={true}
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

      {/* Stats Cards */}
      <ScheduleStatsCards 
        stats={scheduleStats} 
        totalUsers={users.length}
        isLoading={statsLoading || statsFetching}
      />

      {/* Main Content */}
      <div className="flex-1 bg-white grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Left Panel - Calendar and Filters */}
        <ScheduleSidebar selectedDate={selectedDate} onSelectDate={(d)=>setSelectedDate(d)} />

        {/* Right Panel - Schedule View */}
        <div className="lg:col-span-2 p-4 lg:p-6">

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
{/* 
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
                  We couldn't load the schedule data. Please check your connection and try again.
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
            <div>
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
            </div>
          )}
        </div>
      </div>

      {/* Create Schedule Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-border">
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
            <DialogDescription>
              Fill in the information to create a schedule for an employee
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm
            users={users}
            rooms={rooms}
            shiftTemplates={shiftTemplates}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={usersLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-border">
          <DialogHeader>
            <DialogTitle>Update Schedule</DialogTitle>
            <DialogDescription>
              Edit schedule information
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm
            schedule={selectedSchedule}
            users={users}
            rooms={rooms}
            shiftTemplates={shiftTemplates}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsEditOpen(false);
              setSelectedSchedule(null);
            }}
            isLoading={usersLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        schedule={selectedSchedule}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
