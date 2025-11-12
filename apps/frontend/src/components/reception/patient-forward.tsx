import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EncounterType } from "@/enums/patient-workflow.enum";
import {
  useCreatePatientEncounterMutation,
  useDeletePatientEncounterMutation,
} from "@/store/patientEncounterApi";
import {
  useCreateQueueAssignmentMutation,
  useDeleteQueueAssignmentMutation,
} from "@/store/queueAssignmentApi";
import { Stethoscope, CheckCircle } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import React from "react";
import Select from "react-select";
import type { SingleValue } from "react-select";
import Cookies from "js-cookie";
import { useGetDepartmentsQuery } from "@/store/departmentApi";
import { Department } from "@/interfaces/user/department.interface";
import { Room, User } from "@/store/scheduleApi";
import { useGetRoomsByDepartmentIdQuery } from "@/store/roomsApi";
import { useGetUsersByRoomQuery } from "@/store/userApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Roles } from "@/enums/user.enum";

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
    priority: QueuePriorityLevel.ROUTINE,
    roomId: "",
    priorityReason: "",
    createdBy: "",
  });

  const [departmentSearch, setDepartmentSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
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
    data: roomData,
    isLoading: isLoadingRoom,
    refetch: refetchRooms,
  } = useGetRoomsByDepartmentIdQuery(
    {
      id: selectedDepartment?.id || "",
      search: roomSearch,
      applyScheduleFilter: true,
      role: Roles.PHYSICIAN,
    },
    {
      skip: !selectedDepartment?.id,
    }
  );

  // const {
  //   data: physicians,
  //   isLoading: isLoadingPhysicians,
  //   refetch: refetchPhysicians,
  // } = useGetUsersByRoomQuery(
  //   { roomId: selectedRoom?.id || "", role: "physician", search: "" },
  //   {
  //     skip: !selectedRoom?.id,
  //   }
  // );

  const [createEncounter] = useCreatePatientEncounterMutation();
  const [createQueueAssignment] = useCreateQueueAssignmentMutation();
  const [deleteEncounter] = useDeletePatientEncounterMutation();
  const [deleteQueueAssignment] = useDeleteQueueAssignmentMutation();

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
    refetchRooms,
  ]);

  // Transform departments data for react-select
  const departmentOptions: DepartmentOption[] =
    departmentsData?.data.map((dept) => ({
      value: dept.id,
      label: dept.departmentName,
      ...dept,
    })) || [];

  const roomOptions = roomData?.data.map((room) => ({
    value: room.id,
    label: room.roomCode,
    ...room,
  }));
  //submit
  const onSubmit = async () => {
    let encounter;
    let queue;
    try {
      const encounterData = {
        ...encounterInfo,
        encounterDate: new Date().toISOString(),
      };
      encounter = await createEncounter(encounterData).unwrap();

      if (encounter) {
        const userRaw = Cookies.get("user");
        const user = userRaw ? JSON.parse(userRaw) : null;
        if (!user) throw new Error("User session not found");

        const queueData = {
          ...queueInfo,
          roomId: queueInfo.roomId,
          encounterId: encounter?.data.id,
          createdBy: user.id,
        };

        queue = await createQueueAssignment(queueData).unwrap();

        toast.success("Forward patient successfully");

        router.push(`/reception/queue-paper/${queue.data.id}`);

        // router.push(
        //   `/reception/queue-paper/${queue.data.id}?doctor=${encounter.data.assignedPhysicianId}`
        // );
      }
    } catch (err) {
      if (encounter && encounter.data.id)
        await deleteEncounter(encounter.data.id);
      if (queue && queue.data.id) await deleteQueueAssignment(queue.data.id);
      window.alert("Internal server error");
      console.log(err);
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

          <div className="space-y-2 h-[50vh] overflow-y-auto">
            <label className="text-sm font-medium text-foreground">
              Select Room
            </label>
            {isLoadingRoom && (
              <div className="text-foreground text-sm">Loading rooms...</div>
            )}

            {!isLoadingRoom &&
              (!roomData?.data.length || roomData.data.length === 0) && (
                <div className="text-foreground text-sm">
                  No room available in this department.
                </div>
              )}

            {!isLoadingRoom &&
              roomData &&
              Array.isArray(roomData.data) &&
              roomData.data.length > 0 && (
                <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                  {(roomData.data as Room[]).map((room, idx, arr) => {
                    const isSelected = queueInfo.roomId === room.id;

                    // calculate queue percentage based on queueStats
                    const currentQueue =
                      room?.queueStats?.currentInProgress?.queueNumber || 0;
                    const maxQueue =
                      room?.queueStats?.maxWaiting?.queueNumber || 0;
                    const queuePercentage =
                      maxQueue > 0 ? (currentQueue / maxQueue) * 100 : 0;
                    return (
                      <button
                        key={room.id}
                        onClick={() => {
                          setQueueInfo({
                            ...queueInfo,
                            roomId: room.id,
                          });
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
                            Room {room.roomCode}
                          </h3>
                        </div>

                        <div className="flex justify-between items-end text-sm">
                          <div>
                            <span className="text-foreground">Current: </span>
                            <span className="font-semibold text-foreground">
                              {currentQueue}
                            </span>
                          </div>
                          <div>
                            <span className="text-foreground">Max: </span>
                            <span className="font-semibold text-foreground">
                              {maxQueue}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 w-full bg-muted/60 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              queuePercentage > 80
                                ? "bg-red-500"
                                : queuePercentage > 50
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${queuePercentage}%` }}
                          />
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
