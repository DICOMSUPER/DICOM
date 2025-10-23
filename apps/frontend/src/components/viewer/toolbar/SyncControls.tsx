"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Link2, Link2Off } from "lucide-react";
import { viewportSyncService, type SyncMode } from "@/services/ViewportSyncService";

interface SyncControlsProps {
  syncGroupId?: string;
  defaultEnabled?: boolean;
}

export default function SyncControls({
  syncGroupId = "default",
  defaultEnabled = false,
}: SyncControlsProps) {
  const [syncEnabled, setSyncEnabled] = useState(defaultEnabled);
  const [syncModes, setSyncModes] = useState<SyncMode[]>(['all']);

  const handleToggleSync = () => {
    const newEnabled = !syncEnabled;
    setSyncEnabled(newEnabled);
    viewportSyncService.setSyncGroupEnabled(syncGroupId, newEnabled);
  };

  const handleToggleSyncMode = (mode: SyncMode) => {
    let newModes: SyncMode[];
    
    if (mode === 'all') {
      newModes = ['all'];
    } else if (mode === 'none') {
      newModes = [];
    } else {
      // Remove 'all' if it's there
      const modesWithoutAll = syncModes.filter(m => m !== 'all' && m !== 'none');
      
      if (modesWithoutAll.includes(mode)) {
        newModes = modesWithoutAll.filter(m => m !== mode);
      } else {
        newModes = [...modesWithoutAll, mode];
      }
    }

    setSyncModes(newModes);
    viewportSyncService.setSyncModes(syncGroupId, newModes);
  };

  const isModeActive = (mode: SyncMode) => {
    if (mode === 'all') {
      return syncModes.includes('all');
    }
    return syncModes.includes(mode) || syncModes.includes('all');
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={syncEnabled ? "default" : "ghost"}
        size="sm"
        onClick={handleToggleSync}
        className={`${
          syncEnabled 
            ? "bg-blue-600 hover:bg-blue-700 text-white" 
            : "text-white hover:bg-gray-700"
        }`}
      >
        {syncEnabled ? (
          <>
            <Link2 className="h-4 w-4 mr-2" />
            Synced
          </>
        ) : (
          <>
            <Link2Off className="h-4 w-4 mr-2" />
            Not Synced
          </>
        )}
      </Button>

      {syncEnabled && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
              Sync Options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700 w-48">
            <DropdownMenuLabel className="text-gray-300">
              Sync Modes
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            
            <DropdownMenuCheckboxItem
              checked={isModeActive('all')}
              onCheckedChange={() => handleToggleSyncMode('all')}
              className="text-white hover:bg-gray-700"
            >
              <span className="ml-2">All (Pan + Zoom + Scroll)</span>
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator className="bg-gray-700" />

            <DropdownMenuCheckboxItem
              checked={isModeActive('pan') && !syncModes.includes('all')}
              onCheckedChange={() => handleToggleSyncMode('pan')}
              className="text-white hover:bg-gray-700"
              disabled={syncModes.includes('all')}
            >
              <span className="ml-2">Pan</span>
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={isModeActive('zoom') && !syncModes.includes('all')}
              onCheckedChange={() => handleToggleSyncMode('zoom')}
              className="text-white hover:bg-gray-700"
              disabled={syncModes.includes('all')}
            >
              <span className="ml-2">Zoom</span>
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={isModeActive('scroll') && !syncModes.includes('all')}
              onCheckedChange={() => handleToggleSyncMode('scroll')}
              className="text-white hover:bg-gray-700"
              disabled={syncModes.includes('all')}
            >
              <span className="ml-2">Scroll</span>
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={isModeActive('windowLevel') && !syncModes.includes('all')}
              onCheckedChange={() => handleToggleSyncMode('windowLevel')}
              className="text-white hover:bg-gray-700"
              disabled={syncModes.includes('all')}
            >
              <span className="ml-2">Window/Level</span>
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

