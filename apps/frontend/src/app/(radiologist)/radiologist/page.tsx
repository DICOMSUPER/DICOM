"use client";

import TabLayout from "@/components/radiologist/tabs/tab-layout";
import TabProvider from "@/components/radiologist/tabs/tab-context";

export default function Page() {
  return (
    <TabProvider>
      <TabLayout />
    </TabProvider>
  );
}
