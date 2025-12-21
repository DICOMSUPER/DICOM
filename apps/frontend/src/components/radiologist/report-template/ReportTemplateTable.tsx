"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, FileText } from "lucide-react";
import { ReportTemplate } from "@/common/interfaces/patient/report-template.interface";
import { DataTable, SortConfig } from "@/components/ui/data-table";
import { formatDateTime } from "@/common/utils/format-status";
import { Badge } from "@/components/ui/badge";
import { TemplateType } from "@/common/enums/report-template.enum";

interface ReportTemplateTableProps {
  templates: ReportTemplate[];
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (template: ReportTemplate) => void;
  onEditTemplate?: (template: ReportTemplate) => void;
  onDeleteTemplate?: (template: ReportTemplate) => void;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export const ReportTemplateTable: React.FC<ReportTemplateTableProps> = ({
  templates,
  isLoading = false,
  emptyStateIcon = <FileText className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No templates found",
  emptyStateDescription = "Create a report template to see it listed here.",
  onViewDetails,
  onEditTemplate,
  onDeleteTemplate,
  onSort,
  initialSort,
}) => {
  const getTemplateTypeBadge = (type: TemplateType) => {
    if (type === TemplateType.STANDARD) {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          Standard
        </Badge>
      );
    }
    return (
      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
        Custom
      </Badge>
    );
  };

  const getPublicBadge = (isPublic: boolean) => {
    if (isPublic) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          Public
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-200">
        Private
      </Badge>
    );
  };

  const columns = [
    {
      header: "Template Name",
      sortable: true,
      sortField: "templateName",
      cell: (template: ReportTemplate) => (
        <div className="font-medium text-blue-600">
          {template.templateName}
        </div>
      ),
    },
    {
      header: "Type",
      headerClassName: "text-center",
      sortable: true,
      sortField: "templateType",
      cell: (template: ReportTemplate) => (
        <div className="flex justify-center">
          {getTemplateTypeBadge(template.templateType)}
        </div>
      ),
    },
    {
      header: "Visibility",
      headerClassName: "text-center",
      sortable: false,
      cell: (template: ReportTemplate) => (
        <div className="flex justify-center">
          {getPublicBadge(template.isPublic)}
        </div>
      ),
    },
    {
      header: "Modality",
      cell: (template: ReportTemplate) => (
        <div className="text-foreground">
          {template.modality?.modalityName || "—"}
        </div>
      ),
    },
    {
      header: "Body Part",
      cell: (template: ReportTemplate) => (
        <div className="text-foreground">
          {template.bodyPart?.bodyPartName || "—"}
        </div>
      ),
    },
    {
      header: "Owner",
      cell: (template: ReportTemplate) => (
        <div className="text-foreground">
          {template.ownerUserId
            ? `${(template.ownerUserId as any)?.firstName || ""} ${(template.ownerUserId as any)?.lastName || ""}`.trim() || "—"
            : "—"}
        </div>
      ),
    },
    {
      header: "Created",
      sortable: true,
      sortField: "createdAt",
      cell: (template: ReportTemplate) => (
        <div className="text-foreground text-sm">
          {formatDateTime(template.createdAt)}
        </div>
      ),
    },
    {
      header: "Updated",
      sortable: true,
      sortField: "updatedAt",
      cell: (template: ReportTemplate) => (
        <div className="text-foreground text-sm">
          {formatDateTime(template.updatedAt)}
        </div>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-center",
      cell: (template: ReportTemplate) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(template)}
              className="h-8 text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}
          {onEditTemplate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditTemplate(template)}
              className="h-8 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {onDeleteTemplate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteTemplate(template)}
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
    <DataTable<ReportTemplate>
      columns={columns}
      data={templates}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(template) => template.reportTemplatesId}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
};
