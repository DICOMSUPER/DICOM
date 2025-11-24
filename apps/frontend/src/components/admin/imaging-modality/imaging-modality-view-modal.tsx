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
import { useGetImagingModalityByIdQuery } from "@/store/imagingModalityApi";
import { getBooleanStatusBadge } from "@/utils/status-badge";
import { formatDate } from "@/lib/formatTimeDate";
import { Scan, Calendar, Activity } from "lucide-react";
import { ModalityMachine } from "@/interfaces/image-dicom/modality-machine.interface";

interface ImagingModalityViewModalProps {
  open: boolean;
  onClose: () => void;
  modalityId: string;
  onEdit?: (modalityId: string) => void;
}

export function ImagingModalityViewModal({
  open,
  onClose,
  modalityId,
  onEdit,
}: ImagingModalityViewModalProps) {
  const { data, isLoading } = useGetImagingModalityByIdQuery(modalityId, {
    skip: !modalityId || !open,
  });

  const modality = data?.data;

  const modalityMachines = modality?.modalityMachines || [];

  const getStatusBadgeClass = (status: string | undefined): string => {
    const statusStr = String(status || '').toUpperCase();
    if (statusStr === 'ACTIVE' || statusStr === 'AVAILABLE') {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    } else if (statusStr === 'INACTIVE' || statusStr === 'UNAVAILABLE') {
      return 'bg-gray-100 text-gray-700 border-gray-200';
    } else if (statusStr === 'MAINTENANCE') {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusLabelForBadge = (status: string | undefined): string => {
    const statusStr = String(status || 'Unknown').toLowerCase();
    return statusStr.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[70vw] max-w-[900px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
            <DialogTitle>
              <Skeleton className="h-6 w-48" />
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 py-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  if (!modality) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[900px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">Imaging Modality Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          <div className="space-y-4 pr-4 pb-2">
            <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                    <Scan className="h-3.5 w-3.5" />
                    {modality.modalityCode || 'N/A'}
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground leading-tight">
                      {modality.modalityName || '—'}
                    </p>
                    {modality.description && (
                      <p className="mt-3 text-sm text-foreground">
                        {modality.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  {getBooleanStatusBadge(modality.isActive)}
                </div>
              </div>
            </section>

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Scan className="h-5 w-5" />
                Basic Information
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Scan className="h-4 w-4" />
                    Modality Code
                  </div>
                  <p className="text-base font-semibold text-blue-600">{modality.modalityCode || '—'}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Scan className="h-4 w-4" />
                    Modality Name
                  </div>
                  <p className="text-base font-semibold text-foreground">{modality.modalityName || '—'}</p>
                </div>
                {modality.description && (
                  <div className="md:col-span-2 rounded-2xl bg-primary/10 p-4 shadow-sm ring-1 ring-border/10">
                    <p className="text-sm font-medium text-foreground mb-2">Description</p>
                    <p className="text-sm text-foreground leading-relaxed">{modality.description}</p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5" />
                Timestamps
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <p className="text-sm text-foreground">Created At</p>
                  <p className="text-base font-semibold text-foreground">
                    {modality.createdAt ? formatDate(modality.createdAt) : '—'}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <p className="text-sm text-foreground">Updated At</p>
                  <p className="text-base font-semibold text-foreground">
                    {modality.updatedAt ? formatDate(modality.updatedAt) : '—'}
                  </p>
                </div>
              </div>
            </section>

            {modalityMachines.length > 0 ? (
              <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Activity className="h-5 w-5" />
                  Modality Machines ({modalityMachines.length})
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {modalityMachines.map((machine: ModalityMachine) => {
                    const displayName = machine.name || 
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
                        {machine.model && (
                          <p className="text-xs text-foreground">Model: {machine.model}</p>
                        )}
                        {machine.manufacturer && (
                          <p className="text-xs text-foreground">Manufacturer: {machine.manufacturer}</p>
                        )}
                        {machine.serialNumber && (
                          <p className="text-xs text-foreground">Serial: {machine.serialNumber}</p>
                        )}
                        {machine.roomId && (
                          <p className="text-xs text-foreground">Room ID: {machine.roomId}</p>
                        )}
                        {machine.status && (
                          <Badge
                            className={`${getStatusBadgeClass(machine.status)} text-xs font-medium mt-1 border`}
                          >
                            {getStatusLabelForBadge(machine.status)}
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
                  <Activity className="h-5 w-5" />
                  Modality Machines
                </div>
                <p className="text-sm text-foreground/70 italic">No modality machines assigned to this imaging modality</p>
              </section>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button variant="default" onClick={() => onEdit(modalityId)}>
              Edit Modality
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

