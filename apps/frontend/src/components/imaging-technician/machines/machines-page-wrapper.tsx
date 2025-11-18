"use client";
import { useGetCurrentEmployeeRoomAssignmentQuery } from "@/store/employeeRoomAssignmentApi";
import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import {
  useGetAllModalityMachineQuery,
  useUpdateModalityMachineMutation,
} from "@/store/modalityMachineApi";
import MachineDataTable from "./machine-data-table";
import { useSearchParams } from "next/navigation";
import MachineFilterBar from "./machine-filter-bar";
import { MachineStatus } from "@/enums/machine-status.enum";
import { toast } from "sonner";

export default function MachinePageWrapper() {
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState<string | null>(null);
  const initial = useMemo<{
    machineName: string;
    modalityId: string;
    manufacturer: string;
    status?: MachineStatus;
    serialNumber: string;
    model: string;
  }>(() => {
    const p = new URLSearchParams(searchParams.toString());
    const statusParam = p.get("status");
    const status: MachineStatus | undefined =
      statusParam &&
      (Object.values(MachineStatus) as string[]).includes(statusParam)
        ? (statusParam as MachineStatus)
        : undefined;
    return {
      machineName: p.get("machineName") ?? "",
      modalityId: p.get("modalityId") ?? "",
      manufacturer: p.get("manufacturer") ?? "",
      status,
      serialNumber: p.get("serialNumber") ?? "",
      model: p.get("model") ?? "",
    };
  }, [searchParams]);

  // Parse user from cookies - must be done before hooks
  useEffect(() => {
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

  //get roomId
  const { data: currentEmployeeSchedule } =
    useGetCurrentEmployeeRoomAssignmentQuery(userId || "", { skip: !userId });

  // Extract roomId from the response: data.roomSchedule.room_id
  const currentRoomId =
    currentEmployeeSchedule?.data?.roomSchedule?.room_id || null;

  const {
    data: modalityMachinesData,
    isLoading: isLoadingModalityMachines,
    error: modalityMachinesError,
    refetch: refetchMachines,
  } = useGetAllModalityMachineQuery(
    {
      roomId: currentRoomId as string,
      machineName: initial.machineName,
      manufacturer: initial.manufacturer,
      modalityId: initial.modalityId,
      model: initial.model,
      serialNumber: initial.serialNumber,
      status: initial.status,
    },
    { skip: !currentRoomId }
  );

  const [updateMachine] = useUpdateModalityMachineMutation();

  const updateMachineStatus = async (id: string, status: MachineStatus) => {
    try {
      await updateMachine({ id, data: { status } }).unwrap();
      toast.success("Machine updated successful");
      refetchMachines();
    } catch {
      toast.error("Failed to update machine");
    }
  };
  const machines = modalityMachinesData?.data || [];

  return (
    <>
      <MachineFilterBar
        onRefetch={refetchMachines}
        maxMachines={1}
        machineNumber={1}
      />
      <MachineDataTable
        machines={machines}
        isLoading={isLoadingModalityMachines}
        error={modalityMachinesError}
        onUpdateStatus={updateMachineStatus}
      />
    </>
  );
}
