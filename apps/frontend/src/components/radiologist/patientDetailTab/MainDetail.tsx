"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Eye,
  Settings,
  Video,
  FileText,
  Image,
  MessageSquare,
  Mail,
  Clipboard,
  CheckCircle,
  Stethoscope,
} from "lucide-react";

import { useCreateDiagnosisMutation, useUpdateDiagnosisMutation } from "@/store/diagnosisApi";
import { CreateDiagnosisReportDto, DiagnosisStatus, DiagnosisType, Severity } from "@/interfaces/patient/patient-workflow.interface";

import PinDialog from "./PinDialog";
import { useSignDataMutation, useGetDigitalSignatureByIdQuery } from "@/store/digitalSignatureApi";
import { SignDataDto } from "@/interfaces/user/digital-signature.interface";
import RichTextEditor from "@/components/radiologist/editor/RichTextEditor";
import SelectTemplateDialog from "./SelectTemplateDialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RejectDicomDialog from "./RejectDicomDialog";

import html2pdf from "html2pdf.js";
import PrintDiagnosis from "./PrintDiagnosis";
import { useGetOneDicomStudyQuery, useUpdateDicomStudyMutation } from "@/store/dicomStudyApi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useGetUserByIdQuery } from "@/store/userApi";
import SignatureDisplay from "@/components/common/signature-display";
import { useUpdateImagingOrderMutation } from "@/store/imagingOrderApi";
import { DicomStudyStatus } from "@/enums/image-dicom.enum";

const AdvancedToolsTab = () => <div>Advanced Tools Content</div>;
const VideoTab = () => <div>Video Content</div>;
const FilesTab = () => <div>Files Content</div>;
const IKQTab = () => <div>In IKQ Content</div>;
const ReceiveTab = () => <div>In nhận Content</div>;
const PortalTab = () => <div>Tra cứu Portal Content</div>;

type TabValue =
  | "info"
  | "view"
  | "advanced"
  | "video"
  | "files"
  | "ikq"
  | "receive"
  | "portal";

const MedicalRecordMain = ({
  selectedExam,
  selectedStudyId,
  diagnosisData,
  isDiagnosisLoading,
  refetchDiagnosis,
  encounterId,
  patientId,
}: any) => {
  const [createDiagnosis] = useCreateDiagnosisMutation();
  const [updateDiagnosis] = useUpdateDiagnosisMutation();
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("info");
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [signerId, setSignerId] = useState<string | null>(null);
  const [signerUser, setSignerUser] = useState<any>(null);
  const [signData] = useSignDataMutation();
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [updateStudyDicom] = useUpdateDicomStudyMutation();

  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);



  const { data: studyDetail, refetch: refetchStudy } = useGetOneDicomStudyQuery(selectedStudyId, {
    skip: !selectedStudyId,
  });
  const [updateImagingOrder] = useUpdateImagingOrderMutation();



  const technicianId = studyDetail?.data?.performingTechnicianId;

  const { data: technicianSignature } = useGetUserByIdQuery(technicianId!, {
    skip: !technicianId,
  });



  const handleRejectDicom = async (reason: string) => {
    try {
      const payload = {
        reason,
        status: "rejected" as const,
      };

      await updateStudyDicom({ id: selectedStudyId, data: payload });

      toast.success("Reject DICOM thành công!");
      setIsRejectOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Reject thất bại!");
    }
  };



  const handleUpdateDiagnosis = async () => {
    const payload = {
      description,
      diagnosisStatus: "pending_approval" as DiagnosisStatus,
    };

    try {
      await updateDiagnosis({
        id: diagnosisData?.data?.[0].id,
        updateDiagnosis: payload,
      });

      toast.success("Đã cập nhật chẩn đoán!");
      setIsEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    }
  };

  const handleExportPdf = () => {
    if (!printRef.current) return;
    const options = {
      margin: 10,
      filename: "Diagnosis-Report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(printRef.current).set(options).save();
  };

  useEffect(() => {
    const saved = diagnosisData?.data?.[0];
    if (saved?.signatureId) setSignerId(saved.signatureId);
  }, [diagnosisData]);

  const { data: signerSignature } = useGetDigitalSignatureByIdQuery(signerId!, {
    skip: !signerId,
  });

  useEffect(() => {
    if (signerSignature?.data?.signature?.user) {
      setSignerUser(signerSignature.data.signature.user);
    }
  }, [signerSignature]);

  const handleOpenPinDialog = () => setIsPinDialogOpen(true);

  const handleConfirmPin = async (pin: string) => {
    try {
      const payload: SignDataDto = {
        pin,
        data: "This is the data to be signed",
      };
      const result = await signData(payload);
      const signatureId = result?.data?.data?.signatureId;
      setSignerId(signatureId);
      return signatureId;
    } catch (err) {
      console.error(err);
      toast.error("PIN sai hoặc ký thất bại!");
      throw new Error("PIN sai hoặc ký thất bại!");
    }
  };

  const handleSelectTemplate = (template: any) => {
    setDescription(template.descriptionTemplate ?? "");
  };

  const handleCreateDiagnosis = async () => {
    if (!selectedStudyId || !encounterId)
      return toast.warning("Thiếu study hoặc encounter ID!");

    if (!signerId)
      return toast.warning("Cần xác nhận PIN người ký!");

    const payload: CreateDiagnosisReportDto = {
      encounterId,
      studyId: selectedStudyId,
      diagnosisName: `Huy Nguyen (${new Date().toISOString().slice(0, 10)})`,
      description: description || "Nhập nội dung chẩn đoán...",
      diagnosisType: DiagnosisType.PRIMARY,
      severity: Severity.MODERATE,
      diagnosisDate: new Date().toISOString().slice(0, 10),
      diagnosedBy: signerUser?.id,
      diagnosisStatus: DiagnosisStatus.PENDING_APPROVAL,
      notes: "Patient to receive diabetic education before discharge.",
      signatureId: signerId,
    };

    try {
      await createDiagnosis(payload);
      await updateImagingOrder({
        id: studyDetail?.data?.imagingOrder?.id!,
        body: { orderStatus: "completed" },
      });

      await updateStudyDicom({ id: selectedStudyId, data: { status: DicomStudyStatus.PENDING_APPROVAL  } });

      // Refetch để hiển thị diagnosis vừa tạo
      if (refetchDiagnosis) {
        await refetchDiagnosis();
      }

      toast.success("Đã lưu chẩn đoán thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Lưu thất bại, vui lòng thử lại.");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "advanced":
        return <AdvancedToolsTab />;
      case "video":
        return <VideoTab />;
      case "files":
      case "receive":
        return <ReceiveTab />;
      case "portal":
        return <PortalTab />;
      default:
        return null;
    }
  };

  if (!selectedStudyId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        {/* <Card className="p-12 text-center shadow-lg rounded-2xl max-w-lg bg-white border-border"> */}
        <div className="flex flex-col items-center gap-4">
          <Stethoscope className="h-16 w-16 animate-bounce text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-700">Chào mừng đến với Medical Record</h1>
          <p className="text-gray-500">
            Vui lòng chọn một <span className="font-medium text-blue-600">Study</span> để bắt đầu.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="mt-4"
            onClick={() => toast("Hãy chọn Study từ danh sách bên trái!")}
          >
            Hướng dẫn chọn Study
          </Button>
        </div>
        {/* </Card> */}
      </div>
    );
  }

  if (isDiagnosisLoading)
    return <div className="flex-1 flex items-center justify-center">Đang tải...</div>;

  const hasDiagnosis = diagnosisData?.data?.length > 0;
  const diagnosis = diagnosisData?.data?.[0];

  return (
    <main className="flex-1 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabValue)} className="w-full">
          <TabsList className="bg-transparent border-b border-gray-200">
            {[
              { value: "info", label: "Nhận ca", icon: <Lock className="w-4 h-4" /> },
              { value: "view", label: "Xem hình", icon: <Eye className="w-4 h-4" /> },
              { value: "advanced", label: "Advanced Tools", icon: <Settings className="w-4 h-4" /> },
              { value: "video", label: "Video", icon: <Video className="w-4 h-4" /> },
              { value: "files", label: "Files", icon: <FileText className="w-4 h-4" /> },
              { value: "ikq", label: "In IKQ", icon: <Image className="w-4 h-4" /> },
              { value: "receive", label: "In nhận", icon: <MessageSquare className="w-4 h-4" /> },
              { value: "portal", label: "Portal", icon: <Mail className="w-4 h-4" /> },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 px-4 py-2"
                onClick={() => {
                  if (tab.value === "view") {
                    router.push(`/viewer?study=${selectedStudyId}&patient=${patientId}`);
                  }

                  if (tab.value === "ikq") {
                    handleExportPdf();
                  }
                }}
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1 p-6">
        {activeTab === "info" ? (
          <Card className="p-6 mx-auto">
            {!hasDiagnosis ? (
              <div>
                <Button size="sm" variant="outline" onClick={() => setIsTemplateOpen(true)}>
                  Chọn Template
                </Button>

                <RichTextEditor value={description} onChange={setDescription} />

                <Separator className="my-6" />

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-medium text-sm">Người ký (Alt + 1):</span>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={handleOpenPinDialog}>
                        <Clipboard className="h-4 w-4" />
                      </Button>
                      {signerId && (
                        <span className="ml-2 text-green-600 text-xs flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Đã ký</span>
                        </span>
                      )}
                    </div>
                    <div className="border border-gray-300 rounded h-24 bg-gray-50 flex flex-col items-center justify-center text-sm text-gray-700">
                      {signerUser ? (
                        <SignatureDisplay
                          firstName={signerUser.firstName}
                          lastName={signerUser.lastName}
                          role="Bác sĩ"
                          duration={1}
                          delay={0.3}
                        />
                      ) : (
                        "Chưa ký"
                      )}
                    </div>

                  </div>

                  <div>
                    <span className="font-medium text-sm">Kỹ thuật viên:</span>

                    <div className="border rounded h-24 bg-gray-50 flex flex-col items-center justify-center mt-3 text-sm text-gray-700">
                      {technicianSignature?.data ? (
                        <SignatureDisplay
                          firstName={technicianSignature.data.firstName}
                          lastName={technicianSignature.data.lastName}
                          role="Kỹ thuật viên"
                          duration={1}
                          delay={0.3}
                        />
                      ) : (
                        "Không tìm thấy kỹ thuật viên"
                      )}
                    </div>
                  </div>

                </div>

                <Button className="mt-6" onClick={handleCreateDiagnosis} disabled={!signerId}>
                  Tạo chẩn đoán
                </Button>

                <Button variant="destructive" className="mt-6 ml-3" onClick={() => setIsRejectOpen(true)}>
                  Reject DICOM
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {diagnosis.diagnosisStatus === "rejected" && (
                  <div className="flex gap-4 mb-4">
                    <Button variant="destructive" onClick={() => setIsReasonOpen(true)}>
                      View Reason
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setDescription(diagnosis.description);
                        setIsEditMode(true);
                      }}
                    >
                      Edit Diagnosis
                    </Button>
                  </div>
                )}

                {!isEditMode ? (
                  <>
                    <Button onClick={handleExportPdf}>In nhận (Xuất PDF)</Button>

                    <p className="whitespace-pre-line">{diagnosis.description}</p>

                    <Separator />

                    <h3 className="font-semibold">Thông tin người ký</h3>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <span className="font-medium text-sm block mb-3">Người ký:</span>
                        <div className="border rounded h-24 bg-gray-50 flex flex-col items-center justify-center">
                          {signerUser ? (
                            <SignatureDisplay
                              firstName={signerUser.firstName}
                              lastName={signerUser.lastName}
                              role="Bác sĩ"
                              duration={1}
                              delay={0.3}
                            />
                          ) : (
                            "Chưa ký"
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-sm block mb-3">Kỹ thuật viên:</span>
                        <div className="border rounded h-24 bg-gray-50 flex flex-col items-center justify-center">
                          {technicianSignature?.data ? (
                            <SignatureDisplay
                              firstName={technicianSignature.data.firstName}
                              lastName={technicianSignature.data.lastName}
                              role="Kỹ thuật viên"
                              duration={1}
                              delay={0.3}
                            />
                          ) : (
                            "Không tìm thấy kỹ thuật viên"
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <h2 className="font-semibold mb-4">Edit Diagnosis</h2>

                    <RichTextEditor value={description} onChange={setDescription} />

                    <div className="flex gap-3 mt-4">
                      <Button onClick={handleUpdateDiagnosis}>Save</Button>
                      <Button variant="outline" onClick={() => setIsEditMode(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                  <PrintDiagnosis
                    ref={printRef}
                    diagnosis={{
                      description: diagnosis.description,
                      diagnosisDate: diagnosis.diagnosisDate,
                      diagnosedByName: signerUser
                        ? `${signerUser.firstName} ${signerUser.lastName}`
                        : "—",
                      diagnosisType: diagnosis.diagnosisType,
                      severity: diagnosis.severity,
                      notes: diagnosis.notes,
                    }}
                    patientName={patientId}
                    encounterId={encounterId}
                  />
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-6 mx-auto">{renderTabContent()}</Card>
        )}

        <SelectTemplateDialog
          open={isTemplateOpen}
          onClose={() => setIsTemplateOpen(false)}
          modalityId={selectedStudyId.modalityId}
          bodyPartId={selectedStudyId.bodyPartId}
          onSelect={handleSelectTemplate}
        />

        <PinDialog open={isPinDialogOpen} onClose={() => setIsPinDialogOpen(false)} onSign={handleConfirmPin} />

        <RejectDicomDialog open={isRejectOpen} onClose={() => setIsRejectOpen(false)} onConfirm={handleRejectDicom} />

        <Dialog open={isReasonOpen} onOpenChange={setIsReasonOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lý do bị từ chối</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-gray-700">{diagnosis?.rejectionReason || "Không có lý do"}</p>

            <DialogFooter>
              <Button onClick={() => setIsReasonOpen(false)}>Đóng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ScrollArea>
    </main>
  );
};

export default MedicalRecordMain;