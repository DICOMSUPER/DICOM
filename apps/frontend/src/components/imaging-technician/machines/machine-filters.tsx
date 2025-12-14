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
import { extractApiData } from "@/common/utils/api";
import { MachineStatus } from "@/common/enums/machine-status.enum";

export interface MachineFilters {
  machineName?: string;
  manufacturer?: string;
  serialNumber?: string;
  model?: string;
  modalityId?: string;
  status?: MachineStatus;
}

interface MachineFiltersSectionProps {
  filters: MachineFilters;
  onFiltersChange: (filters: MachineFilters) => void;
  onReset: () => void;
  isSearching?: boolean;
}

export function MachineFiltersSection({
  filters,
  onFiltersChange,
  onReset,
  isSearching = false,
}: MachineFiltersSectionProps) {
  const [searchInputs, setSearchInputs] = useState({
    machineName: filters.machineName || "",
    manufacturer: filters.manufacturer || "",
    serialNumber: filters.serialNumber || "",
    model: filters.model || "",
  });

  const { data: modalitiesData } = useGetAllImagingModalityQuery();
  const modalities = extractApiData(modalitiesData);

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
      machineName: searchInputs.machineName || undefined,
      manufacturer: searchInputs.manufacturer || undefined,
      serialNumber: searchInputs.serialNumber || undefined,
      model: searchInputs.model || undefined,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectChange = (key: keyof MachineFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? undefined : value,
    });
  };

  const handleReset = () => {
    setSearchInputs({
      machineName: "",
      manufacturer: "",
      serialNumber: "",
      model: "",
    });
    onReset();
  };

  return (
    <div className="border-border mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="Machine Name..."
              value={searchInputs.machineName}
              onChange={(e) => handleInputChange("machineName", e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="Manufacturer..."
              value={searchInputs.manufacturer}
              onChange={(e) => handleInputChange("manufacturer", e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="Serial Number..."
              value={searchInputs.serialNumber}
              onChange={(e) => handleInputChange("serialNumber", e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="Model..."
              value={searchInputs.model}
              onChange={(e) => handleInputChange("model", e.target.value)}
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
            value={filters.status || "all"}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={MachineStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={MachineStatus.INACTIVE}>Inactive</SelectItem>
              <SelectItem value={MachineStatus.MAINTENANCE}>
                Maintenance
              </SelectItem>
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

