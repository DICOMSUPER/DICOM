'use client';

import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { BodyPart } from '@/interfaces/imaging/body-part.interface';

interface BodyPartDeleteModalProps {
  bodyPart: BodyPart | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function BodyPartDeleteModal({
  bodyPart,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: BodyPartDeleteModalProps) {
  if (!bodyPart) return null;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Body Part"
      description={
        <>
          Are you sure you want to delete body part <strong>{bodyPart.name}</strong>?
          This action cannot be undone and will permanently remove this body part from the system.
        </>
      }
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}

