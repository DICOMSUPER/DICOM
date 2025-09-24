"use client";

import { Upload, X, File, CheckCircle, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "@/components/common/Toast";

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
  order: {
    modality?: { modality_name?: string } | null;
  } | null;
  isImporting: boolean;
  setIsImporting: (isImporting: boolean) => void;
  importProgress: number;
  setImportProgress: (fileNumber: number) => void;
  files: File[];
  setFiles: (files: File[]) => void;
}) {
  const [showNotification, setShowNotification] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (importProgress === 100 && isImporting) {
      setIsComplete(true);
      toast("Import complete! All files have been successfully imported.", {
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
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.name.toLowerCase().endsWith(".dcm") ||
        file.name.toLowerCase().endsWith(".dicom")
    );
    setFiles([...files, ...droppedFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(
      (file) =>
        file.name.toLowerCase().endsWith(".dcm") ||
        file.name.toLowerCase().endsWith(".dicom")
    );
    setFiles([...files, ...selectedFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    try {
      setIsImporting(true);
      setIsComplete(false);

      for (let i = 0; i <= files.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setImportProgress((i / files.length) * 100);
      }

      setFiles([]);
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
      <div className="bg-[var(--background)] rounded-lg shadow-lg p-6 border border-[var(--border)]">
        <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
          Import DICOM Images
        </h3>

        <div
          onDrop={isImporting ? () => {} : handleDrop}
          onDragOver={isImporting ? () => {} : handleDragOver}
          className={`border-2 border-dashed border-[var(--border)] rounded-lg p-12 text-center hover:border-[var(--primary)] transition-colors cursor-pointer bg-[var(--surface)] ${
            isImporting && "bg-slate-50 cursor-not-allowed opacity-60"
          }`}
          onClick={isImporting ? () => {} : () => fileInputRef.current?.click()}
        >
          {isImporting ? (
            <div className="mx-auto">
              <div className="relative mb-6">
                {!isComplete ? (
                  <Loader2 className="mx-auto h-12 w-12 text-[var(--primary)] animate-spin" />
                ) : (
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                )}
              </div>
              <h4 className="text-lg font-medium text-[var(--foreground)] mb-2">
                {!isComplete ? "Processing Images..." : "Import Complete!"}
              </h4>
              <p className="text-sm text-[var(--neutral)] mb-4">
                {!isComplete
                  ? `Processing ${files.length} file${
                      files.length !== 1 ? "s" : ""
                    }...`
                  : "All files have been successfully imported"}
              </p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-[var(--neutral)]" />
              <h4 className="mt-4 text-lg font-medium text-[var(--foreground)]">
                Drop {order?.modality?.modality_name || "DICOM"} images here
              </h4>
              <p className="mt-2 text-sm text-[var(--neutral)]">
                Or click to browse for DICOM files (.dcm, .dicom)
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".dcm,.dicom"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {files.length > 0 && !isImporting && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-[var(--foreground)] mb-3">
              Selected Files ({files.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg"
                >
                  <div className="flex items-center">
                    <File className="w-4 h-4 text-[var(--primary)] mr-2" />
                    <span className="text-sm text-[var(--foreground)] truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-[var(--neutral)] ml-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-[var(--neutral)] hover:text-[var(--destructive)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && !isImporting && (
          <div className="mt-6">
            <button
              onClick={handleUpload}
              className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-2 px-4 rounded-lg hover:bg-[var(--secondary)] transition-colors duration-200 font-medium"
            >
              Import {files.length} file{files.length !== 1 ? "s" : ""}
            </button>
          </div>
        )}

        {isImporting && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-[var(--neutral)] mb-3">
              <span className="font-medium">
                {!isComplete ? "Processing images..." : "Import complete!"}
              </span>
              <span className="font-semibold">
                {Math.round(importProgress)}%
              </span>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="relative w-full bg-[var(--surface)] rounded-full h-3 border border-[var(--border)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out relative ${
                  isComplete
                    ? "bg-gradient-to-r from-green-400 to-green-500"
                    : "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
                }`}
                style={{ width: `${importProgress}%` }}
              >
                {/* Shimmer effect for loading */}
                {!isComplete && (
                  <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                )}
              </div>
            </div>

            <div className="text-xs text-[var(--neutral)] mt-2 text-center">
              {!isComplete
                ? `${Math.round((importProgress / 100) * files.length)} of ${
                    files.length
                  } files processed`
                : "Ready to view imported files"}
            </div>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div
            onClick={handleCloseNotification}
            className="bg-white border border-[var(--border)] rounded-lg shadow-xl p-4 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[var(--foreground)] text-sm">
                  Import Successful!
                </h4>
                <p className="text-xs text-[var(--neutral)] mt-1">
                  {files.length > 0 ? files.length : "All"} DICOM file
                  {files.length !== 1 ? "s" : ""} imported successfully
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[var(--neutral)]">
                    Click to dismiss
                  </span>
                  <span className="text-xs font-medium text-[var(--primary)]">
                    Auto-close in {countdown}s
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseNotification();
                }}
                className="flex-shrink-0 text-[var(--neutral)] hover:text-[var(--destructive)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress indicator for auto-close */}
            <div className="mt-3 w-full bg-[var(--surface)] rounded-full h-1 overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((10 - countdown) / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
