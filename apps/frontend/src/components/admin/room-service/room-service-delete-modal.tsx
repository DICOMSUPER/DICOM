'use client';

import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ServiceRoom } from '@/common/interfaces/user/service-room.interface';

interface RoomServiceDeleteModalProps {
  roomService: ServiceRoom | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function RoomServiceDeleteModal({
  roomService,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: RoomServiceDeleteModalProps) {
  if (!roomService) return null;

  const roomCode = roomService.room?.roomCode ? String(roomService.room.roomCode) : 'N/A';
  const serviceName = roomService.service?.serviceName ? String(roomService.service.serviceName) : 'N/A';

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Room Service Assignment"
      description={
        <>
          Are you sure you want to delete the assignment between room <strong>{roomCode}</strong> and service <strong>{serviceName}</strong>? This action
          cannot be undone and will permanently remove this assignment from the system.
        </>
      }
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}

