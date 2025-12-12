"use client";

import { useMemo } from "react";
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
import { Room } from "@/interfaces/user/room.interface";
import { RoomStatus } from "@/enums/room.enum";
import {
  Check,
  X,
  Building2,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  DoorOpen,
  Monitor,
  Stethoscope,
  Loader2,
  Clock,
  Wifi,
  Phone,
  Tv,
  Wind,
  Accessibility,
  Heart,
  Bell,
} from "lucide-react";
import { useGetModalitiesInRoomQuery } from "@/store/modalityMachineApi";
import { extractApiData } from "@/utils/api";
import { ModalityMachine } from "@/interfaces/image-dicom/modality-machine.interface";
import { ServiceRoom } from "@/interfaces/user/service-room.interface";
import { formatStatus, modalStyles, getStatusBadgeColor } from "@/utils/format-status";

interface RoomViewModalProps {
  room: (Room & {
    staffForDay?: {
      id?: string;
      name: string;
      role?: string;
      scheduleStatus?: string;
    }[];
    selectedDate?: string;
  }) | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (room: Room) => void;
  onAssignService?: (room: Room) => void;
}

export function RoomViewModal({
  room,
  isOpen,
  onClose,
  onEdit,
  onAssignService,
}: RoomViewModalProps) {
  const roomId = room?.id ?? "";

  const { data: modalitiesData, isLoading: isLoadingModalities } =
    useGetModalitiesInRoomQuery(roomId, {
      skip: !roomId || !isOpen || !room,
      refetchOnMountOrArgChange: true,
    });

  const modalities = useMemo(() => {
    if (!modalitiesData) return [];
    return extractApiData<ModalityMachine>(modalitiesData);
  }, [modalitiesData]);

  const roomServices = useMemo(() => {
    if (!room?.serviceRooms) return [];
    return room.serviceRooms.filter((sr) => sr.isActive && sr.service);
  }, [room]);

  const staffForDay = room?.staffForDay || [];

  if (!room) return null;

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
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toUpperCase();
    let color: keyof typeof modalStyles.badge = 'slate';
    let dotColor: keyof typeof modalStyles.statusDot = 'slate';
    let animate = false;

    switch (statusLower) {
      case RoomStatus.AVAILABLE:
        color = 'green';
        dotColor = 'green';
        break;
      case RoomStatus.OCCUPIED:
        color = 'red';
        dotColor = 'red';
        break;
      case RoomStatus.MAINTENANCE:
        color = 'amber';
        dotColor = 'amber';
        animate = true;
        break;
      default:
        color = 'slate';
        dotColor = 'slate';
    }

    return (
      <Badge className={modalStyles.badge[color]}>
        <div className={animate ? modalStyles.statusDot.amber : `w-2 h-2 bg-${dotColor === 'green' ? 'green' : dotColor === 'red' ? 'red' : 'slate'}-500 rounded-full mr-2`} />
        {formatStatus(status)}
      </Badge>
    );
  };

  const getMachineStatusBadge = (status: string | boolean | undefined) => {
    const color = getStatusBadgeColor(status);
    return (
      <Badge className={modalStyles.badge[color]}>
        {formatStatus(String(status))}
      </Badge>
    );
  };

  const getActiveStatusBadge = (isActive: boolean) => {
    const color = getStatusBadgeColor(isActive);
    return (
      <Badge className={modalStyles.badge[color]}>
        <div className={isActive ? modalStyles.statusDot.green : modalStyles.statusDot.slate} />
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={modalStyles.dialogContent}>
        <DialogHeader className={modalStyles.dialogHeader}>
          <DialogTitle className={modalStyles.dialogTitle}>
            Room Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6 py-4">
          {!room ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Hero Section */}
              <section className={modalStyles.heroSection}>
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-3">
                    <div className={modalStyles.heroLabel}>
                      <DoorOpen className="h-3.5 w-3.5 inline mr-1" />
                      {room.roomCode}
                    </div>
                    <div>
                      <p className={modalStyles.heroTitle}>
                        {room.roomType || "N/A"}
                      </p>
                      <div className="mt-3 space-y-2">
                        <p className={modalStyles.heroSubtitle}>
                          <MapPin className="h-4 w-4 text-teal-600" />
                          Floor {room.floor !== undefined ? room.floor : "N/A"} • {room.department?.departmentName || "No Department"}
                        </p>
                        {room.capacity !== undefined && (
                          <p className={modalStyles.heroSubtitle}>
                            <Users className="h-4 w-4 text-teal-600" />
                            Capacity: {room.capacity} people
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(room.status)}
                    {room.pricePerDay !== undefined && room.pricePerDay !== null && (
                      <div className="bg-white/80 backdrop-blur rounded-lg px-4 py-2 border border-teal-100">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Price/Day</p>
                        <p className="text-lg font-bold text-slate-900 flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-teal-600" />
                          {typeof room.pricePerDay === "number"
                            ? room.pricePerDay.toLocaleString()
                            : Number(room.pricePerDay).toLocaleString()} ₫
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <Building2 className={modalStyles.gridCardIcon} />
                    Room Type
                  </div>
                  <p className={modalStyles.gridCardValue}>{room.roomType || "N/A"}</p>
                </div>

                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <MapPin className={modalStyles.gridCardIcon} />
                    Location
                  </div>
                  <p className={modalStyles.gridCardValue}>Floor {room.floor}</p>
                  <p className="text-xs text-slate-500">{room.department?.departmentName || "Unassigned"}</p>
                </div>

                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <Users className={modalStyles.gridCardIcon} />
                    Capacity
                  </div>
                  <p className={modalStyles.gridCardValue}>{room.capacity} people</p>
                </div>
              </div>

              {/* Staff for selected day */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Users className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>Staff for {room.selectedDate || "selected day"}</h3>
                </div>
                {staffForDay.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {staffForDay.map((staff) => (
                      <div key={staff.id || staff.name} className={modalStyles.infoCard}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{staff.name || "Unknown"}</p>
                            {staff.role && (
                              <p className="text-xs text-slate-500 mt-0.5">{formatStatus(staff.role)}</p>
                            )}
                          </div>
                          {staff.scheduleStatus && (
                            <Badge className={modalStyles.badge.slate}>
                              {formatStatus(staff.scheduleStatus)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic bg-slate-50 rounded-lg p-4">
                    No staff scheduled for this room on the selected date.
                  </p>
                )}
              </section>

              {/* Description */}
              {room.description && (
                <section className={modalStyles.section}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <Building2 className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Description</h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {room.description}
                  </p>
                </section>
              )}

              {/* Modality Machines */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Monitor className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>
                    Modality Machines {modalities.length > 0 && `(${modalities.length})`}
                  </h3>
                </div>
                {isLoadingModalities ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading modalities...</span>
                  </div>
                ) : modalities.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {modalities.map((machine: ModalityMachine) => {
                      const displayName = machine.name || machine.modality?.modalityName ||
                        `${machine.manufacturer || ""} ${machine.model || ""}`.trim() || "Unnamed Machine";

                      return (
                        <div key={machine.id} className={modalStyles.infoCard}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                              {machine.modality?.modalityName && machine.name && (
                                <p className="text-xs text-slate-500">Type: {machine.modality.modalityName}</p>
                              )}
                              {machine.model && <p className="text-xs text-slate-500">Model: {machine.model}</p>}
                              {machine.manufacturer && <p className="text-xs text-slate-500">Manufacturer: {machine.manufacturer}</p>}
                            </div>
                            {machine.status && getMachineStatusBadge(machine.status)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic bg-slate-50 rounded-lg p-4">
                    No modality machines available in this room
                  </p>
                )}
              </section>

              {/* Services */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Stethoscope className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>
                    Room Services {roomServices.length > 0 && `(${roomServices.length})`}
                  </h3>
                </div>
                {roomServices.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {roomServices.filter((sr: ServiceRoom) => sr.isActive && sr.service).map((sr: ServiceRoom) => (
                      <div key={sr.id} className={modalStyles.infoCard}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {sr.service?.serviceName || "Unknown Service"}
                            </p>
                            {sr.service?.serviceCode && (
                              <p className="text-xs text-slate-500">Code: {sr.service.serviceCode}</p>
                            )}
                            {sr.service?.description && (
                              <p className="text-xs text-slate-500 line-clamp-2 mt-1">{sr.service.description}</p>
                            )}
                          </div>
                          {getActiveStatusBadge(sr.isActive)}
                        </div>
                        {sr.notes && (
                          <div className="mt-2 pt-2 border-t border-slate-100">
                            <p className="text-xs text-slate-500">Notes: {sr.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic bg-slate-50 rounded-lg p-4">
                    No services available in this room
                  </p>
                )}
              </section>

              {/* Equipment & Amenities */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Building2 className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>Equipment & Amenities</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    { key: "hasTV", label: "TV", value: room.hasTV, icon: Tv },
                    { key: "hasAirConditioning", label: "Air Conditioning", value: room.hasAirConditioning, icon: Wind },
                    { key: "hasWiFi", label: "WiFi", value: room.hasWiFi, icon: Wifi },
                    { key: "hasTelephone", label: "Telephone", value: room.hasTelephone, icon: Phone },
                    { key: "hasAttachedBathroom", label: "Attached Bathroom", value: room.hasAttachedBathroom, icon: DoorOpen },
                    { key: "isWheelchairAccessible", label: "Wheelchair Accessible", value: room.isWheelchairAccessible, icon: Accessibility },
                    { key: "hasOxygenSupply", label: "Oxygen Supply", value: room.hasOxygenSupply, icon: Heart },
                    { key: "hasNurseCallButton", label: "Nurse Call", value: room.hasNurseCallButton, icon: Bell },
                  ].map(({ key, label, value }) => (
                    <div key={key} className={`${modalStyles.infoCard} flex items-center gap-3`}>
                      <div className={`p-2 rounded-lg ${value ? 'bg-green-100' : 'bg-slate-100'}`}>
                        {value ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{label}</p>
                        <p className={`text-xs ${value ? 'text-green-600' : 'text-slate-400'}`}>
                          {value ? "Available" : "Not Available"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Notes */}
              {room.notes && (
                <section className="bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-6 shadow-sm">
                  <div className={modalStyles.sectionHeader}>
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-amber-900">Notes</h3>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
                    {room.notes}
                  </p>
                </section>
              )}

              {/* Timestamps */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Clock className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>Timestamps</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Created At
                    </div>
                    <p className={modalStyles.infoCardValue}>{formatDateTime(room.createdAt)}</p>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Updated At
                    </div>
                    <p className={modalStyles.infoCardValue}>{formatDateTime(room.updatedAt)}</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className={modalStyles.dialogFooter}>
          <Button variant="outline" onClick={onClose} className={modalStyles.secondaryButton}>
            Close
          </Button>
          {onAssignService && room && (
            <Button onClick={() => onAssignService(room)} className={`${modalStyles.primaryButton} bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800`}>
              Assign Service
            </Button>
          )}
          {onEdit && room && (
            <Button onClick={() => onEdit(room)} className={modalStyles.primaryButton}>
              Edit Room
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
