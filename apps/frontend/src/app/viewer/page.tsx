"use client";
import SegmentationsPanel from "@/components/viewer/segmentation/SegmentationPanel";
import StudiesPanel from "@/components/viewer/studies/StudiesPanel";
import ToolBar from "@/components/viewer/toolbar/ToolBar";

import { useState } from "react";


const page = () => {
  const [studiesCollapsed, setStudiesCollapsed] = useState(false);
  const [segmentationsCollapsed, setSegmentationsCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <ToolBar />
      <div className="flex-1 flex justify-center">
        <StudiesPanel
          isCollapsed={studiesCollapsed}
          onToggleCollapse={() => setStudiesCollapsed(!studiesCollapsed)}
        />
        {/* <ViewPortCent /> */}
        <SegmentationsPanel
          isCollapsed={segmentationsCollapsed}
          onToggleCollapse={() =>
            setSegmentationsCollapsed(!segmentationsCollapsed)
          }
        />
      </div>
    </div>
  );
};

export default page;
