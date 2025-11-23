"use client";
import { ModalityMachineFiltersSection } from "@/components/admin/modality-machine/modality-machine-filters";
import { ModalityMachineTable } from "@/components/admin/modality-machine/modality-machine-table";
import { ModalityMachineStatsCards } from "@/components/admin/modality-machine/modality-machine-stats-cards";
import { ModalityMachineFormModal } from "@/components/admin/modality-machine/modality-machine-form-modal";
import { ModalityMachineViewModal } from "@/components/admin/modality-machine/modality-machine-view-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/ui/refresh-button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Pagination } from "@/components/common/PaginationV1";
import {
  PaginatedQuery,
  PaginationMeta,
} from "@/interfaces/pagination/pagination.interface";
import {
  CreateModalityMachineDto,
  UpdateModalityMachineDto,
} from "@/interfaces/image-dicom/modality-machine.interface";
import { ModalityMachine } from "@/interfaces/image-dicom/modality-machine.interface";
import {
  useCreateModalityMachineMutation,
  useDeleteModalityMachineMutation,
  useGetModalityMachinePaginatedQuery,
  useUpdateModalityMachineMutation,
} from "@/store/modalityMachineApi";
import { Plus } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { MachineStatus } from "@/enums/machine-status.enum";

export default function ModalityMachinePage() {
  const [filters, setFilters] = useState<PaginatedQuery & { modalityId?: string; status?: string }>({
    page: 1,
    limit: 10,
    search: "",
    searchField: "name",
    sortField: "createdAt",
    order: "desc",
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(
    null
  );
  const [machineToDelete, setMachineToDelete] =
    useState<ModalityMachine | null>(null);

  const {
    data: machinesData,
    isLoading,
    error,
    refetch,
  } = useGetModalityMachinePaginatedQuery(filters);

  const [createMachine, { isLoading: isCreating }] =
    useCreateModalityMachineMutation();
  const [updateMachine, { isLoading: isUpdating }] =
    useUpdateModalityMachineMutation();
  const [deleteMachine, { isLoading: isDeleting }] =
    useDeleteModalityMachineMutation();

  useEffect(() => {
    if (filters.page === undefined || filters.limit === undefined) {
      setFilters((prev) => ({
        ...prev,
        page: 1,
        limit: 10,
      }));
    }
  }, [filters.page, filters.limit]);

  const machines = machinesData?.data || [];
  const meta: PaginationMeta = machinesData?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
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
    } catch (error: any) {
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
    } catch (error: any) {
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
      sortField: "createdAt",
      order: "desc",
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Modality Machines
          </h1>
          <p className="text-muted-foreground">
            Manage modality machines and their assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={() => refetch()} />
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Machine
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert
          title="Error loading modality machines"
          message={
            (error as FetchBaseQueryError)?.data
              ? JSON.stringify((error as FetchBaseQueryError).data)
              : "An error occurred while loading modality machines"
          }
        />
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

      {meta.totalPages > 1 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <ModalityMachineFormModal
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedMachineId(null);
        }}
        onSubmit={handleSubmit}
        machineId={selectedMachineId || undefined}
        isLoading={isCreating || isUpdating}
      />

      <ModalityMachineViewModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedMachineId(null);
        }}
        machineId={selectedMachineId || ""}
        onEdit={(id) => {
          setIsViewModalOpen(false);
          setSelectedMachineId(id);
          setIsFormModalOpen(true);
        }}
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

