import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import React from "react";
import Select from "react-select";
import { Services } from "@/interfaces/user/service.interface";
import { Department } from "@/interfaces/user/department.interface";
import { Room } from "@/interfaces/user/room.interface";

export default function ServiceSelection({
  selectedDepartment,
  selectedService,
  setSelectedService,
  setSelectedRoom,
  isLoadingServices,
  Services,
}: {
  selectedDepartment: Department | null;
  selectedService: Services | null;
  setSelectedService: (service: Services | null) => void;
  setSelectedRoom: (room: Room | null) => void;
  isLoadingServices: boolean;
  Services: Services[];
}) {
  // Transform services data into react-select format
  const serviceOptions =
    Services?.map((service) => ({
      value: service.id,
      label: service.serviceName,
      data: service,
    })) || [];

  // Find the selected option
  const selectedOption = selectedService
    ? serviceOptions.find((opt) => opt.value === selectedService.id)
    : null;

  const handleServiceChange = (option: any) => {
    if (!option) {
      setSelectedService(null);
      setSelectedRoom(null);
      return;
    }

    setSelectedService(option.data);
    setSelectedRoom(null);
  };

  // Minimal custom styles for react-select
  const customStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: "44px",
    }),
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="service-select"
        className="text-sm font-medium text-foreground flex items-center gap-2"
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
          2
        </span>
        Select Service
      </label>

      {!selectedDepartment && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please select a department first</AlertDescription>
        </Alert>
      )}

      {isLoadingServices && (
        <div className="flex items-center gap-2 text-foreground text-sm p-4 border border-border rounded-lg bg-muted/50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Loading services...</span>
        </div>
      )}

      {!isLoadingServices &&
        selectedDepartment &&
        Services &&
        Array.isArray(Services) &&
        Services?.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No services available for this department
            </AlertDescription>
          </Alert>
        )}

      {!isLoadingServices &&
        selectedDepartment &&
        Services &&
        Array.isArray(Services) &&
        Services?.length > 0 && (
          <Select
            inputId="service-select"
            value={selectedOption}
            onChange={handleServiceChange}
            options={serviceOptions}
            isClearable
            isSearchable
            placeholder="-- Select a Service --"
            noOptionsMessage={() => "No services found"}
            styles={customStyles}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        )}
    </div>
  );
}
