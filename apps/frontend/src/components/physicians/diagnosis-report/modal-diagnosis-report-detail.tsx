"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DiagnosisStatus } from "@/enums/patient-workflow.enum";
import { formatDate } from "@/lib/formatTimeDate";
import { useGetDiagnosisByIdQuery } from "@/store/diagnosisApi";
import {
  AlertCircle,
  Calendar,
  ClipboardList,
  Download,
  FileText,
  Image,
} from "lucide-react";

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
  const { data: report, isLoading } = useGetDiagnosisByIdQuery(reportId, {
    skip: !reportId || !open,
  });

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
  const handleApprove = () => {};
  const handleViewImage = () => {};
  const handleDownloadReport = () => {}

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-7xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-0">
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

              {/* Status Card */}
            </div>

            <Separator className="my-2 bg-slate-200/50" />

            {report.data.description && (
              <div className="bg-white border border-slate-200/60 rounded-xl p-6">
                <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Description
                </div>
                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
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
                onClick={onClose}
                className="rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors font-medium bg-transparent"
              >
                Close
              </Button>
              <Button
                onClick={handleApprove}
                className="bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-lg transition-all hover:shadow-md font-medium"
              >
                <Image className="w-4 h-4 mr-2" />
                Approve Study
              </Button>
              <Button
                onClick={handleViewImage}
                className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-lg transition-all hover:shadow-md font-medium"
              >
                <Image className="w-4 h-4 mr-2" />
                View Image
              </Button>
              <Button onClick={handleDownloadReport} className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg transition-all hover:shadow-md font-medium">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No report found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
