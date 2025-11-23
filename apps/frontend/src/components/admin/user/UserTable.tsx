'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Users, Mail, Phone } from 'lucide-react';
import { User } from '@/interfaces/user/user.interface';
import { DataTable } from '@/components/ui/data-table';

interface UserTableProps {
  users: User[];
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (user: User) => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
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
  onDeleteUser,
}) => {

  const getRoleLabel = (role?: string) => {
    if (!role) return '—';
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const columns = [
    {
      header: 'Username',
      cell: (user: User) => (
        <div className="font-medium text-blue-600">
          {user.username}
        </div>
      ),
    },
    {
      header: 'Name',
      cell: (user: User) => (
        <div className="text-foreground">
          {user.firstName} {user.lastName}
        </div>
      ),
    },
    {
      header: 'Email',
      cell: (user: User) => (
        <div className="flex items-center gap-1 text-foreground">
          <Mail className="w-3 h-3" />
          {user.email}
        </div>
      ),
    },
    {
      header: 'Phone',
      cell: (user: User) => (
        <div className="text-foreground">{user.phone || '—'}</div>
      ),
    },
    {
      header: 'Role',
      cell: (user: User) => (
        <div className="text-foreground">{getRoleLabel(user.role)}</div>
      ),
    },
    {
      header: 'Department',
      cell: (user: User) => (
        <div className="text-foreground">{user.department?.departmentName || '—'}</div>
      ),
    },
    {
      header: 'Employee ID',
      cell: (user: User) => (
        <div className="text-foreground">{user.employeeId || '—'}</div>
      ),
    },
    {
      header: 'Status',
      cell: (user: User) => getStatusBadge(user.isActive ?? true),
    },
    {
      header: 'Verified',
      cell: (user: User) => (
        <div className="text-foreground">{user.isVerified ? 'Yes' : 'No'}</div>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (user: User) => (
        <div className="flex items-center gap-2">
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
          {onDeleteUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteUser(user)}
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
    <DataTable<User>
      columns={columns}
      data={users}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(user) => user.id}
    />
  );
};

