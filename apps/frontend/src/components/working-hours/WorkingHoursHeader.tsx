"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function WorkingHoursHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between pb-4 border-border">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-foreground">Working Hours</h1>
        <p className="text-foreground">Manage staffs working hours and break times</p>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  );
}
