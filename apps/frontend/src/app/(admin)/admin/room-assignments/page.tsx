'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useCreateEmployeeRoomAssignmentMutation } from '@/store/employeeRoomAssignmentApi';
import {
  useGetAvailableEmployeesQuery,
  useGetRoomSchedulesQuery,
  useGetRoomSchedulesPaginatedQuery,
} from '@/store/roomScheduleApi';
import { useGetRoomsQuery } from '@/store/roomsApi';
import { useGetShiftTemplatesQuery, useCreateRoomScheduleMutation } from '@/store/scheduleApi';
import { format } from 'date-fns';

import { RoomAssignmentsHeader } from '@/components/admin/room-assignments/room-assignments-header';
import { RoomAssignmentStats } from '@/components/admin/room-assignments/room-assignment-stats';
import { ScheduleAssignmentList } from '@/components/admin/room-assignments/schedule-assignment-list';
import { AssignEmployeeForm } from '@/components/admin/room-assignments/assign-employee-form';
import { RoomAssignmentCalendar } from '@/components/admin/room-assignments/room-assignment-calendar';
import { RefreshButton } from '@/components/ui/refresh-button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScheduleSidebar } from '@/components/schedule/ScheduleSidebar';
import { Pagination } from '@/components/common/PaginationV1';

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
  // Room selection state
  const [formDate, setFormDate] = useState<Date | undefined>(new Date());
  const [formRoomId, setFormRoomId] = useState<string>('');
  const [formShiftId, setFormShiftId] = useState<string>('');
  const [formStartTime, setFormStartTime] = useState<string>('');
  const [formEndTime, setFormEndTime] = useState<string>('');
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
      // RTK Query will use cached data if available (kept for 5 minutes)
      // Only refetches if cache is expired or data is invalidated
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
      // RTK Query will use cached data if available (kept for 5 minutes)
      // Only refetches if cache is expired, page changes, or data is invalidated
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

  // Removed auto-select - let users choose their own schedule or create new one

  useEffect(() => {
    if (selectedScheduleId) {
      setSelectedEmployeeId('');
      setEmployeeSearch('');
    }
  }, [selectedScheduleId]);

  // Sync form date/room with selected schedule
  useEffect(() => {
    if (selectedSchedule) {
      if (selectedSchedule.work_date) {
        const scheduleDate = new Date(selectedSchedule.work_date);
        if (!formDate || scheduleDate.toDateString() !== formDate.toDateString()) {
          setFormDate(scheduleDate);
        }
      }
      if (selectedSchedule.room_id && selectedSchedule.room_id !== formRoomId) {
        setFormRoomId(selectedSchedule.room_id);
      }
      if (selectedSchedule.shift_template_id && selectedSchedule.shift_template_id !== formShiftId) {
        setFormShiftId(selectedSchedule.shift_template_id);
      }
      if (selectedSchedule.actual_start_time && selectedSchedule.actual_start_time !== formStartTime) {
        setFormStartTime(selectedSchedule.actual_start_time);
      }
      if (selectedSchedule.actual_end_time && selectedSchedule.actual_end_time !== formEndTime) {
        setFormEndTime(selectedSchedule.actual_end_time);
      }
    }
  }, [selectedSchedule]);

  // Reset page to 1 when switching to list view or when search changes
  useEffect(() => {
    if (activeView === 'list' && listPage !== 1) {
      setListPage(1);
    }
  }, [activeView, scheduleSearch]);

  // Fetch rooms
  const { data: roomsData, isLoading: loadingRooms } = useGetRoomsQuery({
    page: 1,
    limit: 1000,
  });
  const rooms = roomsData?.data ?? [];

  // Fetch shift templates
  const { data: shiftTemplatesData, isLoading: loadingShiftTemplates } = useGetShiftTemplatesQuery({});
  const shiftTemplates = Array.isArray(shiftTemplatesData) ? shiftTemplatesData : (shiftTemplatesData?.data ?? []);

  // Determine which date/time to use for available employees query
  const employeeQueryDate = selectedSchedule?.work_date 
    ? selectedSchedule.work_date 
    : (formDate ? format(formDate, 'yyyy-MM-dd') : '');
  const employeeQueryStartTime = selectedSchedule?.actual_start_time?.trim() 
    ? selectedSchedule.actual_start_time.trim() 
    : (formStartTime || undefined);
  const employeeQueryEndTime = selectedSchedule?.actual_end_time?.trim() 
    ? selectedSchedule.actual_end_time.trim() 
    : (formEndTime || undefined);

  const {
    data: availableEmployeesData,
    isFetching: availableEmployeesLoading,
    refetch: refetchAvailableEmployees,
  } = useGetAvailableEmployeesQuery(
    {
      date: employeeQueryDate,
      startTime: employeeQueryStartTime,
      endTime: employeeQueryEndTime,
    },
    {
      skip: !employeeQueryDate,
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
  const [createSchedule, { isLoading: isCreatingSchedule }] =
    useCreateRoomScheduleMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Prevent double submission
    if (isSubmitting || isCreatingAssignment || isCreatingSchedule) {
      return;
    }

    if (!selectedEmployeeId) {
      toast.warning('Please select an employee');
      return;
    }

    setIsSubmitting(true);
    let targetSchedule = selectedSchedule;
    let scheduleCreated = false;

    // If no schedule is selected, create one from form data
    if (!targetSchedule && formDate && formRoomId) {
      try {
        const selectedShift = formShiftId ? shiftTemplates.find((s) => s.shift_template_id === formShiftId) : null;
        const startTime = formStartTime || selectedShift?.start_time || '';
        const endTime = formEndTime || selectedShift?.end_time || '';

        const scheduleResponse = await createSchedule({
          employee_id: '', // Will be set via assignment
          room_id: formRoomId,
          shift_template_id: formShiftId ? formShiftId : undefined,
          work_date: format(formDate, 'yyyy-MM-dd'),
          actual_start_time: startTime || undefined,
          actual_end_time: endTime || undefined,
          schedule_status: 'scheduled',
        } as any).unwrap();

        targetSchedule = scheduleResponse as unknown as RoomSchedule;
        
        if (!targetSchedule?.schedule_id) {
          toast.error('Failed to create schedule: Invalid schedule ID returned');
          setIsSubmitting(false);
          return;
        }
        
        setSelectedScheduleId(targetSchedule.schedule_id);
        scheduleCreated = true;
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to create schedule');
        setIsSubmitting(false);
        return;
      }
    }

    if (!targetSchedule?.schedule_id) {
      toast.error('Please select or create a schedule');
      setIsSubmitting(false);
      return;
    }

    // Create employee assignment
    const employee = availableEmployees.find(
      (candidate: Employee) => candidate.id === selectedEmployeeId
    );

    const tempAssignment: AssignmentWithMeta = {
      id: `temp-${Date.now()}`,
      roomScheduleId: targetSchedule.schedule_id,
      employeeId: selectedEmployeeId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      employee: employee ? (employee as unknown as any) : undefined,
      __optimistic: true,
    };

    const scheduleId = targetSchedule.schedule_id;
    
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
      
      // Reset form if we created a new schedule
      if (scheduleCreated) {
        setFormDate(new Date());
        setFormRoomId('');
        setFormShiftId('');
        setFormStartTime('');
        setFormEndTime('');
      }
      
      // Clear optimistic assignment and refetch to get fresh data
      setOptimisticAssignments((prev) => {
        const { [scheduleId]: _, ...rest } = prev;
        return rest;
      });
      
      // Force refetch to ensure calendar updates
      await refetchSchedules();
    } catch (error: any) {
      setOptimisticAssignments((prev) => ({
        ...prev,
        [scheduleId]: (prev[scheduleId] ?? []).filter(
          (assignment) => assignment.id !== tempAssignment.id
        ),
      }));
      
      const errorMessage = error?.data?.message || error?.message || 'Failed to assign employee';
      toast.error(errorMessage);
      
      // If assignment fails after creating schedule, the schedule is orphaned
      // User can manually delete it or try again
      if (scheduleCreated) {
        toast.warning('Schedule was created but assignment failed. You may need to delete the schedule if you want to try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-fill times when shift template is selected
  useEffect(() => {
    if (formShiftId && shiftTemplates.length > 0) {
      const selectedShift = shiftTemplates.find((s) => s.shift_template_id === formShiftId);
      if (selectedShift && !formStartTime && !formEndTime) {
        setFormStartTime(selectedShift.start_time);
        setFormEndTime(selectedShift.end_time);
      }
    }
  }, [formShiftId, shiftTemplates, formStartTime, formEndTime]);

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
        <div className="xl:col-span-8 space-y-6 h-full">
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
        <div className="xl:col-span-4 space-y-6">
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
            submitting={isSubmitting || isCreatingAssignment || isCreatingSchedule}
            rooms={rooms as any}
            loadingRooms={loadingRooms}
            shiftTemplates={shiftTemplates as any}
            loadingShiftTemplates={loadingShiftTemplates}
            selectedDate={formDate}
            onDateChange={setFormDate}
            selectedRoomId={formRoomId}
            onRoomChange={setFormRoomId}
            selectedShiftId={formShiftId}
            onShiftChange={setFormShiftId}
            selectedStartTime={formStartTime}
            onStartTimeChange={setFormStartTime}
            selectedEndTime={formEndTime}
            onEndTimeChange={setFormEndTime}
            availableSchedules={mergedSchedules}
            onScheduleSelect={(scheduleId) => {
              setSelectedScheduleId(scheduleId || undefined);
            }}
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

