"use client";

import React, {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  Suspense,
} from "react";
import BaseTab from "./base-tab";
import Sidebar from "../side-bar";
import MedicalRecordPage from "../tabs/study-tab";

export interface TabData {
  id: string;
  name: string;
  tabContent: ReactNode;
  canNotClose?: boolean;
  hasSideBar?: boolean;
  SidebarContent?: ReactNode;
}

type SerializableTabData = Omit<TabData, "tabContent" | "SidebarContent">;

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

export const useTabs = () => useContext(TabContext);

// ✅ Hàm build lại tab từ storage
const recreateTab = (sTab: SerializableTabData): TabData => {
  let tabContent: ReactNode = <MedicalRecordPage patientId="" />;
  let sidebarContent: ReactNode | undefined;

  if (sTab.id === "0") {
    tabContent = <BaseTab />;
    sidebarContent = <Sidebar />;
  }

  return {
    ...sTab,
    tabContent,
    SidebarContent: sidebarContent,
    hasSideBar: !!sidebarContent,
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
  ]);

  // ✅ Sửa đúng cú pháp openTab
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

    setAvailableTabs((tabs) => [
      ...tabs,
      { id, name, tabContent, hasSideBar, SidebarContent },
    ]);

    setActiveTabId(id);
  };

  // ✅ Tự động mở tab từ localStorage
  useEffect(() => {
    const savedPatientId = localStorage.getItem("patientId");

    if (savedPatientId) {
      openTab(
        "patient-" + savedPatientId,
        "Hồ sơ bệnh nhân",
        <MedicalRecordPage patientId={savedPatientId} />
      );
    }
  }, []);

  // ✅ Sửa đúng cú pháp closeTab
  const closeTab = (id: string) => {
    if (id === "0") return;

    if (id.startsWith("patient-")) {
      localStorage.removeItem("patientId");
    }

    setAvailableTabs((prev) => {
      const updated = prev.filter((tab) => tab.id !== id);

      if (activeTabId === id) {
        const next =
          updated.length > 0 ? updated[updated.length - 1] : { id: "0" };
        setActiveTabId(next.id);
      }

      return updated;
    });
  };

  // ✅ Restore tab từ sessionStorage
  useEffect(() => {
    try {
      const storedTabs = sessionStorage.getItem("browser-tabs");
      const storedActiveId = sessionStorage.getItem("browser-active-tab");

      if (storedTabs) {
        const parsed: SerializableTabData[] = JSON.parse(storedTabs);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const recreated = parsed.map(recreateTab);
          setAvailableTabs(recreated);
          setActiveTabId(storedActiveId || parsed[0].id);
        }
      }
    } catch {
      console.error("Failed to load tabs");
    }
  }, []);

  // ✅ Lưu tabs vào sessionStorage
  useEffect(() => {
    try {
      const serializable = availableTabs.map(
        ({ tabContent, SidebarContent, ...rest }) => rest
      );
      sessionStorage.setItem("browser-tabs", JSON.stringify(serializable));
      sessionStorage.setItem("browser-active-tab", activeTabId);
    } catch {
      console.error("Failed to save tabs");
    }
  }, [availableTabs, activeTabId]);

  return (
    <TabContext.Provider
      value={{ availableTabs, activeTabId, setActiveTabId, openTab, closeTab }}
    >
      <Suspense fallback={<>Loading...</>}> {children}</Suspense>
    </TabContext.Provider>
  );
}
