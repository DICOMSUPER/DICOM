'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Stethoscope } from 'lucide-react';
import { Services } from '@/common/interfaces/user/service.interface';
import { DataTable, SortConfig } from '@/components/ui/data-table';
import { getBooleanStatusBadge } from '@/common/utils/status-badge';
import { formatDateTime } from '@/common/utils/format-status';

interface ServiceTableProps {
  serviceItems: Services[];
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (service: Services) => void;
  onEdit?: (service: Services) => void;
  onDelete?: (service: Services) => void;
  page?: number;
  limit?: number;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export const ServiceTable: React.FC<ServiceTableProps> = ({
  serviceItems,
  getStatusBadge,
  isLoading = false,
  emptyStateIcon = <Stethoscope className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No services found",
  emptyStateDescription = "Create a service to see it listed here.",
  onViewDetails,
  onEdit,
  onDelete,
  page = 1,
  limit = 10,
  onSort,
  initialSort,
}) => {

  const columns = [
    {
      header: 'Service Code',
      sortable: true,
      sortField: 'serviceCode',
      cell: (service: Services) => (
        <div className="font-medium text-blue-600">
          {service.serviceCode || '—'}
        </div>
      ),
    },
    {
      header: 'Service Name',
      sortable: true,
      sortField: 'serviceName',
      cell: (service: Services) => (
        <div className="text-foreground">
          {service.serviceName || '—'}
        </div>
      ),
    },
    {
      header: 'Description',
      sortable: false,
      cell: (service: Services) => (
        <div className="text-foreground">{service.description || '—'}</div>
      ),
    },
    {
      header: 'Created At',
      sortable: true,
      sortField: 'createdAt',
      cell: (service: Services) => (
        <div className="text-foreground text-sm">{formatDateTime(service.createdAt)}</div>
      ),
    },
    {
      header: 'Updated At',
      sortable: true,
      sortField: 'updatedAt',
      cell: (service: Services) => (
        <div className="text-foreground text-sm">{formatDateTime(service.updatedAt)}</div>
      ),
    },
    {
      header: 'Status',
      sortable: false,
      cell: (service: Services) => getStatusBadge(service.isActive ?? true),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (service: Services) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(service)}
              className="h-8 text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(service)}
              className="h-8 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(service)}
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
    <DataTable<Services>
      columns={columns}
      data={serviceItems}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(service) => service.id}
      page={page}
      limit={limit}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
};
