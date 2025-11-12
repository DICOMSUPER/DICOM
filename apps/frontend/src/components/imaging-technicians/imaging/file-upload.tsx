"use client";

import { Upload, X, File, CheckCircle, Loader2 } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { ImagingOrder } from "@/interfaces/image-dicom/imaging-order.interface";
import { ModalityMachine } from "@/interfaces/image-dicom/modality-machine.interface";

export default function FileUpload({
  fileInputRef,
  order,
  isImporting,
  setIsImporting,
  importProgress,
  setImportProgress,
  file,
  setFile,
  machines,
  isLoadingModalityMachines,
  onUpload,
}: {
  enabled: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  order: ImagingOrder;
  isImporting: boolean;
  setIsImporting: (isImporting: boolean) => void;
  importProgress: number;
  setImportProgress: (fileNumber: number) => void;
  file: File | null;
  setFile: (files: File | null) => void;
  machines: ModalityMachine[];
  isLoadingModalityMachines: boolean;
  onUpload: (dicomFile: File, modalityMachineId: string) => void;
}) {
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (importProgress === 100 && isImporting) {
      setIsComplete(true);
      toast.success("Import Complete", {
        description: "File has been successfully imported.",
        duration: 5000,
      });
    }
  }, [importProgress, isImporting]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isImporting || file) return;

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.name.toLowerCase().endsWith(".dcm") ||
        file.name.toLowerCase().endsWith(".dicom")
    );

    if (droppedFiles.length > 0) {
      setFile(droppedFiles[0]);
      toast.success("File Added", {
        description: `${droppedFiles[0].name} is ready to import`,
        duration: 3000,
      });
    } else {
      toast.error("Invalid File", {
        description: "Please upload a valid DICOM file (.dcm or .dicom)",
        duration: 4000,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (file) return;

    const selectedFiles = Array.from(e.target.files || []).filter(
      (file) =>
        file.name.toLowerCase().endsWith(".dcm") ||
        file.name.toLowerCase().endsWith(".dicom")
    );

    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      toast.success("File Selected", {
        description: `${selectedFiles[0].name} is ready to import`,
        duration: 3000,
      });
    } else {
      toast.error("Invalid File", {
        description: "Please select a valid DICOM file (.dcm or .dicom)",
        duration: 4000,
      });
    }
    e.target.value = "";
  };

  const removeFile = () => {
    setFile(null);
    toast.info("File Removed", {
      description: "You can select another file to import",
      duration: 2000,
    });
  };

  const handleUpload = async () => {
    if (!file || !selectedMachine) {
      toast.warning("Missing Information", {
        description: "Please select a machine and ensure a file is selected.",
        duration: 4000,
      });
      return;
    }

    try {
      setIsImporting(true);
      setIsComplete(false);

      toast.info("Starting Import", {
        description: "Processing your DICOM file...",
        duration: 2000,
      });

      await onUpload(file, selectedMachine);

      setFile(null);
      setSelectedMachine("");
      setTimeout(() => {
        setImportProgress(0);
        setIsImporting(false);
      }, 2000);
      toast.success("Import Complete", {
        description: "File has been successfully imported.",
        duration: 5000,
      });
    } catch (err: any) {
      console.error("Upload error:", err);

      // Extract error message from different error formats
      let errorMessage = "Please try again.";

      if (err?.data?.message) {
        // Axios error format
        errorMessage = err.data.message;
      } else if (err?.message) {
        // Standard Error object
        errorMessage = err.message;
      } else if (typeof err === "string") {
        // String error
        errorMessage = err;
      }

      toast.error("Import Failed", {
        description: errorMessage,
        duration: 6000,
      });

      setIsImporting(false);
      setIsComplete(false);
      setImportProgress(0);
    }
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">
            Import DICOM Images
          </h3>
        </div>

        {/* Machine Selection */}
        <div className="mb-6 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Machine
          </label>
          {!isLoadingModalityMachines ? (
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              disabled={isImporting}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              <option value="">-- Select a machine --</option>
              {machines.map((machine) => (
                <option key={machine.id} value={machine.id}>
                  {machine.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading machines...
            </div>
          )}
        </div>

        {/* File Upload Area */}
        <div
          onDrop={isImporting || file ? () => {} : handleDrop}
          onDragOver={isImporting || file ? () => {} : handleDragOver}
          className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-all cursor-pointer mx-6 my-2 ${
            file || isImporting
              ? "bg-gray-50 border-gray-300 cursor-not-allowed opacity-60"
              : "hover:border-gray-400 hover:bg-gray-50"
          }`}
          onClick={
            isImporting || file ? () => {} : () => fileInputRef.current?.click()
          }
        >
          {isImporting ? (
            <div className="mx-auto mx-6">
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
            <div
              className={`mx-6 ${
                file ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <h4 className="text-sm font-medium text-gray-900">
                Drop {order?.procedure?.modality?.modalityName || "DICOM"} file
                here
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Or click to browse for a DICOM file (.dcm, .dicom)
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".dcm,.dicom"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* Selected File */}
        {file && !isImporting && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between mx-6">
            <div className="flex items-center gap-2">
              <File className="w-4 h-4 text-gray-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
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
        {file && !isImporting && (
          <div className="mt-4 mx-6">
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
    </div>
  );
}
