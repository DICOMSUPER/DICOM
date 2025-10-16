"use client";

import { Calendar } from "@/components/ui/calendar";

interface ScheduleSidebarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function ScheduleSidebar({ selectedDate, onSelectDate }: ScheduleSidebarProps) {
  return (
    <div className="bg-gray-50 border-r-0 lg:border-r border-b lg:border-b-0 border-gray-200 p-4 lg:p-6">
      {/* Calendar Section */}
      <div>
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
    </div>
  );
}


