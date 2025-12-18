"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";

interface AIFeedbackPanelProps {
  analysisId: string | null;
  onSubmitFeedback: (isHelpful: boolean, comment?: string) => Promise<void>;
  onClose: () => void;
}

export function AIFeedbackPanel({
  analysisId,
  onSubmitFeedback,
  onClose,
}: AIFeedbackPanelProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<boolean | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!analysisId) return null;

  const handleFeedbackClick = (isHelpful: boolean) => {
    setSelectedFeedback(isHelpful);
  };

  const handleSubmit = async () => {
    if (selectedFeedback === null) {
      toast.error("Please select helpful or not helpful");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitFeedback(selectedFeedback, feedbackComment.trim() || undefined);
      toast.success("Feedback submitted successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-teal-400" />
          <h4 className="text-sm font-semibold text-white">AI Analysis Feedback</h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-slate-400">
        Was this AI analysis helpful?
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedbackClick(true)}
          className={`flex-1 ${
            selectedFeedback === true
              ? "bg-green-600 text-white border-green-500 hover:bg-green-700"
              : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
          }`}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          Helpful
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedbackClick(false)}
          className={`flex-1 ${
            selectedFeedback === false
              ? "bg-red-600 text-white border-red-500 hover:bg-red-700"
              : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
          }`}
        >
          <ThumbsDown className="h-4 w-4 mr-1" />
          Not Helpful
        </Button>
      </div>

      {selectedFeedback !== null && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <label className="text-xs text-slate-400">
            Additional comments (optional)
          </label>
          <Textarea
            placeholder="Tell us more about your experience..."
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            className="min-h-[80px] bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 text-sm"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
