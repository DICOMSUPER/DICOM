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
import { QueueFilters } from '@/interfaces/patient/patient-visit.interface';
import { QueueStatus } from '@/enums/patient.enum';
import { useEffect, useState } from 'react';
import useDebounce from '@/hooks/useDebounce';

interface QueueFiltersProps {
  filters: QueueFilters;
  onFiltersChange: (filters: QueueFilters) => void;
  onReset: () => void;
}

export function QueueFiltersSection({
  filters,
  onFiltersChange,
  onReset,
}: QueueFiltersProps) {
  // ✅ Local state for debounced search inputs only
  const [searchInputs, setSearchInputs] = useState({
    encounterId: filters.encounterId || '',
    patientId: filters.patientId || '',
    createdBy: filters.createdBy || '',
  });

  // ✅ Debounce each field separately
  const debouncedEncounterId = useDebounce(searchInputs.encounterId, 500);
  const debouncedPatientId = useDebounce(searchInputs.patientId, 500);
  const debouncedCreatedBy = useDebounce(searchInputs.createdBy, 500);

  // ✅ Fix: Only update when debounced values change
  useEffect(() => {
    onFiltersChange({
      ...filters,
      encounterId: debouncedEncounterId || '',
      patientId: debouncedPatientId || '',
      createdBy: debouncedCreatedBy || '',

    });
  }, [debouncedEncounterId, debouncedPatientId, debouncedCreatedBy]);
  // ✅ Note: Don't include filters or onFiltersChange in deps to avoid infinite loop

  const handleInputChange = (field: keyof typeof searchInputs, value: string) => {
    setSearchInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (key: keyof QueueFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? '' : value,
    });
  };

  const handleNumberChange = (value: string) => {
    const num = value === '' ? undefined : parseInt(value);
    onFiltersChange({
      ...filters,
      queueNumber: num,
    });
  };

  const handleReset = () => {
    // ✅ Reset local search inputs
    setSearchInputs({
      encounterId: '',
      patientId: '',
      createdBy: '',

    });
    onReset();
  };

  // ✅ Count active filters (exclude 'all' and empty values)
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => {
      if (key === 'page' || key === 'limit') return false;
      return value !== undefined && value !== '' && value !== 'all';
    }
  ).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
      {/* Search Inputs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Encounter ID */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search Encounter ID"
            name="encounterId"
            value={searchInputs.encounterId}
            onChange={(e) => handleInputChange('encounterId', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Patient ID */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search Patient ID"
            name="patientId"
            value={searchInputs.patientId}
            onChange={(e) => handleInputChange('patientId', e.target.value)}
            className="pl-10"
          />
        </div>

        <Input
          type="number"
          placeholder="Queue Number"
          value={filters.queueNumber || ''}
          onChange={(e) => handleNumberChange(e.target.value)}
          min="0"
        />
      </div>

      {/* Dropdowns & Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => handleSelectChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={QueueStatus.WAITING}>Waiting</SelectItem>
            <SelectItem value={QueueStatus.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={QueueStatus.COMPLETED}>Completed</SelectItem>
           
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority || 'all'}
          onValueChange={(value) => handleSelectChange('priority', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="Routine">Routine</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
            <SelectItem value="Emergency">Emergency</SelectItem>
            <SelectItem value="Stat">STAT</SelectItem>
          </SelectContent>
        </Select>

        {/* Queue Number */}


        {/* Date From */}
        <Input
          type="date"
          placeholder="Date From"
          value={filters.assignmentDateFrom || ''}
          onChange={(e) => handleSelectChange('assignmentDateFrom', e.target.value)}
          max={filters.assignmentDateTo || undefined}
        />
      </div>

      {/* Date To Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Input
          type="date"
          placeholder="Date To"
          value={filters.assignmentDateTo || ''}
          onChange={(e) => handleSelectChange('assignmentDateTo', e.target.value)}
          min={filters.assignmentDateFrom || undefined}
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button 
          variant="ghost" 
          onClick={handleReset}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All Filters
        </Button>
      </div>
    </div>
  );
}