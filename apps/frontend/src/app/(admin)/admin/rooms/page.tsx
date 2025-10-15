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

interface Department {
  id: string;
  name: string;
  total_rooms: number;
  available_rooms: number;
  occupied_rooms: number;
}

interface RoomData {
  id: string;
  room_number: string;
  room_type: string;
  status: string;
  department_name: string;
  patient_name: string | null;
  doctor_name: string | null;
}

export default function page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<RoomData[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [roomTypes, setRoomTypes] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, selectedDepartment, searchQuery, statusFilter, typeFilter]);

  const loadData = () => {
    // Mock departments
    const mockDepartments: Department[] = [
      { id: '1', name: 'Cardiology', total_rooms: 10, available_rooms: 4, occupied_rooms: 6 },
      { id: '2', name: 'Neurology', total_rooms: 8, available_rooms: 3, occupied_rooms: 5 },
      { id: '3', name: 'Pediatrics', total_rooms: 12, available_rooms: 7, occupied_rooms: 5 },
    ];
    setDepartments(mockDepartments);

    // Mock rooms
    const mockRooms: RoomData[] = [
      { id: 'r1', room_number: '101', room_type: 'Single', status: 'available', department_name: 'Cardiology', patient_name: null, doctor_name: null },
      { id: 'r2', room_number: '102', room_type: 'Double', status: 'occupied', department_name: 'Cardiology', patient_name: 'John Doe', doctor_name: 'Dr. Smith' },
      { id: 'r3', room_number: '201', room_type: 'Single', status: 'reserved', department_name: 'Neurology', patient_name: 'Alice', doctor_name: 'Dr. Brown' },
      { id: 'r4', room_number: '202', room_type: 'Double', status: 'available', department_name: 'Neurology', patient_name: null, doctor_name: null },
      { id: 'r5', room_number: '301', room_type: 'Suite', status: 'maintenance', department_name: 'Pediatrics', patient_name: null, doctor_name: null },
    ];
    setRooms(mockRooms);

    // Set room types
    const types = Array.from(new Set(mockRooms.map((r) => r.room_type)));
    setRoomTypes(types);

    setLoading(false);
  };

  const filterRooms = () => {
    let filtered = [...rooms];

    if (selectedDepartment !== 'all') {
      const dept = departments.find((d) => d.id === selectedDepartment);
      if (dept) {
        filtered = filtered.filter((r) => r.department_name === dept.name);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((r) => r.room_type === typeFilter);
    }

    setFilteredRooms(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'occupied':
        return <Badge className="bg-red-100 text-red-800">Occupied</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      case 'reserved':
        return <Badge className="bg-blue-100 text-blue-800">Reserved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const topDepartments = departments
    .sort((a, b) => b.total_rooms - a.total_rooms)
    .slice(0, 3);

  if (loading) {
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

        {/* Top Departments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {topDepartments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-base font-semibold mb-4">{dept.name}</h3>
              <div className="mb-4">
                <div className="text-3xl font-bold">{dept.total_rooms}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">Available: {dept.available_rooms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">Occupied: {dept.occupied_rooms}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex items-center gap-4 px-6 py-3 overflow-x-auto">
              <button
                onClick={() => setSelectedDepartment('all')}
                className={`px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedDepartment === 'all' ? 'text-black border-b-2 border-black' : 'text-gray-600 hover:text-black'
                }`}
              >
                All Departments
              </button>
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedDepartment === dept.id ? 'text-black border-b-2 border-black' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>

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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No rooms found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium text-blue-600">{room.room_number}</TableCell>
                      <TableCell>{room.room_type}</TableCell>
                      <TableCell>{getStatusBadge(room.status)}</TableCell>
                      <TableCell>{room.patient_name || <span className="text-gray-400">—</span>}</TableCell>
                      <TableCell>{room.doctor_name || <span className="text-gray-400">—</span>}</TableCell>
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
                            <DropdownMenuItem>Assign Patient</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
