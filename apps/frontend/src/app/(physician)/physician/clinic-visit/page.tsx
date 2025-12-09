"use client";
import Pagination from "@/components/common/PaginationV1";
import { EncounterStatsCards } from "@/components/physician/patient-encounter/encounter-stats-cards";
import ModalTransferPhysician from "@/components/physician/patient-encounter/modal-transfer-physician";
import { PatientEncounterFiltersSection } from "@/components/physician/patient-encounter/patient-encounter-filters";
import { PatientEncounterTable } from "@/components/physician/patient-encounter/patient-encounter-table";
import { SortConfig } from "@/components/ui/data-table";
import { RefreshButton } from "@/components/ui/refresh-button";
import { EncounterStatus } from "@/enums/patient-workflow.enum";
import { PaginationMeta } from "@/interfaces/pagination/pagination.interface";
import { PatientEncounterFilters } from "@/interfaces/patient/patient-visit.interface";
import { PaginationParams } from "@/interfaces/patient/patient-workflow.interface";
import { RootState } from "@/store";
import {
  useGetCurrentEmployeeRoomAssignmentQuery,
  useGetEmployeeRoomAssignmentsQuery
} from "@/store/employeeRoomAssignmentApi";
import {
  useGetPatientEncountersInRoomQuery,
  useGetStatsInDateRangeQuery,
  useUpdatePatientEncounterMutation
} from "@/store/patientEncounterApi";
import { prepareApiFilters } from "@/utils/filter-utils";
import { sortConfigToQueryParams } from "@/utils/sort-utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
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

  const [sortConfig, setSortConfig] = useState<SortConfig>({});

  const apiFilters = useMemo(() => {
    const baseFilters = prepareApiFilters(filters, pagination, {
      dateFields: ["encounterDateFrom", "encounterDateTo"],
    });
    const sortParams = sortConfigToQueryParams(sortConfig);
    return { ...baseFilters, ...sortParams };
  }, [filters, pagination, sortConfig]);

  // const { data: currentRoom, isLoading: isCurrentRoomLoading } =
  //   useGetEmployeeRoomAssignmentsInCurrentSessionQuery();
  // const roomId = currentRoom?.data?.[0]?.roomSchedule?.room_id;

  const userId = useSelector((state: RootState) => state.auth.user?.id) || null;
  console.log("User :", userId);

  // const user = Cookies.get("user")
  //current employee room assignment
  const {
    data: currentEmployeeSchedule,
    isLoading: isLoadingCurrentEmployeeSchedule,
    error: roomAssignmentError,
  } = useGetCurrentEmployeeRoomAssignmentQuery(userId!,{
    skip: !userId,
  });

  console.log("Current Employee Schedule:", currentEmployeeSchedule);

  const currentRoomId =
    currentEmployeeSchedule?.data?.roomSchedule?.room_id || null;

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch: refetchEncounters,
  } = useGetPatientEncountersInRoomQuery(
    {
      filters: {
        ...apiFilters,
        roomId: currentRoomId as string,
      },
    },
    {
      skip: !currentRoomId,
      refetchOnMountOrArgChange: false,
    }
  );

  const { data: employeeAssignInRoom } = useGetEmployeeRoomAssignmentsQuery(
    {
      filter: { roomScheduleId: currentEmployeeSchedule?.data?.roomScheduleId },
    },
    {
      skip: !currentEmployeeSchedule?.data?.roomScheduleId,
    }
  );

  const anotherEmployeeAssignInRoom = employeeAssignInRoom?.data.filter(
    (assignment) =>
      assignment.employeeId !== currentEmployeeSchedule?.data?.employeeId
  );

  const [updatePatientEncounter, { isLoading: isUpdating }] =
    useUpdatePatientEncounterMutation();

  const {
    data: statsData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useGetStatsInDateRangeQuery(
    {
      dateFrom: format(new Date(), "yyyy-MM-dd") as string,
      dateTo: format(new Date(), "yyyy-MM-dd") as string,
      roomId: currentRoomId as string,
    },
    {
      skip: !currentRoomId,
    }
  );

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
          item.assignedPhysicianId ===
            currentEmployeeSchedule?.data?.employeeId &&
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
          assignedPhysicianId: currentEmployeeSchedule?.data?.employeeId,
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
    setSortConfig({});
  };

  const handleSort = useCallback((newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchEncounters(), refetchStats()]);
  }, [refetchEncounters, refetchStats]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clinic Visit</h1>
          <p className="text-foreground">
            Search and manage patient encounters
          </p>
        </div>
        <RefreshButton
          onRefresh={handleRefresh}
          loading={isFetching || isStatsLoading}
        />
      </div>

      <EncounterStatsCards stats={statsData?.data} isLoading={isStatsLoading} />

      <PatientEncounterFiltersSection
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
        isSearching={isLoading || isLoadingCurrentEmployeeSchedule}
      />
      <PatientEncounterTable
        employeeId={currentEmployeeSchedule?.data?.employeeId as string}
        encounterItems={data?.data || data || []}
        onStartServing={handleStartServing}
        onComplete={handleComplete}
        onViewDetails={handleViewDetails}
        isLoading={isLoading || isLoadingCurrentEmployeeSchedule}
        page={paginationMeta?.page ?? pagination.page}
        limit={pagination.limit}
        onTransferPhysician={handleOpenTransferModal}
        onSort={handleSort}
        initialSort={sortConfig.field ? sortConfig : undefined}
      />
      {paginationMeta && (
        <Pagination
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}
      <ModalTransferPhysician
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        encounterId={selectedEncounterId}
        availablePhysicians={anotherEmployeeAssignInRoom}
      />
    </div>
  );
}
