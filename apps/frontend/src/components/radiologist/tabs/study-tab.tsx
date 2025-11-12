"use client";

import React, { useCallback, useMemo, useState } from "react";
import SidebarTab from "@/components/radiologist/patientDetailTab/SideBarTab";
import MedicalRecordMain from "@/components/radiologist/patientDetailTab/MainDetail";
import { usePatientService } from "@/hooks/usePatientService";
import { useGetImagingOrdersByPatientIdQuery } from "@/store/imagingOrderApi";
import { useGetDiagnoseByStudyIdQuery } from "@/store/diagnosisApi";
import { DicomStudyFilterQuery } from "@/interfaces/image-dicom/dicom-study.interface";
import { useGetDicomStudiesFilteredQuery } from "@/store/dicomStudyApi";


interface MedicalRecordPageProps {
  patientId: string;   
  studyUID?: string; 

}


export default function MedicalRecordPage({ patientId, studyUID }: MedicalRecordPageProps) {


  const {
    data: studyData,
    isLoading: isLoadingStudy,
    refetch: refetchStudy,
    error: studyError,
  } = useGetDicomStudiesFilteredQuery({ studyUID });
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);

  if (!isLoadingStudy && !studyError)
    patientId = studyData?.data[0]?.patientId ?? patientId;
  const { getPatientById } = usePatientService();


  const {
    data: patientData,
    isLoading,
    isError,
    error,
  } = getPatientById(patientId);
  const { data: imagingOrdersData } = useGetImagingOrdersByPatientIdQuery({
    patientId,
  });


  const examHistory = useMemo(() => {
    const list = imagingOrdersData?.data || [];
    return list.map((order: any) => {
      const modalityName =
        order.procedure?.modality?.modalityCode || "Không rõ";
      const formattedDate = new Date(order.createdAt).toLocaleDateString(
        "vi-VN"
      );
      return {
        id: order.id,
        label: `${modalityName} - ${formattedDate}`,
        modality: modalityName,
        date: formattedDate,
        encounterId: order.imagingOrderForm.encounterId,
      };
    });
  }, [imagingOrdersData]);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(
    null
  );

  const handleSelectExam = useCallback(
    (studyId: string | null, encounterId?: string | null) => {
      setSelectedStudyId(studyId);
      setSelectedExam(studyId ? "existing" : "new");

      if (encounterId) {
        setSelectedEncounterId(encounterId);
      } else {
        // Nếu không có studyId thì lấy encounter đầu tiên
        const firstEncounter = examHistory[0]?.encounterId || null;
        setSelectedEncounterId(firstEncounter);
      }
    },
    [examHistory]
  );
  const { data: diagnosisData, isLoading: isDiagnosisLoading } =
    useGetDiagnoseByStudyIdQuery(selectedStudyId ?? "", {
      skip: !selectedStudyId,
    });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        Đang tải hồ sơ bệnh nhân...
      </div>
    );
  if (isError)
    return (
      <div className="text-red-600">
        Lỗi tải dữ liệu: {(error as any)?.message}
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50">

    {patientData?.data && (
      <SidebarTab
        setSelectedExam={handleSelectExam}
        examHistory={examHistory}
        patient={patientData.data}
      />
    )}


      <MedicalRecordMain
        selectedExam={selectedExam}
        selectedStudyId={selectedStudyId}
        diagnosisData={diagnosisData}
        isDiagnosisLoading={isDiagnosisLoading}
        encounterId={selectedEncounterId}
      />
    </div>
  );
}

