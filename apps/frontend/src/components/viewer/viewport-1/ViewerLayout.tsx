"use client";
import React, { useEffect, useState } from "react";
import useResizablePanels from "./ResizablePanelsHook";
import { usePanelService } from "@/contexts/PanelServiceProvider";
import SidePanelWithServices from "./SidePanelWithServices";
import ToolBar from "../toolbar/ToolBar";

interface ViewerLayoutProps {
  commandsManager?: any;
  viewports?: any[];
  ViewportGridComp: React.FC<any>;
  leftPanelClosed?: boolean;
  rightPanelClosed?: boolean;
}

const ViewerLayout: React.FC<ViewerLayoutProps> = ({
  viewports = [],
  ViewportGridComp,
  leftPanelClosed = false,
  rightPanelClosed = false,
}) => {
  // Use Panel Service from context
  const { 
    panelService, 
    hasLeftPanels, 
    hasRightPanels,
    leftPanels,
    rightPanels
  } = usePanelService();
  
  const [leftPanelClosedState, setLeftPanelClosed] = useState(leftPanelClosed);
  const [rightPanelClosedState, setRightPanelClosed] = useState(rightPanelClosed);

  const [leftPanelProps, rightPanelProps] = useResizablePanels(
    setRightPanelClosed,
    setLeftPanelClosed
  );

  useEffect(() => {
    document.body.classList.add("bg-black");
    document.body.classList.add("overflow-hidden");

    return () => {
      document.body.classList.remove("bg-black");
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <div>
      <ToolBar />
      <div
        className="relative flex w-full flex-row flex-nowrap items-stretch overflow-hidden bg-black"
        style={{ height: "calc(100vh - 52px)" }}
      >
        {/* LEFT PANEL */}
        {hasLeftPanels && !leftPanelClosedState && (
          <div className="w-64 bg-gray-900">
            <SidePanelWithServices
              side="left"
              isExpanded={!leftPanelClosedState}
              tabs={leftPanels}
              activeTabIndex={0}
              {...leftPanelProps}
            />
          </div>
        )}

        {/* VIEWPORT */}
        <div className="flex-1 flex items-center justify-center bg-black">
          <ViewportGridComp
            viewports={viewports}
          />
        </div>

        {/* RIGHT PANEL */}
        {hasRightPanels && !rightPanelClosedState && (
          <div className="w-64 bg-gray-900">
            <SidePanelWithServices
              side="right"
              isExpanded={!rightPanelClosedState}
              tabs={rightPanels}
              activeTabIndex={0}
              {...rightPanelProps}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewerLayout;
