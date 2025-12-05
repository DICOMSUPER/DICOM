/**
 * Performance optimization utilities
 * Includes debouncing, throttling, and performance monitoring
 */

// Throttle function - executes at most once per specified interval
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function (this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func.apply(this, args);
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Debounce function - delays execution until after wait time has elapsed since last call
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null;

  return function (this: any, ...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };

    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(this, args);
  };
}

// Request Animation Frame throttle for smoother visual updates
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          func.apply(this, lastArgs);
        }
        rafId = null;
        lastArgs = null;
      });
    }
  };
}

// Memoization utility for expensive computations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  }) as T;
}

// Performance marker utility
export class PerformanceMarker {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number[]> = new Map();

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();

    if (!start || !end) {
      console.warn(`Performance marks not found: ${startMark}, ${endMark}`);
      return 0;
    }

    const duration = end - start;
    
    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name)!.push(duration);

    return duration;
  }

  getAverage(measureName: string): number {
    const measures = this.measures.get(measureName);
    if (!measures || measures.length === 0) return 0;

    const sum = measures.reduce((a, b) => a + b, 0);
    return sum / measures.length;
  }

  getStats(measureName: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    total: number;
  } | null {
    const measures = this.measures.get(measureName);
    if (!measures || measures.length === 0) return null;

    return {
      count: measures.length,
      average: measures.reduce((a, b) => a + b, 0) / measures.length,
      min: Math.min(...measures),
      max: Math.max(...measures),
      total: measures.reduce((a, b) => a + b, 0),
    };
  }

  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }

  clearMeasures(measureName: string): void {
    this.measures.delete(measureName);
  }
}

// Singleton instance
export const performanceMarker = new PerformanceMarker();

// Batch updates utility for React state
export function batchUpdates<T>(
  updates: Array<() => void>,
  delay = 0
): void {
  if (delay === 0) {
    // Use requestAnimationFrame for immediate batching
    requestAnimationFrame(() => {
      updates.forEach((update) => update());
    });
  } else {
    // Debounce multiple updates
    setTimeout(() => {
      updates.forEach((update) => update());
    }, delay);
  }
}

// Memory-efficient event listener manager
export class EventListenerManager {
  private listeners: Map<
    EventTarget,
    Map<string, Set<EventListenerOrEventListenerObject>>
  > = new Map();

  addEventListener(
    target: EventTarget,
    eventName: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions
  ): void {
    target.addEventListener(eventName, handler, options);

    if (!this.listeners.has(target)) {
      this.listeners.set(target, new Map());
    }

    const targetListeners = this.listeners.get(target)!;
    if (!targetListeners.has(eventName)) {
      targetListeners.set(eventName, new Set());
    }

    targetListeners.get(eventName)!.add(handler);
  }

  removeEventListener(
    target: EventTarget,
    eventName: string,
    handler: EventListenerOrEventListenerObject
  ): void {
    target.removeEventListener(eventName, handler);

    const targetListeners = this.listeners.get(target);
    if (targetListeners) {
      const eventListeners = targetListeners.get(eventName);
      if (eventListeners) {
        eventListeners.delete(handler);
        
        if (eventListeners.size === 0) {
          targetListeners.delete(eventName);
        }
      }

      if (targetListeners.size === 0) {
        this.listeners.delete(target);
      }
    }
  }

  removeAllListeners(target?: EventTarget): void {
    if (target) {
      const targetListeners = this.listeners.get(target);
      if (targetListeners) {
        targetListeners.forEach((handlers, eventName) => {
          handlers.forEach((handler) => {
            target.removeEventListener(eventName, handler);
          });
        });
        this.listeners.delete(target);
      }
    } else {
      // Remove all listeners from all targets
      this.listeners.forEach((targetListeners, target) => {
        targetListeners.forEach((handlers, eventName) => {
          handlers.forEach((handler) => {
            target.removeEventListener(eventName, handler);
          });
        });
      });
      this.listeners.clear();
    }
  }

  getListenerCount(target?: EventTarget): number {
    if (target) {
      const targetListeners = this.listeners.get(target);
      if (!targetListeners) return 0;

      let count = 0;
      targetListeners.forEach((handlers) => {
        count += handlers.size;
      });
      return count;
    } else {
      let total = 0;
      this.listeners.forEach((targetListeners) => {
        targetListeners.forEach((handlers) => {
          total += handlers.size;
        });
      });
      return total;
    }
  }
}

