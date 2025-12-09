"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  OrderFiltersSection,
  ImagingOrderFilters,
} from "./order/order-filters";
import { OrderTable } from "./order/order-table";
import { useSearchParams } from "next/navigation";
import {
  useGetImagingOrderByRoomIdFilterQuery,
  useGetOrderStatsForRoomInDateQuery,
  useUpdateImagingOrderMutation,
} from "@/store/imagingOrderApi";
import { useGetCurrentEmployeeRoomAssignmentQuery } from "@/store/employeeRoomAssignmentApi";
import { Skeleton } from "@/components/ui/skeleton";
import { ImagingOrderStatus } from "@/enums/image-dicom.enum";
import CurrentStatus, { CurrentStatusRef } from "./current-status";
import { useRef } from "react";
import UserDontHaveRoomAssignment from "../common/user-dont-have-room-assignment";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Pagination } from "@/components/common/PaginationV1";
import { PaginationMeta } from "@/interfaces/pagination/pagination.interface";
import { PaginationParams } from "@/interfaces/patient/patient-workflow.interface";
import { SortConfig } from "@/components/ui/data-table";
import { sortConfigToQueryParams } from "@/utils/sort-utils";
import { prepareApiFilters } from "@/utils/filter-utils";
import { toast } from "sonner";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useRouter } from "next/navigation";

export default function ImageTechnicianPageWrapper() {
  const searchParams = useSearchParams();
  const userId = useSelector((state: RootState) => state.auth.user?.id) || null;
  const router = useRouter();
  const [filters, setFilters] = useState<ImagingOrderFilters>({
    patientFirstName: searchParams.get("patientFirstName") || undefined,
    patientLastName: searchParams.get("patientLastName") || undefined,
    mrn: searchParams.get("mrn") || undefined,
    bodyPart: searchParams.get("bodyPart") || undefined,
    modalityId: searchParams.get("modalityId") || undefined,
    orderStatus: searchParams.get("orderStatus") || undefined,
    procedureId: searchParams.get("procedureId") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
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
  const statsRef = useRef<CurrentStatusRef>(null);

  //current employee room assignment
  const {
    data: currentEmployeeSchedule,
    isLoading: isLoadingCurrentEmployeeSchedule,
    error: roomAssignmentError,
  } = useGetCurrentEmployeeRoomAssignmentQuery(userId!);

  const currentRoomId =
    currentEmployeeSchedule?.data?.roomSchedule?.room_id || null;

  const apiFilters = useMemo(() => {
    const baseFilters = prepareApiFilters(filters, pagination, {
      dateFields: ["startDate", "endDate"],
    });
    const sortParams = sortConfigToQueryParams(sortConfig);
    return { ...baseFilters, ...sortParams };
  }, [filters, pagination, sortConfig]);

  const {
    data: orderData,
    isLoading: isLoadingStudy,
    isFetching: isFetchingOrders,
    refetch: refetchOrder,
  } = useGetImagingOrderByRoomIdFilterQuery(
    {
      id: currentRoomId || "",
      filterParams: {
        modalityId: filters.modalityId,
        orderStatus: filters.orderStatus
          ? (filters.orderStatus as ImagingOrderStatus)
          : undefined,
        bodyPart: filters.bodyPart,
        mrn: filters.mrn,
        patientFirstName: filters.patientFirstName,
        patientLastName: filters.patientLastName,
        procedureId: filters.procedureId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
      page: apiFilters.page,
      limit: apiFilters.limit,
      sortBy: apiFilters.sortBy,
      order: apiFilters.order,
    },
    {
      skip: isLoadingCurrentEmployeeSchedule || !currentRoomId,
      refetchOnMountOrArgChange: false,
    }
  );

  useEffect(() => {
    if (orderData) {
      setPaginationMeta({
        total: orderData.total || 0,
        page: orderData.page || 1,
        limit: orderData.limit || 10,
        totalPages: orderData.totalPages || 0,
        hasNextPage: orderData.hasNextPage || false,
        hasPreviousPage: orderData.hasPreviousPage || false,
      });
    }
  }, [orderData]);

  const [updateImagingOrder] = useUpdateImagingOrderMutation();

  const handleViewDetails = (id: string) => {
    router.push(`/imaging-technician/order-details/${id}`);
  };

  const handleCallIn = async (id: string) => {
    try {
      await updateImagingOrder({
        id,
        body: { orderStatus: ImagingOrderStatus.IN_PROGRESS },
      }).unwrap();

      toast.success("Order status updated successfully");

      // Refetch both orders and stats to update UI
      await Promise.all([refetchOrder(), statsRef.current?.refetch()]);
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to process order");
    }
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      await updateImagingOrder({
        id,
        body: { orderStatus: ImagingOrderStatus.COMPLETED },
      }).unwrap();

      toast.success("Order marked as completed");

      // Refetch both orders and stats to update UI
      await Promise.all([refetchOrder(), statsRef.current?.refetch()]);
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to mark order as completed");
    }
  };

  const handleMarkCancelled = async (id: string) => {
    try {
      await updateImagingOrder({
        id,
        body: { orderStatus: ImagingOrderStatus.CANCELLED },
      }).unwrap();

      toast.success("Order marked as cancelled");

      // Refetch both orders and stats to update UI
      await Promise.all([refetchOrder(), statsRef.current?.refetch()]);
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to mark order as cancelled");
    }
  };

  const handleFiltersChange = (newFilters: ImagingOrderFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleReset = () => {
    setFilters({
      patientFirstName: undefined,
      patientLastName: undefined,
      mrn: undefined,
      bodyPart: undefined,
      modalityId: undefined,
      orderStatus: undefined,
      procedureId: undefined,
      startDate: undefined,
      endDate: undefined,
    });
    setPagination({ ...pagination, page: 1 });
    setSortConfig({});
  };

  const handleSort = useCallback((newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchOrder(), statsRef.current?.refetch()]);
  }, [refetchOrder]);

  if (isLoadingCurrentEmployeeSchedule) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Show error only if we have a response but no room assignment
  if (
    !isLoadingCurrentEmployeeSchedule &&
    (!currentEmployeeSchedule?.data?.roomSchedule?.room_id || !currentRoomId)
  ) {
    return <UserDontHaveRoomAssignment />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Imaging Orders</h1>
          <p className="text-foreground">Search and manage imaging orders</p>
        </div>
        <RefreshButton onRefresh={handleRefresh} loading={isFetchingOrders} />
      </div>

      {currentRoomId && (
        <CurrentStatus
          ref={statsRef}
          roomId={currentRoomId}
          startDate={filters.startDate}
          endDate={filters.endDate}
        />
      )}

      <OrderFiltersSection
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
        isSearching={isLoadingStudy}
      />

      <OrderTable
        orders={(orderData as any)?.data || orderData || []}
        onViewDetails={handleViewDetails}
        onCallIn={handleCallIn}
        onMarkCompleted={handleMarkCompleted}
        onMarkCancelled={handleMarkCancelled}
        isLoading={isLoadingStudy}
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
