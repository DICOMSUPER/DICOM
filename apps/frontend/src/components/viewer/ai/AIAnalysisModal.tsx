"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { AIFeedbackPanel } from "./AIFeedbackPanel";

interface PredictionMetadata {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  points: { x: number; y: number }[];
  class_id: number;
  detection_id: string;
}

interface AIAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  predictions: PredictionMetadata[];
  aiAnalyzeMessage?: string;
  analysisId: string;
  onSubmitFeedback: (isHelpful: boolean, comment?: string) => Promise<void>;
}

export const AIAnalysisModal = ({
  open,
  onClose,
  predictions,
  aiAnalyzeMessage,
  analysisId,
  onSubmitFeedback,
}: AIAnalysisModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl! max-h-[90vh] bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            AI Diagnosis Results
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Detected Classes Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-teal-400">
                Detected Conditions
              </h3>
              {predictions.length === 0 ? (
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-center">
                  <p className="text-slate-400">No abnormalities detected in the image.</p>
                </div>
              ) : (
                <>
              <div className="flex flex-wrap gap-2">
                {predictions.map((pred, idx) => (
                  <Badge
                    key={pred.detection_id}
                    variant="secondary"
                    className="bg-slate-800 text-white border border-teal-500/30 px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{pred.class}</span>
                      <span className="text-xs text-slate-400">
                        Confidence: {(pred.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </Badge>
                ))}
              </div>
              
              {/* Detection Summary */}
              <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">
                  Detection Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Total Detections:</span>
                    <span className="ml-2 font-semibold text-white">
                      {predictions.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Average Confidence:</span>
                    <span className="ml-2 font-semibold text-white">
                      {(
                        (predictions.reduce((sum, p) => sum + p.confidence, 0) /
                          predictions.length) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>
              </>
              )}
            </div>

            {/* AI Analysis Message Section */}
            {aiAnalyzeMessage && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-teal-400 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Clinical Assessment
                </h3>
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {aiAnalyzeMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-teal-400">
                Provide Feedback
              </h3>
              <AIFeedbackPanel
                analysisId={analysisId}
                onSubmitFeedback={onSubmitFeedback}
                onClose={onClose}
              />
            </div>
          </div>
        </ScrollArea>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-slate-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-800"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
