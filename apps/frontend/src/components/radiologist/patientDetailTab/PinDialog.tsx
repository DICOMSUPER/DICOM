"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";


interface PinDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (pin: string) => void;
}

const PinDialog: React.FC<PinDialogProps> = ({ open, onClose, onConfirm }) => {
    const [pin, setPin] = useState("");

    const handleConfirm = () => {
        if (!pin) {
            alert("Vui lòng nhập mã PIN!");
            return;
        }
        onConfirm(pin);
        setPin("");
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nhập mã PIN để xác nhận</DialogTitle>
                </DialogHeader>
                <Input
                    type="password"
                    placeholder="Mã PIN"
                    value={pin}
                    onChange={(e :any ) => setPin(e.target.value)}
                    className="mb-4"
                />
                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button onClick={handleConfirm}>Xác nhận</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PinDialog;
