import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useGetAllImagingModalityQuery } from "@/store/imagingModalityApi";
import { MachineStatus } from "@/common/enums/machine-status.enum";

export default function MachineFilterBar({
  onRefetch,
  machineNumber,
  maxMachines,
}: {
  onRefetch: () => void;
  machineNumber: number;
  maxMachines: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initial = useMemo(() => {
    const p = new URLSearchParams(searchParams.toString());
    return {
      machineName: p.get("machineName") ?? "",
      modalityId: p.get("modalityId") ?? "",
      manufacturer: p.get("manufacturer") ?? "",
      status: p.get("status") ?? "",
      serialNumber: p.get("serialNumber") ?? "",
      model: p.get("model") ?? "",
    };
  }, [searchParams]);

  //toggle advanced
  const [advancedToggled, setAdvancedToggled] = useState(false);

  //fetch modalities
  const { data: modalityData } = useGetAllImagingModalityQuery();
  const modalities = modalityData?.data || [];

  //search query
  const [machineName, setMachineName] = useState(initial.machineName);
  const [manufacturer, setManufacturer] = useState(initial.manufacturer);
  const [serialNumber, setSerialNumber] = useState(initial.serialNumber);
  const [model, setModel] = useState(initial.model);
  const [modalityId, setModalityId] = useState(initial.modalityId);
  const [status, setStatus] = useState(initial.status);

  const pushWithParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") params.delete(k);
      else params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleToggleAdvance = () => {
    if (advancedToggled) {
      setModalityId("");
      setStatus("");
    }

    setAdvancedToggled(!advancedToggled);
  };

  const handleRefresh = () => {
    const params = {
      machineName,
      manufacturer,
      serialNumber,
      model,
      modalityId: modalityId === "" ? undefined : modalityId,
      status: status === "" ? undefined : status,
    };

    pushWithParams(params);
    onRefetch();
  };

  return (
    <div className="bg-white border-b border-gray-300 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-700">
          Displaying {machineNumber} of {maxMachines} machines
        </h3>
      </div>

      {/* Basic Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 min-w-[140px] flex-1 max-w-[200px]">
          <Label className="text-xs font-semibold text-gray-700">
            Machine Name
          </Label>
          <Input
            type="text"
            placeholder="X-Ray Machine"
            value={machineName}
            onChange={(e) => {
              setMachineName(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[140px] flex-1 max-w-[200px]">
          <Label className="text-xs font-semibold text-gray-700">
            Manufacturer
          </Label>
          <Input
            type="text"
            placeholder="GE Healthcare"
            value={manufacturer}
            onChange={(e) => {
              setManufacturer(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[140px] flex-1 max-w-[200px]">
          <Label className="text-xs font-semibold text-gray-700">
            Serial Number
          </Label>
          <Input
            type="text"
            placeholder="SN-123456"
            value={serialNumber}
            onChange={(e) => {
              setSerialNumber(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[140px] flex-1 max-w-[200px]">
          <Label className="text-xs font-semibold text-gray-700">Model</Label>
          <Input
            type="text"
            placeholder="Optima 580"
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
          />
        </div>

        <Button
          className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-200 min-w-[100px]"
          onClick={handleRefresh}
        >
          Refresh
        </Button>

        <Button
          className={`px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-200 min-w-[100px] ${
            advancedToggled && "bg-gray-100"
          }`}
          onClick={handleToggleAdvance}
        >
          Advanced
        </Button>
      </div>

      {/* Advanced Filters */}
      {advancedToggled && (
        <div className="flex flex-wrap gap-3 items-end pt-2 border-t border-gray-200">
          <div className="flex flex-col gap-1 min-w-[180px]">
            <Label className="text-xs font-semibold text-gray-700">
              Status
            </Label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
              }}
              className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
            >
              <option value="">All</option>
              {Object.values(MachineStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[180px]">
            <Label className="text-xs font-semibold text-gray-700">
              Modality
            </Label>
            <select
              value={modalityId}
              onChange={(e) => {
                setModalityId(e.target.value);
              }}
              className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
            >
              <option value="">All</option>
              {modalities.map((modality) => (
                <option key={modality.id} value={modality.id}>
                  {modality.modalityName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
