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
import {
  useUpdateDicomStudyMutation,
  useUseGetDicomStudyByReferenceIdQuery,
} from "@/store/dicomStudyApi";
import { DicomStudy } from "@/interfaces/image-dicom/dicom-study.interface";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { useGetDicomSeriesByReferenceQuery } from "@/store/dicomSeriesApi";
import { useGetCurrentEmployeeRoomAssignmentQuery } from "@/store/employeeRoomAssignmentApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useGetAllModalityMachineQuery } from "@/store/modalityMachineApi";
import { useGetInstancesByReferenceQuery } from "@/store/dicomInstanceApi";
import { useUploadDicomFileMutation } from "@/store/imagingApi";
import {
  useGetPatientByIdQuery,
  useUpdatePatientMutation,
} from "@/store/patientApi";
import { useGetUserByIdQuery } from "@/store/userApi";
import PatientInfo from "./patient-info";
import PhysicianInfo from "./physician-info";
import ProcedureInfo from "./procedure-info";
import { MachineStatus } from "@/enums/machine-status.enum";
import SignatureModal from "./signature-modal";
import SetupSignatureModal from "./setup-signature-modal";
import { useTechnicianVerifyStudyMutation } from "@/store/dicomStudySignatureApi";
import {
  useHasSignatureQuery,
  useSetupSignatureMutation,
} from "@/store/digitalSignatureApi";
import { toast } from "sonner";
import ChangeMrnModal from "./change-mrn-modal";

export default function ImagingPageWrapper({ order_id }: { order_id: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<DicomStudy | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<DicomSeries | null>(
    null
  );
  const [importProgress, setImportProgress] = useState<number>(0);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [forwardingStudyId, setForwardingStudyId] = useState<string | null>(
    null
  );
  const [setupSignatureModal, setSetupSignatureModal] =
    useState<boolean>(false);
  const [changeMrnModal, setChangeMrnModal] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Get userId from Redux auth state - middleware already handles authentication
  const userId = useSelector((state: RootState) => state.auth.user?.id) || null;

  //get roomId
  const { data: currentEmployeeSchedule } =
    useGetCurrentEmployeeRoomAssignmentQuery(userId!);

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
  const [updatePatient] = useUpdatePatientMutation();
  const [updateDicomStudy] = useUpdateDicomStudyMutation();
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
    : Array.isArray(modalityMachinesData)
    ? modalityMachinesData
    : Array.isArray(modalityMachinesData?.data?.data)
    ? modalityMachinesData?.data?.data
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
      performingTechnicianId: userId as string,
      modalityMachineId,
    }).unwrap();

    refetchStudy();
    if (selectedStudy) refetchSeries();
    if (selectedSeries) refetchInstance();
  };

  const handleChangeMrn = async (id: string, mrn: string) => {
    try {
      await updatePatient({ id, data: { patientCode: mrn } });
      setChangeMrnModal(null);

      studies.forEach(async (s) => {
        try {
          updateDicomStudy({ id: s.id, data: { patientCode: mrn } });
        } catch (error) {
          console.log(
            "Failed to update related studies for patient MRN",
            error
          );
        }
      });
      refetchStudy();

      toast.success("Patient MRN updated successfully");
    } catch (error) {
      toast.error("Failed to update Patient MRN");
    }
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
            handleChangeMrn={(id: string) => setChangeMrnModal(id)}
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
            refetchStudy={refetchStudy}
            forwardingStudyId={forwardingStudyId}
            setForwardingStudyId={setForwardingStudyId}
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
      <SignatureModal
        isOpen={forwardingStudyId !== null}
        onSetupSignature={() => {
          setSetupSignatureModal(true);
          setForwardingStudyId(null);
        }}
        onClose={() => {
          setForwardingStudyId(null);
        }}
        refetchStudy={refetchStudy}
        studyId={forwardingStudyId}
      />
      <SetupSignatureModal
        isOpen={setupSignatureModal}
        onClose={() => {
          setSetupSignatureModal(false);
        }}
      />
      <ChangeMrnModal
        isOpen={changeMrnModal !== null}
        onClose={() => {
          setChangeMrnModal(null);
        }}
        onSave={handleChangeMrn}
        patientId={changeMrnModal as string}
      />
    </div>
  );
}
