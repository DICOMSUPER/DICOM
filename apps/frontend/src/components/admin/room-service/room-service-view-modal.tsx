'use client';

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
import { Skeleton } from '@/components/ui/skeleton';
import { ServiceRoom } from '@/interfaces/user/service-room.interface';
import {
  Link2,
  Building2,
  Stethoscope,
  Calendar,
} from 'lucide-react';
import { formatStatus, modalStyles, getStatusBadgeColor } from '@/utils/format-status';

interface RoomServiceViewModalProps {
  roomService: ServiceRoom | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (roomService: ServiceRoom) => void;
}

export function RoomServiceViewModal({ roomService, isOpen, onClose, onEdit }: RoomServiceViewModalProps) {

  const formatDateTime = (dateValue?: string | Date | null) => {
    if (!dateValue) return '—';
    const date = typeof dateValue === 'string' || dateValue instanceof Date ? new Date(dateValue) : null;
    if (!date || Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden bg-slate-50">
        <DialogHeader className={modalStyles.dialogHeader}>
          <DialogTitle className={modalStyles.dialogTitle}>Room Service Assignment Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6 py-4">
          {!roomService ? (
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
                      <Link2 className="h-3.5 w-3.5 inline mr-1" />
                      Assignment ID: {roomService.id}
                    </div>
                    <div>
                      <p className={modalStyles.heroTitle}>
                        {roomService.service?.serviceName || 'Unknown Service'}
                      </p>
                      <div className="mt-3 space-y-2">
                        <p className={modalStyles.heroSubtitle}>
                          <Building2 className="h-4 w-4 text-teal-600" />
                          Room: {roomService.room?.roomCode || 'N/A'} ({roomService.room?.roomType || 'N/A'})
                        </p>
                        <p className={modalStyles.heroSubtitle}>
                          <Stethoscope className="h-4 w-4 text-teal-600" />
                          Service: {roomService.service?.serviceCode || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={`${modalStyles.badge[getStatusBadgeColor(roomService.isActive)]} px-3 py-1 text-xs font-medium border flex items-center gap-1.5`}>
                      <div className={`w-2 h-2 rounded-full ${roomService.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      {roomService.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </section>

              {/* Room Information */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Building2 className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>Room Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>Room Code</div>
                    <p className={modalStyles.infoCardLarge}>{roomService.room?.roomCode || '—'}</p>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>Room Type</div>
                    <p className={modalStyles.infoCardValue}>{formatStatus(roomService.room?.roomType) || '—'}</p>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>Department</div>
                    <p className={modalStyles.infoCardValue}>
                      {roomService.room?.department?.departmentName || '—'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Service Information */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Stethoscope className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>Service Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>Service Code</div>
                    <p className={modalStyles.infoCardLarge}>{roomService.service?.serviceCode || '—'}</p>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>Service Name</div>
                    <p className={modalStyles.infoCardValue}>{roomService.service?.serviceName || '—'}</p>
                  </div>
                </div>
                {roomService.service?.description && (
                  <div className={`${modalStyles.infoCard} mt-4`}>
                    <div className={modalStyles.infoCardLabel}>Description</div>
                    <p className={modalStyles.infoCardValue}>{roomService.service.description}</p>
                  </div>
                )}
              </section>

              {/* Notes */}
              {roomService.notes && (
                <section className={modalStyles.section}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <Link2 className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Notes</h3>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <p className={modalStyles.infoCardValue}>{roomService.notes}</p>
                  </div>
                </section>
              )}

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
                      {formatDateTime(roomService.createdAt)}
                    </p>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>Updated At</div>
                    <p className={modalStyles.infoCardValue}>
                      {formatDateTime(roomService.updatedAt)}
                    </p>
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
          {onEdit && roomService && (
            <Button onClick={() => onEdit(roomService)} className={modalStyles.primaryButton}>
              Edit Assignment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

