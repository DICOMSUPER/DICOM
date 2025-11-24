"use client";

import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronDown, ArrowLeft } from "lucide-react";
import { useGetAllImagingModalityQuery } from "@/store/imagingModalityApi";
import { ImagingModality } from "@/interfaces/image-dicom/imaging_modality.interface";
import { ModalityMachine } from "@/interfaces/image-dicom/modality-machine.interface";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: modalityData, isLoading: isLoadingModality } =
    useGetAllImagingModalityQuery();

  const modalities: ImagingModality[] = useMemo(
    () => modalityData?.data ?? [],
    [modalityData]
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const selectedModality = (searchParams.get("modalityId") || "").toUpperCase();
  const selectedMachine = searchParams.get("modalityMachineId") || "";

  const toggleExpand = (modalityId: string) =>
    setExpanded((prev) => ({ ...prev, [modalityId]: !prev[modalityId] }));

  const pushWithParams = (
    updates: Record<string, string | undefined>,
    removals: string[] = []
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    removals.forEach((k) => params.delete(k));
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") params.delete(k);
      else params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleNavigate = (modalityId: string) => {
    pushWithParams({ modalityId }, ["modalityMachineId"]); // Remove modalityMachineId when modalityId changes
  };

  const handleNavigateChild = (modalityId: string, deviceId: string) => {
    pushWithParams({ modalityId, modalityMachineId: deviceId });
  };

  const handleBack = () => {
    router.push("/radiologist");
  };

  return (
    <Suspense>
      {" "}
      <div className="w-full h-full overflow-y-auto">
        <div className="p-4 border-b border-border sticky top-0 bg-card">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 w-8 p-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground">Work Tree</h2>
          </div>
        </div>
        <div className="py-2">
          {isLoadingModality && (
            <div className="px-3 py-2 text-xs text-foreground">Loading...</div>
          )}
          {!isLoadingModality && modalities.length === 0 && (
            <div className="px-3 py-2 text-xs text-foreground">No data</div>
          )}

          {!isLoadingModality &&
            modalities.length > 0 &&
            modalities.map((m) => {
              const id = m.id?.toUpperCase() ?? "";
              const children =
                m.modalityMachines?.filter(
                  (mm: ModalityMachine) => !mm.isDeleted
                ) ?? [];
              const isOpen =
                !!expanded[id] || m.id?.toUpperCase() === selectedModality;
              const isSelectedTop = m.id?.toUpperCase() === selectedModality;
              return (
                <div key={m.id}>
                  <div
                    className={`flex items-center gap-1 px-4 py-3 cursor-pointer text-sm font-medium transition-colors ${
                      isSelectedTop
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent"
                    }`}
                    onClick={() => handleNavigate(m.id)}
                  >
                    <span className="w-4 h-4 flex items-center justify-center">
                      {children.length > 0 && (
                        <button
                          type="button"
                          className="p-0 m-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(id);
                          }}
                          aria-label={isOpen ? "Collapse" : "Expand"}
                        >
                          {isOpen ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                      )}
                    </span>
                    <span className="truncate" title={m.modalityName}>
                      {m.modalityCode}{" "}
                      {/* Display modalityCode, but use id for selection */}
                    </span>
                  </div>
                  {isOpen && children.length > 0 && (
                    <div>
                      {children.map((c: ModalityMachine) => (
                        <div
                          key={c.id}
                          className={`px-4 py-2 pl-10 text-sm cursor-pointer transition-colors ${
                            selectedMachine === c.id
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-foreground hover:bg-accent/50"
                          }`}
                          onClick={() => handleNavigateChild(m.id, c.id)}
                        >
                          {c.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </Suspense>
  );
}
