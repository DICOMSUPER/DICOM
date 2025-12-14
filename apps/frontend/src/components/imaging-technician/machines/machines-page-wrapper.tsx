"use client";
import { useGetCurrentEmployeeRoomAssignmentQuery } from "@/store/employeeRoomAssignmentApi";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  useGetAllModalityMachineQuery,
  useUpdateModalityMachineMutation,
  useGetModalityMachineStatsQuery,
} from "@/store/modalityMachineApi";
import { MachineTable } from "./machine-table";
import { MachineFiltersSection, MachineFilters } from "./machine-filters";
import { MachineStatus } from "@/enums/machine-status.enum";
import { toast } from "sonner";
import { Pagination } from "@/components/common/PaginationV1";
import { PaginationMeta } from "@/interfaces/pagination/pagination.interface";
import { PaginationParams } from "@/interfaces/patient/patient-workflow.interface";
import { SortConfig } from "@/components/ui/data-table";
import { sortConfigToQueryParams } from "@/utils/sort-utils";
import { prepareApiFilters } from "@/utils/filter-utils";
import { RefreshButton } from "@/components/ui/refresh-button";
import { MachineStatsCards } from "./machine-stats-cards";

export default function MachinePageWrapper() {
  const userId = useSelector((state: RootState) => state.auth.user?.id) || null;

  const [filters, setFilters] = useState<MachineFilters>({
    machineName: undefined,
    manufacturer: undefined,
    serialNumber: undefined,
    model: undefined,
    modalityId: undefined,
    status: undefined,
  });

  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10,
  });

  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({});

  const { data: currentEmployeeSchedule } =
    useGetCurrentEmployeeRoomAssignmentQuery(userId!);

  const currentRoomId =
    currentEmployeeSchedule?.data?.roomSchedule?.room_id || null;

  const apiFilters = useMemo(() => {
    const baseFilters = prepareApiFilters(filters, pagination, {});
    const sortParams = sortConfigToQueryParams(sortConfig);
    return { ...baseFilters, ...sortParams };
  }, [filters, pagination, sortConfig]);

  const {
    data: modalityMachinesData,
    isLoading: isLoadingModalityMachines,
    isFetching: isFetchingMachines,
    refetch: refetchMachines,
  } = useGetAllModalityMachineQuery(
    {
      roomId: currentRoomId as string,
      machineName: filters.machineName,
      manufacturer: filters.manufacturer,
      modalityId: filters.modalityId,
      model: filters.model,
      serialNumber: filters.serialNumber,
      status: filters.status,
      page: apiFilters.page,
      limit: apiFilters.limit,
      sortBy: apiFilters.sortBy,
      order: apiFilters.order,
    },
    { skip: !currentRoomId, refetchOnMountOrArgChange: false }
  );

  const {
    data: statsData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useGetModalityMachineStatsQuery(
    { roomId: currentRoomId as string },
    {
      skip: !currentRoomId,
      refetchOnMountOrArgChange: false,
    }
  );

  const [updateMachine] = useUpdateModalityMachineMutation();

  const machines = useMemo(() => {
    if (!modalityMachinesData) return [];
    if (Array.isArray(modalityMachinesData.data)) {
      return modalityMachinesData.data;
    }
    if (Array.isArray(modalityMachinesData)) {
      return modalityMachinesData;
    }
    return [];
  }, [modalityMachinesData]);

  useEffect(() => {
    if (modalityMachinesData) {
      setPaginationMeta({
        total: modalityMachinesData.total || 0,
        page: modalityMachinesData.page || 1,
        limit: modalityMachinesData.limit || 10,
        totalPages: modalityMachinesData.totalPages || 0,
        hasNextPage: modalityMachinesData.hasNextPage || false,
        hasPreviousPage: modalityMachinesData.hasPreviousPage || false,
      });
    }
  }, [modalityMachinesData, pagination.page]);

  const updateMachineStatus = async (id: string, status: MachineStatus) => {
    try {
      await updateMachine({ id, data: { status } }).unwrap();
      toast.success("Machine updated successfully");
      refetchMachines();
    } catch {
      toast.error("Failed to update machine");
    }
  };

  const handleFiltersChange = (newFilters: MachineFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleReset = () => {
    setFilters({
      machineName: undefined,
      manufacturer: undefined,
      serialNumber: undefined,
      model: undefined,
      modalityId: undefined,
      status: undefined,
    });
    setPagination({ ...pagination, page: 1 });
    setSortConfig({});
  };

  const handleSort = useCallback((newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([refetchMachines(), refetchStats()]);
      toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    }
  }, [refetchMachines, refetchStats]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Modality Machines
          </h1>
          <p className="text-foreground">Search and manage modality machines</p>
        </div>
        <RefreshButton onRefresh={handleRefresh} loading={isFetchingMachines || isStatsLoading} />
      </div>

      <MachineStatsCards stats={statsData} isLoading={isStatsLoading} />

      <MachineFiltersSection
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
        isSearching={isLoadingModalityMachines}
      />

      <MachineTable
        machines={machines}
        onUpdateStatus={updateMachineStatus}
        isLoading={isLoadingModalityMachines}
        page={paginationMeta?.page ?? pagination.page}
        limit={pagination.limit}
        onSort={handleSort}
        initialSort={sortConfig.field ? sortConfig : undefined}
      />

      {paginationMeta && (
        <Pagination
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
