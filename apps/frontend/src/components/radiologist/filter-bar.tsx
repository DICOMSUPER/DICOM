"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DatePickerDropdown from "./date-picker";
import { DicomStudyStatus } from "@/enums/image-dicom.enum";
import { DiagnosisStatus } from "@/enums/patient-workflow.enum";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const formatDateISO = (date: Date | undefined) => {
  if (!date) return undefined;
  return date.toISOString().split("T")[0];
};

export default function FilterBar() {
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
    };
  }, [searchParams]);

  //toggle advanced
  const [advancedToggled, setAdvancedToggled] = useState(false);

  //search query
  const [mrn, setMrn] = useState(initial.mrn);
  const [patientFirstName, setPatientFirstName] = useState(
    initial.patientFirstName
  );
  const [patientLastName, setPatientLastName] = useState(
    initial.patientFirstName
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    initial.startDate ? new Date(initial.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initial.endDate ? new Date(initial.endDate) : undefined
  );
  const [studyStatus, setStudyStatus] = useState(initial.studyStatus);
  const [reportStatus, setReportStatus] = useState(initial.reportStatus);
  const [bodyPart, setBodyPart] = useState(initial.bodyPart);
  const [studyUID, setStudyUID] = useState(initial.studyUID);

  const pushWithParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") params.delete(k);
      else params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
  };

  const studyStatusArray = Object.values(DicomStudyStatus);
  const DiagnosisStatusArray = Object.values(DiagnosisStatus);

  const handleRefresh = () => {
    const params = {
      mrn,
      patientFirstName,
      patientLastName,
      bodyPart,
      startDate: formatDateISO(startDate),
      endDate: formatDateISO(endDate),
      studyUID,
      studyStatus,
      reportStatus,
    };

    pushWithParams(params);
  };

  return (
    <div className="bg-white border-b border-gray-300 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Displaying 3 of 3 cases
        </h3>
        <div className="text-sm text-red-600 font-semibold">
          Signed cases: 273
        </div>
      </div>
      <div className="grid grid-cols-6 gap-4 items-end flex-wrap">
        <div className="flex flex-col gap-1">
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
            className="px-3 py-2 border border-gray-300 rounded text-sm w-40 bg-white"
          />
        </div>

        <div className="flex flex-col gap-1">
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
            className="px-3 py-2 border border-gray-300 rounded text-sm w-40 bg-white"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-xs font-semibold text-gray-700">MRN</Label>
          <Input
            type="text"
            placeholder="PA##############"
            value={mrn}
            onChange={(e) => {
              setMrn(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm w-40 bg-white"
          />
        </div>
        <div className="flex flex-col gap-1">
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
            className="px-3 py-2 border border-gray-300 rounded text-sm w-40 bg-white"
          />
        </div>

        <Button
          className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-200"
          onClick={handleRefresh}
        >
          Refresh
        </Button>

        <Button
          className={`px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-200 ${
            advancedToggled && "bg-gray-100"
          }`}
          onClick={() => {
            setAdvancedToggled(!advancedToggled);
          }}
        >
          Advanced
        </Button>

        {advancedToggled && (
          <>
            {" "}
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-gray-700">
                Study UID
              </Label>
              <Input
                type="text"
                placeholder="1.2.840.10008.xxxx.xxxx.xxxx.xxxx"
                value={studyUID}
                onChange={(e) => {
                  setStudyUID(e.target.value);
                }}
                className="px-3 py-2 border border-gray-300 rounded text-sm w-40 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-gray-700">
                Study Date From
              </Label>

              <DatePickerDropdown
                date={startDate}
                onSelect={handleStartDateChange}
                placeholder="Start Date"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-gray-700">
                Study Date To
              </Label>
              <DatePickerDropdown
                date={endDate}
                onSelect={handleEndDateChange}
                placeholder="End Date"
                disabled={(date) => (startDate ? date < startDate : false)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-gray-700">
                Study Status
              </Label>
              <select
                value={studyStatus}
                onChange={(e) => {
                  setStudyStatus(e.target.value);
                }}
                className="px-3 py-2 border border-gray-300 rounded text-sm w-32 bg-white"
              >
                <option>All</option>
                {studyStatusArray.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-gray-700">
                Report Status
              </Label>
              <select
                value={reportStatus}
                onChange={(e) => {
                  setReportStatus(e.target.value);
                }}
                className="px-3 py-2 border border-gray-300 rounded text-sm w-32 bg-white"
              >
                <option>All</option>
                {DiagnosisStatusArray.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
