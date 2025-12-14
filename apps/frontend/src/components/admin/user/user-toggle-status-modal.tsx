'use client';

import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { User } from '@/common/interfaces/user/user.interface';

interface UserToggleStatusModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isUpdating?: boolean;
}

export function UserToggleStatusModal({
  user,
  isOpen,
  onClose,
  onConfirm,
  isUpdating = false,
}: UserToggleStatusModalProps) {
  if (!user) return null;

  const userName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.username || 'N/A';
  const isActive = user.isActive ?? true;
  const action = isActive ? 'disable' : 'enable';

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={isActive ? 'Disable User' : 'Enable User'}
      description={
        <>
          Are you sure you want to {action} user <strong>{userName}</strong> ({user.email})? 
          {isActive 
            ? ' The user will no longer be able to access the system.' 
            : ' The user will regain access to the system.'}
        </>
      }
      confirmText={isActive ? 'Disable' : 'Enable'}
      cancelText="Cancel"
      variant={isActive ? 'danger' : 'info'}
      isLoading={isUpdating}
    />
  );
}

