"use client";
import {
  CheckCircle,
  CircleCheck,
  CircleX,
  FileText,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { modality_list, ModalityCode } from "./data/modality";

export default function NavigationTabs({
  statusFilter,
  setStatusFilter,
  urgencyFilter,
  setUrgencyFilter,
  modalityFilter,
  setModalityFilter,
  patientName,
  setPatientName,
  onGo,
}: {
  statusFilter: "all" | "in_progress" | "completed" | "cancelled";
  setStatusFilter: (
    v: "all" | "in_progress" | "completed" | "cancelled"
  ) => void;
  urgencyFilter: "" | "routine" | "urgent" | "stat";
  setUrgencyFilter: (v: "" | "routine" | "urgent" | "stat") => void;
  modalityFilter: "" | ModalityCode;
  setModalityFilter: (v: "" | ModalityCode) => void;
  patientName: string;
  setPatientName: (v: string) => void;
  onGo: () => void;
}) {
  const hasActiveFilters =
    statusFilter !== "all" ||
    urgencyFilter !== "" ||
    modalityFilter !== "" ||
    patientName !== "";

  const clearAllFilters = () => {
    setStatusFilter("all");
    setUrgencyFilter("");
    setModalityFilter("");
    setPatientName("");
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      all: "bg-gray-100 text-gray-800 border-gray-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return badges[status as keyof typeof badges] || badges.all;
  };

  console.log(modality_list.length);
  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      "": "bg-gray-100 text-gray-800 border-gray-200",
      routine: "bg-blue-100 text-blue-800 border-blue-200",
      urgent: "bg-amber-100 text-amber-800 border-amber-200",
      stat: "bg-red-100 text-red-800 border-red-200",
    };
    return badges[urgency as keyof typeof badges] || badges[""];
  };

  return (
    <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-4">
        {/* Single row layout with better spacing */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search - takes priority */}
          <div className="relative min-w-0 flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Patient name..."
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Compact filter selects */}
          <div className="flex items-center gap-2">
            <select
              className={`px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${getStatusBadge(
                statusFilter
              )}`}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "all"
                    | "in_progress"
                    | "completed"
                    | "cancelled"
                )
              }
            >
              <option value="all">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className={`px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${getUrgencyBadge(
                urgencyFilter
              )}`}
              value={urgencyFilter}
              onChange={(e) =>
                setUrgencyFilter(
                  e.target.value as "" | "routine" | "urgent" | "stat"
                )
              }
            >
              <option value="">All Urgency</option>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT</option>
            </select>

            <select
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={modalityFilter}
              onChange={(e) =>
                setModalityFilter(e.target.value as ModalityCode)
              }
            >
              <option value="">All Modality</option>
              {modality_list.map((modality) => (
                <option
                  value={modality.modalityCode}
                  key={modality.modalityCode}
                  title={modality.modalityName}
                >
                  {modality.modalityCode}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
            <Button variant={"default"} onClick={onGo}>
              Search
            </Button>
          </div>
        </div>

        {/* Active filters summary (optional - shows what's currently applied) */}
        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <span>Active filters:</span>
            <div className="flex flex-wrap gap-1">
              {patientName && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  Patient: {patientName}
                </span>
              )}
              {statusFilter !== "all" && (
                <span
                  className={`px-2 py-1 rounded border ${getStatusBadge(
                    statusFilter
                  )}`}
                >
                  {statusFilter.replace("_", " ")}
                </span>
              )}
              {urgencyFilter && (
                <span
                  className={`px-2 py-1 rounded border ${getUrgencyBadge(
                    urgencyFilter
                  )}`}
                >
                  {urgencyFilter.toUpperCase()}
                </span>
              )}
              {modalityFilter && (
                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200">
                  {
                    modality_list.find(
                      (modality) => modality.modalityCode === modalityFilter
                    )?.modalityName
                  }
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
