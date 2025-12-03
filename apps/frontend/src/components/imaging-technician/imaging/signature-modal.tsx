"use client";
import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useHasSignatureQuery } from "@/store/digitalSignatureApi";
import { useGetUserByIdQuery } from "@/store/userApi";
import SignatureAnimation from "signature-animation";
import { useTechnicianVerifyStudyMutation } from "@/store/dicomStudySignatureApi";
import { toast } from "sonner";
import Cookies from "js-cookie";
import SignatureDisplay from "@/components/common/signature-display";

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

  const cookieUser = JSON.parse(Cookies.get("user") || "{}");
  const userId = cookieUser?.id;

  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdQuery(
    userId,
    { skip: !userId || !isOpen }
  );
  const user = userData?.data;

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPin("");
      setPinError("");
      setShowPin(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {signatureData?.data?.hasSignature ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                Verify Study
              </>
            ) : (
              "Digital Signature Required"
            )}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isLoadingSignature ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-3"></div>
              <p className="text-sm text-gray-600">Loading signature...</p>
            </div>
          ) : signatureData?.data?.hasSignature ? (
            <>
              {/* Signature Display */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Signature
                </label>
                <div className="border-2 border-gray-300 rounded-md bg-gray-50 h-32 flex flex-col items-center justify-center">
                  {isLoadingUserData ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-200 border-t-blue-600"></div>
                  ) : user ? (
                    <SignatureDisplay
                      firstName={user?.firstName}
                      lastName={user?.lastName}
                      role="Kỹ thuật viên"
                    />
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No signature available
                    </p>
                  )}
                </div>
              </div>

              {/* PIN Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter PIN to Verify Study
                </label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    placeholder="Enter your PIN (min. 6 characters)"
                    value={pin}
                    onChange={handlePinChange}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && pin.length >= 6 && !pinError) {
                        handleVerifyStudy();
                      }
                    }}
                    className={`w-full border ${
                      pinError ? "border-red-500" : "border-gray-300"
                    } rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                      pinError ? "focus:ring-red-500" : "focus:ring-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {pinError && (
                  <p className="text-red-500 text-xs mt-1">{pinError}</p>
                )}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleClear}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isVerifyingStudy}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyStudy}
                  disabled={
                    !pin.trim() ||
                    pin.length < 6 ||
                    isVerifyingStudy ||
                    !!pinError
                  }
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifyingStudy ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Study
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* No Signature - Setup Required */}
              <p className="text-sm text-gray-600 mb-6">
                A digital signature is required to complete this imaging study.
                Please setup your signature to proceed.
              </p>
              <div className="flex justify-center mb-6 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">
                    No signature found, please consider setting up your
                    signature.
                  </p>
                  {user && (
                    <SignatureDisplay
                      firstName={user?.firstName}
                      lastName={user?.lastName}
                      role="Kỹ thuật viên"
                    />
                  )}
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onSetupSignature();
                    handleClose();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Setup Signature
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
