"use client";

import React from "react";
import { useGetDicomStudiesByOrderIdQuery } from "@/store/dicomStudyApi";
import { skipToken } from "@reduxjs/toolkit/query";

export const ExamItemDetail = React.memo(
  ({ exam, expandedId, handleToggle, setSelectedExam }: any) => {
    // ✅ chỉ fetch khi expand
    const shouldFetch = expandedId === exam.id;

    const { data, isLoading, error } =
      useGetDicomStudiesByOrderIdQuery(
        shouldFetch ? exam.id : skipToken
      );

    const study = data?.data?.[0];

    if (error) {
      return <div className="border rounded"></div>;
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
          <div className="px-3 py-2 bg-gray-50 text-xs space-y-2 rounded">
            {isLoading && <div>Loading data...</div>}

            {study && (
              <>
                <div>
                  <span className="font-medium">
                    {study.imagingOrder?.procedure?.name}
                  </span>
                </div>

                <div>
                  (S)- {study.performingTechnicianId || "Unknown"}
                  <br />
                  (A)- {study.verifyingRadiologistId || "Unknown"}
                </div>

                {/* ✅ FIX: truyền ĐỦ 2 tham số */}
                <button
                  onClick={() =>
                    setSelectedExam(
                      study.id,
                      study.imagingOrder?.imagingOrderForm?.encounterId ?? null
                    )
                  }
                  className="text-blue-600 hover:underline text-xs"
                >
                  View Details
                </button>
              </>
            )}

            {!isLoading && !study && !error && (
              <div className="text-gray-400">No data available.</div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ExamItemDetail.displayName = "ExamItemDetail";
