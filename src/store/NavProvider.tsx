import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type TabId = 'profile' | 'ranking' | 'challenges' | 'community' | 'friends';

export type Route =
  | { name: 'checkin' }
  | { name: 'clubs' }
  | { name: 'club'; clubId: string }
  | { name: 'teams' }
  | { name: 'debrief'; checkInId: string }
  | { name: 'user'; userId: string }
  | { name: 'share' }
  | { name: 'journal' }
  | { name: 'xpguide' }
  | { name: 'achievements' };

interface NavValue {
  tab: TabId;
  stack: Route[];
  setTab: (t: TabId) => void;
  push: (r: Route) => void;
  pop: () => void;
  reset: () => void;
}

const NavContext = createContext<NavValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [tab, setTabState] = useState<TabId>('profile');
  const [stack, setStack] = useState<Route[]>([]);

  const setTab = useCallback((t: TabId) => {
    setStack([]);
    setTabState(t);
  }, []);
  const push = useCallback((r: Route) => setStack((s) => [...s, r]), []);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const reset = useCallback(() => {
    setStack([]);
    setTabState('profile');
  }, []);

  const value = useMemo(() => ({ tab, stack, setTab, push, pop, reset }), [tab, stack, setTab, push, pop, reset]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav doit être utilisé dans <NavProvider>');
  return ctx;
}
