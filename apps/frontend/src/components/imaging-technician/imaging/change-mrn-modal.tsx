import { Dices } from "lucide-react";
import React, { useState } from "react";

export default function ChangeMrnModal({
  onClose,
  onSave,
  patientId,
  isOpen,
}: {
  onClose: () => void;
  onSave: (id: string, newMrn: string) => void;
  patientId: string;
  isOpen: boolean;
}) {
  const [newMrn, setNewMrn] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (!newMrn.trim()) {
      setError("MRN is required");
      return;
    }
    onSave(patientId, newMrn.trim());
    onClose();
  };

  const handleGenerateMrn = () => {
    // Generate truly random MRN using timestamp and multiple random sources
    const timestamp = Date.now().toString(36);
    const rand1 = Math.floor(Math.random() * 46656)
      .toString(36)
      .padStart(3, "0");
    const rand2 = Math.floor(Math.random() * 46656)
      .toString(36)
      .padStart(3, "0");
    const rand3 = Math.floor(Math.random() * 46656)
      .toString(36)
      .padStart(3, "0");

    // Combine and take last 8 characters for consistent length
    const combined = (timestamp + rand1 + rand2 + rand3).toUpperCase();
    const generatedMrn = combined.slice(-8);

    setNewMrn(generatedMrn);
    setError("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Change MRN</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="mb-4">
            <label
              htmlFor="mrn"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New MRN
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="mrn"
                value={newMrn}
                onChange={(e) => {
                  setNewMrn(e.target.value);
                  setError("");
                }}
                placeholder="Enter new MRN"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleGenerateMrn}
                className="px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-blue-600 transition-colors"
                title="Generate random MRN"
              >
                <Dices size={20} />
              </button>
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Note:</span> Changing the MRN will
              update the patient's medical record number across the system.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
