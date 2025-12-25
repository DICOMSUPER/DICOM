"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AiAnalysis } from "@/common/interfaces/system/ai-analysis.interface";
import {
  Activity,
  Brain,
  CheckCircle,
  Clock,
  ImageIcon,
  Scan,
  ThumbsUp,
  XCircle,
  ImageOff,
} from "lucide-react";
import { useState } from "react";
import { ImagePreviewModal } from "@/components/common/preview-image";
import InfoItem from "./info-item";
import { useGetUserByIdQuery } from "@/store/userApi";

interface AiAnalysisViewModalProps {
  aiAnalysis: AiAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (aiAnalysis: AiAnalysis) => void;
}

export function AiAnalysisViewModal({
  aiAnalysis,
  isOpen,
  onClose,
}: AiAnalysisViewModalProps) {
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt: string;
    mode: "original" | "analyzed";
  } | null>(null);

  const formatDateTime = (dateValue?: string | Date | null) => {
    if (!dateValue) return "—";
    const date =
      typeof dateValue === "string" || dateValue instanceof Date
        ? new Date(dateValue)
        : null;
    if (!date || Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return (
          <Badge className="bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100">
            <CheckCircle className="h-3 w-3 mr-1.5" />
            Completed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
            <Clock className="h-3 w-3 mr-1.5" />
            Pending
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1.5" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "—"}</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-teal-600";
    if (confidence >= 0.7) return "text-amber-600";
    return "text-red-600";
  };

  // Fetch reviewer user data if feedbackUserId exists
  const { data: reviewerData } = useGetUserByIdQuery(
    aiAnalysis?.feedbackUserId || "",
    {
      skip: !aiAnalysis?.feedbackUserId,
    }
  );

  const hasImage = !!aiAnalysis?.originalImage;
  const imageUrl = aiAnalysis?.originalImage || "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-7xl! h-[88vh] flex flex-col border border-slate-200 p-0 overflow-hidden bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <DialogHeader className="px-8 pt-7 pb-5 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-slate-900 shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                AI Analysis Details
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-0.5">
                Medical imaging analysis results
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {!aiAnalysis ? (
            <div className="flex-1 flex p-6 gap-6">
              <div className="w-[340px] shrink-0 space-y-4">
                <Skeleton className="h-[260px] w-full rounded-xl" />
                <Skeleton className="h-[260px] w-full rounded-xl" />
              </div>
              <div className="flex-1 space-y-4">
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="h-52 w-full rounded-xl" />
              </div>
            </div>
          ) : (
            <>
              {/* Left Column - Images */}
              <div className="w-[340px] shrink-0 flex flex-col gap-5 p-6 bg-slate-50 border-r border-slate-100">
                {/* Original Image */}
                <div
                  className="relative group rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    if (hasImage) {
                      setPreviewImage({
                        src: imageUrl,
                        alt: "Original scan",
                        mode: "original",
                      });
                    }
                  }}
                >
                  <div className="absolute top-3 left-3 z-10">
                    <Badge
                      variant="secondary"
                      className="bg-white/95 text-slate-600 border-slate-200 shadow-sm backdrop-blur-sm"
                    >
                      <ImageIcon className="h-3 w-3 mr-1.5" />
                      Original
                    </Badge>
                  </div>
                  <div className="aspect-4/3 bg-slate-100">
                    {hasImage ? (
                      <img
                        src={imageUrl}
                        alt="Original scan"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageOff className="h-12 w-12 mb-2" />
                        <p className="text-xs font-medium">Image not available</p>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 bg-white border-t border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">
                      Source Image
                    </p>
                  </div>
                </div>

                {/* Analyzed Image */}
                <div
                  className="relative group rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    if (hasImage) {
                      setPreviewImage({
                        src: imageUrl,
                        alt: "Analyzed scan with detections",
                        mode: "analyzed",
                      });
                    }
                  }}
                >
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-slate-900 text-white border-0 shadow-sm">
                      <Scan className="h-3 w-3 mr-1.5" />
                      Analyzed
                    </Badge>
                  </div>
                  <div className="aspect-4/3 bg-slate-100">
                    {hasImage ? (
                      <img
                        src={imageUrl}
                        alt="Analyzed scan with detections"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageOff className="h-12 w-12 mb-2" />
                        <p className="text-xs font-medium">Image not available</p>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 bg-white border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-900">
                      {aiAnalysis.analysisResults?.predictions?.length || 0}{" "}
                      Detection(s) Found
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Information */}
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-5">
                  {/* Model Information Card */}
                  <section className="rounded-xl bg-white p-5 border border-slate-200">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <Brain className="h-4 w-4 text-slate-600" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900">
                        Model Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <InfoItem
                        label="Model Name"
                        value={aiAnalysis.modelName}
                      />
                      <InfoItem
                        label="Version"
                        value={aiAnalysis.versionName}
                      />
                      <InfoItem
                        label="Model ID"
                        value={aiAnalysis.aiModelId}
                        mono
                      />
                    </div>
                  </section>

                  {/* Analysis Results Card */}
                  {aiAnalysis.analysisResults && (
                    <section className="rounded-xl bg-white p-5 border border-slate-200">
                      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-100">
                            <ImageIcon className="h-4 w-4 text-slate-600" />
                          </div>
                          <h3 className="text-base font-semibold text-slate-900">
                            Analysis Results
                          </h3>
                        </div>
                        {getStatusBadge(aiAnalysis.analysisStatus)}
                      </div>

                      {/* Study ID */}
                      <div className="mb-5 p-4 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1.5">
                          Study ID
                        </p>
                        <p className="text-sm font-semibold text-slate-900 font-mono ">
                          {aiAnalysis.studyId || "—"}
                        </p>
                      </div>

                      {/* Image Dimensions */}
                      {aiAnalysis.analysisResults.image && (
                        <div className="mb-5 p-4 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1.5">
                            Image Dimensions
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {aiAnalysis.analysisResults.image.width} ×{" "}
                            {aiAnalysis.analysisResults.image.height}
                            <span className="text-slate-400 font-normal ml-1">
                              px
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Predictions */}
                      {aiAnalysis.analysisResults.predictions &&
                        aiAnalysis.analysisResults.predictions.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-slate-700">
                                Predictions
                              </p>
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                {aiAnalysis.analysisResults.predictions.length}{" "}
                                found
                              </span>
                            </div>
                            <div className="space-y-2.5 max-h-[280px] overflow-y-auto">
                              {aiAnalysis.analysisResults.predictions.map(
                                (prediction, index) => (
                                  <div
                                    key={prediction.detection_id || index}
                                    className="p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                                  >
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <p className="text-xs text-black mt-1.5">
                                          Detection #{index + 1}
                                        </p>
                                        <Badge className="bg-slate-900 text-white border-0 text-xs">
                                          {prediction.class}
                                        </Badge>
                                      </div>
                                      <div className="text-right">
                                        <p
                                          className={`text-xl font-bold ${getConfidenceColor(
                                            prediction.confidence
                                          )}`}
                                        >
                                          {(
                                            prediction.confidence * 100
                                          ).toFixed(1)}
                                          %
                                        </p>
                                        <p className="text-xs text-slate-400">
                                          Confidence
                                        </p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="p-2.5 rounded-md bg-white border border-slate-100">
                                        <span className="text-xs text-slate-400 block mb-0.5">
                                          Position
                                        </span>
                                        <p className="font-mono text-xs text-slate-700">
                                          ({prediction.x.toFixed(0)},{" "}
                                          {prediction.y.toFixed(0)})
                                        </p>
                                      </div>
                                      <div className="p-2.5 rounded-md bg-white border border-slate-100">
                                        <span className="text-xs text-slate-400 block mb-0.5">
                                          Size
                                        </span>
                                        <p className="font-mono text-xs text-slate-700">
                                          {prediction.width.toFixed(0)} ×{" "}
                                          {prediction.height.toFixed(0)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* analyze message */}
                      {aiAnalysis.aiAnalyzeMessage && (
                        <div className="mb-5 p-4 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1.5">
                            AI Analyzing
                          </p>
                          <div className="prose prose-invert prose-sm max-w-none">
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {aiAnalysis.aiAnalyzeMessage || "—"}
                            </p>
                          </div>
                        </div>
                      )}
                    </section>
                  )}

                  {/* Error Message */}
                  {aiAnalysis.errorMessage && (
                    <section className="rounded-xl bg-red-50 p-5 border border-red-200">
                      <div className="flex items-center gap-2 text-red-700 mb-2">
                        <XCircle className="h-4 w-4" />
                        <span className="font-semibold text-sm">Error</span>
                      </div>
                      <p className="text-sm text-red-600">
                        {aiAnalysis.errorMessage}
                      </p>
                    </section>
                  )}

                  {/* Feedback Card */}
                  <section className="rounded-xl bg-white p-5 border border-slate-200">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100">
                          <ThumbsUp className="h-4 w-4 text-slate-600" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">
                          Feedback
                        </h3>
                      </div>
                      {aiAnalysis.isHelpful !== null &&
                        aiAnalysis.isHelpful !== undefined && (
                          <Badge
                            className={
                              aiAnalysis.isHelpful
                                ? "bg-teal-50 text-teal-700 border-teal-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {aiAnalysis.isHelpful ? "Helpful" : "Not Helpful"}
                          </Badge>
                        )}
                    </div>

                    {aiAnalysis.isHelpful === null ||
                    aiAnalysis.isHelpful === undefined ? (
                      <p className="text-sm text-slate-500">
                        No feedback submitted yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-500">
                            Submitted {formatDateTime(aiAnalysis.feedbackAt)}
                          </p>
                          {reviewerData?.data && (
                            <p className="text-sm font-medium text-slate-700">
                              by {reviewerData.data.firstName} {reviewerData.data.lastName}
                            </p>
                          )}
                        </div>
                        {aiAnalysis.feedbackComment && (
                          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                            <p className="text-sm italic text-slate-600">
                              &ldquo;{aiAnalysis.feedbackComment}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-5 rounded-lg border-slate-200 hover:bg-slate-100 text-slate-700 bg-transparent"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageSrc={previewImage?.src}
        imageAlt={previewImage?.alt}
        width={aiAnalysis?.analysisResults?.image?.width}
        height={aiAnalysis?.analysisResults?.image?.height}
        showDimensions={true}
        mode={previewImage?.mode || "original"}
        predictions={aiAnalysis?.analysisResults?.predictions || []}
      />
    </Dialog>
  );
}
