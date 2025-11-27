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
  statusFilter: string;
  onStatusChange: (value: string) => void;
  statusOptions?: FilterOption[];
  onFilterClick?: () => void;
  onSearch?: () => void;
  onReset?: () => void;
  isSearching?: boolean;
  className?: string;
}

const defaultStatusOptions: FilterOption[] = [
  { value: "all", label: "All Status" },
  { value: "waiting", label: "Waiting" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export function ReceptionFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusOptions = defaultStatusOptions,
  onFilterClick,
  onSearch,
  onReset,
  isSearching = false,
  className = "",
}: ReceptionFiltersProps) {
  const hasActiveFilters = searchTerm || statusFilter !== "all";

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

      </div>
    </div>
  );
}
