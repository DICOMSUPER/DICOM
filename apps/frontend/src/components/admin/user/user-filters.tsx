"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import { Department } from "@/common/interfaces/user/department.interface";
import { Roles } from "@/common/enums/user.enum";

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  departments?: Department[];
  onSearch?: () => void;
  onReset?: () => void;
  isSearching?: boolean;
  className?: string;
}

export function UserFilters({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleChange,
  departmentFilter,
  onDepartmentChange,
  statusFilter,
  onStatusChange,
  departments = [],
  onSearch,
  onReset,
  isSearching = false,
  className = "",
}: UserFiltersProps) {
  const hasActiveFilters = searchTerm || roleFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all';

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  const roleOptions = Object.values(Roles).map(role => ({
    value: role,
    label: role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  }));

  return (
    <div className={`border-border mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="Search users, emails, names..."
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
          <Select value={roleFilter} onValueChange={onRoleChange}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Roles</SelectItem>
              {roleOptions.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-40 h-9">
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

