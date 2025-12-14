import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginatedQuery } from "@/common/interfaces/pagination/pagination.interface";
import { RotateCcw, Search } from "lucide-react";
import { useState } from "react";


interface ServiceFiltersSectionProps {
  filters: PaginatedQuery;
  onFiltersChange: (filters: PaginatedQuery) => void;
  onReset: () => void;
  onSearch?: () => void;
  isSearching?: boolean;
}

export function ServiceFiltersSection({
  filters,
  onFiltersChange,
  onReset,
  onSearch,
  isSearching = false,
}: ServiceFiltersSectionProps) {
  const [searchInputs, setSearchInputs] = useState({
    search: filters.search || "",
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
      search: searchInputs.search || "",
      page: 1,
    });
    if (onSearch) {
      onSearch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
              placeholder="Search by service name..."
              value={searchInputs.search}
              onChange={(e) => handleInputChange("search", e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
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
