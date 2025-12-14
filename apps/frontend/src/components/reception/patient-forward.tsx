import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EncounterType,
  EncounterPriorityLevel,
} from "@/common/enums/patient-workflow.enum";
import { useCreatePatientEncounterMutation } from "@/store/patientEncounterApi";

import { Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetDepartmentsQuery } from "@/store/departmentApi";
import { Department } from "@/common/interfaces/user/department.interface";
import { useGetRoomsByDepartmentAndServiceQuery } from "@/store/roomsApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Roles } from "@/common/enums/user.enum";
import { useGetActiveServicesByDepartmentIdQuery } from "@/store/serviceApi";
import { Services } from "@/common/interfaces/user/service.interface";
import { Room } from "@/common/interfaces/user/room.interface";
import { ServiceRoom } from "@/common/interfaces/user/service-room.interface";
import { StepIndicator } from "@/components/ui/step-indicator";
import ServiceSelection from "./patient/forward/service-selection";
import RoomSelection from "./patient/forward/room-selection";
import DepartmentSelection from "./patient/forward/department-selection";
import EncounterTypeSelection from "./patient/forward/encounter-type-selection";
import PriorityLevelSelection from "./patient/forward/priority-level-selection";
import NoteInput from "./patient/forward/note-input";
import ForwardButton from "./patient/forward/forward-button";
import { formatISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const formatEncounterType = (type: string): string => {
  return type
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

type DepartmentOption = Department & { value: string; label: string };

export function PatientForward({
  patientId,
  hasFollowUp,
}: {
  patientId: string;
  hasFollowUp: boolean;
}) {
  const router = useRouter();
  const [encounterInfo, setEncounterInfo] = useState({
    patientId: patientId,
    encounterDate: formatISO(toZonedTime(new Date(), "Asia/Ho_Chi_Minh")),
    encounterType: EncounterType.INPATIENT,
    priority: EncounterPriorityLevel.ROUTINE,
    notes: "",
  });

  const [departmentSearch, setDepartmentSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [selectedService, setSelectedService] = useState<Services | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChangeEncounterInfo = (
    field:
      | "patientId"
      | "encounterDate"
      | "assignedPhysicianId"
      | "notes"
      | "encounterType"
      | "priority",
    value: string
  ) => {
    setEncounterInfo({ ...encounterInfo, [field]: value });
  };

  const {
    data: departmentsData,
    isLoading: isLoadingDepartment,
    isError: isDepartmentError,
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

  const { data: RoomData, isLoading: isLoadingRoom } =
    useGetRoomsByDepartmentAndServiceQuery(
      {
        serviceId: selectedService?.id ?? "",
        departmentId: selectedDepartment?.id ?? "",
        role: Roles.PHYSICIAN,
      },
      { skip: !selectedService?.id || !selectedDepartment?.id }
    );
  const [createEncounter] = useCreatePatientEncounterMutation();

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

  const departmentOptions: DepartmentOption[] =
    departmentsData?.data.map((dept) => ({
      value: dept.id,
      label: dept.departmentName,
      ...dept,
    })) || [];

  const onSubmit = async () => {
    if (!selectedRoom || !selectedService) {
      toast.warning("Please select both a room and service");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedServiceRoom = selectedRoom?.serviceRooms.find(
        (serviceRoom: ServiceRoom) =>
          serviceRoom?.serviceId === selectedService?.id
      );

      if (!selectedServiceRoom) {
        toast.warning(
          "Service room not found in selected room for this service"
        );
        setIsSubmitting(false);
        return;
      }

      const encounterData = {
        ...encounterInfo,
        encounterDate: new Date().toISOString(),
        serviceRoomId: selectedServiceRoom?.id as string,
      };

      const encounter = await createEncounter(encounterData).unwrap();

      if (encounter) {
        toast.success("Patient forwarded successfully");
        router.push(`/reception/queue-paper/${encounter.data.id}`);
      }
    } catch {
      toast.error("Failed to forward patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = !!(selectedDepartment && selectedService && selectedRoom);

  const EncounterTypeArray = [...Object.values(EncounterType)];
  const PriorityLevelArray = [...Object.values(EncounterPriorityLevel)];

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground flex items-center">
          <Stethoscope className="w-5 h-5 mr-2" />
          Forward Patient
        </CardTitle>
        <CardDescription>
          Select department, service, room, and set priority for the patient
          encounter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <StepIndicator
            steps={[
              { completed: !!selectedDepartment },
              { completed: !!selectedService },
              { completed: !!selectedRoom },
            ]}
          />

          <DepartmentSelection
            selectedDepartment={selectedDepartment}
            departmentOptions={departmentOptions}
            departmentSearch={departmentSearch}
            setDepartmentSearch={setDepartmentSearch}
            isLoadingDepartment={isLoadingDepartment}
            isError={isDepartmentError}
            setSelectedDepartment={setSelectedDepartment}
            setSelectedService={setSelectedService}
            setSelectedRoom={setSelectedRoom}
          />

          <ServiceSelection
            selectedDepartment={selectedDepartment}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            setSelectedRoom={setSelectedRoom}
            isLoadingServices={isLoadingServices}
            Services={(ServicesData?.data as Services[]) || []}
          />

          <RoomSelection
            selectedService={selectedService}
            selectedRoom={selectedRoom}
            setSelectedRoom={setSelectedRoom}
            rooms={RoomData?.data as Room[]}
            isLoadingRoom={isLoadingRoom}
          />

          <EncounterTypeSelection
            EncounterTypeArray={EncounterTypeArray}
            encounterInfo={encounterInfo}
            formatEncounterType={formatEncounterType}
            onChangeEncounterInfo={onChangeEncounterInfo}
            hasFollowUp={hasFollowUp}
          />

          <PriorityLevelSelection
            encounterInfo={encounterInfo}
            PriorityLevelArray={PriorityLevelArray}
            onChangeEncounterInfo={onChangeEncounterInfo}
          />

          <NoteInput
            encounterInfo={encounterInfo}
            onChangeEncounterInfo={onChangeEncounterInfo}
          />

          <ForwardButton
            encounterInfo={encounterInfo}
            onSubmit={onSubmit}
            isFormValid={isFormValid}
            isSubmitting={isSubmitting}
          />

          {!isFormValid && (
            <p className="text-xs text-gray-600 text-center">
              Please complete all required selections to forward the patient
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
