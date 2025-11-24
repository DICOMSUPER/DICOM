'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Button } from '@/components/ui/button';
import { ModalityMachineFiltersSection } from '@/components/admin/modality-machine/modality-machine-filters';
import { ModalityMachineTable } from '@/components/admin/modality-machine/modality-machine-table';
import { ModalityMachineStatsCards } from '@/components/admin/modality-machine/modality-machine-stats-cards';
import { ModalityMachineFormModal } from '@/components/admin/modality-machine/modality-machine-form-modal';
import { ModalityMachineViewModal } from '@/components/admin/modality-machine/modality-machine-view-modal';
import { RefreshButton } from '@/components/ui/refresh-button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Pagination } from '@/components/common/PaginationV1';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  PaginatedQuery,
  PaginationMeta,
} from '@/interfaces/pagination/pagination.interface';
import {
  CreateModalityMachineDto,
  UpdateModalityMachineDto,
} from '@/interfaces/image-dicom/modality-machine.interface';
import { ModalityMachine } from '@/interfaces/image-dicom/modality-machine.interface';
import {
  useCreateModalityMachineMutation,
  useDeleteModalityMachineMutation,
  useGetModalityMachinePaginatedQuery,
  useUpdateModalityMachineMutation,
} from '@/store/modalityMachineApi';
import { useGetRoomsQuery } from '@/store/roomsApi';
import { MachineStatus } from '@/enums/machine-status.enum';
import { Room } from '@/interfaces/user/room.interface';

interface ApiError {
  data?: {
    message?: string;
  };
}

export default function ModalityMachinePage() {
  const [filters, setFilters] = useState<PaginatedQuery & { modalityId?: string; status?: string; searchField?: string; sortField?: string }>({
    page: 1,
    limit: 10,
    search: "",
    searchField: "name",
    sortBy: "createdAt",
    order: "desc",
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(
    null
  );
  const [machineToDelete, setMachineToDelete] =
    useState<ModalityMachine | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: machinesData,
    isLoading,
    error: machinesError,
    refetch,
  } = useGetModalityMachinePaginatedQuery(filters);

  const { data: roomsData, refetch: refetchRooms } = useGetRoomsQuery({ page: 1, limit: 10000 });
  const rooms = roomsData?.data || [];

  const [createMachine, { isLoading: isCreating }] =
    useCreateModalityMachineMutation();
  const [updateMachine, { isLoading: isUpdating }] =
    useUpdateModalityMachineMutation();
  const [deleteMachine, { isLoading: isDeleting }] =
    useDeleteModalityMachineMutation();

  useEffect(() => {
    if (machinesError) {
      const error = machinesError as FetchBaseQueryError;
      const errorMessage = 
        error?.data && 
        typeof error.data === 'object' &&
        'message' in error.data
          ? (error.data as { message: string }).message
          : 'Failed to load modality machine data. Please try again.';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [machinesError]);

  const machines = machinesData?.data || [];
  const meta: PaginationMeta = {
    page: machinesData?.page || 1,
    limit: machinesData?.limit || 10,
    total: machinesData?.total || 0,
    totalPages: machinesData?.totalPages || 0,
    hasNextPage: machinesData?.hasNextPage || false,
    hasPreviousPage: machinesData?.hasPreviousPage || false,
  };

  const stats = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let maintenance = 0;
    
    machines.forEach((m) => {
      if (m.status === MachineStatus.ACTIVE) active++;
      else if (m.status === MachineStatus.INACTIVE) inactive++;
      else if (m.status === MachineStatus.MAINTENANCE) maintenance++;
    });
    
    return {
      total: meta.total,
      active,
      inactive,
      maintenance,
    };
  }, [machines, meta.total]);

  const handleCreate = () => {
    setSelectedMachineId(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (machine: ModalityMachine) => {
    setSelectedMachineId(machine.id);
    setIsFormModalOpen(true);
  };

  const handleView = (machine: ModalityMachine) => {
    setSelectedMachineId(machine.id);
    setIsViewModalOpen(true);
  };

  const handleDelete = (machine: ModalityMachine) => {
    setMachineToDelete(machine);
  };

  const confirmDelete = async () => {
    if (!machineToDelete) return;

    try {
      await deleteMachine({ id: machineToDelete.id }).unwrap();
      toast.success("Modality machine deleted successfully");
      setMachineToDelete(null);
      await refetch();
    } catch (err) {
      const error = err as ApiError;
      toast.error(
        error?.data?.message || "Failed to delete modality machine"
      );
    }
  };

  const handleSubmit = async (
    data: CreateModalityMachineDto | UpdateModalityMachineDto
  ) => {
    try {
      if (selectedMachineId) {
        await updateMachine({
          id: selectedMachineId,
          data: data as UpdateModalityMachineDto,
        }).unwrap();
        toast.success("Modality machine updated successfully");
      } else {
        await createMachine(data as CreateModalityMachineDto).unwrap();
        toast.success("Modality machine created successfully");
      }
      setIsFormModalOpen(false);
      setSelectedMachineId(null);
      await refetch();
    } catch (err) {
      const error = err as ApiError;
      toast.error(
        error?.data?.message ||
          `Failed to ${selectedMachineId ? "update" : "create"} modality machine`
      );
    }
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      searchField: "name",
      sortBy: "createdAt",
      order: "desc",
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      // Also refetch rooms since they're used in modals
      await refetchRooms();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Modality Machines</h1>
          <p className="text-foreground">Manage modality machines and their assignments</p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton
            onRefresh={handleRefresh}
            loading={isRefreshing}
          />
          <Button
            onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Machine
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert title="Failed to load modality machines" message={error} className="mb-4" />
      )}

      <ModalityMachineStatsCards
        totalCount={stats.total}
        activeCount={stats.active}
        inactiveCount={stats.inactive}
        maintenanceCount={stats.maintenance}
        isLoading={isLoading}
      />

      <ModalityMachineFiltersSection
        filters={filters}
        onFiltersChange={setFilters}
        onReset={handleReset}
      />

      <ModalityMachineTable
        machineItems={machines}
        isLoading={isLoading}
        onViewDetails={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        page={meta.page}
        limit={meta.limit}
      />

      <Pagination
        pagination={meta}
        onPageChange={handlePageChange}
      />

      <ModalityMachineFormModal
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedMachineId(null);
        }}
        onSubmit={handleSubmit}
        machineId={selectedMachineId || undefined}
        isLoading={isCreating || isUpdating}
        rooms={rooms}
      />

      <ModalityMachineViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedMachineId(null);
        }}
        machineId={selectedMachineId}
        onEdit={(id) => {
          setIsViewModalOpen(false);
          setSelectedMachineId(id);
          setIsFormModalOpen(true);
        }}
        rooms={rooms}
      />

      <AlertDialog
        open={!!machineToDelete}
        onOpenChange={(open) => !open && setMachineToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Modality Machine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{machineToDelete?.name}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

