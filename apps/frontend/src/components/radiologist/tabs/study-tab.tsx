"use client";

import React, { useCallback, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import SidebarTab from "@/components/radiologist/patientDetailTab/SideBarTab";
import MedicalRecordMain from "@/components/radiologist/patientDetailTab/MainDetail";
import { usePatientService } from "@/common/hooks/usePatientService";
import { useGetImagingOrdersByPatientIdQuery } from "@/store/imagingOrderApi";
import { useGetDiagnoseByStudyIdQuery } from "@/store/diagnosisApi";

interface MedicalRecordPageProps {
  patientId: string;
  studyUID?: string;
}

export default function MedicalRecordPage({ patientId }: MedicalRecordPageProps) {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null);

  const { getPatientById } = usePatientService();
  const { data: patientData, isLoading, isError, error } = getPatientById(patientId);

  const { data: imagingOrdersData, refetch: refetchOrders, isFetching: isFetchingOrders } =
    useGetImagingOrdersByPatientIdQuery({ patientId });



  // ✅ MAP ĐÚNG encounterId + studyId
  const examHistory = useMemo(() => {
    const list = imagingOrdersData || [];

    return list.map((order: any) => {
      const statusRaw = String(order.orderStatus || "").trim();
      const statusLabel =
        statusRaw.length > 0
          ? `${statusRaw
              .split("_")
              .map(
                (part: string) =>
                  part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
              )
              .join(" ")}`
          : "ORDER";

      return {
        id: order.id,
        label: `${statusLabel} • ${
          order.procedure?.modality?.modalityCode || "Không rõ"
        } • ${new Date(order.createdAt).toLocaleDateString("vi-VN")}`,
        modality: order.procedure?.modality?.modalityCode || "Không rõ",
        date: new Date(order.createdAt).toLocaleDateString("vi-VN"),
        encounterId: order.imagingOrderForm?.encounterId || null,
        status: order.orderStatus,
        studyId: order.studyId || null, // ✅ CHUẨN
      };
    });
  }, [imagingOrdersData]);

 
  const handleSelectExam = useCallback(
    (studyId: string | null, encounterId: string | null) => {
      setSelectedStudyId(studyId);
      setSelectedEncounterId(encounterId);
      setSelectedExam(studyId ? "existing" : "new");
    },
    []
  );

  const { data: diagnosisData, isLoading: isDiagnosisLoading } =
    useGetDiagnoseByStudyIdQuery(selectedStudyId ?? "", {
      skip: !selectedStudyId,
    });

if (isLoading)
  return (
    <div className="flex flex-col items-center justify-center h-full flex-1 text-slate-500 gap-2">
      <span className="inline-flex h-8 w-8 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
      Đang tải...
    </div>
  );
if (isError)
  return (
    <div className="flex flex-col items-center justify-center h-full flex-1 text-red-600 gap-2">
      <AlertCircle className="h-8 w-8 text-red-500" />
      Lỗi tải dữ liệu: {(error as any)?.message || "Không thể tải dữ liệu"}
    </div>
  );

  return (
    <div className="flex h-full">

      {patientData?.data && (
        <SidebarTab
          examHistory={examHistory}
          patient={patientData.data}
          setSelectedExam={handleSelectExam}
          onRefresh={refetchOrders}
          isFetching={isFetchingOrders}
        />
      )}

      <MedicalRecordMain
        selectedExam={selectedExam}
        selectedStudyId={selectedStudyId}
        diagnosisData={diagnosisData}
        isDiagnosisLoading={isDiagnosisLoading}
        encounterId={selectedEncounterId} // ✅ GIỜ ĐÃ CÓ GIÁ TRỊ ĐÚNG
        patientId={patientId}
      />
    </div>
  );
}
