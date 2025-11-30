'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getBooleanStatusBadge } from '@/utils/status-badge';
import {
  useGetShiftTemplatesQuery,
  useGetShiftTemplateStatsQuery,
  useDeleteShiftTemplateMutation,
  useUpdateShiftTemplateMutation,
} from '@/store/scheduleApi';
import { ShiftTemplateTable } from '@/components/admin/shift-template/ShiftTemplateTable';
import { ShiftTemplateStatsCards } from '@/components/admin/shift-template/shift-template-stats-cards';
import { ShiftTemplateFilters } from '@/components/admin/shift-template/shift-template-filters';
import { ShiftTemplateViewModal } from '@/components/admin/shift-template/shift-template-view-modal';
import { ShiftTemplateFormModal } from '@/components/admin/shift-template/shift-template-form-modal';
import { ShiftTemplateDeleteModal } from '@/components/admin/shift-template/shift-template-delete-modal';
import { RefreshButton } from '@/components/ui/refresh-button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Pagination } from '@/components/common/PaginationV1';
import { ShiftTemplate } from '@/interfaces/user/shift-template.interface';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SortConfig } from '@/components/ui/data-table';
import { sortConfigToQueryParams } from '@/utils/sort-utils';

interface ApiError {
  data?: {
    message?: string;
  };
}

export default function Page() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [appliedTypeFilter, setAppliedTypeFilter] = useState('all');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ShiftTemplate | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({});

  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
      includeInactive: true,
      includeDeleted: true,
    };

    if (appliedTypeFilter !== 'all') {
      params.shift_type = appliedTypeFilter;
    }

    if (appliedStatusFilter !== 'all') {
      params.is_active = appliedStatusFilter === 'true';
    }

    const sortParams = sortConfigToQueryParams(sortConfig);
    Object.assign(params, sortParams);

    return params;
  }, [page, limit, appliedTypeFilter, appliedStatusFilter, sortConfig]);

  const {
    data: templatesRes,
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates,
  } = useGetShiftTemplatesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteTemplate, { isLoading: isDeletingTemplate }] = useDeleteShiftTemplateMutation();

  const {
    data: shiftTemplateStatsData,
    isLoading: shiftTemplateStatsLoading,
    refetch: refetchShiftTemplateStats,
  } = useGetShiftTemplateStatsQuery();

  useEffect(() => {
    if (templatesError) {
      const error = templatesError as FetchBaseQueryError;
      const errorMessage = 
        error?.data && 
        typeof error.data === 'object' &&
        'message' in error.data
          ? (error.data as { message: string }).message
          : 'Failed to load shift template data. Please try again.';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [templatesError]);

  const templates: ShiftTemplate[] = templatesRes?.data ?? [];
  const paginationMeta = templatesRes ? {
    total: templatesRes.total ?? 0,
    page: templatesRes.page ?? 1,
    limit: templatesRes.limit ?? limit,
    totalPages: templatesRes.totalPages ?? 1,
    hasNextPage: templatesRes.hasNextPage ?? false,
    hasPreviousPage: templatesRes.hasPreviousPage ?? false,
  } : null;

  const stats = useMemo(() => {
    const total = shiftTemplateStatsData?.totalTemplates ?? 0;
    const active = shiftTemplateStatsData?.activeTemplates ?? 0;
    const inactive = shiftTemplateStatsData?.inactiveTemplates ?? 0;
    
    const getCountByType = (type: string) => {
      const typeData = shiftTemplateStatsData?.templatesByType?.find(
        (t) => t.type === type
      );
      return typeData ? parseInt(typeData.count, 10) : templates.filter((t) => t.shift_type === type).length;
    };

    return {
      total,
      active,
      inactive,
      morning: getCountByType('morning'),
      afternoon: getCountByType('afternoon'),
      night: getCountByType('night'),
      fullDay: getCountByType('full_day'),
    };
  }, [shiftTemplateStatsData, templates]);

  const getStatusBadge = (isActive: boolean) => {
    return getBooleanStatusBadge(isActive);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchTemplates(), refetchShiftTemplateStats()]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = useCallback(() => {
    setAppliedTypeFilter(typeFilter);
    setAppliedStatusFilter(statusFilter);
    setPage(1);
  }, [typeFilter, statusFilter]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setAppliedTypeFilter('all');
    setAppliedStatusFilter('all');
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSort = useCallback((newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    setPage(1);
  }, []);

  const handleViewDetails = (template: ShiftTemplate) => {
    setSelectedTemplate(template);
    setIsViewModalOpen(true);
  };

  const handleEditTemplate = (template: ShiftTemplate) => {
    setSelectedTemplate(template);
    setIsFormModalOpen(true);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteTemplate = (template: ShiftTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      await deleteTemplate(selectedTemplate.shift_template_id).unwrap();
      toast.success(`Shift template ${selectedTemplate.shift_name} deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedTemplate(null);
      await refetchTemplates();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error?.data?.message || `Failed to delete shift template ${selectedTemplate.shift_name}`);
    }
  };

  const handleFormSuccess = () => {
    refetchTemplates();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shift Template Management</h1>
          <p className="text-foreground">Search and manage shift template records</p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton
            onRefresh={handleRefresh}
            loading={isRefreshing}
          />
          <Button
            onClick={handleCreateTemplate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Template
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert title="Failed to load shift templates" message={error} className="mb-4" />
      )}

      <ShiftTemplateStatsCards
        totalCount={stats.total}
        activeCount={stats.active}
        inactiveCount={stats.inactive}
        morningCount={stats.morning}
        afternoonCount={stats.afternoon}
        nightCount={stats.night}
        fullDayCount={stats.fullDay}
        isLoading={templatesLoading || shiftTemplateStatsLoading}
      />

      <ShiftTemplateFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        isSearching={templatesLoading}
      />

      <ShiftTemplateTable
        templates={templates}
        getStatusBadge={getStatusBadge}
        isLoading={templatesLoading}
        emptyStateIcon={<Clock className="h-12 w-12" />}
        emptyStateTitle="No shift templates found"
        emptyStateDescription="No shift templates match your search criteria. Try adjusting your filters or search terms."
        onViewDetails={handleViewDetails}
        onEditTemplate={handleEditTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        page={paginationMeta?.page ?? page}
        limit={limit}
        onSort={handleSort}
        initialSort={sortConfig.field ? sortConfig : undefined}
      />
      {paginationMeta && (
        <Pagination
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}

      <ShiftTemplateViewModal
        template={selectedTemplate}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTemplate(null);
        }}
        onEdit={(template) => {
          setIsViewModalOpen(false);
          handleEditTemplate(template);
        }}
      />

      <ShiftTemplateFormModal
        template={selectedTemplate}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedTemplate(null);
        }}
        onSuccess={handleFormSuccess}
      />

      <ShiftTemplateDeleteModal
        template={selectedTemplate}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTemplate(null);
        }}
        onConfirm={confirmDeleteTemplate}
        isDeleting={isDeletingTemplate}
      />
    </div>
  );
}

