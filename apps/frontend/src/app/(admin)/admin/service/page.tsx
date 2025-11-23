"use client";
import { ServiceFiltersSection } from "@/components/admin/service/service-filters";
import { ServiceTable } from "@/components/admin/service/service-table";

import { ModalServiceForm } from "@/components/admin/service/modal-create-service";
import { ModalServiceDetail } from "@/components/admin/service/modal-service-detail";
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
import {
  PaginatedQuery,
  PaginationMeta,
} from "@/interfaces/pagination/pagination.interface";
import {
  CreateServiceDto,
  UpdateServiceDto,
} from "@/interfaces/user/service.interface";
import { formatDate } from "@/lib/formatTimeDate";
import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useGetServicesPaginatedQuery,
  useUpdateServiceMutation,
} from "@/store/serviceApi";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ServicePage() {
  const [filters, setFilters] = useState<PaginatedQuery>({
    page: 1,
    limit: 5,
    search: "",
    searchField: "serviceName",
    sortBy: "createdAt",
    order: "desc",
  });

  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 5,
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

  // RTK Query hooks
  const { data, isLoading, isFetching } = useGetServicesPaginatedQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    searchField: filters.searchField,
    sortBy: filters.sortBy,
    order: filters.order,
  });

  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  useEffect(() => {
    if (data) {
      setPaginationMeta({
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 5,
        totalPages: data.totalPages || 0,
        hasNextPage: data.hasNextPage || false,
        hasPreviousPage: data.hasPreviousPage || false,
      });
    }
  }, [data]);

  // View Details Handler
  const handleViewDetails = (id: string) => {
    setSelectedServiceId(id);
    setDetailModalOpen(true);
  };

  // Add New Service Handler
  const handleAddService = () => {
    setEditMode(false);
    setSelectedServiceId("");
    setFormModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditMode(true);
    setSelectedServiceId(id);
    setFormModalOpen(true);
  };


  // Delete Service Handler
  const handleDelete = (id: string) => {
    setSelectedServiceId(id);
    setDeleteDialogOpen(true);
  };


  const handleConfirmDelete = async () => {
    try {
      await deleteService(selectedServiceId).unwrap();
      toast.success("Service deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedServiceId("");
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
      limit: 5,
      search: "",
      searchField: "serviceName",
      sortBy: "createdAt",
      order: "desc",
    });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Service Management
            </h1>
            <div className="bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-500">
                Today:{" "}
                <span className="font-medium text-gray-700">
                  {formatDate(new Date())}
                </span>
              </div>
              <Button onClick={handleAddService}>
                <Plus className="h-4 w-4 mr-2" /> Add Service
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ServiceFiltersSection
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />

        {/* Table */}
        <ServiceTable
          serviceItems={data?.data || []}
          onViewDetails={handleViewDetails}
          pagination={paginationMeta}
          onPageChange={handlePageChange}
          isFetching={isFetching}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

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
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                service from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedServiceId("");
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
    </div>
  );
}
