import { ImagingOrderStatus } from "@/enums/image-dicom.enum";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Eye, XCircle, CheckCircle } from "lucide-react";

interface StatusButtonProps {
  status: ImagingOrderStatus;
  orderId: string;
  onCallIn?: (orderId: string) => void;
  onViewDetail?: (orderId: string) => void;
  onMarkCompleted?: (orderId: string) => void;
  onMarkCancelled?: (orderId: string) => void;
}

export default function StatusButton({
  status,
  orderId,
  onCallIn,
  onViewDetail,
  onMarkCompleted,
  onMarkCancelled,
}: StatusButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pending status - simple button
  if (status === ImagingOrderStatus.PENDING) {
    return (
      <button
        className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-300 transition-colors"
        onClick={() => onCallIn?.(orderId)}
      >
        Call In
      </button>
    );
  }

  // In Progress status - dropdown with options
  if (status === ImagingOrderStatus.IN_PROGRESS) {
    return (
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-300 transition-colors flex items-center gap-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          Actions
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
            <button
              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-200"
              onClick={() => {
                onViewDetail?.(orderId);
                setIsOpen(false);
              }}
            >
              <Eye className="w-4 h-4 text-gray-600" />
              View Detail
            </button>

            <button
              className="w-full px-4 py-2 text-sm text-left text-green-700 hover:bg-green-50 flex items-center gap-2 border-b border-gray-200"
              onClick={() => {
                onMarkCompleted?.(orderId);
                setIsOpen(false);
              }}
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              Mark as Completed
            </button>

            <button
              className="w-full px-4 py-2 text-sm text-left text-red-700 hover:bg-red-50 flex items-center gap-2"
              onClick={() => {
                onMarkCancelled?.(orderId);
                setIsOpen(false);
              }}
            >
              <XCircle className="w-4 h-4 text-red-600" />
              Mark as Cancelled
            </button>
          </div>
        )}
      </div>
    );
  }

  // Completed or Cancelled status - no actions
  if (
    status === ImagingOrderStatus.COMPLETED ||
    status === ImagingOrderStatus.CANCELLED
  ) {
    return (
      <span className="text-xs text-gray-500 italic">No action available</span>
    );
  }

  return null;
}
