"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileX } from "lucide-react";

export default function OrderDetailsPage() {
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const storedOrderId = localStorage.getItem("imagingOrderId");

    if (storedOrderId) {
      // Redirect to the stored order
      router.push(`/imaging-technician/order-details/${storedOrderId}`);
    } else {
      // Mark as checked so we can show the message
      setHasChecked(true);
    }
  }, [router]);

  // Show loading state while checking localStorage
  if (!hasChecked) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] w-full px-4">
      <div className="flex flex-col items-center justify-center text-center max-w-lg w-full">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <FileX className="h-7 w-7 text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          No Order Selected
        </h2>
        <p className="text-sm text-slate-600 mb-1">
          Please select an order to view imaging details
        </p>
        <p className="text-xs text-slate-500">
          Navigate to an order from the dashboard or search to view its imaging information.
        </p>
      </div>
    </div>
  );
}

