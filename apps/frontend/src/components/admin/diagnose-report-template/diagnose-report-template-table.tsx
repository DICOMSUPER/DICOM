"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  Globe,
  Lock,
  Loader2,
} from "lucide-react";
import { ReportTemplate } from "@/interfaces/patient/diagnosis-report-template.interface";
import { format } from "date-fns";

interface ReportTemplateTableProps {
  data: ReportTemplate[];
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (template: ReportTemplate) => void;
  onView: (template: ReportTemplate) => void;
  onDelete: (template: ReportTemplate) => void;
}

const ReportTemplateTable = ({
  data,
  isLoading,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onView,
  onDelete,
}: ReportTemplateTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading templates...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 text-lg font-medium">No templates found</p>
        <p className="text-slate-500 text-sm mt-1">
          Create your first report template to get started
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Template Name</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Modality</TableHead>
              <TableHead className="font-semibold">Body Part</TableHead>
              <TableHead className="font-semibold">Visibility</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((template) => (
              <TableRow
                key={template.reportTemplatesId}
                className="hover:bg-slate-50 transition-colors"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    {template.templateName}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      template.templateType === "standard"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      template.templateType === "standard"
                        ? "bg-purple-100 text-purple-700 border-purple-300"
                        : "bg-amber-100 text-amber-700 border-amber-300"
                    }
                  >
                    {template.templateType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-600">
                    {template.modality?.modalityName || "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-600">
                    {template.bodyPart?.name || "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      template.isPublic
                        ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                        : "border-slate-300 text-slate-700 bg-slate-50"
                    }
                  >
                    {template.isPublic ? (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {format(new Date(template.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onView(template)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(template)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(template)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-slate-600">
          Showing {startIndex} to {endIndex} of {total} templates
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : ""
                }
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportTemplateTable;