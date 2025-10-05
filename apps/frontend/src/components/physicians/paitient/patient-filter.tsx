'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, Download } from 'lucide-react';
import { PatientFilters } from '@/interfaces/patient/patient.interface';


interface SearchFiltersProps {
  searchQuery: string;
  filters: PatientFilters;
  onSearchChange: (query: string) => void;
  onFiltersChange: (filters: PatientFilters) => void;
  onExport: () => void;
}

export function SearchFilters({
  searchQuery,
  filters,
  onSearchChange,
  onFiltersChange,
  onExport,
}: SearchFiltersProps) {
  const activeFiltersCount = Object.values(filters).filter(
    (value) => value && value !== 'All'
  ).length;

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="p-2">
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Status
                  </label>
                  <select
                    value={filters.status || 'All'}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        status: e.target.value as PatientFilters['status'],
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Gender
                  </label>
                  <select
                    value={filters.gender || 'All'}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        gender: e.target.value as PatientFilters['gender'],
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="All">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" onClick={onExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}