"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Activity } from "lucide-react";
import { AiAnalysis } from "@/common/interfaces/system/ai-analysis.interface";
import { DataTable } from "@/components/ui/data-table";
import { formatDateTime } from "@/common/utils/format-status";
import { SortConfig } from "@/components/ui/data-table";
import { AnalysisStatus } from "@/common/enums/image-dicom.enum";

interface AiAnalysisTableProps {
  aiAnalyses: AiAnalysis[];
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (aiAnalysis: AiAnalysis) => void;

  onDeleteAiAnalysis?: (aiAnalysis: AiAnalysis) => void;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export const AiAnalysisTable: React.FC<AiAnalysisTableProps> = ({
  aiAnalyses,
  isLoading = false,
  emptyStateIcon = <Activity className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No AI analyses found",
  emptyStateDescription = "Create an AI analysis to see it listed here.",
  onViewDetails,
  onDeleteAiAnalysis,
  onSort,
  initialSort,
}) => {
  const columns = [
    {
      header: "Study ID",
      sortable: true,
      sortField: "studyId",
      cell: (aiAnalysis: AiAnalysis) => (
        <div className="font-medium ">{aiAnalysis.studyId || "—"}</div>
      ),
    },
    {
      header: "Model Name",
      sortable: true,
      sortField: "modelName",
      cell: (aiAnalysis: AiAnalysis) => (
        <div className="font-medium ">{aiAnalysis.modelName || "—"}</div>
      ),
    },
    {
      header: "Model Version",
      sortable: true,
      sortField: "versionName",
      cell: (aiAnalysis: AiAnalysis) => (
        <div className="font-medium ">{aiAnalysis.versionName || "—"}</div>
      ),
    },
    {
      header: "Status",
      sortable: true,
      sortField: "analysisStatus",
      cell: (aiAnalysis: AiAnalysis) => {
        const status = aiAnalysis.analysisStatus;

        const getStatusConfig = (status?: AnalysisStatus) => {
          switch (status) {
            case AnalysisStatus.COMPLETED:
              return {
                variant: "default" as const,
                className:
                  "bg-green-500 hover:bg-green-600 text-white border-green-500",
                label: "Completed",
              };
            case AnalysisStatus.PENDING:
              return {
                variant: "secondary" as const,
                className:
                  "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500",
                label: "Pending",
              };
            case AnalysisStatus.FAILED:
              return {
                variant: "destructive" as const,
                className:
                  "bg-red-500 hover:bg-red-600 text-white border-red-500",
                label: "Failed",
              };
            default:
              return {
                variant: "outline" as const,
                className: "",
                label: status || "—",
              };
          }
        };
        const config = getStatusConfig(status);
        return (
          <Badge variant={config.variant} className={config.className}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      header: "Feedback",
      sortable: true,
      sortField: "isHelpful",
      cell: (aiAnalysis: AiAnalysis) => {
        const isHelpful = aiAnalysis.isHelpful;
        const getStatusConfig = (isHelpful?: boolean) => {
          return isHelpful
            ? {
              variant: "default" as const,
              className:
                "bg-blue-500 hover:bg-blue-600 text-white border-blue-500",
              label: "Helpful",
            }
            : isHelpful === false
              ? {
                variant: "destructive" as const,
                className:
                  "bg-red-500 hover:bg-red-600 text-white border-red-500",
                label: "Not Helpful",
              }
              : {
                variant: "outline" as const,
                className: "",
                label: "No Feedback",
              };
        };
        const config = getStatusConfig(isHelpful);

        return (
          <Badge variant={config.variant} className={config.className}>
            {config.label}
          </Badge>
        );
      },
    },

    {
      header: "Created At",
      sortable: true,
      sortField: "createdAt",
      cell: (aiAnalysis: AiAnalysis) => (
        <div className="text-foreground text-sm">
          {formatDateTime(aiAnalysis.createdAt)}
        </div>
      ),
    },
    {
      header: "Updated At",
      sortable: true,
      sortField: "updatedAt",
      cell: (aiAnalysis: AiAnalysis) => (
        <div className="text-foreground text-sm">
          {formatDateTime(aiAnalysis.updatedAt)}
        </div>
      ),
    },

    {
      header: "Actions",
      headerClassName: "text-center",
      cell: (aiAnalysis: AiAnalysis) => (
        <div className="flex justify-center gap-2">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(aiAnalysis)}
              className="h-8 text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}
          {onDeleteAiAnalysis && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteAiAnalysis(aiAnalysis)}
              className="h-8 text-xs font-medium border-red-200 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={aiAnalyses}
      columns={columns}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
};
