import React from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui-next/ToggleGroup";
import { actionIcon, viewPreset } from "./types";
import { getLucideIcon } from "@/utils/get-lucide-icon";
import { Button } from "@/components/ui/button";

function PanelStudyBrowserHeader({
  viewPresets,
  updateViewPresetValue,
  actionIcons,
  updateActionIconValue,
}: {
  viewPresets: viewPreset[];
  updateViewPresetValue: (viewPreset: viewPreset) => void;
  actionIcons: actionIcon[];
  updateActionIconValue: (actionIcon: actionIcon) => void;
}) {
  return (
    <>
      <div className="bg-muted flex h-[40px] select-none rounded-t p-2">
        <div
          className={
            "flex h-[24px] w-full select-none justify-center self-center text-[14px]"
          }
        >
          <div className="flex w-full items-center gap-[10px]">
            <div className="flex items-center justify-center">
              <div className="text-primary flex items-center space-x-1">
                {actionIcons.map((icon: actionIcon, index) => {
                  const Icon = getLucideIcon(icon.iconName);
                  return (
                    <Button
                      key={icon.id}
                      aria-pressed={icon.value}
                      onClick={() =>
                        updateActionIconValue({ ...icon, value: !icon.value })
                      }
                      className="p-1"
                      title={icon.id}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="ml-auto flex h-full items-center justify-center">
              <ToggleGroup
                type="single"
                value={viewPresets.filter((preset) => preset.selected)[0].id}
                onValueChange={(value) => {
                  const selectedViewPreset = viewPresets.find(
                    (preset) => preset.id === value
                  );
                  updateViewPresetValue(selectedViewPreset as viewPreset);
                }}
              >
                {viewPresets.map((viewPreset: viewPreset) => {
                  const Icon = getLucideIcon(viewPreset.iconName);
                  return (
                    <ToggleGroupItem
                      key={viewPreset.id}
                      aria-label={viewPreset.id}
                      value={viewPreset.id}
                      className="text-actions-primary"
                    >
                      <Icon className="h-4 w-4" />
                    </ToggleGroupItem>
                  );
                })}
              </ToggleGroup>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { PanelStudyBrowserHeader };
