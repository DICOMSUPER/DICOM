'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetRoomsQuery } from '@/store/roomsApi';
import { useGetDepartmentsQuery } from '@/store/departmentApi';
import { RoomTable } from '@/components/admin/room/RoomTable';
import { DepartmentTable } from '@/components/admin/room/DepartmentTable';
import { Pagination } from '@/components/ui/pagination';
import { Room } from '@/interfaces/user/room.interface';
import { RoomStatus } from '@/enums/room.enum';
import { Department } from '@/interfaces/user/department.interface';
import { check } from 'zod';

export default function Page() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  // ✅ Query rooms với pagination
  const { data: roomsRes, isLoading: roomsLoading } = useGetRoomsQuery({ page, limit });
  const { data: departmentsData, isLoading: deptsLoading } = useGetDepartmentsQuery({ page, limit });

  const rooms: Room[] = roomsRes?.data ?? [];
  const paginationRoom = {
    total: roomsRes?.total ?? 0,
    page: roomsRes?.page ?? 1,
    totalPages: roomsRes?.totalPages ?? 1,
    limit: roomsRes?.limit ?? 10,
  };
  const paginationDepartment = {
    total: departmentsData?.total ?? 0,
    page: departmentsData?.page ?? 1,
    totalPages: departmentsData?.totalPages ?? 1,
    limit: departmentsData?.limit ?? 10,
  };
  const departments: Department[] = departmentsData?.data ?? [];
  console.log("check depart",departments)

  const getStatusRoomBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case RoomStatus.AVAILABLE:
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case RoomStatus.OCCUPIED:
        return <Badge className="bg-red-100 text-red-800">Occupied</Badge>;
      case RoomStatus.MAINTENANCE:
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusDepartmentBadge = (isActive: boolean) => (
    isActive
      ? <Badge className="bg-green-100 text-green-800">Active</Badge>
      : <Badge className="bg-red-100 text-red-800">Inactive</Badge>
  );

  const tabs = [
    {
      key: 'departments',
      label: 'All Departments',

      component: (
        <>
          <DepartmentTable departments={departments} getStatusBadge={getStatusDepartmentBadge} />
          <div className="flex flex-col items-center gap-2 mb-4">
            <Pagination
              currentPage={paginationDepartment.page}
              totalPages={paginationDepartment.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </>
      ),
      addLabel: 'Add Department',
      addLink: '/admin/departments/add',
    },
    {
      key: 'rooms',
      label: 'All Rooms',
      component: (
        <>
          <RoomTable rooms={rooms} getStatusBadge={getStatusRoomBadge} />
          <div className="flex flex-col items-center gap-2 mb-4">
            <Pagination
              currentPage={paginationRoom.page}
              totalPages={paginationRoom.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </>
      ),
      addLabel: 'Add Room',
      addLink: '/admin/rooms/add',
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].key);

  if (roomsLoading || deptsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const activeTabData = tabs.find((tab) => tab.key === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Management</h1>
          <Button
            onClick={() => router.push(activeTabData?.addLink || '/')}
            className="bg-black text-white hover:bg-gray-800 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> {activeTabData?.addLabel || 'Add New'}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-4 border-b border-gray-300 mx-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 text-sm font-medium ${activeTab === tab.key
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-black'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-2">
          {activeTabData?.component}
        </div>
      </div>
    </div>
  );
}
