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
import { useGetModalityMachineByIdQuery } from "@/store/modalityMachineApi";
import { getRoomStatusBadge, getMachineStatusBadge } from "@/common/utils/status-badge";
import { formatDate } from "@/common/lib/formatTimeDate";
import { Monitor, Calendar, Building2 } from "lucide-react";
import { Room } from "@/common/interfaces/user/room.interface";
import { modalStyles } from "@/common/utils/format-status";
import { ModalityMachine } from "@/common/interfaces/image-dicom/modality-machine.interface";

interface ModalityMachineViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineId: string | null;
  onEdit?: (machineId: string) => void;
  rooms?: Room[];
}

export function ModalityMachineViewModal({
  isOpen,
  onClose,
  machineId,
  onEdit,
  rooms = [],
}: ModalityMachineViewModalProps) {
  const { data, isLoading } = useGetModalityMachineByIdQuery(machineId || '', {
    skip: !machineId || !isOpen,
  });

  const machine = data?.data?.data ?? data?.data as ModalityMachine | undefined;

  const assignedRoom = machine?.roomId 
    ? rooms.find((room) => room.id === machine.roomId)
    : undefined;

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[900px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden bg-slate-50">
        <DialogHeader className={modalStyles.dialogHeader}>
          <DialogTitle className={modalStyles.dialogTitle}>Modality Machine Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6 py-4">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : !machine ? (
            <div className="text-center py-12">
              <Monitor className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-sm text-slate-500 italic">Machine not found</p>
            </div>
          ) : (
          <div className="space-y-6">
            {/* Hero Section */}
            <section className={modalStyles.heroSection}>
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-3">
                  <div className={modalStyles.heroLabel}>
                    <Monitor className="h-3.5 w-3.5 inline mr-1" />
                    {machine.name || 'Unnamed Machine'}
                  </div>
                  <div>
                    <p className={modalStyles.heroTitle}>
                      {machine.name || '—'}
                    </p>
                    {machine.modality && (
                      <p className={modalStyles.heroSubtitle}>
                        <Monitor className="h-4 w-4 text-teal-600" />
                        {machine.modality.modalityName} ({machine.modality.modalityCode})
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {getMachineStatusBadge(machine.status)}
                </div>
              </div>
            </section>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={modalStyles.gridCard}>
                <div className={modalStyles.gridCardLabel}>
                  <Monitor className={modalStyles.gridCardIcon} />
                  Manufacturer
                </div>
                <p className={modalStyles.gridCardValue}>
                  {machine.manufacturer || '—'}
                </p>
              </div>

              <div className={modalStyles.gridCard}>
                <div className={modalStyles.gridCardLabel}>
                  <Monitor className={modalStyles.gridCardIcon} />
                  Model
                </div>
                <p className={modalStyles.gridCardValue}>
                  {machine.model || '—'}
                </p>
              </div>

              <div className={modalStyles.gridCard}>
                <div className={modalStyles.gridCardLabel}>
                  <Monitor className={modalStyles.gridCardIcon} />
                  Serial Number
                </div>
                <p className={modalStyles.gridCardValue}>
                  {machine.serialNumber || '—'}
                </p>
              </div>
            </div>

            {/* Assigned Room */}
            {assignedRoom && (
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Building2 className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>Assigned Room</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>Room Code</div>
                    <p className={modalStyles.infoCardLarge}>{assignedRoom.roomCode || '—'}</p>
                  </div>
                  {assignedRoom.roomType && (
                    <div className={modalStyles.infoCard}>
                      <div className={modalStyles.infoCardLabel}>Room Type</div>
                      <p className={modalStyles.infoCardValue}>{assignedRoom.roomType}</p>
                    </div>
                  )}
                  {assignedRoom.floor != null && (
                    <div className={modalStyles.infoCard}>
                      <div className={modalStyles.infoCardLabel}>Floor</div>
                      <p className={modalStyles.infoCardValue}>{assignedRoom.floor}</p>
                    </div>
                  )}
                  {assignedRoom.department && (
                    <div className={modalStyles.infoCard}>
                      <div className={modalStyles.infoCardLabel}>Department</div>
                      <p className={modalStyles.infoCardValue}>
                        {assignedRoom.department.departmentName || '—'}
                      </p>
                    </div>
                  )}
                  {assignedRoom.status && (
                    <div className={modalStyles.infoCard}>
                      <div className={modalStyles.infoCardLabel}>Status</div>
                      <div>{getRoomStatusBadge(assignedRoom.status)}</div>
                    </div>
                  )}
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
                    {machine.createdAt ? formatDate(machine.createdAt) : '—'}
                  </p>
                </div>
                <div className={modalStyles.infoCard}>
                  <div className={modalStyles.infoCardLabel}>Updated At</div>
                  <p className={modalStyles.infoCardValue}>
                    {machine.updatedAt ? formatDate(machine.updatedAt) : '—'}
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
          {onEdit && machine && (
            <Button onClick={() => onEdit(machine.id)} className={modalStyles.primaryButton}>
              Edit Machine
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

