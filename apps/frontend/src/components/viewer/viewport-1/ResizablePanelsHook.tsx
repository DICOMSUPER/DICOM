"use client";

import { getPanelGroupDefinition } from "@/constants/panels";
import { useState, useCallback} from "react";
const useResizablePanels = (
  setLeftPanelClosed: (closed: boolean) => void,
  setRightPanelClosed: (closed: boolean) => void
) => {
  const [panelGroupDefinition] = useState(getPanelGroupDefinition({}));

  const onLeftPanelClose = useCallback(() => {
    setLeftPanelClosed(true);
  }, [setLeftPanelClosed]);

  const onLeftPanelOpen = useCallback(() => {
    setLeftPanelClosed(false);
  }, [setLeftPanelClosed, panelGroupDefinition]);

  const onRightPanelClose = useCallback(() => {
    setRightPanelClosed(true);
  }, [setRightPanelClosed]);

  const onRightPanelOpen = useCallback(() => {
    setRightPanelClosed(false);
  }, [setRightPanelClosed, panelGroupDefinition]);

  return [
    {
      collapsedWidth: panelGroupDefinition.shared.collapsedWidth,
      collapsedInsideBorderSize:
        panelGroupDefinition.shared.collapsedInsideBorderSize,
      collapsedOutsideBorderSize:
        panelGroupDefinition.shared.collapsedOutsideBorderSize,
      expandedInsideBorderSize:
        panelGroupDefinition.shared.expandedInsideBorderSize,
      onClose: onLeftPanelClose,
      onOpen: onLeftPanelOpen,
    },
    {
      collapsedWidth: panelGroupDefinition.shared.collapsedWidth,
      collapsedInsideBorderSize:
        panelGroupDefinition.shared.collapsedInsideBorderSize,
      collapsedOutsideBorderSize:
        panelGroupDefinition.shared.collapsedOutsideBorderSize,
      expandedInsideBorderSize:
        panelGroupDefinition.shared.expandedInsideBorderSize,
      onClose: onRightPanelClose,
      onOpen: onRightPanelOpen,
    },
    { direction: "horizontal" as const, id: panelGroupDefinition.groupId },
    {
      collapsible: true,
      onCollapse: () => setLeftPanelClosed(true),
      onExpand: () => setLeftPanelClosed(false),
      order: 0,
      id: panelGroupDefinition.left.panelId,
    },
    { order: 1, id: "viewerLayoutResizableViewportGridPanel" },
    {
      collapsible: true,
      onCollapse: () => setRightPanelClosed(true),
      onExpand: () => setRightPanelClosed(false),

      order: 2,
      id: panelGroupDefinition.right.panelId,
    },
  ] as const;
};

export default useResizablePanels;
