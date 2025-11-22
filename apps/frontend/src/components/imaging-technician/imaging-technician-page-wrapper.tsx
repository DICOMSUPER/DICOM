"use client";
import React, { useEffect, useMemo, useState } from "react";
import FilterBar from "./filter-bar";
import DataTable from "./data-table";
import { useSearchParams } from "next/navigation";
import { useGetImagingOrderByRoomIdFilterQuery } from "@/store/imagingOrderApi";
import { useGetCurrentEmployeeRoomAssignmentQuery } from "@/store/employeeRoomAssignmentApi";
import Loading from "../common/Loading";
import { ImagingOrderStatus } from "@/enums/image-dicom.enum";
import CurrentStatus from "./current-status";
import Cookies from "js-cookie";

export default function ImageTechnicianPageWrapper() {
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
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
      startDate: p.get("startDate") ?? "",
      endDate: p.get("endDate") ?? "",
    };
  }, [searchParams]);

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

  // Filter order by roomId
  const {
    data: orderData,
    isLoading: isLoadingStudy,
    refetch: refetchOrder,
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
        startDate: initial.startDate || undefined,
        endDate: initial.endDate || undefined,
      },
    },
    {
      skip: isLoadingCurrentEmployeeSchedule || !currentRoomId,
    }
  );

  // Early returns after all hooks are called
  if (!userId) {
    return <>No user in cookies</>;
  }

  if (isLoadingCurrentEmployeeSchedule) {
    return <Loading />;
  }

  if (!currentEmployeeSchedule?.data?.roomSchedule?.room_id) {
    return <>No working schedule yet</>;
  }

  if (!currentRoomId) {
    return <>No room assigned to your schedule yet</>;
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div>
        {" "}
        {currentRoomId && (
          <CurrentStatus
            roomId={currentRoomId}
            startDate={initial?.startDate}
            endDate={initial?.endDate}
          ></CurrentStatus>
        )}
      </div>
      <FilterBar
        onRefetch={refetchOrder}
        caseNumber={(orderData?.data || []).length}
        maxCases={(orderData?.data || []).length}
      />
      <DataTable
        orders={orderData?.data || []}
        isLoading={isLoadingStudy}
        refetch={refetchOrder}
        error={!!studyError}
      />
    </div>
  );
}
