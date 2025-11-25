"use client";
import { DicomStudyFiltersSection } from "@/components/physician/study/study-filters";
import { DicomStudyTable } from "@/components/physician/study/study-table";
import { DicomStudyFilters } from "@/interfaces/image-dicom/dicom-study.interface";
import { PaginationMeta } from "@/interfaces/pagination/pagination.interface";
import { PaginationParams } from "@/interfaces/patient/patient-workflow.interface";
import { formatDate } from "@/lib/formatTimeDate";
import {
  useGetDicomStudiesFilteredWithPaginationQuery,
  useGetStatsInDateRangeQuery,
} from "@/store/dicomStudyApi";

import { prepareApiFilters } from "@/utils/filter-utils";
import { format } from "date-fns/format";
import { CheckCircle, Notebook, Users } from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DicomStudyPage() {
  const [filters, setFilters] = useState<DicomStudyFilters>({
    status: "all",
    patientName: "",
    orderId: "",
  });

  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 5,
  });

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
    useGetDicomStudiesFilteredWithPaginationQuery({ filters: apiFilters });

  const { data: statsData, isLoading: isStatsLoading } =
    useGetStatsInDateRangeQuery({
      dateFrom: format(new Date(), "yyyy-MM-dd") as string,
      dateTo: format(new Date(), "yyyy-MM-dd") as string,
    });

  console.log("statsData", statsData);

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
    router.push(`/physician/patient-study/${id}`);
  };

  const handleFiltersChange = (newFilters: DicomStudyFilters) => {
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

  return (
    <div className="min-h-screen">
      <div className="w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Patient Diagnosis Reports
            </h1>
            <div className=" bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Date */}
              <div className="text-sm text-gray-500">
                Today:{" "}
                <span className="font-medium text-gray-700">
                  {formatDate(new Date())}
                </span>
              </div>

              {/* Total */}
              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg shadow-sm hover:bg-yellow-200 transition">
                <CheckCircle size={16} />
                <span className="text-sm font-semibold">
                  Approved:{" "}
                  {isStatsLoading
                    ? "..."
                    : statsData?.data.totalApprovedStudies || 0}
                </span>
              </div>

              {/* Completed */}
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg shadow-sm hover:bg-blue-200 transition">
                <Notebook size={16} />
                <span className="text-sm font-semibold">
                  Total:{" "}
                  {isStatsLoading
                    ? "..."
                    : statsData?.data.totalDicomStudies || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DicomStudyFiltersSection
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
      />

      <DicomStudyTable
        dicomStudies={data?.data || []}
        onViewDetails={handleViewDetails}
        pagination={paginationMeta}
        onPageChange={handlePageChange}
        isFetching={isFetching}
        // isUpdating={isUpdating}
        isLoading={isLoading}
      />
    </div>
  );
}
