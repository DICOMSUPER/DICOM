import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useDebounce from "@/hooks/useDebounce";
import { PaginatedQuery } from "@/interfaces/pagination/pagination.interface";
import { RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetAllImagingModalityQuery } from "@/store/imagingModalityApi";
import { extractApiData } from "@/utils/api";
import { MachineStatus } from "@/enums/machine-status.enum";

interface ModalityMachineFiltersSectionProps {
  filters: PaginatedQuery & {
    modalityId?: string;
    status?: string;
  };
  onFiltersChange: (filters: PaginatedQuery & { modalityId?: string; status?: string }) => void;
  onReset: () => void;
}

export function ModalityMachineFiltersSection({
  filters,
  onFiltersChange,
  onReset,
}: ModalityMachineFiltersSectionProps) {
  const [searchInputs, setSearchInputs] = useState({
    search: filters.search || "",
  });

  const { data: modalitiesData } = useGetAllImagingModalityQuery();
  const modalities = extractApiData(modalitiesData);

  const debouncedSearch = useDebounce(searchInputs.search, 500);

  useEffect(() => {
    onFiltersChange({
      ...filters,
      search: debouncedSearch || "",
    });
  }, [debouncedSearch, filters, onFiltersChange]);

  const handleInputChange = (
    field: keyof typeof searchInputs,
    value: string
  ) => {
    setSearchInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleModalityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      modalityId: value === "all" ? undefined : value,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === "all" ? undefined : value,
    });
  };

  const handleReset = () => {
    setSearchInputs({
      search: "",
    });
    onReset();
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "page" || key === "limit") return false;
    return value !== undefined && value !== "" && value !== "all";
  }).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="border-border mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="Search by machine name..."
              value={searchInputs.search}
              onChange={(e) => handleInputChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select
          value={filters.modalityId || "all"}
          onValueChange={handleModalityChange}
        >
          <SelectTrigger className="w-[200px]">
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
        <Select
          value={filters.status || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={MachineStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={MachineStatus.INACTIVE}>Inactive</SelectItem>
            <SelectItem value={MachineStatus.MAINTENANCE}>Maintenance</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleReset} className="whitespace-nowrap h-9 px-4">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

