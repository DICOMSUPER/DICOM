"use client";

import React, {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
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
  ],
});

export const useTabs = () => useContext(TabContext);
<<<<<<< HEAD
=======

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
    tabContent = <MedicalRecordPage />;
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
>>>>>>> 26a9b02e5d7f005808fd2c8c4ff2b45729bd6e5e

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

<<<<<<< HEAD
    setAvailableTab((tabs) => [
=======
    setAvailableTabs((tabs) => [
>>>>>>> 26a9b02e5d7f005808fd2c8c4ff2b45729bd6e5e
      ...tabs,
      { id, name, tabContent, hasSideBar, SidebarContent },
    ]);

    setActiveTabId(id);
  };

  // ✅ Tự động mở tab nếu localStorage có patientId
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

  // ✅ ✅ ✅ HÀM closeTab ĐÃ ĐƯỢC THÊM LOGIC XOÁ patientId
  const closeTab = (id: string) => {
    // Không cho đóng tab chính
    if (id === "0") return;

    // Nếu tab dạng "patient-xxx" nghĩa là MedicalRecord
    if (id.startsWith("patient-")) {
      localStorage.removeItem("patientId");
    }

    // Xóa tab khỏi danh sách
<<<<<<< HEAD
    setAvailableTab((prev) => {
=======
    setAvailableTabs((prev) => {
>>>>>>> 26a9b02e5d7f005808fd2c8c4ff2b45729bd6e5e
      const updated = prev.filter((tab) => tab.id !== id);

      // chọn tab khác làm active
      if (activeTabId === id) {
<<<<<<< HEAD
        const nextActive = updated.length > 0 ? updated[updated.length - 1] : { id: "0" };
=======
        const nextActive =
          updated.length > 0 ? updated[updated.length - 1] : { id: "0" };
>>>>>>> 26a9b02e5d7f005808fd2c8c4ff2b45729bd6e5e
        setActiveTabId(nextActive.id);
      }

      return updated;
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
