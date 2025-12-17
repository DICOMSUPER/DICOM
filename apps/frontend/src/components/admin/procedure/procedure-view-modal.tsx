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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RequestProcedure } from "@/common/interfaces/image-dicom/request-procedure.interface";
import { Building, Calendar, Users, Activity } from "lucide-react";
import {
  formatStatus,
  modalStyles,
  getStatusBadgeColor,
} from "@/common/utils/format-status";

interface RequestProcedureViewModalProps {
  procedure: RequestProcedure | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (procedure: RequestProcedure) => void;
}

export function RequestProcedureViewModal({
  procedure,
  isOpen,
  onClose,
  onEdit,
}: RequestProcedureViewModalProps) {
  if (!procedure) return null;

  const getStatusBadge = (isActive: boolean) => {
    const colorKey = getStatusBadgeColor(isActive);
    return (
      <Badge
        className={`${modalStyles.badge[colorKey]} px-3 py-1 text-xs font-medium border flex items-center gap-1.5`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
          }`}
        />
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={modalStyles.dialogContent}>
        {/* Fixed Header */}
        <DialogHeader className={modalStyles.dialogHeader}>
          <DialogTitle className={modalStyles.dialogTitle}>
            Request Procedure Details
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0 h-full px-6 py-4">
          {!procedure ? (
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
                      <Building className="h-3.5 w-3.5 inline mr-1" />
                      {procedure.modality?.modalityName || "Procedure"}
                    </div>
                    <div>
                      <p className={modalStyles.heroTitle}>{procedure.name}</p>
                      <div className="mt-3 space-y-2">
                        <p className={modalStyles.heroSubtitle}>
                          <Users className="h-4 w-4 text-teal-600" />
                          {procedure.bodyPart?.name || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(procedure?.isActive as boolean)}
                  </div>
                </div>
              </section>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <Building className={modalStyles.gridCardIcon} />
                    Modality
                  </div>
                  <p className={modalStyles.gridCardValue}>
                    {procedure.modality?.modalityName || "—"}
                  </p>
                </div>

                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <Users className={modalStyles.gridCardIcon} />
                    Body Part
                  </div>
                  <p className={modalStyles.gridCardValue}>
                    {procedure.bodyPart?.name || "—"}
                  </p>
                </div>

                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <Activity className={modalStyles.gridCardIcon} />
                    Status
                  </div>
                  {getStatusBadge(procedure?.isActive as boolean)}
                </div>
              </div>

              {/* Description */}
              {procedure.description && (
                <section className={modalStyles.section}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <Building className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Description</h3>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <p className={modalStyles.infoCardValue}>
                      {procedure.description}
                    </p>
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
                      {formatDateTime(procedure.createdAt)}
                    </p>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>Updated At</div>
                    <p className={modalStyles.infoCardValue}>
                      {formatDateTime(procedure.updatedAt)}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </ScrollArea>

        {/* Fixed Footer */}
        <DialogFooter className={modalStyles.dialogFooter}>
          <Button
            variant="outline"
            onClick={onClose}
            className={modalStyles.secondaryButton}
          >
            Close
          </Button>
          {onEdit && procedure && (
            <Button
              onClick={() => onEdit(procedure)}
              className={modalStyles.primaryButton}
            >
              Edit Procedure
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
