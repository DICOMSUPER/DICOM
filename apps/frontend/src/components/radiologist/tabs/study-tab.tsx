"use client";

import React, { useCallback, useMemo, useState } from "react";
import SidebarTab from "@/components/radiologist/patientDetailTab/SideBarTab";
import MedicalRecordMain from "@/components/radiologist/patientDetailTab/MainDetail";
import { usePatientService } from "@/hooks/usePatientService";
import { useGetImagingOrdersByPatientIdQuery } from "@/store/imagingOrderApi";
import { useGetDiagnoseByStudyIdQuery } from "@/store/diagnosisApi";

interface MedicalRecordPageProps {
  patientId: string;
  studyUID?: string;
}

export default function MedicalRecordPage({ patientId }: MedicalRecordPageProps) {

  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);
  const [selectedImagingOrderId, setSelectedImagingOrderId] = useState<string | null>(null);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null);

  const { getPatientById } = usePatientService();
  const { data: patientData, isLoading, isError, error } = getPatientById(patientId);

  const { data: imagingOrdersData } = useGetImagingOrdersByPatientIdQuery({ patientId });


  const examHistory = useMemo(() => {
    const list = imagingOrdersData || [];

    return list.map((order: any) => ({
      id: order.id,
      label: `${order.procedure?.modality?.modalityCode || "Không rõ"} - ${new Date(order.createdAt).toLocaleDateString("vi-VN")}`,
      modality: order.procedure?.modality?.modalityCode || "Không rõ",
      date: new Date(order.createdAt).toLocaleDateString("vi-VN"),
      encounterId: order.imagingOrderForm.encounterId,
      status: order.orderStatus,
      studyId: order.studyId,   
    }));
  }, [imagingOrdersData]);

  const handleSelectExam = useCallback(
    (studyId: string | null, encounterId: string | null, imagingOrderId: string | null) => {
      setSelectedStudyId(studyId);
      setSelectedEncounterId(encounterId);
      setSelectedImagingOrderId(imagingOrderId);
      setSelectedExam(studyId ? "existing" : "new");
    },
    []
  );

  const { data: diagnosisData, isLoading: isDiagnosisLoading } =
    useGetDiagnoseByStudyIdQuery(selectedStudyId ?? "", {
      skip: !selectedStudyId,
    });

    


  if (isLoading) return <div className="flex items-center justify-center h-screen">Đang tải...</div>;
  if (isError) return <div className="text-red-600">Lỗi tải dữ liệu: {(error as any)?.message}</div>;

  return (
    <div className="flex h-screen bg-gray-50">

      {patientData?.data && (
        <SidebarTab
          examHistory={examHistory}
          patient={patientData.data}
          setSelectedExam={handleSelectExam}
        />
      )}

      <MedicalRecordMain
        selectedExam={selectedImagingOrderId}
        selectedStudyId={selectedStudyId}
        diagnosisData={diagnosisData}
        isDiagnosisLoading={isDiagnosisLoading}
        encounterId={selectedEncounterId}
        patientId={patientId}
      />
    </div>
  );
}
