"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useGetAllImagingModalityQuery } from "@/store/imagingModalityApi";
import { ImagingModality } from "@/interfaces/image-dicom/imaging_modality.interface";

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

  return (
    <div className="w-full h-full bg-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-300 sticky top-0 bg-gray-200">
        <h2 className="text-lg font-semibold text-gray-700">Work Tree</h2>
      </div>
      <div className="py-2">
        {isLoadingModality && (
          <div className="px-3 py-2 text-xs text-gray-500">Loading...</div>
        )}
        {!isLoadingModality && modalities.length === 0 && (
          <div className="px-3 py-2 text-xs text-gray-500">No data</div>
        )}

        {!isLoadingModality &&
          modalities.length > 0 &&
          modalities.map((m) => {
            const id = m.id?.toUpperCase() ?? "";
            const children =
              m.modalityMachines?.filter(
                (mm: modalityMachine) => !mm.isDeleted
              ) ?? [];
            const isOpen =
              !!expanded[id] || m.id?.toUpperCase() === selectedModality;
            const isSelectedTop = m.id?.toUpperCase() === selectedModality;
            return (
              <div key={m.id}>
                <div
                  className={`flex items-center gap-1 px-4 py-3 cursor-pointer text-sm font-medium ${
                    isSelectedTop
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
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
                    {children.map((c: modalityMachine) => (
                      <div
                        key={c.id}
                        className={`px-4 py-2 pl-10 text-sm cursor-pointer ${
                          selectedMachine === c.id
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
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
  );
}
