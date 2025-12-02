"use client";
import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { useSetupSignatureMutation } from "@/store/digitalSignatureApi";
import Cookies from "js-cookie";
import { useGetUserByIdQuery } from "@/store/userApi";
import SignatureAnimation from "signature-animation";
import { toast } from "sonner";
import SignatureDisplay from "@/components/common/signature-display";

export default function SetupSignatureModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [pin, setPin] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string>("");

  // handle set up signature
  const [setupSignature, { isLoading: isSettingUpSignatureLoading }] =
    useSetupSignatureMutation();

  const cookieUser = JSON.parse(Cookies.get("user") || "");

  const userId = cookieUser?.id;

  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdQuery(
    userId,
    { skip: !userId }
  );
  const user = userData?.data;

  if (!cookieUser) {
    return <>Invalid, user not found</>;
  }

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

  // Handle save signature
  const handleSaveSignature = async () => {
    if (!validatePin(pin)) {
      return;
    }

    try {
      await setupSignature({ userId, pin }).unwrap();
      toast.success("Signature set up successfully");
      setPin("");
      setPinError("");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to set up signature");
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
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Setup Digital Signature
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
          <p className="text-sm text-gray-600 mb-6">
            Create your digital signature to authenticate and complete imaging
            studies.
          </p>

          {/* Signature Canvas Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Signature
            </label>
            <div className="border-2 border-gray-300 rounded-md bg-gray-50 h-40 flex flex-col items-center justify-center">
              {isLoadingUserData ? (
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
              ) : user ? (
                <>
                  <SignatureDisplay
                    firstName={user?.firstName}
                    lastName={user?.lastName}
                  />
                </>
              ) : (
                <p className="text-gray-400">No signature available</p>
              )}
            </div>
          </div>

          {/* PIN Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter PIN Code
            </label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                placeholder="Enter at least 6 characters"
                value={pin}
                onChange={handlePinChange}
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
              disabled={isSettingUpSignatureLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSaveSignature}
              disabled={
                !pin.trim() ||
                pin.length < 6 ||
                isSettingUpSignatureLoading ||
                !!pinError
              }
            >
              {isSettingUpSignatureLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </span>
              ) : (
                "Save Signature"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
