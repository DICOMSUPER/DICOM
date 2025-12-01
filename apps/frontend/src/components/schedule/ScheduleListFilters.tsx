"use client";

import { useState } from "react";
import { Filter, X, Clock, Calendar as CalendarIcon, MapPin, User, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { User as UserType } from "@/interfaces/user/user.interface";
import { Room } from "@/interfaces/user/room.interface";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface ScheduleListFilters {
  employeeId?: string;
  roomId?: string;
  startTime?: string;
  endTime?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "date_asc" | "date_desc";
}

interface ScheduleListFiltersProps {
  isAdmin?: boolean;
  employees?: UserType[];
  rooms?: Room[];
  filters: ScheduleListFilters;
  onFiltersChange: (filters: ScheduleListFilters) => void;
  onReset: () => void;
}

export function ScheduleListFilters({
  isAdmin = false,
  employees = [],
  rooms = [],
  filters,
  onFiltersChange,
  onReset,
}: ScheduleListFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = 
    filters.employeeId || 
    filters.roomId || 
    filters.startTime || 
    filters.endTime || 
    filters.dateFrom || 
    filters.dateTo ||
    filters.sortBy !== "date_desc";

  const updateFilter = (key: keyof ScheduleListFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleReset = () => {
    onReset();
    setIsExpanded(false);
  };

  const activeFilterCount = [
    filters.employeeId,
    filters.roomId,
    filters.startTime,
    filters.endTime,
    filters.dateFrom,
    filters.dateTo,
    filters.sortBy !== "date_desc" ? filters.sortBy : null,
  ].filter(Boolean).length;

  const selectedEmployee = filters.employeeId 
    ? employees.find(e => e.id === filters.employeeId)
    : undefined;

  return (
    <div className="bg-white rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs text-white">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs h-7"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs h-7"
          >
            {isExpanded ? "Hide" : "Show"} filters
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-border">
          {/* Employee Filter - Only for System Admin */}
          {isAdmin && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                <User className="h-3 w-3" />
                Employee
              </label>
              <Select
                value={filters.employeeId || "all"}
                onValueChange={(value) => updateFilter("employeeId", value === "all" ? undefined : value)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                      {employee.role && ` (${employee.role.replace(/_/g, ' ')})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Room Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Room
            </label>
            <Select
              value={filters.roomId || "all"}
              onValueChange={(value) => updateFilter("roomId", value === "all" ? undefined : value)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All rooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All rooms</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.roomCode} {room.roomType ? `(${room.roomType})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Time Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Start Time
            </label>
            <TimePicker
              value={filters.startTime || ""}
              onChange={(value) => updateFilter("startTime", value || undefined)}
              placeholder="HH:MM"
            />
          </div>

          {/* End Time Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              End Time
            </label>
            <TimePicker
              value={filters.endTime || ""}
              onChange={(value) => updateFilter("endTime", value || undefined)}
              placeholder="HH:MM"
            />
          </div>

          {/* Date From Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              Date From
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9 text-sm",
                    !filters.dateFrom && "text-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? format(new Date(filters.dateFrom), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                  onSelect={(date) => updateFilter("dateFrom", date ? format(date, "yyyy-MM-dd") : undefined)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date To Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              Date To
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9 text-sm",
                    !filters.dateTo && "text-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateTo ? format(new Date(filters.dateTo), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                  onSelect={(date) => updateFilter("dateTo", date ? format(date, "yyyy-MM-dd") : undefined)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Sort By Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" />
              Sort By Date
            </label>
            <Select
              value={filters.sortBy || "date_desc"}
              onValueChange={(value) => updateFilter("sortBy", value as "date_asc" | "date_desc")}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Sort by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Latest First (Descending)</SelectItem>
                <SelectItem value="date_asc">Oldest First (Ascending)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && !isExpanded && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {selectedEmployee && (
            <Badge variant="secondary" className="text-xs">
              Employee: {selectedEmployee.firstName} {selectedEmployee.lastName}
              <button
                onClick={() => updateFilter("employeeId", undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.roomId && (
            <Badge variant="secondary" className="text-xs">
              Room: {rooms.find(r => r.id === filters.roomId)?.roomCode}
              <button
                onClick={() => updateFilter("roomId", undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.startTime && (
            <Badge variant="secondary" className="text-xs">
              Start: {filters.startTime}
              <button
                onClick={() => updateFilter("startTime", undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.endTime && (
            <Badge variant="secondary" className="text-xs">
              End: {filters.endTime}
              <button
                onClick={() => updateFilter("endTime", undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="text-xs">
              From: {format(new Date(filters.dateFrom), "PPP")}
              <button
                onClick={() => updateFilter("dateFrom", undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="text-xs">
              To: {format(new Date(filters.dateTo), "PPP")}
              <button
                onClick={() => updateFilter("dateTo", undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.sortBy && filters.sortBy !== "date_desc" && (
            <Badge variant="secondary" className="text-xs">
              Sort: {filters.sortBy === "date_asc" ? "Oldest First" : "Latest First"}
              <button
                onClick={() => updateFilter("sortBy", "date_desc")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

