"use client";
import { ServiceFiltersSection } from "@/components/admin/service/service-filters";
import { ServiceTable } from "@/components/admin/service/service-table";
import { ServiceStatsCards } from "@/components/admin/service/service-stats-cards";
import { ModalServiceForm } from "@/components/admin/service/modal-create-service";
import { ModalServiceDetail } from "@/components/admin/service/modal-service-detail";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/ui/refresh-button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Pagination } from "@/components/common/PaginationV1";
import {
  PaginatedQuery,
  PaginationMeta,
} from "@/common/interfaces/pagination/pagination.interface";
import {
  CreateServiceDto,
  UpdateServiceDto,
  Services,
} from "@/common/interfaces/user/service.interface";
import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useGetServicesPaginatedQuery,
  useGetServiceStatsQuery,
  useUpdateServiceMutation,
} from "@/store/serviceApi";
import { Plus } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getBooleanStatusBadge } from "@/common/utils/status-badge";
import { SortConfig } from '@/components/ui/data-table';
import { sortConfigToQueryParams } from '@/common/utils/sort-utils';

export default function ServicePage() {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'createdAt',
    direction: 'desc'
  });

  const [filters, setFilters] = useState<PaginatedQuery & { includeInactive?: boolean; includeDeleted?: boolean }>({
    page: 1,
    limit: 10,
    search: "",
    searchField: "serviceName",
    includeInactive: true,
    includeDeleted: false,
  });

  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);


  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Build query params with sort
  const queryParams = useMemo(() => {
    const params: any = {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      searchField: filters.searchField,
      includeInactive: filters.includeInactive,
      includeDeleted: filters.includeDeleted,
    };

    // Add sort parameters (supports n fields)
    const sortParams = sortConfigToQueryParams(sortConfig);
    Object.assign(params, sortParams);

    return params;
  }, [filters, sortConfig]);

  // RTK Query hooks
  const {
    data,
    isLoading,
    isFetching,
    error: servicesError,
    refetch: refetchServices,
  } = useGetServicesPaginatedQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const {
    data: serviceStatsData,
    isLoading: serviceStatsLoading,
    refetch: refetchServiceStats,
  } = useGetServiceStatsQuery();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (servicesError) {
      const error = servicesError as FetchBaseQueryError;
      const errorMessage =
        error?.data &&
          typeof error.data === 'object' &&
          'message' in error.data
          ? (error.data as { message: string }).message
          : 'Failed to load service data. Please try again.';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [servicesError]);

  useEffect(() => {
    if (data) {
      setPaginationMeta({
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10,
        totalPages: data.totalPages || 0,
        hasNextPage: data.hasNextPage || false,
        hasPreviousPage: data.hasPreviousPage || false,
      });
    }
  }, [data]);

  const services = data?.data || [];

  const stats = useMemo(() => {
    const total = serviceStatsData?.totalServices ?? 0;
    const active = serviceStatsData?.activeServices ?? 0;
    const inactive = serviceStatsData?.inactiveServices ?? 0;
    return { total, active, inactive };
  }, [serviceStatsData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchServices(), refetchServiceStats()]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // View Details Handler
  const handleViewDetails = (service: Services) => {
    setSelectedServiceId(service.id);
    setDetailModalOpen(true);
  };

  // Add New Service Handler
  const handleAddService = () => {
    setEditMode(false);
    setSelectedServiceId("");
    setFormModalOpen(true);
  };

  const handleEdit = (service: Services) => {
    setEditMode(true);
    setSelectedServiceId(service.id);
    setFormModalOpen(true);
  };


  // Delete Service Handler
  const handleDelete = (service: Services) => {
    setSelectedServiceId(service.id);
    setDeleteDialogOpen(true);
  };


  const handleConfirmDelete = async () => {
    try {
      await deleteService(selectedServiceId).unwrap();
      toast.success("Service deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedServiceId("");
      await refetchServices();
    } catch (error) {
      console.error("Failed to delete service:", error);
      const apiError = error as { data?: { message?: string }; message?: string };
      toast.error(apiError?.data?.message || apiError?.message || "Failed to delete service");
    }
  };

  // Form Submit Handler
  const handleFormSubmit = async (
    data: CreateServiceDto | UpdateServiceDto
  ) => {
    try {
      if (editMode && selectedServiceId) {
        await updateService({
          id: selectedServiceId,
          updateServiceDto: data as UpdateServiceDto,
        }).unwrap();
        toast.success("Service updated successfully");
      } else {
        await createService(data as CreateServiceDto).unwrap();
        toast.success("Service created successfully");
      }
      setFormModalOpen(false);
      setSelectedServiceId("");
      setEditMode(false);
      await refetchServices();
    } catch (error) {
      console.error("Failed to save service:", error);
      const apiError = error as { data?: { message?: string }; message?: string };
      toast.error(apiError?.data?.message || apiError?.message || "Failed to save service");
    }
  };

  // Filters Handler
  const handleFiltersChange = (newFilters: Partial<PaginatedQuery>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page on filter change
    }));
  };

  // Pagination Handlers
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Reset Filters
  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      searchField: "serviceName",
    });
    setSortConfig({ field: 'createdAt', direction: 'desc' });
  };

  const handleSort = useCallback((newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    setFilters((prev) => ({ ...prev, page: 1 })); // Reset to first page when sorting changes
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Management</h1>
          <p className="text-foreground">Search and manage service records</p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton
            onRefresh={handleRefresh}
            loading={isRefreshing}
          />
          <Button
            onClick={handleAddService}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            Add New Service
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert title="Failed to load services" message={error} className="mb-4" />
      )}

      <ServiceStatsCards
        totalCount={stats.total}
        activeCount={stats.active}
        inactiveCount={stats.inactive}
        isLoading={serviceStatsLoading}
      />

      <ServiceFiltersSection
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
        onSearch={() => {
          setFilters((prev) => ({ ...prev, page: 1 }));
        }}
        isSearching={isLoading || isFetching}
      />

      <ServiceTable
        onSort={handleSort}
        initialSort={sortConfig.field ? sortConfig : undefined}
        serviceItems={services}
        getStatusBadge={getBooleanStatusBadge}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        page={filters.page}
        limit={filters.limit}
        total={paginationMeta?.total}
      />

      {paginationMeta && (
        <Pagination
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}

      {/* View Details Modal */}
      <ModalServiceDetail
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedServiceId("");
        }}
        serviceId={selectedServiceId}
      />

      {/* Add/Edit Form Modal */}
      <ModalServiceForm
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedServiceId("");
          setEditMode(false);
        }}
        onSubmit={handleFormSubmit}
        serviceId={editMode ? selectedServiceId : undefined}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationModal
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedServiceId("");
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Service"
        description={
          <>
            Are you sure you want to delete service <strong>{services.find(s => s.id === selectedServiceId)?.serviceName || 'this service'}</strong>? This action
            cannot be undone and will permanently remove this service from the system.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Toggle Active Status Confirmation Dialog */}
      {/* <AlertDialog
          open={toggleActiveDialogOpen}
          onOpenChange={setToggleActiveDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
              <AlertDialogDescription>
                {data?.data.find((s) => s.id === selectedServiceId)?.isActive
                  ? "Are you sure you want to deactivate this service? It will no longer be available for use."
                  : "Are you sure you want to activate this service? It will become available for use."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setToggleActiveDialogOpen(false);
                  setSelectedServiceId("");
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmToggleActive}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog> */}

    </div>
  );
}
