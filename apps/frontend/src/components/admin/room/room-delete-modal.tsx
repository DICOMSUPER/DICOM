'use client';

import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Room } from '@/interfaces/user/room.interface';

interface RoomDeleteModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function RoomDeleteModal({
  room,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: RoomDeleteModalProps) {
  if (!room) return null;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Room"
      description={
        <>
          Are you sure you want to delete room <strong>{room.roomCode}</strong>? This action
          cannot be undone and will permanently remove this room from the system.
        </>
      }
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}

