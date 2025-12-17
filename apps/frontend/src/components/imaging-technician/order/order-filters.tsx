import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useGetAllImagingModalityQuery } from "@/store/imagingModalityApi";
import { useGetAllRequestProceduresQuery } from "@/store/requestProcedureAPi";
import { extractApiData } from "@/common/utils/api";
import { ImagingOrderStatus } from "@/common/enums/image-dicom.enum";
import DatePickerDropdown from "@/components/radiologist/date-picker";
import { Label } from "@/components/ui/label";
import { RequestProcedure } from "@/common/interfaces/image-dicom/request-procedure.interface";
import { ImagingModality } from "@/common/interfaces/image-dicom/imaging_modality.interface";

export interface ImagingOrderFilters {
  patientFirstName?: string;
  patientLastName?: string;
  mrn?: string;
  bodyPart?: string;
  modalityId?: string;
  orderStatus?: string;
  procedureId?: string;
  startDate?: string;
  endDate?: string;
}

interface OrderFiltersSectionProps {
  filters: ImagingOrderFilters;
  onFiltersChange: (filters: ImagingOrderFilters) => void;
  onReset: () => void;
  isSearching?: boolean;
}

export function OrderFiltersSection({
  filters,
  onFiltersChange,
  onReset,
  isSearching = false,
}: OrderFiltersSectionProps) {
  const [searchInputs, setSearchInputs] = useState({
    patientFirstName: filters.patientFirstName || "",
    patientLastName: filters.patientLastName || "",
    mrn: filters.mrn || "",
    bodyPart: filters.bodyPart || "",
  });
  const [localStartDate, setLocalStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [localEndDate, setLocalEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );

  const { data: modalitiesData } = useGetAllImagingModalityQuery();
  const modalities: ImagingModality[] = extractApiData(modalitiesData);

  const { data: proceduresData, isLoading: isLoadingProcedures } =
    useGetAllRequestProceduresQuery();
  const procedures: RequestProcedure[] = extractApiData(proceduresData);

  const handleInputChange = (
    field: keyof typeof searchInputs,
    value: string
  ) => {
    setSearchInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    let startDateISO = localStartDate
      ? localStartDate.toISOString()
      : undefined;
    let endDateISO = localEndDate ? localEndDate.toISOString() : undefined;
    // If endDate is before startDate, clear endDate
    if (
      startDateISO &&
      endDateISO &&
      localEndDate &&
      localStartDate &&
      localEndDate < localStartDate
    ) {
      endDateISO = undefined;
      setLocalEndDate(undefined);
    }
    onFiltersChange({
      ...filters,
      patientFirstName: searchInputs.patientFirstName || undefined,
      patientLastName: searchInputs.patientLastName || undefined,
      mrn: searchInputs.mrn || undefined,
      bodyPart: searchInputs.bodyPart || undefined,
      startDate: startDateISO,
      endDate: endDateISO,
    });
  };

  // Date change handlers (local only)
  const handleStartDateChange = (date: Date | undefined) => {
    setLocalStartDate(date);
    // If endDate is before new startDate, clear endDate
    if (date && localEndDate && localEndDate < date) {
      setLocalEndDate(undefined);
    }
  };
  const handleEndDateChange = (date: Date | undefined) => {
    setLocalEndDate(date);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectChange = (
    key: keyof ImagingOrderFilters,
    value: string
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? undefined : value,
    });
  };

  const handleReset = () => {
    setSearchInputs({
      patientFirstName: "",
      patientLastName: "",
      mrn: "",
      bodyPart: "",
    });
    setLocalStartDate(undefined);
    setLocalEndDate(undefined);
    onReset();
  };

  const orderStatusArray = Object.values(ImagingOrderStatus);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6 space-y-4">
      {/* Row 1: First Name, Last Name, MRN, Body Part, Modality */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">
            First Name
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="First Name"
              value={searchInputs.patientFirstName}
              onChange={(e) =>
                handleInputChange("patientFirstName", e.target.value)
              }
              onKeyPress={handleKeyPress}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">Last Name</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Last Name"
              value={searchInputs.patientLastName}
              onChange={(e) =>
                handleInputChange("patientLastName", e.target.value)
              }
              onKeyPress={handleKeyPress}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">MRN</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="MRN"
              value={searchInputs.mrn}
              onChange={(e) => handleInputChange("mrn", e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">Body Part</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Body Part"
              value={searchInputs.bodyPart}
              onChange={(e) => handleInputChange("bodyPart", e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">Modality</Label>
          <Select
            value={filters.modalityId || "all"}
            onValueChange={(value) => handleSelectChange("modalityId", value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Modalities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modalities</SelectItem>
              {modalities
                .filter((m) => m.isActive)
                .map((modality) => (
                  <SelectItem key={modality.id} value={modality.id}>
                    {modality.modalityName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Status, Procedure, Start Date, End Date, Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">Status</Label>
          <Select
            value={filters.orderStatus || "all"}
            onValueChange={(value) => handleSelectChange("orderStatus", value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {orderStatusArray.map((status) => (
                <SelectItem key={status} value={status}>
                  {status
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">Procedure</Label>
          <Select
            value={filters.procedureId || "all"}
            onValueChange={(value) => handleSelectChange("procedureId", value)}
            disabled={isLoadingProcedures}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Procedures" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Procedures</SelectItem>
              {procedures.map((procedure) => (
                <SelectItem key={procedure?.id} value={procedure?.id}>
                  {procedure?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">
            Start Date
          </Label>
          <DatePickerDropdown
            date={localStartDate}
            onSelect={handleStartDateChange}
            placeholder="Start date"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">End Date</Label>
          <DatePickerDropdown
            date={localEndDate}
            onSelect={handleEndDateChange}
            placeholder="End date"
            disabled={(date) =>
              localStartDate ? date.getTime() < localStartDate.getTime() : false
            }
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="h-9 px-3 flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Reset
          </Button>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="h-9 px-3 flex-1"
          >
            <Search className="h-4 w-4 mr-1.5" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
