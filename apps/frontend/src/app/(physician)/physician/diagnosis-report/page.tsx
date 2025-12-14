"use client";
import { DiagnosisReportFiltersSection } from "@/components/physician/diagnosis-report/diagnosis-report-filters";
import { DiagnosisReportTable } from "@/components/physician/diagnosis-report/diagnosis-report-table";
import { ModalDiagnosisReportDetail } from "@/components/physician/diagnosis-report/modal-diagnosis-report-detail";
import { PaginationMeta } from "@/common/interfaces/pagination/pagination.interface";
import { FilterDiagnosesReport } from "@/common/interfaces/patient/diagnosis-report.interface";
import { PaginationParams } from "@/common/interfaces/patient/patient-workflow.interface";
import { formatDate } from "@/common/lib/formatTimeDate";
import { useGetDiagnosisReportWithFilterQuery } from "@/store/diagnosisApi";

import { prepareApiFilters } from "@/common/utils/filter-utils";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DiagnosisReportPage() {
  const [filters, setFilters] = useState<FilterDiagnosesReport>({
    status: "all",
    patientName: "",
  });

  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 5,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>("");

  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const apiFilters = prepareApiFilters(filters, pagination, {
    // dateFields: ["assignmentDateFrom", "assignmentDateTo"],
  });

  const { data, isLoading, isFetching, error } =
    useGetDiagnosisReportWithFilterQuery({ filters: apiFilters });

  useEffect(() => {
    if (data) {
      setPaginationMeta({
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 5,
        totalPages: data.totalPages || 0,
        hasNextPage: data.hasNextPage || false,
        hasPreviousPage: data.hasPreviousPage || false,
      });
    }
  }, [data, pagination.page]);

  const router = useRouter();

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

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({
      ...prev,
      limit: newLimit,
      page: 1,
    }));
  };

  const handleReset = () => {
    setFilters({
      status: "all",
      patientName: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const handleConfirmApprove = async (password: string) => {
    // try {
    //   await approveStudy({
    //     reportId: selectedReportId,
    //     password
    //   }).unwrap();
    //   toast.success("Study approved successfully");
    //   setModalApproveOpen(false);
    // } catch (error: any) {
    //   toast.error(error?.data?.message || "Failed to approve study");
    // }
  };

  return (
    <div className="min-h-screen">
      <div className="w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Diagnosis Reports Management
            </h1>
            <div className=" bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Date */}
              <div className="text-sm text-gray-500">
                Today:{" "}
                <span className="font-medium text-gray-700">
                  {formatDate(new Date())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DiagnosisReportFiltersSection
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
      />
      <DiagnosisReportTable
        reportItems={data?.data || []}
        onViewDetails={handleViewDetails}
        pagination={paginationMeta}
        onPageChange={handlePageChange}
        isFetching={isFetching}
        // isUpdating={isUpdating}
        isLoading={isLoading}
      />
      <ModalDiagnosisReportDetail
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reportId={selectedReportId}
      />
    </div>
  );
}
