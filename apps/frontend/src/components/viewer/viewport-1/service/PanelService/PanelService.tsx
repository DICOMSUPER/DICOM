// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
import React from 'react';

export const EVENTS = {
  PANELS_CHANGED: 'event::panelService:panelsChanged',
  ACTIVATE_PANEL: 'event::panelService:activatePanel',
};

export type PanelData = {
  id: string;
  iconName?: string;
  iconLabel?: string;
  label?: string;
  name?: string;
  title?: string;
  component: React.ComponentType<any>;
};

export enum PanelPosition {
  Left = 'left',
  Right = 'right',
  Bottom = 'bottom',
}

type ActivatePanelTrigger = {
  sourcePubSubService: any;
  sourceEvents: string[];
};

type Subscription = {
  unsubscribe: () => void;
};

// Simple PubSub base class
class PubSubService {
  private listeners: Map<string, Set<Function>> = new Map();

  public subscribe(eventName: string, callback: Function): Subscription {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(callback);

    return {
      unsubscribe: () => {
        const callbacks = this.listeners.get(eventName);
        if (callbacks) {
          callbacks.delete(callback);
        }
      }
    };
  }

  protected _broadcastEvent(eventName: string, data: any): void {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }
}

export default class PanelService extends PubSubService {
  private _panelsGroups: Map<PanelPosition, PanelData[]> = new Map();
  private _panelRegistry: Map<string, PanelData> = new Map();

  constructor() {
    super();
  }

  /**
   * Register a panel component
   * Use this to register panels before adding them to positions
   */
  public registerPanel(panel: PanelData): void {
    this._panelRegistry.set(panel.id, panel);
  }

  /**
   * Register multiple panels at once
   */
  public registerPanels(panels: PanelData[]): void {
    panels.forEach(panel => this.registerPanel(panel));
  }

  public get PanelPosition(): typeof PanelPosition {
    return PanelPosition;
  }

  /**
   * Get panel by ID from registry
   */
  private _getPanelFromRegistry(panelId: string): PanelData {
    const panel = this._panelRegistry.get(panelId);
    
    if (!panel) {
      const availablePanels = Array.from(this._panelRegistry.keys());
      throw new Error(
        `Panel "${panelId}" not found. Available panels: ${availablePanels.join(', ')}`
      );
    }

    return panel;
  }

  /**
   * Get panel data - supports single panel ID or array of IDs
   */
  public getPanelData(panelId: string | string[]): PanelData {
    if (Array.isArray(panelId)) {
      // Combine multiple panels into one component
      const panels = panelId.map(id => this._getPanelFromRegistry(id));
      const firstPanel = panels[0];

      // Create combined component
      const CombinedComponent: React.FC<any> = (props) => (
        <>
          {panels.map((panel, index) => {
            const PanelComponent = panel.component;
            return <PanelComponent key={index} {...props} />;
          })}
        </>
      );

      return {
        ...firstPanel,
        id: panelId.join('-'),
        component: CombinedComponent,
      };
    } else {
      return this._getPanelFromRegistry(panelId);
    }
  }

  public addPanel(position: PanelPosition, panelId: string, options?: any): void {
    let panels = this._panelsGroups.get(position);

    if (!panels) {
      panels = [];
      this._panelsGroups.set(position, panels);
    }

    const panelComponent = this.getPanelData(panelId);

    panels.push(panelComponent);
    this._broadcastEvent(EVENTS.PANELS_CHANGED, { position, options });
  }

  public addPanels(position: PanelPosition, panelsIds: string[], options?: any): void {
    if (!Array.isArray(panelsIds)) {
      throw new Error('Invalid "panelsIds" array');
    }

    panelsIds.forEach(panelId => this.addPanel(position, panelId, options));
  }

  public setPanels(panels: { [key in PanelPosition]?: string[] }, options?: any): void {
    this.reset();

    Object.entries(panels).forEach(([position, panelIds]) => {
      if (panelIds) {
        this.addPanels(position as PanelPosition, panelIds, options);
      }
    });
  }

  public getPanels(position: PanelPosition): PanelData[] {
    const panels = this._panelsGroups.get(position) ?? [];

    // Return a new array to preserve the internal state
    return [...panels];
  }

  public reset(): void {
    const affectedPositions = Array.from(this._panelsGroups.keys());

    this._panelsGroups.clear();

    affectedPositions.forEach(position =>
      this._broadcastEvent(EVENTS.PANELS_CHANGED, { position })
    );
  }

  public onModeExit(): void {
    this.reset();
  }

  /**5
   * Activates the panel with the given id. If the forceActive flag is false
   * then it is up to the component containing the panel whether to activate
   * it immediately or not. For instance, the panel might not be activated when
   * the forceActive flag is false in the case where the user might have
   * activated/displayed and then closed the panel already.
   * Note that this method simply fires a broadcast event: ActivatePanelEvent.
   * @param panelId the panel's id
   * @param forceActive optional flag indicating if the panel should be forced to be activated or not
   */
  public activatePanel(panelId: string, forceActive = false): void {
    this._broadcastEvent(EVENTS.ACTIVATE_PANEL, { panelId, forceActive });
  }

  /**
   * Adds a mapping of events (activatePanelTriggers.sourceEvents) broadcast by
   * activatePanelTrigger.sourcePubSubService that
   * when fired/broadcasted must in turn activate the panel with the given id.
   * The subscriptions created are returned such that they can be managed and unsubscribed
   * as appropriate.
   * @param panelId the id of the panel to activate
   * @param activatePanelTriggers an array of triggers
   * @param forceActive optional flag indicating if the panel should be forced to be activated or not
   * @returns an array of the subscriptions subscribed to
   */
  public addActivatePanelTriggers(
    panelId: string,
    activatePanelTriggers: ActivatePanelTrigger[],
    forceActive = false
  ): Subscription[] {
    return activatePanelTriggers
      .map(trigger =>
        trigger.sourceEvents.map((eventName: string) =>
          trigger.sourcePubSubService.subscribe(eventName, () =>
            this.activatePanel(panelId, forceActive)
          )
        )
      )
      .flat();
  }
}
