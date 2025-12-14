'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Building2, Check, X } from 'lucide-react';
import { Room } from '@/common/interfaces/user/room.interface';
import { DataTable } from '@/components/ui/data-table';
import { SortConfig } from '@/components/ui/data-table';
import { formatDateTime } from '@/common/utils/format-status';

interface RoomTableProps {
  rooms: Room[];
  getStatusBadge: (status: string) => React.ReactNode;
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (room: Room) => void;
  onEditRoom?: (room: Room) => void;
  onDeleteRoom?: (room: Room) => void;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export const RoomTable: React.FC<RoomTableProps> = ({
  rooms,
  getStatusBadge,
  isLoading = false,
  emptyStateIcon = <Building2 className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No rooms found",
  emptyStateDescription = "Create a room to see it listed here.",
  onViewDetails,
  onEditRoom,
  onDeleteRoom,
  onSort,
  initialSort,
}) => {

  const columns = [
    {
      header: 'Room Code',
      sortable: true,
      sortField: 'roomCode',
      cell: (room: Room) => (
        <div className="font-medium text-blue-600">
          {room.roomCode}
        </div>
      ),
    },
    {
      header: 'Room Type',
      sortable: false,
      cell: (room: Room) => (
        <div className="text-foreground">{room.roomType || '—'}</div>
      ),
    },
    {
      header: 'Status',
      sortable: false,
      cell: (room: Room) => getStatusBadge(room.status),
    },
    {
      header: 'Department',
      sortable: false,
      cell: (room: Room) => (
        <div className="text-foreground">{room.department?.departmentName || '—'}</div>
      ),
    },
    {
      header: 'Floor',
      sortable: true,
      sortField: 'floor',
      cell: (room: Room) => (
        <div className="text-foreground">{room.floor !== undefined ? room.floor : '—'}</div>
      ),
    },
    {
      header: 'Capacity',
      sortable: true,
      sortField: 'capacity',
      cell: (room: Room) => (
        <div className="text-foreground">{room.capacity !== undefined ? room.capacity : '—'}</div>
      ),
    },
    {
      header: 'Price/Day',
      cell: (room: Room) => (
        <div className="text-foreground">
          {room.pricePerDay !== undefined 
            ? `${typeof room.pricePerDay === 'number' ? room.pricePerDay.toLocaleString() : Number(room.pricePerDay).toLocaleString()} ₫` 
            : '—'}
        </div>
      ),
    },
    {
      header: 'Description',
      cell: (room: Room) => (
        <div className="max-w-[250px] truncate text-foreground">{room.description || '—'}</div>
      ),
    },
    {
      header: 'Has TV',
      cell: (room: Room) => (
        <div className="flex justify-center">
          {room.hasTV ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
        </div>
      ),
    },
    {
      header: 'Has AC',
      cell: (room: Room) => (
        <div className="flex justify-center">
          {room.hasAirConditioning ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
        </div>
      ),
    },
    {
      header: 'Has WiFi',
      cell: (room: Room) => (
        <div className="flex justify-center">
          {room.hasWiFi ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
        </div>
      ),
    },
    {
      header: 'Telephone',
      cell: (room: Room) => (
        <div className="flex justify-center">
          {room.hasTelephone ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
        </div>
      ),
    },
    {
      header: 'Bathroom',
      cell: (room: Room) => (
        <div className="flex justify-center">
          {room.hasAttachedBathroom ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
        </div>
      ),
    },
    {
      header: 'Oxygen',
      cell: (room: Room) => (
        <div className="flex justify-center">
          {room.hasOxygenSupply ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
        </div>
      ),
    },
    {
      header: 'Nurse Call',
      cell: (room: Room) => (
        <div className="flex justify-center">
          {room.hasNurseCallButton ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
        </div>
      ),
    },
    {
      header: 'Notes',
      cell: (room: Room) => (
        <div className="max-w-[250px] truncate text-foreground">{room.notes}</div>
      ),
    },
    {
      header: 'Created',
      sortable: true,
      sortField: 'createdAt',
      cell: (room: Room) => (
        <div className="text-foreground text-sm">{formatDateTime(room.createdAt)}</div>
      ),
    },
    {
      header: 'Updated',
      sortable: true,
      sortField: 'updatedAt',
      cell: (room: Room) => (
        <div className="text-foreground text-sm">{formatDateTime(room.updatedAt)}</div>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (room: Room) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(room)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4 text-green-600" />
            </Button>
          )}
          {onEditRoom && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditRoom(room)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          {onDeleteRoom && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteRoom(room)}
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
    <DataTable<Room>
      columns={columns}
      data={rooms}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(room) => room.id}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
};
