"use client";

import { Upload, X, File, CheckCircle, Loader2 } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import { toast } from "@/components/common/Toast";
import type { ImagingOrder } from "@/interfaces/image-dicom/imaging-order.interface";

// Sample machine data - replace with actual data source
const MACHINES = [
  { id: "machine-1", name: "CT Scanner - Room A" },
  { id: "machine-2", name: "X-Ray - Room B" },
  { id: "machine-3", name: "MRI - Room C" },
  { id: "machine-4", name: "Ultrasound - Room D" },
];

export default function FileUpload({
  fileInputRef,
  order,
  isImporting,
  setIsImporting,
  importProgress,
  setImportProgress,
  files,
  setFiles,
}: {
  enabled: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  order: ImagingOrder;
  isImporting: boolean;
  setIsImporting: (isImporting: boolean) => void;
  importProgress: number;
  setImportProgress: (fileNumber: number) => void;
  files: File[];
  setFiles: (files: File[]) => void;
}) {
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [showNotification, setShowNotification] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isComplete, setIsComplete] = useState(false);

  const roomId = order?.imagingOrderForm?.roomId;

  useEffect(() => {
    if (importProgress === 100 && isImporting) {
      setIsComplete(true);
      toast("Import complete! File has been successfully imported.", {
        type: "success",
        durationSeconds: 5,
        tapToClose: true,
      });
      setTimeout(() => {
        setShowNotification(true);
        setCountdown(10);
      }, 500);
    }
  }, [importProgress, isImporting]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showNotification && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      handleCloseNotification();
    }
    return () => clearTimeout(timer);
  }, [showNotification, countdown]);

  const handleCloseNotification = () => {
    setShowNotification(false);
    setIsComplete(false);
    setCountdown(10);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isImporting || files.length > 0) return;

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.name.toLowerCase().endsWith(".dcm") ||
        file.name.toLowerCase().endsWith(".dicom")
    );

    if (droppedFiles.length > 0) {
      setFiles([droppedFiles[0]]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (files.length > 0) return;

    const selectedFiles = Array.from(e.target.files || []).filter(
      (file) =>
        file.name.toLowerCase().endsWith(".dcm") ||
        file.name.toLowerCase().endsWith(".dicom")
    );

    if (selectedFiles.length > 0) {
      setFiles([selectedFiles[0]]);
    }
    e.target.value = "";
  };

  const removeFile = () => {
    setFiles([]);
  };

  const handleUpload = async () => {
    if (files.length === 0 || !selectedMachine) {
      toast("Please select a machine and ensure a file is selected.", {
        type: "error",
        durationSeconds: 5,
      });
      return;
    }

    try {
      setIsImporting(true);
      setIsComplete(false);

      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setImportProgress(i);
      }

      setFiles([]);
      setSelectedMachine("");
      setTimeout(() => {
        setImportProgress(0);
        setIsImporting(false);
      }, 2000);
    } catch (err) {
      toast("Import failed. Please try again.", {
        type: "error",
        durationSeconds: 6,
      });
      setIsImporting(false);
      setIsComplete(false);
    }
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-base font-semibold mb-6 text-gray-900">
          Import DICOM Images
        </h3>

        {/* Machine Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Machine
          </label>
          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            disabled={isImporting}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <option value="">-- Select a machine --</option>
            {MACHINES.map((machine) => (
              <option key={machine.id} value={machine.id}>
                {machine.name}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload Area */}
        <div
          onDrop={isImporting || files.length > 0 ? () => {} : handleDrop}
          onDragOver={
            isImporting || files.length > 0 ? () => {} : handleDragOver
          }
          className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-all cursor-pointer ${
            files.length > 0 || isImporting
              ? "bg-gray-50 border-gray-300 cursor-not-allowed opacity-60"
              : "hover:border-gray-400 hover:bg-gray-50"
          }`}
          onClick={
            isImporting || files.length > 0
              ? () => {}
              : () => fileInputRef.current?.click()
          }
        >
          {isImporting ? (
            <div className="mx-auto">
              <div className="flex justify-center mb-4">
                {!isComplete ? (
                  <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
                ) : (
                  <CheckCircle className="h-10 w-10 text-green-600" />
                )}
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {!isComplete ? "Processing..." : "Upload Complete"}
              </h4>
              <p className="text-xs text-gray-500">
                {!isComplete
                  ? "Processing your file..."
                  : "File successfully imported"}
              </p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <h4 className="text-sm font-medium text-gray-900">
                Drop {order?.procedure?.modality?.modalityName || "DICOM"} file
                here
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Or click to browse for a DICOM file (.dcm, .dicom)
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".dcm,.dicom"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Selected File */}
        {files.length > 0 && !isImporting && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <File className="w-4 h-4 text-gray-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {files[0].name}
                </p>
                <p className="text-xs text-gray-500">
                  {(files[0].size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {isImporting && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-600">
                {!isComplete ? "Processing..." : "Complete"}
              </span>
              <span className="text-xs font-semibold text-gray-900">
                {Math.round(importProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isComplete ? "bg-green-600" : "bg-gray-900"
                }`}
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && !isImporting && (
          <div className="mt-4">
            <button
              onClick={handleUpload}
              disabled={!selectedMachine}
              className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              Import File
            </button>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div
            onClick={handleCloseNotification}
            className="bg-white border border-gray-200 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm text-gray-900">
                  Import Successful!
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  DICOM file imported successfully
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    Click to dismiss
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    Auto-close in {countdown}s
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseNotification();
                }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
