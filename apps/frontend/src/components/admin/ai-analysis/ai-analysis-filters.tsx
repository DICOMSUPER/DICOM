"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalysisStatus } from "@/common/enums/image-dicom.enum";

interface AiAnalysisFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  feedbackValue?: string;
  onFeedbackChange?: (value: string) => void;
  onSearch?: () => void;
  onReset?: () => void;
  isSearching?: boolean;
  className?: string;
}

export function AiAnalysisFilters({
  searchTerm,
  onSearchChange,
  statusValue,
  onStatusChange,
  feedbackValue,
  onFeedbackChange,
  onSearch,
  onReset,
  isSearching = false,
  className = "",
}: AiAnalysisFiltersProps) {
  const hasActiveFilters = searchTerm || statusValue || feedbackValue;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
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
              placeholder="Search by model name or analysis message..."
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
          <Select value={statusValue} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value={AnalysisStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={AnalysisStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={AnalysisStatus.PROCESSING}>Processing</SelectItem>
              <SelectItem value={AnalysisStatus.FAILED}>Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={feedbackValue} onValueChange={onFeedbackChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Feedback" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Feedback</SelectItem>
              <SelectItem value="helpful">Helpful</SelectItem>
              <SelectItem value="not_helpful">Not Helpful</SelectItem>
            </SelectContent>
          </Select>

          {onReset && (
            <Button variant="outline" onClick={onReset} className="whitespace-nowrap h-9 px-4">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
