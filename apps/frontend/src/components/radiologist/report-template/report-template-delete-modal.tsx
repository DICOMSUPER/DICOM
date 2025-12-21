"use client";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ReportTemplate } from "@/common/interfaces/patient/report-template.interface";

interface ReportTemplateDeleteModalProps {
  template: ReportTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function ReportTemplateDeleteModal({
  template,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: ReportTemplateDeleteModalProps) {
  if (!template) return null;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Report Template"
      description={
        <>
          Are you sure you want to delete template{" "}
          <strong>{template.templateName}</strong>? This action cannot be
          undone and will permanently remove this template from the system.
        </>
      }
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}
