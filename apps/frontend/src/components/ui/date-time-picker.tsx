"use client";

import * as React from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/common/lib/utils";

interface DateTimePickerProps {
  value?: string; // ISO string or datetime-local format
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time",
  disabled = false,
  className,
  error = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  // Parse the value into Date and time string
  const parseValue = React.useMemo(() => {
    if (!value) return { date: undefined, time: "" };
    
    try {
      // Try parsing as datetime-local format (YYYY-MM-DDTHH:mm) first
      const match = value.match(/(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/);
      if (match) {
        const dateStr = match[1];
        const timeStr = match[2] || "";
        const date = new Date(dateStr + "T00:00:00");
        if (!isNaN(date.getTime())) {
          return { date, time: timeStr };
        }
      }
      
      // Try parsing as ISO string
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return { date, time: `${hours}:${minutes}` };
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    return { date: undefined, time: "" };
  }, [value]);

  const { date, time } = parseValue;

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;
    
    const year = newDate.getFullYear();
    const month = (newDate.getMonth() + 1).toString().padStart(2, "0");
    const day = newDate.getDate().toString().padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    
    if (time) {
      // Combine date and time
      const datetimeStr = `${dateStr}T${time}`;
      onChange?.(datetimeStr);
    } else {
      // Just set the date part
      onChange?.(dateStr);
    }
  };

  const handleTimeChange = (newTime: string) => {
    if (!date) {
      // If no date selected, use today
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const day = today.getDate().toString().padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      onChange?.(`${dateStr}T${newTime}`);
    } else {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      onChange?.(`${dateStr}T${newTime}`);
    }
  };

  const displayValue = React.useMemo(() => {
    if (!value) return "";
    
    try {
      const parsed = parseValue();
      if (parsed.date) {
        const dateStr = parsed.date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const timeStr = parsed.time || "";
        return timeStr ? `${dateStr} ${timeStr}` : dateStr;
      }
    } catch (e) {
      // Ignore formatting errors
    }
    
    return value;
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-foreground",
            error && "border-red-500",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50" align="start" sideOffset={4}>
        <div className="p-3 space-y-4">
          <div>
            <div className="mb-2 text-sm font-medium text-foreground">Date</div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              initialFocus
            />
          </div>
          <div>
            <div className="mb-2 text-sm font-medium text-foreground">Time</div>
            <TimePicker
              value={time}
              onChange={handleTimeChange}
              placeholder="HH:MM"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

