import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { PaginatedQuery } from "@/interfaces/pagination/pagination.interface";
import { RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface ImagingModalityFiltersSectionProps {
  filters: PaginatedQuery;
  onFiltersChange: (filters: PaginatedQuery) => void;
  onReset: () => void;
}

export function ImagingModalityFiltersSection({
  filters,
  onFiltersChange,
  onReset,
}: ImagingModalityFiltersSectionProps) {
  const [searchInputs, setSearchInputs] = useState({
    search: filters.search || "",
  });

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
              placeholder="Search by modality name or code..."
              value={searchInputs.search}
              onChange={(e) => handleInputChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
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

