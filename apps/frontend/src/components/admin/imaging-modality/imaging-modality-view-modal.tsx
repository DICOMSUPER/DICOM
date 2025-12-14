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
import { formatDate } from "@/lib/formatTimeDate";
import { Scan, Calendar, Activity } from "lucide-react";
import { ModalityMachine } from "@/interfaces/image-dicom/modality-machine.interface";
import { formatStatus, modalStyles, getStatusBadgeColor } from "@/utils/format-status";

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

  const getStatusBadge = (isActive: boolean) => {
    const colorKey = getStatusBadgeColor(isActive);
    return (
      <Badge className={`${modalStyles.badge[colorKey]} px-3 py-1 text-xs font-medium border flex items-center gap-1.5`}>
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const getMachineStatusBadge = (status: string | undefined) => {
    const colorKey = getStatusBadgeColor(status);
    return (
      <Badge className={`${modalStyles.badge[colorKey]} text-xs font-medium border flex items-center gap-1.5`}>
        <div className={`w-1.5 h-1.5 rounded-full ${
          colorKey === 'green' ? 'bg-emerald-500' : 
          colorKey === 'amber' ? 'bg-amber-500 animate-pulse' : 
          'bg-slate-400'
        }`} />
        {formatStatus(status)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[70vw] max-w-[900px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden bg-slate-50">
          <DialogHeader className={modalStyles.dialogHeader}>
            <DialogTitle>
              <Skeleton className="h-6 w-48 rounded-xl" />
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
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
      <DialogContent className="w-[70vw] max-w-[900px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden bg-slate-50">
        <DialogHeader className={modalStyles.dialogHeader}>
          <DialogTitle className={modalStyles.dialogTitle}>
            Imaging Modality Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6 py-4">
          <div className="space-y-6">
            {/* Hero Section */}
            <section className={modalStyles.heroSection}>
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-3">
                  <div className={modalStyles.heroLabel}>
                    <Scan className="h-3.5 w-3.5 inline mr-1" />
                    {modality.modalityCode || "N/A"}
                  </div>
                  <div>
                    <p className={modalStyles.heroTitle}>
                      {modality.modalityName || "—"}
                    </p>
                    {modality.description && (
                      <p className={modalStyles.heroSubtitle}>
                        {modality.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {getStatusBadge(modality.isActive)}
                </div>
              </div>
            </section>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={modalStyles.gridCard}>
                <div className={modalStyles.gridCardLabel}>
                  <Scan className={modalStyles.gridCardIcon} />
                  Modality Code
                </div>
                <p className={modalStyles.gridCardValue}>
                  {modality.modalityCode || "—"}
                </p>
              </div>

              <div className={modalStyles.gridCard}>
                <div className={modalStyles.gridCardLabel}>
                  <Scan className={modalStyles.gridCardIcon} />
                  Modality Name
                </div>
                <p className={modalStyles.gridCardValue}>
                  {modality.modalityName || "—"}
                </p>
              </div>
            </div>

            {/* Description Section */}
            {modality.description && (
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Scan className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>Description</h3>
                </div>
                <div className={modalStyles.infoCard}>
                  <p className={modalStyles.infoCardValue}>{modality.description}</p>
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
                    {modality.createdAt ? formatDate(modality.createdAt) : "—"}
                  </p>
                </div>
                <div className={modalStyles.infoCard}>
                  <div className={modalStyles.infoCardLabel}>Updated At</div>
                  <p className={modalStyles.infoCardValue}>
                    {modality.updatedAt ? formatDate(modality.updatedAt) : "—"}
                  </p>
                </div>
              </div>
            </section>

            {/* Modality Machines */}
            <section className={modalStyles.section}>
              <div className={modalStyles.sectionHeader}>
                <div className={modalStyles.sectionIconContainer}>
                  <Activity className={modalStyles.sectionIcon} />
                </div>
                <h3 className={modalStyles.sectionTitle}>
                  Modality Machines {modalityMachines.length > 0 && `(${modalityMachines.length})`}
                </h3>
              </div>
              {modalityMachines.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {modalityMachines.map((machine: ModalityMachine) => {
                    const displayName =
                      machine.name ||
                      `${machine.manufacturer || ""} ${
                        machine.model || ""
                      }`.trim() ||
                      "Unnamed Machine";

                    return (
                      <div
                        key={machine.id}
                        className={modalStyles.infoCard}
                      >
                        <p className={modalStyles.infoCardLarge}>
                          {displayName}
                        </p>
                        {machine.model && (
                          <p className={modalStyles.infoCardValue}>
                            Model: {machine.model}
                          </p>
                        )}
                        {machine.manufacturer && (
                          <p className={modalStyles.infoCardValue}>
                            Manufacturer: {machine.manufacturer}
                          </p>
                        )}
                        {machine.serialNumber && (
                          <p className={modalStyles.infoCardValue}>
                            Serial: {machine.serialNumber}
                          </p>
                        )}
                        {machine.status && getMachineStatusBadge(machine.status)}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic bg-slate-50 rounded-lg p-4">
                  No modality machines assigned to this imaging modality
                </p>
              )}
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className={modalStyles.dialogFooter}>
          <Button variant="outline" onClick={onClose} className={modalStyles.secondaryButton}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(modalityId)} className={modalStyles.primaryButton}>
              Edit Modality
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
