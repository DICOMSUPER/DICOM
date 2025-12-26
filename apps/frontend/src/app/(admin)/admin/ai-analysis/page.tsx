"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Activity, Sheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useGetAiAnalysisPaginatedQuery,
  useDeleteAiAnalysisMutation,
  useExportToExcelMutation,
  useGetAiAnalysisStatsQuery,
} from "@/store/aiAnalysisApi";
import { saveAs } from "file-saver";
import { AiAnalysisTable } from "@/components/admin/ai-analysis/AiAnalysisTable";
import { AiAnalysisStatsCards } from "@/components/admin/ai-analysis/ai-analysis-stats-cards";
import { AiAnalysisFilters } from "@/components/admin/ai-analysis/ai-analysis-filters";
import { AiAnalysisViewModal } from "@/components/admin/ai-analysis/ai-analysis-view-modal";
import { AiAnalysisFormModal } from "@/components/admin/ai-analysis/ai-analysis-form-modal";
import { AiAnalysisDeleteModal } from "@/components/admin/ai-analysis/ai-analysis-delete-modal";
import {
  AiAnalysisExportModal,
  ExportFilters,
} from "@/components/admin/ai-analysis/ai-analysis-export-modal";
import { RefreshButton } from "@/components/ui/refresh-button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Pagination } from "@/components/common/PaginationV1";
import { AiAnalysis } from "@/common/interfaces/system/ai-analysis.interface";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SortConfig } from "@/components/ui/data-table";
import { sortConfigToQueryParams } from "@/common/utils/sort-utils";
import { AnalysisStatus } from "@/common/enums/image-dicom.enum";



export default function Page() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [feedbackFilter, setFeedbackFilter] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [selectedAiAnalysis, setSelectedAiAnalysis] =
    useState<AiAnalysis | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({});

  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
    };

    if (appliedSearchTerm.trim()) {
      params.search = appliedSearchTerm.trim();
    }

    if (statusFilter && statusFilter !== "ALL") {
      params.status = statusFilter;
    }

    if (feedbackFilter && feedbackFilter !== "ALL") {
      if (feedbackFilter === "helpful") {
        params.isHelpful = true;
      } else if (feedbackFilter === "not_helpful") {
        params.isHelpful = false;
      }
      // Note: "no_feedback" logic would depend on backend support query mechanism for null/undefined explicitly if needed, 
      // typically omitting it means "all". If the user wants to see "only those without feedback", backend needs to support it.
      // For now, only helpful/not_helpful/all are fully supported by standard bool filter.
    }

    // Add sort parameters (supports n fields)
    const sortParams = sortConfigToQueryParams(sortConfig);
    if (Object.keys(sortParams).length > 0) {
      Object.assign(params, sortParams);
    }

    return params;
  }, [page, limit, appliedSearchTerm, sortConfig, statusFilter, feedbackFilter]);

  const {
    data: aiAnalysisData,
    isLoading: aiAnalysisLoading,
    error: aiAnalysisError,
    refetch: refetchAiAnalysis,
  } = useGetAiAnalysisPaginatedQuery(
    { filters: queryParams },
    {
      // Refetch when query params change (including sort)
      refetchOnMountOrArgChange: true,
    }
  );

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetAiAnalysisStatsQuery();




  const [deleteAiAnalysis, { isLoading: isDeletingAiAnalysis }] =
    useDeleteAiAnalysisMutation();

  const [exportToExcel, { isLoading: isExporting }] =
    useExportToExcelMutation();

  useEffect(() => {
    if (aiAnalysisError) {
      const error = aiAnalysisError as FetchBaseQueryError;
      const errorMessage =
        error?.data && typeof error.data === "object" && "message" in error.data
          ? (error.data as { message: string }).message
          : "Failed to load AI analysis data. Please try again.";
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [aiAnalysisError]);

  const aiAnalyses: AiAnalysis[] = aiAnalysisData?.data ?? [];
  const paginationMeta = aiAnalysisData && {
    total: aiAnalysisData.total,
    page: aiAnalysisData.page,
    limit: aiAnalysisData.limit,
    totalPages: aiAnalysisData.totalPages,
    hasNextPage: aiAnalysisData.hasNextPage,
    hasPreviousPage: aiAnalysisData.hasPreviousPage,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchAiAnalysis(), refetchStats()]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setPage(1);
  }, [searchTerm]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setAppliedSearchTerm("");
    setStatusFilter("ALL");
    setFeedbackFilter("ALL");
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleViewDetails = (aiAnalysis: AiAnalysis) => {
    setSelectedAiAnalysis(aiAnalysis);
    setIsViewModalOpen(true);
  };

  const handleDeleteAiAnalysis = (aiAnalysis: AiAnalysis) => {
    setSelectedAiAnalysis(aiAnalysis);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAiAnalysis = async () => {
    if (!selectedAiAnalysis) return;
    try {
      await deleteAiAnalysis(selectedAiAnalysis.id).unwrap();
      toast.success(
        `AI analysis for study ${selectedAiAnalysis.studyId} deleted successfully`
      );
      setIsDeleteModalOpen(false);
      setSelectedAiAnalysis(null);
      await refetchAiAnalysis();
    } catch (error) {
      const apiError = error as {
        data?: { message?: string };
        message?: string;
      };
      toast.error(
        apiError?.data?.message ||
        apiError?.message ||
        "Failed to delete AI analysis"
      );
    }
  };

  const handleFormSuccess = () => {
    refetchAiAnalysis();
  };

  const handleSort = useCallback((newSortConfig: SortConfig) => {
    console.log("🔄 Sort changed:", newSortConfig);
    setSortConfig(newSortConfig);
    setPage(1); // Reset to first page when sorting changes
  }, []);

  const handleExport = async (filters: ExportFilters) => {
    try {
      const blob = await exportToExcel(filters).unwrap();
      const fileName = `AI_Analyses_Export_${new Date().toISOString().split("T")[0]
        }.xlsx`;
      saveAs(blob, fileName);
      toast.success("Excel file exported successfully");
      setIsExportModalOpen(false);
    } catch (error) {
      const apiError = error as {
        data?: { message?: string };
        message?: string;
      };
      toast.error(
        apiError?.data?.message ||
        apiError?.message ||
        "Failed to export to Excel"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Analysis</h1>
          <p className="text-foreground">View AI analysis records</p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton onRefresh={handleRefresh} loading={isRefreshing} />
          {/* Export Excel file button */}
          <Button
            size="default"
            disabled={aiAnalysisLoading}
            onClick={() => setIsExportModalOpen(true)}
          >
            <Sheet />
            Export to Excel
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert
          title="Failed to load AI analyses"
          message={error}
          className="mb-4"
        />
      )}

      <AiAnalysisStatsCards
        totalCount={statsData?.data?.data?.total as number}
        completedCount={statsData?.data?.data?.completed as number}
        failedCount={statsData?.data?.data?.failed as number}
        // pendingCount={stats.pending}
        isLoading={statsLoading || aiAnalysisLoading}
      />

      <AiAnalysisFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusValue={statusFilter}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        feedbackValue={feedbackFilter}
        onFeedbackChange={(value) => {
          setFeedbackFilter(value);
          setPage(1);
        }}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        isSearching={aiAnalysisLoading}
      />

      <AiAnalysisTable
        aiAnalyses={aiAnalyses}
        isLoading={aiAnalysisLoading}
        emptyStateIcon={<Activity className="h-12 w-12" />}
        emptyStateTitle="No AI analyses found"
        emptyStateDescription="No AI analyses match your search criteria. Try adjusting your filters or search terms."
        onViewDetails={handleViewDetails}
        onDeleteAiAnalysis={handleDeleteAiAnalysis}
        onSort={handleSort}
        initialSort={sortConfig.field ? sortConfig : undefined}
        total={paginationMeta?.total}
      />
      {paginationMeta && (
        <Pagination
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}

      <AiAnalysisViewModal
        aiAnalysis={selectedAiAnalysis}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAiAnalysis(null);
        }}
        onEdit={(aiAnalysis) => {
          setIsViewModalOpen(false);
        }}
      />

      <AiAnalysisDeleteModal
        aiAnalysis={selectedAiAnalysis}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAiAnalysis(null);
        }}
        onConfirm={confirmDeleteAiAnalysis}
        isDeleting={isDeletingAiAnalysis}
      />

      <AiAnalysisExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
}
