'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useGetRequestProceduresPaginatedQuery,
  useDeleteRequestProcedureMutation,
} from '@/store/requestProcedureAPi';
import { RequestProcedureTable } from '@/components/admin/procedure/ProcedureTable';
import { RequestProcedureStatsCards } from '@/components/admin/procedure/procedure-stats-cards';
import { RequestProcedureFilters } from '@/components/admin/procedure/procedure-filters';
import { RequestProcedureViewModal } from '@/components/admin/procedure/procedure-view-modal';
import { RequestProcedureFormModal } from '@/components/admin/procedure/procedure-form-modal';
import { RequestProcedureDeleteModal } from '@/components/admin/procedure/procedure-delete-modal';
import { RefreshButton } from '@/components/ui/refresh-button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Pagination } from '@/components/common/PaginationV1';
import { RequestProcedure } from '@/common/interfaces/image-dicom/request-procedure.interface';
import { QueryParams } from '@/common/interfaces/pagination/pagination.interface';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface ApiError {
  data?: {
    message?: string;
  };
}

export default function Page() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState<RequestProcedure | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const queryParams: QueryParams = useMemo(() => {
    const params: QueryParams = {
      page,
      limit,
    };

    if (appliedSearchTerm.trim()) {
      params.search = appliedSearchTerm.trim();
    }

    if (appliedStatusFilter !== 'all') {
      params.isActive = appliedStatusFilter === 'active';
    }

    return params;
  }, [page, limit, appliedSearchTerm, appliedStatusFilter]);

  const {
    data: proceduresData,
    isLoading: proceduresLoading,
    error: proceduresError,
    refetch: refetchProcedures,
  } = useGetRequestProceduresPaginatedQuery(queryParams);

  const [deleteRequestProcedure, { isLoading: isDeletingProcedure }] = useDeleteRequestProcedureMutation();

  useEffect(() => {
    if (proceduresError) {
      const error = proceduresError as FetchBaseQueryError;
      const errorMessage =
        error?.data &&
        typeof error.data === 'object' &&
        'message' in error.data
          ? (error.data as { message: string }).message
          : 'Failed to load procedure data. Please try again.';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [proceduresError]);

  const procedures: RequestProcedure[] = proceduresData?.data ?? [];
  const paginationMeta = proceduresData && {
    total: proceduresData.total,
    page: proceduresData.page,
    limit: proceduresData.limit,
    totalPages: proceduresData.totalPages,
    hasNextPage: proceduresData.hasNextPage,
    hasPreviousPage: proceduresData.hasPreviousPage,
  };

  const stats = useMemo(() => {
    const total = proceduresData?.total ?? 0;
    const active = procedures.filter((p) => p.isActive).length;
    const inactive = procedures.filter((p) => !p.isActive).length;
    const totalBodyParts = procedures.length; // Or sum by unique bodyPartId if needed
    return { total, active, inactive, totalBodyParts };
  }, [procedures, proceduresData?.total]);

  const getStatusProcedureBadge = (isActive: boolean) =>
    isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    );

  const handleRefresh = async () => {
    await refetchProcedures();
  };

  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStatusFilter(statusFilter);
    setPage(1);
  }, [searchTerm, statusFilter]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setAppliedSearchTerm('');
    setAppliedStatusFilter('all');
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleViewDetails = (procedure: RequestProcedure) => {
    setSelectedProcedure(procedure);
    setIsViewModalOpen(true);
  };

  const handleEditProcedure = (procedure: RequestProcedure) => {
    setSelectedProcedure(procedure);
    setIsFormModalOpen(true);
  };

  const handleCreateProcedure = () => {
    setSelectedProcedure(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteProcedure = (procedure: RequestProcedure) => {
    setSelectedProcedure(procedure);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProcedure = async () => {
    if (!selectedProcedure) return;
    try {
      await deleteRequestProcedure(selectedProcedure.id).unwrap();
      toast.success(`Procedure ${selectedProcedure.name} deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedProcedure(null);
      await refetchProcedures();
    } catch (err) {
      const error = err as ApiError;
      toast.error(
        error?.data?.message || `Failed to delete procedure ${selectedProcedure.name}`
      );
    }
  };

  const handleFormSuccess = () => {
    refetchProcedures();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Procedure Management</h1>
          <p className="text-foreground">Search and manage procedure records</p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton
            onRefresh={handleRefresh}
            loading={proceduresLoading}
          />
          <Button
            onClick={handleCreateProcedure}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            Add New Procedure
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert title="Failed to load procedures" message={error} className="mb-4" />
      )}

      <RequestProcedureStatsCards
        totalCount={stats.total}
        activeCount={stats.active}
        inactiveCount={stats.inactive}
        totalBodyParts={stats.totalBodyParts}
        isLoading={proceduresLoading}
      />

      <RequestProcedureFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        isSearching={proceduresLoading}
      />

      <RequestProcedureTable
        procedures={procedures}
        getStatusBadge={getStatusProcedureBadge}
        isLoading={proceduresLoading}
        emptyStateIcon={<Building2 className="h-12 w-12" />}
        emptyStateTitle="No procedures found"
        emptyStateDescription="No procedures match your search criteria. Try adjusting your filters or search terms."
        onViewDetails={handleViewDetails}
        onEditProcedure={handleEditProcedure}
        onDeleteProcedure={handleDeleteProcedure}
      />
      {paginationMeta && (
        <Pagination
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}

      <RequestProcedureViewModal
        procedure={selectedProcedure}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedProcedure(null);
        }}
        onEdit={(procedure) => {
          setIsViewModalOpen(false);
          handleEditProcedure(procedure);
        }}
      />

      <RequestProcedureFormModal
        procedure={selectedProcedure}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedProcedure(null);
        }}
        onSuccess={handleFormSuccess}
      />

      <RequestProcedureDeleteModal
        procedure={selectedProcedure}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProcedure(null);
        }}
        onConfirm={confirmDeleteProcedure}
        isDeleting={isDeletingProcedure}
      />
    </div>
  );
}
