"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SegmentationLayerData } from "@/common/contexts/ViewerContext";
import { AnnotationStatus } from "@/common/enums/image-dicom.enum";
import { AlertTriangle, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

interface SegmentationStatusModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    layer: SegmentationLayerData | null;
    targetStatus: AnnotationStatus;
    onConfirm: (layerId: string, status: AnnotationStatus) => Promise<void>;
}

export function SegmentationStatusModal({
    open,
    onOpenChange,
    layer,
    targetStatus,
    onConfirm,
}: SegmentationStatusModalProps) {
    const [confirmed, setConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Reset state when modal opens
    React.useEffect(() => {
        if (open) {
            setConfirmed(false);
        }
    }, [open]);

    const handleClose = () => {
        setConfirmed(false);
        onOpenChange(false);
    };

    const handleSubmit = async () => {
        if (!layer || !confirmed) return;

        setSubmitting(true);
        try {
            await onConfirm(layer.metadata.id, targetStatus);
            handleClose();
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!layer) return null;

    const getStatusInfo = (status: AnnotationStatus) => {
        switch (status) {
            case AnnotationStatus.FINAL:
                return {
                    title: "Mark as Final",
                    description: "This will mark the segmentation layer as complete and ready for review.",
                    icon: CheckCircle2,
                    color: "text-emerald-400",
                    warning: "Once reviewed by a physician, this layer will become read-only.",
                };
            case AnnotationStatus.REVIEWED:
                return {
                    title: "Mark as Reviewed",
                    description: "This will mark the segmentation layer as reviewed and finalized.",
                    icon: ShieldCheck,
                    color: "text-blue-400",
                    warning: "Reviewed layers are permanently locked and cannot be modified.",
                };
            case AnnotationStatus.DRAFT:
                return {
                    title: "Revert to Draft",
                    description: "This will move the layer back to draft status for further editing.",
                    icon: Lock,
                    color: "text-amber-400",
                    warning: null,
                };
            default:
                return {
                    title: "Update Status",
                    description: "Change the status of this segmentation layer.",
                    icon: AlertTriangle,
                    color: "text-slate-400",
                    warning: null,
                };
        }
    };

    const info = getStatusInfo(targetStatus);
    const Icon = info.icon;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${info.color}`} />
                        {info.title}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {info.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {info.warning && (
                        <Alert className="bg-amber-900/20 border-amber-700">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                            <AlertDescription className="text-xs text-amber-200">
                                <strong>Warning:</strong> {info.warning}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex items-start space-x-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <Checkbox
                            id="confirm-status"
                            checked={confirmed}
                            onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                            className="mt-0.5"
                        />
                        <div className="space-y-1">
                            <Label
                                htmlFor="confirm-status"
                                className="text-sm font-medium leading-none cursor-pointer text-white"
                            >
                                I confirm this status change
                            </Label>
                            <p className="text-xs text-slate-400">
                                Layer: {layer.metadata.name || "Untitled Layer"}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={submitting}
                        className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!confirmed || submitting}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                        {submitting ? (
                            <>
                                <span className="mr-2">Updating...</span>
                                <span className="animate-spin">⟳</span>
                            </>
                        ) : (
                            "Confirm Change"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
