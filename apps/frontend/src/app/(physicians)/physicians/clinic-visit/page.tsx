"use client";
import { QueueFiltersSection } from "@/components/physicians/queue/queue-filters";
import { QueueTable } from "@/components/physicians/queue/queue-table";
import { PaginationMeta } from "@/interfaces/pagination/pagination.interface";
import { QueueFilters } from "@/interfaces/patient/patient-visit.interface";
import { PaginationParams } from "@/interfaces/patient/patient-workflow.interface";
import { QueueAssignmentSearchFilters } from "@/interfaces/patient/queue-assignment.interface";
import { useGetQueueAssignmentsInRoomQuery } from "@/store/queueAssignmentApi";
import { prepareApiFilters } from "@/utils/filter-utils";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function QueuePage() {
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "";
  const [filters, setFilters] = useState<QueueFilters>({
    encounterId: "",
    status: "all",
    priority: "all",
    roomId: "",
    createdBy: "",
    patientId: "",
    assignmentDateFrom: "",
    assignmentDateTo: "",
    queueNumber: undefined,
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
    dateFields: ["assignmentDateFrom", "assignmentDateTo"],
  });

  const { data, isLoading, isFetching, error } =
    useGetQueueAssignmentsInRoomQuery(
      { userId, filters: apiFilters },
      {
        skip: !userId,
      }
    );

  useEffect(() => {
    if (data) {
      setPaginationMeta({
        total: data.data.total || 0,
        page: data.data.page || 1,
        limit: data.data.limit || 5,
        totalPages: data.data.totalPages || 0,
        hasNextPage: data.data.hasNextPage || false,
        hasPreviousPage: data.data.hasPreviousPage || false,
      });
    }
  }, [data, pagination.page]);

  const router = useRouter();

  const handleViewDetails = (id: string) => {
    router.push(`/physicians/clinic-visit/${id}`);
  };

  const handleStartServing = (id: string) => {
    console.log("Start serving:", id);
    // TODO: Implement start serving functionality
  };

  const handleEdit = (id: string) => {
    console.log("Edit queue item:", id);
    // TODO: Implement edit functionality
  };

  const handleCancel = (id: string) => {
    console.log("Cancel queue item:", id);
    // TODO: Implement cancel functionality
  };

  const handleFiltersChange = (newFilters: QueueFilters) => {
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
      encounterId: "",
      status: "all",
      priority: "all",
      roomId: "",
      createdBy: "",
      patientId: "",
      assignmentDateFrom: "",
      assignmentDateTo: "",
      queueNumber: undefined,
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Clinic Visit
            </h1>
            <div className="text-sm text-gray-500">General • Nov 23, 2022</div>
          </div>
        </div>

        <QueueFiltersSection
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />

        <QueueTable
          queueItems={data?.data.data || []}
          onStartServing={handleStartServing}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onViewDetails={handleViewDetails}
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
