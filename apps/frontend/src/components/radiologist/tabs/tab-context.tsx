import React, { ReactNode, createContext, useContext, useState } from "react";
import BaseTab from "./base-tab";
import Sidebar from "../side-bar";
import StudyTab from "./study-tab";

export interface TabData {
  id: string;
  name: string;
  tabContent: ReactNode;
  canNotClose?: boolean;
  hasSideBar?: boolean;
  SidebarContent?: ReactNode;
}

type SerializableTabData = Omit<TabData, "tabContent" | "SidebarContent"> & {
  sidebarType?: string; // Add this to track sidebar type
};

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
    {
      id: "1",
      name: "Study 1",
      tabContent: <StudyTab />,
      hasSideBar: false,
    },
  ],
});

export const useTabs = () => {
  const context = useContext(TabContext);
  if (!context) throw new Error("useTabs must be used within TabProvider");
  return context;
};

const recreateTab = (sTab: SerializableTabData): TabData => {
  let tabContent: ReactNode;
  let sidebarContent: ReactNode | undefined;

  if (sTab.id === "0") {
    tabContent = <BaseTab />;
    // Always recreate sidebar for tab 0
    if (sTab.hasSideBar) {
      sidebarContent = <Sidebar />;
    }
  } else {
    tabContent = <StudyTab />;
    // StudyTab doesn't have sidebar
    sidebarContent = undefined;
  }

  return {
    ...sTab,
    tabContent,
    SidebarContent: sidebarContent,
    hasSideBar: !!sidebarContent, // Ensure hasSideBar matches actual sidebar presence
  };
};

export default function TabProvider({ children }: { children: ReactNode }) {
  const [activeTabId, setActiveTabId] = useState("0");
  const [availableTabs, setAvailableTabs] = useState<TabData[]>([
    {
      id: "0",
      name: "Working tree",
      tabContent: <BaseTab />,
      canNotClose: true,
      hasSideBar: true,
      SidebarContent: <Sidebar />,
    },
    {
      id: "1",
      name: "Study 1",
      tabContent: <StudyTab />,
      hasSideBar: false,
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
    setAvailableTabs([
      ...availableTabs,
      { id, name, tabContent, hasSideBar, SidebarContent },
    ]);
  };

  const closeTab = (id: string) => {
    if (id === "0") return;

    setAvailableTabs((prevTabs) => {
      const tabIndex = prevTabs.findIndex((tab) => tab.id === id);
      if (tabIndex === -1) return prevTabs;

      const updatedTabs = prevTabs.filter((tab) => tab.id !== id);
      const newActiveTab = updatedTabs[tabIndex - 1] ||
        updatedTabs[0] || { id: "0" };

      setActiveTabId(newActiveTab.id);
      return updatedTabs;
    });
  };

  React.useEffect(() => {
    try {
      const storedTabs = sessionStorage.getItem("browser-tabs");
      const storedActiveId = sessionStorage.getItem("browser-active-tab");

      if (storedTabs) {
        const parsedTabs: SerializableTabData[] = JSON.parse(storedTabs);

        if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
          const recreatedTabs = parsedTabs.map(recreateTab);
          setAvailableTabs(recreatedTabs);
          setActiveTabId(storedActiveId || parsedTabs[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load tabs from storage:", error);
    }
  }, []);

  React.useEffect(() => {
    try {
      const serializableTabs = availableTabs.map(
        ({ tabContent, SidebarContent, ...rest }) => rest
      );
      sessionStorage.setItem("browser-tabs", JSON.stringify(serializableTabs));
      sessionStorage.setItem("browser-active-tab", activeTabId);
    } catch (error) {
      console.error("Failed to save tabs to storage:", error);
    }
  }, [availableTabs, activeTabId]);

  return (
    <TabContext.Provider
      value={{ availableTabs, activeTabId, setActiveTabId, openTab, closeTab }}
    >
      {children}
    </TabContext.Provider>
  );
}
