"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DatePickerDropdown from "./date-picker";
import { DicomStudyStatus } from "@/enums/image-dicom.enum";

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
      patientName: p.get("patientName") ?? "",
      startDate: p.get("startDate") ?? "",
      endDate: p.get("endDate") ?? "",
      status: p.get("status") ?? "All",
      results: p.get("results") ?? "",
    };
  }, [searchParams]);

  const [patientName, setPatientName] = useState(initial.patientName);
  const [startDate, setStartDate] = useState<Date | undefined>(
    initial.startDate ? new Date(initial.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initial.endDate ? new Date(initial.endDate) : undefined
  );
  const [status, setStatus] = useState(initial.status);
  const [results, setResults] = useState(initial.results);

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
    pushWithParams({ startDate: formatDateISO(date) });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    pushWithParams({ endDate: formatDateISO(date) });
  };

  const studyStatusArray = Object.values(DicomStudyStatus);
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

      <div className="flex gap-4 items-end flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            Patient Name
          </label>
          <input
            type="text"
            placeholder="nguyen thi hoa"
            value={patientName}
            onChange={(e) => {
              setPatientName(e.target.value);
              pushWithParams({ patientName: e.target.value });
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm w-40 bg-white"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            Scan Date
          </label>
          <div className="flex gap-2 items-center">
            <DatePickerDropdown
              date={startDate}
              onSelect={handleStartDateChange}
              placeholder="Start Date"
            />

            <span className="text-gray-600">-</span>

            <DatePickerDropdown
              date={endDate}
              onSelect={handleEndDateChange}
              placeholder="End Date"
              disabled={(date) => (startDate ? date < startDate : false)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">
            Study Status
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              pushWithParams({ status: e.target.value });
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
          <label className="text-xs font-semibold text-gray-700">Results</label>
          <select
            value={results}
            onChange={(e) => {
              setResults(e.target.value);
              pushWithParams({ results: e.target.value });
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm w-32 bg-white"
          >
            <option value="">= 4 characters</option>
            <option>Has Results</option>
            <option>No Results</option>
          </select>
        </div>

        <button className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
          Refresh
        </button>

        <button className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
          Advanced
        </button>
      </div>
    </div>
  );
}
