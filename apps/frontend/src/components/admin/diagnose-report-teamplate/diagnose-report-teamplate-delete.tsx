"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";
import { useDeleteReportTemplateMutation } from "@/store/diagnosisReportTeamplateApi";
import { ReportTemplate } from "@/interfaces/patient/diagnosis-report-teamplate.interface";

interface ReportTemplateDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: ReportTemplate | null;
  onSuccess: () => void;
}

const ReportTemplateDeleteModal = ({
  isOpen,
  onClose,
  template,
  onSuccess,
}: ReportTemplateDeleteModalProps) => {
  const { toast } = useToast();
  const [deleteTemplate, { isLoading }] = useDeleteReportTemplateMutation();

  const handleDelete = async () => {
    if (!template) return;

    try {
      await deleteTemplate(template.reportTemplatesId).unwrap();
      toast({
        title: "Success",
        description: "Report template deleted successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>Delete Report Template</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-3">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">
              {template?.templateName}
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReportTemplateDeleteModal;