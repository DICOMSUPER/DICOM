'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Building2, Phone, Mail } from 'lucide-react';
import { Department } from '@/interfaces/user/department.interface';
import { DataTable } from '@/components/ui/data-table';

interface DepartmentTableProps {
  departments: Department[];
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (department: Department) => void;
  onEditDepartment?: (department: Department) => void;
  onDeleteDepartment?: (department: Department) => void;
}

export const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments,
  getStatusBadge,
  isLoading = false,
  emptyStateIcon = <Building2 className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No departments found",
  emptyStateDescription = "Create a department to see it listed here.",
  onViewDetails,
  onEditDepartment,
  onDeleteDepartment,
}) => {
  const columns = [
    {
      header: 'Department Code',
      cell: (department: Department) => (
        <div className="font-medium text-blue-600">
          {department.departmentCode}
        </div>
      ),
    },
    {
      header: 'Department Name',
      cell: (department: Department) => (
        <div className="text-foreground">{department.departmentName}</div>
      ),
    },
    {
      header: 'Status',
      headerClassName: 'text-center',
      cell: (department: Department) => (
        <div className="flex justify-center">
          {getStatusBadge(department.isActive)}
        </div>
      ),
    },
    {
      header: 'Head Department',
      cell: (department: Department) => (
        <div className="text-foreground">
          {department.headDepartment
            ? `${department.headDepartment.firstName} ${department.headDepartment.lastName}`
            : '—'}
        </div>
      ),
    },
    {
      header: 'Contact',
      cell: (department: Department) => (
        <div className="text-foreground">
          {department.headDepartment?.email ? (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {department.headDepartment.email}
            </div>
          ) : (
            <span className="text-foreground">No email</span>
          )}
          {department.headDepartment?.phone && (
            <div className="flex items-center gap-1 text-sm text-foreground mt-1">
              <Phone className="w-3 h-3" />
              {department.headDepartment.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (department: Department) => (
        <div className="text-foreground">{department.headDepartment?.role || '—'}</div>
      ),
    },
    {
      header: 'Description',
      cell: (department: Department) => (
        <div className="max-w-[250px] truncate text-foreground">{department.description}</div>
      ),
    },
    {
      header: 'Room Count',
      cell: (department: Department) => (
        <div className="text-foreground">{department.rooms?.length || 0}</div>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (department: Department) => (
        <div className="flex items-center gap-2">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(department)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4 text-green-600" />
            </Button>
          )}
          {onEditDepartment && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditDepartment(department)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          {onDeleteDepartment && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteDepartment(department)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<Department>
      columns={columns}
      data={departments}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(department) => department.id}
    />
  );
};
