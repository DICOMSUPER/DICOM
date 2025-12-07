"use client";

import { Suspense } from "react";
import nextDynamic from "next/dynamic";

// Disable static generation for this page to avoid SSR issues with browser APIs
export const dynamic = 'force-dynamic';

// Dynamically import components with SSR disabled to avoid 'self is not defined' errors
const TabProvider = nextDynamic(
  () => import("@/components/radiologist/tabs/tab-context").then((mod) => mod.default),
  { ssr: false }
);

const TabLayout = nextDynamic(
  () => import("@/components/radiologist/tabs/tab-layout").then((mod) => mod.default),
  { ssr: false }
);

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
