'use client';

import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Department } from '@/common/interfaces/user/department.interface';

interface DepartmentDeleteModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DepartmentDeleteModal({
  department,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DepartmentDeleteModalProps) {
  if (!department) return null;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Department"
      description={
        <>
          Are you sure you want to delete department <strong>{department.departmentName}</strong>?
          This action cannot be undone and will permanently remove this department from the system.
        </>
      }
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}

