"use client";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { useHasSignatureQuery } from "@/store/digitalSignatureApi";
import { useTechnicianVerifyStudyMutation } from "@/store/dicomStudySignatureApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import SignatureDisplay from "@/components/common/signature-display";
import { useGetUserByIdQuery } from "@/store/userApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignatureModal({
  isOpen,
  onClose,
  onSetupSignature,
  studyId,
  refetchStudy,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSetupSignature: () => void;
  studyId: string | null;
  refetchStudy: () => void;
}) {
  const [pin, setPin] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string>("");

  const { data: signatureData, isLoading: isLoadingSignature } =
    useHasSignatureQuery();

  const [technicianVerify, { isLoading: isVerifyingStudy }] =
    useTechnicianVerifyStudyMutation();

  const user = useGetUserByIdQuery(
    useSelector((state: RootState) => state.auth.user?.id) || "",
    { skip: !useSelector((state: RootState) => state.auth.user?.id) }
  ).data?.data;

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPin("");
      setPinError("");
      setShowPin(false);
    }
  }, [isOpen]);

  // Validate PIN
  const validatePin = (value: string): boolean => {
    if (!value) {
      setPinError("PIN is required");
      return false;
    }
    if (value.length < 6) {
      setPinError("PIN must be at least 6 characters");
      return false;
    }
    setPinError("");
    return true;
  };

  // Handle PIN change
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPin(value);
    if (value) {
      validatePin(value);
    } else {
      setPinError("");
    }
  };

  // Handle verify study
  const handleVerifyStudy = async () => {
    if (!validatePin(pin)) {
      return;
    }

    if (!studyId) {
      toast.error("Study ID is required");
      return;
    }

    try {
      await technicianVerify({ studyId, pin }).unwrap();
      toast.success("Study verified successfully");
      setPin("");
      setPinError("");

      onClose();
      refetchStudy();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to verify study");
    }
  };

  // Handle clear
  const handleClear = () => {
    setPin("");
    setPinError("");
  };

  // Handle close
  const handleClose = () => {
    setPin("");
    setPinError("");
    setShowPin(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {signatureData?.data?.hasSignature ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                Verify Study
              </>
            ) : (
              "Digital Signature Required"
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isLoadingSignature ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-3"></div>
              <p className="text-sm text-muted-foreground">
                Loading signature...
              </p>
            </div>
          ) : signatureData?.data?.hasSignature ? (
            <>
              {/* Signature Display */}
              <div className="space-y-2">
                <Label>Your Signature</Label>
                <div className="border-2 rounded-md bg-muted h-32 flex flex-col items-center justify-center">
                  {user && user?.firstName && user?.lastName ? (
                    <SignatureDisplay
                      firstName={user.firstName}
                      lastName={user.lastName}
                      role="Kỹ thuật viên"
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No signature available
                    </p>
                  )}
                </div>
              </div>

              {/* PIN Input */}
              <div className="space-y-2">
                <Label htmlFor="pin">Enter PIN to Verify Study</Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    placeholder="Enter your PIN (min. 6 characters)"
                    value={pin}
                    onChange={handlePinChange}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && pin.length >= 6 && !pinError) {
                        handleVerifyStudy();
                      }
                    }}
                    className={pinError ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {pinError && (
                  <p className="text-destructive text-xs">{pinError}</p>
                )}
                <div className="flex justify-end">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleClear}
                    className="px-0 h-auto"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* No Signature - Setup Required */}
              <p className="text-sm text-muted-foreground">
                A digital signature is required to complete this imaging study.
                Please setup your signature to proceed.
              </p>
              <div className="flex justify-center p-6 bg-muted rounded-lg border-2 border-dashed">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground text-sm">
                    No signature found, please consider setting up your
                    signature.
                  </p>
                  {user?.firstName && user?.lastName && (
                    <SignatureDisplay
                      firstName={user.firstName}
                      lastName={user.lastName}
                      role="Kỹ thuật viên"
                      duration={0.1}
                      delay={0}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {signatureData?.data?.hasSignature ? (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isVerifyingStudy}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyStudy}
                disabled={
                  !pin.trim() ||
                  pin.length < 6 ||
                  isVerifyingStudy ||
                  !!pinError
                }
                className="bg-green-600 hover:bg-green-700"
              >
                {isVerifyingStudy ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Verify Study
                  </span>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onSetupSignature();
                  handleClose();
                }}
              >
                Setup Signature
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
