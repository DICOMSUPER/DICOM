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
      tabContent: (
        <Suspense fallback={<div className="p-4">Loading...</div>}>
          <BaseTab />
        </Suspense>
      ),
      canNotClose: true,
      hasSideBar: true,
      SidebarContent: (
        <Suspense fallback={<div className="p-4">Loading sidebar...</div>}>
          <Sidebar />
        </Suspense>
      ),
    },
  ],
});

export const useTabs = () => useContext(TabContext);

// ✅ Hàm build lại tab từ storage
const recreateTab = (sTab: SerializableTabData): TabData => {
  let tabContent: ReactNode = <MedicalRecordPage patientId="" />;
  let sidebarContent: ReactNode | undefined;

  if (sTab.id === "0") {
    tabContent = (
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <BaseTab />
      </Suspense>
    );
    sidebarContent = (
      <Suspense fallback={<div className="p-4">Loading sidebar...</div>}>
        <Sidebar />
      </Suspense>
    );
  } else if (sTab.id.startsWith("patient-")) {
    const patientId = sTab.id.replace("patient-", "");
    tabContent = <MedicalRecordPage patientId={patientId} />;
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
      tabContent: (
        <Suspense fallback={<div className="p-4">Loading...</div>}>
          <BaseTab />
        </Suspense>
      ),
      canNotClose: true,
      SidebarContent: (
        <Suspense fallback={<div className="p-4">Loading sidebar...</div>}>
          <Sidebar />
        </Suspense>
      ),
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

    setAvailableTabs((tabs) => [
      ...tabs,
      { id, name, tabContent, hasSideBar, SidebarContent },
    ]);

    setActiveTabId(id);
  };

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

  // ✅ Restore tabs và mở patient tab (chỉ chạy 1 lần khi mount)
  useEffect(() => {
    try {
      const storedTabs = sessionStorage.getItem("browser-tabs");
      const storedActiveId = sessionStorage.getItem("browser-active-tab");
      const savedPatientId = localStorage.getItem("patientId");

      // Nếu có sessionStorage, restore tabs
      if (storedTabs) {
        const parsed: SerializableTabData[] = JSON.parse(storedTabs);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const recreated = parsed.map(recreateTab);

          // Kiểm tra xem có patient tab trong restored tabs không
          const hasPatientTab = recreated.some(
            (t) => t.id === "patient-" + savedPatientId
          );

          // Nếu có patientId nhưng chưa có tab, thêm vào
          if (savedPatientId && !hasPatientTab) {
            const newTab: TabData = {
              id: "patient-" + savedPatientId,
              name: "Patient Record",
              tabContent: <MedicalRecordPage patientId={savedPatientId} />,
              hasSideBar: true,
            };
            recreated.push(newTab);
            setActiveTabId(newTab.id);
          } else {
            setActiveTabId(storedActiveId || parsed[0].id);
          }

          setAvailableTabs(recreated);
          return;
        }
      }

      // Nếu KHÔNG có sessionStorage nhưng CÓ patientId
      if (savedPatientId) {
        const newTab: TabData = {
          id: "patient-" + savedPatientId,
          name: "Hồ sơ bệnh nhân",
          tabContent: <MedicalRecordPage patientId={savedPatientId} />,
          hasSideBar: false,
        };

        setAvailableTabs((prev) => [...prev, newTab]);
        setActiveTabId(newTab.id);
      }
    } catch (error) {
      console.error("Failed to load tabs:", error);
    }
  }, []); // ✅ Empty deps - chỉ chạy 1 lần

  // ✅ Lưu tabs vào sessionStorage
  useEffect(() => {
    try {
      const serializable = availableTabs.map(
        ({ tabContent, SidebarContent, ...rest }) => rest
      );
      sessionStorage.setItem("browser-tabs", JSON.stringify(serializable));
      sessionStorage.setItem("browser-active-tab", activeTabId);
    } catch (error) {
      console.error("Failed to save tabs:", error);
    }
  }, [availableTabs, activeTabId]);

  return (
    <TabContext.Provider
      value={{ availableTabs, activeTabId, setActiveTabId, openTab, closeTab }}
    >
      <Suspense fallback={<>Loading...</>}>{children}</Suspense>
    </TabContext.Provider>
  );
}