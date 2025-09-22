"use client";
import SegmentationsPanel from "@/components/viewer/segmentation/SegmentationPanel";
import StudiesPanel from "@/components/viewer/studies/StudiesPanel";
import ToolBar from "@/components/viewer/toolbar/ToolBar";
import dynamic from "next/dynamic";
// import ViewPortMain from "@/components/viewer/viewport/ViewPortMain";
const ViewPortMain = dynamic(
  () => import("@/components/viewer/viewport/ViewPortMain"),
  {
    ssr: false,
  }
);

import { useState } from "react";

const page = () => {
  const [studiesCollapsed, setStudiesCollapsed] = useState(false);
  const [segmentationsCollapsed, setSegmentationsCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <ToolBar />
      <div className="flex-1 flex justify-between">
        <StudiesPanel
          isCollapsed={studiesCollapsed}
          onToggleCollapse={() => setStudiesCollapsed(!studiesCollapsed)}
        />
        <div className="flex-1 h-full">

                    <ViewPortMain />{" "}
                    {/* bên trong nên có h-full nếu dùng 100% */}



        </div>
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
