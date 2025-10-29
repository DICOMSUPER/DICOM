"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DatePickerDropdown from "./../radiologist/date-picker";
import { DicomStudyStatus, ImagingOrderStatus } from "@/enums/image-dicom.enum";
import { DiagnosisStatus } from "@/enums/patient-workflow.enum";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useGetAllImagingModalityQuery } from "@/store/imagingModalityApi";

const formatDateISO = (date: Date | undefined) => {
  if (!date) return undefined;
  return date.toISOString().split("T")[0];
};

export default function FilterBar({
  onRefetch,
  caseNumber,
  maxCases,
}: {
  onRefetch: () => void;
  caseNumber: number;
  maxCases: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initial = useMemo(() => {
    const p = new URLSearchParams(searchParams.toString());
    return {
      mrn: p.get("mrn") ?? "",
      patientFirstName: p.get("patientFirstName") ?? "",
      patientLastName: p.get("patientLastName") ?? "",
      startDate: p.get("startDate") ?? "",
      endDate: p.get("endDate") ?? "",
      studyStatus: p.get("studyStatus") ?? "All",
      reportStatus: p.get("reportStatus") ?? "All",
      bodyPart: p.get("bodyPart") ?? "",
      studyUID: p.get("studyUID") ?? "",
      modalityId: p.get("modalityId") ?? "",
      orderStatus: p.get("orderStatus") ?? "All",
      procedureId: p.get("procedureId") ?? "",
    };
  }, [searchParams]);

  //toggle advanced
  const [advancedToggled, setAdvancedToggled] = useState(false);

  //fetch modalities
  const { data: modalityData } = useGetAllImagingModalityQuery();
  const modalities = modalityData?.data || [];

  //search query
  const [mrn, setMrn] = useState(initial.mrn);
  const [patientFirstName, setPatientFirstName] = useState(
    initial.patientFirstName
  );
  const [patientLastName, setPatientLastName] = useState(
    initial.patientLastName
  );

  const [bodyPart, setBodyPart] = useState(initial.bodyPart);

  const [modalityId, setModalityId] = useState(initial.modalityId);
  const [orderStatus, setOrderStatus] = useState(initial.orderStatus);
  const [procedureId, setProcedureId] = useState(initial.procedureId);

  const pushWithParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") params.delete(k);
      else params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleToggleAdvance = () => {
    if (!advancedToggled === false) {
      setModalityId("");
      setOrderStatus("All");
    }

    setAdvancedToggled(!advancedToggled);
  };
  const studyStatusArray = Object.values(DicomStudyStatus).filter(
    (status) => status !== DicomStudyStatus.SCANNED
  );
  const DiagnosisStatusArray = Object.values(DiagnosisStatus);
  const orderStatusArray = Object.values(ImagingOrderStatus);

  const handleRefresh = () => {
    const params = {
      mrn,
      patientFirstName,
      patientLastName,
      bodyPart,
      modalityId: modalityId === "" ? undefined : modalityId,
      orderStatus: orderStatus === "All" ? undefined : orderStatus,
      procedureId: procedureId === "" ? undefined : procedureId,
    };

    pushWithParams(params);
    onRefetch();
  };

  return (
    <div className="bg-white border-b border-gray-300 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-700">
          Displaying {caseNumber} of {maxCases} order
        </h3>
        <div className="text-sm text-red-600 font-semibold">
          Signed cases: 273
        </div>
      </div>

      {/* Basic Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 min-w-[140px] flex-1 max-w-[200px]">
          <Label className="text-xs font-semibold text-gray-700">
            Patient Last Name
          </Label>
          <Input
            type="text"
            placeholder="nguyen"
            value={patientLastName}
            onChange={(e) => {
              setPatientLastName(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[140px] flex-1 max-w-[200px]">
          <Label className="text-xs font-semibold text-gray-700">
            Patient First Name
          </Label>
          <Input
            type="text"
            placeholder="thi hoa"
            value={patientFirstName}
            onChange={(e) => {
              setPatientFirstName(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[140px] flex-1 max-w-[200px]">
          <Label className="text-xs font-semibold text-gray-700">MRN</Label>
          <Input
            type="text"
            placeholder="PA##############"
            value={mrn}
            onChange={(e) => {
              setMrn(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[140px] flex-1 max-w-[200px]">
          <Label className="text-xs font-semibold text-gray-700">
            Body Part
          </Label>
          <Input
            type="text"
            placeholder="CHEST"
            value={bodyPart}
            onChange={(e) => {
              setBodyPart(e.target.value);
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

          <div className="flex flex-col gap-1 min-w-[120px]">
            <Label className="text-xs font-semibold text-gray-700">
              Order Status
            </Label>
            <select
              value={orderStatus}
              onChange={(e) => {
                setOrderStatus(e.target.value);
              }}
              className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
            >
              <option>All</option>
              {orderStatusArray.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[180px]">
            <Label className="text-xs font-semibold text-gray-700">
              Procedure ID
            </Label>
            <Input
              type="text"
              placeholder="procedure UUID"
              value={procedureId}
              onChange={(e) => {
                setProcedureId(e.target.value);
              }}
              className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
