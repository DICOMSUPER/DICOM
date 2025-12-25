"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

import {
  useCreateDiagnosisMutation,
  useUpdateDiagnosisMutation,
} from "@/store/diagnosisApi";
import {
  CreateDiagnosisReportDto,
  DiagnosisStatus,
  DiagnosisType,
  Severity,
} from "@/common/interfaces/patient/patient-workflow.interface";

import PinDialog from "./PinDialog";
import {
  useSignDataMutation,
  useGetDigitalSignatureByIdQuery,
} from "@/store/digitalSignatureApi";
import { SignDataDto } from "@/common/interfaces/user/digital-signature.interface";
import RichTextEditor from "@/components/radiologist/editor/RichTextEditor";
import SelectTemplateDialog from "./SelectTemplateDialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RejectDicomDialog from "./RejectDicomDialog";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

import html2pdf from "html2pdf.js";
import PrintDiagnosis from "./PrintDiagnosis";
import {
  useGetOneDicomStudyQuery,
  useUpdateDicomStudyMutation,
} from "@/store/dicomStudyApi";

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
import { DicomStudyStatus, ImagingOrderStatus } from "@/common/enums/image-dicom.enum";

const AdvancedToolsTab = () => <div>Advanced Tools Content</div>;
const VideoTab = () => <div>Video Content</div>;
const FilesTab = () => <div>Files Content</div>;
const IKQTab = () => <div>In IKQ Content</div>;
const ReceiveTab = () => <div>Print Receipt Content</div>;
const PortalTab = () => <div>Portal Lookup Content</div>;

// Helper function to format enum labels for display
const formatEnumLabel = (value: string): string => {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

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
  const [selectedDiagnosisType, setSelectedDiagnosisType] = useState<DiagnosisType>(DiagnosisType.PRIMARY);
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>(Severity.MODERATE);
  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("info");
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [signerId, setSignerId] = useState<string | null>(null);
  const [signerUser, setSignerUser] = useState<any>(null);
  const [signData] = useSignDataMutation();
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isAcceptConfirmOpen, setIsAcceptConfirmOpen] = useState(false);

  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [updateStudyDicom] = useUpdateDicomStudyMutation();

  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: studyDetail, refetch: refetchStudy } = useGetOneDicomStudyQuery(
    selectedStudyId,
    {
      skip: !selectedStudyId,
    }
  );
  console.log("check 1 ", studyDetail)
  const [updateImagingOrder] = useUpdateImagingOrderMutation();

  const technicianId = studyDetail?.data?.performingTechnicianId;

  const { data: technicianSignature } = useGetUserByIdQuery(technicianId!, {
    skip: !technicianId,
  });

  const isStudyRejected = studyDetail?.data?.studyStatus === DicomStudyStatus.REJECTED;

  const handleRejectDicom = async (reason: string) => {
    try {
      const payload = {
        reason,
        studyStatus: DicomStudyStatus.REJECTED,
      };

      await updateStudyDicom({ id: selectedStudyId, data: payload });

      toast.success("DICOM rejected successfully!");
      setIsRejectOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Rejection failed!");
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

      toast.success("Diagnosis updated!");
      setIsEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
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
      toast.error("Incorrect PIN or signing failed!");
      throw new Error("Incorrect PIN or signing failed!");
    }
  };

  const handleSelectTemplate = (template: any) => {
    setDescription(template.descriptionTemplate ?? "");
  };

  const handleCreateDiagnosis = async () => {
    if (!selectedStudyId || !encounterId)
      return toast.warning("Missing study or encounter ID!");

    if (!signerId) return toast.warning("PIN verification required!");

    const payload: CreateDiagnosisReportDto = {
      encounterId,
      studyId: selectedStudyId,
      diagnosisName: signerUser
        ? `${signerUser.firstName} ${signerUser.lastName} (${new Date().toISOString().slice(0, 10)})`
        : `Diagnosis (${new Date().toISOString().slice(0, 10)})`,
      description: description || "Enter diagnosis content...",
      diagnosisType: selectedDiagnosisType,
      severity: selectedSeverity,
      diagnosisDate: new Date().toISOString().slice(0, 10),
      diagnosedBy: signerUser?.id,
      diagnosisStatus: DiagnosisStatus.PENDING_APPROVAL,
      notes: diagnosisNotes || undefined,
      signatureId: signerId,
    };

    try {
      await createDiagnosis(payload);
      await updateImagingOrder({
        id: studyDetail?.data?.imagingOrder?.id!,
        body: { orderStatus: ImagingOrderStatus.COMPLETED },
      });

      await updateStudyDicom({
        id: selectedStudyId,
        data: { studyStatus: DicomStudyStatus.PENDING_APPROVAL },
      });

      // Refetch để hiển thị diagnosis vừa tạo
      if (refetchDiagnosis) {
        await refetchDiagnosis();
      }

      toast.success("Diagnosis saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Save failed, please try again.");
    }
  };

  const renderEmptyTab = (
    title: string,
    description = "No data available for this section.",
    icon?: React.ReactNode
  ) => (
    <div className="h-full flex flex-1 flex-col items-center justify-center text-center gap-3 py-10 text-sm text-gray-600">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
          {icon}
        </div>
      )}
      <div className="text-base font-semibold text-gray-800">{title}</div>
      <p className="max-w-md">{description}</p>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "advanced":
        return <AdvancedToolsTab />;
      case "video":
        return renderEmptyTab(
          "Video",
          "No video available for this case.",
          <Video className="h-6 w-6" />
        );
      case "files":
        return renderEmptyTab(
          "Files",
          "No attachments available for this case.",
          <FileText className="h-6 w-6" />
        );
      case "receive":
        return renderEmptyTab(
          "Print Receipt",
          "No print receipt data available for this case.",
          <MessageSquare className="h-6 w-6" />
        );
      case "portal":
        return renderEmptyTab(
          "Portal",
          "No portal link available for this case.",
          <Mail className="h-6 w-6" />
        );
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
          <h1 className="text-2xl font-bold text-gray-700">
            Welcome to Medical Record
          </h1>
          <p className="text-gray-500">
            Please select a{" "}
            <span className="font-medium text-blue-600">Study</span> to get started.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="mt-4"
            onClick={() => toast("Please select a Study from the list on the left!")}
          >
            How to Select a Study
          </Button>
        </div>
        {/* </Card> */}
      </div>
    );
  }

  if (isDiagnosisLoading)
    return (
      <div className="flex-1 flex items-center justify-center">Loading...</div>
    );

  const hasDiagnosis = diagnosisData?.data?.length > 0;
  const diagnosis = diagnosisData?.data?.[0];

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            if (val === "view") {
              router.push(`/viewer?study=${selectedStudyId}&patient=${patientId}`);
              return; // do not switch tab, it's a navigation action
            }
            if (val === "ikq") {
              handleExportPdf();
              return; // keep current tab
            }
            setActiveTab(val as TabValue);
          }}
          className="w-full"
        >
          <TabsList className="bg-transparent border-b border-gray-200">
            {[
              {
                value: "info",
                label: "Accept Case",
                icon: <Lock className="w-4 h-4" />,
              },
              {
                value: "view",
                label: "View Image",
                icon: <Eye className="w-4 h-4" />,
              },
              {
                value: "advanced",
                label: "Advanced Tools",
                icon: <Settings className="w-4 h-4" />,
              },
              {
                value: "video",
                label: "Video",
                icon: <Video className="w-4 h-4" />,
              },
              {
                value: "files",
                label: "Files",
                icon: <FileText className="w-4 h-4" />,
              },
              {
                value: "ikq",
                label: "In IKQ",
                icon: <Image className="w-4 h-4" />,
              },
              {
                value: "receive",
                label: "Print Receipt",
                icon: <MessageSquare className="w-4 h-4" />,
              },
              {
                value: "portal",
                label: "Portal",
                icon: <Mail className="w-4 h-4" />,
              },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 px-4 py-2"
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1 p-6">
        {activeTab === "info" ? (
          <Card className="p-6 mx-auto border-border overflow-y-auto">
            {!hasDiagnosis ? (
              <div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsTemplateOpen(true)}
                  className="mb-4"
                  disabled={isStudyRejected}
                >
                  Select Template
                </Button>

                <RichTextEditor value={description} onChange={setDescription} />

                {/* Diagnosis Type, Severity, and Notes */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosisType">Diagnosis Type</Label>
                    <Select
                      value={selectedDiagnosisType}
                      onValueChange={(value) => setSelectedDiagnosisType(value as DiagnosisType)}
                    >
                      <SelectTrigger id="diagnosisType">
                        <SelectValue placeholder="Select diagnosis type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(DiagnosisType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {formatEnumLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={selectedSeverity}
                      onValueChange={(value) => setSelectedSeverity(value as Severity)}
                    >
                      <SelectTrigger id="severity">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Severity).map((sev) => (
                          <SelectItem key={sev} value={sev}>
                            {formatEnumLabel(sev)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional notes..."
                    value={diagnosisNotes}
                    onChange={(e) => setDiagnosisNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-medium text-sm">
                        Signer (Alt + 1):
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={handleOpenPinDialog}
                        disabled={isStudyRejected}
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                      {signerId && (
                        <span className="ml-2 text-green-600 text-xs flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Signed</span>
                        </span>
                      )}
                    </div>
                    <div className="border border-gray-300 rounded h-24 bg-gray-50 flex flex-col items-center justify-center text-sm text-gray-700">
                      {signerUser ? (
                        <SignatureDisplay
                          firstName={signerUser.firstName}
                          lastName={signerUser.lastName}
                          role="Doctor"
                          duration={1}
                          delay={0.3}
                        />
                      ) : (
                        "Not signed"
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-sm">Technician:</span>

                    <div className="border rounded h-24 bg-gray-50 flex flex-col items-center justify-center mt-3 text-sm text-gray-700">
                      {technicianSignature?.data ? (
                        <SignatureDisplay
                          firstName={technicianSignature.data.firstName}
                          lastName={technicianSignature.data.lastName}
                          role="Technician"
                          duration={1}
                          delay={0.3}
                        />
                      ) : (
                        "Technician not found"
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  className="mt-6"
                  onClick={() => setIsAcceptConfirmOpen(true)}
                  disabled={!signerId || isStudyRejected}
                >
                  Create Diagnosis
                </Button>

                <Button
                  variant="destructive"
                  className="mt-6 ml-3"
                  onClick={() => setIsRejectOpen(true)}
                  disabled={isStudyRejected}
                >
                  Reject
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {diagnosis.diagnosisStatus === "rejected" && (
                  <div className="flex gap-4 mb-4">
                    <Button
                      variant="destructive"
                      onClick={() => setIsReasonOpen(true)}
                    >
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
                    <Button onClick={handleExportPdf}>
                      Print Receipt (Export PDF)
                    </Button>

                    <p className="whitespace-pre-line">
                      {diagnosis.description}
                    </p>

                    <Separator />

                    <h3 className="font-semibold">Signer Information</h3>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <span className="font-medium text-sm block mb-3">
                          Signer:
                        </span>
                        <div className="border rounded h-24 bg-gray-50 flex flex-col items-center justify-center">
                          {signerUser ? (
                            <SignatureDisplay
                              firstName={signerUser.firstName}
                              lastName={signerUser.lastName}
                              role="Doctor"
                              duration={1}
                              delay={0.3}
                            />
                          ) : (
                            "Not signed"
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-sm block mb-3">
                          Technician:
                        </span>
                        <div className="border rounded h-24 bg-gray-50 flex flex-col items-center justify-center">
                          {technicianSignature?.data ? (
                            <SignatureDisplay
                              firstName={technicianSignature.data.firstName}
                              lastName={technicianSignature.data.lastName}
                              role="Technician"
                              duration={1}
                              delay={0.3}
                            />
                          ) : (
                            "Technician not found"
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <h2 className="font-semibold mb-4">Edit Diagnosis</h2>

                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                    />

                    <div className="flex gap-3 mt-4">
                      <Button onClick={handleUpdateDiagnosis}>Save</Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditMode(false)}
                      >
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
          <Card className="p-6 mx-auto flex-1">{renderTabContent()}</Card>
        )}

        <SelectTemplateDialog
          open={isTemplateOpen}
          onClose={() => setIsTemplateOpen(false)}
          modalityId={selectedStudyId.modalityId}
          bodyPartId={selectedStudyId.bodyPartId}
          onSelect={handleSelectTemplate}
        />

        <PinDialog
          open={isPinDialogOpen}
          onClose={() => setIsPinDialogOpen(false)}
          onSign={handleConfirmPin}
        />

        <RejectDicomDialog
          open={isRejectOpen}
          onClose={() => setIsRejectOpen(false)}
          onConfirm={handleRejectDicom}
        />

        {/* Accept/Create Diagnosis Confirmation */}
        <ConfirmationModal
          isOpen={isAcceptConfirmOpen}
          onClose={() => setIsAcceptConfirmOpen(false)}
          onConfirm={() => {
            setIsAcceptConfirmOpen(false);
            handleCreateDiagnosis();
          }}
          title="Confirm Create Diagnosis"
          description="Are you sure you want to create a diagnosis for this case? This action will move the case to pending approval status."
          confirmText="Confirm"
          cancelText="Cancel"
          variant="success"
        />

        <Dialog open={isReasonOpen} onOpenChange={setIsReasonOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejection Reason</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-gray-700">
              {diagnosis?.rejectionReason || "No reason provided"}
            </p>

            <DialogFooter>
              <Button onClick={() => setIsReasonOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ScrollArea>
    </main>
  );
};

export default MedicalRecordMain;
