import { Upload, X, File } from "lucide-react";
import React from "react";

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
  fileInputRef: React.RefObject<HTMLInputElement>;
  order: any;
  isImporting: boolean;
  setIsImporting: (isImporting: boolean) => void;
  importProgress: number;
  setImportProgress: (fileNumber: number) => void;
  files: File[];
  setFiles: (files: File[]) => void;
}) {
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
    // Reset input value to allow selecting the same files again
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

      // Simulate file processing progress, the backend will handle the data extraction from dicom to create studies and series  & instance
      for (let i = 0; i <= files.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setImportProgress((i / files.length) * 100);
      }

      setFiles([]);
      setImportProgress(0);
    } catch (error) {
      console.log(error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-[var(--background)] rounded-lg shadow-lg p-6 border border-[var(--border)]">
      <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
        Import DICOM Images
      </h3>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-[var(--border)] rounded-lg p-12 text-center hover:border-[var(--primary)] transition-colors cursor-pointer bg-[var(--surface)]"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-[var(--neutral)]" />
        <h4 className="mt-4 text-lg font-medium text-[var(--foreground)]">
          Drop {order?.modality?.modality_name || "DICOM"} images here
        </h4>
        <p className="mt-2 text-sm text-[var(--neutral)]">
          Or click to browse for DICOM files (.dcm, .dicom)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".dcm,.dicom"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Display uploaded files */}
      {files.length > 0 && (
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

      {/* Upload button */}
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
          <div className="flex justify-between text-sm text-[var(--neutral)] mb-2">
            <span>Processing images...</span>
            <span>{Math.round(importProgress)}%</span>
          </div>
          <div className="w-full bg-[var(--surface)] rounded-full h-2">
            <div
              className="bg-[var(--primary)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${importProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
