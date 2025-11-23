"use client";

import { Suspense } from "react";
import TabLayout from "@/components/radiologist/tabs/tab-layout";
import TabProvider from "@/components/radiologist/tabs/tab-context";

function WorkTreeLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <div className="text-sm text-foreground">Loading work tree...</div>
      </div>
    </div>
  );
}

function WorkTreeContent() {
  return (
    <TabProvider>
      <TabLayout />
    </TabProvider>
  );
}

export default function WorkTreePage() {
  return (
    <Suspense fallback={<WorkTreeLoading />}>
      <WorkTreeContent />
    </Suspense>
  );
}

