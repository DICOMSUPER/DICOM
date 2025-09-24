"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

interface TabData {
  value: string;
  label: string;
  count: number;
}

interface ReceptionTableTabsProps {
  tabs: TabData[];
  defaultTab: string;
  children: ReactNode;
  className?: string;
}

export function ReceptionTableTabs({ 
  tabs, 
  defaultTab, 
  children, 
  className = "" 
}: ReceptionTableTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className={`space-y-4 ${className}`}>
      <TabsList className="grid w-full grid-cols-3 border-border">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label} ({tab.count})
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}
