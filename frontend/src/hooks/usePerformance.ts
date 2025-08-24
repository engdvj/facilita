import { useEffect, useRef, useCallback, useMemo } from 'react';
import { debounce, throttle, performanceMonitor } from '../utils/performance';

// Hook for debounced values/functions
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for debounced callbacks
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  );

  return debouncedCallback;
}

// Hook for throttled callbacks
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const throttledCallback = useMemo(
    () => throttle(callback, limit),
    [callback, limit]
  );

  return throttledCallback;
}

// Hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const mountTime = useRef<number>();
  const renderCount = useRef<number>(0);
  
  useEffect(() => {
    // Mark component mount
    mountTime.current = performance.now();
    performanceMonitor.mark(`${componentName}-mount`);
    
    return () => {
      // Measure component lifetime
      if (mountTime.current) {
        const lifetime = performance.now() - mountTime.current;
        performanceMonitor.measure(`${componentName}-lifetime`);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`${componentName} lifetime: ${lifetime.toFixed(2)}ms`);
          console.log(`${componentName} render count: ${renderCount.current}`);
        }
      }
    };
  }, [componentName]);
  
  // Track renders
  useEffect(() => {
    renderCount.current += 1;
  });
  
  const markStart = useCallback((operation: string) => {
    performanceMonitor.mark(`${componentName}-${operation}`);
  }, [componentName]);
  
  const measureEnd = useCallback((operation: string) => {
    return performanceMonitor.measure(`${componentName}-${operation}`);
  }, [componentName]);
  
  return { markStart, measureEnd, renderCount: renderCount.current };
}

// Hook for intersection observer (lazy loading)
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    observer.observe(ref.current);
    
    return () => observer.disconnect();
  }, [ref, options]);
  
  return isIntersecting;
}

// Hook for virtual scrolling
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const virtualItems = useMemo(() => {
    const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(items.length - 1, startIndex + visibleItemsCount + overscan * 2);
    
    const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      offsetY: (startIndex + index) * itemHeight
    }));
    
    return {
      visibleItems,
      totalHeight: items.length * itemHeight,
      startIndex,
      endIndex
    };
  }, [items, itemHeight, containerHeight, overscan, scrollTop]);
  
  const onScroll = useThrottledCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, 16); // ~60fps
  
  return {
    ...virtualItems,
    onScroll
  };
}

// Hook for memory usage monitoring (development only)
export function useMemoryMonitor(interval: number = 5000) {
  const [memoryInfo, setMemoryInfo] = React.useState<any>(null);
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const updateMemoryInfo = () => {
      // @ts-ignore
      if (performance.memory) {
        // @ts-ignore
        setMemoryInfo({
          // @ts-ignore
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          // @ts-ignore
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          // @ts-ignore
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        });
      }
    };
    
    updateMemoryInfo();
    const intervalId = setInterval(updateMemoryInfo, interval);
    
    return () => clearInterval(intervalId);
  }, [interval]);
  
  return memoryInfo;
}

// Re-export useState for convenience
import React from 'react';