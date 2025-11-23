"use client";

import { useParams } from "next/navigation";

import { DiagnosisReportDetail } from "@/components/physician/study/diagnosis-report-detail";
import { useGetDiagnoseByStudyIdQuery } from "@/store/diagnosisApi";

export default function DicomStudyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: diagnosis, isLoading } = useGetDiagnoseByStudyIdQuery(id);

  console.log("diagnosis", diagnosis);

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <DiagnosisReportDetail
        reportId={diagnosis?.data[0].id as string}
        isReportLoading={isLoading}
      />
    </div>
  );
}
