"use client";

import DicomViewerWrapper from "@/components/viewer/DicomViewerWrapper";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function Page() {
  const searchParams = useSearchParams();
  const instanceUID = searchParams.get("StudyInstanceUIDs");

  return (
    <div>
      <DicomViewerWrapper instanceUID={instanceUID} />
    </div>
  );
}
