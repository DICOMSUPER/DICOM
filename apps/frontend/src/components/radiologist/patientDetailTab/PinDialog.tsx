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
import { Eye, EyeOff } from "lucide-react";

interface PinDialogProps {
  open: boolean;
  onClose: () => void;
  onSign: (pin: string) => Promise<string>;
}

const PinDialog: React.FC<PinDialogProps> = ({ open, onClose, onSign }) => {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!pin) {
      toast.warning("Please enter your PIN!");
      return;
    }

    setLoading(true);

    try {
      const signatureId = await onSign(pin);

      toast.success("PIN verified successfully!");
      console.log("Signature ID:", signatureId);

      setPin("");
      setShowPin(false);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Incorrect PIN or signing failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPin("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open && !loading) {
          setPin("");
          setShowPin(false);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter PIN</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showPin ? "text" : "password"}
              value={pin}
              placeholder="PIN Code"
              onChange={(e) => setPin(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && pin && !loading) {
                  handleConfirm();
                }
              }}
              disabled={loading}
              autoFocus
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPin(!showPin)}
              disabled={loading}
            >
              {showPin ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex justify-end">
            <Button
              variant="link"
              size="sm"
              onClick={handleClear}
              disabled={loading}
              className="px-0 h-auto text-sm"
            >
              Clear
            </Button>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Verifying..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PinDialog;
