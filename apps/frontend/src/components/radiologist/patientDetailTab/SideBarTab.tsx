"use client";

import React, { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw } from "lucide-react";
import { Patient } from "@/common/interfaces/patient/patient-workflow.interface";
import { formatDateYMD } from "@/common/utils/FormatDate";
import { ExamItemDetail } from "./ExamDetail";
import { OrderStatus } from "@/common/enums/image-order.enum";

export interface ExamItem {
  id: string;
  label: string;
  modality: string;
  date: string;
  status: "in-progress" | "completed" | string;
  studyId: string | null;
  encounterId: string | null; // ✅ BẮT BUỘC PHẢI CÓ
}

export interface SidebarTabProps {
  setSelectedExam: (
    studyId: string | null,
    encounterId: string | null
  ) => void;
  examHistory: ExamItem[];
  patient?: Patient;
  isLoading?: boolean;
  onRefresh?: () => void;
  isFetching?: boolean;
}

const SidebarTab: React.FC<SidebarTabProps> = ({
  setSelectedExam,
  examHistory,
  patient,
  isLoading = false,
  onRefresh,
  isFetching = false,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // --- Lọc exam theo status ---
  const inProgressExams = useMemo(
    () => examHistory.filter((exam) => exam.status === OrderStatus.IN_PROGRESS),
    [examHistory]
  );

  const progressExams = useMemo(
    () => examHistory.filter((exam) => exam.status === OrderStatus.COMPLETED),
    [examHistory]
  );

  if (!patient) return <div>Patient not found</div>;

  return (
    <aside className="not-even:w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">Thông tin ca</h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isFetching}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              title="Refresh studies"
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
        <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          <span className="text-sm">◀</span> Back
        </button>
      </div>

      <div className="p-4 space-y-4 h-full">
        {/* Thông tin bệnh nhân */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
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
            <div className="text-sm text-gray-600 mt-2">
              <div>Địa chỉ: {patient.address}</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Chưa chẩn đoán */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Chưa chẩn đoán
          </h4>
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center text-gray-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang tải...
              </div>
            ) : inProgressExams.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-gray-400 text-sm text-center">
                Không có exam nào
              </div>
            ) : (
              <div className="space-y-1">
                {inProgressExams.map((exam) => (
                  <ExamItemDetail
                    key={exam.id}
                    exam={exam}
                    expandedId={expandedId}
                    handleToggle={handleToggle}
                    setSelectedExam={setSelectedExam}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <Separator />

        {/* Lịch sử khám */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            LỊCH SỬ KHÁM
          </h4>
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center text-gray-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang tải...
              </div>
            ) : progressExams.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-gray-400 text-sm text-center">
                Không có lịch sử
              </div>
            ) : (
              <div className="space-y-1">
                {progressExams.map((exam) => (
                  <ExamItemDetail
                    key={exam.id}
                    exam={exam}
                    expandedId={expandedId}
                    handleToggle={handleToggle}
                    setSelectedExam={setSelectedExam}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </aside>
  );
};

SidebarTab.displayName = "SidebarTab";
export default React.memo(SidebarTab);
