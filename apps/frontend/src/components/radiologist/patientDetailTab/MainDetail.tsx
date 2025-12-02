"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Lock, Eye, Settings, Video, FileText, Image, MessageSquare, Mail } from "lucide-react";

import { useCreateDiagnosisMutation } from "@/store/diagnosisApi";
import { CreateDiagnosisReportDto, DiagnosisType, Severity } from "@/interfaces/patient/patient-workflow.interface";

import PinDialog from "./PinDialog";
import { useSignDataMutation, useGetDigitalSignatureByIdQuery } from "@/store/digitalSignatureApi";
import { SignDataDto } from "@/interfaces/user/digital-signature.interface";
import RichTextEditor from "@/components/radiologist/editor/RichTextEditor";
import SelectTemplateDialog from "./SelectTemplateDialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Export PDF
import html2pdf from "html2pdf.js";
import PrintDiagnosis from "./PrintDiagnosis";

// ------------------- COMPONENT CÁC TAB -------------------
const AdvancedToolsTab = () => <div>Advanced Tools Content</div>;
const VideoTab = () => <div>Video Content</div>;
const FilesTab = () => <div>Files Content</div>;
const IKQTab = () => <div>In IKQ Content</div>;
const ReceiveTab = () => <div>In nhận Content</div>;
const PortalTab = () => <div>Tra cứu Portal Content</div>;

type TabValue = "info" | "view" | "advanced" | "video" | "files" | "ikq" | "receive" | "portal";

// ------------------- MAIN COMPONENT -------------------
const MedicalRecordMain = ({
  selectedStudyId,
  diagnosisData,
  isDiagnosisLoading,
  encounterId,
  patientId,
}: any) => {
  const [createDiagnosis] = useCreateDiagnosisMutation();
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("info");
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [signerId, setSignerId] = useState<string | null>(null);
  const [signerUser, setSignerUser] = useState<any>(null);
  const [signData] = useSignDataMutation();
  const router = useRouter();

  const printRef = useRef<HTMLDivElement>(null);

  // ------------------- EXPORT PDF -------------------
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

  // Load signerId từ DB nếu đã có
  useEffect(() => {
    const saved = diagnosisData?.data?.[0];
    if (saved?.signatureId) setSignerId(saved.signatureId);
  }, [diagnosisData]);

  // Lấy user ký theo signerId
  const { data: signerSignature } = useGetDigitalSignatureByIdQuery(signerId!, { skip: !signerId });
  useEffect(() => {
    if (signerSignature?.data?.signature?.user) {
      setSignerUser(signerSignature.data.signature.user);
    }
  }, [signerSignature]);

  // Xử lý ký PIN
  const handleOpenPinDialog = () => setIsPinDialogOpen(true);
  const handleConfirmPin = async (pin: string) => {
    try {
      const payload: SignDataDto = { pin, data: "This is the data to be signed" };
      const result = await signData(payload);
      const signatureId = result?.data?.data?.signatureId;
      setSignerId(signatureId);
      return signatureId;
    } catch (err) {
      console.error(err);
      throw new Error("PIN sai hoặc ký thất bại!");
    }
  };

  const handleSelectTemplate = (template: any) => {
    setDescription(template.descriptionTemplate ?? "");
  };

  const handleCreateDiagnosis = async () => {
    if (!selectedStudyId || !encounterId) return alert("Thiếu study hoặc encounter ID!");
    if (!signerId) return alert("Cần xác nhận PIN người ký!");

    const payload: CreateDiagnosisReportDto = {
      encounterId,
      studyId: selectedStudyId,
      diagnosisName: `Huy Nguyen (${new Date().toISOString().slice(0, 10)})`,
      description: description || "Nhập nội dung chẩn đoán...",
      diagnosisType: DiagnosisType.PRIMARY,
      severity: Severity.MODERATE,
      diagnosisDate: new Date().toISOString().slice(0, 10),
      diagnosedBy: signerUser?.id,
      notes: "Patient to receive diabetic education before discharge.",
      signatureId: signerId,
    };

    try {
      await createDiagnosis(payload);
      alert("Đã lưu chẩn đoán thành công!");
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại, vui lòng thử lại.");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "advanced":
        return <AdvancedToolsTab />;
      case "video":
        return <VideoTab />;
      case "files":
        return <FilesTab />;
      case "ikq":
        return <IKQTab />;
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
        <Card className="p-12 text-center shadow-lg rounded-2xl max-w-lg bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl animate-bounce">🩺</div>
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
        </Card>
      </div>
    );
  }

  if (isDiagnosisLoading)
    return <div className="flex-1 flex items-center justify-center">Đang tải thông tin chẩn đoán...</div>;

  const hasDiagnosis = diagnosisData?.data?.length > 0;
  const diagnosis = diagnosisData?.data?.[0];

  return (
    <main className="flex-1 flex flex-col">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabValue)} className="w-full">
          <TabsList className="bg-transparent border-b border-gray-200 rounded-none h-auto p-0">
            {[
              { value: "info", label: "Nhận ca", icon: <Lock className="w-4 h-4 mr-2" /> },
              { value: "view", label: "Xem hình", icon: <Eye className="w-4 h-4 mr-2" /> },
              { value: "advanced", label: "Advanced Tools", icon: <Settings className="w-4 h-4 mr-2" /> },
              { value: "video", label: "Video", icon: <Video className="w-4 h-4 mr-2" /> },
              { value: "files", label: "Files", icon: <FileText className="w-4 h-4 mr-2" /> },
              { value: "ikq", label: "In IKQ", icon: <Image className="w-4 h-4 mr-2" /> },
              { value: "receive", label: "In nhận", icon: <MessageSquare className="w-4 h-4 mr-2" /> },
              { value: "portal", label: "Portal", icon: <Mail className="w-4 h-4 mr-2" /> },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-4 py-2"
                onClick={() => {
                  if (tab.value === "view") {
                    toast.info("Đang chuyển đến viewer...");
                    router.push(`/viewer?study=${selectedStudyId}&patient=${patientId}`);
                  }
                }}
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Main content */}
      <ScrollArea className="flex-1 p-6">
        {activeTab === "info" ? (
          <Card className="p-6 mx-auto">
            {!hasDiagnosis ? (
              /* --- FORM CHẨN ĐOÁN MỚI --- */
              <div className="bg-white shadow-sm min-h-[80vh] p-10">
                <h1 className="text-lg font-semibold mb-6 text-center">CHẨN ĐOÁN MỚI</h1>

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
                        <span className="text-xs">📋</span>
                      </Button>
                      {signerId && <span className="ml-2 text-green-600 text-xs">✔ Đã ký</span>}
                    </div>
                    <div className="border border-gray-300 rounded h-24 bg-gray-50 flex items-center justify-center text-sm text-gray-700">
                      {signerUser ? `${signerUser.firstName} ${signerUser.lastName}` : "Chưa ký"}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-medium text-sm">Kỹ thuật viên:</span>
                    </div>
                    <div className="border border-gray-300 rounded h-24 bg-gray-50 flex items-center justify-center text-sm text-gray-700">
                      Nguyen Van Tech
                    </div>
                  </div>
                </div>

                <Button className="mt-6" onClick={handleCreateDiagnosis} disabled={!signerId}>
                  Tạo chẩn đoán
                </Button>
              </div>
            ) : (
              /* --- ĐÃ CÓ CHẨN ĐOÁN → HIỂN THỊ + NÚT IN NHẬN --- */
              <div className="space-y-6">
                <Button onClick={handleExportPdf} className="mb-4">
                  In nhận (Xuất PDF)
                </Button>

                <p className="whitespace-pre-line">{diagnosis?.description}</p>

                <Separator />

                <h3 className="font-semibold">Thông tin người ký</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="border border-gray-300 rounded h-24 bg-gray-50 flex items-center justify-center text-sm text-gray-700">
                    {signerUser ? `${signerUser.firstName} ${signerUser.lastName}` : "Không tìm thấy người ký"}
                  </div>
                  <div className="border border-gray-300 rounded h-24 bg-gray-50 flex items-center justify-center text-sm text-gray-700">
                    Kỹ thuật viên: Nguyen Van Tech
                  </div>
                </div>

                {/* Component off-screen để xuất PDF */}
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

        {/* Dialog Template */}
        <SelectTemplateDialog
          open={isTemplateOpen}
          onClose={() => setIsTemplateOpen(false)}
          modalityId={selectedStudyId.modalityId}
          bodyPartId={selectedStudyId.bodyPartId}
          onSelect={handleSelectTemplate}
        />

        {/* Dialog nhập PIN */}
        <PinDialog open={isPinDialogOpen} onClose={() => setIsPinDialogOpen(false)} onSign={handleConfirmPin} />
      </ScrollArea>
    </main>
  );
};

export default MedicalRecordMain;
