'use client';

import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { RequestProcedure } from '@/common/interfaces/image-dicom/request-procedure.interface';

interface RequestProcedureDeleteModalProps {
  procedure: RequestProcedure | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function RequestProcedureDeleteModal({
  procedure,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: RequestProcedureDeleteModalProps) {
  if (!procedure) return null;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Procedure"
      description={
        <>
          Are you sure you want to delete procedure <strong>{procedure.name}</strong>?
          This action cannot be undone and will permanently remove this procedure from the system.
        </>
      }
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}

