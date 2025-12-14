"use client";

import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  AlertCircle,
  FileText,
  Activity,
  Stethoscope,
  ClipboardList,
  MapPin,
  User,
} from "lucide-react";
import {
  formatDate,
  getEncounterTypeColor,
  getEncounterTypeLabel,
  getPriorityColor,
} from "@/utils/patient/[id]/color";
import { getEncounterStatusBadge } from "@/utils/status-badge";
import { formatStatus, modalStyles } from "@/utils/format-status";
import { useGetServiceRoomByIdQuery } from "@/store/serviceRoomApi";
import { useGetUserByIdQuery } from "@/store/userApi";

export default function EncounterModal({
  encounter,
  onClose,
}: {
  encounter: PatientEncounter | null;
  onClose: () => void;
}) {
  const { data: serviceRoomData, isLoading: isServiceRoomLoading } =
    useGetServiceRoomByIdQuery(encounter?.serviceRoomId as string, {
      skip: !encounter?.serviceRoomId,
    });

  const { data: physicianData, isLoading: isUserDataLoading } =
    useGetUserByIdQuery(encounter?.assignedPhysicianId as string, {
      skip: !encounter?.assignedPhysicianId,
    });

  const { data: receptionData, isLoading: isReceptionLoading } =
    useGetUserByIdQuery(encounter?.createdBy as string, {
      skip: !encounter?.createdBy,
    });

  if (!encounter) return null;

  const physician = physicianData?.data;
  const reception = receptionData?.data;
  const serviceRoom = serviceRoomData?.data?.data;

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

  const isLoading = isServiceRoomLoading || isUserDataLoading || isReceptionLoading;

  // Skeleton component for encounter modal
  function EncounterModalSkeleton() {
    return (
      <div className="space-y-8 pr-4 pb-2">
        {/* Hero Section Skeleton */}
        <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              <Skeleton className="h-6 w-32 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-9 w-64" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3"
              >
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            {/* Overview Skeleton */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            </section>

            {/* Clinical Details Skeleton */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </div>
            </section>

            {/* Additional Information Skeleton */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* Timestamps Skeleton */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl" />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={!!encounter} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden bg-slate-50">
        {/* Fixed Header */}
        <DialogHeader className={modalStyles.dialogHeader}>
          <div>
            <DialogTitle className={modalStyles.dialogTitle}>Encounter Details</DialogTitle>
            <p className="text-sm text-foreground mt-1">
              {encounter.orderNumber && `Order #${encounter.orderNumber}`}
              {encounter.orderNumber && encounter.encounterDate && " • "}
              {encounter.encounterDate && formatDate(encounter.encounterDate)}
            </p>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0 h-full px-6 py-4">
          {isLoading ? (
            <EncounterModalSkeleton />
          ) : (
            <div className="space-y-8 pr-4 pb-2">
              {/* Hero Section */}
              <section className={modalStyles.heroSection}>
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-4">
                    <div className={modalStyles.heroLabel}>
                      <FileText className="h-3.5 w-3.5" />
                      {encounter.orderNumber || encounter.id.slice(0, 8)}
                    </div>
                    <div>
                      <p className={modalStyles.heroTitle}>
                        {getEncounterTypeLabel(encounter.encounterType)}
                      </p>
                      <div className="mt-3 grid gap-2 text-sm text-foreground">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {encounter.encounterDate
                            ? formatDate(encounter.encounterDate)
                            : "No date set"}
                        </p>
                        {physician && (
                          <p className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Dr. {physician.firstName} {physician.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 text-right">
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {encounter.priority && (
                        <Badge className={`${getPriorityColor(encounter.priority)} px-4 py-1 text-xs font-semibold shadow-sm`}>
                          {formatStatus(encounter.priority)}
                        </Badge>
                      )}
                      {getEncounterStatusBadge(encounter.status)}
                      <Badge className={`${getEncounterTypeColor(encounter.encounterType)} px-4 py-1 text-xs font-semibold shadow-sm`}>
                        {getEncounterTypeLabel(encounter.encounterType)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground">Encounter Date</p>
                      <p className="text-lg font-semibold text-foreground">
                        {encounter.encounterDate
                          ? formatDate(encounter.encounterDate)
                          : "Not set"}
                      </p>
                      <p className="text-xs text-foreground">Visit date</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground">Physician</p>
                      <p className="text-lg font-semibold text-foreground">
                        {physician
                          ? `Dr. ${physician.firstName} ${physician.lastName}`
                          : "Not assigned"}
                      </p>
                      <p className="text-xs text-foreground">Assigned doctor</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground">Service Room</p>
                      <p className="text-lg font-semibold text-foreground">
                        {serviceRoom?.room?.roomCode || "Not assigned"}
                      </p>
                      <p className="text-xs text-foreground">
                        {serviceRoom?.service?.serviceName || "No service"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 space-y-6">
                  {/* Encounter Information */}
                  <section className={modalStyles.section}>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Calendar className="h-5 w-5" />
                      Encounter Overview
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className={modalStyles.infoCard}>
                        <div className={modalStyles.infoCardLabel}>
                          <FileText className="h-4 w-4" />
                          Encounter ID
                        </div>
                        <p className="font-semibold text-foreground font-mono text-xs break-all">
                          {encounter.id}
                        </p>
                      </div>
                      <div className={modalStyles.infoCard}>
                        <div className={modalStyles.infoCardLabel}>
                          <FileText className="h-4 w-4" />
                          Order Number
                        </div>
                        <p className={modalStyles.infoCardValue}>
                          {encounter.orderNumber || "N/A"}
                        </p>
                      </div>
                      <div className={modalStyles.infoCard}>
                        <div className={modalStyles.infoCardLabel}>
                          <User className="h-4 w-4" />
                          Created By
                        </div>
                        <p className={modalStyles.infoCardValue}>
                          {reception
                            ? `${reception.firstName} ${reception.lastName}`
                            : encounter.createdBy || "N/A"}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Clinical Details */}
                  {(encounter.chiefComplaint || encounter.symptoms || encounter.vitalSigns) && (
                    <section className={modalStyles.section}>
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <Stethoscope className="h-5 w-5" />
                        Clinical Details
                      </div>
                      <div className="space-y-4">
                        {encounter.chiefComplaint && (
                          <div className={modalStyles.infoCard}>
                            <div className={modalStyles.infoCardLabel}>
                              <AlertCircle className="h-4 w-4" />
                              Chief Complaint
                            </div>
                            <p className={modalStyles.infoCardValue}>
                              {encounter.chiefComplaint}
                            </p>
                          </div>
                        )}

                        {encounter.symptoms && (
                          <div className={modalStyles.infoCard}>
                            <div className={modalStyles.infoCardLabel}>
                              <ClipboardList className="h-4 w-4" />
                              Symptoms
                            </div>
                            <p className={modalStyles.infoCardValue}>
                              {encounter.symptoms}
                            </p>
                          </div>
                        )}

                        {encounter.vitalSigns && (
                          <div className={modalStyles.infoCard}>
                            <div className={modalStyles.infoCardLabel}>
                              <Activity className="h-4 w-4" />
                              Vital Signs
                            </div>
                            <div className="text-base text-foreground space-y-1">
                              {Object.entries(encounter.vitalSigns).map(([key, value]) => (
                                <p key={key} className="capitalize">
                                  <span className="font-semibold">
                                    {key.replace(/([A-Z])/g, " $1").trim()}:
                                  </span>{" "}
                                  {value !== null && value !== undefined
                                    ? String(value)
                                    : "N/A"}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Additional Information */}
                  <section className={modalStyles.section}>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <FileText className="h-5 w-5" />
                      Additional Information
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className={modalStyles.infoCard}>
                        <p className={modalStyles.infoCardLabel}>Assigned Physician</p>
                        <p className={modalStyles.infoCardValue}>
                          {physician
                            ? `Dr. ${physician.firstName} ${physician.lastName}`
                            : encounter.assignedPhysicianId || "Not assigned"}
                        </p>
                      </div>
                      <div className={modalStyles.infoCard}>
                        <div className={modalStyles.infoCardLabel}>
                          <MapPin className="h-4 w-4" />
                          Service
                        </div>
                        <p className={modalStyles.infoCardValue}>
                          {serviceRoom?.service?.serviceName || "Not assigned"}
                        </p>
                      </div>
                      <div className={modalStyles.infoCard}>
                        <div className={modalStyles.infoCardLabel}>
                          <MapPin className="h-4 w-4" />
                          Room
                        </div>
                        <p className={modalStyles.infoCardValue}>
                          {serviceRoom?.room?.roomCode || "Not assigned"}
                        </p>
                      </div>
                    </div>

                    {encounter.notes && (
                      <div className={modalStyles.infoCard}>
                        <p className={modalStyles.infoCardLabel}>Notes</p>
                        <p className={`${modalStyles.infoCardValue} whitespace-pre-wrap`}>
                          {encounter.notes}
                        </p>
                      </div>
                    )}
                  </section>
                </div>

                <div className="space-y-6">
                  {/* Timestamps */}
                  <section className={modalStyles.section}>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Clock className="h-5 w-5" />
                      Timestamps
                    </div>
                    <div className="space-y-3">
                      <div className={modalStyles.infoCard}>
                        <p className={modalStyles.infoCardLabel}>Created At</p>
                        <p className={modalStyles.infoCardValue}>
                          {formatDateTime(encounter.createdAt)}
                        </p>
                      </div>
                      <div className={modalStyles.infoCard}>
                        <p className={modalStyles.infoCardLabel}>Updated At</p>
                        <p className={modalStyles.infoCardValue}>
                          {formatDateTime(encounter.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Fixed Footer */}
        <DialogFooter className={modalStyles.dialogFooter}>
          <Button variant="outline" onClick={onClose} className={modalStyles.secondaryButton}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
