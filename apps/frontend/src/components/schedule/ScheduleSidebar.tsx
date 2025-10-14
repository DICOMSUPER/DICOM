"use client";

import { Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

interface ScheduleSidebarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function ScheduleSidebar({ selectedDate, onSelectDate }: ScheduleSidebarProps) {
  return (
    <div className="bg-gray-50 border-r-0 lg:border-r border-b lg:border-b-0 border-gray-200 p-4 lg:p-6">
      {/* Calendar Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar</h3>
        <p className="text-sm text-gray-600 mb-4">Select a date to view schedules.</p>
        <div className="bg-white rounded-lg border border-gray-200 p-2 lg:p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onSelectDate(date)}
            className="rounded-md border-0 w-full overflow-y-auto"
            captionLayout="dropdown"
            showOutsideDays={true}
          />
        </div>
      </div>

      {/* Filter by Doctor */}
      <div className="mb-4 lg:mb-6">
        <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">Filter by Doctor</h3>
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
  );
}


