"use client";

import { useGetDicomStudiesFilteredQuery } from "@/store/dicomStudyApi";
import StudyTab from "./tabs/study-tab";
import { useTabs } from "./tabs/tab-context";
import {
  DicomStudy,
  DicomStudyFilterQuery,
} from "@/interfaces/image-dicom/dicom-study.interface";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

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
  const [year, month, day] = date.split("-");
  return `${parseInt(month)}/${parseInt(day)}/${year.slice(2)}`;
};

// Helper function to format time (e.g., "13:57:31" to "13:57")
const formatTime = (time: string): string => {
  return time.slice(0, 5); // Keep only hours and minutes
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

  console.log("check studies  " , studies)

  const tableData = studies || [];

  if (isLoading) {
    return <div className="flex-1 bg-white p-4">Loading...</div>;
  }

  if (error) {
    return <div className="flex-1 bg-white p-4">Error loading studies</div>;
  }

  return (
    <div className="flex-1 bg-white">
      <div className="w-full overflow-x-scroll horizontal-scrollbar">
        <table className="min-w-[1200px] w-full border-collapse text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr className="border-b border-gray-300">
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                No.
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Study UID
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                MRN
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Patient Last Name
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Patient First Name
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Study Status
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Report Status
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Gender, Age
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Body Part
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Study Date
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Study Time
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Room
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Modality
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Contrast
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700  border-r border-gray-300">
                Notes
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 ">
                Actions
              </th>
            </tr>
          </thead>
          {tableData && tableData.length > 0 ? (
            <tbody>
              {tableData.map((row: DicomStudy, idx: number) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {idx + 1}
                  </td>
                  <td
                    className="px-4 py-2 border-r border-gray-200 text-gray-700"
                    title={row.studyInstanceUid}
                  >
                    {`...${row.studyInstanceUid?.slice(-7)}`}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.patientCode}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.patient?.lastName}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700 font-medium">
                    {row.patient?.firstName}
                  </td>

                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.studyStatus}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.report?.diagnosisStatus || "NA"}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.patient?.dateOfBirth && row.patient?.gender
                      ? `${row.patient.gender
                        .charAt(0)
                        .toUpperCase()}, ${calculateAge(
                          row.patient?.dateOfBirth as unknown as string
                        )}`
                      : "NA"}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.imagingOrder?.procedure?.bodyPart?.name}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {formatDate(row.studyDate)}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {formatTime(row.studyTime)}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.room?.roomCode}
                  </td>
                  <td
                    className="px-4 py-2 border-r border-gray-200 text-gray-700"
                    title={row.modalityMachine?.name}
                  >
                    {row.imagingOrder?.procedure?.modality?.modalityCode}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.imagingOrder?.contrastRequired ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.imagingOrder?.imagingOrderForm?.notes}
                  </td>
                  <td className="px-4 py-2 text-gray-600 text-xs">
                    <button
                      className="text-blue-500 cursor-pointer"
                      onClick={() => {
                        localStorage.setItem("patientId", row.patient?.id as string);

                        openTab?.(
                          row.studyInstanceUid,
                          `${row.patient?.lastName} ${row.patient?.firstName} - (${row.studyDate.toString()})`,
                          <StudyTab patientId={row.patient?.id as string} />
                        );
                      }}
                    >

                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tr>
              <td colSpan={16} className="px-4 py-8 text-center text-gray-500">
                No study match
              </td>
            </tr>
          )}
        </table>
      </div>
    </div>
  );
}
