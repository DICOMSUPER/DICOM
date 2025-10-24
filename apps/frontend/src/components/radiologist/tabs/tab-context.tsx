import React, { ReactNode, createContext, useContext, useState } from "react";
import BaseTab from "./base-tab";
import Sidebar from "../side-bar";

export interface TabData {
  id: string;
  name: string;
  tabContent: ReactNode;
  canNotClose?: boolean;
  hasSideBar?: boolean;
  SidebarContent?: ReactNode;
}

interface TabContextType {
  activeTabId: string;
  availableTabs: TabData[];
  setActiveTabId?: React.Dispatch<React.SetStateAction<string>>;
  openTab?: (
    id: string,
    name: string,
    tabContent: ReactNode,
    hasSideBar?: boolean,
    SidebarContent?: ReactNode
  ) => void;
  closeTab?: (id: string) => void;
}

const TabContext = createContext<TabContextType>({
  activeTabId: "0",
  availableTabs: [
    {
      id: "0",
      name: "Working tree",
      tabContent: <BaseTab />,
      canNotClose: true,
      hasSideBar: true,
      SidebarContent: <Sidebar />,
    },
  ],
});

export const useTabs = () => {
  const context = useContext(TabContext);
  if (!context) throw new Error("useTabs must be used within TabProvider");
  return context;
};

export default function TabProvider({ children }: { children: ReactNode }) {
  const [activeTabId, setActiveTabId] = useState("0");
  const [availableTabs, setAvailableTab] = useState<TabData[]>([
    {
      id: "0",
      name: "Working tree",
      tabContent: <BaseTab />,
      hasSideBar: true,
      SidebarContent: <Sidebar />,
    },
  ]);

  const openTab = (
    id: string,
    name: string,
    tabContent: ReactNode,
    hasSideBar?: boolean,
    SidebarContent?: ReactNode
  ) => {
    if (availableTabs.find((tab) => tab.id === id)) {
      setActiveTabId(id);
      return;
    }
    setActiveTabId(id);
    setAvailableTab([
      ...availableTabs,
      { id, name, tabContent, hasSideBar, SidebarContent },
    ]);
  };

  const closeTab = (id: string) => {
    // Prevent closing the main tab
    if (id === "0") return;

    setAvailableTab((prevTabs) => {
      const tabIndex = prevTabs.findIndex((tab) => tab.id === id);
      if (tabIndex === -1) return prevTabs;

      // Remove the closed tab
      const updatedTabs = prevTabs.filter((tab) => tab.id !== id);

      // Determine which tab should become active
      const newActiveTab = updatedTabs[tabIndex - 1] ||
        updatedTabs[0] || { id: "0" };

      setActiveTabId(newActiveTab.id);
      return updatedTabs;
    });
  };

  return (
    <TabContext.Provider
      value={{ availableTabs, activeTabId, setActiveTabId, openTab, closeTab }}
    >
      {children}
    </TabContext.Provider>
  );
}
