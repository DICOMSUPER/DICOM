'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Power, Users, Mail, Phone } from 'lucide-react';
import { User } from '@/interfaces/user/user.interface';
import { DataTable } from '@/components/ui/data-table';
import { SortConfig } from '@/components/ui/data-table';
import { formatDateTime } from '@/utils/format-status';

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
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(user)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4 text-green-600" />
            </Button>
          )}
          {onEditUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditUser(user)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          {onToggleStatus && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(user)}
              className="h-8 w-8 p-0"
              title={user.isActive ? 'Disable user' : 'Enable user'}
            >
              <Power className={`h-4 w-4 ${user.isActive ? 'text-amber-600' : 'text-green-600'}`} />
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
      onSort={onSort}
      initialSort={initialSort}
    />
  );
};

