/**
 * Viewport Synchronization Service
 * 
 * Synchronizes camera, zoom, pan, and scroll across multiple viewports
 * Inspired by OHIF Viewer's synchronization system
 */

import { Types } from '@cornerstonejs/core';

export type SyncMode = 'pan' | 'zoom' | 'scroll' | 'windowLevel' | 'all' | 'none';

export interface SyncGroup {
  id: string;
  viewportIds: Set<string>;
  syncModes: Set<SyncMode>;
  enabled: boolean;
}

class ViewportSyncService {
  private syncGroups: Map<string, SyncGroup> = new Map();
  private viewportToGroupMap: Map<string, string> = new Map();
  private isUpdating = false; // Prevent circular updates

  /**
   * Create a new synchronization group
   */
  createSyncGroup(
    groupId: string,
    viewportIds: string[],
    syncModes: SyncMode[] = ['all']
  ): SyncGroup {
    const group: SyncGroup = {
      id: groupId,
      viewportIds: new Set(viewportIds),
      syncModes: new Set(syncModes),
      enabled: true,
    };

    this.syncGroups.set(groupId, group);

    // Map viewports to group
    viewportIds.forEach(vpId => {
      this.viewportToGroupMap.set(vpId, groupId);
    });

    console.log(`✅ Created sync group "${groupId}" with ${viewportIds.length} viewports`);
    return group;
  }

  /**
   * Add viewport to sync group
   */
  addViewportToGroup(groupId: string, viewportId: string) {
    const group = this.syncGroups.get(groupId);
    if (!group) {
      console.warn(`Sync group "${groupId}" not found`);
      return;
    }

    group.viewportIds.add(viewportId);
    this.viewportToGroupMap.set(viewportId, groupId);
  }

  /**
   * Remove viewport from sync group
   */
  removeViewportFromGroup(groupId: string, viewportId: string) {
    const group = this.syncGroups.get(groupId);
    if (!group) return;

    group.viewportIds.delete(viewportId);
    this.viewportToGroupMap.delete(viewportId);
  }

  /**
   * Enable/disable sync group
   */
  setSyncGroupEnabled(groupId: string, enabled: boolean) {
    const group = this.syncGroups.get(groupId);
    if (group) {
      group.enabled = enabled;
      console.log(`🔄 Sync group "${groupId}" ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Update sync modes for a group
   */
  setSyncModes(groupId: string, syncModes: SyncMode[]) {
    const group = this.syncGroups.get(groupId);
    if (group) {
      group.syncModes = new Set(syncModes);
    }
  }

  /**
   * Synchronize camera position (pan/zoom)
   */
  syncCamera(
    sourceViewport: Types.IStackViewport,
    sourceViewportId: string
  ) {
    if (this.isUpdating) return;

    const groupId = this.viewportToGroupMap.get(sourceViewportId);
    if (!groupId) return;

    const group = this.syncGroups.get(groupId);
    if (!group || !group.enabled) return;

    const shouldSyncPan = group.syncModes.has('pan') || group.syncModes.has('all');
    const shouldSyncZoom = group.syncModes.has('zoom') || group.syncModes.has('all');

    if (!shouldSyncPan && !shouldSyncZoom) return;

    this.isUpdating = true;

    try {
      const sourceCamera = sourceViewport.getCamera();

      group.viewportIds.forEach(targetViewportId => {
        if (targetViewportId === sourceViewportId) return;

        const targetViewport = this.getViewport(targetViewportId);
        if (!targetViewport) return;

        const targetCamera = targetViewport.getCamera();
        const newCamera: any = { ...targetCamera };

        if (shouldSyncZoom && sourceCamera.parallelScale) {
          newCamera.parallelScale = sourceCamera.parallelScale;
        }

        if (shouldSyncPan && sourceCamera.focalPoint) {
          newCamera.focalPoint = [...sourceCamera.focalPoint];
          newCamera.position = [...sourceCamera.position];
        }

        targetViewport.setCamera(newCamera);
        targetViewport.render();
      });
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Synchronize scroll position (image index in stack)
   */
  syncScroll(
    sourceViewport: Types.IStackViewport,
    sourceViewportId: string,
    imageIndex: number
  ) {
    if (this.isUpdating) return;

    const groupId = this.viewportToGroupMap.get(sourceViewportId);
    if (!groupId) return;

    const group = this.syncGroups.get(groupId);
    if (!group || !group.enabled) return;

    const shouldSync = group.syncModes.has('scroll') || group.syncModes.has('all');
    if (!shouldSync) return;

    this.isUpdating = true;

    try {
      group.viewportIds.forEach(targetViewportId => {
        if (targetViewportId === sourceViewportId) return;

        const targetViewport = this.getViewport(targetViewportId);
        if (!targetViewport) return;

        const targetImageIds = targetViewport.getImageIds();
        if (targetImageIds.length === 0) return;

        // Calculate proportional index
        const sourceImageIds = sourceViewport.getImageIds();
        const proportionalIndex = Math.round(
          (imageIndex / sourceImageIds.length) * targetImageIds.length
        );

        const targetIndex = Math.min(
          Math.max(0, proportionalIndex),
          targetImageIds.length - 1
        );

        targetViewport.setImageIdIndex(targetIndex);
        targetViewport.render();
      });
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Synchronize window level (brightness/contrast)
   */
  syncWindowLevel(
    sourceViewport: Types.IStackViewport,
    sourceViewportId: string
  ) {
    if (this.isUpdating) return;

    const groupId = this.viewportToGroupMap.get(sourceViewportId);
    if (!groupId) return;

    const group = this.syncGroups.get(groupId);
    if (!group || !group.enabled) return;

    const shouldSync = group.syncModes.has('windowLevel') || group.syncModes.has('all');
    if (!shouldSync) return;

    this.isUpdating = true;

    try {
      const properties = sourceViewport.getProperties();
      const { voiRange } = properties;

      if (!voiRange) return;

      group.viewportIds.forEach(targetViewportId => {
        if (targetViewportId === sourceViewportId) return;

        const targetViewport = this.getViewport(targetViewportId);
        if (!targetViewport) return;

        targetViewport.setProperties({ voiRange });
        targetViewport.render();
      });
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Get viewport by ID (helper method)
   */
  private getViewport(viewportId: string): Types.IStackViewport | null {
    try {
      const { getRenderingEngine } = require('@cornerstonejs/core');
      const renderingEngine = getRenderingEngine('myRenderingEngine');
      if (!renderingEngine) return null;
      
      return renderingEngine.getViewport(viewportId) as Types.IStackViewport;
    } catch {
      return null;
    }
  }

  /**
   * Get sync group for viewport
   */
  getSyncGroupForViewport(viewportId: string): SyncGroup | null {
    const groupId = this.viewportToGroupMap.get(viewportId);
    if (!groupId) return null;
    return this.syncGroups.get(groupId) || null;
  }

  /**
   * Destroy sync group
   */
  destroySyncGroup(groupId: string) {
    const group = this.syncGroups.get(groupId);
    if (!group) return;

    group.viewportIds.forEach(vpId => {
      this.viewportToGroupMap.delete(vpId);
    });

    this.syncGroups.delete(groupId);
    console.log(`🗑️ Destroyed sync group "${groupId}"`);
  }

  /**
   * Clear all sync groups
   */
  clearAll() {
    this.syncGroups.clear();
    this.viewportToGroupMap.clear();
    console.log('🗑️ Cleared all sync groups');
  }

  /**
   * Get all sync groups
   */
  getAllGroups(): SyncGroup[] {
    return Array.from(this.syncGroups.values());
  }
}

// Singleton instance
export const viewportSyncService = new ViewportSyncService();

