'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Power, Users, Mail, Phone } from 'lucide-react';
import { User } from '@/common/interfaces/user/user.interface';
import { DataTable } from '@/components/ui/data-table';
import { SortConfig } from '@/components/ui/data-table';
import { formatDateTime } from '@/common/utils/format-status';

interface UserTableProps {
  users: User[];
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (user: User) => void;
  onEditUser?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  page?: number;
  limit?: number;
  total?: number;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  getStatusBadge,
  isLoading = false,
  emptyStateIcon = <Users className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No users found",
  emptyStateDescription = "Create a user to see it listed here.",
  onViewDetails,
  onEditUser,
  onToggleStatus,
  page = 1,
  limit = 10,
  total,
  onSort,
  initialSort,
}) => {

  const getRoleLabel = (role?: string) => {
    if (!role) return '—';
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const columns = [
    {
      header: 'Username',
      sortable: true,
      sortField: 'username',
      cell: (user: User) => (
        <div className="font-medium text-blue-600">
          {user.username}
        </div>
      ),
    },
    {
      header: 'Name',
      sortable: false,
      cell: (user: User) => (
        <div className="text-foreground">
          {user.firstName} {user.lastName}
        </div>
      ),
    },
    {
      header: 'Email',
      sortable: true,
      sortField: 'email',
      cell: (user: User) => (
        <div className="flex items-center gap-1 text-foreground">
          <Mail className="w-3 h-3" />
          {user.email}
        </div>
      ),
    },
    {
      header: 'Phone',
      sortable: false,
      cell: (user: User) => (
        <div className="text-foreground">{user.phone || '—'}</div>
      ),
    },
    {
      header: 'Role',
      sortable: false,
      cell: (user: User) => (
        <div className="text-foreground">{getRoleLabel(user.role)}</div>
      ),
    },
    {
      header: 'Department',
      sortable: false,
      cell: (user: User) => (
        <div className="text-foreground">{user.department?.departmentName || '—'}</div>
      ),
    },
    {
      header: 'Employee ID',
      sortable: true,
      sortField: 'employeeId',
      cell: (user: User) => (
        <div className="text-foreground">{user.employeeId || '—'}</div>
      ),
    },
    {
      header: 'Status',
      headerClassName: 'text-center',
      sortable: false,
      cell: (user: User) => getStatusBadge(user.isActive ?? true),
    },
    {
      header: 'Verified',
      sortable: false,
      cell: (user: User) => (
        <div className="text-foreground">{user.isVerified ? 'Yes' : 'No'}</div>
      ),
    },
    {
      header: 'Created',
      sortable: true,
      sortField: 'createdAt',
      cell: (user: User) => (
        <div className="text-foreground text-sm">{formatDateTime(user.createdAt)}</div>
      ),
    },
    {
      header: 'Updated',
      sortable: true,
      sortField: 'updatedAt',
      cell: (user: User) => (
        <div className="text-foreground text-sm">{formatDateTime(user.updatedAt)}</div>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (user: User) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(user)}
              className="h-8 text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}
          {onEditUser && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditUser(user)}
              className="h-8 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {onToggleStatus && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(user)}
              title={user.isActive ? 'Disable user' : 'Enable user'}
              className={`h-8 text-xs font-medium ${user.isActive ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
            >
              <Power className="h-3.5 w-3.5 mr-1.5" />
              {user.isActive ? 'Disable' : 'Enable'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<User>
      columns={columns}
      data={users}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(user) => user.id}
      page={page}
      limit={limit}
      total={total}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
};

