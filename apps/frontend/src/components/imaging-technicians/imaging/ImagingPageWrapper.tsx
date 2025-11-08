"use client";
import axios from "axios";
import { Camera } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import OrderInfo from "./OrderInfo";
import Loading from "@/components/common/Loading";
import UploadedStudies from "./UploadedStudies";
import FileUpload from "./FileUpload";
import { ImagingOrderStatus } from "@/enums/image-dicom.enum";
import { useGetImagingOrderByIdQuery } from "@/store/imagingOrderApi";
import { useUseGetDicomStudyByReferenceIdQuery } from "@/store/dicomStudyApi";
import { DicomStudy } from "@/interfaces/image-dicom/dicom-study.interface";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { useGetDicomSeriesReferencedIdQuery } from "@/store/dicomSeriesApi";
import { useGetMySchedulesByDateRangeQuery } from "@/store/employeeScheduleApi";
import { format } from "date-fns";

export default function ImagingPageWrapper({ order_id }: { order_id: string }) {
  const [files, setFiles] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState<DicomStudy | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<DicomSeries | null>(
    null
  );
  const [importProgress, setImportProgress] = useState<number>(0);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const fileInputRef = useRef(null);
  const [currentLevel, setCurrentLevel] = useState<
    "studies" | "series" | "instances"
  >("studies");
  let order = null;
  let studies = null;

  const { data: employeeScheduleData, isLoading: isLoadingSchedule } =
    useGetMySchedulesByDateRangeQuery({
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
    });

  console.log("Schedule:", employeeScheduleData);

  const { data: orderData, isLoading: isLoadingOrder } =
    useGetImagingOrderByIdQuery(order_id);

  if (!isLoadingOrder) {
    order = orderData.data;
  }

  const {
    data: studyData,
    isLoading: isLoadingStudy,
    refetch: refetchStudy,
  } = useUseGetDicomStudyByReferenceIdQuery(
    { id: order?.id ?? "", type: "order" },
    {
      skip: !order?.id,
    }
  );
  studies = studyData?.data ?? [];

  const {
    data: seriesData,
    isLoading: isLoadingSeries,
    refetch: refetchSeries,
  } = useGetDicomSeriesReferencedIdQuery(
    { id: selectedStudy?.id ?? "", type: "order" },
    {
      skip: !selectedStudy || !selectedStudy?.id,
    }
  );
  const series = seriesData?.data ?? [];

  if (isLoadingOrder) return <Loading />;

  return (
    <div>
      <div className="py-1">
        {!isLoadingOrder && orderData && (
          <OrderInfo order={orderData.data}></OrderInfo>
        )}
      </div>
      <div className="py-1">
        {orderData && (
          <UploadedStudies
            currentLevel={currentLevel}
            setCurrentLevel={setCurrentLevel}
            studies={studies}
            series={series}
          />
        )}
      </div>
      <div className="py-1">
        {order && order.orderStatus === ImagingOrderStatus.IN_PROGRESS ? (
          <FileUpload
            order={order}
            isImporting={isImporting}
            setIsImporting={setIsImporting}
            importProgress={importProgress}
            setImportProgress={setImportProgress}
            fileInputRef={fileInputRef}
            files={files}
            setFiles={setFiles}
          />
        ) : (
          <>
            {order && (
              <div className="px-5 py-20 mx-auto flex justify-center items-center bg-[var(--background)] rounded-lg shadow-lg p-6 border border-[var(--border)]">
                <span className="text-gray-400 italic text-s font-semibold">
                  This order has been {order.orderStatus}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
