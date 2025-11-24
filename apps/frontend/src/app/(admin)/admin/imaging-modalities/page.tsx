'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Button } from '@/components/ui/button';
import { getBooleanStatusBadge } from '@/utils/status-badge';
import { ImagingModalityFiltersSection } from '@/components/admin/imaging-modality/imaging-modality-filters';
import { ImagingModalityTable } from '@/components/admin/imaging-modality/imaging-modality-table';
import { ImagingModalityStatsCards } from '@/components/admin/imaging-modality/imaging-modality-stats-cards';
import { ImagingModalityFormModal } from '@/components/admin/imaging-modality/imaging-modality-form-modal';
import { ImagingModalityViewModal } from '@/components/admin/imaging-modality/imaging-modality-view-modal';
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
  CreateImagingModalityDto,
  UpdateImagingModalityDto,
} from '@/store/imagingModalityApi';
import { ImagingModality } from '@/interfaces/image-dicom/imaging_modality.interface';
import {
  useCreateImagingModalityMutation,
  useDeleteImagingModalityMutation,
  useGetImagingModalityPaginatedQuery,
  useUpdateImagingModalityMutation,
} from '@/store/imagingModalityApi';

interface ApiError {
  data?: {
    message?: string;
  };
}

export default function ImagingModalityPage() {
  const [filters, setFilters] = useState<PaginatedQuery & { searchField?: string }>({
    page: 1,
    limit: 10,
    search: "",
    searchField: "modalityName",
    sortBy: "createdAt",
    order: "desc",
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedModalityId, setSelectedModalityId] = useState<string | null>(
    null
  );
  const [modalityToDelete, setModalityToDelete] =
    useState<ImagingModality | null>(null);

  const [error, setError] = useState<string | null>(null);

  const {
    data: modalitiesData,
    isLoading,
    error: modalitiesError,
    refetch,
  } = useGetImagingModalityPaginatedQuery(filters);

  const [createModality, { isLoading: isCreating }] =
    useCreateImagingModalityMutation();
  const [updateModality, { isLoading: isUpdating }] =
    useUpdateImagingModalityMutation();
  const [deleteModality, { isLoading: isDeleting }] =
    useDeleteImagingModalityMutation();

  useEffect(() => {
    if (modalitiesError) {
      const error = modalitiesError as FetchBaseQueryError;
      const errorMessage = 
        error?.data && 
        typeof error.data === 'object' &&
        'message' in error.data
          ? (error.data as { message: string }).message
          : 'Failed to load imaging modality data. Please try again.';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [modalitiesError]);

  const modalities = modalitiesData?.data || [];
  const meta: PaginationMeta = {
    page: modalitiesData?.page || 1,
    limit: modalitiesData?.limit || 10,
    total: modalitiesData?.total || 0,
    totalPages: modalitiesData?.totalPages || 0,
    hasNextPage: modalitiesData?.hasNextPage || false,
    hasPreviousPage: modalitiesData?.hasPreviousPage || false,
  };

  const stats = useMemo(() => {
    let active = 0;
    let inactive = 0;
    
    modalities.forEach((m) => {
      if (m.isActive) active++;
      else inactive++;
    });
    
    return {
      total: meta.total,
      active,
      inactive,
    };
  }, [modalities, meta.total]);

  const handleCreate = () => {
    setSelectedModalityId(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (modality: ImagingModality) => {
    setSelectedModalityId(modality.id);
    setIsFormModalOpen(true);
  };

  const handleView = (modality: ImagingModality) => {
    setSelectedModalityId(modality.id);
    setIsViewModalOpen(true);
  };

  const handleDelete = (modality: ImagingModality) => {
    setModalityToDelete(modality);
  };

  const confirmDelete = async () => {
    if (!modalityToDelete) return;

    try {
      await deleteModality(modalityToDelete.id).unwrap();
      toast.success("Imaging modality deleted successfully");
      setModalityToDelete(null);
    } catch (err) {
      const error = err as ApiError;
      toast.error(
        error?.data?.message || "Failed to delete imaging modality"
      );
    }
  };

  const handleSubmit = async (
    data: CreateImagingModalityDto | UpdateImagingModalityDto
  ) => {
    try {
      if (selectedModalityId) {
        await updateModality({
          id: selectedModalityId,
          data: data as UpdateImagingModalityDto,
        }).unwrap();
        toast.success("Imaging modality updated successfully");
      } else {
        await createModality(data as CreateImagingModalityDto).unwrap();
        toast.success("Imaging modality created successfully");
      }
      setIsFormModalOpen(false);
      setSelectedModalityId(null);
    } catch (err) {
      const error = err as ApiError;
      toast.error(
        error?.data?.message ||
          `Failed to ${selectedModalityId ? "update" : "create"} imaging modality`
      );
    }
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      searchField: "modalityName",
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
          <h1 className="text-3xl font-bold text-foreground">Imaging Modalities</h1>
          <p className="text-foreground">Manage imaging modalities and their configurations</p>
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
            Add Modality
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert title="Failed to load imaging modalities" message={error} className="mb-4" />
      )}

      <ImagingModalityStatsCards
        totalCount={stats.total}
        activeCount={stats.active}
        inactiveCount={stats.inactive}
        isLoading={isLoading}
      />

      <ImagingModalityFiltersSection
        filters={filters}
        onFiltersChange={setFilters}
        onReset={handleReset}
      />

      <ImagingModalityTable
        modalityItems={modalities}
        getStatusBadge={getBooleanStatusBadge}
        isLoading={isLoading}
        onViewDetails={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        page={meta.page}
        limit={meta.limit}
      />

      {meta.totalPages > 1 && (
        <Pagination
          pagination={meta}
          onPageChange={handlePageChange}
        />
      )}

      <ImagingModalityFormModal
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedModalityId(null);
        }}
        onSubmit={handleSubmit}
        modalityId={selectedModalityId || undefined}
        isLoading={isCreating || isUpdating}
      />

      <ImagingModalityViewModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedModalityId(null);
        }}
        modalityId={selectedModalityId || ""}
        onEdit={(id) => {
          setIsViewModalOpen(false);
          setSelectedModalityId(id);
          setIsFormModalOpen(true);
        }}
      />

      <AlertDialog
        open={!!modalityToDelete}
        onOpenChange={(open) => !open && setModalityToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Imaging Modality</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{modalityToDelete?.modalityName}</strong>? This action
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

