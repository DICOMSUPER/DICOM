"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";


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
      alert("Vui lòng nhập mã PIN!");
      return;
    }
    setLoading(true);
    try {
      const signatureId = await onSign(pin);
      alert("PIN hợp lệ! Signature ID: " + signatureId);
      setPin("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("PIN sai hoặc ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nhập mã PIN</DialogTitle>
        </DialogHeader>
        <Input
          type="password"
          value={pin}
          placeholder="Mã PIN"
          onChange={(e) => setPin(e.target.value)}
          disabled={loading}
        />
        <DialogFooter className="flex justify-end gap-2">
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
