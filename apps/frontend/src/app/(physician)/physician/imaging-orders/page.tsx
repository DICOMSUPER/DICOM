"use client";
import { ImagingOrderFormFiltersSection } from "@/components/physician/imaging/imaging-order-filters";
import { ImagingOrderFormTable } from "@/components/physician/imaging/imaging-order-table";
import Pagination from "@/components/common/PaginationV1";
import { ImagingOrderFormFilters } from "@/interfaces/image-dicom/imaging-order-form.interface";
import { PaginationMeta } from "@/interfaces/pagination/pagination.interface";
import { PaginationParams } from "@/interfaces/patient/patient-workflow.interface";
import { SortConfig } from "@/components/ui/data-table";
import { sortConfigToQueryParams } from "@/utils/sort-utils";
import { useGetImagingOrderFormPaginatedQuery } from "@/store/imagingOrderFormApi";
import { prepareApiFilters } from "@/utils/filter-utils";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshButton } from "@/components/ui/refresh-button";
import { ImagingOrderStatsCards } from "@/components/physician/imaging/imaging-order-stats";

export default function ImagingOrderFormPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ImagingOrderFormFilters>({
    status: "all",
    patientName: "",
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

  const apiFilters = useMemo(() => {
    const baseFilters = prepareApiFilters(filters, pagination, {});
    const sortParams = sortConfigToQueryParams(sortConfig);
    return { ...baseFilters, ...sortParams };
  }, [filters, pagination, sortConfig]);

  const { data, isLoading, isFetching, refetch: refetchImagingOrders } =
    useGetImagingOrderFormPaginatedQuery({ filters: apiFilters }, {
      refetchOnMountOrArgChange: false,
    });

  useEffect(() => {
    if (data) {
      setPaginationMeta({
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10,
        totalPages: data.totalPages || 0,
        hasNextPage: data.hasNextPage || false,
        hasPreviousPage: data.hasPreviousPage || false,
      });
    }
  }, [data, pagination.page]);


  const handleViewDetails = (id: string) => {
    router.push(`/physician/imaging-orders/${id}`);
  };

  const handleFiltersChange = (newFilters: ImagingOrderFormFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };


  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };


  const handleReset = () => {
    setFilters({
      status: "all",
      patientName: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSortConfig({});
  };

  const handleSort = useCallback((newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleRefresh = useCallback(async () => {
    await refetchImagingOrders();
  }, [refetchImagingOrders]);

  const stats = {
    total: data?.total || 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Imaging Order Form
          </h1>
          <p className="text-foreground">Search and manage imaging orders</p>
        </div>
        <RefreshButton onRefresh={handleRefresh} loading={isFetching} />
      </div>

      <ImagingOrderStatsCards
        totalCount={stats.total}
        pendingCount={stats.pending}
        completedCount={stats.completed}
        cancelledCount={stats.cancelled}
        isLoading={isLoading}
      />

      <ImagingOrderFormFiltersSection
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
        isSearching={isLoading}
      />

      <ImagingOrderFormTable
        imagingOrderForm={data?.data || []}
        onViewDetails={handleViewDetails}
        isLoading={isLoading}
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
