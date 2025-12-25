'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  useGetReportTemplatesPaginatedQuery,
  useDeleteReportTemplateMutation,
} from '@/store/reportTemplateApi';
import { ReportTemplateTable } from '@/components/radiologist/report-template/ReportTemplateTable';
import { ReportTemplateFilters } from '@/components/radiologist/report-template/report-template-filters';
import { ReportTemplateViewModal } from '@/components/radiologist/report-template/report-template-view-modal';
import { ReportTemplateFormModal } from '@/components/radiologist/report-template/report-template-form-modal';
import { ReportTemplateDeleteModal } from '@/components/radiologist/report-template/report-template-delete-modal';
import { RefreshButton } from '@/components/ui/refresh-button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Pagination } from '@/components/common/PaginationV1';
import { ReportTemplate } from '@/common/interfaces/patient/report-template.interface';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SortConfig } from '@/components/ui/data-table';

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
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedTypeFilter, setAppliedTypeFilter] = useState('all');
  const [appliedVisibilityFilter, setAppliedVisibilityFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({});

  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
    };

    if (appliedSearchTerm.trim()) {
      params.search = appliedSearchTerm.trim();
      params.searchField = 'templateName';
    }

    if (appliedTypeFilter !== 'all') {
      params.templateType = appliedTypeFilter;
    }

    if (appliedVisibilityFilter !== 'all') {
      params.isPublic = appliedVisibilityFilter === 'public';
    }

    if (sortConfig.field) {
      params.sortField = sortConfig.field;
      params.order = sortConfig.direction || 'desc';
    }

    return params;
  }, [page, limit, appliedSearchTerm, appliedTypeFilter, appliedVisibilityFilter, sortConfig]);

  const {
    data: templatesData,
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates,
  } = useGetReportTemplatesPaginatedQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteTemplate, { isLoading: isDeletingTemplate }] = useDeleteReportTemplateMutation();

  useEffect(() => {
    if (templatesError) {
      const error = templatesError as FetchBaseQueryError;
      const errorMessage =
        error?.data &&
          typeof error.data === 'object' &&
          'message' in error.data
          ? (error.data as { message: string }).message
          : 'Failed to load template data. Please try again.';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [templatesError]);

  // Templates come filtered from backend
  const templates: ReportTemplate[] = templatesData?.data ?? [];

  const paginationMeta = templatesData && {
    total: templatesData.total,
    page: templatesData.page,
    limit: templatesData.limit,
    totalPages: templatesData.totalPages,
    hasNextPage: templatesData.hasNextPage,
    hasPreviousPage: templatesData.hasPreviousPage,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchTemplates();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setAppliedTypeFilter(typeFilter);
    setAppliedVisibilityFilter(visibilityFilter);
    setPage(1);
  }, [searchTerm, typeFilter, visibilityFilter]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setTypeFilter('all');
    setVisibilityFilter('all');
    setAppliedSearchTerm('');
    setAppliedTypeFilter('all');
    setAppliedVisibilityFilter('all');
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSort = useCallback((newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    setPage(1);
  }, []);

  const handleViewDetails = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsViewModalOpen(true);
  };

  const handleEditTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsFormModalOpen(true);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      await deleteTemplate(selectedTemplate.reportTemplatesId).unwrap();
      toast.success(`Template "${selectedTemplate.templateName}" deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedTemplate(null);
      await refetchTemplates();
    } catch (err) {
      const error = err as ApiError;
      toast.error(
        error?.data?.message || `Failed to delete template "${selectedTemplate.templateName}"`
      );
    }
  };

  const handleFormSuccess = () => {
    refetchTemplates();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Report Template Management</h1>
          <p className="text-foreground">Search and manage report templates</p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton onRefresh={handleRefresh} loading={isRefreshing} />
          <Button
            onClick={handleCreateTemplate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            Add New Template
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert title="Failed to load templates" message={error} className="mb-4" />
      )}

      <ReportTemplateFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        visibilityFilter={visibilityFilter}
        onVisibilityChange={setVisibilityFilter}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        isSearching={templatesLoading}
      />

      <ReportTemplateTable
        templates={templates}
        isLoading={templatesLoading}
        emptyStateIcon={<FileText className="h-12 w-12" />}
        emptyStateTitle="No templates found"
        emptyStateDescription="No templates match your search criteria. Try adjusting your filters or create a new template."
        onViewDetails={handleViewDetails}
        onEditTemplate={handleEditTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onSort={handleSort}
        initialSort={sortConfig.field ? sortConfig : undefined}
      />

      {paginationMeta && (
        <Pagination pagination={paginationMeta} onPageChange={handlePageChange} />
      )}

      <ReportTemplateViewModal
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

      <ReportTemplateFormModal
        template={selectedTemplate}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedTemplate(null);
        }}
        onSuccess={handleFormSuccess}
      />

      <ReportTemplateDeleteModal
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
