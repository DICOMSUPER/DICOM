'use client';

import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Room } from '@/interfaces/user/room.interface';
import { RoomStatus } from '@/enums/room.enum';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { useGetModalitiesInRoomQuery } from '@/store/modalityMachineApi';
import { extractApiData } from '@/utils/api';
import { ModalityMachine } from '@/interfaces/image-dicom/modality-machine.interface';
import { ServiceRoom } from '@/interfaces/user/service-room.interface';

interface RoomViewModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (room: Room) => void;
}

export function RoomViewModal({ room, isOpen, onClose, onEdit }: RoomViewModalProps) {
  if (!room) return null;

  const roomId = room.id ?? '';

  const { data: modalitiesData, isLoading: isLoadingModalities } = useGetModalitiesInRoomQuery(
    roomId,
    { 
      skip: !roomId || !isOpen,
      refetchOnMountOrArgChange: true 
    }
  );

  const modalities = useMemo(() => {
    if (!modalitiesData) return [];
    return extractApiData<ModalityMachine>(modalitiesData);
  }, [modalitiesData]);

  const roomServices = useMemo(() => {
    if (!room?.serviceRooms) return [];
    return room.serviceRooms.filter((sr) => sr.isActive && sr.service);
  }, [room]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case RoomStatus.AVAILABLE:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case RoomStatus.OCCUPIED:
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case RoomStatus.MAINTENANCE:
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-muted text-foreground border-border';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case RoomStatus.AVAILABLE:
        return 'Available';
      case RoomStatus.OCCUPIED:
        return 'Occupied';
      case RoomStatus.MAINTENANCE:
        return 'Maintenance';
      default:
        return status || 'Unknown';
    }
  };

  const getStatusBadgeClass = (status: string | boolean | undefined, type: 'machine' | 'service' = 'service'): string => {
    if (type === 'service') {
      const isActive = status === true || status === 'true' || status === 'ACTIVE';
      return isActive 
        ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
        : 'bg-gray-100 text-gray-700 border-gray-200';
    }

    if (type === 'machine') {
      const statusStr = String(status || '').toUpperCase();
      if (statusStr === 'ACTIVE' || statusStr === 'AVAILABLE') {
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      } else if (statusStr === 'INACTIVE' || statusStr === 'UNAVAILABLE') {
        return 'bg-gray-100 text-gray-700 border-gray-200';
      } else if (statusStr === 'MAINTENANCE') {
        return 'bg-amber-100 text-amber-700 border-amber-200';
      }
      return 'bg-gray-100 text-gray-700 border-gray-200';
    }

    return 'bg-muted text-foreground border-border';
  };

  const getStatusLabelForBadge = (status: string | boolean | undefined, type: 'machine' | 'service' = 'service'): string => {
    if (type === 'service') {
      const isActive = status === true || status === 'true' || status === 'ACTIVE';
      return isActive ? 'Active' : 'Inactive';
    }

    if (type === 'machine') {
      const statusStr = String(status || 'Unknown').toLowerCase();
      return statusStr.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    return String(status || 'Unknown');
  };

  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return '—';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateValue?: string | Date | null) => {
    if (!dateValue) return '—';
    const date = typeof dateValue === 'string' || dateValue instanceof Date ? new Date(dateValue) : null;
    if (!date || Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">Room Details</DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          <div className="space-y-8 pr-4 pb-2">
            {/* Hero Section */}
            <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                    <DoorOpen className="h-3.5 w-3.5" />
                    {room.roomCode}
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground leading-tight">
                      {room.roomType}
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-foreground">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Floor {room.floor} • {room.department?.departmentName || 'No Department'}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Capacity: {room.capacity} people
                        {room.roomStats?.currentInProgress !== undefined && (
                          <span className="text-xs text-foreground ml-2">
                            ({room.roomStats.currentInProgress} currently assigned)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <Badge className={`${getStatusColor(room.status)} px-4 py-1 text-xs font-semibold shadow-sm`}>
                    {getStatusLabel(room.status)}
                  </Badge>
                  {room.pricePerDay && (
                    <div className="rounded-2xl bg-background/70 px-4 py-3 text-sm text-foreground shadow">
                      <p className="uppercase text-xs tracking-wide">Price per Day</p>
                      <p className="text-base font-semibold text-foreground flex items-center gap-1 justify-end">
                        <DollarSign className="h-4 w-4" />
                        {Number(room.pricePerDay).toLocaleString()} ₫
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground">Room Type</p>
                    <p className="text-lg font-semibold text-foreground">{room.roomType}</p>
                    <p className="text-xs text-foreground">Category</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground">Location</p>
                    <p className="text-lg font-semibold text-foreground">Floor {room.floor}</p>
                    <p className="text-xs text-foreground">{room.department?.departmentName || 'Unassigned'}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground">Capacity</p>
                    <p className="text-lg font-semibold text-foreground">{room.capacity} people</p>
                    <p className="text-xs text-foreground">Maximum occupancy</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Overview Section */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5" />
                Room Overview
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Building2 className="h-4 w-4" />
                    Room Code
                  </div>
                  <p className="text-base font-semibold text-foreground">{room.roomCode}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <MapPin className="h-4 w-4" />
                    Floor
                  </div>
                  <p className="text-base font-semibold text-foreground">{room.floor}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Building2 className="h-4 w-4" />
                    Department
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    {room.department?.departmentName || 'N/A'}
                  </p>
                </div>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 space-y-6">
                {/* Description */}
                {room.description && (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-3">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Building2 className="h-5 w-5" />
                      Description
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-primary/10 p-4 rounded-2xl shadow-sm">
                      {room.description}
                    </p>
                  </section>
                )}

                {/* Modality Machines */}
                {isLoadingModalities ? (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Monitor className="h-5 w-5" />
                      Modality Machines
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                      <span className="text-sm text-foreground">Loading modalities...</span>
                    </div>
                  </section>
                ) : modalities.length > 0 ? (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Monitor className="h-5 w-5" />
                      Modality Machines ({modalities.length})
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {modalities.map((machine: ModalityMachine) => {
                        const displayName = machine.name || 
                          machine.modality?.modalityName || 
                          `${machine.manufacturer || ''} ${machine.model || ''}`.trim() ||
                          "Unnamed Machine";
                        
                        return (
                          <div
                            key={machine.id}
                            className="rounded-xl bg-background/80 p-3 shadow-sm ring-1 ring-border/20 space-y-1"
                          >
                            <p className="text-sm font-semibold text-foreground">
                              {displayName}
                            </p>
                            {machine.modality?.modalityName && machine.name && (
                              <p className="text-xs text-foreground">Type: {machine.modality.modalityName}</p>
                            )}
                            {machine.model && (
                              <p className="text-xs text-foreground">Model: {machine.model}</p>
                            )}
                            {machine.manufacturer && (
                              <p className="text-xs text-foreground">Manufacturer: {machine.manufacturer}</p>
                            )}
                            {machine.status && (
                              <Badge
                                className={`${getStatusBadgeClass(machine.status, 'machine')} text-xs font-medium mt-1 border`}
                              >
                                {getStatusLabelForBadge(machine.status, 'machine')}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Monitor className="h-5 w-5" />
                      Modality Machines
                    </div>
                    <p className="text-sm text-foreground/70 italic">No modality machines available in this room</p>
                  </section>
                )}

                {/* Services */}
                {roomServices.length > 0 ? (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Stethoscope className="h-5 w-5" />
                      Room Services ({roomServices.length})
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {roomServices
                        .filter((sr: ServiceRoom) => sr.isActive && sr.service)
                        .map((sr: ServiceRoom) => (
                          <div
                            key={sr.id}
                            className="rounded-xl bg-background/80 p-3 shadow-sm ring-1 ring-border/20 space-y-1"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground">
                                  {sr.service?.serviceName || "Unknown Service"}
                                </p>
                                {sr.service?.serviceCode && (
                                  <p className="text-xs text-foreground/70 mt-0.5">
                                    Code: {sr.service.serviceCode}
                                  </p>
                                )}
                              </div>
                              <Badge className={`${getStatusBadgeClass(sr.isActive, 'service')} text-xs font-medium shrink-0 border`}>
                                {getStatusLabelForBadge(sr.isActive, 'service')}
                              </Badge>
                            </div>
                            {sr.service?.description && (
                              <p className="text-xs text-foreground/80 line-clamp-2 mt-1">
                                {sr.service.description}
                              </p>
                            )}
                            {sr.notes && (
                              <div className="mt-2 pt-2 border-t border-border/20">
                                <p className="text-xs font-medium text-foreground/70">Notes:</p>
                                <p className="text-xs text-foreground/80 mt-0.5">{sr.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </section>
                ) : (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Stethoscope className="h-5 w-5" />
                      Room Services
                    </div>
                    <p className="text-sm text-foreground/70 italic">No services available in this room</p>
                  </section>
                )}

                {/* Facilities */}
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Building2 className="h-5 w-5" />
                    Equipment & Amenities
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { key: 'hasTV', label: 'TV', value: room.hasTV },
                      { key: 'hasAirConditioning', label: 'Air Conditioning', value: room.hasAirConditioning },
                      { key: 'hasWiFi', label: 'WiFi', value: room.hasWiFi },
                      { key: 'hasTelephone', label: 'Telephone', value: room.hasTelephone },
                      { key: 'hasAttachedBathroom', label: 'Attached Bathroom', value: room.hasAttachedBathroom },
                      { key: 'isWheelchairAccessible', label: 'Wheelchair Accessible', value: room.isWheelchairAccessible },
                      { key: 'hasOxygenSupply', label: 'Oxygen Supply', value: room.hasOxygenSupply },
                      { key: 'hasNurseCallButton', label: 'Nurse Call Button', value: room.hasNurseCallButton },
                    ].map(({ key, label, value }) => (
                      <div
                        key={key}
                        className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10"
                      >
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          {value ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          {label}
                        </div>
                        <p className="text-base font-semibold text-foreground">
                          {value ? 'Available' : 'Not Available'}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Notes */}
                {room.notes && (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-3">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Building2 className="h-5 w-5" />
                      Notes
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-primary/10 p-4 rounded-2xl shadow-sm">
                      {room.notes}
                    </p>
                  </section>
                )}
              </div>

              <div className="space-y-6">
                {/* Additional Information */}
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Building2 className="h-5 w-5" />
                    Additional Info
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <p className="text-sm text-foreground">Active Status</p>
                      <p className="text-base font-semibold text-foreground">
                        {room.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Timestamps */}
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Calendar className="h-5 w-5" />
                    Timestamps
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <p className="text-sm text-foreground">Created At</p>
                      <p className="text-base font-semibold text-foreground">
                        {formatDateTime(room.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <p className="text-sm text-foreground">Updated At</p>
                      <p className="text-base font-semibold text-foreground">
                        {formatDateTime(room.updatedAt)}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button variant="default" onClick={() => onEdit(room)}>
              Edit Room
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
