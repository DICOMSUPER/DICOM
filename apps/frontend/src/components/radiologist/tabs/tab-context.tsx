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

    setAvailableTab((tabs) => [
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
    setAvailableTab((prev) => {
      const updated = prev.filter((tab) => tab.id !== id);

      // chọn tab khác làm active
      if (activeTabId === id) {
        const nextActive = updated.length > 0 ? updated[updated.length - 1] : { id: "0" };
        setActiveTabId(nextActive.id);
      }

      return updated;
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
