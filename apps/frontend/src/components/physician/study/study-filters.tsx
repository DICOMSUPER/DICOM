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
import { DicomStudyFilters } from "@/interfaces/image-dicom/dicom-study.interface";
import { RotateCcw, Search } from "lucide-react";
import { useState } from "react";

interface DicomStudyFiltersSectionProps {
  filters: DicomStudyFilters;
  onFiltersChange: (filters: DicomStudyFilters) => void;
  onReset: () => void;
  isSearching?: boolean;
}

export function DicomStudyFiltersSection({
  filters,
  onFiltersChange,
  onReset,
  isSearching = false,
}: DicomStudyFiltersSectionProps) {
  const [searchInputs, setSearchInputs] = useState({
    patientName: filters.patientName || "",
    orderId: filters.orderId || "",
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
      orderId: searchInputs.orderId || "",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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

  const handleReset = () => {
    setSearchInputs({
      patientName: "",
      orderId: "",
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="Order ID"
              value={searchInputs.orderId}
              onChange={(e) => handleInputChange("orderId", e.target.value)}
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
              <SelectItem value={DicomStudyStatus.PENDING_APPROVAL}>
                Pending Approval
              </SelectItem>
              <SelectItem value={DicomStudyStatus.APPROVED}>Approved</SelectItem>
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
