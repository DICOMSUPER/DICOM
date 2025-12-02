"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, SortConfig } from "@/components/ui/data-table";
import {
  CheckCircle2,
  Clock,
  Eye,
  User,
  Zap,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DicomStudy } from "@/interfaces/image-dicom/dicom-study.interface";
import { DicomStudyStatus } from "@/enums/image-dicom.enum";
import { formatDate } from "@/lib/formatTimeDate";

interface DicomStudyTableProps {
  dicomStudies: DicomStudy[];
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

export function DicomStudyTable({
  dicomStudies,
  onViewDetails,
  isLoading,
  emptyStateIcon = <User className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No studies found",
  emptyStateDescription = "No studies match your search criteria. Try adjusting your filters or search terms.",
  page = 1,
  limit = 10,
  onSort,
  initialSort,
}: DicomStudyTableProps) {
  const getStatusBadge = (status: DicomStudyStatus) => {
    switch (status) {
      case DicomStudyStatus.RESULT_PRINTED:
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-700">
              Result Printed
            </span>
          </div>
        );
      case DicomStudyStatus.PENDING_APPROVAL:
        return (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Pending Approval
            </span>
          </div>
        );
      case DicomStudyStatus.APPROVED:
        return (
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">Approved</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-400 rounded-full" />
            <span className="text-sm font-medium text-foreground">{status}</span>
          </div>
        );
    }
  };

  const columns = [
    {
      header: "Study Instance UID",
      sortable: false,
      cell: (study: DicomStudy) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {study.studyInstanceUid}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Name",
      sortable: false,
      cell: (study: DicomStudy) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {study.patient?.firstName} {study.patient?.lastName}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Modality Machine",
      sortable: false,
      cell: (study: DicomStudy) => {
        const modalityMachineName =
          study.modalityMachine?.name?.trim() || "—";
        const maxLength = 50;
        const truncated =
          modalityMachineName.length > maxLength
            ? `${modalityMachineName.substring(0, maxLength)}...`
            : modalityMachineName;

        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="bg-slate-100 text-slate-700 border-slate-200 font-medium max-w-xs cursor-help"
                >
                  {truncated}
                </Badge>
              </TooltipTrigger>
              {modalityMachineName.length > maxLength && (
                <TooltipContent
                  side="top"
                  align="start"
                  className="max-w-sm z-50 bg-slate-900 text-white border-slate-700"
                  sideOffset={5}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {modalityMachineName}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      header: "Status",
      sortable: false,
      cell: (study: DicomStudy) =>
        getStatusBadge(study.studyStatus as DicomStudyStatus),
    },
    {
      header: "Order ID",
      sortable: true,
      sortField: "imagingOrder.id",
      cell: (study: DicomStudy) => (
        <div className="text-base ml-6 text-foreground">
          {study.id.slice(-6).toUpperCase()}
        </div>
      ),
    },
    {
      header: "Study Date",
      headerClassName: "text-center",
      sortable: true,
      sortField: "studyDate",
      cell: (study: DicomStudy) => (
        <div className="space-y-2 ml-6">
          <span className="font-semibold text-foreground text-sm">
            {formatDate(study.studyDate)}
          </span>
          <div className="flex items-center gap-2 text-xs text-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{study.studyTime}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-center",
      cell: (study: DicomStudy) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(study.id)}
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
    <DataTable<DicomStudy>
      columns={columns}
      data={dicomStudies}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(study) => study.id}
      page={page}
      limit={limit}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
}

