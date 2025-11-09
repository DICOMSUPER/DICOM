"use client";

import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Patient } from "@/interfaces/patient/patient-workflow.interface";
import { formatDateYMD } from "@/utils/FormatDate";
import { ExamItemDetail } from "./ExamDetail";

export interface ExamItem {
  id: string;
  label: string;
  modality: string;
  date: string;
}

export interface SidebarTabProps {
  setSelectedExam: (examId: string) => void;
  examHistory: ExamItem[];
  patient: Patient;
}

const SidebarTab: React.FC<SidebarTabProps> = ({
  setSelectedExam,
  examHistory,
  patient,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      {/* --- Header --- */}
      <div className="p-4 border-b">
        <h3 className="font-medium text-sm mb-2">Thông tin ca</h3>
        <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          <span className="text-xs">◀</span> Back
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* --- Thông tin bệnh nhân --- */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2">
            THÔNG TIN BỆNH NHÂN
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">PID:</span>
              <span className="font-medium">{patient.patientCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Họ và tên:</span>
              <span className="font-medium">
                {patient.firstName + " " + patient.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Năm sinh:</span>
              <span>{formatDateYMD(patient.dateOfBirth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Điện thoại:</span>
              <span>{patient.phoneNumber}</span>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              <div>Địa chỉ: {patient.address}</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* --- Lịch sử khám --- */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2">
            LỊCH SỬ KHÁM
          </h4>
          <ScrollArea className="h-48">
            <div className="space-y-1">
              {examHistory.map((exam) => (
                <ExamItemDetail
                  key={exam.id}
                  exam={exam}
                  expandedId={expandedId}
                  handleToggle={handleToggle}
                  setSelectedExam={setSelectedExam}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </aside>
  );
};

SidebarTab.displayName = "SidebarTab";
export default React.memo(SidebarTab);
