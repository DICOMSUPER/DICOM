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
import { Search, X, RotateCcw } from "lucide-react";
import {
  EncounterPriorityLevel,
  EncounterStatus,
  EncounterType,
} from "@/enums/patient-workflow.enum";
import DatePickerDropdown from "../radiologist/date-picker";
import { Services } from "@/interfaces/user/service.interface";

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
  onSearch?: () => void;
  onReset?: () => void;
  isSearching?: boolean;
  className?: string;
}) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  return (
    <div className={`border-border mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
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
        </div>
        <div className="flex gap-2 flex-wrap">
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
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Priority</SelectItem>
              {priorityOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={type || "all"}
            onValueChange={(value) =>
              onTypeChange(
                value === "all" ? undefined : (value as EncounterType)
              )
            }
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Type</SelectItem>
              {typeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) =>
              onStatusChange(
                value === "all" ? undefined : (value as EncounterStatus)
              )
            }
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {serviceOptions && serviceOptions.length > 0 && (
            <Select
              value={serviceId || "all"}
              onValueChange={(value) =>
                onServiceIdChange(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent className="border-border">
                <SelectItem value="all">All Services</SelectItem>
                {serviceOptions.map((option) => (
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
          )}
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
              placeholder="From Date"
            />
            {startDate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onStartDateChange(undefined)}
                className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
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
              placeholder="To Date"
            />
            {endDate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEndDateChange(undefined)}
                className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {onReset && (
            <Button variant="outline" onClick={onReset} className="whitespace-nowrap h-9 px-4">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          {onSearch && (
            <Button
              onClick={onSearch}
              disabled={isSearching}
              className="h-9 px-4"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
