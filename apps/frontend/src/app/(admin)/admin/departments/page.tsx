'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getBooleanStatusBadge } from '@/utils/status-badge';
import { useGetDepartmentsQuery, useDeleteDepartmentMutation } from '@/store/departmentApi';
import { DepartmentTable } from '@/components/admin/room/DepartmentTable';
import { DepartmentStatsCards } from '@/components/admin/room/department-stats-cards';
import { DepartmentFilters } from '@/components/admin/room/department-filters';
import { DepartmentViewModal } from '@/components/admin/room/department-view-modal';
import { DepartmentFormModal } from '@/components/admin/room/department-form-modal';
import { DepartmentDeleteModal } from '@/components/admin/room/department-delete-modal';
import { RefreshButton } from '@/components/ui/refresh-button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Pagination } from '@/components/common/PaginationV1';
import { Department } from '@/interfaces/user/department.interface';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
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
    data: departmentsData,
    isLoading: departmentsLoading,
    error: departmentsError,
    refetch: refetchDepartments,
  } = useGetDepartmentsQuery(queryParams);

  const [deleteDepartment, { isLoading: isDeletingDepartment }] = useDeleteDepartmentMutation();

  useEffect(() => {
    if (departmentsError) {
      const error = departmentsError as FetchBaseQueryError;
      const errorMessage = 
        error?.data && 
        typeof error.data === 'object' &&
        'message' in error.data
          ? (error.data as { message: string }).message
          : 'Failed to load department data. Please try again.';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [departmentsError]);

  const departments: Department[] = departmentsData?.data ?? [];
  const paginationMeta = departmentsData && {
    total: departmentsData.total,
    page: departmentsData.page,
    limit: departmentsData.limit,
    totalPages: departmentsData.totalPages,
    hasNextPage: departmentsData.hasNextPage,
    hasPreviousPage: departmentsData.hasPreviousPage,
  };

  const stats = useMemo(() => {
    const total = departmentsData?.total ?? 0;
    const active = departments.filter((d) => d.isActive).length;
    const inactive = departments.filter((d) => !d.isActive).length;
    const totalRooms = departments.reduce((sum, d) => sum + (d.rooms?.length || 0), 0);
    return { total, active, inactive, totalRooms };
  }, [departments, departmentsData?.total]);

  const getStatusDepartmentBadge = (isActive: boolean) => {
    return getBooleanStatusBadge(isActive);
  };

  const handleRefresh = async () => {
    await refetchDepartments();
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

  const handleViewDetails = (department: Department) => {
    setSelectedDepartment(department);
    setIsViewModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsFormModalOpen(true);
  };

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteDepartment = async () => {
    if (!selectedDepartment) return;
    try {
      await deleteDepartment(selectedDepartment.id).unwrap();
      toast.success(`Department ${selectedDepartment.departmentName} deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedDepartment(null);
      await refetchDepartments();
    } catch (err) {
      const error = err as ApiError;
      toast.error(
        error?.data?.message || `Failed to delete department ${selectedDepartment.departmentName}`
      );
    }
  };

  const handleFormSuccess = () => {
    refetchDepartments();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Department Management</h1>
          <p className="text-foreground">Search and manage department records</p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton
            onRefresh={handleRefresh}
            loading={departmentsLoading}
          />
          <Button
            onClick={handleCreateDepartment}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Department
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert title="Failed to load departments" message={error} className="mb-4" />
      )}

      <DepartmentStatsCards
        totalCount={stats.total}
        activeCount={stats.active}
        inactiveCount={stats.inactive}
        totalRooms={stats.totalRooms}
        isLoading={departmentsLoading}
      />

      <DepartmentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        isSearching={departmentsLoading}
      />

      <DepartmentTable
        departments={departments}
        getStatusBadge={getStatusDepartmentBadge}
        isLoading={departmentsLoading}
        emptyStateIcon={<Building2 className="h-12 w-12" />}
        emptyStateTitle="No departments found"
        emptyStateDescription="No departments match your search criteria. Try adjusting your filters or search terms."
        onViewDetails={handleViewDetails}
        onEditDepartment={handleEditDepartment}
        onDeleteDepartment={handleDeleteDepartment}
      />
      {paginationMeta && (
        <Pagination
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}

      <DepartmentViewModal
        department={selectedDepartment}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedDepartment(null);
        }}
        onEdit={(department) => {
          setIsViewModalOpen(false);
          handleEditDepartment(department);
        }}
      />

      <DepartmentFormModal
        department={selectedDepartment}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedDepartment(null);
        }}
        onSuccess={handleFormSuccess}
      />

      <DepartmentDeleteModal
        department={selectedDepartment}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDepartment(null);
        }}
        onConfirm={confirmDeleteDepartment}
        isDeleting={isDeletingDepartment}
      />
    </div>
  );
}
