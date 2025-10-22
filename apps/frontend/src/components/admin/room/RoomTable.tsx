'use client';

import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Room } from '@/interfaces/user/room.interface';

interface RoomTableProps {
  rooms: Room[];
  getStatusBadge: (status: string) => React.ReactNode;
}

export const RoomTable: React.FC<RoomTableProps> = ({ rooms, getStatusBadge }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(rooms);

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  useEffect(() => {
    let filtered = [...rooms];

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.roomCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (r) => r.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(
        (r) => r.roomType.toLowerCase() === typeFilter.toLowerCase()
      );
    }



    setFilteredRooms(filtered);
  }, [rooms, searchQuery, statusFilter, typeFilter, dateRange]);

  if (!rooms || rooms.length === 0) {
    return (
      <div className="border-t border-gray-200 text-center py-8 text-gray-500">
        No rooms found
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search + Date range */}
        <div className="relative flex-1 flex gap-2">
          <div className="relative mx-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-20 bg-gray-50 border border-black-200  focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Date range filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal min-w-[260px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM dd, yyyy')} -{' '}
                      {format(dateRange.to, 'MMM dd, yyyy')}
                    </>
                  ) : (
                    format(dateRange.from, 'MMM dd, yyyy')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range: any) => {
                  if (range?.from) {
                    setDateRange({
                      from: range.from,
                      to: range.to || range.from,
                    });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Filter by:</span>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] border-black-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="OCCUPIED">Occupied</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="RESERVED">Reserved</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]  border-black-200">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {[...new Set(rooms.map((r) => r.roomType))].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]  border-black-200">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Department</SelectItem>
              {[...new Set(rooms.map((r) => r.roomType))].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border bg-white rounded-lg shadow-sm relative">
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-white z-10">Room Code</TableHead>
              <TableHead>Room Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Price/Day</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Has TV</TableHead>
              <TableHead>Has AC</TableHead>
              <TableHead>Has WiFi</TableHead>
              <TableHead>Telephone</TableHead>
              <TableHead>Bathroom</TableHead>
              <TableHead>Oxygen</TableHead>
              <TableHead>Nurse Call</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="sticky right-0 bg-white z-10 text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredRooms.map((room) => (
              <TableRow key={room.id} className="text-center">
                <TableCell className="font-medium text-blue-600 sticky left-0 bg-white z-10">
                  {room.roomCode}
                </TableCell>
                <TableCell>{room.roomType}</TableCell>
                <TableCell>{getStatusBadge(room.status)}</TableCell>
                <TableCell>{room.department?.departmentName || '—'}</TableCell>
                <TableCell>{room.floor}</TableCell>
                <TableCell>{room.capacity}</TableCell>
                <TableCell>{Number(room.pricePerDay).toLocaleString()} ₫</TableCell>
                <TableCell className="max-w-[250px] truncate">{room.description}</TableCell>
                <TableCell>{room.hasTV ? '✅' : '❌'}</TableCell>
                <TableCell>{room.hasAirConditioning ? '✅' : '❌'}</TableCell>
                <TableCell>{room.hasWiFi ? '✅' : '❌'}</TableCell>
                <TableCell>{room.hasTelephone ? '✅' : '❌'}</TableCell>
                <TableCell>{room.hasAttachedBathroom ? '✅' : '❌'}</TableCell>
                <TableCell>{room.hasOxygenSupply ? '✅' : '❌'}</TableCell>
                <TableCell>{room.hasNurseCallButton ? '✅' : '❌'}</TableCell>
                <TableCell className="max-w-[250px] truncate">{room.notes}</TableCell>
                <TableCell className="sticky right-0 bg-white z-10 text-center">
                  <div className="flex justify-center">
                    <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:bg-yellow-50">
                      <Edit className="h-4 w-4 text-yellow-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:bg-red-50">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
