"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  useGetRoomSchedulesQuery,
  useGetRoomSchedulesPaginatedQuery,
} from "@/store/roomScheduleApi";
import { useGetAllUsersQuery } from "@/store/userApi";
import { useGetRoomsQuery } from "@/store/roomsApi";
import { useGetEmployeeRoomAssignmentStatsQuery } from "@/store/employeeRoomAssignmentApi";

import { RoomAssignmentsHeader } from "@/components/admin/room-assignments/room-assignments-header";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { RoomAssignmentStats } from "@/components/admin/room-assignments/room-assignment-stats";
import { ScheduleAssignmentList } from "@/components/admin/room-assignments/schedule-assignment-list";
import { RoomAssignmentCalendar } from "@/components/admin/room-assignments/room-assignment-calendar";
import { RefreshButton } from "@/components/ui/refresh-button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleSidebar } from "@/components/schedule/ScheduleSidebar";
import { Pagination } from "@/components/common/PaginationV1";
import {
  ScheduleListFilters,
  ScheduleListFilters as FiltersType,
} from "@/components/schedule/ScheduleListFilters";

import {
  RoomSchedule,
  RoomScheduleSearchFilters,
} from "@/interfaces/schedule/schedule.interface";
import { ScheduleDetailModal } from "@/components/schedule/ScheduleDetailModal";
import { AssignmentWithMeta } from "@/components/admin/room-assignments/types";
import { User } from "@/interfaces/user/user.interface";
import { Roles } from "@/enums/user.enum";
import { extractApiData } from "@/utils/api";
import { PaginationMeta } from "@/interfaces/pagination/pagination.interface";
import { EmployeeRoomAssignmentStats } from "@/interfaces/user/employee-room-assignment.interface";

const statusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "scheduled":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "in_progress":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "completed":
      return "bg-green-100 text-green-700 border-green-200";
    case "cancelled":
    case "canceled":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-muted text-foreground border-border";
  }
};

const ensureScheduleHasEmployee = (
  schedule: RoomSchedule
): RoomSchedule | null => {
  return schedule;
};

export default function RoomAssignmentsPage() {
  const router = useRouter();
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [appliedScheduleSearch, setAppliedScheduleSearch] = useState("");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "room">(
    "day"
  );
  const [activeView, setActiveView] = useState<"list" | "calendar">("list");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [optimisticAssignments, setOptimisticAssignments] = useState<
    Record<string, AssignmentWithMeta[]>
  >({});
  const [detailSchedule, setDetailSchedule] = useState<
    RoomSchedule | RoomSchedule[] | null
  >(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listPage, setListPage] = useState(1);
  const [listLimit] = useState(10);
  const [listFilters, setListFilters] = useState<FiltersType>({
    sortBy: "date_desc",
  });

  const openScheduleDetails = (payload: RoomSchedule | RoomSchedule[]) => {
    const payloadArray = Array.isArray(payload) ? payload : [payload];
    const normalized = payloadArray
      .map(ensureScheduleHasEmployee)
      .filter((item): item is RoomSchedule => Boolean(item));

    if (!normalized.length) {
      return;
    }

    setDetailSchedule(normalized.length === 1 ? normalized[0] : normalized);
    setIsDetailModalOpen(true);
  };

  const closeScheduleDetails = () => {
    setIsDetailModalOpen(false);
    setDetailSchedule(null);
  };

  const {
    data: allSchedulesData,
    isLoading: allSchedulesLoading,
    isFetching: allSchedulesFetching,
    refetch: refetchAllSchedules,
    error: allSchedulesError,
  } = useGetRoomSchedulesQuery(
    {},
    {
      skip: activeView === "list",
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: usersData } = useGetAllUsersQuery({
    page: 1,
    limit: 1000,
    isActive: true,
    excludeRole: Roles.SYSTEM_ADMIN,
  });

  const employees = useMemo(() => {
    if (!usersData) return [];
    return extractApiData<User>(usersData);
  }, [usersData]);

  const { data: roomsData } = useGetRoomsQuery({
    page: 1,
    limit: 1000,
    is_active: true,
  });

  const rooms = roomsData?.data || [];

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetEmployeeRoomAssignmentStatsQuery();

  const stats = useMemo(() => {
    if (!statsData?.data) {
      return {
        totalAssignments: 0,
        activeAssignments: 0,
        uniqueRooms: 0,
        uniqueEmployees: 0,
      };
    }
    return {
      totalAssignments: statsData.data.totalAssignments,
      activeAssignments: statsData.data.activeAssignments,
      uniqueRooms: statsData.data.uniqueRooms,
      uniqueEmployees: statsData.data.uniqueEmployees,
    };
  }, [statsData]);

  const paginatedFilters = useMemo(() => {
    const filters: RoomScheduleSearchFilters = {};

    if (appliedScheduleSearch) {
      filters.search = appliedScheduleSearch;
    }

    if (listFilters.employeeId) {
      filters.employee_id = listFilters.employeeId;
    }
    if (listFilters.roomId) {
      filters.room_id = listFilters.roomId;
    }
    if (listFilters.startTime) {
      filters.start_time = listFilters.startTime;
    }
    if (listFilters.endTime) {
      filters.end_time = listFilters.endTime;
    }
    if (listFilters.dateFrom) {
      filters.work_date_from = listFilters.dateFrom;
    }
    if (listFilters.dateTo) {
      filters.work_date_to = listFilters.dateTo;
    }
    if (
      listFilters.sortBy === "date_asc" ||
      listFilters.sortBy === "date_desc"
    ) {
      filters.sort_by = "work_date";
      filters.sort_order = listFilters.sortBy === "date_asc" ? "ASC" : "DESC";
    }

    return filters;
  }, [appliedScheduleSearch, listFilters]);

  const {
    data: paginatedSchedulesData,
    isLoading: paginatedSchedulesLoading,
    isFetching: paginatedSchedulesFetching,
    refetch: refetchPaginatedSchedules,
    error: paginatedSchedulesError,
  } = useGetRoomSchedulesPaginatedQuery(
    {
      page: listPage,
      limit: listLimit,
      filters: paginatedFilters,
    },
    {
      skip: activeView === "calendar",
      refetchOnMountOrArgChange: true,
    }
  );

  const schedulesData =
    activeView === "calendar" ? allSchedulesData : paginatedSchedulesData?.data;
  const schedulesLoading =
    activeView === "calendar" ? allSchedulesLoading : paginatedSchedulesLoading;
  const schedulesFetching =
    activeView === "calendar"
      ? allSchedulesFetching
      : paginatedSchedulesFetching;
  const schedulesError =
    activeView === "calendar" ? allSchedulesError : paginatedSchedulesError;
  const paginationMeta: PaginationMeta | null = paginatedSchedulesData
    ? {
        total: paginatedSchedulesData.total,
        page: paginatedSchedulesData.page,
        limit: listLimit,
        totalPages: paginatedSchedulesData.totalPages,
        hasNextPage:
          paginatedSchedulesData.page < paginatedSchedulesData.totalPages,
        hasPreviousPage: paginatedSchedulesData.page > 1,
      }
    : null;

  const schedules = schedulesData ?? [];

  const refetchSchedules = async () => {
    if (activeView === "calendar") {
      await refetchAllSchedules();
    } else {
      await refetchPaginatedSchedules();
    }
  };

  const handleScheduleUpdated = async () => {
    await refetchSchedules();
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (detailSchedule) {
      const scheduleId = Array.isArray(detailSchedule)
        ? detailSchedule[0]?.schedule_id
        : detailSchedule?.schedule_id;
      if (scheduleId) {
        const updatedSchedules =
          activeView === "calendar"
            ? allSchedulesData ?? []
            : paginatedSchedulesData?.data ?? [];
        const updatedSchedule = updatedSchedules.find(
          (s) => s.schedule_id === scheduleId
        );
        if (updatedSchedule) {
          // Don't filter by ensureScheduleHasEmployee when updating after deletion
          // The schedule should still be shown even if it has no employees
          setDetailSchedule(
            Array.isArray(detailSchedule) ? [updatedSchedule] : updatedSchedule
          );
        }
      }
    }
  };

  const mergedSchedules = useMemo(() => {
    return schedules.map((schedule) => {
      const pending = optimisticAssignments[schedule.schedule_id] ?? [];
      if (!pending.length) {
        return schedule;
      }

      return {
        ...schedule,
        employeeRoomAssignments: [
          ...(schedule.employeeRoomAssignments ?? []),
          ...pending,
        ],
      };
    });
  }, [schedules, optimisticAssignments]);

  useEffect(() => {
    if (activeView === "list") {
      setListPage(1);
    }
  }, [activeView, appliedScheduleSearch, listFilters]);

  const handleScheduleSearch = useCallback(() => {
    setAppliedScheduleSearch(scheduleSearch);
    setListPage(1);
  }, [scheduleSearch]);

  const handleListFiltersChange = (filters: FiltersType) =>
    setListFilters(filters);
  const handleListFiltersReset = () => setListFilters({ sortBy: "date_desc" });

  const scheduleStats = useMemo<EmployeeRoomAssignmentStats>(() => {
    const statsMap: EmployeeRoomAssignmentStats = {};
    mergedSchedules.forEach((schedule) => {
      if (schedule.work_date) {
        const dateKey =
          typeof schedule.work_date === "string"
            ? schedule.work_date.split("T")[0]
            : new Date(schedule.work_date).toISOString().split("T")[0];
        const assignmentCount = schedule.employeeRoomAssignments?.length || 0;
        statsMap[dateKey] = (statsMap[dateKey] || 0) + assignmentCount;
      }
    });
    return statsMap;
  }, [mergedSchedules]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchSchedules(), refetchStats()]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setErrorMessage(
      schedulesError ? "Failed to load room schedules. Please try again." : null
    );
  }, [schedulesError]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <RoomAssignmentsHeader />
            <div className="flex items-center gap-2">
              <Tabs
                value={activeView}
                onValueChange={(value) => {
                  if (value === "list" || value === "calendar") {
                    setActiveView(value);
                  }
                }}
                className="w-auto"
              >
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                onClick={() =>
                  router.push("/admin/room-assignments/assignment-form")
                }
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Assign Employee
              </Button>
              <RefreshButton onRefresh={handleRefresh} loading={isRefreshing} />
            </div>
          </div>
        </div>

        {errorMessage && (
          <ErrorAlert title="Failed to load data" message={errorMessage} />
        )}

        <RoomAssignmentStats
          totalAssignments={stats.totalAssignments}
          activeAssignments={stats.activeAssignments}
          uniqueRooms={stats.uniqueRooms}
          uniqueEmployees={stats.uniqueEmployees}
          isLoading={statsLoading || schedulesLoading}
        />

        <div className="space-y-6">
          {activeView === "list" ? (
            <>
              <ScheduleListFilters
                isAdmin={true}
                employees={employees}
                rooms={rooms}
                filters={listFilters}
                onFiltersChange={handleListFiltersChange}
                onReset={handleListFiltersReset}
              />
              <ScheduleAssignmentList
                schedules={mergedSchedules}
                selectedScheduleId={selectedScheduleId}
                onSelectSchedule={setSelectedScheduleId}
                scheduleSearch={scheduleSearch}
                onScheduleSearchChange={setScheduleSearch}
                onSearch={handleScheduleSearch}
                isSearching={schedulesLoading}
                optimisticAssignments={optimisticAssignments}
                isLoading={schedulesLoading}
                onScheduleDetails={openScheduleDetails}
              />
              {paginationMeta && (
                <Pagination
                  pagination={paginationMeta}
                  onPageChange={(page) => {
                    setListPage(page);
                    // Scroll to top when page changes
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  showInfo={true}
                />
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-9 space-y-6 h-full">
                <RoomAssignmentCalendar
                  schedules={mergedSchedules}
                  selectedDate={selectedDate}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  isLoading={schedulesLoading}
                  onScheduleSelect={setSelectedScheduleId}
                  onScheduleDetails={openScheduleDetails}
                />
              </div>
              <div className="xl:col-span-3 space-y-6">
                <ScheduleSidebar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  scheduleStats={scheduleStats}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <ScheduleDetailModal
        schedule={detailSchedule}
        isOpen={isDetailModalOpen}
        onClose={closeScheduleDetails}
        getStatusColor={statusBadgeClass}
        onScheduleUpdated={handleScheduleUpdated}
      />
    </>
  );
}
