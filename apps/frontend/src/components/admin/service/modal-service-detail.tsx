"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetServiceByIdQuery } from "@/store/serviceApi";
import { useGetRoomsByServiceQuery } from "@/store/serviceRoomApi";
import { getBooleanStatusBadge, getRoomStatusBadge } from "@/utils/status-badge";
import { extractApiData } from "@/utils/api";
import { ServiceRoom } from "@/interfaces/user/service-room.interface";
import { DataTable } from "@/components/ui/data-table";
import {
  Cog,
  Calendar,
  Building2,
  Stethoscope,
  Loader2,
} from "lucide-react";

interface ModalServiceDetailProps {
  open: boolean;
  onClose: () => void;
  serviceId: string;
}

export function ModalServiceDetail({
  open,
  onClose,
  serviceId,
}: ModalServiceDetailProps) {
  const { data, isLoading } = useGetServiceByIdQuery(serviceId, {
    skip: !serviceId || !open,
  });

  const {
    data: roomServicesData,
    isLoading: isLoadingRooms,
    error: roomServicesError,
    isFetching: isFetchingRooms,
  } = useGetRoomsByServiceQuery(serviceId, {
    skip: !serviceId || !open,
    refetchOnMountOrArgChange: true,
  });

  const service = data?.data;
  const roomServices = extractApiData<ServiceRoom>(roomServicesData);
  const totalRooms = roomServices.length;

  const roomServiceColumns = [
    {
      header: 'Room Code',
      cell: (roomService: ServiceRoom) => (
        <div className="font-medium text-blue-600">
          {roomService?.room?.roomCode || "—"}
        </div>
      ),
    },
    {
      header: 'Room Type',
      cell: (roomService: ServiceRoom) => (
        <div className="text-foreground">
          {roomService?.room?.roomType || "—"}
        </div>
      ),
    },
    {
      header: 'Department',
      cell: (roomService: ServiceRoom) => (
        <div className="text-foreground">
          {roomService?.room?.department?.departmentName || "—"}
        </div>
      ),
    },
    {
      header: 'Floor',
      cell: (roomService: ServiceRoom) => (
        <div className="text-foreground">
          {roomService?.room?.floor ?? "—"}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (roomService: ServiceRoom) => (
        roomService?.room?.status
          ? getRoomStatusBadge(roomService.room.status)
          : "—"
      ),
    },
    {
      header: 'Assignment Status',
      cell: (roomService: ServiceRoom) => (
        getBooleanStatusBadge(roomService?.isActive ?? false)
      ),
    },
  ];

  const formatDateTime = (dateValue?: string | Date | null) => {
    if (!dateValue) return "—";
    const date =
      typeof dateValue === "string" || dateValue instanceof Date
        ? new Date(dateValue)
        : null;
    if (!date || Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-rose-100 text-rose-700 border-rose-200";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">Service Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          {isLoading ? (
            <div className="space-y-8 pr-4 pb-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : service ? (
            <div className="space-y-8 pr-4 pb-2">
              <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                      <Cog className="h-3.5 w-3.5" />
                      {service.serviceCode || "N/A"}
                    </div>
                    <div>
                      <p className="text-3xl font-semibold text-foreground leading-tight">
                        {service.serviceName || "Unnamed Service"}
                      </p>
                      <div className="mt-3 grid gap-2 text-sm text-foreground">
                        {service.description ? (
                          <p className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            {service.description}
                          </p>
                        ) : (
                          <p className="flex items-center gap-2 text-foreground/60 italic">
                            <Stethoscope className="h-4 w-4" />
                            No description provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Cog className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground">Service Code</p>
                      <p className="text-lg font-semibold text-foreground">{service.serviceCode || "N/A"}</p>
                      <p className="text-xs text-foreground">Identifier</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground">Status</p>
                      <p className="text-lg font-semibold text-foreground">
                        {service.isActive ? "Active" : "Inactive"}
                      </p>
                      <p className="text-xs text-foreground">Current state</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground">Assigned Rooms</p>
                      <p className="text-lg font-semibold text-foreground">{totalRooms || "—"}</p>
                      <p className="text-xs text-foreground">Total assignments</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Cog className="h-5 w-5" />
                  Service Information
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Cog className="h-4 w-4" />
                      Service Code
                    </div>
                    <p className="text-base font-semibold text-foreground">{service.serviceCode || "—"}</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Stethoscope className="h-4 w-4" />
                      Service Name
                    </div>
                    <p className="text-base font-semibold text-foreground">{service.serviceName || "—"}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Stethoscope className="h-4 w-4" />
                    Description
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    {service.description || (
                      <span className="text-foreground/60 italic">No description provided</span>
                    )}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Building2 className="h-5 w-5 text-foreground" />
                    Assigned Rooms
                  </div>
                  <div className="text-sm text-foreground">
                    Total: <span className="font-semibold">{totalRooms || "—"}</span>
                  </div>
                </div>

                {roomServicesError ? (
                  <div className="text-center py-12 border border-red-200 rounded-lg bg-red-50">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-red-400" />
                    <p className="text-red-600 font-semibold">Failed to load assigned rooms</p>
                    <p className="text-sm text-red-500 mt-2">Please try again later</p>
                    {roomServicesError && 
                      typeof roomServicesError === 'object' && 
                      roomServicesError !== null && 
                      'message' in roomServicesError && (
                        <p className="text-xs text-red-400 mt-1">
                          {String((roomServicesError as { message?: string }).message || 'Unknown error')}
                        </p>
                      )}
                  </div>
                ) : (
                  <DataTable<ServiceRoom>
                    columns={roomServiceColumns}
                    data={roomServices}
                    isLoading={isLoadingRooms || isFetchingRooms}
                    emptyStateIcon={<Building2 className="h-12 w-12 text-foreground/30" />}
                    emptyStateTitle="No rooms assigned to this service"
                    emptyStateDescription="Assign rooms to this service to see them listed here"
                    rowKey={(roomService, index) => roomService?.id || `room-service-${index}`}
                    showNumberColumn={true}
                    page={1}
                    limit={roomServices.length}
                    className="border-0 shadow-none"
                  />
                )}
              </section>

              <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="h-5 w-5" />
                  Timestamps
                </div>
                <div className="space-y-3">
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <p className="text-sm text-foreground">Created At</p>
                      <p className="text-base font-semibold text-foreground">
                        {service.createdAt ? formatDateTime(service.createdAt) : "—"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <p className="text-sm text-foreground">Updated At</p>
                      <p className="text-base font-semibold text-foreground">
                        {service.updatedAt ? formatDateTime(service.updatedAt) : "—"}
                      </p>
                    </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="text-center py-8 text-foreground/70">
              <p>Service not found</p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}