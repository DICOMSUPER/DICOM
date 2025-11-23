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
import { Search, Filter, X } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface ReceptionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  priorityFilter: string;
  onPriorityChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  priorityOptions?: FilterOption[];
  statusOptions?: FilterOption[];
  onFilterClick?: () => void;
  onSearch?: () => void;
  onReset?: () => void;
  isSearching?: boolean;
  className?: string;
}

const defaultPriorityOptions: FilterOption[] = [
  { value: "all", label: "All Priority" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

const defaultStatusOptions: FilterOption[] = [
  { value: "all", label: "All Status" },
  { value: "waiting", label: "Waiting" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export function ReceptionFilters({
  searchTerm,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  statusFilter,
  onStatusChange,
  priorityOptions = defaultPriorityOptions,
  statusOptions = defaultStatusOptions,
  onFilterClick,
  onSearch,
  onReset,
  isSearching = false,
  className = "",
}: ReceptionFiltersProps) {
  const hasActiveFilters =
    searchTerm || priorityFilter !== "all" || statusFilter !== "all";

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

        {/* Patient does not have priority or status */}
        {/* <div className="flex gap-2">
          <Select value={priorityFilter} onValueChange={onPriorityChange}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="border-border">
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-border">
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {onFilterClick && (
            <Button variant="outline" onClick={onFilterClick} className="h-9 px-4">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          )}
          {hasActiveFilters && onReset && (
            <Button variant="outline" onClick={onReset} className="whitespace-nowrap h-9 px-4">
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div> */}
      </div>
    </div>
  );
}
