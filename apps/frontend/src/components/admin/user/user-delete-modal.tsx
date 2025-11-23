'use client';

import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { User } from '@/interfaces/user/user.interface';

interface UserDeleteModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function UserDeleteModal({
  user,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: UserDeleteModalProps) {
  if (!user) return null;

  const userName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.username || 'N/A';

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete User"
      description={
        <>
          Are you sure you want to delete user <strong>{userName}</strong> ({user.email})? This action
          cannot be undone and will permanently remove this user from the system.
        </>
      }
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}

