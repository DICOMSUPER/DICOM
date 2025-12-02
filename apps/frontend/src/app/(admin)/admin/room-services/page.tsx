"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getBooleanStatusBadge } from "@/utils/status-badge";
import {
  useGetServiceRoomsPaginatedQuery,
  useGetServiceRoomStatsQuery,
  useDeleteServiceRoomMutation,
} from "@/store/serviceRoomApi";
import { useGetRoomsQuery } from "@/store/roomsApi";
import { useGetServicesQuery } from "@/store/serviceApi";
import { RoomServiceTable } from "@/components/admin/room-service/RoomServiceTable";
import { RoomServiceStatsCards } from "@/components/admin/room-service/room-service-stats-cards";
import { RoomServiceFilters } from "@/components/admin/room-service/room-service-filters";
import { RoomServiceViewModal } from "@/components/admin/room-service/room-service-view-modal";
import { RoomServiceFormModal } from "@/components/admin/room-service/room-service-form-modal";
import { RoomServiceDeleteModal } from "@/components/admin/room-service/room-service-delete-modal";
import { RefreshButton } from "@/components/ui/refresh-button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Pagination } from "@/components/common/PaginationV1";
import { ServiceRoom } from "@/interfaces/user/service-room.interface";
import { Room } from "@/interfaces/user/room.interface";
import { Services } from "@/interfaces/user/service.interface";
import { FilterServiceRoomDto } from "@/interfaces/user/service-room.interface";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SortConfig } from "@/components/ui/data-table";
import { sortConfigToQueryParams } from "@/utils/sort-utils";

interface ApiError {
  data?: {
    message?: string;
  };
}

export default function Page() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [roomFilter, setRoomFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedRoomFilter, setAppliedRoomFilter] = useState("all");
  const [appliedServiceFilter, setAppliedServiceFilter] = useState("all");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [selectedRoomService, setSelectedRoomService] =
    useState<ServiceRoom | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({});

  const queryParams: FilterServiceRoomDto & {
    includeInactive?: boolean;
    includeDeleted?: boolean;
  } = useMemo(() => {
    const params: FilterServiceRoomDto & {
      includeInactive?: boolean;
      includeDeleted?: boolean;
    } = {
      page,
      limit,
      includeInactive: true,
      includeDeleted: true,
    };

    if (appliedSearchTerm.trim()) {
      params.roomCode = appliedSearchTerm.trim();
    }

    if (appliedRoomFilter !== "all") {
      params.roomId = appliedRoomFilter;
    }

    if (appliedServiceFilter !== "all") {
      params.serviceId = appliedServiceFilter;
    }

    if (appliedStatusFilter !== "all") {
      params.isActive = appliedStatusFilter === "true";
    }

    const sortParams = sortConfigToQueryParams(sortConfig);
    Object.assign(params, sortParams);

    return params;
  }, [
    page,
    limit,
    appliedSearchTerm,
    appliedRoomFilter,
    appliedServiceFilter,
    appliedStatusFilter,
    sortConfig,
  ]);

  const {
    data: roomServicesRes,
    isLoading: roomServicesLoading,
    error: roomServicesError,
    refetch: refetchRoomServices,
  } = useGetServiceRoomsPaginatedQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: roomsData,
    isLoading: roomsLoading,
    refetch: refetchRooms,
  } = useGetRoomsQuery({ page: 1, limit: 1000 });

  const {
    data: servicesData,
    isLoading: servicesLoading,
    refetch: refetchServices,
  } = useGetServicesQuery();

  const {
    data: serviceRoomStatsData,
    isLoading: serviceRoomStatsLoading,
    refetch: refetchServiceRoomStats,
  } = useGetServiceRoomStatsQuery();

  const [deleteServiceRoom, { isLoading: isDeletingServiceRoom }] =
    useDeleteServiceRoomMutation();

  useEffect(() => {
    if (roomServicesError) {
      const error = roomServicesError as FetchBaseQueryError;
      const errorMessage =
        error?.data && typeof error.data === "object" && "message" in error.data
          ? (error.data as { message: string }).message
          : "Failed to load room service assignment data. Please try again.";
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [roomServicesError]);

  const roomServices: ServiceRoom[] = roomServicesRes?.data ?? [];
  const rooms: Room[] = roomsData?.data ?? [];
  const services: Services[] = servicesData?.data ?? [];
  const paginationMeta = roomServicesRes
    ? {
        total: roomServicesRes.total,
        page: roomServicesRes.page,
        limit: roomServicesRes.limit,
        totalPages: roomServicesRes.totalPages,
        hasNextPage: roomServicesRes.hasNextPage,
        hasPreviousPage: roomServicesRes.hasPreviousPage,
      }
    : null;

  const stats = useMemo(() => {
    return {
      total: serviceRoomStatsData?.totalAssignments ?? 0,
      active: serviceRoomStatsData?.activeAssignments ?? 0,
      inactive: serviceRoomStatsData?.inactiveAssignments ?? 0,
      totalRooms: serviceRoomStatsData?.uniqueRooms ?? 0,
    };
  }, [serviceRoomStatsData]);

  const getStatusBadge = (isActive: boolean) => {
    return getBooleanStatusBadge(isActive);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchRoomServices(),
        refetchServiceRoomStats(),
        refetchRooms(),
        refetchServices(),
      ]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setAppliedRoomFilter(roomFilter);
    setAppliedServiceFilter(serviceFilter);
    setAppliedStatusFilter(statusFilter);
    setPage(1);
  }, [searchTerm, roomFilter, serviceFilter, statusFilter]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setRoomFilter("all");
    setServiceFilter("all");
    setStatusFilter("all");
    setAppliedSearchTerm("");
    setAppliedRoomFilter("all");
    setAppliedServiceFilter("all");
    setAppliedStatusFilter("all");
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSort = useCallback((newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    setPage(1);
  }, []);

  const handleViewDetails = (roomService: ServiceRoom) => {
    setSelectedRoomService(roomService);
    setIsViewModalOpen(true);
  };

  const handleEditRoomService = (roomService: ServiceRoom) => {
    setSelectedRoomService(roomService);
    setIsFormModalOpen(true);
  };

  const handleCreateRoomService = () => {
    setSelectedRoomService(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteRoomService = (roomService: ServiceRoom) => {
    setSelectedRoomService(roomService);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRoomService = async () => {
    if (!selectedRoomService) return;
    try {
      await deleteServiceRoom(selectedRoomService.id).unwrap();
      toast.success(`Room service assignment deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedRoomService(null);
      await refetchRoomServices();
    } catch (err) {
      const error = err as ApiError;
      toast.error(
        error?.data?.message || `Failed to delete room service assignment`
      );
    }
  };

  const handleFormSuccess = () => {
    refetchRoomServices();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Room Service Management
          </h1>
          <p className="text-foreground">
            Search and manage room service assignments
          </p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton onRefresh={handleRefresh} loading={isRefreshing} />
          <Button
            onClick={handleCreateRoomService}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Assignment
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert
          title="Failed to load room service assignments"
          message={error}
          className="mb-4"
        />
      )}

      <RoomServiceStatsCards
        totalCount={stats.total}
        activeCount={stats.active}
        inactiveCount={stats.inactive}
        totalRooms={stats.totalRooms}
        isLoading={roomServicesLoading || serviceRoomStatsLoading}
      />

      <RoomServiceFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roomFilter={roomFilter}
        onRoomChange={setRoomFilter}
        serviceFilter={serviceFilter}
        onServiceChange={setServiceFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        rooms={rooms}
        services={services}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        isSearching={roomServicesLoading}
      />

      <RoomServiceTable
        roomServices={roomServices}
        getStatusBadge={getStatusBadge}
        isLoading={roomServicesLoading}
        emptyStateIcon={<Link2 className="h-12 w-12" />}
        emptyStateTitle="No room service assignments found"
        emptyStateDescription="No assignments match your search criteria. Try adjusting your filters or search terms."
        onViewDetails={handleViewDetails}
        onEditRoomService={handleEditRoomService}
        onDeleteRoomService={handleDeleteRoomService}
        onSort={handleSort}
        initialSort={sortConfig.field ? sortConfig : undefined}
      />
      {paginationMeta && (
        <Pagination
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}

      <RoomServiceViewModal
        roomService={selectedRoomService}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRoomService(null);
        }}
        onEdit={(roomService) => {
          setIsViewModalOpen(false);
          handleEditRoomService(roomService);
        }}
      />

      <RoomServiceFormModal
        roomService={selectedRoomService}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedRoomService(null);
        }}
        onSuccess={handleFormSuccess}
      />

      <RoomServiceDeleteModal
        roomService={selectedRoomService}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRoomService(null);
        }}
        onConfirm={confirmDeleteRoomService}
        isDeleting={isDeletingServiceRoom}
      />
    </div>
  );
}
