"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useGetAllImagingModalityQuery } from "@/store/imagingModalityApi";
import { ImagingModality } from "@/interfaces/image-dicom/imaging_modality.interface";

type EquipmentNode = { id: string; label: string };

//Hard coded for now,... this entity did not exist yet, wait for db, backend update and adjustment later
const HARD_CODED_CHILDREN: Record<string, EquipmentNode[]> = {
  MR: [
    { id: "as-mr-124b", label: "AS MR 124B" },
    { id: "ha-tinh-mri", label: "Ha Tinh MRI" },
    { id: "mr-bvsn-phu-tho", label: "MR BVSN Phu Tho" },
    { id: "mr-pkko", label: "MR PKKO" },
    { id: "mri-120-a2", label: "MRI 120 A2" },
  ],
  CT: [
    { id: "as-ct-125", label: "AS CT 125" },
    { id: "bvdk-ha-tinh-ct16", label: "BVDK Ha Tinh CT16" },
    { id: "ct-disable-1", label: "CT (Disabled)" },
    { id: "ct-disable-2", label: "CT (Disabled)" },
    { id: "ct-120-a2", label: "CT 120 A2" },
    { id: "ct-bvsn-phu-tho", label: "CT BVSN Phu Tho" },
    { id: "ct-ha-tinh-2", label: "CT Ha Tinh 2" },
    { id: "ct16-pkko", label: "CT16 PKKO" },
  ],
  CR: [
    { id: "a2-xq-117", label: "A2 XQ 117" },
    { id: "a2-xq-119", label: "A2 XQ 119" },
    { id: "a2-xq-tai-giuong-119", label: "A2 XQ Bedside 119" },
    { id: "a2-xq-127", label: "A2 XQ 127" },
    { id: "a2-xq-129", label: "A2 XQ 129" },
    { id: "a2-xq-vu-101", label: "A2 XQ Breast 101" },
    { id: "cr-disable", label: "CR (Disabled)" },
  ],
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, isLoading } = useGetAllImagingModalityQuery();

  const modalities: ImagingModality[] = useMemo(() => data ?? [], [data]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const selectedCode = (searchParams.get("modalityCode") || "").toUpperCase();
  const selectedDevice = searchParams.get("modalityDevice") || "";

  const toggleExpand = (modalityCode: string) =>
    setExpanded((prev) => ({ ...prev, [modalityCode]: !prev[modalityCode] }));

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

  const handleNavigate = (modalityCode: string) => {
    pushWithParams({ modalityCode: modalityCode }, ["modalityDevice"]);
  };

  const handleNavigateChild = (modalityCode: string, deviceId: string) => {
    pushWithParams({ modalityCode: modalityCode, modalityDevice: deviceId });
  };

  return (
    <div className="w-full bg-gray-200 border-r border-gray-300 overflow-y-auto">
      <div className="p-3 border-b border-gray-300">
        <h2 className="text-sm font-semibold text-gray-700">Work Tree</h2>
      </div>
      <div className="py-2">
        {isLoading && (
          <div className="px-3 py-2 text-xs text-gray-500">Loading...</div>
        )}
        {!isLoading && modalities.length === 0 && (
          <div className="px-3 py-2 text-xs text-gray-500">No data</div>
        )}
        {modalities.map((m) => {
          const code = m.modalityCode?.toUpperCase() ?? "";
          const children = HARD_CODED_CHILDREN[code] ?? [];
          const isOpen = !!expanded[code] || code === selectedCode;
          const isSelectedTop = code === selectedCode;
          return (
            <div key={m.id}>
              <div
                className={`flex items-center gap-1 px-3 py-2 cursor-pointer text-sm ${
                  isSelectedTop
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleNavigate(code)}
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  {children.length > 0 && (
                    <button
                      type="button"
                      className="p-0 m-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(code);
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
                  {m.modalityCode}
                </span>
              </div>
              {isOpen && children.length > 0 && (
                <div>
                  {children.map((c) => (
                    <div
                      key={c.id}
                      className={`px-3 py-2 pl-8 text-sm cursor-pointer ${
                        selectedDevice === c.id
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      onClick={() => handleNavigateChild(code, c.id)}
                    >
                      {c.label}
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
