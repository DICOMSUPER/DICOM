"use client";
import React, { useEffect, useState } from "react";
import DicomViewer from "./DicomViewer";
import ViewerSideBar from "./ViewerSideBar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import Loading from "../common/Loading";
import axios from "axios";
import { RenderingEngine } from "@cornerstonejs/core";

export default function DicomViewerWrapper({
  instanceUID,
}: {
  instanceUID?: string | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [instance, setInstance] = useState(null);
  const [study, setStudy] = useState(null);
  const [sameStudyInstances, setSameStudyInstance] = useState([]);

  const [renderingEngine, setRenderingEngine] =
    useState<RenderingEngine | null>(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fetchInstance = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://67de69d0471aaaa742845858.mockapi.io/dicom_instance?sop_instance_uid=${instanceUID}`
      );

      if (response?.data[0]?.series?.study) {
        //this is mock data on mock api, when using api later, may be populate, or use different api
        setStudy(response?.data[0]?.series?.study);

        //fetch a list of instance from the same study, call another api to fetch instance by study_id
        const instancesResponse = await axios.get(
          `https://67de69d0471aaaa742845858.mockapi.io/dicom_instance?study_id=${response?.data[0]?.series?.study}`
        );

        const filteredInstance = instancesResponse.data.filter(
          (instance: any) => instance.sop_instance_uid !== instanceUID
        );

        setSameStudyInstance(filteredInstance);
      }
      setInstance(response.data[0]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstance();
  }, [instanceUID]);

  if (!instanceUID) {
    throw notFound();
  }

  if (isLoading) {
    return <Loading />;
  }
  return (
    <div className="flex h-screen relative">
      <ViewerSideBar
        isOpen={sidebarOpen}
        study={study}
        sameStudyInstances={sameStudyInstances}
        renderingEngine={renderingEngine}
        setRenderingEngine={setRenderingEngine}
      />
      {instance && (
        <DicomViewer
          imageId={`wadouri:${(instance as any)?.file_path}`}
          renderingEngine={renderingEngine}
          setRenderingEngine={setRenderingEngine}
        />
      )}

      <button
        onClick={toggleSidebar}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-r-md transition-all duration-200 z-10"
        style={{ left: sidebarOpen ? "256px" : "0px" }}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  );
}
