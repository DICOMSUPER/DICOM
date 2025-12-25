// components/RejectDicomDialog.tsx
"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RejectDicomDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const RejectDicomDialog: React.FC<RejectDicomDialogProps> = ({ open, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert("Please enter a reason for rejection!");
      return;
    }
    onConfirm(reason);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject DICOM</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for rejecting DICOM..."
            rows={4}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Confirm Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectDicomDialog;
