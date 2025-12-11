'use client';

import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { AiAnalysis } from '@/interfaces/system/ai-analysis.interface';

interface AiAnalysisDeleteModalProps {
  aiAnalysis: AiAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function AiAnalysisDeleteModal({
  aiAnalysis,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: AiAnalysisDeleteModalProps) {
  if (!aiAnalysis) return null;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete AI Analysis"
      description={
        <>
          Are you sure you want to delete AI analysis for study <strong>{aiAnalysis.studyId}</strong>?
          This action cannot be undone and will permanently remove this analysis from the system.
        </>
      }
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}

