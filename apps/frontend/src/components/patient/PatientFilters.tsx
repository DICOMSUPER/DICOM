'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  User,
  Droplets
} from 'lucide-react';
import { PatientFiltersProps, PatientSearchFilters } from '@/interfaces/patient/patient-workflow.interface';
import { Gender, BloodType } from '@/enums/patient-workflow.enum';

const PatientFilters: React.FC<PatientFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onSearch,
  loading = false,
}) => {
  const [localFilters, setLocalFilters] = useState<PatientSearchFilters>(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof PatientSearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: PatientSearchFilters = {};
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const handleSearch = () => {
    onSearch();
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Patient Filters</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patientCode">Patient Code</Label>
            <Input
              id="patientCode"
              placeholder="Enter patient code"
              value={localFilters.patientCode || ''}
              onChange={(e) => handleFilterChange('patientCode', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              value={localFilters.firstName || ''}
              onChange={(e) => handleFilterChange('firstName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              value={localFilters.lastName || ''}
              onChange={(e) => handleFilterChange('lastName', e.target.value)}
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={localFilters.gender || ''}
                  onValueChange={(value) => handleFilterChange('gender', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Genders</SelectItem>
                    {Object.values(Gender).map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select
                  value={localFilters.bloodType || ''}
                  onValueChange={(value) => handleFilterChange('bloodType', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Blood Types</SelectItem>
                    {Object.values(BloodType).map((bloodType) => (
                      <SelectItem key={bloodType} value={bloodType}>
                        {bloodType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <Select
                  value={localFilters.isActive?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('isActive', value === '' ? undefined : value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={localFilters.dateOfBirth || ''}
                  onChange={(e) => handleFilterChange('dateOfBirth', e.target.value || undefined)}
                />
              </div>
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="createdFrom">Created From</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="createdFrom"
                    type="date"
                    className="pl-10"
                    value={localFilters.createdFrom || ''}
                    onChange={(e) => handleFilterChange('createdFrom', e.target.value || undefined)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="createdTo">Created To</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="createdTo"
                    type="date"
                    className="pl-10"
                    value={localFilters.createdTo || ''}
                    onChange={(e) => handleFilterChange('createdTo', e.target.value || undefined)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className="flex items-center justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters || loading}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Searching...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </div>
            )}
          </Button>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(localFilters).map(([key, value]) => {
                if (value === undefined || value === '' || value === null) return null;
                
                const displayValue = typeof value === 'boolean' 
                  ? (value ? 'Active' : 'Inactive')
                  : value.toString();
                
                return (
                  <div
                    key={key}
                    className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                  >
                    <span className="font-medium">{key}:</span>
                    <span>{displayValue}</span>
                    <button
                      onClick={() => handleFilterChange(key as keyof PatientSearchFilters, undefined)}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientFilters;
