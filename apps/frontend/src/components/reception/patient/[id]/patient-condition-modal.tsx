"use client";

import { PatientCondition } from "@/interfaces/patient/patient-condition.interface";
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
import {
  Calendar,
  AlertCircle,
  FileText,
  MapPin,
  Activity,
  CheckCircle,
  XCircle,
  Hash,
} from "lucide-react";
import {
  ClinicalStatus,
  ConditionVerificationStatus,
} from "@/enums/patient-workflow.enum";

export default function PatientConditionModal({
  condition,
  onClose,
}: {
  condition: PatientCondition | null;
  onClose: () => void;
}) {
  if (!condition) return null;

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

  const formatDate = (dateValue: Date | string) => {
    const date = new Date(dateValue);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusIcon = (status?: ClinicalStatus) => {
    switch (status) {
      case ClinicalStatus.ACTIVE:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case ClinicalStatus.INACTIVE:
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case ClinicalStatus.RESOLVED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadgeClass = (status?: ClinicalStatus) => {
    switch (status) {
      case ClinicalStatus.ACTIVE:
        return "bg-red-100 text-red-700 border-red-200";
      case ClinicalStatus.INACTIVE:
        return "bg-gray-100 text-gray-700 border-gray-200";
      case ClinicalStatus.RESOLVED:
        return "bg-green-100 text-green-700 border-green-200";
      case ClinicalStatus.RECURRENCE:
        return "bg-rose-100 text-rose-700 border-rose-200";
      case ClinicalStatus.REMISSION:
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  const getVerificationBadgeClass = (status?: ConditionVerificationStatus) => {
    switch (status) {
      case ConditionVerificationStatus.CONFIRMED:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case ConditionVerificationStatus.PROVISIONAL:
        return "bg-amber-100 text-amber-700 border-amber-200";
      case ConditionVerificationStatus.DIFFERENTIAL:
        return "bg-blue-100 text-blue-700 border-blue-200";
      case ConditionVerificationStatus.UNCONFIRMED:
        return "bg-gray-100 text-gray-700 border-gray-200";
      case ConditionVerificationStatus.REFUTED:
        return "bg-rose-100 text-rose-700 border-rose-200";
      case ConditionVerificationStatus.ENTERED_IN_ERROR:
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <Dialog open={!!condition} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <div>
            <DialogTitle className="text-xl font-semibold">
              Condition Details
            </DialogTitle>
            <p className="text-sm text-foreground mt-1">
              {condition.codeDisplay || condition.code}
              {condition.codeSystem && ` (${condition.codeSystem})`}
            </p>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          <div className="space-y-8 pr-4 pb-2">
            {/* Hero Section */}
            <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                    <Hash className="h-3.5 w-3.5" />
                    {condition.code}
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground leading-tight">
                      {condition.codeDisplay || condition.code}
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-foreground">
                      {condition.codeSystem && (
                        <p className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {condition.codeSystem}
                        </p>
                      )}
                      {condition.recordedDate && (
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Recorded: {formatDate(condition.recordedDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  {condition.clinicalStatus && (
                    <Badge
                      className={`${getStatusBadgeClass(
                        condition.clinicalStatus
                      )} px-4 py-1 text-xs font-semibold shadow-sm flex items-center gap-1.5`}
                    >
                      {getStatusIcon(condition.clinicalStatus)}
                      {formatStatus(condition.clinicalStatus)}
                    </Badge>
                  )}
                  {condition.verificationStatus && (
                    <Badge
                      className={`${getVerificationBadgeClass(
                        condition.verificationStatus
                      )} px-4 py-1 text-xs font-semibold shadow-sm`}
                    >
                      {formatStatus(condition.verificationStatus)}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {condition.severity && (
                  <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground">
                        Severity
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {condition.severity}
                      </p>
                      <p className="text-xs text-foreground">Condition level</p>
                    </div>
                  </div>
                )}
                {condition.stageSummary && (
                  <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground">
                        Stage
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {condition.stageSummary}
                      </p>
                      <p className="text-xs text-foreground">Stage summary</p>
                    </div>
                  </div>
                )}
                {condition.bodySite && (
                  <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground">
                        Body Site
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {condition.bodySite}
                      </p>
                      <p className="text-xs text-foreground">Affected area</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 space-y-6">
                {/* Condition Overview */}
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <AlertCircle className="h-5 w-5" />
                    Condition Overview
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Hash className="h-4 w-4" />
                        Code
                      </div>
                      <p className="text-base font-semibold text-foreground">
                        {condition.code}
                      </p>
                    </div>
                    {condition.codeSystem && (
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <FileText className="h-4 w-4" />
                          Code System
                        </div>
                        <p className="text-base font-semibold text-foreground">
                          {condition.codeSystem}
                        </p>
                      </div>
                    )}
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar className="h-4 w-4" />
                        Recorded Date
                      </div>
                      <p className="text-base font-semibold text-foreground">
                        {condition.recordedDate
                          ? formatDate(condition.recordedDate)
                          : "—"}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Clinical Details */}
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Activity className="h-5 w-5" />
                    Clinical Details
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {condition.severity && (
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Severity</p>
                        <p className="text-base font-semibold text-foreground">
                          {condition.severity}
                        </p>
                      </div>
                    )}
                    {condition.stageSummary && (
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Stage Summary</p>
                        <p className="text-base font-semibold text-foreground">
                          {condition.stageSummary}
                        </p>
                      </div>
                    )}
                    {condition.bodySite && (
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10 md:col-span-2">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <MapPin className="h-4 w-4" />
                          Body Site
                        </div>
                        <p className="text-base font-semibold text-foreground">
                          {condition.bodySite}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Notes */}
                {condition.notes && (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-3">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <FileText className="h-5 w-5" />
                      Notes
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-primary/10 p-4 rounded-2xl shadow-sm">
                      {condition.notes}
                    </p>
                  </section>
                )}
              </div>

              <div className="space-y-6">
                {/* Status Information */}
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <AlertCircle className="h-5 w-5" />
                    Status
                  </div>
                  <div className="space-y-3">
                    {condition.clinicalStatus && (
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Clinical Status</p>
                        <Badge
                          className={`${getStatusBadgeClass(
                            condition.clinicalStatus
                          )} px-3 py-1 text-xs font-semibold shadow-sm border`}
                        >
                          {formatStatus(condition.clinicalStatus)}
                        </Badge>
                      </div>
                    )}
                    {condition.verificationStatus && (
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">
                          Verification Status
                        </p>
                        <Badge
                          className={`${getVerificationBadgeClass(
                            condition.verificationStatus
                          )} px-3 py-1 text-xs font-semibold shadow-sm border`}
                        >
                          {formatStatus(condition.verificationStatus)}
                        </Badge>
                      </div>
                    )}
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
                        {formatDateTime(condition.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <p className="text-sm text-foreground">Updated At</p>
                      <p className="text-base font-semibold text-foreground">
                        {formatDateTime(condition.updatedAt)}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

