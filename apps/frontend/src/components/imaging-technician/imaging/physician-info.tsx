import React from "react";
import { User } from "@/interfaces/user/user.interface";
import { Building2, Mail } from "lucide-react";

export default function PhysicianInfo({ physician }: { physician: User }) {
  const dept = physician.department?.departmentName || "N/A";
  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Ordering Physician
        </h3>
        <div className="flex items-start gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">
              Dr. {physician.lastName} {physician.firstName}
            </p>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
              <Building2 className="h-3.5 w-3.5" />
              <span>{dept}</span>
            </div>
            {physician.email && (
              <div className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate max-w-[180px]">{physician.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
