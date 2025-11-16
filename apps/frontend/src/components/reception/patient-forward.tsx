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

import { Stethoscope, CheckCircle, AlertCircle, Users } from "lucide-react";
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
import StepIndicator from "./patient/forward/step-indicator";
import ServiceSelection from "./patient/forward/service-selection";
import RoomSelection from "./patient/forward/room-selection";

type DepartmentOption = Department & { value: string; label: string };

export function PatientForward({ patientId }: { patientId: string }) {
  const router = useRouter();
  //states
  const [encounterInfo, setEncounterInfo] = useState({
    patientId: patientId,
    encounterDate: "",
    encounterType: EncounterType.INPATIENT,
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
  const isFormValid = selectedDepartment && selectedService && selectedRoom;

  const EncounterTypeArray = [...Object.values(EncounterType)];

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground flex items-center">
          <Stethoscope className="w-5 h-5 mr-2" />
          Forward Patient
        </CardTitle>
        <CardDescription>
          Select department, service, and room to forward the patient
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Step indicator */}
          <StepIndicator
            selectedDepartment={selectedDepartment}
            selectedService={selectedService}
            selectedRoom={selectedRoom}
          />

          {/* Department Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                1
              </span>
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
                setSelectedService(null);
                setSelectedRoom(null);
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Encounter Type
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {EncounterTypeArray &&
                EncounterTypeArray.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    aria-pressed={encounterInfo.encounterType === type}
                    size="sm"
                    className={`${
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

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Notes (Optional)
            </label>
            <textarea
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                onChangeEncounterInfo("notes", e.target.value);
              }}
              value={encounterInfo.notes}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              placeholder="Add any symptoms or intake notes..."
            />
          </div>

          {/* Submit Button */}
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Forwarding...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Forward Patient
              </>
            )}
          </Button>

          {!isFormValid && (
            <p className="text-xs text-foreground text-center">
              Please complete all required selections to forward the patient
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
