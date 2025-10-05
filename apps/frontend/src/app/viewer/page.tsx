"use client";
import SegmentationsPanel from "@/components/viewer/segmentation/SegmentationPanel";
import StudiesPanel from "@/components/viewer/studies/StudiesPanel";
import ToolBar from "@/components/viewer/toolbar/ToolBar";
import ViewerLayout from "@/components/viewer/viewport-1/ViewerLayout";
import MultiViewport from "@/components/viewer/viewport/MultiViewport";
const ViewPortMain = dynamic(
  () => import("@/components/viewer/viewport/ViewPortMain"),
  { ssr: false }
);
import { ViewerProvider } from "@/contexts/ViewerContext";
import dynamic from "next/dynamic";
import { useState } from "react";


const page = () => {
  const [studiesCollapsed, setStudiesCollapsed] = useState(false);
  const [segmentationsCollapsed, setSegmentationsCollapsed] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<any>(null);

  const handleSeriesSelect = (series: any) => {
    console.log('Selected series:', series);
    setSelectedSeries(series);
    // Here you would load the DICOM series into the viewport
  };

  return (
    <ViewerProvider>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <ToolBar />
        <div className="flex-1 flex">
          {/* <StudiesPanel
            isCollapsed={studiesCollapsed}
            onToggleCollapse={() => setStudiesCollapsed(!studiesCollapsed)}
            onSeriesSelect={handleSeriesSelect}
          /> */}
          <div className="flex-1 h-full">
            {/* <MultiViewport 
              selectedSeries={selectedSeries}
            /> */}
            <ViewPortMain
              // selectedSeries={selectedSeries}
            />
          </div>
          <SegmentationsPanel
            isCollapsed={segmentationsCollapsed}
            onToggleCollapse={() =>
              setSegmentationsCollapsed(!segmentationsCollapsed)
            }
          />
        </div>
      </div>
    </ViewerProvider>
    // <div>
    //   {/* <ViewerLayout /> */}
    // </div>


  );
};

export default page;
