import React from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, FileWarning } from "lucide-react";
import { DicomStudy } from "@/common/interfaces/image-dicom/dicom-study.interface";

interface ReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: DicomStudy;
}

const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InfoRow = ({
  label,
  sublabel,
  value,
  mono = false,
}: {
  label: string;
  sublabel?: string;
  value: string;
  mono?: boolean;
}) => (
  <div>
    <p className="text-gray-500 text-xs mb-1">
      {label}
      {sublabel && (
        <span className="block text-gray-400 text-[10px]">{sublabel}</span>
      )}
    </p>
    <p className={`text-gray-700 text-sm ${mono ? "font-mono text-xs" : ""}`}>
      {value}
    </p>
  </div>
);

export default function ReasonModal({
  isOpen,
  onClose,
  study,
}: ReasonModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        className="relative bg-white rounded-lg shadow-xl w-[480px] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <div className="p-2 bg-red-100 rounded-full">
            <FileWarning className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              Study Rejected
            </h2>
            <p className="text-sm text-gray-500">Review rejection details</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Study Info */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow
              label="Study UID"
              value={`${study.studyInstanceUid?.slice(0, 20)}...`}
              mono
            />
            <InfoRow
              label="Study Date"
              sublabel="From file metadata"
              value={formatDate(study.studyDate)}
            />
            <InfoRow label="Created at" value={formatDate(study.createdAt)} />
            <InfoRow
              label="Updated at"
              sublabel="Rejected at"
              value={formatDate(study.updatedAt)}
            />
          </div>

          {/* Warning Banner */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800 mb-1">
                  Rejection Reason
                </h3>
                <p className="text-sm text-red-700">
                  {study.reason || "No reason provided."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
