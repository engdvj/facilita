// Performance utilities for the frontend application

// Debounce function for search and input handlers
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

// Throttle function for scroll and resize handlers
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization utility
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

// Virtual scrolling utilities
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function calculateVirtualItems(
  scrollTop: number,
  itemCount: number,
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  
  const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(itemCount - 1, startIndex + visibleItemsCount + overscan * 2);
  
  return {
    startIndex,
    endIndex,
    visibleItems: endIndex - startIndex + 1,
    offsetY: startIndex * itemHeight
  };
}

// Image lazy loading utility
export class ImageLazyLoader {
  private observer: IntersectionObserver;
  private images: Set<HTMLImageElement> = new Set();
  
  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
          }
        });
      },
      { rootMargin: '50px' }
    );
  }
  
  observe(img: HTMLImageElement) {
    this.images.add(img);
    this.observer.observe(img);
  }
  
  unobserve(img: HTMLImageElement) {
    this.images.delete(img);
    this.observer.unobserve(img);
  }
  
  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
      this.observer.unobserve(img);
      this.images.delete(img);
    }
  }
  
  destroy() {
    this.observer.disconnect();
    this.images.clear();
  }
}

// Bundle analyzer helper (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV !== 'development') return;
  
  // @ts-ignore
  if (window.__webpack_require__) {
    console.group('Bundle Analysis');
    // @ts-ignore
    const modules = Object.keys(window.__webpack_require__.cache || {});
    console.log(`Total modules loaded: ${modules.length}`);
    
    const modulesBySize = modules
      .map(id => {
        // @ts-ignore
        const module = window.__webpack_require__.cache[id];
        return {
          id,
          size: JSON.stringify(module).length
        };
      })
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
    
    console.table(modulesBySize);
    console.groupEnd();
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  
  mark(name: string) {
    this.metrics.set(`${name}-start`, performance.now());
  }
  
  measure(name: string) {
    const start = this.metrics.get(`${name}-start`);
    if (start) {
      const duration = performance.now() - start;
      this.metrics.set(`${name}-duration`, duration);
      return duration;
    }
    return 0;
  }
  
  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }
  
  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
  
  clear() {
    this.metrics.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();