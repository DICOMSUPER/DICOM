"use client";

import StudyTab from "./tabs/study-tab";
import { useTabs } from "./tabs/tab-context";
import {
  DicomStudy,
} from "@/interfaces/image-dicom/dicom-study.interface";
import { DicomStudyStatus } from "@/enums/image-dicom.enum";
import { DiagnosisStatus } from "@/enums/patient-workflow.enum";
import { Suspense } from "react";
import { AlertCircle } from "lucide-react";
import { formatStatus } from "@/utils/format-status";

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
  return { label: formatStatus(status), className: map[status] || "text-slate-700" };
};

const reportStatusBadge = (status?: string) => {
  if (!status) return { label: "N/A", className: "text-gray-600" };
  const map: Record<string, string> = {
    [DiagnosisStatus.PENDING_APPROVAL]: "text-amber-700",
    [DiagnosisStatus.APPROVED]: "text-emerald-700",
    [DiagnosisStatus.REJECTED]: "text-red-700",
    [DiagnosisStatus.DRAFT]: "text-slate-700",
  };
  return { label: formatStatus(status), className: map[status] || "text-slate-700" };
};

export default function DataTable({
  studies,
  isLoading,
  error,
  refetch: _refetch,
}: {
  studies: DicomStudy[] | [];
  isLoading: boolean;
  error: boolean | Error;
  refetch: () => void;
}) {
  void _refetch; // keep API surface while avoiding unused warnings
  const { openTab } = useTabs();

  console.log("check studies  ", studies);

  const tableData = studies || [];

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-full bg-white p-4 text-slate-500 gap-2">
        <span className="inline-flex h-5 w-5 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
        Đang tải danh sách ca...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex justify-center items-center h-full bg-white p-4 text-red-600 gap-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        Lỗi tải danh sách ca
      </div>
    );
  }

  return (
    <Suspense>
      <div className="flex-1 bg-white overflow-hidden flex flex-col min-h-0 h-full">
        <div className="w-full flex-1 overflow-auto h-full min-h-0">
          <div className="text-sm min-w-[1900px] flex flex-col min-h-full">
            <div className="grid grid-cols-16 bg-gray-100 sticky top-0 z-10 border-b border-gray-300 text-left font-semibold text-gray-700 divide-x divide-gray-300">
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
                "Notes",
                "Actions",
              ].map((label) => (
                <div key={label} className="px-4 py-2 h-full text-center flex items-center justify-center">
                  {label}
                </div>
              ))}
            </div>

            {tableData && tableData.length > 0 ? (
              <div
                className="divide-y divide-gray-200 flex-1 min-h-full grid auto-rows-fr"
              >
                {tableData.map((row: DicomStudy, idx: number) => (
                  <div
                    key={`${row.studyInstanceUid ?? idx}-${idx}`}
                    className="grid grid-cols-16 items-center text-gray-700 hover:bg-gray-50 divide-x divide-gray-200"
                  >
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">{idx + 1}</div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center" title={row.studyInstanceUid}>
                      {`...${row.studyInstanceUid?.slice(-7)}`}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">{row.patientCode}</div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">{row.patient?.lastName}</div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center font-medium">
                      {row.patient?.firstName}
                    </div>

                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      {(() => {
                        const badge = studyStatusBadge(row.studyStatus);
                        return <span className={`text-xs font-semibold ${badge.className}`}>{badge.label}</span>;
                      })()}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      {(() => {
                        const badge = reportStatusBadge(row.report?.diagnosisStatus);
                        return <span className={`text-xs font-semibold ${badge.className}`}>{badge.label}</span>;
                      })()}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      {row.patient?.dateOfBirth && row.patient?.gender
                        ? `${row.patient.gender.charAt(0).toUpperCase()}, ${calculateAge(
                            row.patient?.dateOfBirth as unknown as string
                          )}`
                        : "N/A"}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">{row.imagingOrder?.procedure?.bodyPart?.name}</div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">{formatDate(row.studyDate)}</div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">{formatTime(row.studyTime)}</div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">{row.room?.roomCode}</div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center" title={row.modalityMachine?.name}>
                      {row.imagingOrder?.procedure?.modality?.modalityCode}
                    </div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">{row.imagingOrder?.contrastRequired ? "Yes" : "No"}</div>
                    <div className="px-4 py-2 h-full text-center flex items-center justify-center">
                      <div className="truncate" title={row.imagingOrder?.imagingOrderForm?.notes}>
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
                            `${row.patient?.lastName} ${
                              row.patient?.firstName
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
              <div className="px-4 py-8 text-center text-gray-500">No study match</div>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
