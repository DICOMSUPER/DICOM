"use client";
import { DiagnosisReportPDF } from "@/components/pdf-generator/diagnosis-report";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { DicomStudyStatus } from "@/enums/image-dicom.enum";
import { DiagnosisStatus } from "@/enums/patient-workflow.enum";
import { TemplateType } from "@/enums/report-template.enum";
import { BodyPart } from "@/interfaces/image-dicom/body-part.interface";
import { ImagingModality } from "@/interfaces/image-dicom/imaging_modality.interface";
import {
  FilterReportTemplate,
  ReportTemplate,
} from "@/interfaces/patient/report-template.interface";
import { formatDate } from "@/lib/formatTimeDate";
import { useGetAllBodyPartsQuery } from "@/store/bodyPartApi";
import {
  useGetDiagnosisByIdQuery,
  useUpdateDiagnosisMutation,
} from "@/store/diagnosisApi";
import {
  useGetOneDicomStudyQuery,
  useUpdateDicomStudyMutation,
} from "@/store/dicomStudyApi";
import { usePhysicianApproveStudyMutation } from "@/store/dicomStudySignatureApi";
import {
  useHasSignatureQuery,
  useSetupSignatureMutation,
} from "@/store/digitalSignatureApi";
import { useGetAllImagingModalityQuery } from "@/store/imagingModalityApi";
import {
  useGetAllReportTemplatesQuery,
  useGetReportTemplateByIdQuery,
} from "@/store/reportTemplateApi";
import { useGetUserByIdQuery } from "@/store/userApi";
import { formatDateVN } from "@/utils/FormatDate";
import {
  AlertCircle,
  Calendar,
  ClipboardList,
  Download,
  FileText,
  Image,
  Notebook,
  Printer,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ModalApproveStudy } from "./modal-approve-study";
import { ModalSetUpSignature } from "./modal-setup";

interface ModalDiagnosisReportDetailProps {
  open: boolean;
  onClose: () => void;
  reportId: string;
}

export function ModalDiagnosisReportDetail({
  open,
  onClose,
  reportId,
}: ModalDiagnosisReportDetailProps) {
  // test pdf
  // const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const [filtersReportTemplate, setFiltersReportTemplate] =
    useState<FilterReportTemplate>({
      modalityId: "",
      templateType: TemplateType.STANDARD,
      bodyPartId: "",
    });
  const {
    data: report,
    isLoading,
    refetch,
  } = useGetDiagnosisByIdQuery(reportId, {
    skip: !reportId || !open,
  });

  const [modalSetupOpen, setModalSetupOpen] = useState(false);
  const [modalApproveOpen, setModalApproveOpen] = useState(false);
  const [selectedStudyId, setSelectedStudyId] = useState<string>("");

  const [selectedReportTemplateId, setSelectedReportTemplateId] =
    useState<string>("");

  const [isEditDescriptionOpen, setIsEditDescriptionOpen] = useState(false);
  const [editedDescription, setEditedDescription] = useState<string>("");
  const [editedReportDescription, setEditedReportDescription] =
    useState<string>("");

  const { data: hasSignatureData, isLoading: isHasSignatureLoading } =
    useHasSignatureQuery(undefined, {
      skip: !open,
    });

  // update dicom study status
  const [updateDicomStudy, { isLoading: isUpdatingDicomStudy }] =
    useUpdateDicomStudyMutation();

  const { data: imagingModalitiesData, isLoading: isImagingModalitiesLoading } =
    useGetAllImagingModalityQuery(undefined, {
      skip: !open || isEditDescriptionOpen === false,
    });
  const { data: bodyPartsData, isLoading: isBodyPartsLoading } =
    useGetAllBodyPartsQuery(undefined, {
      skip: !open || isEditDescriptionOpen === false,
    });

  const { data: reportTemplatesData, isLoading: isReportTemplatesLoading } =
    useGetAllReportTemplatesQuery(filtersReportTemplate, {
      skip:
        !open ||
        !isEditDescriptionOpen ||
        !filtersReportTemplate.bodyPartId ||
        !filtersReportTemplate.modalityId,
    });

  const {
    data: selectedReportTemplate,
    isLoading: isSelectedReportTemplateLoading,
  } = useGetReportTemplateByIdQuery(selectedReportTemplateId, {
    skip: !selectedReportTemplateId || !open || isEditDescriptionOpen === false,
  });

  // pdf url state
  // get study id by study id
  const { data: dicomStudyData, isLoading: isDicomStudyLoading } =
    useGetOneDicomStudyQuery(report?.data?.studyId as string, {
      skip: !report?.data.studyId || !open,
    });

  // get ordering physician from dicomStudyData and radiologist
  const { data: radiologistData, isLoading: isRadiologistLoading } =
    useGetUserByIdQuery(report?.data.diagnosedBy || "", {
      skip: !report?.data.diagnosedBy || !open,
    });

  const { data: orderingPhysicianData, isLoading: isOrderingPhysicianLoading } =
    useGetUserByIdQuery(
      dicomStudyData?.data.imagingOrder?.imagingOrderForm
        ?.orderingPhysicianId || "",
      {
        skip:
          !dicomStudyData?.data.imagingOrder?.imagingOrderForm
            ?.orderingPhysicianId || !open,
      }
    );

  // const handleGeneratePDF = () => {
  //   const url = DiagnosisReportPDF({
  //     diagnosisReportPDF: { report: report?.data! },
  //     dicomStudy: dicomStudyData?.data,
  //     orderingPhysicianName: `${orderingPhysicianData?.data?.firstName} ${orderingPhysicianData?.data?.lastName}`,
  //     radiologistName: `${radiologistData?.data?.firstName} ${radiologistData?.data?.lastName}`,
  //   });
  //   setPdfUrl(url);
  // };

  const [updateDiagnosisMutation, { isLoading: isUpdating }] =
    useUpdateDiagnosisMutation();

  // check if user have signature

  // handle set up signature
  const [setupSignature, { isLoading: isSettingUpSignatureLoading }] =
    useSetupSignatureMutation();

  const [physicianApproveStudy, { isLoading: isApprovingStudyLoading }] =
    usePhysicianApproveStudyMutation();

  const router = useRouter();

  // Load template content when selected
  useEffect(() => {
    if (
      selectedReportTemplate?.data &&
      selectedReportTemplateId &&
      isEditDescriptionOpen
    ) {
      const template = selectedReportTemplate.data;
      const sections = [
        template.technicalTemplate &&
          `Technical:\n${template.technicalTemplate}`,
        template.descriptionTemplate &&
          `Description:\n${template.descriptionTemplate}`,
        template.findingsTemplate && `Findings:\n${template.findingsTemplate}`,
        template.conclusionTemplate &&
          `Conclusion:\n${template.conclusionTemplate}`,
        template.recommendationTemplate &&
          `Recommendation:\n${template.recommendationTemplate}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      setEditedDescription(sections);
    }
  }, [selectedReportTemplate, selectedReportTemplateId, isEditDescriptionOpen]);

  useEffect(() => {
    console.log("editedReportDescription changed:", editedReportDescription);
  }, [editedReportDescription]);

  const handleEditDescriptionOpen = useCallback(() => {
    setIsEditDescriptionOpen(true);
    setFiltersReportTemplate({
      modalityId: "",
      templateType: TemplateType.STANDARD,
      bodyPartId: "",
    });
    setEditedDescription("");
    setEditedReportDescription(report?.data?.description || "");
  }, [report?.data?.description]);

  const handleSelectChange = useCallback(
    (key: keyof FilterReportTemplate, value: string) => {
      setFiltersReportTemplate((prev) => ({
        ...prev,
        [key]: value,
      }));

      setSelectedReportTemplateId("");
      setEditedDescription("");
    },
    []
  );

  const handleSelectTemplate = useCallback((templateId: string) => {
    setSelectedReportTemplateId(templateId);
  }, []);

  const handleEditDescriptionClose = useCallback(() => {
    setIsEditDescriptionOpen(false);
    setEditedDescription("");
    setEditedReportDescription("");
    setSelectedReportTemplateId("");
    setFiltersReportTemplate({
      modalityId: "",
      templateType: TemplateType.STANDARD,
      bodyPartId: "",
    });
  }, []);

  const handleApplyTemplate = useCallback(() => {
    setEditedReportDescription((prev) => {
      const newValue = editedDescription;
      return newValue;
    });

    toast.success("Template applied to description");
  }, [editedDescription]);

  const handleSaveDescription = useCallback(async () => {
    try {
      const descriptionToSave = editedReportDescription.trim();
      console.log("Description to save (trimmed):", descriptionToSave);

      if (!descriptionToSave) {
        toast.error("Description cannot be empty");
        return;
      }

      await updateDiagnosisMutation({
        id: reportId,
        updateDiagnosis: {
          description: descriptionToSave,
          reportTemplateId: selectedReportTemplateId,
        },
      }).unwrap();
      await refetch();
      toast.success("Report description updated successfully");
      handleEditDescriptionClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save description");
    }
  }, [
    editedReportDescription,
    editedDescription,
    reportId,
    updateDiagnosisMutation,
    refetch,
    handleEditDescriptionClose,
  ]);

  const handleSetUpSignature = async (userId: string, pin: string) => {
    try {
      await setupSignature({ userId, pin }).unwrap();
      toast.success("Signature set up successfully");
      setModalSetupOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to set up signature");
    }
  };

  const onCloseModal = useCallback(() => {
    onClose();
    setIsEditDescriptionOpen(false);

    setEditedDescription("");
    setEditedReportDescription("");
    setSelectedReportTemplateId("");
    setSelectedStudyId("");
    setFiltersReportTemplate({
      modalityId: "",
      templateType: TemplateType.STANDARD,
      bodyPartId: "",
    });
  }, [onClose]);

  const getStatusBadge = (status: DiagnosisStatus) => {
    switch (status) {
      case DiagnosisStatus.ACTIVE:
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200 transition-colors">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2" />
            Active
          </Badge>
        );
      case DiagnosisStatus.RESOLVED:
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 transition-colors">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            Resolved
          </Badge>
        );
      case DiagnosisStatus.RULED_OUT:
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 transition-colors">
            <div className="w-2 h-2 bg-slate-500 rounded-full mr-2" />
            Ruled Out
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApproveStudy = async (studyId: string, pin: string) => {
    try {
      await physicianApproveStudy({
        studyId,
        pin,
      }).unwrap();
      toast.success("Study approved successfully");
      setModalApproveOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve study");
    }
  };

  const handleEnterApprove = async (studyId: string) => {
    try {
      if (hasSignatureData?.data.hasSignature === false) {
        toast.error(
          "You need to set up your digital signature before approving."
        );
        setModalSetupOpen(true);
        return;
      }
      setSelectedStudyId(studyId);
      setModalApproveOpen(true);
    } catch (error: any) {}
  };
  const handleViewImage = () => {
    router.push(`/viewer?study=${report?.data.studyId}`);
  };
  const handleDownloadReport = async () => {
    try {
      const result = await updateDicomStudy({
        id: report?.data.studyId as string,
        data: { studyStatus: DicomStudyStatus.RESULT_PRINTED },
      }).unwrap();

      if (result.success) {
        console.log("result", result);
        DiagnosisReportPDF({
          diagnosisReportPDF: { report: report?.data! },
          dicomStudy: dicomStudyData?.data,
          orderingPhysicianName: `${orderingPhysicianData?.data?.firstName} ${orderingPhysicianData?.data?.lastName}`,
          radiologistName: `${radiologistData?.data?.firstName} ${radiologistData?.data?.lastName}`,
        });
        toast.success("Report created successfully!");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save description");
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent
          className="!max-w-7xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader className="sticky top-0 z-10 bg-gradient-to-r from-slate-50 via-slate-50 to-teal-50 border-b border-slate-200 px-8 py-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                Diagnosis Report Detail
              </DialogTitle>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-teal-600 mb-4"></div>
              <p className="text-slate-500 font-medium">
                Loading report details...
              </p>
            </div>
          ) : report ? (
            <div className="space-y-6 px-8 py-6">
              <div className="bg-gradient-to-br from-teal-50 to-slate-50 rounded-xl p-6 border border-teal-200/50 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
                      Patient Information
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {report.data.encounter?.patient?.firstName}{" "}
                      {report.data.encounter?.patient?.lastName}
                    </div>
                    <div className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="inline-block w-1 h-1 bg-slate-400 rounded-full"></span>
                      ID: {report.data.encounter?.patient?.patientCode}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
                      Diagnosis Name
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {report.data.diagnosisName}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      {getStatusBadge(report.data.diagnosisStatus)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Diagnosis Date Card */}
                <div className="group bg-white border border-slate-200/60 rounded-xl p-5 transition-all hover:shadow-md hover:border-teal-200/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    Diagnosis Date
                  </div>
                  <div className="text-lg font-semibold text-slate-900">
                    {formatDate(report.data.diagnosisDate)}
                  </div>
                </div>

                {/* Diagnosis Type Card */}
                <div className="group bg-white border border-slate-200/60 rounded-xl p-5 transition-all hover:shadow-md hover:border-teal-200/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                    <ClipboardList className="w-4 h-4 text-teal-600" />
                    Diagnosis Type
                  </div>
                  <Badge
                    variant="outline"
                    className="text-sm font-medium bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 transition-colors"
                  >
                    {report.data.diagnosisType}
                  </Badge>
                </div>

                {/* Severity Card */}
                <div className="group bg-white border border-slate-200/60 rounded-xl p-5 transition-all hover:shadow-md hover:border-teal-200/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                    <AlertCircle className="w-4 h-4 text-teal-600" />
                    Severity Level
                  </div>
                  <Badge
                    variant="outline"
                    className="text-sm font-medium bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 transition-colors"
                  >
                    {report.data.severity || "N/A"}
                  </Badge>
                </div>
              </div>
              <Separator className="my-2 bg-slate-200/50" />

              {/* study data */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Study Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Study Instance UID */}
                  <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-blue-100">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                      Study Instance UID
                    </div>
                    <div className="text-sm text-slate-900 font-mono truncate">
                      {dicomStudyData?.data.studyInstanceUid || "N/A"}
                    </div>
                  </div>

                  {/* Study Date & Time */}
                  <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-blue-100">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Study Date & Time
                    </div>
                    <div className="text-sm text-slate-900 font-medium">
                      {dicomStudyData?.data.studyDate
                        ? `${formatDateVN(dicomStudyData.data.studyDate)} ${
                            dicomStudyData.data.studyTime || ""
                          }`
                        : "N/A"}
                    </div>
                  </div>

                  {/* Study Status */}
                  <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-blue-100">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                      Study Status
                    </div>
                    <Badge
                      className={`
          ${
            dicomStudyData?.data.studyStatus === DicomStudyStatus.APPROVED
              ? "bg-green-100 text-green-700 border-green-300"
              : ""
          }
          ${
            dicomStudyData?.data.studyStatus ===
            DicomStudyStatus.TECHNICIAN_VERIFIED
              ? "bg-blue-100 text-blue-700 border-blue-300"
              : ""
          }
          ${
            dicomStudyData?.data.studyStatus === DicomStudyStatus.SCANNED
              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
              : ""
          }
          ${
            dicomStudyData?.data.studyStatus === DicomStudyStatus.RESULT_PRINTED
              ? "bg-purple-100 text-purple-700 border-purple-300"
              : ""
          }
        `}
                    >
                      {dicomStudyData?.data.studyStatus?.replace(/_/g, " ") ||
                        "N/A"}
                    </Badge>
                  </div>

                  {/* Study Description */}
                  <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-blue-100 md:col-span-2">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                      Study Description
                    </div>
                    <div className="text-sm text-slate-900 font-medium">
                      {dicomStudyData?.data.studyDescription || "N/A"}
                    </div>
                  </div>

                  {/* Number of Series */}
                  <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-blue-100">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                      Number of Series
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {dicomStudyData?.data.numberOfSeries || 0}
                    </div>
                  </div>
                </div>

                {/* Modality Machine */}
                {dicomStudyData?.data.modalityMachine && (
                  <div className="mt-4 bg-white/80 backdrop-blur rounded-lg p-4 border border-blue-100">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Modality Machine
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">
                          Machine Name
                        </div>
                        <div className="text-sm font-medium text-slate-900">
                          {dicomStudyData.data.modalityMachine.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">
                          Manufacturer
                        </div>
                        <div className="text-sm font-medium text-slate-900">
                          {dicomStudyData.data.modalityMachine.manufacturer}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Model</div>
                        <div className="text-sm font-medium text-slate-900">
                          {dicomStudyData.data.modalityMachine.model}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">
                          Modality Type
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {
                            dicomStudyData.data.modalityMachine.modality
                              ?.modalityCode
                          }{" "}
                          -{" "}
                          {
                            dicomStudyData.data.modalityMachine.modality
                              ?.modalityName
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Imaging Order */}
                {dicomStudyData?.data.imagingOrder && (
                  <div className="mt-4 bg-white/80 backdrop-blur rounded-lg p-4 border border-blue-100">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Imaging Order
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">
                          Order Number
                        </div>
                        <div className="text-sm font-medium text-slate-900">
                          #{dicomStudyData.data.imagingOrder.orderNumber}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">
                          Order Status
                        </div>
                        <Badge
                          className={`
              ${
                dicomStudyData.data.imagingOrder.orderStatus === "completed"
                  ? "bg-green-100 text-green-700 border-green-300"
                  : ""
              }
              ${
                dicomStudyData.data.imagingOrder.orderStatus === "pending"
                  ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                  : ""
              }
            `}
                        >
                          {dicomStudyData.data.imagingOrder.orderStatus}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">
                          Contrast Required
                        </div>
                        <Badge
                          variant={
                            dicomStudyData.data.imagingOrder.contrastRequired
                              ? "default"
                              : "outline"
                          }
                        >
                          {dicomStudyData.data.imagingOrder.contrastRequired
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                    </div>

                    {/* Procedure */}
                    {dicomStudyData.data.imagingOrder.procedure && (
                      <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                        <div className="text-xs font-semibold text-blue-700 mb-2">
                          Procedure
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <div className="text-xs text-slate-500 mb-1">
                              Procedure Name
                            </div>
                            <div className="text-sm font-medium text-slate-900">
                              {dicomStudyData.data.imagingOrder.procedure.name}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">
                              Body Part
                            </div>
                            <div className="text-sm font-medium text-slate-900">
                              {dicomStudyData.data.imagingOrder.procedure
                                .bodyPart?.name || "N/A"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">
                              Modality
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {
                                dicomStudyData.data.imagingOrder.procedure
                                  .modality?.modalityCode
                              }
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Clinical Indication */}
                    {dicomStudyData.data.imagingOrder.clinicalIndication && (
                      <div className="mt-3">
                        <div className="text-xs text-slate-500 mb-1">
                          Clinical Indication
                        </div>
                        <div className="text-sm text-slate-900">
                          {dicomStudyData.data.imagingOrder.clinicalIndication}
                        </div>
                      </div>
                    )}

                    {/* Special Instructions */}
                    {dicomStudyData.data.imagingOrder.specialInstructions && (
                      <div className="mt-2">
                        <div className="text-xs text-slate-500 mb-1">
                          Special Instructions
                        </div>
                        <div className="text-sm text-slate-900">
                          {dicomStudyData.data.imagingOrder.specialInstructions}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Series List */}
                {dicomStudyData?.data.series &&
                  dicomStudyData.data.series.length > 0 && (
                    <div className="mt-4 bg-white/80 backdrop-blur rounded-lg p-4 border border-blue-100">
                      <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Series ({dicomStudyData.data.series.length})
                      </div>
                      <div className="space-y-2">
                        {dicomStudyData.data.series.map(
                          (series: any, index: number) => (
                            <div
                              key={series.id}
                              className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 hover:border-blue-200 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-mono"
                                    >
                                      Series #{series.seriesNumber}
                                    </Badge>
                                    <div className="text-sm font-medium text-slate-900">
                                      {series.seriesDescription}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                    <div>
                                      <span className="text-slate-500">
                                        Body Part:
                                      </span>{" "}
                                      <span className="text-slate-900 font-medium">
                                        {series.bodyPartExamined}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">
                                        Protocol:
                                      </span>{" "}
                                      <span className="text-slate-900 font-medium">
                                        {series.protocolName}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">
                                        Instances:
                                      </span>{" "}
                                      <span className="text-slate-900 font-medium">
                                        {series.numberOfInstances}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">
                                        Time:
                                      </span>{" "}
                                      <span className="text-slate-900 font-medium">
                                        {series.seriesTime}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

              <Separator className="my-6 bg-slate-200/50" />

              {!isEditDescriptionOpen ? (
                <Button
                  disabled={
                    dicomStudyData?.data.studyStatus ===
                    DicomStudyStatus.APPROVED 
                    // || dicomStudyData?.data.studyStatus ===
                    // DicomStudyStatus.RESULT_PRINTED
                  }
                  className="w-full"
                  onClick={handleEditDescriptionOpen}
                >
                  <div className="flex items-center justify-center">
                    <Notebook className="w-4 h-4 mr-2" />
                    Edit Report Description
                  </div>
                </Button>
              ) : (
                <Button className="w-full" onClick={handleEditDescriptionClose}>
                  <div className="flex items-center justify-center">
                    <Notebook className="w-4 h-4 mr-2" />
                    Close Edit Mode
                  </div>
                </Button>
              )}

              {/* Display standard report template of diagnosis including selector and textarea */}
              {isEditDescriptionOpen && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200/60 rounded-xl p-6">
                    <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                      <FileText className="w-4 h-4 text-teal-600" />
                      Choose Template
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <Select
                        value={filtersReportTemplate.bodyPartId}
                        onValueChange={(value) =>
                          handleSelectChange("bodyPartId", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Body Parts" />
                        </SelectTrigger>
                        <SelectContent>
                          {bodyPartsData?.data.map((bodyPart: BodyPart) => (
                            <SelectItem key={bodyPart.id} value={bodyPart.id}>
                              {bodyPart.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filtersReportTemplate.modalityId}
                        onValueChange={(value) =>
                          handleSelectChange("modalityId", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Modalities" />
                        </SelectTrigger>
                        <SelectContent>
                          {imagingModalitiesData?.data.map(
                            (modality: ImagingModality) => (
                              <SelectItem key={modality.id} value={modality.id}>
                                {modality.modalityName}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedReportTemplateId}
                        onValueChange={handleSelectTemplate}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              isReportTemplatesLoading
                                ? "Loading..."
                                : "Select report template"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTemplatesData?.data.map(
                            (report: ReportTemplate) => (
                              <SelectItem
                                key={report.reportTemplatesId}
                                value={report.reportTemplatesId}
                              >
                                {report.templateName}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Template Preview */}
                  <div className="bg-white border border-slate-200/60 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                        <FileText className="w-4 h-4 text-teal-600" />
                        Template Preview
                      </div>
                      <Button
                        onClick={handleApplyTemplate}
                        disabled={!editedDescription.trim()}
                        className="bg-gradient-to-r from-teal-600 to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Notebook className="w-4 h-4 mr-2" />
                        Apply to Description
                      </Button>
                    </div>
                    <Textarea
                      className="w-full min-h-[300px] text-slate-900 font-medium"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      placeholder="Select a template above to preview content here..."
                    />
                  </div>

                  {/* Description Textarea */}
                  <div className="bg-white border border-slate-200/60 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                        <FileText className="w-4 h-4 text-teal-600" />
                        Description
                      </div>
                      <Button
                        onClick={handleSaveDescription}
                        disabled={!editedReportDescription.trim() || isUpdating}
                        className="bg-gradient-to-r from-green-600 to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {isUpdating ? "Saving..." : "Save Description"}
                      </Button>
                    </div>
                    <Textarea
                      className="w-full min-h-[300px] text-slate-900 font-medium"
                      value={editedReportDescription}
                      onChange={(e) =>
                        setEditedReportDescription(e.target.value)
                      }
                      placeholder="Click 'Apply to Description' to load template content here, or type directly..."
                    />
                  </div>
                </div>
              )}

              {/* Display existing description when not in edit mode */}
              {!isEditDescriptionOpen && report.data.description && (
                <div className="bg-white border border-slate-200/60 rounded-xl p-6">
                  <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <FileText className="w-4 h-4 text-teal-600" />
                    Description
                  </div>
                  <div className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                    {report.data.description}
                  </div>
                </div>
              )}

              {report.data.notes && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-6">
                  <div className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Additional Notes
                  </div>
                  <div className="text-amber-900 whitespace-pre-wrap leading-relaxed font-medium">
                    {report.data.notes}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50">
                <Button
                  variant="outline"
                  onClick={onCloseModal}
                  disabled={isUpdating}
                  className="rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors font-medium bg-transparent"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleEnterApprove(report.data.studyId)}
                  disabled={
                    isUpdating ||
                    isHasSignatureLoading ||
                    dicomStudyData?.data.studyStatus ===
                      DicomStudyStatus.APPROVED ||
                    dicomStudyData?.data.studyStatus ===
                      DicomStudyStatus.RESULT_PRINTED
                  }
                  className="bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-lg transition-all hover:shadow-md font-medium"
                >
                  <Image className="w-4 h-4 mr-2" />
                  {DicomStudyStatus.APPROVED ===
                  dicomStudyData?.data.studyStatus
                    ? "Sign to Approve Study"
                    : "Study Approved"}
                </Button>
                <Button
                  onClick={handleViewImage}
                  disabled={isUpdating || isHasSignatureLoading}
                  className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-lg transition-all hover:shadow-md font-medium"
                >
                  <Image className="w-4 h-4 mr-2" />
                  View Image
                </Button>
                {dicomStudyData?.data.studyStatus !==
                  DicomStudyStatus.APPROVED && (
                  <Button
                    onClick={handleDownloadReport}
                    // onClick={handleGeneratePDF}
                    disabled={isUpdating || isUpdatingDicomStudy}
                    className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg transition-all hover:shadow-md font-medium"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print Report
                  </Button>
                )}
              </div>
              {/* {pdfUrl && (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title="Diagnosis Report PDF"
                />
              )} */}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No report found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ModalSetUpSignature
        open={modalSetupOpen}
        onClose={() => setModalSetupOpen(false)}
        onConfirm={handleSetUpSignature}
        userId={orderingPhysicianData?.data.id as string}
        isLoading={isSettingUpSignatureLoading}
      />
      <ModalApproveStudy
        open={modalApproveOpen}
        onClose={() => setModalApproveOpen(false)}
        onConfirm={handleApproveStudy}
        studyId={selectedStudyId}
        isLoading={isApprovingStudyLoading}
      />
    </div>
  );
}
