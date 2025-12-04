import { DicomStudyStatus } from "@/enums/image-dicom.enum";
import { DicomStudy } from "@/interfaces/image-dicom/dicom-study.interface";
import { useUpdateDicomStudyMutation } from "@/store/dicomStudyApi";
import { ChevronDown } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

export default function StudyLevel({
  study,
  isExpanded,
  onToggle,
  name,
  date,
  seriesCount,
  isLast,
  refetch,
  forwardingStudyId,
  setForwardingStudyId,
}: {
  study: DicomStudy;
  isExpanded: boolean;
  onToggle: (studyId: string) => void;
  name: string;
  date: string | undefined;
  seriesCount: number;
  isLast: boolean;
  refetch: () => void;
  forwardingStudyId: string | null;
  setForwardingStudyId: (id: string) => void;
}) {
  const [updateDicomStudy] = useUpdateDicomStudyMutation();
  const [currentStatus, setCurrentStatus] = useState<DicomStudyStatus>(
    study.studyStatus as DicomStudyStatus
  );

  // Update local status when study prop changes (after refetch)
  useEffect(() => {
    setCurrentStatus(study.studyStatus as DicomStudyStatus);
  }, [study.studyStatus]);

  const changeDicomStudyStatus = async (
    id: string,
    status: DicomStudyStatus
  ) => {
    await updateDicomStudy({ id, data: { studyStatus: status } });
  };

  const forwardStudy = async (studyId: string) => {
    try {
      // Optimistically update the status immediately
      setCurrentStatus(DicomStudyStatus.TECHNICIAN_VERIFIED);

      await changeDicomStudyStatus(
        studyId,
        DicomStudyStatus.TECHNICIAN_VERIFIED
      );
      refetch?.();
      toast.success("Study forwarded successfully");
    } catch (error) {
      // Revert to original status on error
      setCurrentStatus(study.studyStatus as DicomStudyStatus);
      toast.error("Failed to forward study");
    }
  };

  const isForwarded = currentStatus !== DicomStudyStatus.SCANNED;

  const getStatusBadge = () => {
    const statusLabels: Record<DicomStudyStatus, string> = {
      [DicomStudyStatus.SCANNED]: "Scanned",
      [DicomStudyStatus.TECHNICIAN_VERIFIED]: "Technician Verified",
      [DicomStudyStatus.REJECTED]: "Rejected",
      [DicomStudyStatus.READING]: "Reading",
      [DicomStudyStatus.PENDING_APPROVAL]: "Pending Approval",
      [DicomStudyStatus.APPROVED]: "Approved",
      [DicomStudyStatus.RESULT_PRINTED]: "Result Printed",
    };

    const statusColors: Record<DicomStudyStatus, string> = {
      [DicomStudyStatus.SCANNED]: "bg-gray-100 text-gray-700",
      [DicomStudyStatus.TECHNICIAN_VERIFIED]: "bg-blue-100 text-blue-700",
      [DicomStudyStatus.REJECTED]: "bg-red-100 text-red-700",
      [DicomStudyStatus.READING]: "bg-yellow-100 text-yellow-700",
      [DicomStudyStatus.PENDING_APPROVAL]: "bg-orange-100 text-orange-700",
      [DicomStudyStatus.APPROVED]: "bg-green-100 text-green-700",
      [DicomStudyStatus.RESULT_PRINTED]: "bg-purple-100 text-purple-700",
    };

    return (
      <span
        className={`text-xs px-2 py-1 rounded ${statusColors[currentStatus]}`}
      >
        {statusLabels[currentStatus]}
      </span>
    );
  };

  return (
    <button
      onClick={() => onToggle(study.id)}
      disabled={study.series?.length === 0}
      className={`w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${
        study.series?.length === 0
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer"
      } ${isLast ? "rounded-b-lg" : ""}`}
    >
      <div className="flex items-center space-x-4 flex-1 text-left">
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? "rotate-0" : "-rotate-90"
          }`}
        />
        <div>
          <p className="text-sm font-medium text-gray-900" title={name}>
            Study {name.slice(0, 5)}...{name.slice(-5)}
          </p>
          <p className="text-xs text-gray-500">{date}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {getStatusBadge()}

        <button
          onClick={async (e) => {
            e.stopPropagation();
            setForwardingStudyId(study.id);
          }}
          disabled={isForwarded}
          className={`text-sm transition-colors ${
            isForwarded
              ? "text-gray-400 cursor-not-allowed"
              : "text-blue-600 hover:text-blue-700 hover:underline"
          }`}
        >
          Forward Study
        </button>

        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {seriesCount} series
        </span>
      </div>
    </button>
  );
}
