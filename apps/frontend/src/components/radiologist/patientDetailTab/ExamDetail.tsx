"use client";

import React from "react";
import { useGetDicomStudiesByOrderIdQuery } from "@/store/dicomStudyApi";
import { skipToken } from "@reduxjs/toolkit/query";

export const ExamItemDetail = React.memo(
  ({ exam, expandedId, handleToggle, setSelectedExam }: any) => {
    // 🔹 Chỉ gọi API khi exam này được mở
    const shouldFetch = expandedId === exam.id;
    const { data, isLoading, error } = useGetDicomStudiesByOrderIdQuery(
      shouldFetch ? exam.id : skipToken,
    );

    const study = data?.data?.[0];
  

    if (error) {
      return (
        <div className="border rounded"> </div>
      )
    }

    return (
      <div className="border rounded">
        <button
          onClick={() => handleToggle(exam.id)}
          className="w-full flex justify-between items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
        >
          <span>{exam.label}</span>
          <span className="text-xs">{shouldFetch ? "▲" : "▼"}</span>
        </button>

        {shouldFetch && (
          <div className="px-3 py-2 bg-gray-50 text-xs space-y-2">
            {isLoading && <div>Đang tải dữ liệu...</div>}


            {study && (
              <>
                <div>
                  <span className="font-medium">
                    {study?.imagingOrder?.procedure?.name}
                  </span>
                </div>
                <div>
                  (S)- {study?.performingTechnicianId || "Không rõ"}
                  <br />
                  (A)- {study?.verifyingRadiologistId || "Không rõ"}
                </div>

                <button
                  onClick={() => {
                    // Lấy luôn studyId + encounterId
                    setSelectedExam(study ? study.id : null);
                    if (study) {
                      handleToggle(study.id, study?.imagingOrder?.imagingOrderForm?.encounterId);
                    }
                  }}
                  className="text-blue-600 hover:underline text-xs"
                >
                  Xem chi tiết
                </button>
              </>
            )}

            {!isLoading && !study && !error && (
              <div className="text-gray-400">Không có dữ liệu.</div>
            )}
          </div>
        )}
      </div>
    );
  }
);
