"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
// ...existing imports...

// Loading component
function ImagingTechniciansLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <div className="text-gray-600">Loading...</div>
      </div>
    </div>
  );
}

// Inner component that uses useSearchParams
function ImagingTechniciansContent() {
  const searchParams = useSearchParams();
  // ...existing code that uses searchParams...
  
  return (
    <div>
      {/* Your existing JSX content */}
    </div>
  );
}

// Main page component
export default function ImagingTechniciansPage() {
  return (
    <Suspense fallback={<ImagingTechniciansLoading />}>
      <ImagingTechniciansContent />
    </Suspense>
  );
}