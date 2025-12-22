"use client";

import StudyTab from "./tabs/study-tab";
import { useTabs } from "./tabs/tab-context";
import { DicomStudy } from "@/common/interfaces/image-dicom/dicom-study.interface";
import { DicomStudyStatus } from "@/common/enums/image-dicom.enum";
import { DiagnosisStatus } from "@/common/enums/patient-workflow.enum";
import { Suspense } from "react";
import { AlertCircle, RefreshCw, FileSearch, User, UserCircle, Mars, Venus } from "lucide-react";
import { formatStatus } from "@/common/utils/format-status";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "path";

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

// Helper function to format gender with capitalization
const formatGender = (gender: string): string => {
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
};

// Helper function to get gender icon
const GenderIcon = ({ gender }: { gender: string }) => {
  if (gender?.toLowerCase() === 'male') {
    return <Mars className="h-4 w-4 text-blue-500" />;
  } else if (gender?.toLowerCase() === 'female') {
    return <Venus className="h-4 w-4 text-pink-500" />;
  }
  return <UserCircle className="h-4 w-4 text-gray-500" />;
};

// Helper function to format date (e.g., "1993-03-25" to "3/25/93")
const formatDate = (date: string): string => {
  const dateObj = new Date(date);
  const [month, day, year] = dateObj.toLocaleDateString("vi-VN").split("/");
  return `${parseInt(month)}/${parseInt(day)}/${year.slice(2)}`;
};

const formatCreatedAt = (date: string): string => {
  const dateObj = new Date(date);
  const [day, month, year] = dateObj.toLocaleDateString("vi-VN").split("/");
  return `${parseInt(day)}/${parseInt(month)}/${year.slice(2)}`;
};

// Helper function to format time (e.g., "13:57:31" to "13:57")
const formatTime = (time: string): string => {
  return time.slice(0, 5); // Keep only hours and minutes
};

const studyStatusBadge = (status?: string) => {
  if (!status) return { label: "N/A", className: "text-gray-600" };
  const map: Record<string, string> = {
    [DicomStudyStatus.SCANNED]: "text-slate-700",
    [DicomStudyStatus.TECHNICIAN_VERIFIED]: "text-blue-700",
    [DicomStudyStatus.READING]: "text-amber-700",
    [DicomStudyStatus.PENDING_APPROVAL]: "text-amber-700",
    [DicomStudyStatus.APPROVED]: "text-emerald-700",
    [DicomStudyStatus.RESULT_PRINTED]: "text-emerald-700",
    [DicomStudyStatus.REJECTED]: "text-red-700",
  };
  return {
    label: formatStatus(status),
    className: map[status] || "text-slate-700",
  };
};

const reportStatusBadge = (status?: string) => {
  if (!status) return { label: "N/A", className: "text-gray-600" };
  const map: Record<string, string> = {
    [DiagnosisStatus.PENDING_APPROVAL]: "text-amber-700",
    [DiagnosisStatus.APPROVED]: "text-emerald-700",
    [DiagnosisStatus.REJECTED]: "text-red-700",
    [DiagnosisStatus.DRAFT]: "text-slate-700",
  };
  return {
    label: formatStatus(status),
    className: map[status] || "text-slate-700",
  };
};

export default function DataTable({
  studies,
  isLoading,
  error,
  refetch,
}: {
  studies: DicomStudy[] | [];
  isLoading: boolean;
  error: boolean | Error;
  refetch: () => void;
}) {
  const { openTab } = useTabs();

  console.log("check studies  ", studies);

  const tableData = studies || [];

  // Loading state with skeleton rows
  if (isLoading) {
    return (
      <div className="flex-1 bg-white overflow-hidden flex flex-col min-h-0 h-full">
        <div className="w-full flex-1 overflow-auto h-full min-h-0">
          <div className="text-sm min-w-[1900px] flex flex-col min-h-full">
            {/* Header skeleton */}
            <div className="grid grid-cols-17 bg-gray-100 sticky top-0 z-10 border-b border-gray-300 divide-x divide-gray-300">
              {Array.from({ length: 17 }).map((_, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 h-full flex items-center justify-center"
                >
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
            {/* Rows skeleton */}
            {Array.from({ length: 8 }).map((_, rowIdx) => (
              <div
                key={rowIdx}
                className="grid grid-cols-17 border-b border-gray-200 divide-x divide-gray-200"
              >
                {Array.from({ length: 17 }).map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className="px-4 py-3 h-full flex items-center justify-center"
                  >
                    <Skeleton
                      className={`h-3 ${colIdx === 1 ? "w-20" : colIdx === 15 ? "w-12" : "w-14"
                        }`}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <span className="text-sm text-slate-500 flex items-center justify-center gap-2">
            <span className="inline-flex h-4 w-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
            Loading cases...
          </span>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-white p-8">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Data Loading Error
            </h3>
            <p className="text-sm text-gray-500">
              Unable to load case list. Please try again.
            </p>
          </div>
          <Button onClick={refetch} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Suspense>
      <div className="flex-1 bg-white overflow-hidden flex flex-col min-h-0 h-full">
        <div className="w-full flex-1 overflow-auto h-full min-h-0">
          <div className="text-sm min-w-[1900px] flex flex-col min-h-full">
            <div className="grid grid-cols-17 bg-gray-100 sticky top-0 z-10 border-b border-gray-300 text-left font-semibold text-gray-700 divide-x divide-gray-300">
              {[
                "No.",
                "Study UID",
                "MRN",
                "Patient Last Name",
                "Patient First Name",
                "Study Status",
                "Report Status",
                "Gender, Age",
                "Body Part",
                "Study Date",
                "Study Time",
                "Room",
                "Modality",
                "Contrast",
                "Import Date",
                "Notes",
                "Actions",
              ].map((label) => (
                <div
                  key={label}
                  className="px-4 py-2 h-full text-center flex items-center justify-center"
                >
                  {label}
                </div>
              ))}
            </div>

            {tableData && tableData.length > 0 ? (
              <div className="divide-y divide-gray-200 flex-1 min-h-full grid auto-rows-fr">
                {tableData.map((row: DicomStudy, idx: number) => (
                  <div
                    key={`${row.studyInstanceUid ?? idx}-${idx}`}
                    className="grid grid-cols-17 items-center text-gray-700 hover:bg-gray-50 divide-x divide-gray-200"
                  >
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div
                      className="px-4 py-2 h-full text-center flex items-center justify-center"
                      title={row.studyInstanceUid}
                    >
                      {`...${row.studyInstanceUid?.slice(-7)}`}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      {row.patientCode}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      {row.patient?.lastName}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center font-medium">
                      {row.patient?.firstName}
                    </div>

                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      {(() => {
                        const badge = studyStatusBadge(row.studyStatus);
                        return (
                          <span
                            className={`text-xs font-semibold ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      {(() => {
                        const badge = reportStatusBadge(
                          row.report?.diagnosisStatus
                        );
                        return (
                          <span
                            className={`text-xs font-semibold ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center gap-1">
                      {row.patient?.dateOfBirth && row.patient?.gender ? (
                        <>
                          <GenderIcon gender={row.patient.gender} />
                          <span>
                            {formatGender(row.patient.gender)}, {calculateAge(row.patient?.dateOfBirth as unknown as string)}
                          </span>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      {row.imagingOrder?.procedure?.bodyPart?.name}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      {formatDate(row.studyDate)}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      {formatTime(row.studyTime)}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      {row.room?.roomCode}
                    </div>
                    <div
                      className="px-4 py-2 h-full text-center flex items-center justify-center"
                      title={row.modalityMachine?.name}
                    >
                      {row.imagingOrder?.procedure?.modality?.modalityCode}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      {row.imagingOrder?.contrastRequired ? "Yes" : "No"}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      {formatCreatedAt(row?.createdAt)}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      <div
                        className="truncate"
                        title={row.imagingOrder?.imagingOrderForm?.notes}
                      >
                        {row.imagingOrder?.imagingOrderForm?.notes}
                      </div>
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center text-gray-600 text-xs">
                      <button
                        className="text-blue-500 cursor-pointer hover:text-blue-700 hover:underline"
                        onClick={() => {
                          localStorage.setItem(
                            "patientId",
                            row.patient?.id as string
                          );

                          openTab?.(
                            row.studyInstanceUid,
                            `${row.patient?.lastName} ${row.patient?.firstName
                            } - (${formatCreatedAt(row.createdAt)})`,
                            <StudyTab patientId={row.patient?.id as string} />
                          );
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
                <div className="flex flex-col items-center gap-4 max-w-md text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <FileSearch className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                      No cases found
                    </h3>
                    <p className="text-sm text-gray-500">
                      No cases match the filter criteria. Try adjusting the
                      filters or refreshing the data.
                    </p>
                  </div>
                  <Button
                    onClick={refetch}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
