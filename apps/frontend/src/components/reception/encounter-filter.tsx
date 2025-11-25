"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, Settings, CalendarX } from "lucide-react";
import {
  EncounterPriorityLevel,
  EncounterStatus,
  EncounterType,
} from "@/enums/patient-workflow.enum";
import { Label } from "../ui/label";
import DatePickerDropdown from "../radiologist/date-picker";
import { Services } from "@/interfaces/user/service.interface";
import { useState } from "react";

const defaultPriorityOptions: EncounterPriorityLevel[] = [
  ...Object.values(EncounterPriorityLevel),
];

const defaultStatusOptions: EncounterStatus[] = [
  ...Object.values(EncounterStatus),
];

const defaultTypeOptions: EncounterType[] = [...Object.values(EncounterType)];

export function EncounterFilter({
  searchTerm,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  statusFilter,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  type,
  onTypeChange,
  serviceId,
  onServiceIdChange,
  serviceOptions,
  onStatusChange,
  priorityOptions = defaultPriorityOptions,
  statusOptions = defaultStatusOptions,
  typeOptions = defaultTypeOptions,
  onFilterClick,
  onSearch,
  onReset,
  isSearching = false,
  className = "",
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  priorityFilter?: EncounterPriorityLevel;
  onPriorityChange: (value: EncounterPriorityLevel | undefined) => void;
  statusFilter?: EncounterStatus;
  onStatusChange: (value: EncounterStatus | undefined) => void;
  startDate?: Date | string | undefined;
  onStartDateChange: (value: Date | string | undefined) => void;
  endDate?: Date | string | undefined;
  onEndDateChange: (value: Date | string | undefined) => void;
  type: EncounterType | undefined;
  onTypeChange: (value: EncounterType | undefined) => void;
  serviceId?: string | undefined;
  onServiceIdChange: (value: string | undefined) => void;
  priorityOptions?: EncounterPriorityLevel[];
  statusOptions?: EncounterStatus[];
  typeOptions?: EncounterType[];
  serviceOptions?: Services[];
  onFilterClick?: () => void;
  onSearch?: () => void;
  onReset?: () => void;
  isSearching?: boolean;
  className?: string;
}) {
  const hasActiveFilters =
    searchTerm ||
    priorityFilter !== undefined ||
    statusFilter !== undefined ||
    startDate !== undefined ||
    endDate !== undefined ||
    serviceId !== undefined;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  const [advancedToggled, setAdvancedToggled] = useState<boolean>(false);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
          <Input
            placeholder="Search patients, codes, or names..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {onSearch && (
            <Button
              onClick={onSearch}
              disabled={isSearching}
              className="flex-1 sm:flex-initial"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setAdvancedToggled(!advancedToggled)}
            className="flex-1 sm:flex-initial"
          >
            <Settings className="h-4 w-4 mr-2" />
            Advanced
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {advancedToggled && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-4 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Priority Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <Select
                value={priorityFilter || "all"}
                onValueChange={(value) =>
                  onPriorityChange(
                    value === "all"
                      ? undefined
                      : (value as EncounterPriorityLevel)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type</Label>
              <Select
                value={type || "all"}
                onValueChange={(value) =>
                  onTypeChange(
                    value === "all" ? undefined : (value as EncounterType)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Type</SelectItem>
                  {typeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) =>
                  onStatusChange(
                    value === "all" ? undefined : (value as EncounterStatus)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Service</Label>
              <Select
                value={serviceId || "all"}
                onValueChange={(value) =>
                  onServiceIdChange(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {serviceOptions?.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={option.id as string}
                      title={option.serviceName}
                    >
                      {option.serviceCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">From Date</Label>
              <div className="flex gap-2">
                <DatePickerDropdown
                  date={
                    startDate
                      ? startDate instanceof Date
                        ? startDate
                        : new Date(startDate)
                      : undefined
                  }
                  onSelect={(d: Date | undefined) => onStartDateChange(d)}
                  placeholder="Start Date"
                />
                {startDate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onStartDateChange(undefined)}
                    className="h-10 w-10 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">To Date</Label>
              <div className="flex gap-2">
                <DatePickerDropdown
                  date={
                    endDate
                      ? endDate instanceof Date
                        ? endDate
                        : new Date(endDate)
                      : undefined
                  }
                  onSelect={(d: Date | undefined) => onEndDateChange(d)}
                  placeholder="End Date"
                />
                {endDate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEndDateChange(undefined)}
                    className="h-10 w-10 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            {hasActiveFilters && onReset && (
              <Button variant="outline" onClick={onReset} className="gap-2">
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
            {onFilterClick && (
              <Button onClick={onFilterClick} className="gap-2">
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Badge */}
      {hasActiveFilters && !advancedToggled && (
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Filter className="h-4 w-4" />
          <span>Active filters applied</span>
          {onReset && (
            <Button
              variant="link"
              size="sm"
              onClick={onReset}
              className="h-auto p-0 text-primary hover:text-primary/80"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
