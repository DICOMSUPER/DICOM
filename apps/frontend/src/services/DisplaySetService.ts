type DisplaySet = {
  displaySetInstanceUID: string;
  StudyInstanceUID: string;
  SeriesInstanceUID?: string;
  SeriesDescription?: string;
  SeriesNumber?: number;
  SeriesDate?: string;
  Modality?: string;
  numImageFrames?: number;
  thumbnailSrc?: string;
  unsupported?: boolean;
  [key: string]: any;
};

type Listener = (data: any) => void;

class DisplaySetService {
  public static readonly EVENTS = {
    DISPLAY_SETS_ADDED: 'event::displaySetsAdded',
    DISPLAY_SETS_CHANGED: 'event::displaySetsChanged',
    DISPLAY_SET_SERIES_METADATA_INVALIDATED: 'event::displaySetSeriesMetadataInvalidated',
  };

  private displaySets: Map<string, DisplaySet>;
  private listeners: Map<string, Set<Listener>>;

  constructor() {
    this.displaySets = new Map();
    this.listeners = new Map();
  }

  // Subscribe to events
  subscribe(event: string, callback: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return {
      unsubscribe: () => {
        this.listeners.get(event)?.delete(callback);
      },
    };
  }

  // Emit events
  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => {
      callback(data);
    });
  }

  // Get all active display sets
  get activeDisplaySets(): DisplaySet[] {
    return Array.from(this.displaySets.values());
  }

  // Add display sets
  addDisplaySets(newDisplaySets: DisplaySet[], options?: { madeInClient?: boolean }) {
    newDisplaySets.forEach(ds => {
      this.displaySets.set(ds.displaySetInstanceUID, ds);
    });

    this.emit(DisplaySetService.EVENTS.DISPLAY_SETS_ADDED, {
      displaySetsAdded: newDisplaySets,
      options,
    });

    this.emit(DisplaySetService.EVENTS.DISPLAY_SETS_CHANGED, this.activeDisplaySets);
  }

  // Get display set by UID
  getDisplaySetByUID(displaySetInstanceUID: string): DisplaySet | undefined {
    return this.displaySets.get(displaySetInstanceUID);
  }

  // Get active display sets
  getActiveDisplaySets(): DisplaySet[] {
    return this.activeDisplaySets;
  }

  // Update display set
  updateDisplaySet(displaySetInstanceUID: string, updates: Partial<DisplaySet>) {
    const displaySet = this.displaySets.get(displaySetInstanceUID);
    
    if (displaySet) {
      this.displaySets.set(displaySetInstanceUID, {
        ...displaySet,
        ...updates,
      });

      this.emit(DisplaySetService.EVENTS.DISPLAY_SETS_CHANGED, this.activeDisplaySets);
    }
  }

  // Remove display set
  removeDisplaySet(displaySetInstanceUID: string) {
    this.displaySets.delete(displaySetInstanceUID);
    this.emit(DisplaySetService.EVENTS.DISPLAY_SETS_CHANGED, this.activeDisplaySets);
  }

  // Clear all display sets
  clear() {
    this.displaySets.clear();
    this.emit(DisplaySetService.EVENTS.DISPLAY_SETS_CHANGED, this.activeDisplaySets);
  }
}

export default DisplaySetService;
