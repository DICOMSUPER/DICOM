"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Building2, Check, X } from "lucide-react";
import { Room } from "@/common/interfaces/user/room.interface";
import { DataTable } from "@/components/ui/data-table";
import { SortConfig } from "@/components/ui/data-table";
import { formatDateTime } from "@/common/utils/format-status";

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
  total?: number;
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
  total,
}) => {
  const columns = [
    {
      header: "Room Code",
      sortable: true,
      sortField: "roomCode",
      cell: (room: Room) => (
        <div className="font-medium text-blue-600">{room.roomCode}</div>
      ),
    },
    {
      header: "Room Type",
      sortable: false,
      cell: (room: Room) => (
        <div className="text-foreground">{room.roomType || "—"}</div>
      ),
    },
    {
      header: "Status",
      sortable: false,
      cell: (room: Room) => getStatusBadge(room.status),
    },
    {
      header: "Department",
      sortable: false,
      cell: (room: Room) => (
        <div className="text-foreground">
          {room.department?.departmentName || "—"}
        </div>
      ),
    },
    {
      header: "Floor",
      headerClassName: "text-center",
      sortable: true,
      sortField: "floor",
      cell: (room: Room) => (
        <div className="text-foreground text-center">
          {room.floor !== undefined ? room.floor : "—"}
        </div>
      ),
    },
    {
      header: "Capacity",
      headerClassName: "text-center",
      sortable: true,
      sortField: "capacity",
      cell: (room: Room) => (
        <div className="text-foreground text-center">
          {room.capacity !== undefined ? room.capacity : "—"}
        </div>
      ),
    },
    {
      header: "Price/Day",
      headerClassName: "text-center",
      cell: (room: Room) => (
        <div className="text-foreground text-center">
          {room.pricePerDay !== undefined
            ? `${typeof room.pricePerDay === "number"
              ? room.pricePerDay.toLocaleString()
              : Number(room.pricePerDay).toLocaleString()
            } ₫`
            : "—"}
        </div>
      ),
    },
    {
      header: "Description",
      cell: (room: Room) => (
        <div className="max-w-[250px] truncate text-foreground">
          {room.description || "—"}
        </div>
      ),
    },
    {
      header: "Has TV",
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
      header: "Has AC",
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
      header: "Has WiFi",
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
      header: "Telephone",
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
      header: "Bathroom",
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
      header: "Oxygen",
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
      header: "Nurse Call",
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
      header: "Notes",
      cell: (room: Room) => (
        <div className="max-w-[250px] truncate text-foreground">
          {room.notes}
        </div>
      ),
    },
    {
      header: "Created",
      sortable: true,
      sortField: "createdAt",
      cell: (room: Room) => (
        <div className="text-foreground text-sm">
          {formatDateTime(room.createdAt)}
        </div>
      ),
    },
    {
      header: "Updated",
      sortable: true,
      sortField: "updatedAt",
      cell: (room: Room) => (
        <div className="text-foreground text-sm">
          {formatDateTime(room.updatedAt)}
        </div>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-center",
      cell: (room: Room) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(room)}
              className="h-8 text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}
          {onEditRoom && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditRoom(room)}
              className="h-8 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {onDeleteRoom && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteRoom(room)}
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
      total={total}
    />
  );
};
