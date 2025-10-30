"use client";

import React, { useCallback, useMemo, useState } from "react";
import SidebarTab from "@/components/radiologist/patientDetailTab/SideBarTab";
import MedicalRecordMain from "@/components/radiologist/patientDetailTab/MainDetail";
import { usePatientService } from "@/hooks/usePatientService";
import { useImagingOrderFormService } from "@/hooks/useImagingOrderForm";
import { useGetImagingOrdersByPatientIdQuery } from "@/store/imagingOrderApi";

export default function MedicalRecordPage() {
  const [selectedExam, setSelectedExam] = useState<string>("CT - 11/08/2021");

  // Lấy các hàm từ service
  const { getPatientById } = usePatientService();


  const patientId = "37abf913-75c1-44a9-9104-3b8cc3edc4cd"; // <-- sau này bạn có thể dùng useParams() để lấy từ URL

  // Gọi API: getPatientById
  const {
    data: patientData,
    isLoading,
    isError,
    error,
  } = getPatientById(patientId);



  const {
    data: imagingOrdersData,
    isLoading: isImagingLoading,
    error: imagingError,
  } = useGetImagingOrdersByPatientIdQuery({ patientId });

  console.log("check data --> ", imagingOrdersData)

  const examHistory = useMemo(() => {
    const list = imagingOrdersData?.data || [];

    return list.map((order: any) => {
      const modalityName = order.procedure?.modality?.modalityCode || "Không rõ";
      const createdAt = new Date(order.createdAt);
      const formattedDate = createdAt.toLocaleDateString("vi-VN");
      return {
        id: order.id,
        label: `${modalityName} - ${formattedDate}`,
        modality: modalityName,
        date: formattedDate,
      };
    });
  }, [imagingOrdersData]);

  const handleSelectExam = useCallback((examId: string) => {
    setSelectedExam(examId);
  }, []);


  // Xử lý trạng thái tải
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Đang tải hồ sơ bệnh nhân...</div>;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        Lỗi tải dữ liệu: {(error as any)?.message || "Không xác định"}
      </div>
    );
  }

  // Nếu không có dữ liệu
  if (!patientData?.data) {
    return <div className="flex items-center justify-center h-screen">Không tìm thấy bệnh nhân</div>;
  }



  // useMemo để giữ ổn định danh sách các lần khám (ví dụ dữ liệu tĩnh)

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarTab setSelectedExam={handleSelectExam} examHistory={examHistory} patient={patientData.data} />
      {/* Truyền dữ liệu bệnh nhân qua component chính */}
      <MedicalRecordMain selectedExam={selectedExam} />
    </div>
  );
}
