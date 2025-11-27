"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { ShiftType } from "@/enums/schedule.enum";

interface ShiftTemplateFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onSearch?: () => void;
  onReset?: () => void;
  isSearching?: boolean;
  className?: string;
}

export function ShiftTemplateFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  onSearch,
  onReset,
  isSearching = false,
  className = "",
}: ShiftTemplateFiltersProps) {
  const hasActiveFilters = searchTerm || typeFilter !== 'all' || statusFilter !== 'all';

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  const shiftTypeOptions = Object.values(ShiftType).map(type => ({
    value: type,
    label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  }));

  return (
    <div className={`border-border mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="Search templates by name..."
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
          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Shift Type" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Types</SelectItem>
              {shiftTypeOptions.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && onReset && (
            <Button variant="outline" onClick={onReset} className="whitespace-nowrap h-9 px-4">
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

