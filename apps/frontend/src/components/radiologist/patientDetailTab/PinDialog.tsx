"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PinDialogProps {
  open: boolean;
  onClose: () => void;
  onSign: (pin: string) => Promise<string>;
}

const PinDialog: React.FC<PinDialogProps> = ({ open, onClose, onSign }) => {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!pin) {
      toast.warning("Vui lòng nhập mã PIN!");
      return;
    }

    setLoading(true);

    try {
      const signatureId = await onSign(pin);

      toast.success("Xác nhận PIN thành công!");
      console.log("Signature ID:", signatureId);

      setPin("");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("PIN sai hoặc ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open && !loading) {
          setPin("");
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nhập mã PIN</DialogTitle>
        </DialogHeader>

        <Input
          type="password"
          value={pin}
          placeholder="Mã PIN"
          onChange={(e) => setPin(e.target.value)}
          disabled={loading}
          autoFocus
        />

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Đang kiểm tra..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PinDialog;
