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
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(roomService)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4 text-green-600" />
            </Button>
          )}
          {onEditRoomService && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditRoomService(roomService)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          {onDeleteRoomService && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteRoomService(roomService)}
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
    />
  );
};

