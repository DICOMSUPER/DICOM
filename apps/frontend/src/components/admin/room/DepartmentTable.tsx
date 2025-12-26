"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Building2, Phone, Mail } from "lucide-react";
import { Department } from "@/common/interfaces/user/department.interface";
import { DataTable } from "@/components/ui/data-table";
import { SortConfig } from "@/components/ui/data-table";
import { formatRole } from "@/common/utils/role-formatter";
import { formatDateTime } from "@/common/utils/format-status";

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
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
  total?: number;
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
  onSort,
  initialSort,
  total,
}) => {
  const columns = [
    {
      header: "Department Code",
      sortable: true,
      sortField: "departmentCode",
      cell: (department: Department) => (
        <div className="font-medium text-blue-600">
          {department.departmentCode}
        </div>
      ),
    },
    {
      header: "Department Name",
      sortable: true,
      sortField: "departmentName",
      cell: (department: Department) => (
        <div className="text-foreground">{department.departmentName}</div>
      ),
    },
    {
      header: "Status",
      headerClassName: "text-center",
      sortable: false,
      cell: (department: Department) => (
        <div className="flex justify-center">
          {getStatusBadge(department.isActive)}
        </div>
      ),
    },
    {
      header: "Head Department",
      cell: (department: Department) => (
        <div className="text-foreground">
          {department.headDepartment
            ? `${department.headDepartment.firstName} ${department.headDepartment.lastName}`
            : "—"}
        </div>
      ),
    },
    {
      header: "Contact",
      cell: (department: Department) => (
        <div className="text-foreground">
          {department.headDepartment?.email ? (
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" />
              {department.headDepartment.email}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-foreground mt-1">
              <Mail className="w-3 h-3" />
              <span className="text-foreground">No email</span>
            </div>
          )}
          {department.headDepartment?.phone ? (
            <div className="flex items-center gap-2 text-sm text-foreground mt-1">
              <Phone className="w-3 h-3" />
              {department.headDepartment.phone}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-foreground mt-1">
              <Phone className="w-3 h-3" />
              <span className="text-foreground">No phone number</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Role",
      cell: (department: Department) => (
        <div className="text-foreground">
          {department.headDepartment?.role
            ? formatRole(department.headDepartment.role)
            : "—"}
        </div>
      ),
    },
    {
      header: "Description",
      cell: (department: Department) => (
        <div className="max-w-[250px] truncate text-foreground">
          {department.description}
        </div>
      ),
    },
    {
      header: "Room Count",
      cell: (department: Department) => (
        <div className="text-foreground">{department.rooms?.length || 0}</div>
      ),
    },
    {
      header: "Created",
      sortable: true,
      sortField: "createdAt",
      cell: (department: Department) => (
        <div className="text-foreground text-sm">
          {formatDateTime(department.createdAt)}
        </div>
      ),
    },
    {
      header: "Updated",
      sortable: true,
      sortField: "updatedAt",
      cell: (department: Department) => (
        <div className="text-foreground text-sm">
          {formatDateTime(department.updatedAt)}
        </div>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-center",
      cell: (department: Department) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(department)}
              className="h-8 text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}
          {onEditDepartment && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditDepartment(department)}
              className="h-8 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {onDeleteDepartment && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteDepartment(department)}
              className="h-8 text-xs font-medium border-red-200 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
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
      onSort={onSort}
      initialSort={initialSort}
      total={total}
    />
  );
};
