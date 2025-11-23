'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getRoomStatusBadge } from '@/utils/status-badge';
import { useGetRoomsQuery, useDeleteRoomMutation } from '@/store/roomsApi';
import { useGetDepartmentsQuery } from '@/store/departmentApi';
import { RoomTable } from '@/components/admin/room/RoomTable';
import { RoomStatsCards } from '@/components/admin/room/room-stats-cards';
import { RoomFilters } from '@/components/admin/room/room-filters';
import { RoomViewModal } from '@/components/admin/room/room-view-modal';
import { RoomFormModal } from '@/components/admin/room/room-form-modal';
import { RoomDeleteModal } from '@/components/admin/room/room-delete-modal';
import { RoomServiceAssignmentModal } from '@/components/admin/room/room-service-assignment-modal';
import { RefreshButton } from '@/components/ui/refresh-button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Pagination } from '@/components/common/PaginationV1';
import { Room } from '@/interfaces/user/room.interface';
import { RoomStatus } from '@/enums/room.enum';
import { Department } from '@/interfaces/user/department.interface';
import { QueryParams } from '@/interfaces/pagination/pagination.interface';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface ApiError {
  data?: {
    message?: string;
  };
}

export default function Page() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState('all');
  const [appliedTypeFilter, setAppliedTypeFilter] = useState('all');
  const [appliedDepartmentFilter, setAppliedDepartmentFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  const queryParams: QueryParams = useMemo(() => {
    const params: QueryParams = {
      page,
      limit,
    };

    if (appliedSearchTerm.trim()) {
      params.search = appliedSearchTerm.trim();
    }

    if (appliedStatusFilter !== 'all') {
      params.status = appliedStatusFilter;
    }

    if (appliedTypeFilter !== 'all') {
      params.type = appliedTypeFilter;
    }

    if (appliedDepartmentFilter !== 'all') {
      params.departmentId = appliedDepartmentFilter;
    }

    return params;
  }, [page, limit, appliedSearchTerm, appliedStatusFilter, appliedTypeFilter, appliedDepartmentFilter]);

  const {
    data: roomsRes,
    isLoading: roomsLoading,
    error: roomsError,
    refetch: refetchRooms,
  } = useGetRoomsQuery(queryParams);

  const {
    data: departmentsData,
    isLoading: deptsLoading,
    refetch: refetchDepartments,
  } = useGetDepartmentsQuery({ page: 1, limit: 100 });

  const [deleteRoom, { isLoading: isDeletingRoom }] = useDeleteRoomMutation();

  useEffect(() => {
    if (roomsError) {
      const error = roomsError as FetchBaseQueryError;
      const errorMessage = 
        error?.data && 
        typeof error.data === 'object' &&
        'message' in error.data
          ? (error.data as { message: string }).message
          : 'Failed to load room data. Please try again.';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [roomsError]);

  const rooms: Room[] = roomsRes?.data ?? [];
  const departments: Department[] = departmentsData?.data ?? [];
  const paginationMeta = roomsRes ? {
    total: roomsRes.total,
    page: roomsRes.page,
    limit: roomsRes.limit,
    totalPages: roomsRes.totalPages,
    hasNextPage: roomsRes.hasNextPage,
    hasPreviousPage: roomsRes.hasPreviousPage,
  } : null;

  const stats = useMemo(() => {
    const total = roomsRes?.total ?? 0;
    const available = rooms.filter((r) => r.status === RoomStatus.AVAILABLE).length;
    const occupied = rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length;
    const maintenance = rooms.filter((r) => r.status === RoomStatus.MAINTENANCE).length;
    return { total, available, occupied, maintenance };
  }, [rooms, roomsRes?.total]);

  const uniqueRoomTypes = useMemo(() => {
    const types = rooms.map((r) => r.roomType).filter((type): type is NonNullable<typeof type> => type !== undefined && type !== null);
    return [...new Set(types.map(String))];
  }, [rooms]);

  const getStatusRoomBadge = (status: string) => {
    return getRoomStatusBadge(status);
  };

  const handleRefresh = async () => {
    await Promise.all([refetchRooms(), refetchDepartments()]);
  };

  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStatusFilter(statusFilter);
    setAppliedTypeFilter(typeFilter);
    setAppliedDepartmentFilter(departmentFilter);
    setPage(1);
  }, [searchTerm, statusFilter, typeFilter, departmentFilter]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDepartmentFilter('all');
    setAppliedSearchTerm('');
    setAppliedStatusFilter('all');
    setAppliedTypeFilter('all');
    setAppliedDepartmentFilter('all');
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room);
    setIsViewModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsFormModalOpen(true);
  };

  const handleCreateRoom = () => {
    setSelectedRoom(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRoom = async () => {
    if (!selectedRoom) return;
    try {
      await deleteRoom(selectedRoom.id).unwrap();
      toast.success(`Room ${selectedRoom.roomCode} deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedRoom(null);
      await refetchRooms();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error?.data?.message || `Failed to delete room ${selectedRoom.roomCode}`);
    }
  };

  const handleFormSuccess = () => {
    refetchRooms();
  };

  const handleAssignService = (room: Room) => {
    setSelectedRoom(room);
    setIsAssignmentModalOpen(true);
  };

  const handleAssignmentSuccess = () => {
    refetchRooms();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Room Management</h1>
          <p className="text-foreground">Search and manage room records</p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton
            onRefresh={handleRefresh}
            loading={roomsLoading || deptsLoading}
          />
          <Button
            onClick={handleCreateRoom}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Room
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert title="Failed to load rooms" message={error} className="mb-4" />
      )}

      <RoomStatsCards
        totalCount={stats.total}
        availableCount={stats.available}
        occupiedCount={stats.occupied}
        maintenanceCount={stats.maintenance}
        isLoading={roomsLoading}
      />

      <RoomFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        departments={departments}
        roomTypes={uniqueRoomTypes}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        isSearching={roomsLoading}
      />

      <RoomTable
        rooms={rooms}
        getStatusBadge={getStatusRoomBadge}
        isLoading={roomsLoading}
        emptyStateIcon={<Building2 className="h-12 w-12" />}
        emptyStateTitle="No rooms found"
        emptyStateDescription="No rooms match your search criteria. Try adjusting your filters or search terms."
        onViewDetails={handleViewDetails}
        onEditRoom={handleEditRoom}
        onDeleteRoom={handleDeleteRoom}
      />
      {paginationMeta && (
        <Pagination
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}

      <RoomViewModal
        room={selectedRoom}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRoom(null);
        }}
        onEdit={(room) => {
          setIsViewModalOpen(false);
          handleEditRoom(room);
        }}
        onAssignService={(room) => {
          setIsViewModalOpen(false);
          handleAssignService(room);
        }}
      />

      <RoomFormModal
        room={selectedRoom}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedRoom(null);
        }}
        onSuccess={handleFormSuccess}
      />

      <RoomDeleteModal
        room={selectedRoom}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRoom(null);
        }}
        onConfirm={confirmDeleteRoom}
        isDeleting={isDeletingRoom}
      />

      <RoomServiceAssignmentModal
        room={selectedRoom}
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setSelectedRoom(null);
        }}
        onSuccess={handleAssignmentSuccess}
      />
    </div>
  );
}
