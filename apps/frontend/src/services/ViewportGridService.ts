type Viewport = {
  viewportId: string;
  displaySetInstanceUIDs: string[];
  isReady: boolean;
  viewportOptions: Record<string, any>;
  displaySetOptions: Array<Record<string, any>>;
  x: number;
  y: number;
  width: number;
  height: number;
};

type ViewportGridState = {
  activeViewportId: string | null;
  layout: {
    numRows: number;
    numCols: number;
    layoutType: string;
  };
  viewports: Map<string, Viewport>;
};

type Listener = (data: any) => void;

class ViewportGridService {
  public static readonly EVENTS = {
    ACTIVE_VIEWPORT_ID_CHANGED: 'event::activeviewportidchanged',
    LAYOUT_CHANGED: 'event::layoutChanged',
    GRID_STATE_CHANGED: 'event::gridStateChanged',
    VIEWPORTS_READY: 'event::viewportsReady',
  };

  private state: ViewportGridState;
  private listeners: Map<string, Set<Listener>>;

  constructor() {
    this.state = {
      activeViewportId: null,
      layout: {
        numRows: 1,
        numCols: 1,
        layoutType: 'grid',
      },
      viewports: new Map(),
    };
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

  // Get state
  getState(): ViewportGridState {
    return this.state;
  }

  // Set active viewport
  setActiveViewportId(viewportId: string) {
    if (this.state.activeViewportId === viewportId) {
      return;
    }

    this.state.activeViewportId = viewportId;
    
    setTimeout(() => {
      this.emit(ViewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED, {
        viewportId,
      });
    }, 0);
  }

  // Get active viewport ID
  getActiveViewportId(): string | null {
    return this.state.activeViewportId;
  }

  // Set display sets for viewports
  setDisplaySetsForViewports(viewportsToUpdate: Array<{
    viewportId: string;
    displaySetInstanceUIDs: string[];
    viewportOptions?: Record<string, any>;
    displaySetOptions?: Array<Record<string, any>>;
  }>) {
    viewportsToUpdate.forEach(({ viewportId, displaySetInstanceUIDs, viewportOptions, displaySetOptions }) => {
      const viewport = this.state.viewports.get(viewportId);
      
      if (viewport) {
        this.state.viewports.set(viewportId, {
          ...viewport,
          displaySetInstanceUIDs,
          viewportOptions: { ...viewport.viewportOptions, ...viewportOptions },
          displaySetOptions: displaySetOptions || viewport.displaySetOptions,
        });
      }
    });

    setTimeout(() => {
      this.emit(ViewportGridService.EVENTS.GRID_STATE_CHANGED, {
        state: this.state,
      });
    }, 0);
  }

  // Set layout
  setLayout({
    numCols,
    numRows,
    layoutType = 'grid',
  }: {
    numCols: number;
    numRows: number;
    layoutType?: string;
  }) {
    this.state.layout = {
      numCols,
      numRows,
      layoutType,
    };

    // Create viewports based on layout
    const newViewports = new Map<string, Viewport>();
    
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const viewportId = `viewport-${col}-${row}`;
        const width = 1 / numCols;
        const height = 1 / numRows;
        
        newViewports.set(viewportId, {
          viewportId,
          displaySetInstanceUIDs: [],
          isReady: false,
          viewportOptions: {},
          displaySetOptions: [{}],
          x: col * width,
          y: row * height,
          width,
          height,
        });
      }
    }

    this.state.viewports = newViewports;

    // Set first viewport as active
    if (!this.state.activeViewportId && newViewports.size > 0) {
      this.state.activeViewportId = newViewports.keys().next().value as string;
    }

    setTimeout(() => {
      this.emit(ViewportGridService.EVENTS.LAYOUT_CHANGED, {
        numCols,
        numRows,
      });
      this.emit(ViewportGridService.EVENTS.GRID_STATE_CHANGED, {
        state: this.state,
      });
    }, 0);
  }

  // Reset
  reset() {
    this.state = {
      activeViewportId: null,
      layout: {
        numRows: 1,
        numCols: 1,
        layoutType: 'grid',
      },
      viewports: new Map(),
    };
  }

  // Get display set UIDs for viewport
  getDisplaySetsUIDsForViewport(viewportId: string): string[] {
    return this.state.viewports.get(viewportId)?.displaySetInstanceUIDs || [];
  }

  // Get viewport state
  getViewportState(viewportId: string): Viewport | undefined {
    return this.state.viewports.get(viewportId);
  }

  // Publish viewports ready
  publishViewportsReady() {
    this.emit(ViewportGridService.EVENTS.VIEWPORTS_READY, {});
  }
}

export default ViewportGridService;
