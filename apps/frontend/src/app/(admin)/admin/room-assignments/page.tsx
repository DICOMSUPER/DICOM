'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  useGetRoomSchedulesQuery,
  useGetRoomSchedulesPaginatedQuery,
} from '@/store/roomScheduleApi';

import { RoomAssignmentsHeader } from '@/components/admin/room-assignments/room-assignments-header';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { RoomAssignmentStats } from '@/components/admin/room-assignments/room-assignment-stats';
import { ScheduleAssignmentList } from '@/components/admin/room-assignments/schedule-assignment-list';
import { RoomAssignmentCalendar } from '@/components/admin/room-assignments/room-assignment-calendar';
import { RefreshButton } from '@/components/ui/refresh-button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScheduleSidebar } from '@/components/schedule/ScheduleSidebar';
import { Pagination } from '@/components/common/PaginationV1';

import { RoomSchedule } from '@/interfaces/schedule/schedule.interface';
import { ScheduleDetailModal } from '@/components/schedule/ScheduleDetailModal';
import { AssignmentWithMeta } from '@/components/admin/room-assignments/types';

const getStatsFromSchedules = (schedules: RoomSchedule[], optimisticCount: number) => {
  const allAssignments = schedules.flatMap(
    (schedule) => schedule.employeeRoomAssignments ?? []
  );
  const totalAssignments = allAssignments.length + optimisticCount;
  const activeAssignments = allAssignments.filter((assignment) => assignment.isActive).length;
  const uniqueRooms = new Set(
    schedules.map((schedule) => schedule.room_id || schedule.room?.roomCode).filter(Boolean)
  ).size;
  const uniqueEmployees = new Set(
    allAssignments.map((assignment) => assignment.employeeId)
  ).size;

  return {
    totalAssignments,
    activeAssignments,
    uniqueRooms,
    uniqueEmployees,
  };
};

const statusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'cancelled':
    case 'canceled':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'no_show':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-muted text-foreground border-border';
  }
};

const ensureScheduleHasEmployee = (schedule: RoomSchedule): RoomSchedule | null => {
  const assignments = schedule.employeeRoomAssignments as AssignmentWithMeta[] | undefined;
  const hasValidAssignment = assignments?.some((assignment) => assignment.employee && assignment.isActive);
  if (!hasValidAssignment) {
    return null;
  }
  return schedule;
};

export default function RoomAssignmentsPage() {
  const router = useRouter();
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "room">("day");
  const [activeView, setActiveView] = useState<"list" | "calendar">("list");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [optimisticAssignments, setOptimisticAssignments] = useState<
    Record<string, AssignmentWithMeta[]>
  >({});
  const [detailSchedule, setDetailSchedule] = useState<RoomSchedule | RoomSchedule[] | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // Pagination state for list mode
  const [listPage, setListPage] = useState(1);
  const [listLimit] = useState(10);

  const openScheduleDetails = (payload: RoomSchedule | RoomSchedule[]) => {
    const payloadArray = Array.isArray(payload) ? payload : [payload];
    const normalized = payloadArray
      .map(ensureScheduleHasEmployee)
      .filter((item): item is RoomSchedule => Boolean(item));

    if (!normalized.length) {
      toast.error('Employee information is not available for these schedules.');
      return;
    }

    setDetailSchedule(normalized.length === 1 ? normalized[0] : normalized);
    setIsDetailModalOpen(true);
  };

  const closeScheduleDetails = () => {
    setIsDetailModalOpen(false);
    setDetailSchedule(null);
  };

  // Fetch all schedules for calendar mode
  // Data is cached for 5 minutes, so switching back to calendar won't refetch if data exists
  const {
    data: allSchedulesData,
    isLoading: allSchedulesLoading,
    isFetching: allSchedulesFetching,
    refetch: refetchAllSchedules,
    error: allSchedulesError,
  } = useGetRoomSchedulesQuery(
    {}, 
    { 
      skip: activeView === 'list',
      refetchOnMountOrArgChange: true,
    }
  );

  // Fetch paginated schedules for list mode
  // Data is cached per page, so switching back to list won't refetch if data exists
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
      filters: {},
    },
    { 
      skip: activeView === 'calendar',
      refetchOnMountOrArgChange: true,
    }
  );

  // Use appropriate data based on view mode
  const schedulesData = activeView === 'calendar' ? allSchedulesData : paginatedSchedulesData?.data;
  const schedulesLoading = activeView === 'calendar' ? allSchedulesLoading : paginatedSchedulesLoading;
  const schedulesFetching = activeView === 'calendar' ? allSchedulesFetching : paginatedSchedulesFetching;
  const schedulesError = activeView === 'calendar' ? allSchedulesError : paginatedSchedulesError;
  const paginationMeta = paginatedSchedulesData ? {
    total: paginatedSchedulesData.total,
    page: paginatedSchedulesData.page,
    limit: listLimit,
    totalPages: paginatedSchedulesData.totalPages,
    hasNextPage: (paginatedSchedulesData as any).hasNextPage ?? (paginatedSchedulesData.page < paginatedSchedulesData.totalPages),
    hasPreviousPage: (paginatedSchedulesData as any).hasPreviousPage ?? (paginatedSchedulesData.page > 1),
  } : null;

  const schedules = schedulesData ?? [];
  
  const refetchSchedules = async () => {
    if (activeView === 'calendar') {
      await refetchAllSchedules();
    } else {
      await refetchPaginatedSchedules();
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

  const calendarSchedules = useMemo(() => {
    return mergedSchedules;
  }, [mergedSchedules]);

  // Reset page to 1 when switching to list view or when search changes
  useEffect(() => {
    if (activeView === 'list' && listPage !== 1) {
      setListPage(1);
    }
  }, [activeView, scheduleSearch]);

  const optimisticAssignmentsCount = useMemo(
    () =>
      Object.values(optimisticAssignments).reduce(
        (total, assignments) => total + assignments.length,
        0
      ),
    [optimisticAssignments]
  );

  const stats = getStatsFromSchedules(
    mergedSchedules,
    optimisticAssignmentsCount
  );

  const handleRefresh = async () => {
    await refetchSchedules();
  };

  useEffect(() => {
    setErrorMessage(schedulesError ? 'Failed to load room schedules. Please try again.' : null);
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
              onValueChange={(value) => setActiveView(value as any)}
              className="w-auto"
            >
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              onClick={() => router.push('/admin/room-assignments/assignment-form')}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Assign Employee
            </Button>
            <RefreshButton 
              onRefresh={handleRefresh} 
              loading={schedulesLoading || schedulesFetching} 
            />
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
        isLoading={schedulesLoading}
      />

      <div className="space-y-6">
        {activeView === 'list' ? (
          <>
            <ScheduleAssignmentList
              schedules={mergedSchedules}
              selectedScheduleId={selectedScheduleId}
              onSelectSchedule={setSelectedScheduleId}
              scheduleSearch={scheduleSearch}
              onScheduleSearchChange={setScheduleSearch}
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
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showInfo={true}
              />
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-9 space-y-6 h-full">
              <RoomAssignmentCalendar
                schedules={calendarSchedules}
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
    />
    </>
  );
}

