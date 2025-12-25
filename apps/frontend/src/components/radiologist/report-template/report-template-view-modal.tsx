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
import { ReportTemplate } from "@/common/interfaces/patient/report-template.interface";
import { FileText, Calendar, User, Eye, Lock } from "lucide-react";
import { TemplateType } from "@/common/enums/report-template.enum";
import { formatDateTime, modalStyles } from "@/common/utils/format-status";

interface ReportTemplateViewModalProps {
  template: ReportTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (template: ReportTemplate) => void;
}

export function ReportTemplateViewModal({
  template,
  isOpen,
  onClose,
  onEdit,
}: ReportTemplateViewModalProps) {
  const getTemplateTypeBadge = (type: TemplateType) => {
    if (type === TemplateType.STANDARD) {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
          Standard
        </Badge>
      );
    }
    return (
      <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1">
        Custom
      </Badge>
    );
  };

  const getVisibilityBadge = (isPublic: boolean) => {
    if (isPublic) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 flex items-center gap-1">
          <Eye className="h-3 w-3" />
          Public
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-200 px-3 py-1 flex items-center gap-1">
        <Lock className="h-3 w-3" />
        Private
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={modalStyles.dialogContent}>
        <DialogHeader className={modalStyles.dialogHeader}>
          <DialogTitle className={modalStyles.dialogTitle}>
            Report Template Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6 py-4">
          {!template ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Hero Section */}
              <section className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                      <FileText className="h-3.5 w-3.5 inline mr-1" />
                      Report Template
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">
                        {template.templateName}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        {getTemplateTypeBadge(template.templateType)}
                        {getVisibilityBadge(template.isPublic)}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Basic Info */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Modality</p>
                    <p className="font-medium text-slate-800">
                      {template.modality?.modalityName || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Body Part</p>
                    <p className="font-medium text-slate-800">
                      {template.bodyPart?.name || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Owner</p>
                    <p className="font-medium text-slate-800 flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {template.ownerUserId
                        ? `${(template.ownerUserId as any)?.firstName || ""} ${(template.ownerUserId as any)?.lastName || ""}`.trim() || "—"
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Created</p>
                    <p className="font-medium text-slate-800 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDateTime(template.createdAt)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Template Content */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Template Content
                </h3>
                <div className="space-y-6">
                  {template.descriptionTemplate && (
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-2">
                        Description Template
                      </p>
                      <div className="bg-slate-50 rounded-lg p-4 text-slate-700 whitespace-pre-wrap">
                        {template.descriptionTemplate}
                      </div>
                    </div>
                  )}

                  {template.technicalTemplate && (
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-2">
                        Technical Template
                      </p>
                      <div className="bg-slate-50 rounded-lg p-4 text-slate-700 whitespace-pre-wrap">
                        {template.technicalTemplate}
                      </div>
                    </div>
                  )}

                  {template.findingsTemplate && (
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-2">
                        Findings Template
                      </p>
                      <div className="bg-slate-50 rounded-lg p-4 text-slate-700 whitespace-pre-wrap">
                        {template.findingsTemplate}
                      </div>
                    </div>
                  )}

                  {template.conclusionTemplate && (
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-2">
                        Conclusion Template
                      </p>
                      <div className="bg-slate-50 rounded-lg p-4 text-slate-700 whitespace-pre-wrap">
                        {template.conclusionTemplate}
                      </div>
                    </div>
                  )}

                  {template.recommendationTemplate && (
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-2">
                        Recommendation Template
                      </p>
                      <div className="bg-slate-50 rounded-lg p-4 text-slate-700 whitespace-pre-wrap">
                        {template.recommendationTemplate}
                      </div>
                    </div>
                  )}

                  {!template.descriptionTemplate &&
                    !template.technicalTemplate &&
                    !template.findingsTemplate &&
                    !template.conclusionTemplate &&
                    !template.recommendationTemplate && (
                      <p className="text-slate-500 italic">
                        No template content available.
                      </p>
                    )}
                </div>
              </section>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className={modalStyles.dialogFooter}>
          <Button variant="outline" onClick={onClose} className={modalStyles.secondaryButton}>
            Close
          </Button>
          {template && onEdit && (
            <Button onClick={() => onEdit(template)} className={modalStyles.primaryButton}>Edit Template</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
