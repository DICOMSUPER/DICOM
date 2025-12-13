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
import { extractApiData } from "@/utils/api";
import { ServiceRoom } from "@/interfaces/user/service-room.interface";
import { DataTable } from "@/components/ui/data-table";
import {
  Cog,
  Calendar,
  Building2,
  Stethoscope,
} from "lucide-react";
import { formatStatus, modalStyles, getStatusBadgeColor } from "@/utils/format-status";

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

  const getStatusBadge = (isActive: boolean) => {
    const colorKey = getStatusBadgeColor(isActive);
    return (
      <Badge className={`${modalStyles.badge[colorKey]} px-2 py-0.5 text-xs font-medium border flex items-center gap-1.5`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const getRoomStatusBadge = (status: string) => {
    const colorKey = getStatusBadgeColor(status);
    return (
      <Badge className={`${modalStyles.badge[colorKey]} px-2 py-0.5 text-xs font-medium border flex items-center gap-1.5`}>
        <div className={`w-1.5 h-1.5 rounded-full ${
          colorKey === 'green' ? 'bg-emerald-500' : 
          colorKey === 'amber' ? 'bg-amber-500 animate-pulse' : 
          colorKey === 'red' ? 'bg-red-500' :
          'bg-slate-400'
        }`} />
        {formatStatus(status)}
      </Badge>
    );
  };

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
          {formatStatus(roomService?.room?.roomType) || "—"}
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
        getStatusBadge(roomService?.isActive ?? false)
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden bg-slate-50">
        <DialogHeader className={modalStyles.dialogHeader}>
          <DialogTitle className={modalStyles.dialogTitle}>Service Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6 py-4">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : service ? (
            <div className="space-y-6">
              {/* Hero Section */}
              <section className={modalStyles.heroSection}>
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-3">
                    <div className={modalStyles.heroLabel}>
                      <Cog className="h-3.5 w-3.5 inline mr-1" />
                      {service.serviceCode || "N/A"}
                    </div>
                    <div>
                      <p className={modalStyles.heroTitle}>
                        {service.serviceName || "Unnamed Service"}
                      </p>
                      <div className="mt-3 space-y-2">
                        {service.description ? (
                          <p className={modalStyles.heroSubtitle}>
                            <Stethoscope className="h-4 w-4 text-teal-600" />
                            {service.description}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-500 italic flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            No description provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <Cog className={modalStyles.gridCardIcon} />
                    Service Code
                  </div>
                  <p className={modalStyles.gridCardValue}>
                    {service.serviceCode || "N/A"}
                  </p>
                </div>

                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <Stethoscope className={modalStyles.gridCardIcon} />
                    Status
                  </div>
                  <p className={modalStyles.gridCardValue}>
                    {service.isActive ? "Active" : "Inactive"}
                  </p>
                </div>

                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <Building2 className={modalStyles.gridCardIcon} />
                    Assigned Rooms
                  </div>
                  <p className={modalStyles.gridCardValue}>
                    {totalRooms || "—"}
                  </p>
                </div>
              </div>

              {/* Service Information */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Cog className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>Service Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>Service Code</div>
                    <p className={modalStyles.infoCardLarge}>{service.serviceCode || "—"}</p>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>Service Name</div>
                    <p className={modalStyles.infoCardValue}>{service.serviceName || "—"}</p>
                  </div>
                </div>
                <div className={`${modalStyles.infoCard} mt-4`}>
                  <div className={modalStyles.infoCardLabel}>Description</div>
                  <p className={modalStyles.infoCardValue}>
                    {service.description || (
                      <span className="text-slate-400 italic">No description provided</span>
                    )}
                  </p>
                </div>
              </section>

              {/* Assigned Rooms */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Building2 className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>
                    Assigned Rooms
                    {totalRooms ? <span className="ml-2 text-sm font-normal text-slate-500">({totalRooms})</span> : null}
                  </h3>
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

              {/* Timestamps */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Calendar className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>Timestamps</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>Created At</div>
                    <p className={modalStyles.infoCardValue}>
                      {service.createdAt ? formatDateTime(service.createdAt) : "—"}
                    </p>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>Updated At</div>
                    <p className={modalStyles.infoCardValue}>
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

        <DialogFooter className={modalStyles.dialogFooter}>
          <Button variant="outline" onClick={onClose} className={modalStyles.secondaryButton}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}