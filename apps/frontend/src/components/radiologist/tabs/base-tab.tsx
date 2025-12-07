"use client";
import React, { Suspense, useMemo } from "react";
import { useSelector } from "react-redux";
import FilterBar from "../filter-bar";
import DataTable from "../data-table";
import { useSearchParams } from "next/navigation";
import { useGetDicomStudiesFilteredQuery } from "@/store/dicomStudyApi";
import { DicomStudyFilterQuery } from "@/interfaces/image-dicom/dicom-study.interface";
import { useGetCurrentEmployeeRoomAssignmentQuery } from "@/store/employeeRoomAssignmentApi";
import UserDontHaveRoomAssignment from "@/components/common/user-dont-have-room-assignment";
import { RootState } from "@/store";

export default function BaseTab() {
  const userId = useSelector((state: RootState) => state.auth.user?.id) || null;

  const searchParams = useSearchParams();

  const initial = useMemo(() => {
    const p = new URLSearchParams(searchParams.toString());
    return {
      mrn: p.get("mrn") ?? "",
      patientFirstName: p.get("patientFirstName") ?? "",
      patientLastName: p.get("patientLastName") ?? "",
      startDate: p.get("startDate") ?? "",
      endDate: p.get("endDate") ?? "",
      studyStatus: p.get("studyStatus") ?? "All",
      reportStatus: p.get("reportStatus") ?? "All",
      bodyPart: p.get("bodyPart") ?? "",
      studyUID: p.get("studyUID") ?? "",
      modalityId: p.get("modalityId") ?? "",
      modalityMachineId: p.get("modalityMachineId") ?? "",
    };
  }, [searchParams]);

  // Call hooks before any conditional returns
  const {
    data: currentEmployeeSchedule,
    isLoading: isLoadingCurrentEmployeeSchedule,
  } = useGetCurrentEmployeeRoomAssignmentQuery(userId!);

  // Extract roomId from the response: data.roomSchedule.room_id
  const currentRoomId =
    currentEmployeeSchedule?.data?.roomSchedule?.room_id || null;

  // Physician create order to a room
  // Technician in that room upload dicom file => create dicom study => forward to radiologist
  // Radiologist in that room review study
  const {
    data: studyData,
    isLoading: isLoadingStudy,
    refetch: refetchStudy,
    error: studyError,
  } = useGetDicomStudiesFilteredQuery(
    { ...initial, roomId: currentRoomId } as DicomStudyFilterQuery,
    { skip: !currentRoomId }
  );

  if (isLoadingCurrentEmployeeSchedule) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="space-y-4 w-full max-w-4xl p-4">
            <div className="h-12 bg-slate-200 rounded animate-pulse" />
            <div className="h-64 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentRoomId) {
    return <UserDontHaveRoomAssignment />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col h-full">
          <div className="h-12 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="flex-1 bg-slate-100 rounded animate-pulse" />
        </div>
      }
    >
      <div className="flex-1 flex flex-col h-full">
        <FilterBar
          onRefetch={refetchStudy}
          caseNumber={(studyData?.data || []).length}
          maxCases={(studyData?.data || []).length} //may be pagination ?
        />
        <DataTable
          studies={studyData?.data || []}
          isLoading={isLoadingStudy}
          refetch={refetchStudy}
          error={!!studyError}
        />
      </div>
    </Suspense>
  );
}
