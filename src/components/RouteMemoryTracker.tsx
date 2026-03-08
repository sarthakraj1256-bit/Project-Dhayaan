import { useRouteMemory } from '@/hooks/useRouteMemory';

/** Invisible component that persists the current route + scroll to localStorage. */
export const RouteMemoryTracker = () => {
  useRouteMemory();
  return null;
};
