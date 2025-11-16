'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useCreateEmployeeRoomAssignmentMutation } from '@/store/employeeRoomAssignmentApi';
import {
  useGetAvailableEmployeesQuery,
  useGetRoomSchedulesQuery,
} from '@/store/roomScheduleApi';

import { RoomAssignmentsHeader } from '@/components/admin/room-assignments/room-assignments-header';
import { RoomAssignmentStats } from '@/components/admin/room-assignments/room-assignment-stats';
import { ScheduleAssignmentList } from '@/components/admin/room-assignments/schedule-assignment-list';
import { AssignEmployeeForm } from '@/components/admin/room-assignments/assign-employee-form';
import { RoomAssignmentCalendar } from '@/components/admin/room-assignments/room-assignment-calendar';
import { RefreshButton } from '@/components/ui/refresh-button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScheduleSidebar } from '@/components/schedule/ScheduleSidebar';

import { RoomSchedule, Employee } from '@/interfaces/schedule/schedule.interface';
import { ScheduleDetailModal } from '@/components/schedule/ScheduleDetailModal';
import { AssignmentWithMeta } from '@/components/admin/room-assignments/types';
import { extractApiData } from '@/utils/api';

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
  if (schedule.employee) {
    return schedule;
  }
  const assignments = schedule.employeeRoomAssignments as AssignmentWithMeta[] | undefined;
  const fallback = assignments?.find((assignment) => assignment.employee);
  if (!fallback?.employee) {
    return null;
  }
  return {
    ...schedule,
    employee: fallback.employee,
  };
};

export default function RoomAssignmentsPage() {
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "room">("day");
  const [activeView, setActiveView] = useState<"list" | "calendar">("list");
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [optimisticAssignments, setOptimisticAssignments] = useState<
    Record<string, AssignmentWithMeta[]>
  >({});
  const [detailSchedule, setDetailSchedule] = useState<RoomSchedule | RoomSchedule[] | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  const {
    data: schedulesData,
    isLoading: schedulesLoading,
    isFetching: schedulesFetching,
    refetch: refetchSchedules,
    error: schedulesError,
  } = useGetRoomSchedulesQuery({});

  const schedules = schedulesData ?? [];

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
    return mergedSchedules.map((schedule) => {
      if (schedule.employee) {
        return schedule;
      }
      const firstAssignment = schedule.employeeRoomAssignments?.find(
        (assignment) => assignment.employee
      );
      if (!firstAssignment?.employee) {
        return schedule;
      }
      return {
        ...schedule,
        employee: firstAssignment.employee,
      };
    });
  }, [mergedSchedules]);

  const selectedSchedule = useMemo(
    () =>
      mergedSchedules.find(
        (schedule) => schedule.schedule_id === selectedScheduleId
      ),
    [mergedSchedules, selectedScheduleId]
  );

  useEffect(() => {
    if (!schedulesLoading && mergedSchedules.length > 0 && !selectedScheduleId) {
      setSelectedScheduleId(mergedSchedules[0].schedule_id);
    }
  }, [mergedSchedules, schedulesLoading, selectedScheduleId]);

  useEffect(() => {
    if (selectedScheduleId) {
      setSelectedEmployeeId('');
      setEmployeeSearch('');
    }
  }, [selectedScheduleId]);

  const {
    data: availableEmployeesData,
    isFetching: availableEmployeesLoading,
    refetch: refetchAvailableEmployees,
  } = useGetAvailableEmployeesQuery(
    {
      date: selectedSchedule?.work_date ?? '',
      startTime: selectedSchedule?.actual_start_time?.trim() || undefined,
      endTime: selectedSchedule?.actual_end_time?.trim() || undefined,
    },
    {
      skip: !selectedSchedule?.work_date,
    }
  );

  const availableEmployees = useMemo(
    () => extractApiData<Employee>(availableEmployeesData),
    [availableEmployeesData]
  );

  const filteredEmployees = useMemo(() => {
    const query = employeeSearch.toLowerCase();
    return availableEmployees.filter((employee: Employee) => {
      const matchesRole =
        roleFilter === 'all' ? true : employee.role === roleFilter;
      const matchesDepartment =
        departmentFilter === 'all'
          ? true
          : employee.departmentId === departmentFilter;
      const matchesSearch =
        !query ||
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(query) ||
        (employee.email ?? '').toLowerCase().includes(query);
      return matchesRole && matchesDepartment && matchesSearch;
    });
  }, [availableEmployees, departmentFilter, employeeSearch, roleFilter]);

  const [createAssignment, { isLoading: isCreatingAssignment }] =
    useCreateEmployeeRoomAssignmentMutation();

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

  const handleAssignEmployee = async () => {
    if (!selectedSchedule || !selectedEmployeeId) return;

    const employee = availableEmployees.find(
      (candidate: Employee) => candidate.id === selectedEmployeeId
    );

    const tempAssignment: AssignmentWithMeta = {
      id: `temp-${Date.now()}`,
      roomScheduleId: selectedSchedule.schedule_id,
      employeeId: selectedEmployeeId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      employee: employee ? (employee as unknown as any) : undefined,
      __optimistic: true,
    };

    const scheduleId = selectedSchedule.schedule_id;
    setOptimisticAssignments((prev) => ({
      ...prev,
      [scheduleId]: [...(prev[scheduleId] ?? []), tempAssignment],
    }));
    
    try {
      await createAssignment({
        roomScheduleId: scheduleId,
        employeeId: selectedEmployeeId,
        isActive: true,
      }).unwrap();
      toast.success('Employee assigned successfully');
      setSelectedEmployeeId('');
      await refetchSchedules();
      setOptimisticAssignments((prev) => {
        const { [scheduleId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error: any) {
      setOptimisticAssignments((prev) => ({
        ...prev,
        [scheduleId]: (prev[scheduleId] ?? []).filter(
          (assignment) => assignment.id !== tempAssignment.id
        ),
      }));
      toast.error(error?.data?.message || 'Failed to assign employee');
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchSchedules(),
      refetchAvailableEmployees(),
    ]);
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
            <RefreshButton 
              onRefresh={handleRefresh} 
              loading={schedulesLoading || schedulesFetching || availableEmployeesLoading} 
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-9 space-y-6 h-full">
          {activeView === 'list' ? (
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
          ) : (
            <RoomAssignmentCalendar
              schedules={calendarSchedules}
              selectedDate={selectedDate}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isLoading={schedulesLoading}
              onScheduleSelect={setSelectedScheduleId}
              onScheduleDetails={openScheduleDetails}
            />
          )}
        </div>
        <div className="xl:col-span-3 space-y-6">
          {activeView === 'calendar' && (
            <ScheduleSidebar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}
          <div className="sticky top-6">
            <AssignEmployeeForm
            schedule={selectedSchedule}
            employees={filteredEmployees}
            loadingEmployees={availableEmployeesLoading}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            departmentFilter={departmentFilter}
            onDepartmentFilterChange={setDepartmentFilter}
            searchTerm={employeeSearch}
            onSearchTermChange={setEmployeeSearch}
            selectedEmployeeId={selectedEmployeeId}
            onSelectedEmployeeChange={setSelectedEmployeeId}
            onSubmit={handleAssignEmployee}
            submitting={isCreatingAssignment}
          />
          </div>
        </div>
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

