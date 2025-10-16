'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Room } from '@/interfaces/user/room.interface';

interface RoomTableProps {
  rooms: Room[];
  getStatusBadge: (status: string) => React.ReactNode;
}

export const RoomTable: React.FC<RoomTableProps> = ({ rooms, getStatusBadge }) => {
  if (!rooms || rooms.length === 0) {
    return (
      <div className="border-t border-gray-200 text-center py-8 text-gray-500">
        No rooms found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Room Code</TableHead>
          <TableHead>Room Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Price/Day</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rooms.map((room) => (
          <TableRow key={room.id}>
            <TableCell className="font-medium text-blue-600">{room.roomCode}</TableCell>
            <TableCell>{room.roomType}</TableCell>
            <TableCell>{getStatusBadge(room.status)}</TableCell>
            <TableCell>{room.department?.departmentName || '—'}</TableCell>
            <TableCell>{Number(room.pricePerDay).toLocaleString()} ₫</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Edit Room</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
