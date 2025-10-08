"use client";
import React, { useEffect, useState, useCallback } from "react";
import * as Types from "@/types";
import { SidePanel } from "@/components/ui-next/SidePanel";
import { usePanelService } from "@/contexts/PanelServiceProvider";


export type SidePanelWithServicesProps = {
  side: "left" | "right";
  className?: string | undefined;
  activeTabIndex: number;
  tabs?: any;
  expandedWidth?: number | undefined;
  onClose: () => void;
  onOpen: () => void;
  isExpanded: boolean;
  collapsedWidth?: number | undefined;
  expandedInsideBorderSize?: number | undefined;
  collapsedInsideBorderSize?: number | undefined;
  collapsedOutsideBorderSize?: number | undefined;
};

const SidePanelWithServices = ({
  side,
  activeTabIndex: activeTabIndexProp,
  isExpanded,
  tabs: tabsProp,
  onOpen,
  onClose,
  ...props
}: SidePanelWithServicesProps) => {

  const { panelService, leftPanels, rightPanels } = usePanelService();
  
  // Get initial tabs based on side
  const initialTabs = tabsProp ?? (side === 'left' ? leftPanels : rightPanels);

  const [sidePanelExpanded, setSidePanelExpanded] = useState(isExpanded);
  const [activeTabIndex, setActiveTabIndex] = useState(activeTabIndexProp ?? 0);
  const [closedManually, setClosedManually] = useState(false);
  const [tabs, setTabs] = useState(initialTabs);

  const handleActiveTabIndexChange = useCallback(
    ({ activeTabIndex }: { activeTabIndex: number }) => {
      setActiveTabIndex(activeTabIndex);
    },
    []
  );

  const handleOpen = useCallback(() => {
    setSidePanelExpanded(true);
    onOpen?.();
  }, [onOpen]);

  const handleClose = useCallback(() => {
    setSidePanelExpanded(false);
    setClosedManually(true);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    setSidePanelExpanded(isExpanded);
  }, [isExpanded]);

  /** update the active tab index from outside */
  useEffect(() => {
    setActiveTabIndex(activeTabIndexProp ?? 0);
  }, [activeTabIndexProp]);

  // Update tabs when panels change
  useEffect(() => {
    setTabs(side === 'left' ? leftPanels : rightPanels);
  }, [side, leftPanels, rightPanels]);

  useEffect(() => {
    const subscription = panelService.subscribe(
      'event::panelService:activatePanel',
      (data: unknown) => {
        const activatePanelEvent = data as Types.ActivatePanelEvent;
        if (sidePanelExpanded || activatePanelEvent.forceActive) {
          const tabIndex = tabs.findIndex(
            (tab: any) => tab.id === activatePanelEvent.panelId
          );
          if (tabIndex !== -1) {
            if (!closedManually) {
              setSidePanelExpanded(true);
            }
            setActiveTabIndex(tabIndex);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [tabs, sidePanelExpanded, panelService, closedManually]);

  return (
    <SidePanel
      {...props}
      side={side}
      tabs={tabs}
      activeTabIndex={activeTabIndex}
      isExpanded={sidePanelExpanded}
      onOpen={handleOpen}
      onClose={handleClose}
      onActiveTabIndexChange={handleActiveTabIndexChange}
    />
  );
};

export default SidePanelWithServices;
