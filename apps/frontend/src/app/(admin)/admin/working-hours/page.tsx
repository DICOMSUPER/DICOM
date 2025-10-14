"use client";

import { useState } from "react";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { WorkingHoursHeader } from "@/components/working-hours/WorkingHoursHeader";
import { ClinicHoursSection } from "@/components/working-hours/ClinicHoursSection";
import { BreakTimesSection } from "@/components/working-hours/BreakTimesSection";
import { SpecialHoursSection } from "@/components/working-hours/SpecialHoursSection";

export default function WorkingHoursPage() {
  const [is24HourFormat, setIs24HourFormat] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <WorkspaceLayout sidebar={<SidebarNav />}>
        <WorkingHoursHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ClinicHoursSection 
              is24HourFormat={is24HourFormat}
              setIs24HourFormat={setIs24HourFormat}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <BreakTimesSection />
            <SpecialHoursSection />
          </div>
        </div>
      </WorkspaceLayout>
    </div>
  );
}
