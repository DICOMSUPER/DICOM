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
import { useEffect, useState } from "react";
import { PatientEncounterFilters } from "@/interfaces/patient/patient-visit.interface";
import useDebounce from "@/hooks/useDebounce";
import {
  DiagnosisStatus,
  DiagnosisType,
  EncounterStatus,
} from "@/enums/patient-workflow.enum";
import { FilterDiagnosesReport } from "@/interfaces/patient/diagnosis-report.interface";

interface DiagnosisReportFiltersSectionProps {
  filters: FilterDiagnosesReport;
  onFiltersChange: (filters: FilterDiagnosesReport) => void;
  onReset: () => void;
}

export function DiagnosisReportFiltersSection({
  filters,
  onFiltersChange,
  onReset,
}: DiagnosisReportFiltersSectionProps) {
  const [searchInputs, setSearchInputs] = useState({
    encounterId: filters.encounterId || "",
    patientName: filters.patientName || "",
  });

  const debouncedEncounterId = useDebounce(searchInputs.encounterId, 500);
  const debouncedPatientName = useDebounce(searchInputs.patientName, 500);

  useEffect(() => {
    onFiltersChange({
      ...filters,
      encounterId: debouncedEncounterId || "",
      patientName: debouncedPatientName || "",
    });
  }, [debouncedEncounterId, debouncedPatientName]);

  const handleInputChange = (
    field: keyof typeof searchInputs,
    value: string
  ) => {
    setSearchInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const handleNumberChange = (value: string) => {
    const num = value === "" ? undefined : parseInt(value);
    onFiltersChange({
      ...filters,
      orderNumber: num,
    });
  };

  const handleReset = () => {
    setSearchInputs({
      encounterId: "",
      patientName: "",
    });
    onReset();
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "page" || key === "limit") return false;
    return value !== undefined && value !== "" && value !== "all";
  }).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
      {/* Row 1: Search Inputs, Status, Priority, Queue Number */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <div className="relative col-span-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search Patient Name"
            name="patientName"
            value={searchInputs.patientName}
            onChange={(e) => handleInputChange("patientName", e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.status || "all"}
          onValueChange={(value) => handleSelectChange("status", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={DiagnosisStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={DiagnosisStatus.RESOLVED}>Resolved</SelectItem>
            <SelectItem value={DiagnosisStatus.INACTIVE}>Inactive</SelectItem>
            <SelectItem value={DiagnosisStatus.RULED_OUT}>Ruled Out</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.diagnosisType || "all"}
          onValueChange={(value) => handleSelectChange("diagnosisType", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Diagnosis Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Diagnosis Types</SelectItem>
            <SelectItem value={DiagnosisType.DIFFERENTIAL}>
              Differential
            </SelectItem>
            <SelectItem value={DiagnosisType.PRIMARY}>Primary</SelectItem>
            <SelectItem value={DiagnosisType.PROVISIONAL}>Provisional</SelectItem>
            <SelectItem value={DiagnosisType.RULE_OUT}>Ruled Out</SelectItem>
            <SelectItem value={DiagnosisType.SECONDARY}>Secondary</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="ghost"
          onClick={handleReset}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
        {activeFiltersCount > 0 && (
          <span className="text-sm text-gray-500">
            {activeFiltersCount}{" "}
            {activeFiltersCount === 1 ? "filter" : "filters"} active
          </span>
        )}
      </div>
    </div>
  );
}
