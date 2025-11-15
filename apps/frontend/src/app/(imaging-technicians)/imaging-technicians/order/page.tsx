"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function OrderPage() {
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const storedOrderId = localStorage.getItem("imagingOrderId");

    if (storedOrderId) {
      // Redirect to the stored order
      router.push(`/imaging-technicians/order/${storedOrderId}`);
    } else {
      // Mark as checked so we can show the message
      setHasChecked(true);
    }
  }, []);

  // Show loading state while checking localStorage
  if (!hasChecked) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-foreground" />
            <CardTitle>No Order Selected</CardTitle>
          </div>
          <CardDescription>
            Please select an order to view imaging details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">
            Navigate to an order from the dashboard or search to view its
            imaging information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
