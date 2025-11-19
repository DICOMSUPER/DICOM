"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Lock, Eye, Settings, Video, FileText, Image, MessageSquare, Mail,
} from "lucide-react";

import { useCreateDiagnosisMutation } from "@/store/diagnosisApi";
import {
  CreateDiagnosisReportDto,
  DiagnosisType,
  Severity,
} from "@/interfaces/patient/patient-workflow.interface";

import PinDialog from "./PinDialog";
import {
  useSignDataMutation,
  useGetDigitalSignatureByIdQuery,
} from "@/store/digitalSignatureApi";

import { SignDataDto } from "@/interfaces/user/digital-signature.interface";
import RichTextEditor from "@/components/radiologist/editor/RichTextEditor";
import SelectTemplateDialog from "./SelectTemplateDialog";

const MedicalRecordMain = ({ selectedStudyId, diagnosisData, isDiagnosisLoading, encounterId }: any) => {
  const [createDiagnosis] = useCreateDiagnosisMutation();
  const [description, setDescription] = useState("");

  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);

  const [signerId, setSignerId] = useState<string | null>(null);
  const [signerUser, setSignerUser] = useState<any>(null);

  const [signData] = useSignDataMutation();
  const { data: signerSignature } = useGetDigitalSignatureByIdQuery(
    signerId!,
    { skip: !signerId }
  );

  // Cập nhật user sau khi ký
  useEffect(() => {
    if (signerSignature?.data?.signature?.user) {
      setSignerUser(signerSignature?.data?.signature?.user);
    }
  }, [signerSignature]);

  const handleOpenPinDialog = () => setIsPinDialogOpen(true);

  const handleConfirmPin = async (pin: string) => {
    try {
      const payload: SignDataDto = { pin, data: "This is the data to be signed" };
      const result = await signData(payload);

      const signatureId = result?.data?.data?.signatureId;
      console.log("Signature ID:", result?.data);
      setSignerId(signatureId);

      return signatureId;
    } catch (err) {
      console.error(err);
      throw new Error("PIN sai hoặc ký thất bại!");
    }
  };

  // Chọn template → đổ nội dung vào RichTextEditor
  const handleSelectTemplate = (template: any) => {
    setDescription(template.descriptionTemplate ?? "");
    console.log("Selected Template:", template);
  };

  const handleCreateDiagnosis = async () => {
    if (!selectedStudyId || !encounterId) return alert("Thiếu study hoặc encounter ID!");
    if (!signerId) return alert("Cần xác nhận PIN người ký!");

    const payload: CreateDiagnosisReportDto = {
      encounterId,
      studyId: selectedStudyId.id,
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
      setDescription("");
      setSignerId(null);
      setSignerUser(null);
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại, vui lòng thử lại.");
    }
  };

  if (!selectedStudyId)
    return <div className="flex-1 flex items-center justify-center text-gray-500">Chưa có Study — hãy tạo mới chẩn đoán.</div>;

  if (isDiagnosisLoading)
    return <div className="flex-1 flex items-center justify-center">Đang tải thông tin chẩn đoán...</div>;

  const hasDiagnosis = diagnosisData?.data?.length > 0;
  const diagnosis = diagnosisData?.data?.[0];

  return (
    <main className="flex-1 flex flex-col">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="bg-transparent border-b border-gray-200 rounded-none h-auto p-0">
            {[
              { value: "info", label: "Nhận ca", icon: <Lock className="w-4 h-4 mr-2" /> },
              { value: "view", label: "Xem hình", icon: <Eye className="w-4 h-4 mr-2" /> },
              { value: "advanced", label: "Advanced Tools", icon: <Settings className="w-4 h-4 mr-2" /> },
              { value: "video", label: "Xem - Tải Video", icon: <Video className="w-4 h-4 mr-2" /> },
              { value: "files", label: "Tài liệu đính kèm", icon: <FileText className="w-4 h-4 mr-2" /> },
              { value: "ikq", label: "In IKQ", icon: <Image className="w-4 h-4 mr-2" /> },
              { value: "receive", label: "In nhận", icon: <MessageSquare className="w-4 h-4 mr-2" /> },
              { value: "portal", label: "In tra cứu Portal", icon: <Mail className="w-4 h-4 mr-2" /> },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-4 py-2"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Nội dung chính */}
      <ScrollArea className="flex-1 p-6">
        <Card className="p-6 mx-auto">
          {!hasDiagnosis ? (
            <div className="bg-white shadow-sm min-h-[80vh] p-10">
              <h1 className="text-lg font-semibold mb-6 text-center">CHẨN ĐOÁN MỚI</h1>

              {/* chọn template */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsTemplateOpen(true)}
              >
                Choose Template
              </Button>

              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder=""
              />

              <Separator className="my-6" />

              <div className="grid grid-cols-2 gap-8">
                {/* Người ký */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium text-sm">Người ký (Alt + 1):</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={handleOpenPinDialog}
                    >
                      <span className="text-xs">📋</span>
                    </Button>
                    {signerId && <span className="ml-2 text-green-600 text-xs">✔ Đã ký</span>}
                  </div>
                  <div className="border border-gray-300 rounded h-24 bg-gray-50 flex items-center justify-center text-sm text-gray-700">
                    {signerUser ? `${signerUser.firstName} ${signerUser.lastName}` : "Chưa ký"}
                  </div>
                </div>

                {/* Kỹ thuật viên */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium text-sm">Kỹ thuật viên:</span>
                  </div>
                  <div className="border border-gray-300 rounded h-24 bg-gray-50 flex items-center justify-center text-sm text-gray-700">
                    Nguyen Van Tech
                  </div>
                </div>
              </div>

              <Button
                className="mt-6"
                onClick={handleCreateDiagnosis}
                disabled={!signerId}
              >
                Tạo chẩn đoán
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="whitespace-pre-line">{diagnosis?.description}</p>
            </div>
          )}
        </Card>

        {/* Dialog Template */}
        <SelectTemplateDialog
          open={isTemplateOpen}
          onClose={() => setIsTemplateOpen(false)}
          modalityId={selectedStudyId.modalityId}
          bodyPartId={selectedStudyId.bodyPartId}
          onSelect={handleSelectTemplate}
        />

        {/* Dialog nhập PIN */}
        <PinDialog
          open={isPinDialogOpen}
          onClose={() => setIsPinDialogOpen(false)}
          onSign={handleConfirmPin}
        />
      </ScrollArea>
    </main>
  );
};

export default MedicalRecordMain;
