'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, RotateCcw } from 'lucide-react';

import { QueueStatus, VisitType } from '@/enums/patient.enum';
import { QueueFilters } from '@/interfaces/patient/patient-visit.interface';

interface QueueFiltersProps {
  searchQueries: {
    regId: string;
    mobileNo: string;
    name: string;
  };
  filters: QueueFilters;
  onSearchChange: (field: string, value: string) => void;
  onFiltersChange: (filters: QueueFilters) => void;
  onReset: () => void;
}

export function QueueFiltersSection({
  searchQueries,
  filters,
  onSearchChange,
  onFiltersChange,
  onReset,
}: QueueFiltersProps) {
  const activeFiltersCount = Object.values(filters).filter(
    (value) => value && value !== 'All'
  ).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Reg ID"
            value={searchQueries.regId}
            onChange={(e) => onSearchChange('regId', e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Mobile No"
            value={searchQueries.mobileNo}
            onChange={(e) => onSearchChange('mobileNo', e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Name"
            value={searchQueries.name}
            onChange={(e) => onSearchChange('name', e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.period || 'today'}
          onValueChange={(value) => onFiltersChange({ ...filters, period: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Search
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        <Button 
          variant="ghost" 
          onClick={onReset}
          className="flex items-center gap-2 text-gray-600"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}