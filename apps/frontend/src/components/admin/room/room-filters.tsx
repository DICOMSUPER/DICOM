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
import { Search, RotateCcw } from "lucide-react";
import { Department } from "@/common/interfaces/user/department.interface";
import { RoomType, RoomStatus } from "@/common/enums/room.enum";

interface RoomFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentChange: (value: string) => void;
  departments?: Department[];
  onSearch?: () => void;
  onReset?: () => void;
  isSearching?: boolean;
  className?: string;
}

export function RoomFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  departmentFilter,
  onDepartmentChange,
  departments = [],
  onSearch,
  onReset,
  isSearching = false,
  className = "",
}: RoomFiltersProps) {
  const hasActiveFilters =
    searchTerm ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    departmentFilter !== "all";

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  const roomTypeOptions = Object.values(RoomType).map((type) => ({
    value: type,
    label:
      type === "XRAY"
        ? "X-RAY"
        : type === "ULTRASOUND"
        ? "Ultrasound"
        : type === "RESPIRATORY"
        ? "Respiratory"
        : type === "GENERAL"
        ? "General"
        : type,
  }));

  const roomStatusOptions = Object.values(RoomStatus).map((status) => ({
    value: status,
    label: status?.charAt(0) + status.slice(1).toLowerCase(),
  }));

  return (
    <div className={`border-border mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="Search rooms, codes, or descriptions..."
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
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Status</SelectItem>
              {roomStatusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Types</SelectItem>
              {roomTypeOptions.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.departmentName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {onReset && (
            <Button
              variant="outline"
              onClick={onReset}
              className="whitespace-nowrap h-9 px-4"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
