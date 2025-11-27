'use client';

import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ShiftTemplate } from '@/interfaces/user/shift-template.interface';

interface ShiftTemplateDeleteModalProps {
  template: ShiftTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function ShiftTemplateDeleteModal({
  template,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: ShiftTemplateDeleteModalProps) {
  if (!template) return null;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Shift Template"
      description={
        <>
          Are you sure you want to delete shift template <strong>{template.shift_name}</strong>? This action
          cannot be undone and will permanently remove this template from the system.
        </>
      }
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}

