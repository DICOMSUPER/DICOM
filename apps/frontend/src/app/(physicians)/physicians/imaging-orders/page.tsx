"use client";
import { ImagingOrderFormFiltersSection } from "@/components/physicians/imaging/imaging-order-filters";
import { ImagingOrderFormTable } from "@/components/physicians/imaging/imaging-order-table";
import { QueueFiltersSection } from "@/components/physicians/queue/queue-filters";
import { QueueTable } from "@/components/physicians/queue/queue-table";
import { QueueStatus } from "@/enums/patient.enum";
import { ImagingOrderFormFilters } from "@/interfaces/image-dicom/imaging-order-form.interface";
import { PaginationMeta } from "@/interfaces/pagination/pagination.interface";
import { QueueFilters } from "@/interfaces/patient/patient-visit.interface";
import { PaginationParams } from "@/interfaces/patient/patient-workflow.interface";
import { formatDate } from "@/lib/formatTimeDate";
import { useGetMySchedulesByDateRangeQuery } from "@/store/employeeScheduleApi";
import { useGetImagingOrderFormPaginatedQuery } from "@/store/imagingOrderFormApi";
import {
  useGetQueueAssignmentsInRoomQuery,
  useGetQueueStatsQuery,
  useSkipQueueAssignmentMutation,
  useUpdateQueueAssignmentMutation,
} from "@/store/queueAssignmentApi";
import { prepareApiFilters } from "@/utils/filter-utils";
import { format } from "date-fns";
import { CheckCircle, Clock, Hash, Users } from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ImagingOrderFormPage() {
  const [filters, setFilters] = useState<ImagingOrderFormFilters>({
    status: "all",
    patientName: "",
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
    useGetImagingOrderFormPaginatedQuery({ filters: apiFilters });

  // const { data: employeeScheduleData } = useGetMySchedulesByDateRangeQuery({
  //   startDate: format(new Date(), "yyyy-MM-dd"),
  //   endDate: format(new Date(), "yyyy-MM-dd"),
  // });

  // console.log("employeeScheduleData", employeeScheduleData);

  const [updateQueueAssignment, { isLoading: isUpdating }] =
    useUpdateQueueAssignmentMutation();
  const [skipQueueAssignment, { isLoading: isSkipping }] =
    useSkipQueueAssignmentMutation();

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
    router.push(`/physicians/clinic-visit/${id}`);
  };

  const handleFiltersChange = (newFilters: ImagingOrderFormFilters) => {
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
      <div className="max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Imaging Order Form
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

        <ImagingOrderFormFiltersSection
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />

        <ImagingOrderFormTable
          imagingOrderForm={data?.data || []}
          onViewDetails={handleViewDetails}
          pagination={paginationMeta}
          onPageChange={handlePageChange}
          isUpdating={isUpdating}
          isLoading={isLoading || isFetching}
        />
      </div>
    </div>
  );
}
