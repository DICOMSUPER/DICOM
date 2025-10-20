"use client";

import React from "react";
import {
  Camera,
  AlertTriangle,
  Clock,
  MapPin,
  Activity,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ImagingOrderCard({ order }: { order: any }) {
  const navigate = useRouter();
  const patientName = `${order.visit.patient.first_name} ${order.visit.patient.last_name}`;
  const mrn = order.visit.patient.patient_code;
  const dob = order.visit.patient.date_of_birth;
  const physician = `${order.ordering_physician.first_name} ${order.ordering_physician.last_name}`;
  const modalityName = order.modality.modality_name;
  const room = order.room.room_number;

  const handleViewOrder = () => {
    navigate.push(`/imaging-technicians/order/${order.order_id}`);
  };

  const getUrgencyBadge = (urgency: string) => {
    const normalized = urgency.toUpperCase();
    const colors: Record<string, string> = {
      STAT: "bg-red-100 text-red-800 border-red-200",
      URGENT: "bg-orange-100 text-orange-800 border-orange-200",
      ROUTINE: "bg-green-100 text-green-800 border-green-200",
    };
    return `px-3 py-1 rounded-full text-xs font-semibold border ${
      colors[normalized] ||
      "bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]"
    }`;
  };

  const getStatusBadge = (status: string) => {
    const normalized = status.toUpperCase().replace(/ /g, "_");
    const colors: Record<string, string> = {
      SCHEDULED: "bg-[var(--primary)]/10 text-[var(--primary)]",
      IN_PROGRESS: "bg-[var(--accent)]/10 text-[var(--accent)]",
      COMPLETED: "bg-[var(--secondary)]/10 text-[var(--secondary)]",
      CANCELLED: "bg-[var(--destructive)]/10 text-[var(--destructive)]",
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${
      colors[normalized] || "bg-[var(--muted)] text-[var(--foreground)]"
    }`;
  };

  const getStatusLabel = (status: string) => {
    return status
      .split("_")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="p-6 hover:bg-[var(--surface)]">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {patientName}
                </h3>
                <span className={getUrgencyBadge(order.urgency)}>
                  {order.urgency.toUpperCase()}
                </span>
                <span className={getStatusBadge(order.order_status)}>
                  {getStatusLabel(order.order_status)}
                </span>
              </div>
              <div className="text-sm text-[var(--foreground)] mt-1">
                MRN: {mrn} • DOB: {dob}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-[var(--foreground)]">
                Modality:
              </span>
              <div className="text-[var(--foreground)] flex items-center mt-1">
                <Activity className="w-4 h-4 mr-1 text-[var(--primary)]" />
                {modalityName}
              </div>
            </div>
            <div>
              <span className="font-medium text-[var(--foreground)]">
                Body Part:
              </span>
              <div className="text-[var(--foreground)] mt-1">
                {order.body_part}
              </div>
            </div>
            <div>
              <span className="font-medium text-[var(--foreground)]">
                Scheduled:
              </span>
              <div className="text-[var(--foreground)] flex items-center mt-1">
                <Clock className="w-4 h-4 mr-1 text-[var(--secondary)]" />
                {new Date(order.scheduled_time).toLocaleTimeString()}
              </div>
            </div>
            <div>
              <span className="font-medium text-[var(--foreground)]">
                Room:
              </span>
              <div className="text-[var(--foreground)] flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1 text-[var(--accent)]" />
                {room}
              </div>
            </div>
          </div>

          <div>
            <span className="font-medium text-[var(--foreground)]">
              Clinical Indication:
            </span>
            <div className="text-[var(--foreground)] mt-1">
              {order.clinical_indication}
            </div>
          </div>

          <div>
            <span className="font-medium text-[var(--foreground)]">
              Ordering Physician:
            </span>
            <div className="text-[var(--foreground)] mt-1">{physician}</div>
          </div>

          {order.special_instructions && (
            <div>
              <span className="font-medium text-[var(--foreground)]">
                Special Instructions:
              </span>
              <div className="text-[var(--foreground)] mt-1 p-2 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded">
                {order.special_instructions}
              </div>
            </div>
          )}

          {order.contrast_agent && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-sm font-medium text-[var(--accent)]">
                Contrast Agent Required
              </span>
            </div>
          )}
        </div>

        {order.order_status === "in_progress" && (
          <div className="ml-6 flex flex-col space-y-2">
            <button
              onClick={handleViewOrder}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-md text-sm hover:bg-[var(--primary)]/90 flex items-center"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Imaging
            </button>
          </div>
        )}

        {order.order_status === "completed" && (
          <div className="ml-6 flex flex-col space-y-2">
            <button
              onClick={handleViewOrder}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-md text-sm hover:bg-[var(--primary)]/90 flex items-center"
            >
              <Info className="w-4 h-4 mr-2" />
              View Study
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
