"use client";

import { TabData, useTabs } from "./tab-context";
import TabBar from "./tab-bar";
import { ReactNode, useEffect, useState } from "react";

export default function TabLayout() {
  const { availableTabs, activeTabId, setActiveTabId } = useTabs();
  const [currentTab, setCurrentTab] = useState<TabData | null | undefined>(
    null
  );
  useEffect(() => {
    setCurrentTab(availableTabs.find((tab) => tab.id === activeTabId));
  }, [activeTabId]);

  return (
    <div className="flex h-screen">
      {currentTab?.hasSideBar && (
        <div className="w-80 bg-gray-200 border-r border-gray-300 flex-shrink-0">
          <>{currentTab.SidebarContent}</>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab bar */}
        <TabBar />
        {/* Tab content */}
        {currentTab && (
          <div className="flex-1 overflow-hidden">{currentTab.tabContent}</div>
        )}
      </div>
    </div>
  );
}
