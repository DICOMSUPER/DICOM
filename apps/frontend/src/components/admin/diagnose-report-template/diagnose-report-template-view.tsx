"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Globe, Lock, FileText } from "lucide-react";
import { ReportTemplate } from "@/interfaces/patient/diagnosis-report-template.interface";
import { format } from "date-fns";

interface ReportTemplateViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: ReportTemplate | null;
  onEdit: () => void;
}

const ReportTemplateViewModal = ({
  isOpen,
  onClose,
  template,
  onEdit,
}: ReportTemplateViewModalProps) => {
  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {template.templateName}
                </DialogTitle>
                <DialogDescription>
                  Created on {format(new Date(template.createdAt), "PPP")}
                </DialogDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Template Type</p>
              <Badge
                variant={
                  template.templateType === "standard" ? "default" : "secondary"
                }
                className={
                  template.templateType === "standard"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-amber-100 text-amber-700"
                }
              >
                {template.templateType}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Visibility</p>
              <Badge
                variant="outline"
                className={
                  template.isPublic
                    ? "border-emerald-300 text-emerald-700"
                    : "border-slate-300 text-slate-700"
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
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Modality</p>
              <p className="font-medium">
                {template.modality?.modalityName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Body Part</p>
              <p className="font-medium">{template.bodyPart?.name || "N/A"}</p>
            </div>
          </div>

          <Separator />

          {/* Templates Content */}
          <div className="space-y-4">
            {template.descriptionTemplate && (
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-2">
                  Description Template
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm whitespace-pre-wrap">
                    {template.descriptionTemplate}
                  </p>
                </div>
              </div>
            )}

            {template.technicalTemplate && (
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-2">
                  Technical Template
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm whitespace-pre-wrap">
                    {template.technicalTemplate}
                  </p>
                </div>
              </div>
            )}

            {template.findingsTemplate && (
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-2">
                  Findings Template
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm whitespace-pre-wrap">
                    {template.findingsTemplate}
                  </p>
                </div>
              </div>
            )}

            {template.conclusionTemplate && (
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-2">
                  Conclusion Template
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm whitespace-pre-wrap">
                    {template.conclusionTemplate}
                  </p>
                </div>
              </div>
            )}

            {template.recommendationTemplate && (
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-2">
                  Recommendation Template
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm whitespace-pre-wrap">
                    {template.recommendationTemplate}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportTemplateViewModal;