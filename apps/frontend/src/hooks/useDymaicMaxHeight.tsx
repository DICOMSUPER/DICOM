import { useRef, useState, useEffect, RefObject } from 'react';


export function useDynamicMaxHeight(
  data: any,
  buffer = 20,
  minHeight = 100
): {
  ref: RefObject<HTMLDivElement | null>;
  maxHeight: string;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<string>('100vh'); // Start with full viewport height initially

  useEffect(() => {
    const calculateMaxHeight = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - buffer;
        setMaxHeight(`${Math.max(minHeight, availableHeight)}px`);
      }
    };

    // Calculate initially
    // Use requestAnimationFrame to ensure layout is stable after initial render
    const rafId = requestAnimationFrame(calculateMaxHeight);

    // Recalculate on window resize
    window.addEventListener('resize', calculateMaxHeight);

    // Cleanup listener and requestAnimationFrame on component unmount
    return () => {
      window.removeEventListener('resize', calculateMaxHeight);
      cancelAnimationFrame(rafId);
    };
    // Dependencies: buffer, minHeight, and data.
  }, [data, buffer, minHeight]);

  return { ref, maxHeight };
}

export default useDynamicMaxHeight;
