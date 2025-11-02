"use client";

import React, { useCallback, useMemo, useState } from "react";
import SidebarTab from "@/components/radiologist/patientDetailTab/SideBarTab";
import MedicalRecordMain from "@/components/radiologist/patientDetailTab/MainDetail";
import { usePatientService } from "@/hooks/usePatientService";
import { useGetImagingOrdersByPatientIdQuery } from "@/store/imagingOrderApi";
import { useGetDiagnoseByStudyIdQuery } from "@/store/diagnosisApi";

export default function MedicalRecordPage() {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);

  const { getPatientById } = usePatientService();
  const patientId = "37abf913-75c1-44a9-9104-3b8cc3edc4cd";

  const { data: patientData, isLoading, isError, error } = getPatientById(patientId);
  const { data: imagingOrdersData } = useGetImagingOrdersByPatientIdQuery({ patientId });

  const examHistory = useMemo(() => {
    const list = imagingOrdersData?.data || [];
    return list.map((order: any) => {
      const modalityName = order.procedure?.modality?.modalityCode || "Không rõ";
      const formattedDate = new Date(order.createdAt).toLocaleDateString("vi-VN");
      return {
        id: order.id,
        label: `${modalityName} - ${formattedDate}`,
        modality: modalityName,
        date: formattedDate,
      };
    });
  }, [imagingOrdersData]);

  const handleSelectExam = useCallback((studyId: string | null) => {
    setSelectedStudyId(studyId);
    setSelectedExam(studyId ? "existing" : "new");
  }, []);

  // Khi có selectedStudyId, gọi API diagnosis
  const { data: diagnosisData, isLoading: isDiagnosisLoading } = useGetDiagnoseByStudyIdQuery(
    selectedStudyId ?? "",
    { skip: !selectedStudyId }
  );

  if (isLoading) return <div className="flex items-center justify-center h-screen">Đang tải hồ sơ bệnh nhân...</div>;
  if (isError) return <div className="text-red-600">Lỗi tải dữ liệu: {(error as any)?.message}</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarTab
        setSelectedExam={handleSelectExam}
        examHistory={examHistory}
        patient={patientData.data}
      />
      <MedicalRecordMain
        selectedExam={selectedExam}
        selectedStudyId={selectedStudyId}
        diagnosisData={diagnosisData}
        isDiagnosisLoading={isDiagnosisLoading}
      />
    </div>
  );
}
