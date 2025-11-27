'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useGetBodyPartsQuery, useDeleteBodyPartMutation } from '@/store/bodyPartApi';
import { BodyPartTable } from '@/components/admin/body-part/BodyPartTable';
import { BodyPartStatsCards } from '@/components/admin/body-part/body-part-stats-cards';
import { BodyPartFilters } from '@/components/admin/body-part/body-part-filters';
import { BodyPartViewModal } from '@/components/admin/body-part/body-part-view-modal';
import { BodyPartFormModal } from '@/components/admin/body-part/body-part-form-modal';
import { BodyPartDeleteModal } from '@/components/admin/body-part/body-part-delete-modal';
import { RefreshButton } from '@/components/ui/refresh-button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Pagination } from '@/components/common/PaginationV1';
import { BodyPart } from '@/interfaces/imaging/body-part.interface';
import { QueryParams } from '@/interfaces/pagination/pagination.interface';
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
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
      includeInactive: true,
      includeDeleted: true,
    };

    if (appliedSearchTerm.trim()) {
      params.search = appliedSearchTerm.trim();
    }

    return params;
  }, [page, limit, appliedSearchTerm]);

  const {
    data: bodyPartsData,
    isLoading: bodyPartsLoading,
    error: bodyPartsError,
    refetch: refetchBodyParts,
  } = useGetBodyPartsQuery(queryParams);

  const [deleteBodyPart, { isLoading: isDeletingBodyPart }] = useDeleteBodyPartMutation();

  useEffect(() => {
    if (bodyPartsError) {
      const error = bodyPartsError as FetchBaseQueryError;
      const errorMessage = 
        error?.data && 
        typeof error.data === 'object' &&
        'message' in error.data
          ? (error.data as { message: string }).message
          : 'Failed to load body part data. Please try again.';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [bodyPartsError]);

  const bodyParts: BodyPart[] = bodyPartsData?.data ?? [];
  const paginationMeta = bodyPartsData && {
    total: bodyPartsData.total,
    page: bodyPartsData.page,
    limit: bodyPartsData.limit,
    totalPages: bodyPartsData.totalPages,
    hasNextPage: bodyPartsData.hasNextPage,
    hasPreviousPage: bodyPartsData.hasPreviousPage,
  };

  const stats = useMemo(() => {
    const total = bodyPartsData?.total ?? 0;
    return { total };
  }, [bodyPartsData?.total]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchBodyParts();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setPage(1);
  }, [searchTerm]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleViewDetails = (bodyPart: BodyPart) => {
    setSelectedBodyPart(bodyPart);
    setIsViewModalOpen(true);
  };

  const handleEditBodyPart = (bodyPart: BodyPart) => {
    setSelectedBodyPart(bodyPart);
    setIsFormModalOpen(true);
  };

  const handleCreateBodyPart = () => {
    setSelectedBodyPart(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteBodyPart = (bodyPart: BodyPart) => {
    setSelectedBodyPart(bodyPart);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteBodyPart = async () => {
    if (!selectedBodyPart) return;
    try {
      await deleteBodyPart(selectedBodyPart.id).unwrap();
      toast.success(`Body part ${selectedBodyPart.name} deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedBodyPart(null);
      await refetchBodyParts();
    } catch (err) {
      const error = err as ApiError;
      toast.error(
        error?.data?.message || `Failed to delete body part ${selectedBodyPart.name}`
      );
    }
  };

  const handleFormSuccess = () => {
    refetchBodyParts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Body Part Management</h1>
          <p className="text-foreground">Search and manage body part records</p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton
            onRefresh={handleRefresh}
            loading={isRefreshing}
          />
          <Button
            onClick={handleCreateBodyPart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Body Part
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert title="Failed to load body parts" message={error} className="mb-4" />
      )}

      <BodyPartStatsCards
        totalCount={stats.total}
        isLoading={bodyPartsLoading}
      />

      <BodyPartFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        isSearching={bodyPartsLoading}
      />

      <BodyPartTable
        bodyParts={bodyParts}
        isLoading={bodyPartsLoading}
        emptyStateIcon={<Activity className="h-12 w-12" />}
        emptyStateTitle="No body parts found"
        emptyStateDescription="No body parts match your search criteria. Try adjusting your filters or search terms."
        onViewDetails={handleViewDetails}
        onEditBodyPart={handleEditBodyPart}
        onDeleteBodyPart={handleDeleteBodyPart}
      />
      {paginationMeta && (
        <Pagination
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}

      <BodyPartViewModal
        bodyPart={selectedBodyPart}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedBodyPart(null);
        }}
        onEdit={(bodyPart) => {
          setIsViewModalOpen(false);
          handleEditBodyPart(bodyPart);
        }}
      />

      <BodyPartFormModal
        bodyPart={selectedBodyPart}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedBodyPart(null);
        }}
        onSuccess={handleFormSuccess}
      />

      <BodyPartDeleteModal
        bodyPart={selectedBodyPart}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBodyPart(null);
        }}
        onConfirm={confirmDeleteBodyPart}
        isDeleting={isDeletingBodyPart}
      />
    </div>
  );
}

