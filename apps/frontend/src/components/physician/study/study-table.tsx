"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, SortConfig } from "@/components/ui/data-table";
import {
  Clock,
  Eye,
  User,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DicomStudy } from "@/common/interfaces/image-dicom/dicom-study.interface";
import { DicomStudyStatus } from "@/common/enums/image-dicom.enum";
import { formatStatus, formatDateTime } from "@/common/utils/format-status";

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
    const getStatusConfig = (status: DicomStudyStatus) => {
      switch (status) {
        case DicomStudyStatus.RESULT_PRINTED:
          return { dotColor: "bg-blue-500", textColor: "text-blue-700", animate: true };
        case DicomStudyStatus.PENDING_APPROVAL:
          return { dotColor: "bg-amber-500", textColor: "text-amber-700", animate: true };
        case DicomStudyStatus.APPROVED:
          return { dotColor: "bg-emerald-500", textColor: "text-emerald-700", animate: false };
        case DicomStudyStatus.TECHNICIAN_VERIFIED:
          return { dotColor: "bg-blue-500", textColor: "text-blue-700", animate: false };
        case DicomStudyStatus.REJECTED:
          return { dotColor: "bg-red-500", textColor: "text-red-700", animate: false };
        default:
          return { dotColor: "bg-slate-400", textColor: "text-slate-700", animate: false };
      }
    };

    const config = getStatusConfig(status);
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.dotColor} ${config.animate ? 'animate-pulse' : ''}`} />
        <span className={`text-sm font-medium ${config.textColor}`}>
          {formatStatus(status)}
        </span>
      </div>
    );
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
    // {
    //   header: "Study Date",
    //   headerClassName: "text-center",
    //   sortable: true,
    //   sortField: "studyDate",
    //   cell: (study: DicomStudy) => (
    //     <div className="space-y-2 ml-6">
    //       <span className="font-semibold text-foreground text-sm">
    //         {formatDateTime(study.studyDate, { showTime: false })}
    //       </span>
    //       <div className="flex items-center gap-2 text-xs text-foreground">
    //         <Clock className="w-3.5 h-3.5" />
    //         <span>{study.studyTime}</span>
    //       </div>
    //     </div>
    //   ),
    // },
    {
      header: "Created",
      sortable: true,
      sortField: "createdAt",
      cell: (study: DicomStudy) => (
        <div className="text-foreground text-sm">{formatDateTime(study.createdAt)}</div>
      ),
    },
    {
      header: "Updated",
      sortable: true,
      sortField: "updatedAt",
      cell: (study: DicomStudy) => (
        <div className="text-foreground text-sm">{formatDateTime(study.updatedAt)}</div>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-center",
      cell: (study: DicomStudy) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(study.id)}
              className="h-8 text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
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

