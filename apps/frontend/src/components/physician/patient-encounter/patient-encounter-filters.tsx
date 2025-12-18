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
import { PatientEncounterFilters } from "@/common/interfaces/patient/patient-visit.interface";
import { EncounterStatus, EncounterPriorityLevel } from "@/common/enums/patient-workflow.enum";

interface PatientEncounterFiltersSectionProps {
  filters: PatientEncounterFilters;
  onFiltersChange: (filters: PatientEncounterFilters) => void;
  onReset: () => void;
  isSearching?: boolean;
}

export function PatientEncounterFiltersSection({
  filters,
  onFiltersChange,
  onReset,
  isSearching = false,
}: PatientEncounterFiltersSectionProps) {
  const [searchInputs, setSearchInputs] = useState({
    patientName: filters.patientName || "",
    orderNumber: filters.orderNumber?.toString() || "",
  });

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
      patientName: searchInputs.patientName || "",
      orderNumber: searchInputs.orderNumber ? parseInt(searchInputs.orderNumber) : undefined,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectChange = (key: keyof PatientEncounterFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? "" : value,
    });
  };

  const handleReset = () => {
    setSearchInputs({
      patientName: "",
      orderNumber: "",
    });
    onReset();
  };

  return (
    <div className="border-border mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="Search by patient name..."
              value={searchInputs.patientName}
              onChange={(e) => handleInputChange("patientName", e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <div className="relative w-32">
            <Input
              type="number"
              placeholder="Number #"
              value={searchInputs.orderNumber}
              onChange={(e) => handleInputChange("orderNumber", e.target.value)}
              onKeyPress={handleKeyPress}
              min="0"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={EncounterStatus.WAITING}>Waiting</SelectItem>
              <SelectItem value={EncounterStatus.ARRIVED}>Arrived</SelectItem>
              <SelectItem value={EncounterStatus.FINISHED}>Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.priority || "all"}
            onValueChange={(value) => handleSelectChange("priority", value)}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value={EncounterPriorityLevel.ROUTINE}>Routine</SelectItem>
              <SelectItem value={EncounterPriorityLevel.URGENT}>Urgent</SelectItem>
              <SelectItem value={EncounterPriorityLevel.STAT}>STAT</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleReset} className="whitespace-nowrap h-9 px-4">
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
