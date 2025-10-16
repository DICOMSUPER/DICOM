'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetRoomsQuery } from '@/store/roomsApi';
import { useGetDepartmentsQuery } from '@/store/departmentApi';
import { Room } from '@/interfaces/user/room.interface';
import { Department } from '@/interfaces/user/department.interface';
import { RoomTable } from '@/components/admin/room/RoomTable';



export default function Page() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const { data: roomsData, isLoading: roomsLoading, refetch } = useGetRoomsQuery({});
  const { data: departmentsData, isLoading: deptsLoading } = useGetDepartmentsQuery({});

  const rooms: Room[] = roomsData ?? [];
  const departments: Department[] = departmentsData ?? [];

  console.log("check --> ", departments);

  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (rooms.length > 0) {
      filterRooms();
    }
  }, [rooms, selectedDepartment, searchQuery, statusFilter, typeFilter]);

  const filterRooms = () => {
    let filtered = [...rooms];

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(
        (r) => r.department?.id === selectedDepartment
      );
    }

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
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'AVAILABLE':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'OCCUPIED':
        return <Badge className="bg-red-100 text-red-800">Occupied</Badge>;
      case 'MAINTENANCE':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      case 'RESERVED':
        return <Badge className="bg-blue-100 text-blue-800">Reserved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (roomsLoading || deptsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Rooms by Department</h1>
          <Button
            onClick={() => router.push('/admin/rooms/add')}
            className="bg-black text-white hover:bg-gray-800 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add New Room
          </Button>
        </div>

        {/* Department Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex items-center gap-4 px-6 py-3 overflow-x-auto">
              <button
                onClick={() => setSelectedDepartment('all')}
                className={`px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedDepartment === 'all'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                All Departments
              </button>
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedDepartment === dept.id
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {dept.departmentName}
                </button>
              ))}

            </div>
          </div>

          {/* Search & Filters */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Filter by:</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
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
                  <SelectTrigger className="w-[140px]">
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
              </div>
            </div>

            {/* Table */}
            <RoomTable rooms={filteredRooms} getStatusBadge={getStatusBadge} />
          </div>
        </div>
      </div>
    </div>
  );
}
