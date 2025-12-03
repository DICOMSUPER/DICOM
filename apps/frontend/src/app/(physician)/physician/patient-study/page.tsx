"use client";
import Pagination from "@/components/common/PaginationV1";
import { DicomStudyFiltersSection } from "@/components/physician/study/study-filters";
import { StudyStatsCards } from "@/components/physician/study/study-stats-cards";
import { DicomStudyTable } from "@/components/physician/study/study-table";
import { SortConfig } from "@/components/ui/data-table";
import { RefreshButton } from "@/components/ui/refresh-button";
import { DicomStudyFilters } from "@/interfaces/image-dicom/dicom-study.interface";
import { PaginationMeta } from "@/interfaces/pagination/pagination.interface";
import { PaginationParams } from "@/interfaces/patient/patient-workflow.interface";
import {
  useGetDicomStudiesFilteredWithPaginationQuery,
  useGetStatsInDateRangeQuery,
} from "@/store/dicomStudyApi";
import { prepareApiFilters } from "@/utils/filter-utils";
import { sortConfigToQueryParams } from "@/utils/sort-utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function DicomStudyPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<DicomStudyFilters>({
    status: "all",
    patientName: "",
    orderId: "",
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

  const { data, isLoading, isFetching, refetch: refetchStudies } =
    useGetDicomStudiesFilteredWithPaginationQuery({ filters: apiFilters }, {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    });

  const { data: statsData, isLoading: isStatsLoading, isFetching: isStatsFetching, isError: isStatsError, refetch: refetchStats } =
    useGetStatsInDateRangeQuery({}, {
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
    router.push(`/physician/patient-study/${id}`);
  };

  const handleFiltersChange = (newFilters: DicomStudyFilters) => {
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
      orderId: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSortConfig({});
  };

  const handleSort = useCallback((newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchStudies(), refetchStats()]);
  }, [refetchStudies, refetchStats]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Patient Studies
          </h1>
          <p className="text-foreground">Search and manage patient studies</p>
        </div>
        <RefreshButton onRefresh={handleRefresh} loading={isFetching || isStatsLoading} />
      </div>

      <StudyStatsCards stats={statsData?.data} isLoading={isStatsLoading || isStatsFetching} />

      <DicomStudyFiltersSection
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
        isSearching={isLoading}
      />

      <DicomStudyTable
        dicomStudies={data?.data || []}
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
