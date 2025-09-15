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
          <div className="relative flex h-full flex-1 items-center justify-center overflow-hidden bg-black">
            <div className="border-input h-[calc(100%-0.25rem)] w-full border">
              <div className="group/pane relative h-full w-full overflow-hidden transition duration-300" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'
              }}>
                <div className="relative h-full w-full">
                  <div className="flex h-full w-full min-w-[5px] flex-col">
                    <ViewPortMain /> {/* bên trong nên có h-full nếu dùng 100% */}
                  </div>
                </div>

              </div>
            </div>
          </div>
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
