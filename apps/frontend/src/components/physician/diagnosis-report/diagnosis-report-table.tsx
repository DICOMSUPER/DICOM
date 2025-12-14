"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, SortConfig } from "@/components/ui/data-table";
import {
  DiagnosisStatus,
  EncounterPriorityLevel
} from "@/common/enums/patient-workflow.enum";
import {
  DiagnosisReport
} from "@/common/interfaces/patient/patient-workflow.interface";
import { formatDateTime } from "@/common/utils/format-status";
import {
  CheckCircle2,
  Eye,
  User,
  Zap
} from "lucide-react";
import React from "react";

interface DiagnosisReportTableProps {
  reportItems: DiagnosisReport[];
  onViewDetails: (id: string) => void;
  isLoading: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  page?: number;
  limit?: number;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export function DiagnosisReportTable({
  reportItems,
  onViewDetails,
  isLoading,
  emptyStateIcon = <User className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No diagnosis reports found",
  emptyStateDescription = "No diagnosis reports match your search criteria. Try adjusting your filters or search terms.",
  page = 1,
  limit = 10,
  onSort,
  initialSort,
}: DiagnosisReportTableProps) {
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const capitalizeType = (type: string | undefined) => {
    if (!type) return '';
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getStatusBadge = (status: DiagnosisStatus) => {
    switch (status) {
      case DiagnosisStatus.APPROVED:
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700">Approved</span>
          </div>
        );
      case DiagnosisStatus.PENDING_APPROVAL:
        return (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Pending Approval
            </span>
          </div>
        );
      case DiagnosisStatus.REJECTED:
        return (
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">
              Rejected
            </span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-400 rounded-full" />
            <span className="text-sm font-medium text-foreground">
              {capitalizeFirst(status || "Unknown")}
            </span>
          </div>
        );
    }
  };


  const columns = [
    {
      header: "ID",
      sortable: true,
      sortField: "id",
      cell: (report: DiagnosisReport) => (
        <div className="font-bold text-lg text-foreground text-center">
          {report.id.substring(0, 5)}
        </div>
      ),
    },
    {
      header: "Diagnosis Name",
      sortable: false,
      cell: (report: DiagnosisReport) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {report.diagnosisName}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Patient",
      sortable: false,
      cell: (report: DiagnosisReport) => {
        const encounter = report.encounter;
        const patient = encounter?.patient;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {patient?.firstName} {patient?.lastName}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Diagnosis Date",
      sortable: true,
      sortField: "diagnosisDate",
      cell: (report: DiagnosisReport) => (
        <div className="space-y-1">
          <span className="font-semibold text-foreground text-sm">
            {formatDateTime(report.diagnosisDate)}
          </span>
        </div>
      ),
    },
    {
      header: "Type",
      sortable: false,
      cell: (report: DiagnosisReport) => (
        <Badge
          variant="outline"
          className="bg-slate-100 text-slate-700 border-slate-200 font-medium"
        >
          {capitalizeType(report.diagnosisType)}
        </Badge>
      ),
    },
    {
      header: "Status",
      sortable: false,
      cell: (report: DiagnosisReport) => getStatusBadge(report.diagnosisStatus),
    },
    {
      header: "Created",
      sortable: true,
      sortField: "createdAt",
      cell: (report: DiagnosisReport) => (
        <div className="text-foreground text-sm">{formatDateTime(report.createdAt)}</div>
      ),
    },
    {
      header: "Updated",
      sortable: true,
      sortField: "updatedAt",
      cell: (report: DiagnosisReport) => (
        <div className="text-foreground text-sm">{formatDateTime(report.updatedAt)}</div>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-center",
      cell: (report: DiagnosisReport) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(report.id)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4 text-green-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<DiagnosisReport>
      columns={columns}
      data={reportItems}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(report) => report.id}
      page={page}
      limit={limit}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
}
