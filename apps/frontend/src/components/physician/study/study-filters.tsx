import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DicomStudyStatus } from "@/enums/image-dicom.enum";
import useDebounce from "@/hooks/useDebounce";
import { DicomStudyFilters } from "@/interfaces/image-dicom/dicom-study.interface";

import { RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface DicomStudyFiltersSectionProps {
  filters: DicomStudyFilters;
  onFiltersChange: (filters: DicomStudyFilters) => void;
  onReset: () => void;
}

export function DicomStudyFiltersSection({
  filters,
  onFiltersChange,
  onReset,
}: DicomStudyFiltersSectionProps) {
  const [searchInputs, setSearchInputs] = useState<DicomStudyFilters>({
    patientName: filters.patientName || "",
    status: filters.status || "all",
    modalityId: filters.modalityId || "",
    orderId: filters.orderId || "",
    // roomName: filters.roomName || "",
  });

  const debouncedPatientName = useDebounce(searchInputs.patientName, 500);
  const debouncedOrderId = useDebounce(searchInputs.orderId, 500);

  // const debouncedRoomName = useDebounce(searchInputs.roomName, 500);

  useEffect(() => {
    onFiltersChange({
      ...filters,

      patientName: debouncedPatientName || "",
      orderId: debouncedOrderId || "",
    });
  }, [debouncedPatientName]);

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
    key: keyof DicomStudyFilters,
    value: string
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? "" : value,
    });
  };

  // const handleNumberChange = (value: string) => {
  //   const num = value === "" ? undefined : parseInt(value);
  //   onFiltersChange({
  //     ...filters,
  //     queueNumber: num,
  //   });
  // };

  const handleReset = () => {
    setSearchInputs({
      patientName: "",
      // roomName: "",
      orderId: "",
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Order ID"
            name="orderId"
            value={searchInputs.orderId}
            onChange={(e) => handleInputChange("orderId", e.target.value)}
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
            <SelectItem value={DicomStudyStatus.PENDING_APPROVAL}>
              Pending Approval
            </SelectItem>
            <SelectItem value={DicomStudyStatus.APPROVED}>Approved</SelectItem>
          </SelectContent>
        </Select>

        {/* <Select
          value={filters.priority || "all"}
          onValueChange={(value) => handleSelectChange("priority", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="Routine">Routine</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
            <SelectItem value="Stat">STAT</SelectItem>
          </SelectContent>
        </Select> */}

        {/* <Input
          type="number"
          placeholder="Order Number"
          value={filters.orderFormNumber || ""}
          onChange={(e) => handleNumberChange(e.target.value)}
          min="0"
        /> */}
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
