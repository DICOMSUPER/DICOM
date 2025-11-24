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
} from "@/enums/patient-workflow.enum";
import { useCreatePatientEncounterMutation } from "@/store/patientEncounterApi";

import {
  Stethoscope,
  CheckCircle,
  AlertCircle,
  Users,
  Zap,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import React from "react";
import Select from "react-select";
import type { SingleValue } from "react-select";
import { useGetDepartmentsQuery } from "@/store/departmentApi";
import { Department } from "@/interfaces/user/department.interface";
import { useGetRoomsByDepartmentAndServiceQuery } from "@/store/roomsApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Roles } from "@/enums/user.enum";
import { useGetActiveServicesByDepartmentIdQuery } from "@/store/serviceApi";
import { Services } from "@/interfaces/user/service.interface";
import { Room } from "@/interfaces/user/room.interface";
import { ServiceRoom } from "@/interfaces/user/service-room.interface";
import { StepIndicator } from "@/components/ui/step-indicator";
import ServiceSelection from "./patient/forward/service-selection";
import RoomSelection from "./patient/forward/room-selection";
import DepartmentSelection from "./patient/forward/department-selection";
import EncounterTypeSelection from "./patient/forward/encounter-type-selection";
import PriorityLevelSelection from "./patient/forward/priority-level-selection";
import NoteInput from "./patient/forward/note-input";
import ForwardButton from "./patient/forward/forward-button";

// Format encounter type for display
const formatEncounterType = (type: string): string => {
  return type
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Priority level configurations
const priorityLevelConfig = {
  [EncounterPriorityLevel.ROUTINE]: {
    icon: Clock,
    className: "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100",
    description: "Standard processing time",
  },
  [EncounterPriorityLevel.URGENT]: {
    icon: Zap,
    className:
      "bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100",
    description: "Expedited processing required",
  },
  [EncounterPriorityLevel.STAT]: {
    icon: AlertTriangle,
    className: "bg-red-50 text-red-700 border-red-300 hover:bg-red-100",
    description: "Immediate attention required",
  },
};

type DepartmentOption = Department & { value: string; label: string };

export function PatientForward({ patientId }: { patientId: string }) {
  const router = useRouter();
  //states
  const [encounterInfo, setEncounterInfo] = useState({
    patientId: patientId,
    encounterDate: "",
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

  //on changes
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

  // Transform departments data for react-select
  const departmentOptions: DepartmentOption[] =
    departmentsData?.data.map((dept) => ({
      value: dept.id,
      label: dept.departmentName,
      ...dept,
    })) || [];

  //submit
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

  // Check if form is valid
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
        <div className="space-y-6">
          {/* Step indicator */}
          <StepIndicator
            steps={[
              { completed: !!selectedDepartment },
              { completed: !!selectedService },
              { completed: !!selectedRoom },
            ]}
          />

          {/* Department Selection */}
          <DepartmentSelection
            selectedDepartment={selectedDepartment}
            departmentOptions={departmentOptions}
            departmentSearch={departmentSearch}
            setDepartmentSearch={setDepartmentSearch}
            isLoadingDepartment={isLoadingDepartment}
            setSelectedDepartment={setSelectedDepartment}
            setSelectedService={setSelectedService}
            setSelectedRoom={setSelectedRoom}
          />

          {/* Service Selection */}
          <ServiceSelection
            selectedDepartment={selectedDepartment}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            setSelectedRoom={setSelectedRoom}
            isLoadingServices={isLoadingServices}
            Services={(ServicesData?.data as Services[]) || []}
          />

          {/* Room Selection */}
          <RoomSelection
            selectedService={selectedService}
            selectedRoom={selectedRoom}
            setSelectedRoom={setSelectedRoom}
            rooms={RoomData?.data as Room[]}
            isLoadingRoom={isLoadingRoom}
          />

          {/* Encounter Type */}
          <EncounterTypeSelection
            EncounterTypeArray={EncounterTypeArray}
            encounterInfo={encounterInfo}
            formatEncounterType={formatEncounterType}
            onChangeEncounterInfo={onChangeEncounterInfo}
          />

          {/* Priority Level */}
          <PriorityLevelSelection
            encounterInfo={encounterInfo}
            PriorityLevelArray={PriorityLevelArray}
            onChangeEncounterInfo={onChangeEncounterInfo}
          />

          {/* Notes */}
          <NoteInput
            encounterInfo={encounterInfo}
            onChangeEncounterInfo={onChangeEncounterInfo}
          />

          {/* Submit Button */}
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
