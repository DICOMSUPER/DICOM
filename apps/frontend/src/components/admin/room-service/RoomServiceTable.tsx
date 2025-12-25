'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Link2, Check, X } from 'lucide-react';
import { ServiceRoom } from '@/common/interfaces/user/service-room.interface';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { SortConfig } from '@/components/ui/data-table';
import { formatDateTime } from '@/common/utils/format-status';

interface RoomServiceTableProps {
  roomServices: ServiceRoom[];
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (roomService: ServiceRoom) => void;
  onEditRoomService?: (roomService: ServiceRoom) => void;
  onDeleteRoomService?: (roomService: ServiceRoom) => void;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
  total?: number;
}

export const RoomServiceTable: React.FC<RoomServiceTableProps> = ({
  roomServices,
  getStatusBadge,
  isLoading = false,
  emptyStateIcon = <Link2 className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No room service assignments found",
  emptyStateDescription = "Create an assignment to see it listed here.",
  onViewDetails,
  onEditRoomService,
  onDeleteRoomService,
  onSort,
  initialSort,
  total,
}) => {

  const columns = [
    {
      header: 'Room Code',
      sortable: false,
      cell: (roomService: ServiceRoom) => (
        <div className="font-medium text-blue-600">
          {roomService.room?.roomCode || '—'}
        </div>
      ),
    },
    {
      header: 'Room Type',
      sortable: false,
      cell: (roomService: ServiceRoom) => (
        <div className="text-foreground">{roomService.room?.roomType || '—'}</div>
      ),
    },
    {
      header: 'Service Name',
      sortable: false,
      cell: (roomService: ServiceRoom) => (
        <div className="font-medium text-foreground">
          {roomService.service?.serviceName || '—'}
        </div>
      ),
    },
    {
      header: 'Service Code',
      sortable: false,
      cell: (roomService: ServiceRoom) => (
        <div className="text-foreground">{roomService.service?.serviceCode || '—'}</div>
      ),
    },
    {
      header: 'Status',
      headerClassName: 'text-center',
      sortable: false,
      cell: (roomService: ServiceRoom) => getStatusBadge(roomService.isActive),
    },
    {
      header: 'Department',
      cell: (roomService: ServiceRoom) => (
        <div className="text-foreground">{roomService.room?.department?.departmentName || '—'}</div>
      ),
    },
    {
      header: 'Notes',
      cell: (roomService: ServiceRoom) => (
        <div className="max-w-[250px] truncate text-foreground">{roomService.notes || '—'}</div>
      ),
    },
    {
      header: 'Created',
      sortable: true,
      sortField: 'createdAt',
      cell: (roomService: ServiceRoom) => (
        <div className="text-foreground text-sm">{formatDateTime(roomService.createdAt)}</div>
      ),
    },
    {
      header: 'Updated',
      sortable: true,
      sortField: 'updatedAt',
      cell: (roomService: ServiceRoom) => (
        <div className="text-foreground text-sm">{formatDateTime(roomService.updatedAt)}</div>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (roomService: ServiceRoom) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(roomService)}
              className="h-8 text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}
          {onEditRoomService && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditRoomService(roomService)}
              className="h-8 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {onDeleteRoomService && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteRoomService(roomService)}
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
    <DataTable<ServiceRoom>
      columns={columns}
      data={roomServices}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(roomService) => roomService.id}
      onSort={onSort}
      initialSort={initialSort}
      total={total}
    />
  );
};

