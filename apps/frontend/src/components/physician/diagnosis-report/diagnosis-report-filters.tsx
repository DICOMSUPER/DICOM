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
import {
  DiagnosisStatus,
  DiagnosisType,
} from "@/enums/patient-workflow.enum";
import { FilterDiagnosesReport } from "@/interfaces/patient/diagnosis-report.interface";

interface DiagnosisReportFiltersSectionProps {
  filters: FilterDiagnosesReport;
  onFiltersChange: (filters: FilterDiagnosesReport) => void;
  onReset: () => void;
  isSearching?: boolean;
}

export function DiagnosisReportFiltersSection({
  filters,
  onFiltersChange,
  onReset,
  isSearching = false,
}: DiagnosisReportFiltersSectionProps) {
  const [searchInputs, setSearchInputs] = useState({
    patientName: filters.patientName || "",
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
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectChange = (
    key: keyof FilterDiagnosesReport,
    value: string
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? "" : value,
    });
  };

  const handleReset = () => {
    setSearchInputs({
      patientName: "",
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
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Status</SelectItem>
              {/* <SelectItem value={DiagnosisStatus.DRAFT}>Active</SelectItem> */}
              <SelectItem value={DiagnosisStatus.REJECTED}>Rejected</SelectItem>
              <SelectItem value={DiagnosisStatus.APPROVED}>Approved</SelectItem>
              <SelectItem value={DiagnosisStatus.PENDING_APPROVAL}>Ruled Out</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.diagnosisType || "all"}
            onValueChange={(value) => handleSelectChange("diagnosisType", value)}
          >
            <SelectTrigger className="w-48 h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={DiagnosisType.DIFFERENTIAL}>Differential</SelectItem>
              <SelectItem value={DiagnosisType.PRIMARY}>Primary</SelectItem>
              <SelectItem value={DiagnosisType.PROVISIONAL}>Provisional</SelectItem>
              <SelectItem value={DiagnosisType.FINAL}>Final</SelectItem>
              <SelectItem value={DiagnosisType.SECONDARY}>Secondary</SelectItem>
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
