/**
 * Debounce function type with cleanup method
 */
type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  clearDebounceTimeout: () => void;
};

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay (default: 300ms)
 * @param immediate - If true, trigger func on the leading edge instead of trailing
 * @returns A debounced version of the function with clearDebounceTimeout method
 *
 * @example
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 500);
 *
 * debouncedSearch('test'); // Will execute after 500ms
 * debouncedSearch('test2'); // Cancels previous, will execute after 500ms
 *
 * // Cleanup
 * debouncedSearch.clearDebounceTimeout();
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  immediate: boolean = false
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const callback = function (this: any, ...args: Parameters<T>): void {
    const context = this;

    const later = (): void => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };

    const callNow = immediate && !timeout;

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };

  callback.clearDebounceTimeout = (): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return callback as DebouncedFunction<T>;
}

export default debounce;