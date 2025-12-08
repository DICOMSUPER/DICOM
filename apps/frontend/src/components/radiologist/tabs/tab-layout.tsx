"use client";

import { TabData, useTabs } from "./tab-context";
import TabBar from "./tab-bar";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Loading from "@/components/common/Loading";

export default function TabLayout() {
  const { availableTabs, activeTabId } = useTabs();
  const [currentTab, setCurrentTab] = useState<TabData | null | undefined>(
    null
  );
  const pathname = usePathname();

  // Check if we're on the work tree route - if so, don't show sidebar in tab layout
  // because the work tree is already in the main sidebar
  const isWorkTreeRoute = pathname?.startsWith("/radiologist/work-tree");

  useEffect(() => {
    setCurrentTab(availableTabs.find((tab) => tab.id === activeTabId));
  }, [activeTabId, availableTabs]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex h-full">
        {/* Only show sidebar in tab layout if NOT on work tree route (where it's in main sidebar) */}
        {currentTab?.hasSideBar && !isWorkTreeRoute && (
          <div className="w-80 bg-gray-200 border-r border-gray-300 shrink-0">
            <>{currentTab.SidebarContent}</>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Tab bar */}
          <TabBar />
          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {currentTab && (
              <div className="flex-1 min-h-0 h-full overflow-hidden">
                {currentTab.tabContent}
              </div>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
