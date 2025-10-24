"use client";
import { QueueFiltersSection } from "@/components/physicians/queue/queue-filters";
import { QueueTable } from "@/components/physicians/queue/queue-table";
import { QueueStatus } from "@/enums/patient.enum";
import { PaginationMeta } from "@/interfaces/pagination/pagination.interface";
import { QueueFilters } from "@/interfaces/patient/patient-visit.interface";
import { PaginationParams } from "@/interfaces/patient/patient-workflow.interface";
import { formatDate } from "@/lib/formatTimeDate";
import {
  useGetQueueAssignmentsInRoomQuery,
  useSkipQueueAssignmentMutation,
  useUpdateQueueAssignmentMutation,
} from "@/store/queueAssignmentApi";
import { prepareApiFilters } from "@/utils/filter-utils";
import { CheckCircle, Clock, Hash, Users } from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function QueuePage() {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.id === "string") {
        setUserId(parsed.id);
      }
    } catch (err) {
      console.error("Invalid user in localStorage", err);
    }
  }, []);

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

  const handleStartServing = async (id: string) => {
    try {
      const queueItem = data?.data.find((item) => item.id === id);

      if (!queueItem) {
        toast.error("Queue item not found");
        return;
      }

      // Check if there's already a queue in progress
      const inProgressQueue = data?.data.find(
        (item) => item.status === QueueStatus.IN_PROGRESS
      );

      if (inProgressQueue && inProgressQueue.id !== id) {
        toast.error(
          `Please complete queue #${inProgressQueue.queueNumber} before starting a new one`
        );
        return;
      }

      // Update queue status to IN_PROGRESS
      await updateQueueAssignment({
        id,
        data: {
          status: QueueStatus.IN_PROGRESS,
        },
      }).unwrap();

      toast.success(
        `Started serving Queue #${queueItem.queueNumber} - ${queueItem.encounter?.patient?.firstName} ${queueItem.encounter?.patient?.lastName}`
      );

      // Optional: Navigate to patient details or encounter page
      // router.push(`/physicians/clinic-visit/${id}`);
    } catch (error) {
      console.error("Failed to start serving:", error);
      toast.error("Failed to start serving. Please try again.");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const queueItem = data?.data.find((item) => item.id === id);

      if (!queueItem) {
        toast.error("Queue item not found");
        return;
      }

      await updateQueueAssignment({
        id,
        data: {
          status: QueueStatus.COMPLETED,
        },
      }).unwrap();

      toast.success(`Completed Queue #${queueItem.queueNumber}`);
    } catch (error) {
      console.error("Failed to complete queue:", error);
      toast.error("Failed to complete queue. Please try again.");
    }
  };

  const handleSkip = async (id: string) => {
    try {
      const queueItem = data?.data.find((item) => item.id === id);

      if (!queueItem) {
        toast.error("Queue item not found");
        return;
      }

      await skipQueueAssignment(id).unwrap();

      toast.success(`Skipped Queue #${queueItem.queueNumber}`);
    } catch (error) {
      console.error("Failed to complete queue:", error);
      toast.error("Failed to complete queue. Please try again.");
    }
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
            <div className=" bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Date */}
              <div className="text-sm text-gray-500">
                Today:{" "}
                <span className="font-medium text-gray-700">
                  {formatDate(new Date())}
                </span>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {/* Total Visited */}
                <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg shadow-sm hover:bg-emerald-200 transition">
                  <Users size={16} />
                  <span className="text-sm font-semibold">Visited: 500</span>
                </div>

                {/* Waiting */}
                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg shadow-sm hover:bg-yellow-200 transition">
                  <Clock size={16} />
                  <span className="text-sm font-semibold">Waiting: 300</span>
                </div>

                {/* Completed */}
                <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg shadow-sm hover:bg-blue-200 transition">
                  <CheckCircle size={16} />
                  <span className="text-sm font-semibold">Completed: 200</span>
                </div>

                {/* Current Token */}
                <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg shadow-sm hover:bg-purple-200 transition">
                  <Hash size={16} />
                  <span className="text-sm font-semibold">Current: 001</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <QueueFiltersSection
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />

        <QueueTable
          queueItems={data?.data || []}
          onStartServing={handleStartServing}
          onComplete={handleComplete}
          onSkip={handleSkip}
          onViewDetails={handleViewDetails}
          pagination={paginationMeta}
          onPageChange={handlePageChange}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  );
}
