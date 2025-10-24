'use client';

import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Eye, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Department } from '@/interfaces/user/department.interface';

interface DepartmentTableProps {
  departments: Department[];
  getStatusBadge: (isActive: boolean) => React.ReactNode;
}

export const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments,
  getStatusBadge,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(departments);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });

  useEffect(() => {
    let filtered = [...departments];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          d.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.departmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const active = statusFilter === 'active';
      filtered = filtered.filter((d) => d.isActive === active);
    }

    // Date filter (optional: if you have createdAt or updatedAt field)
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((d: any) => {
        if (!d.createdAt) return true;
        const createdDate = new Date(d.createdAt);
        return createdDate >= dateRange.from! && createdDate <= dateRange.to!;
      });
    }

    setFilteredDepartments(filtered);
  }, [departments, searchQuery, statusFilter, dateRange]);

  if (!departments || departments.length === 0) {
    return (
      <div className="border-t border-gray-200 text-center py-8 text-gray-500">
        No departments found
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search + Date range */}
        <div className="relative flex-1 flex gap-2">
          <div className="relative mx-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border border-black-200 focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Date range filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal min-w-[260px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM dd, yyyy')} -{' '}
                      {format(dateRange.to, 'MMM dd, yyyy')}
                    </>
                  ) : (
                    format(dateRange.from, 'MMM dd, yyyy')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="range"
                selected={{
                  from: dateRange.from || undefined,
                  to: dateRange.to || undefined,
                }}
                onSelect={(range: any) => {
                  if (range?.from) {
                    setDateRange({
                      from: range.from,
                      to: range.to || range.from,
                    });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Filter by:</span>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] border-black-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border bg-white rounded-lg shadow-sm relative">
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-white z-10">Department Code</TableHead>
              <TableHead>Department Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Head Department</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Room Count</TableHead>
              <TableHead className="sticky right-0 bg-white z-10 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredDepartments.map((dep) => (
              <TableRow key={dep.id} className="text-center">
                <TableCell className="font-medium text-blue-600 sticky left-0 bg-white z-10">
                  {dep.departmentCode}
                </TableCell>
                <TableCell>{dep.departmentName}</TableCell>
                <TableCell>{getStatusBadge(dep.isActive)}</TableCell>
                <TableCell>
                  {dep.headDepartment
                    ? `${dep.headDepartment.firstName} ${dep.headDepartment.lastName}`
                    : '—'}
                </TableCell>
                <TableCell>{dep.headDepartment?.email || '—'}</TableCell>
                <TableCell>{dep.headDepartment?.phone || '—'}</TableCell>
                <TableCell>{dep.headDepartment?.role || '—'}</TableCell>
                <TableCell className="max-w-[250px] truncate">{dep.description}</TableCell>
                <TableCell>{dep.rooms?.length || 0}</TableCell>

                <TableCell className="sticky right-0 bg-white z-10 text-center">
                  <div className="flex justify-center">
                    <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:bg-yellow-50">
                      <Edit className="h-4 w-4 text-yellow-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:bg-red-50">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
