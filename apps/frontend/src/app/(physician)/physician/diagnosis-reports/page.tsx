"use client";
import { DiagnosisReportFiltersSection } from "@/components/physician/diagnosis-report/diagnosis-report-filters";
import { DiagnosisReportTable } from "@/components/physician/diagnosis-report/diagnosis-report-table";
import { ModalDiagnosisReportDetail } from "@/components/physician/diagnosis-report/modal-diagnosis-report-detail";
import Pagination from "@/components/common/PaginationV1";
import { PaginationMeta } from "@/interfaces/pagination/pagination.interface";
import { FilterDiagnosesReport } from "@/interfaces/patient/diagnosis-report.interface";
import { PaginationParams } from "@/interfaces/patient/patient-workflow.interface";
import { useGetDiagnosisReportWithFilterQuery, useGetDiagnosisStatsQuery } from "@/store/diagnosisApi";
import { SortConfig } from "@/components/ui/data-table";
import { sortConfigToQueryParams } from "@/utils/sort-utils";
import { prepareApiFilters } from "@/utils/filter-utils";
import { useEffect, useState, useMemo, useCallback } from "react";
import { RefreshButton } from "@/components/ui/refresh-button";
import { DiagnosisReportStatsCards } from "@/components/physician/diagnosis-report/diagnosis-report-stats";

export default function DiagnosisReportPage() {
  const [filters, setFilters] = useState<FilterDiagnosesReport>({
    status: "all",
    patientName: "",
  });

  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>("");

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

  const { data, isLoading, isFetching, refetch: refetchDiagnosisReports } =
    useGetDiagnosisReportWithFilterQuery({ filters: apiFilters }, {
      refetchOnMountOrArgChange: false,
    });

  const {
    data: statsData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useGetDiagnosisStatsQuery();

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
    setSelectedReportId(id);
    setModalOpen(true);
  };

  const handleFiltersChange = (newFilters: FilterDiagnosesReport) => {
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
    await Promise.all([refetchDiagnosisReports(), refetchStats()]);
  }, [refetchDiagnosisReports, refetchStats]);

  const stats = statsData
    ? {
        total: statsData.total || 0,
        active: statsData.active || 0,
        resolved: statsData.resolved || 0,
        critical: statsData.critical || 0,
        today: statsData.today || 0,
      }
    : {
        total: 0,
        active: 0,
        resolved: 0,
        critical: 0,
        today: 0,
      };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Diagnosis Reports Management
          </h1>
          <p className="text-foreground">Search and manage diagnosis reports</p>
        </div>
        <RefreshButton onRefresh={handleRefresh} loading={isFetching || isStatsLoading} />
      </div>

      <DiagnosisReportStatsCards
        totalCount={stats.total}
        activeCount={stats.active}
        resolvedCount={stats.resolved}
        criticalCount={stats.critical}
        todayCount={stats.today}
        isLoading={isStatsLoading}
      />

      <DiagnosisReportFiltersSection
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
        isSearching={isLoading}
      />
      <DiagnosisReportTable
        reportItems={data?.data || []}
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
      <ModalDiagnosisReportDetail
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reportId={selectedReportId}
      />
    </div>
  );
}
