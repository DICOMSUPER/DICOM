"use client";
import React, { useMemo } from "react";
import FilterBar from "../filter-bar";
import DataTable from "../data-table";
import { useSearchParams } from "next/navigation";
import { useGetDicomStudiesFilteredQuery } from "@/store/dicomStudyApi";
import { DicomStudyFilterQuery } from "@/interfaces/image-dicom/dicom-study.interface";

export default function BaseTab() {
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
      modalityMachineId: p.get("modalityMachineId") ?? "",
    };
  }, [searchParams]);
  const {
    data: studyData,
    isLoading: isLoadingStudy,
    refetch: refetchStudy,
    error: studyError,
  } = useGetDicomStudiesFilteredQuery(initial as DicomStudyFilterQuery);
  return (
    <div className="flex-1 flex flex-col h-full">
      <FilterBar
        onRefetch={refetchStudy}
        caseNumber={(studyData?.data || []).length}
        maxCases={(studyData?.data || []).length} //may be pagination ?
      />
      <DataTable
        studies={studyData?.data || []}
        isLoading={isLoadingStudy}
        refetch={refetchStudy}
        error={!!studyError}
      />
    </div>
  );
}
