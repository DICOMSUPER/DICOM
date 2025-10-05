/**
 * Panel Service - Manages side panels in viewer
 * Simplified version for single project (no OHIF dependencies)
 */

import { PubSubService } from '@/components/viewer/viewport-1/service/_shared/pubSubServiceInterface';

export type PanelPosition = 'left' | 'right';

export interface PanelData {
  id: string;
  component: React.ComponentType<any>;
  title?: string;
  iconName?: string;
  label?: string;
}

export interface PanelGroup {
  position: PanelPosition;
  panels: PanelData[];
}

class PanelService extends PubSubService {
  private panels: Map<PanelPosition, PanelData[]> = new Map();

  public static readonly EVENTS = {
    PANELS_CHANGED: 'event::panelsChanged',
    ACTIVATE_PANEL: 'event::activatePanel',
  };

  constructor() {
    super(PanelService.EVENTS);
    this.panels.set('left', []);
    this.panels.set('right', []);
  }

  /**
   * Add panel to position
   */
  public addPanel(position: PanelPosition, panel: PanelData): void {
    const panels = this.panels.get(position) || [];
    panels.push(panel);
    this.panels.set(position, panels);
    
    this._broadcastEvent(PanelService.EVENTS.PANELS_CHANGED, {
      position,
      panels,
    });
  }

  /**
   * Remove panel by id
   */
  public removePanel(position: PanelPosition, panelId: string): void {
    const panels = this.panels.get(position) || [];
    const filtered = panels.filter(p => p.id !== panelId);
    this.panels.set(position, filtered);
    
    this._broadcastEvent(PanelService.EVENTS.PANELS_CHANGED, {
      position,
      panels: filtered,
    });
  }

  /**
   * Get all panels for position
   */
  public getPanels(position: PanelPosition): PanelData[] {
    return this.panels.get(position) || [];
  }

  /**
   * Check if position has panels
   */
  public hasPanels(position: PanelPosition): boolean {
    const panels = this.panels.get(position) || [];
    return panels.length > 0;
  }

  /**
   * Clear all panels for position
   */
  public clearPanels(position: PanelPosition): void {
    this.panels.set(position, []);
    
    this._broadcastEvent(PanelService.EVENTS.PANELS_CHANGED, {
      position,
      panels: [],
    });
  }

  /**
   * Set all panels for position (replace existing)
   */
  public setPanels(position: PanelPosition, panels: PanelData[]): void {
    this.panels.set(position, panels);
    
    this._broadcastEvent(PanelService.EVENTS.PANELS_CHANGED, {
      position,
      panels,
    });
  }
}

export default PanelService;
