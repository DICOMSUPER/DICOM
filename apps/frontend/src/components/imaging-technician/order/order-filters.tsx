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
import { extractApiData } from "@/utils/api";
import { ImagingOrderStatus } from "@/enums/image-dicom.enum";

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

  const { data: modalitiesData } = useGetAllImagingModalityQuery();
  const modalities = extractApiData(modalitiesData);

  const { data: proceduresData, isLoading: isLoadingProcedures } =
    useGetAllRequestProceduresQuery();
  const procedures = extractApiData(proceduresData);

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
    onFiltersChange({
      ...filters,
      patientFirstName: searchInputs.patientFirstName || undefined,
      patientLastName: searchInputs.patientLastName || undefined,
      mrn: searchInputs.mrn || undefined,
      bodyPart: searchInputs.bodyPart || undefined,
    });
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
    onReset();
  };

  const orderStatusArray = Object.values(ImagingOrderStatus);

  return (
    <div className="border-border mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="Patient First Name..."
              value={searchInputs.patientFirstName}
              onChange={(e) =>
                handleInputChange("patientFirstName", e.target.value)
              }
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="Patient Last Name..."
              value={searchInputs.patientLastName}
              onChange={(e) =>
                handleInputChange("patientLastName", e.target.value)
              }
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="MRN..."
              value={searchInputs.mrn}
              onChange={(e) => handleInputChange("mrn", e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="Body Part..."
              value={searchInputs.bodyPart}
              onChange={(e) => handleInputChange("bodyPart", e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.modalityId || "all"}
            onValueChange={(value) => handleSelectChange("modalityId", value)}
          >
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="All Modalities" />
            </SelectTrigger>
            <SelectContent className="border-border">
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
          <Select
            value={filters.orderStatus || "all"}
            onValueChange={(value) => handleSelectChange("orderStatus", value)}
          >
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Status</SelectItem>
              {orderStatusArray.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, " ").replace(/\b\w/g, (l) =>
                    l.toUpperCase()
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.procedureId || "all"}
            onValueChange={(value) => handleSelectChange("procedureId", value)}
            disabled={isLoadingProcedures}
          >
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="All Procedures" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Procedures</SelectItem>
              {procedures.map((procedure) => (
                <SelectItem key={procedure.id} value={procedure.id}>
                  {procedure.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleReset}
            className="whitespace-nowrap h-9 px-4"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="h-9 px-4"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}

