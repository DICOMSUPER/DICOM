'use client';

import { useEffect, useState } from 'react';
import { useGetEmployeeRoomAssignmentsQuery, useCreateEmployeeRoomAssignmentMutation, useUpdateEmployeeRoomAssignmentMutation, useDeleteEmployeeRoomAssignmentMutation } from '@/store/employeeRoomAssignmentApi';
import { useGetRoomSchedulesQuery } from '@/store/roomScheduleApi';
import { useGetAllUsersQuery } from '@/store/userApi';
import { extractApiData } from '@/utils/api';
import { toast } from 'sonner';
import { EmployeeRoomAssignment } from '@/interfaces/user/employee-room-assignment.interface';
import { RoomAssignmentsHeader } from '@/components/admin/room-assignments/room-assignments-header';
import { RoomAssignmentsTable } from '@/components/admin/room-assignments/room-assignments-table';
import {
  RoomAssignmentDialog,
  RoomAssignmentFormState,
} from '@/components/admin/room-assignments/room-assignment-dialog';
import { RoomAssignmentStats } from '@/components/admin/room-assignments/room-assignment-stats';
import { RoomAssignmentFilters } from '@/components/admin/room-assignments/room-assignment-filters';
import { RoomAssignmentQuickActions } from '@/components/admin/room-assignments/room-assignment-quick-actions';
import { RefreshButton } from '@/components/ui/refresh-button';
import { ErrorAlert } from '@/components/ui/error-alert';

export default function RoomAssignmentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedAssignment, setSelectedAssignment] = useState<EmployeeRoomAssignment | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<RoomAssignmentFormState>({
    roomScheduleId: '',
    employeeId: '',
    isActive: true,
  });

  // Fetch assignments
  const {
    data: assignmentsRes,
    isLoading: assignmentsLoading,
    refetch: refetchAssignments,
    error: assignmentsError,
  } = useGetEmployeeRoomAssignmentsQuery({ filter: {} });
  
  const assignments: EmployeeRoomAssignment[] = extractApiData(assignmentsRes) || [];

  // Fetch room schedules
  const {
    data: schedulesRes,
    isLoading: schedulesLoading,
    refetch: refetchSchedules,
    error: schedulesError,
  } = useGetRoomSchedulesQuery({});
  const schedules = extractApiData(schedulesRes) || [];

  // Fetch users (employees)
  const {
    data: usersRes,
    isLoading: usersLoading,
    refetch: refetchUsers,
    error: usersError,
  } = useGetAllUsersQuery({ isActive: true });
  const users = extractApiData(usersRes) || [];

  // Mutations
  const [createAssignment, { isLoading: isCreating }] = useCreateEmployeeRoomAssignmentMutation();
  const [updateAssignment, { isLoading: isUpdating }] = useUpdateEmployeeRoomAssignmentMutation();
  const [deleteAssignment, { isLoading: isDeleting }] = useDeleteEmployeeRoomAssignmentMutation();

  // Filter assignments based on search
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = (() => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      const employeeName = `${assignment.employee?.firstName || ''} ${
        assignment.employee?.lastName || ''
      }`.toLowerCase();
      const roomCode =
        ((assignment.roomSchedule as any)?.room?.room_code as string | undefined)?.toLowerCase() ||
        '';
      return employeeName.includes(searchLower) || roomCode.includes(searchLower);
    })();

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? assignment.isActive
        : !assignment.isActive;

    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({ roomScheduleId: '', employeeId: '', isActive: true });
  };

  const handleCreate = () => {
    setDialogMode('create');
    resetForm();
    setSelectedAssignment(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (assignment: EmployeeRoomAssignment) => {
    setSelectedAssignment(assignment);
    setDialogMode('edit');
    setFormData({
      roomScheduleId: assignment.roomScheduleId,
      employeeId: assignment.employeeId,
      isActive: assignment.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      await deleteAssignment(id).unwrap();
      toast.success('Assignment deleted successfully');
      refetchAssignments();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete assignment');
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refetchAssignments(), refetchSchedules(), refetchUsers()]);
  };

  useEffect(() => {
    if (assignmentsError || schedulesError || usersError) {
      setErrorMessage('Failed to load room assignment data. Please try again.');
    } else {
      setErrorMessage(null);
    }
  }, [assignmentsError, schedulesError, usersError]);

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedAssignment(null);
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'edit' && selectedAssignment) {
        await updateAssignment({
          id: selectedAssignment.id,
          data: formData,
        }).unwrap();
        toast.success('Assignment updated successfully');
      } else {
        await createAssignment(formData).unwrap();
        toast.success('Assignment created successfully');
      }
      resetForm();
      closeDialog();
      refetchAssignments();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save assignment');
    }
  };

  const isLoading = assignmentsLoading || schedulesLoading || usersLoading;

  const stats = {
    totalAssignments: assignments.length,
    activeAssignments: assignments.filter((assignment) => assignment.isActive).length,
    uniqueRooms: new Set(
      assignments
        .map((assignment) => (assignment.roomSchedule as any)?.room?.room_code)
        .filter(Boolean)
    ).size,
    uniqueEmployees: new Set(assignments.map((assignment) => assignment.employeeId)).size,
  };

  return (
    <div className="space-y-6">
      <RoomAssignmentsHeader
        actions={
          <div className="flex items-center gap-4">
            <RefreshButton onRefresh={handleRefresh} loading={isLoading} />
            <RoomAssignmentQuickActions onAssign={handleCreate} />
          </div>
        }
      />

      {errorMessage && <ErrorAlert title="Failed to load data" message={errorMessage} />}

      <RoomAssignmentStats
        totalAssignments={stats.totalAssignments}
        activeAssignments={stats.activeAssignments}
        uniqueRooms={stats.uniqueRooms}
        uniqueEmployees={stats.uniqueEmployees}
        isLoading={assignmentsLoading}
      />

      <RoomAssignmentFilters
        searchTerm={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <RoomAssignmentsTable
        assignments={filteredAssignments}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={isDeleting}
        isLoading={isLoading}
      />

      <RoomAssignmentDialog
        mode={dialogMode}
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          } else {
            setIsDialogOpen(open);
          }
        }}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        schedules={schedules}
        users={users}
        isSubmitting={dialogMode === 'create' ? isCreating : isUpdating}
      />
    </div>
  );
}

