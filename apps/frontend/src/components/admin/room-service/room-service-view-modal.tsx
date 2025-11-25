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
  Check,
  X,
} from 'lucide-react';

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
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">Room Service Assignment Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          {!roomService ? (
            <div className="space-y-8 pr-4 pb-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="space-y-8 pr-4 pb-2">
              <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                    <Link2 className="h-3.5 w-3.5" />
                    Assignment ID: {roomService.id}
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground leading-tight">
                      {roomService.service?.serviceName || 'Unknown Service'}
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-foreground">
                      <p className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Room: {roomService.room?.roomCode || 'N/A'} ({roomService.room?.roomType || 'N/A'})
                      </p>
                      <p className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Service: {roomService.service?.serviceCode || 'N/A'} - {roomService.service?.serviceName || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <Badge className={`${roomService.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'} px-4 py-1 text-xs font-semibold shadow-sm border`}>
                    {roomService.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </section>

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5" />
                Room Information
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Building2 className="h-4 w-4" />
                    Room Code
                  </div>
                  <p className="text-base font-semibold text-foreground">{roomService.room?.roomCode || '—'}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Building2 className="h-4 w-4" />
                    Room Type
                  </div>
                  <p className="text-base font-semibold text-foreground">{roomService.room?.roomType || '—'}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Building2 className="h-4 w-4" />
                    Department
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    {roomService.room?.department?.departmentName || '—'}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Stethoscope className="h-5 w-5" />
                Service Information
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Stethoscope className="h-4 w-4" />
                    Service Code
                  </div>
                  <p className="text-base font-semibold text-foreground">{roomService.service?.serviceCode || '—'}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Stethoscope className="h-4 w-4" />
                    Service Name
                  </div>
                  <p className="text-base font-semibold text-foreground">{roomService.service?.serviceName || '—'}</p>
                </div>
              </div>
              {roomService.service?.description && (
                <div className="mt-4 rounded-2xl bg-primary/10 p-4 shadow-sm ring-1 ring-border/10">
                  <p className="text-sm font-medium text-foreground mb-2">Description</p>
                  <p className="text-sm text-foreground leading-relaxed">{roomService.service.description}</p>
                </div>
              )}
            </section>

            {roomService.notes && (
              <section className="rounded-2xl p-6 shadow border-border border space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Link2 className="h-5 w-5" />
                  Notes
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-primary/10 p-4 rounded-2xl shadow-sm">
                  {roomService.notes}
                </p>
              </section>
            )}

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5" />
                Timestamps
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <p className="text-sm text-foreground">Created At</p>
                  <p className="text-base font-semibold text-foreground">
                    {formatDateTime(roomService.createdAt)}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <p className="text-sm text-foreground">Updated At</p>
                  <p className="text-base font-semibold text-foreground">
                    {formatDateTime(roomService.updatedAt)}
                  </p>
                </div>
              </div>
            </section>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && roomService && (
            <Button variant="default" onClick={() => onEdit(roomService)}>
              Edit Assignment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

