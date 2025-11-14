import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EncounterType } from "@/enums/patient-workflow.enum";
import { useCreatePatientEncounterMutation } from "@/store/patientEncounterApi";

import { Stethoscope, CheckCircle } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import React from "react";
import Select from "react-select";
import type { SingleValue } from "react-select";
import Cookies from "js-cookie";
import { useGetDepartmentsQuery } from "@/store/departmentApi";
import { Department } from "@/interfaces/user/department.interface";
import { User } from "@/store/scheduleApi";
import {
  useGetRoomsByDepartmentAndServiceQuery,
  useGetRoomsByDepartmentIdQuery,
} from "@/store/roomsApi";
import { useGetUsersByRoomQuery } from "@/store/userApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Roles } from "@/enums/user.enum";
import { useGetActiveServicesByDepartmentIdQuery } from "@/store/serviceApi";
import { Services } from "@/interfaces/user/service.interface";
import { Room } from "@/interfaces/user/room.interface";

type DepartmentOption = Department & { value: string; label: string };

export function PatientForward({ patientId }: { patientId: string }) {
  const router = useRouter();
  //states
  const [encounterInfo, setEncounterInfo] = useState({
    patientId: patientId,
    encounterDate: "",
    encounterType: EncounterType.INPATIENT,
    assignedPhysicianId: null,
    notes: "",
  });

  const [queueInfo, setQueueInfo] = useState({
    encounterId: "",
    roomId: "",
    priorityReason: "",
    createdBy: "",
  });

  const [departmentSearch, setDepartmentSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [selectedService, setSelectedService] = useState<Services | null>(null);
  const [rooms, setRooms] = useState<Room[] | []>();
  const [roomSearch, setRoomSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  //on changes
  const onChangeEncounterInfo = (
    field:
      | "patientId"
      | "encounterDate "
      | "assignedPhysicianId"
      | "notes"
      | "encounterType",
    value: string
  ) => {
    setEncounterInfo({ ...encounterInfo, [field]: value });
  };

  //RTK hook
  const {
    data: departmentsData,
    isLoading: isLoadingDepartment,
    refetch: refetchDepartment,
  } = useGetDepartmentsQuery({
    name: departmentSearch || undefined,
  });

  const {
    data: ServicesData,
    isLoading: isLoadingServices,
    refetch: refetchServices,
  } = useGetActiveServicesByDepartmentIdQuery(selectedDepartment?.id || "", {
    skip: !selectedDepartment?.id,
  });

  const {
    data: RoomData,
    isLoading: isLoadingRoom,
    refetch: refetchRoom,
  } = useGetRoomsByDepartmentAndServiceQuery(
    {
      serviceId: selectedService?.id ?? "",
      departmentId: selectedDepartment?.id ?? "",
      role: Roles.PHYSICIAN,
    },
    { skip: !selectedService?.id || !selectedDepartment?.id }
  );
  const [createEncounter] = useCreatePatientEncounterMutation();

  // console.log("roomData.data:", RoomData?.data);
  useEffect(() => {
    if (!departmentsData && !isLoadingDepartment) {
      refetchDepartment();
    }

    setSelectedRoom(null);
  }, [
    departmentSearch,
    departmentsData,
    isLoadingDepartment,
    refetchDepartment,
    refetchServices,
  ]);

  // Transform departments data for react-select
  const departmentOptions: DepartmentOption[] =
    departmentsData?.data.map((dept) => ({
      value: dept.id,
      label: dept.departmentName,
      ...dept,
    })) || [];

  //submit
  const onSubmit = async () => {
    let encounter;
    try {
      const encounterData = {
        ...encounterInfo,
        encounterDate: new Date().toISOString(),
      };
      encounter = await createEncounter(encounterData).unwrap();

      if (encounter) {
        toast.success("Forward patient successfully");

        router.push(`/reception/queue-paper/1`); //dummy, fix when fix encounter id

        // router.push(
        //   `/reception/queue-paper/${queue.data.id}?doctor=${encounter.data.assignedPhysicianId}`
        // );
      }
    } catch (err) {
      toast.error("Failed to forward patient");
    }
  };

  const EncounterTypeArray = [...Object.values(EncounterType)];
  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground flex items-center">
          <Stethoscope className="w-5 h-5 mr-2" />
          Forward Patient
        </CardTitle>
        <CardDescription>
          Quick selection of specialty or physician
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Select Department
            </label>
            <Select
              className="basic-single"
              classNamePrefix="select"
              value={
                selectedDepartment
                  ? ({
                      value: selectedDepartment.id,
                      label: selectedDepartment.departmentName,
                      ...selectedDepartment,
                    } as DepartmentOption)
                  : null
              }
              onChange={(selectedOption: SingleValue<DepartmentOption>) => {
                setSelectedDepartment(
                  selectedOption ? ({ ...selectedOption } as Department) : null
                );
              }}
              onInputChange={(inputValue) => {
                setDepartmentSearch(inputValue);
              }}
              isLoading={isLoadingDepartment}
              options={departmentOptions}
              placeholder="Search and select department..."
              isClearable
              isSearchable
            />
          </div>

          <div className="space-y-2 ">
            <label className="text-sm font-medium text-foreground">
              Select Service
            </label>
            {isLoadingServices && (
              <div className="text-foreground text-sm">Loading services...</div>
            )}

            {!isLoadingServices &&
              ServicesData &&
              Array.isArray(ServicesData?.data) &&
              ServicesData?.data?.length > 0 && (
                <div className="grid grid-cols-1 gap-3 max-h-20 overflow-y-auto">
                  {(ServicesData?.data as Services[]).map(
                    (service, idx, arr) => {
                      const isSelected = selectedService?.id === service.id;

                      return (
                        <button
                          key={service.id}
                          onClick={() => {
                            setSelectedService(service);
                          }}
                          type="button"
                          aria-pressed={isSelected}
                          className={`p-4 border rounded-lg text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 hover:shadow-sm ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                              : "border-border bg-background hover:border-muted"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              {service.serviceName}
                            </h3>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Select Room
            </label>
            {isLoadingRoom && (
              <div className="text-foreground text-sm">Loading rooms...</div>
            )}
            {!isLoadingRoom &&
              RoomData &&
              Array.isArray(RoomData?.data) &&
              RoomData?.data?.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                  {RoomData.data.map((room) => {
                    {
                      /* CHANGE: Calculate room utilization percentage */
                    }
                    const maxCapacity =
                      room.roomStats?.maxWaiting || room.capacity || 1;
                    const currentOccupancy =
                      room.roomStats?.currentInProgress || 0;
                    const utilizationPercent = Math.min(
                      (currentOccupancy / maxCapacity) * 100,
                      100
                    );

                    {
                      /* CHANGE: Determine color based on utilization */
                    }
                    const getUtilizationColor = (percent: number) => {
                      if (percent >= 90) return "bg-red-500";
                      if (percent >= 70) return "bg-yellow-500";
                      if (percent >= 40) return "bg-blue-500";
                      return "bg-green-500";
                    };

                    return (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        type="button"
                        className={`p-4 border rounded-lg text-left transition-all ${
                          selectedRoom?.id === room.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                            : "border-border bg-background hover:border-muted"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {room.roomCode}
                          </h3>
                          {/* CHANGE: Display current occupancy numbers */}
                          <span className="text-sm text-muted-foreground">
                            {currentOccupancy}/{maxCapacity}
                          </span>
                        </div>

                        {/* CHANGE: Add progress bar to show room utilization */}
                        <div className="space-y-1">
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${getUtilizationColor(
                                utilizationPercent
                              )}`}
                              style={{ width: `${utilizationPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {utilizationPercent.toFixed(0)}% utilized
                            </span>
                            <span
                              className={
                                utilizationPercent >= 90
                                  ? "text-red-500 font-medium"
                                  : ""
                              }
                            >
                              {utilizationPercent >= 90
                                ? "Near capacity"
                                : utilizationPercent >= 70
                                ? "Busy"
                                : utilizationPercent >= 40
                                ? "Moderate"
                                : "Available"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Encounter Type
            </label>
            <div className="flex items-center space-x-2 max-w-[30vw] overflow-x-auto whitespace-nowrap snap-x snap-mandatory pb-1">
              {EncounterTypeArray &&
                EncounterTypeArray.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    aria-pressed={encounterInfo.encounterType === type}
                    size="sm"
                    className={`shrink-0 snap-start ${
                      encounterInfo.encounterType === type
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                    variant={
                      encounterInfo.encounterType === type
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      onChangeEncounterInfo("encounterType", type);
                    }}
                  >
                    {type}
                  </Button>
                ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Notes (Optional)
            </label>
            <textarea
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                onChangeEncounterInfo("notes", e.target.value);
              }}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Add any symptoms or intake notes..."
            />
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={onSubmit}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Forward Patient
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
