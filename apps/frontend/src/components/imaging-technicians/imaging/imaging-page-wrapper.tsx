"use client";
import axios from "axios";
import { Camera } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import OrderInfo from "./order-info";
import Loading from "@/components/common/Loading";
import UploadedStudies from "./upload-studies";
import FileUpload from "./file-upload";
import { ImagingOrderStatus } from "@/enums/image-dicom.enum";
import { useGetImagingOrderByIdQuery } from "@/store/imagingOrderApi";
import { useUseGetDicomStudyByReferenceIdQuery } from "@/store/dicomStudyApi";
import { DicomStudy } from "@/interfaces/image-dicom/dicom-study.interface";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { useGetDicomSeriesByReferenceQuery } from "@/store/dicomSeriesApi";
import { useGetCurrentEmployeeRoomAssignmentQuery } from "@/store/employeeRoomAssignmentApi";
import Cookies from "js-cookie";
import { useGetAllModalityMachineQuery } from "@/store/modalityMachineApi";
import { useGetInstancesByReferenceQuery } from "@/store/dicomInstanceApi";
import { useUploadDicomFileMutation } from "@/store/imagingApi";
import { useGetPatientByIdQuery } from "@/store/patientApi";
import { useGetUserByIdQuery } from "@/store/userApi";
import PatientInfo from "./patient-info";
import PhysicianInfo from "./physician-info";
import ProcedureInfo from "./procedure-info";
import { MachineStatus } from "@/enums/machine-status.enum";

export default function ImagingPageWrapper({ order_id }: { order_id: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<DicomStudy | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<DicomSeries | null>(
    null
  );
  const [importProgress, setImportProgress] = useState<number>(0);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse user from cookies - must be done before hooks
  const userString = typeof window !== "undefined" ? Cookies.get("user") : null;
  const user = userString ? JSON.parse(userString) : null;
  const userId = user?.id;

  //get roomId
  const { data: currentEmployeeSchedule } =
    useGetCurrentEmployeeRoomAssignmentQuery(userId || "", { skip: !userId });

  //get order
  const { data: orderData, isLoading: isLoadingOrder } =
    useGetImagingOrderByIdQuery(order_id);

  //get studies related to this order
  const { data: studyData, refetch: refetchStudy } =
    useUseGetDicomStudyByReferenceIdQuery(
      { id: orderData?.data?.id ?? "", type: "order" },
      { skip: !orderData?.data?.id }
    );

  //get patient related to this order
  const { data: patientData, isLoading: isLoadingPatient } =
    useGetPatientByIdQuery(
      orderData?.data?.imagingOrderForm?.patientId as string,
      {
        skip: !orderData?.data?.imagingOrderForm?.patientId,
      }
    );
  //get series if a study is selected
  const { data: seriesData, refetch: refetchSeries } =
    useGetDicomSeriesByReferenceQuery(
      { id: selectedStudy?.id ?? "", type: "study" },
      { skip: !selectedStudy?.id }
    );

  //get physician related to this order
  const { data: physicianData, isLoading: isLoadingPhysician } =
    useGetUserByIdQuery(
      orderData?.data?.imagingOrderForm?.orderingPhysicianId as string,
      {
        skip: !orderData?.data?.imagingOrderForm?.orderingPhysicianId,
      }
    );
  //get instances if a series is selected
  const { data: instanceData, refetch: refetchInstance } =
    useGetInstancesByReferenceQuery(
      { id: selectedSeries?.id ?? "", type: "series" },
      { skip: !selectedSeries?.id }
    );

  const currentRoomId =
    currentEmployeeSchedule?.data?.roomSchedule?.room_id || null;

  //get all machine suitable for this order in this room
  const { data: modalityMachinesData, isLoading: isLoadingModalityMachines } =
    useGetAllModalityMachineQuery(
      {
        modalityId: orderData?.data?.procedure?.modalityId as string,
        roomId: currentRoomId as string,
        status: MachineStatus.ACTIVE,
      },
      {
        skip: !orderData?.data?.procedure?.modalityId || !currentRoomId,
      }
    );

  const [uploadDicomFile] = useUploadDicomFileMutation();

  // Store orderId in localStorage when order page loads
  useEffect(() => {
    if (order_id) {
      localStorage.setItem("imagingOrderId", order_id);
    }
  }, [order_id]);

  if (isLoadingOrder) return <Loading />;

  const order = orderData?.data;
  // Extract arrays from paginated responses
  const studies = Array.isArray(studyData?.data) ? studyData.data : [];

  const series = Array.isArray(seriesData?.data) ? seriesData.data : [];

  const instances = Array.isArray(instanceData?.data) ? instanceData.data : [];

  const modalityMachines = Array.isArray(modalityMachinesData?.data)
    ? modalityMachinesData.data
    : [];

  const patient = patientData?.data;

  const physician = physicianData?.data;

  const procedure = order?.procedure;
  const handleUploadDicomFile = async (
    dicomFile: File,
    modalityMachineId: string
  ) => {
    await uploadDicomFile({
      dicomFile,
      orderId: order?.id as string,
      performingTechnicianId: userId,
      modalityMachineId,
    }).unwrap();

    refetchStudy();
    if (selectedStudy) refetchSeries();
    if (selectedSeries) refetchInstance();
  };
  return (
    <div>
      <div className="py-1">
        {!isLoadingOrder && orderData && (
          <OrderInfo
            order={orderData.data}
            patient={patient}
            physician={physician}
            procedure={procedure}
          ></OrderInfo>
        )}
      </div>
      <div className="py-1">
        {orderData && (
          <UploadedStudies
            studies={studies}
            series={series}
            instances={instances}
            selectedStudy={selectedStudy}
            selectedSeries={selectedSeries}
            onStudySelect={setSelectedStudy}
            onSeriesSelect={setSelectedSeries}
          />
        )}
      </div>
      <div className="py-1">
        {order && order.orderStatus === ImagingOrderStatus.IN_PROGRESS ? (
          <FileUpload
            enabled={
              modalityMachines.length > 0 && !isLoadingModalityMachines && order
                ? true
                : false
            }
            order={order}
            isImporting={isImporting}
            setIsImporting={setIsImporting}
            importProgress={importProgress}
            setImportProgress={setImportProgress}
            machines={modalityMachines}
            isLoadingModalityMachines={isLoadingModalityMachines}
            fileInputRef={fileInputRef}
            file={file}
            setFile={setFile}
            onUpload={handleUploadDicomFile}
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
