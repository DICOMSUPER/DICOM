"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

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
    actual_start_time: "12:00",
    actual_end_time: "13:00",
    schedule_status: "confirmed",
    notes: "Check-up",
    overtime_hours: 0,
    employee: {
      id: "1",
      firstName: "Sarah",
      lastName: "Johnson",
      role: "physician",
      avatar: "/avatars/sarah-johnson.jpg"
    },
    room: {
      id: "1",
      roomCode: "CT-01",
      roomType: "CT",
      description: "CT Scanner Room 1",
    }
  },
  {
    schedule_id: "2",
    employee_id: "2",
    room_id: "2",
    work_date: "2025-09-30",
    actual_start_time: "15:00",
    actual_end_time: "16:00",
    schedule_status: "confirmed",
    notes: "Procedure",
    overtime_hours: 0,
    employee: {
      id: "2",
      firstName: "Michael",
      lastName: "Chen",
      role: "physician",
      avatar: "/avatars/michael-chen.jpg"
    },
    room: {
      id: "2",
      roomCode: "CT-02",
      roomType: "CT",
      description: "CT Scanner Room 2",
    }
  }
];

const mockEmployees: Employee[] = [
  { id: "1", firstName: "John", lastName: "Smith", role: "physician" },
  { id: "2", firstName: "Sarah", lastName: "Johnson", role: "physician" },
  { id: "3", firstName: "Mike", lastName: "Wilson", role: "imaging_technician" },
];

export default function ScheduleManagementPage() {
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
    <div className="space-y-0">
      {timeSlots.map((slot, index) => {
        const schedule = getScheduleForTimeSlot(selectedDate, slot.hour);
        
        return (
          <div key={slot.hour} className="grid grid-cols-12 gap-4 h-20">
            <div className="col-span-2 text-sm font-medium text-gray-700">
              {slot.time}
            </div>
            <div className="col-span-10 h-full flex items-center border-t border-gray-200">
              {schedule ? (
                <div className="my-4 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm relative w-full m-2">
                  {/* Left color indicator */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                  
                  <div className="grid grid-cols-2 gap-4 ml-2">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-base">
                          {schedule.employee.firstName} {schedule.employee.lastName}
                        </h4>
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>{schedule.actual_start_time} - {schedule.actual_end_time}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">{schedule.room?.roomCode || 'Consultation'}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(schedule.schedule_status)} border border-blue-400 text-xs`}>
                      {schedule.schedule_status.charAt(0).toUpperCase() + schedule.schedule_status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic m-2">
                  No appointments
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
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

        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-4">
          <div className="text-xs md:text-sm font-medium text-gray-700">Time</div>
          {weekDays.map((day, index) => (
            <div key={index} className={`text-center ${isSameDay(day, selectedDate) ? 'bg-blue-50 rounded-lg p-1 md:p-2' : ''}`}>
              <div className="text-xs md:text-sm font-medium text-gray-700">
                {format(day, "EEE")}
              </div>
              <div className={`text-xs ${isSameDay(day, selectedDate) ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                {format(day, "MMM d")}
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="space-y-0">
              {timeSlots.map((slot) => (
                <div key={slot.hour} className="grid grid-cols-8 gap-4 items-center h-20">
                  <div className="text-xs md:text-sm text-gray-700 font-medium">{slot.time}</div>
                  <div className="col-span-7 h-full border-t border-gray-200">
                    <div className="grid grid-cols-7 gap-4 h-full">
                      {weekDays.map((day, dayIndex) => {
                        const daySchedules = schedules.filter(s => 
                          s.work_date === format(day, "yyyy-MM-dd") && 
                          s.actual_start_time &&
                          parseInt(s.actual_start_time.split(":")[0]) === slot.hour
                        );
                        
                        return (
                          <div key={dayIndex} className={`h-full flex items-center ${isSameDay(day, selectedDate) ? 'bg-blue-50 rounded' : ''}`}>
                            {daySchedules.map((schedule) => (
                              <div key={schedule.schedule_id} className="bg-blue-50 border border-blue-200 rounded p-2 text-xs relative w-full m-1">
                                {/* Left color indicator */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l"></div>
                                
                                <div className="ml-2">
                                  <div className="font-medium text-gray-900 truncate">{schedule.employee.firstName} {schedule.employee.lastName}</div>
                                  <div className="text-gray-600 text-xs">{schedule.actual_start_time} - {schedule.actual_end_time}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Days of week header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-1 md:p-2 text-center text-xs md:text-sm font-medium text-gray-700 bg-gray-50">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const daySchedules = schedules.filter(s => s.work_date === format(day, "yyyy-MM-dd"));
            const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={index} 
                className={`min-h-[60px] md:min-h-[100px] p-1 md:p-2 border border-gray-200 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <div className={`text-xs md:text-sm font-medium ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${isToday ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="mt-1 space-y-1">
                  {daySchedules.slice(0, 2).map((schedule) => (
                    <div key={schedule.schedule_id} className="text-xs bg-blue-50 text-gray-900 rounded px-1 py-0.5 truncate relative border border-blue-200">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-l"></div>
                      <span className="ml-1">{schedule.employee.firstName} {schedule.employee.lastName}</span>
                    </div>
                  ))}
                  {daySchedules.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{daySchedules.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Schedules List</h2>
            <p className="text-xs lg:text-sm text-gray-600">
              All schedules for {format(selectedDate, "MMMM d, yyyy")} • All Doctors
            </p>
          </div>
        </div>

      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div key={schedule.schedule_id} className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 shadow-sm relative">
            {/* Left color indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-center justify-between gap-2 ml-2">
              <div className="flex items-center space-x-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm lg:text-base">
                    {schedule.employee.firstName} {schedule.employee.lastName}
                  </h4>
                  <div className="flex items-center space-x-1 text-xs lg:text-sm text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>{schedule.actual_start_time} - {schedule.actual_end_time}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">{schedule.room?.roomCode || 'Consultation'}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
                  </div>
                  <span className="text-xs md:text-sm text-gray-900 hidden md:block">
                    Dr. {schedule.employee.firstName} {schedule.employee.lastName}
                  </span>
                </div>
                <Badge className={`${getStatusColor(schedule.schedule_status)} border border-blue-400`}>
                  {schedule.schedule_status.charAt(0).toUpperCase() + schedule.schedule_status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* App Header */}
      <AppHeader
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
      />

      {/* Workspace Layout */}
      <WorkspaceLayout sidebar={<SidebarNav />}>
        {/* Page Header */}
        <div className="pb-4 border-b border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Doctor Schedule
              </h1>
              <p className="text-sm text-gray-600">
                Manage and view doctor schedules and appointments
              </p>
            </div>
            <div className="flex items-center space-x-2">
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
          <div className="bg-gray-50 border-r-0 lg:border-r border-b lg:border-b-0 border-gray-200 p-4 lg:p-6">
            {/* Calendar Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Calendar
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select a date to view schedules.
              </p>
              <div className="bg-white rounded-lg border border-gray-200 p-2 lg:p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border-0 w-full"
                  captionLayout="dropdown"
                  showOutsideDays={true}
                />
              </div>
            </div>

            {/* Filter by Doctor */}
            <div className="mb-4 lg:mb-6">
              <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
                Filter by Doctor
              </h3>
              <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                <option>All Doctors</option>
                <option>Dr. John Smith</option>
                <option>Dr. Sarah Johnson</option>
                <option>Dr. Michael Chen</option>
              </select>
            </div>

            {/* Add Appointment Button */}
            <Button className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 text-sm lg:text-base">
              <Plus className="h-4 w-4 mr-2" />
              Add Appointment
            </Button>
          </div>

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
                    Schedule for {format(selectedDate, "MMMM d, yyyy")} • All Doctors
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