"use client";
import ModalTransferPhysician from "@/components/physician/patient-encounter/modal-transfer-physician";
import { PatientEncounterFiltersSection } from "@/components/physician/patient-encounter/patient-encounter-filters";
import { PatientEncounterTable } from "@/components/physician/patient-encounter/patient-encounter-table";
import { EncounterStatus } from "@/enums/patient-workflow.enum";
import { PaginationMeta } from "@/interfaces/pagination/pagination.interface";
import { PatientEncounterFilters } from "@/interfaces/patient/patient-visit.interface";
import { PaginationParams } from "@/interfaces/patient/patient-workflow.interface";
import { EmployeeRoomAssignment } from "@/interfaces/user/employee-room-assignment.interface";
import { RoomSchedule } from "@/interfaces/user/room-schedule.interface";
import { formatDate } from "@/lib/formatTimeDate";
import {
  useGetEmployeeRoomAssignmentsInCurrentSessionQuery,
  useGetEmployeeRoomAssignmentsQuery,
} from "@/store/employeeRoomAssignmentApi";
import {
  useGetPatientEncountersInRoomQuery,
  useGetStatsInDateRangeQuery,
  useSkipEncounterMutation,
  useUpdatePatientEncounterMutation,
} from "@/store/patientEncounterApi";

import { prepareApiFilters } from "@/utils/filter-utils";
import { format } from "date-fns";
import { CheckCircle, Clock, Users } from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function QueuePage() {
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string>("");
  const [filters, setFilters] = useState<PatientEncounterFilters>({
    encounterId: "",
    status: "all",
    priority: "all",
    roomCode: "",
    createdBy: "",
    patientName: "",
    assignmentDateFrom: "",
    assignmentDateTo: "",
    orderNumber: undefined,
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

  const apiFilters = prepareApiFilters(filters, pagination, {
    dateFields: ["encounterDateFrom", "encounterDateTo"],
  });

  const { data: currentRoom, isLoading: isCurrentRoomLoading } =
    useGetEmployeeRoomAssignmentsInCurrentSessionQuery();
  const roomId = currentRoom?.data?.[0]?.roomSchedule?.room_id;

  const { data, isLoading, isFetching, error } =
    useGetPatientEncountersInRoomQuery(
      {
        filters: {
          ...apiFilters,
          roomId: roomId,
        },
      },
      {
        skip: !roomId,
      }
    );

  const { data: employeeAssignInRoom } = useGetEmployeeRoomAssignmentsQuery(
    {
      filter: { roomScheduleId: currentRoom?.data?.[0]?.id },
    },
    {
      skip: !currentRoom?.data?.[0]?.id,
    }
  );

  const anotherEmployeeAssignInRoom = employeeAssignInRoom?.data.filter(
    (assignment) => assignment.employeeId !== currentRoom?.data?.[0]?.employeeId
  );

  const [updatePatientEncounter, { isLoading: isUpdating }] =
    useUpdatePatientEncounterMutation();

  const { data: statsData } = useGetStatsInDateRangeQuery(
    {
      dateFrom: format(new Date(), "yyyy-MM-dd") as string,
      dateTo: format(new Date(), "yyyy-MM-dd") as string,
      roomId: roomId,
    },
    {
      skip: !roomId,
    }
  );

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
    router.push(`/physician/clinic-visit/${id}`);
  };

  const handleStartServing = async (id: string) => {
    try {
      const encounterItem = data?.data.find((item) => item.id === id);
      if (!encounterItem) {
        toast.error("Encounter item not found");
        return;
      }
      const arrivedEncounter = data?.data.find(
        (item) =>
          item.status === EncounterStatus.ARRIVED &&
          item.assignedPhysicianId === currentRoom?.data?.[0]?.employeeId &&
          item.id !== id
      );

      if (arrivedEncounter) {
        toast.warning(
          `You are currently serving another patient (${arrivedEncounter.patient?.firstName} ${arrivedEncounter.patient?.lastName}). Please complete or transfer them first.`,
          { duration: 5000 }
        );
        return;
      }
      await updatePatientEncounter({
        id,
        data: {
          status: EncounterStatus.ARRIVED,
          assignedPhysicianId: currentRoom?.data?.[0]?.employeeId,
        },
      }).unwrap();
      toast.success("Started serving patient");
    } catch (error) {
      console.error("Failed to start serving:", error);
      toast.error("Failed to start serving. Please try again.");
    }
  };
  const handleComplete = async (id: string) => {
    try {
      const encounterItem = data?.data.find((item) => item.id === id);

      if (!encounterItem) {
        toast.error("Queue item not found");
        return;
      }

      await updatePatientEncounter({
        id,
        data: {
          status: EncounterStatus.FINISHED,
        },
      }).unwrap();
    } catch (error) {
      console.error("Failed to complete queue:", error);
      toast.error("Failed to complete queue. Please try again.");
    }
  };

  const handleOpenTransferModal = (encounterId: string) => {
    const encounter = data?.data.find((item) => item.id === encounterId);
    if (encounter) {
      setSelectedEncounterId(encounterId);
      setTransferModalOpen(true);
    }
  };

  const handleFiltersChange = (newFilters: PatientEncounterFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleReset = () => {
    setFilters({
      encounterId: "",
      status: "all",
      priority: "all",
      roomCode: "",
      createdBy: "",
      patientName: "",
      assignmentDateFrom: "",
      assignmentDateTo: "",
      orderNumber: undefined,
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen">
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
                <span className="text-sm font-semibold">
                  Visited: {statsData?.data.totalArrivedEncounters || 0}
                </span>
              </div>

              {/* Total */}
              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg shadow-sm hover:bg-yellow-200 transition">
                <Clock size={16} />
                <span className="text-sm font-semibold">
                  Total: {statsData?.data.totalEncounters || 0}
                </span>
              </div>

              {/* Completed */}
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg shadow-sm hover:bg-blue-200 transition">
                <CheckCircle size={16} />
                <span className="text-sm font-semibold">
                  Completed: {statsData?.data.totalCompletedEncounters || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PatientEncounterFiltersSection
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
      />
      <PatientEncounterTable
        employeeId={currentRoom?.data?.[0]?.employeeId as string}
        encounterItems={data?.data || []}
        onStartServing={handleStartServing}
        onComplete={handleComplete}
        onViewDetails={handleViewDetails}
        pagination={paginationMeta}
        onPageChange={handlePageChange}
        isUpdating={isUpdating}
        isLoading={isLoading || isCurrentRoomLoading}
        isFetching={isFetching}
        onTransferPhysician={handleOpenTransferModal}
      />
      <ModalTransferPhysician
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        encounterId={selectedEncounterId}
        availablePhysicians={anotherEmployeeAssignInRoom}
      />
    </div>
  );
}
