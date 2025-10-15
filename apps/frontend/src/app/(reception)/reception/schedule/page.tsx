"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { ScheduleSidebar } from "@/components/schedule/ScheduleSidebar";
import { DayView } from "@/components/schedule/DayView";
import { WeekView } from "@/components/schedule/WeekView";
import { MonthView } from "@/components/schedule/MonthView";
import { ListView } from "@/components/schedule/ListView";

// Backend interfaces based on actual entities
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

interface Room {
  id: string;
  roomCode: string;
  roomType: string;
  description: string;
}

interface ShiftTemplate {
  id: string;
  shiftName: string;
  shiftType: string;
  startTime: string;
  endTime: string;
}

interface EmployeeSchedule {
  schedule_id: string;
  employee_id: string;
  room_id?: string;
  shift_template_id?: string;
  work_date: string;
  actual_start_time?: string;
  actual_end_time?: string;
  schedule_status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  overtime_hours: number;
  created_by?: string;
  employee: Employee;
  room?: Room;
  shift_template?: ShiftTemplate;
}

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

const mockSchedules: EmployeeSchedule[] = [
  {
    schedule_id: "1",
    employee_id: "1",
    room_id: "1",
    work_date: "2025-09-30",
    actual_start_time: "08:00",
    actual_end_time: "12:00",
    schedule_status: "confirmed",
    notes: "Morning shift - Patient registration",
    overtime_hours: 0,
    employee: {
      id: "1",
      firstName: "Sarah",
      lastName: "Johnson",
      role: "reception_staff",
      avatar: "/avatars/sarah-johnson.jpg"
    },
    room: {
      id: "1",
      roomCode: "REC-01",
      roomType: "Reception",
      description: "Main Reception Desk",
    }
  },
  {
    schedule_id: "2",
    employee_id: "1",
    room_id: "2",
    work_date: "2025-09-30",
    actual_start_time: "13:00",
    actual_end_time: "17:00",
    schedule_status: "confirmed",
    notes: "Afternoon shift - Queue management",
    overtime_hours: 0,
    employee: {
      id: "1",
      firstName: "Sarah",
      lastName: "Johnson",
      role: "reception_staff",
      avatar: "/avatars/sarah-johnson.jpg"
    },
    room: {
      id: "2",
      roomCode: "REC-02",
      roomType: "Reception",
      description: "Secondary Reception Desk",
    }
  }
];

const mockEmployees: Employee[] = [
  { id: "1", firstName: "Sarah", lastName: "Johnson", role: "reception_staff" },
  { id: "2", firstName: "John", lastName: "Smith", role: "reception_staff" },
  { id: "3", firstName: "Mike", lastName: "Wilson", role: "reception_staff" },
];

export default function ReceptionSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date("2025-09-30"));
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "list">("day");
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>(mockSchedules);
  const [notificationCount] = useState(3);

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const getSchedulesForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return schedules.filter((schedule) => schedule.work_date === dateStr);
  };

  const getScheduleForTimeSlot = (date: Date, hour: number) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return schedules.find(
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
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
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

  const renderDayView = () => (
    <DayView
      selectedDate={selectedDate}
      timeSlots={timeSlots}
      schedules={schedules}
      getScheduleForTimeSlot={getScheduleForTimeSlot}
      getStatusColor={getStatusColor}
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
        <div className="grid grid-cols-1 xl:grid-cols-2 xl:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg xl:text-xl font-semibold text-gray-900">
            Weekly Schedule
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="text-xs xl:text-sm">
              <ChevronLeft className="h-3 w-3 xl:h-4 xl:w-4 mr-1" />
              <span className="hidden xl:inline">Previous Week</span>
              <span className="xl:hidden">Prev</span>
            </Button>
            <Button variant="outline" size="sm" className="text-xs xl:text-sm">
              <span className="hidden xl:inline">Next Week</span>
              <span className="xl:hidden">Next</span>
              <ChevronRight className="h-3 w-3 xl:h-4 xl:w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          Week of {format(weekStart, "MMMM d")} - {format(weekEnd, "MMMM d, yyyy")}
        </div>

        <WeekView weekDays={weekDays} timeSlots={timeSlots} schedules={schedules} selectedDate={selectedDate} />
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
        <div className="grid grid-cols-1 xl:grid-cols-2 xl:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg xl:text-xl font-semibold text-gray-900">
            Monthly Schedule
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="text-xs xl:text-sm">
              <ChevronLeft className="h-3 w-3 xl:h-4 xl:w-4 mr-1" />
              <span className="hidden xl:inline">Previous Month</span>
              <span className="xl:hidden">Prev</span>
            </Button>
            <Button variant="outline" size="sm" className="text-xs xl:text-sm">
              <span className="hidden xl:inline">Next Month</span>
              <span className="xl:hidden">Next</span>
              <ChevronRight className="h-3 w-3 xl:h-4 xl:w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          {format(selectedDate, "MMMM yyyy")}
        </div>

        <MonthView calendarDays={calendarDays} schedules={schedules} selectedDate={selectedDate} />
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

      <ListView schedules={schedules} getStatusColor={getStatusColor} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Workspace Layout with header on the right of sidebar */}
      <WorkspaceLayout sidebar={<SidebarNav />}>
        {/* Page Header */}
        <div className="pb-4 border-b border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Schedule
              </h1>
              <p className="text-sm text-gray-600">
                View and manage your work schedule
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2">
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
          </div>
        </div>
      </WorkspaceLayout>
    </div>
  );
}
