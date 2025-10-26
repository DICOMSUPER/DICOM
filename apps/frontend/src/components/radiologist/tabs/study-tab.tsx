"use client"

import React, { useCallback, useMemo, useState } from "react"
import SidebarTab from "@/components/radiologist/patientDetailTab/SideBarTab"
import MedicalRecordMain from "@/components/radiologist/patientDetailTab/MainDetail"

export default function MedicalRecordPage() {
  const [selectedExam, setSelectedExam] = useState<string>("CT - 11/08/2021")

  // useCallback để trả 1 reference hàm ổn định
  const handleSelectExam = useCallback((examName: string) => {
    setSelectedExam(examName)
  }, [])

  // useMemo để giữ mảng examHistory không đổi reference nếu dữ liệu tĩnh
  const examHistory = useMemo<string[]>(
    () => [
      "XX - 18/08/2021",
      "US - 12/08/2021",
      "CT - 11/08/2021",
      "DX - 11/08/2021",
    ],
    []
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarTab setSelectedExam={handleSelectExam} examHistory={examHistory} />
      <MedicalRecordMain selectedExam={selectedExam} />
    </div>
  )
}
