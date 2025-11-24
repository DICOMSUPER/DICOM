"use client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import FilterBar from "../filter-bar";
import DataTable from "../data-table";
import { useSearchParams } from "next/navigation";
import { useGetDicomStudiesFilteredQuery } from "@/store/dicomStudyApi";
import { DicomStudyFilterQuery } from "@/interfaces/image-dicom/dicom-study.interface";
import { useGetCurrentEmployeeRoomAssignmentQuery } from "@/store/employeeRoomAssignmentApi";
import Cookies from "js-cookie";
import UserNotFoundInCookies from "@/components/common/user-not-found-in-cookies";
import UserDontHaveRoomAssignment from "@/components/common/user-dont-have-room-assignment";

export default function BaseTab() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

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
  } = useGetCurrentEmployeeRoomAssignmentQuery(userId || "", {
    skip: !userId,
  });

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

  // Parse user from cookies - must be done before hooks
  useEffect(() => {
    setIsClient(true);
    const userString = Cookies.get("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserId(user?.id || null);
      } catch (error) {
        console.error("Error parsing user cookie:", error);
        setUserId(null);
      }
    }
  }, []);

  if (!userId) {
    return <UserNotFoundInCookies />;
  }

  if (!currentRoomId) {
    return <UserDontHaveRoomAssignment />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
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
