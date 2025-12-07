import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useGetImagingModalityPaginatedQuery } from "@/store/imagingModalityApi";
import { useGetBodyPartsPaginatedQuery } from "@/store/bodyPartApi";

interface ReportTemplateFiltersProps {
  filters: {
    modalityId: string;
    bodyPartId: string;
    isPublic: boolean | undefined;
    templateType?: string;
  };
  onApply: (filters: any) => void;
  onClose: () => void;
}

const ReportTemplateFilters = ({
  filters: initialFilters,
  onApply,
  onClose,
}: ReportTemplateFiltersProps) => {
  const [filters, setFilters] = useState(initialFilters);

  const { data: modalitiesData } = useGetImagingModalityPaginatedQuery({
    page: 1,
    limit: 100,
  });

  const { data: bodyPartsData } = useGetBodyPartsPaginatedQuery({
    page: 1,
    limit: 100,
  });

  const handleApply = () => {
    onApply(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      modalityId: "",
      bodyPartId: "",
      isPublic: undefined,
      templateType: initialFilters.templateType,
    };
    setFilters(resetFilters);
    onApply(resetFilters);
  };

  return (
    <Card className="p-6 mb-6 border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Advanced Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Modality Filter */}
        <div className="space-y-2">
          <Label>Modality</Label>
          <Select
            value={filters.modalityId}
            onValueChange={(value) =>
              setFilters({ ...filters, modalityId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All modalities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All modalities</SelectItem>
              {modalitiesData?.data?.map((modality) => (
                <SelectItem key={modality.id} value={modality.id}>
                  {modality.modalityName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Part Filter */}
        <div className="space-y-2">
          <Label>Body Part</Label>
          <Select
            value={filters.bodyPartId}
            onValueChange={(value) =>
              setFilters({ ...filters, bodyPartId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All body parts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All body parts</SelectItem>
              {bodyPartsData?.data?.map((bodyPart) => (
                <SelectItem key={bodyPart.id} value={bodyPart.id}>
                  {bodyPart.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Visibility Filter */}
        <div className="space-y-2">
          <Label>Visibility</Label>
          <Select
            value={
              filters.isPublic === undefined
                ? "all"
                : filters.isPublic
                ? "public"
                : "private"
            }
            onValueChange={(value) =>
              setFilters({
                ...filters,
                isPublic:
                  value === "all" ? undefined : value === "public",
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All templates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All templates</SelectItem>
              <SelectItem value="public">Public only</SelectItem>
              <SelectItem value="private">Private only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button onClick={handleApply}>Apply Filters</Button>
      </div>
    </Card>
  );
};

export default ReportTemplateFilters;