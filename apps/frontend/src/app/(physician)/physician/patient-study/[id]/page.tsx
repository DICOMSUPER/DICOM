"use client";

import { useParams } from "next/navigation";

import { DiagnosisReportDetail } from "@/components/physician/study/diagnosis-report-detail";
import { useGetDiagnoseByStudyIdQuery } from "@/store/diagnosisApi";

export default function DicomStudyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: diagnosis, isLoading } = useGetDiagnoseByStudyIdQuery(id);

  const reportId = diagnosis?.data && diagnosis.data.length > 0 
    ? diagnosis.data[0].id 
    : "";

  return (
    <div className="mx-auto py-6 space-y-6 w-full">
      <DiagnosisReportDetail
        reportId={reportId}
        isReportLoading={isLoading}
      />
    </div>
  );
}
