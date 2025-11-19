import React from "react";
import { User } from "@/interfaces/user/user.interface";

export default function PhysicianInfo({ physician }: { physician: User }) {
  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Ordering Physician
        </h3>
        <p className="text-sm text-gray-900 font-medium">
          Dr. {physician.lastName + " " + physician.firstName}
        </p>
        <p className="text-sm text-gray-900 font-medium">
          From: {physician.department?.departmentName}
        </p>
      </div>
    </>
  );
}
