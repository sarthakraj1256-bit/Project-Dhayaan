import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook for lazy loading elements when they enter the viewport
 */
export const useLazyLoad = <T extends HTMLElement = HTMLDivElement>(
  options: UseLazyLoadOptions = {}
) => {
  const { threshold = 0.1, rootMargin = '100px', triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || (triggerOnce && hasLoaded)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, hasLoaded]);

  return { ref: elementRef, isVisible, hasLoaded };
};

/**
 * Hook for paginated/infinite scroll loading
 */
export const useInfiniteScroll = <T>(
  allItems: T[],
  initialCount: number = 6,
  incrementCount: number = 6
) => {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < allItems.length) {
          setVisibleCount(prev => Math.min(prev + incrementCount, allItems.length));
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [visibleCount, allItems.length, incrementCount]);

  const visibleItems = allItems.slice(0, visibleCount);
  const hasMore = visibleCount < allItems.length;

  const reset = useCallback(() => {
    setVisibleCount(initialCount);
  }, [initialCount]);

  return {
    visibleItems,
    hasMore,
    loadMoreRef,
    reset,
    totalCount: allItems.length,
    visibleCount,
  };
};

/**
 * Hook for deferring expensive computations until after initial render
 */
export const useDeferredValue = <T>(value: T, delay: number = 100): T => {
  const [deferredValue, setDeferredValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDeferredValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return deferredValue;
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload multiple images in parallel
 */
export const preloadImages = async (srcs: string[]): Promise<void[]> => {
  return Promise.all(srcs.map(preloadImage));
};