'use client'; // Thêm directive này cho Next.js App Router

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
  Dispatch,
} from 'react';
import merge from 'lodash.merge';
import ViewportGridService from '@/components/viewer/viewport-1/service/ViewportGridService';
import uuidv4 from '@/common/utils/uuidv4';

// Import types - bạn cần tạo file types riêng



// Action types
type ViewportGridAction =
  | { type: 'SET_ACTIVE_VIEWPORT_ID'; payload: string }
  | { type: 'SET_DISPLAYSETS_FOR_VIEWPORTS'; payload: any[] }
  | {
      type: 'SET_LAYOUT';
      payload: {
        numCols: number;
        numRows: number;
        layoutOptions?: any[];
        layoutType?: string;
        activeViewportId?: string;
        findOrCreateViewport: (position: number, positionId: string, options: any) => any;
        isHangingProtocolLayout?: boolean;
      };
    }
  | { type: 'RESET'; payload: {} }
  | { type: 'SET'; payload: Partial<AppTypes.ViewportGrid.State> }
  | { type: 'VIEWPORT_IS_READY'; payload: { viewportId: string; isReady: boolean } };

const DEFAULT_STATE: AppTypes.ViewportGrid.State = {
  activeViewportId: null,
  layout: {
    numRows: 0,
    numCols: 0,
    layoutType: 'grid',
  },
  isHangingProtocolLayout: false,
  viewports: new Map(
    Object.entries({
      default: {
        viewportId: 'default',
        displaySetInstanceUIDs: [],
        isReady: false,
        viewportOptions: {
          viewportId: 'default',
        },
        displaySetSelectors: [],
        displaySetOptions: [{}],
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        viewportLabel: null,
      },
    })
  ),
};

const determineActiveViewportId = (
  state: AppTypes.ViewportGrid.State,
  newViewports: Map<string, AppTypes.ViewportGrid.Viewport>
): string | null => {
  const { activeViewportId } = state;
  const currentActiveViewport = state.viewports.get(activeViewportId || '');

  if (!currentActiveViewport) {
    const firstViewport = newViewports.values().next().value;
    return firstViewport?.viewportOptions?.viewportId || null;
  }

  const currentActiveDisplaySetInstanceUIDs = currentActiveViewport.displaySetInstanceUIDs;
  const currentOrientation = currentActiveViewport.viewportOptions.orientation;

  const filteredNewViewports = Array.from(newViewports.values()).filter(
    viewport => viewport.displaySetInstanceUIDs?.length > 0
  );

  const sortedViewports = filteredNewViewports.sort((a, b) => {
    const aOrientationMatch = a.viewportOptions.orientation === currentOrientation;
    const bOrientationMatch = b.viewportOptions.orientation === currentOrientation;
    if (aOrientationMatch !== bOrientationMatch) {
      return (bOrientationMatch ? 1 : 0) - (aOrientationMatch ? 1 : 0);
    }

    const aMatch = a.displaySetInstanceUIDs.some(uid =>
      currentActiveDisplaySetInstanceUIDs.includes(uid)
    );
    const bMatch = b.displaySetInstanceUIDs.some(uid =>
      currentActiveDisplaySetInstanceUIDs.includes(uid)
    );
    if (aMatch !== bMatch) {
      return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
    }

    return 0;
  });

  if (!sortedViewports?.length) {
    return null;
  }

  return sortedViewports[0].viewportId;
};

// API interface
interface ViewportGridApi {
  getState: () => AppTypes.ViewportGrid.State;
  setActiveViewportId: (index: string) => void;
  setDisplaySetsForViewport: (props: any) => void;
  setDisplaySetsForViewports: (props: any[]) => void;
  setLayout: (layout: any) => void;
  reset: () => void;
  // set: (gridLayoutState: Partial<AppTypes.ViewportGrid.State>) => void;
  getNumViewportPanes: () => number;
  setViewportIsReady: (viewportId: string, isReady: boolean) => void;
  getGridViewportsReady: () => boolean;
  getActiveViewportOptionByKey: (key: string) => any;
  setViewportGridSizeChanged: (props: any) => void;
  publishViewportsReady: () => void;
  getDisplaySetsUIDsForViewport: (viewportId: string) => string[];
  getViewportState: (viewportId: string) => AppTypes.ViewportGrid.Viewport | undefined;
  getLayoutOptionsFromState: (state: any) => any;
  // isReferenceViewable: (viewportId: string, viewRef: any, options?: any) => boolean;
}

// Context
export const ViewportGridContext = createContext<
  [AppTypes.ViewportGrid.State, ViewportGridApi] | undefined
>(undefined);

// Provider props
interface ViewportGridProviderProps {
  children: ReactNode;
  service: ViewportGridService;
}

export function ViewportGridProvider({ children, service }: ViewportGridProviderProps) {
  const viewportGridReducer = (
    state: AppTypes.ViewportGrid.State,
    action: ViewportGridAction
  ): AppTypes.ViewportGrid.State => {
    switch (action.type) {
      case 'SET_ACTIVE_VIEWPORT_ID': {
        return { ...state, activeViewportId: action.payload };
      }

      case 'SET_DISPLAYSETS_FOR_VIEWPORTS': {
        const { payload } = action;
        const viewports = new Map(state.viewports);

        payload.forEach(updatedViewport => {
          const { viewportId, displaySetInstanceUIDs } = updatedViewport;

          if (!viewportId) {
            throw new Error('ViewportId is required to set display sets for viewport');
          }

          const previousViewport = viewports.get(viewportId);

          if (previousViewport?.viewportOptions?.initialImageOptions) {
            const { useOnce } = previousViewport.viewportOptions.initialImageOptions as { useOnce?: boolean };
            if (useOnce) {
              previousViewport.viewportOptions.initialImageOptions = null;
            }
          }

          let viewportOptions = merge(
            {},
            previousViewport?.viewportOptions,
            updatedViewport?.viewportOptions
          );

          const displaySetOptions = updatedViewport?.displaySetOptions || [];
          if (!displaySetOptions.length) {
            if (state.isHangingProtocolLayout) {
              displaySetOptions.push(...(previousViewport?.displaySetOptions || []));
            }
            if (!displaySetOptions.length) {
              displaySetOptions.push({});
            }
          }

          if (!updatedViewport.viewportOptions && !state.isHangingProtocolLayout) {
            viewportOptions = {
              viewportId: viewportOptions.viewportId,
            };
          }

          const newViewport = {
            ...previousViewport,
            displaySetInstanceUIDs,
            viewportOptions,
            displaySetOptions,
          };

          viewportOptions.presentationIds = service.getPresentationIds({
            viewport: newViewport,
            viewports,
          });

          viewports.set(viewportId, {
            ...viewports.get(viewportId)!,
            ...newViewport,
          });
        });

        return { ...state, viewports };
      }

      case 'SET_LAYOUT': {
        const {
          numCols,
          numRows,
          layoutOptions,
          layoutType = 'grid',
          activeViewportId,
          findOrCreateViewport,
          isHangingProtocolLayout,
        } = action.payload;

        const hasOptions = layoutOptions?.length;
        const viewports = new Map<string, AppTypes.ViewportGrid.Viewport>();
        const options = {};

        let activeViewportIdToSet = activeViewportId;
        for (let row = 0; row < numRows; row++) {
          for (let col = 0; col < numCols; col++) {
            const position = col + row * numCols;
            const layoutOption = layoutOptions?.[position];

            let xPos: number, yPos: number, w: number, h: number;
            if (layoutOptions && layoutOptions[position]) {
              ({ x: xPos, y: yPos, width: w, height: h } = layoutOptions[position]);
            } else {
              w = 1 / numCols;
              h = 1 / numRows;
              xPos = col * w;
              yPos = row * h;
            }

            const colIndex = Math.round(xPos * numCols);
            const rowIndex = Math.round(yPos * numRows);

            const positionId = layoutOption?.positionId || `${colIndex}-${rowIndex}`;

            if (hasOptions && position >= layoutOptions.length) {
              continue;
            }

            const viewport = findOrCreateViewport(position, positionId, options);

            if (!viewport) {
              continue;
            }

            viewport.positionId = positionId;

            if (!viewport.viewportOptions?.viewportId) {
              const randomUID = uuidv4().substring(0, 8);
              viewport.viewportOptions = viewport.viewportOptions || {};
              viewport.viewportOptions.viewportId = `viewport-${randomUID}`;
            }

            viewport.viewportId = viewport.viewportOptions.viewportId;

            viewports.set(viewport.viewportId, viewport);

            Object.assign(viewport, {
              width: w,
              height: h,
              x: xPos,
              y: yPos,
            });

            viewport.isReady = false;

            if (!viewport.viewportOptions.presentationIds) {
              const presentationIds = service.getPresentationIds({
                viewport,
                viewports,
              });
              viewport.viewportOptions.presentationIds = presentationIds;
            }
          }
        }

        activeViewportIdToSet =
          activeViewportIdToSet ?? determineActiveViewportId(state, viewports) ?? undefined;

        return {
          ...state,
          activeViewportId: activeViewportIdToSet ?? null,
          layout: {
            ...state.layout,
            numCols,
            numRows,
            layoutType,
          },
          viewports,
          isHangingProtocolLayout: isHangingProtocolLayout || false,
        };
      }

      case 'RESET': {
        return DEFAULT_STATE;
      }

      case 'SET': {
        return {
          ...state,
          ...action.payload,
        };
      }

      case 'VIEWPORT_IS_READY': {
        const { viewportId, isReady } = action.payload;
        const viewports = new Map(state.viewports);
        const viewport = viewports.get(viewportId);
        if (!viewport) {
          return state;
        }

        viewports.set(viewportId, {
          ...viewport,
          isReady,
        });

        return {
          ...state,
          viewports,
        };
      }

      default:
        return state;
    }
  };

  const [viewportGridState, dispatch] = useReducer(viewportGridReducer, DEFAULT_STATE);

  const getState = useCallback(() => {
    return viewportGridState;
  }, [viewportGridState]);

  const getActiveViewportOptionByKey = useCallback(
    (key: string) => {
      const { viewports, activeViewportId } = viewportGridState;
      return activeViewportId ? (viewports.get(activeViewportId)?.viewportOptions as any)?.[key] : undefined;
    },
    [viewportGridState]
  );

  const setActiveViewportId = useCallback(
    (index: string) => dispatch({ type: 'SET_ACTIVE_VIEWPORT_ID', payload: index }),
    []
  );

  const setDisplaySetsForViewports = useCallback(
    (viewports: any[]) =>
      dispatch({
        type: 'SET_DISPLAYSETS_FOR_VIEWPORTS',
        payload: viewports,
      }),
    []
  );

  const setViewportIsReady = useCallback((viewportId: string, isReady: boolean) => {
    dispatch({
      type: 'VIEWPORT_IS_READY',
      payload: {
        viewportId,
        isReady,
      },
    });
  }, []);

  const getGridViewportsReady = useCallback(() => {
    const { viewports } = viewportGridState;
    const readyViewports = Array.from(viewports.values()).filter(viewport => viewport.isReady);
    return readyViewports.length === viewports.size;
  }, [viewportGridState]);

  const setLayout = useCallback(
    (payload: any) =>
      dispatch({
        type: 'SET_LAYOUT',
        payload,
      }),
    []
  );

  const reset = useCallback(
    () =>
      dispatch({
        type: 'RESET',
        payload: {},
      }),
    []
  );

  const set = useCallback(
    (payload: Partial<AppTypes.ViewportGrid.State>) =>
      dispatch({
        type: 'SET',
        payload,
      }),
    []
  );

  const getViewportState = useCallback(
    (viewportId: string) => {
      const { viewports } = viewportGridState;
      return viewports.get(viewportId);
    },
    [viewportGridState]
  );

  const getNumViewportPanes = useCallback(() => {
    const { layout, viewports } = viewportGridState;
    const { numRows, numCols } = layout;
    return Math.min(viewports.size, numCols * numRows);
  }, [viewportGridState]);

  useEffect(() => {
    if (service) {
      service.setServiceImplementation({
        getState,
        setActiveViewportId,
        setDisplaySetsForViewports,
        setLayout,
        reset,
        onModeExit: reset,
        set,
        getNumViewportPanes,
        setViewportIsReady,
        getViewportState,
        // getGridViewportsReady,
      });
    }
  }, [
    getState,
    service,
    setActiveViewportId,
    setDisplaySetsForViewports,
    setLayout,
    reset,
    set,
    getNumViewportPanes,
    setViewportIsReady,
    getGridViewportsReady,
    getViewportState,
  ]);

  const api: ViewportGridApi = {
    getState,
    setActiveViewportId: (index: string) => service.setActiveViewportId(index),
    setDisplaySetsForViewport: (props: any) => service.setDisplaySetsForViewports([props]),
    setDisplaySetsForViewports: (props: any[]) => service.setDisplaySetsForViewports(props),
    // isReferenceViewable: (viewportId: string, viewRef: any, options?: any) =>
    //   service.isReferenceViewable ? service.isReferenceViewable(viewportId, viewRef, options) : false,
    setLayout: (layout: any) => service.setLayout(layout),
    getViewportState: (viewportId: string) => service.getViewportState(viewportId),
    reset: () => service.reset(),
    // set: (gridLayoutState: Partial<AppTypes.ViewportGrid.State>) =>
    //   service.setState(gridLayoutState),
    getNumViewportPanes,
    setViewportIsReady,
    getGridViewportsReady,
    getActiveViewportOptionByKey,
    setViewportGridSizeChanged: (props: any) => service.setViewportGridSizeChanged(),
    publishViewportsReady: () => service.publishViewportsReady(),
    getLayoutOptionsFromState: (state: any) => service.getLayoutOptionsFromState(state),
    getDisplaySetsUIDsForViewport: (viewportId: string) =>
      service.getDisplaySetsUIDsForViewport(viewportId) ?? [],
  };

  return (
    <ViewportGridContext.Provider value={[viewportGridState, api]}>
      {children}
    </ViewportGridContext.Provider>
  );
}

// Hook với error handling
export const useViewportGrid = (): [AppTypes.ViewportGrid.State, ViewportGridApi] => {
  const context = useContext(ViewportGridContext);
  if (!context) {
    throw new Error('useViewportGrid must be used within a ViewportGridProvider');
  }
  return context;
};