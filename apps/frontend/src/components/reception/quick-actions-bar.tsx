"use client";

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickActionsBar() {
  const router = useRouter();
  
  return (
    <div className="flex items-center justify-between bg-card">
      <div className="flex items-center space-x-4">
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => router.push('/reception/registration')}
        >
          <UserPlus className="w-4 h-4" />
          Register New Patient
        </Button>
      </div>
    </div>
  );
}