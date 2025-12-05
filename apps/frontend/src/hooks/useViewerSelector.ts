/**
 * useViewerSelector Hook - OHIF Pattern
 * Prevents unnecessary re-renders by selecting only needed state slices
 */

import { useContext, useMemo } from 'react';
import { useViewer } from '@/contexts/ViewerContext';

/**
 * Selector function type
 */
type Selector<T> = (state: any) => T;

/**
 * Equality function type
 */
type EqualityFn<T> = (prev: T, next: T) => boolean;

/**
 * Default shallow equality check
 */
function shallowEqual<T>(prev: T, next: T): boolean {
  if (Object.is(prev, next)) {
    return true;
  }

  if (typeof prev !== 'object' || prev === null || typeof next !== 'object' || next === null) {
    return false;
  }

  const keysA = Object.keys(prev);
  const keysB = Object.keys(next);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(next, key) ||
      !Object.is((prev as any)[key], (next as any)[key])
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Select specific data from ViewerContext without causing re-renders
 * when unrelated state changes
 * 
 * @example
 * // Instead of using entire context:
 * const { state, activeViewport, ... } = useViewer();
 * 
 * // Select only what you need:
 * const activeViewport = useViewerSelector(ctx => ctx.state.activeViewport);
 * const showAnnotations = useViewerSelector(ctx => ctx.state.showAnnotations);
 */
export function useViewerSelector<T>(
  selector: Selector<T>,
  equalityFn: EqualityFn<T> = shallowEqual
): T {
  const context = useViewer();

  return useMemo(() => selector(context), [context, selector, equalityFn]);
}

/**
 * Create a memoized selector
 * Useful for expensive computations
 * 
 * @example
 * const selectVisibleAnnotations = createMemoizedSelector(
 *   (ctx) => ctx.state.annotations,
 *   (ctx) => ctx.state.showAnnotations,
 *   (annotations, showAnnotations) => {
 *     if (!showAnnotations) return [];
 *     return annotations.filter(ann => ann.visible);
 *   }
 * );
 */
export function createMemoizedSelector<T, A extends any[]>(
  ...args: [...{ [K in keyof A]: Selector<A[K]> }, (...args: A) => T]
): Selector<T> {
  const selectors = args.slice(0, -1) as Selector<any>[];
  const combiner = args[args.length - 1] as (...args: any[]) => T;

  return (state: any) => {
    const selectedValues = selectors.map((selector) => selector(state));
    return combiner(...selectedValues);
  };
}

/**
 * Hook to select viewport-specific data
 * 
 * @example
 * const currentFrame = useViewportData(0, (runtime) => runtime.currentFrame);
 * const totalFrames = useViewportData(0, (runtime) => runtime.totalFrames);
 */
export function useViewportData<T>(
  viewportIndex: number,
  selector: (runtime: any) => T
): T | null {
  return useViewerSelector((ctx) => {
    const runtime = ctx.getViewportRuntimeState?.(viewportIndex);
    return runtime ? selector(runtime) : null;
  });
}

/**
 * Hook to check if viewport is loading
 */
export function useIsViewportLoading(viewportIndex: number): boolean {
  return useViewportData(viewportIndex, (runtime) => runtime?.isLoading ?? false);
}

/**
 * Hook to check if viewport is ready
 */
export function useIsViewportReady(viewportIndex: number): boolean {
  return useViewportData(viewportIndex, (runtime) => runtime?.viewportReady ?? false);
}

/**
 * Hook to get viewport series
 */
export function useViewportSeries(viewportIndex: number) {
  return useViewerSelector((ctx) => ctx.state.viewportSeries.get(viewportIndex));
}

export default useViewerSelector;

