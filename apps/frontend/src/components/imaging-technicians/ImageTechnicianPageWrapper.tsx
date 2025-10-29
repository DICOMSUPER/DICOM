"use client";
import React, { useMemo } from "react";
import FilterBar from "./filter-bar";
import DataTable from "./data-table";
import { useSearchParams } from "next/navigation";
import { useGetImagingOrderByRoomIdFilterQuery } from "@/store/imagingOrderApi";
import { format } from "date-fns";
import { useGetMySchedulesByDateRangeQuery } from "@/store/employeeScheduleApi";
import Loading from "../common/Loading";
import { ImagingOrderStatus } from "@/enums/image-dicom.enum";
import CurrentStatus from "./current-status";

export default function ImageTechnicianPageWrapper() {
  const searchParams = useSearchParams();

  const initial = useMemo(() => {
    const p = new URLSearchParams(searchParams.toString());
    return {
      mrn: p.get("mrn") ?? "",
      patientFirstName: p.get("patientFirstName") ?? "",
      patientLastName: p.get("patientLastName") ?? "",
      bodyPart: p.get("bodyPart") ?? "",
      modalityId: p.get("modalityId") ?? "",
      orderStatus: p.get("orderStatus") ?? "",
      procedureId: p.get("procedureId") ?? "",
    };
  }, [searchParams]);

  const { data: employeeScheduleData, isLoading: isLoadingSchedule } =
    useGetMySchedulesByDateRangeQuery({
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
    });

  console.log("Schedule:", employeeScheduleData);

  // Helper function to get the current active schedule based on time
  const getCurrentSchedule = () => {
    if (
      !employeeScheduleData ||
      !Array.isArray(employeeScheduleData) ||
      employeeScheduleData.length === 0
    ) {
      return null;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

    // Try to find a schedule where current time is within the time range
    const activeSchedule = employeeScheduleData.find((schedule) => {
      if (!schedule.actual_start_time || !schedule.actual_end_time)
        return false;

      const [startHour, startMin] = schedule.actual_start_time
        .split(":")
        .map(Number);
      const [endHour, endMin] = schedule.actual_end_time.split(":").map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      return currentTime >= startMinutes && currentTime <= endMinutes;
    });

    // If no active schedule found, return the first one
    return activeSchedule || employeeScheduleData[0];
  };

  const currentSchedule = getCurrentSchedule();
  const currentRoomId = currentSchedule?.room_id;

  //filter order by roomId
  const {
    data: orderData,
    isLoading: isLoadingStudy,
    refetch: refetchStudy,
    error: studyError,
  } = useGetImagingOrderByRoomIdFilterQuery(
    {
      id: currentRoomId || "",
      filterParams: {
        modalityId: initial.modalityId || undefined,
        orderStatus: initial.orderStatus
          ? (initial.orderStatus as ImagingOrderStatus)
          : undefined,
        bodyPart: initial.bodyPart || undefined,
        mrn: initial.mrn || undefined,
        patientFirstName: initial.patientFirstName || undefined,
        patientLastName: initial.patientLastName || undefined,
        procedureId: initial.procedureId || undefined,
      },
    },
    {
      skip: isLoadingSchedule || !currentRoomId,
    }
  );

  if (isLoadingSchedule) {
    return <Loading />;
  }

  if (!employeeScheduleData || employeeScheduleData.length === 0) {
    return <>No working schedule yet</>;
  }

  if (!currentRoomId) {
    return <>No room assigned to your schedule yet</>;
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <CurrentStatus></CurrentStatus>
      <FilterBar
        onRefetch={refetchStudy}
        caseNumber={(orderData?.data || []).length}
        maxCases={(orderData?.data || []).length}
      />
      <DataTable
        orders={orderData?.data || []}
        isLoading={isLoadingStudy}
        refetch={refetchStudy}
        error={!!studyError}
      />
    </div>
  );
}
